import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_SAME_SITE, COOKIE_SECURE, JWT_SECRET, WEB_ORIGIN } from "../../config/env";
import { HttpError } from "../../middleware/errorHandler";

export const authRouter = Router();

type Role = "admin" | "manager" | "learner";
type SeedUser = { id: string; fullName: string; email: string; password: string; role: Role; mfaEnabled?: boolean; hasLifetimeAccess?: boolean };
type RegisteredUser = { id: string; fullName: string; email?: string; phone?: string; passwordHash: string; role: Role; hasLifetimeAccess: boolean };
type AppUser = SeedUser | RegisteredUser;

const USERS: SeedUser[] = [
  { id: "u1", fullName: "Learner Demo", email: "learner@qaplatform.dev", password: "Learner123!", role: "learner", hasLifetimeAccess: false },
  { id: "u2", fullName: "Admin Demo", email: "admin@qaplatform.dev", password: "Admin123!", role: "admin", hasLifetimeAccess: true },
  { id: "u3", fullName: "Lockout Demo", email: "locked_demo@qaplatform.dev", password: "Learner123!", role: "learner", hasLifetimeAccess: false },
  { id: "u4", fullName: "Manager Demo", email: "manager@qaplatform.dev", password: "Manager123!", role: "manager", hasLifetimeAccess: false },
  { id: "u5", fullName: "MFA Demo", email: "mfa_demo@qaplatform.dev", password: "Learner123!", role: "learner", mfaEnabled: true, hasLifetimeAccess: false },
];

/** Real self-registered users (in-memory for v1 — migrates to the `users` table in ARCHITECTURE.md §4/§62). */
const registeredUsers: RegisteredUser[] = [];
let registeredUserCounter = 0;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function findUserByIdentifier(identifier: string): AppUser | undefined {
  const key = normalizeIdentifier(identifier);
  const seeded = USERS.find((u) => u.email.toLowerCase() === key);
  if (seeded) return seeded;
  return registeredUsers.find(
    (u) => (u.email && u.email.toLowerCase() === key) || (u.phone && u.phone.replace(/\s/g, "") === identifier.trim())
  );
}

function findUserById(id: string): AppUser | undefined {
  return USERS.find((u) => u.id === id) ?? registeredUsers.find((u) => u.id === id);
}

function verifyPassword(user: AppUser, candidate: string): boolean {
  if ("passwordHash" in user) return bcrypt.compareSync(candidate, user.passwordHash);
  return user.password === candidate;
}

function toPublicUser(user: AppUser) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: "email" in user ? user.email : undefined,
    phone: "phone" in user ? user.phone : undefined,
    role: user.role,
    hasLifetimeAccess: user.hasLifetimeAccess ?? false,
  };
}

const failedAttempts = new Map<string, { count: number; lockedUntil?: number }>();

/**
 * Real-world QA challenge: automated tests can't read a text message. Many
 * teams solve this by exposing the OTP through a test-only response field or
 * header in non-production environments. This map + the `otp` field returned
 * below mirror that convention for practice purposes only.
 */
const pendingOtps = new Map<string, { otp: string; expiresAt: number }>();

/** Signs a session JWT. Returned in the response body too, so automation scripts can capture it directly. */
function signSessionToken(user: AppUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
}

function issueSession(res: import("express").Response, token: string) {
  res.cookie("qa_session", token, {
    httpOnly: true,
    sameSite: COOKIE_SAME_SITE,
    secure: COOKIE_SECURE,
    maxAge: 60 * 60 * 1000,
  });
}

/**
 * Self-service registration with EITHER an email or a phone number (spec: "sign in as a real user
 * with email or with their phone number"). Passwords are bcrypt-hashed — unlike the seeded demo
 * accounts (kept as plaintext deliberately, only for the fixed practice-login challenges).
 */
authRouter.post("/register", (req, res, next) => {
  const { fullName, email, phone, password } = req.body ?? {};

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return next(new HttpError(400, "Bad Request", "fullName is required."));
  }
  if (!email && !phone) {
    return next(new HttpError(400, "Bad Request", "Provide an email or a phone number."));
  }
  if (email && !EMAIL_RE.test(email)) {
    return next(new HttpError(400, "Bad Request", "Enter a valid email address."));
  }
  if (phone && !PHONE_RE.test(String(phone).replace(/\s/g, ""))) {
    return next(new HttpError(400, "Bad Request", "Enter a valid phone number (7-15 digits, optional +country code)."));
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return next(new HttpError(400, "Bad Request", "Password must be at least 8 characters."));
  }
  if ((email && findUserByIdentifier(email)) || (phone && findUserByIdentifier(phone))) {
    return next(new HttpError(409, "Conflict", "An account with this email or phone number already exists."));
  }

  const user: RegisteredUser = {
    id: `ru${++registeredUserCounter}`,
    fullName: fullName.trim(),
    email: email ? String(email).trim() : undefined,
    phone: phone ? String(phone).trim() : undefined,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "learner",
    hasLifetimeAccess: false,
  };
  registeredUsers.push(user);

  const token = signSessionToken(user);
  issueSession(res, token);
  res.status(201).json({ data: { user: toPublicUser(user), token } });
});

authRouter.post("/login", (req, res, next) => {
  const identifier = req.body?.identifier ?? req.body?.email;
  const { password } = req.body ?? {};
  if (!identifier || !password) {
    return next(new HttpError(400, "Bad Request", "identifier (email or phone) and password are required."));
  }

  const key = normalizeIdentifier(String(identifier));
  const record = failedAttempts.get(key);
  if (record?.lockedUntil && record.lockedUntil > Date.now()) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    res.status(423).json({
      type: "about:blank#423",
      title: "Locked",
      status: 423,
      detail: `Account locked. Try again in ${retryAfterSeconds} seconds.`,
      retryAfterSeconds,
      requestId: res.locals.requestId,
    });
    return;
  }

  const user = findUserByIdentifier(String(identifier));
  if (!user || !verifyPassword(user, password)) {
    const nextCount = (record?.count ?? 0) + 1;
    const isLockoutDemo = key === "locked_demo@qaplatform.dev";
    if (isLockoutDemo && nextCount >= 3) {
      failedAttempts.set(key, { count: nextCount, lockedUntil: Date.now() + 60_000 });
    } else {
      failedAttempts.set(key, { count: nextCount });
    }
    return next(new HttpError(401, "Invalid email/phone or password", "Check your credentials and try again."));
  }

  failedAttempts.delete(key);

  if ("mfaEnabled" in user && user.mfaEnabled) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    pendingOtps.set(key, { otp, expiresAt: Date.now() + 60_000 });
    res.json({ data: { mfaRequired: true, email: user.email, otp } });
    return;
  }

  const token = signSessionToken(user);
  issueSession(res, token);
  res.json({ data: { user: toPublicUser(user), token } });
});

authRouter.post("/mfa/verify", (req, res, next) => {
  const { email, otp } = req.body ?? {};
  const key = normalizeIdentifier(String(email ?? ""));
  const pending = pendingOtps.get(key);
  if (!pending || pending.expiresAt < Date.now() || pending.otp !== String(otp)) {
    return next(new HttpError(401, "Invalid or expired code", "The verification code is incorrect or has expired."));
  }
  pendingOtps.delete(key);
  const user = findUserByIdentifier(key)!;
  const token = signSessionToken(user);
  issueSession(res, token);
  res.json({ data: { user: toPublicUser(user), token } });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("qa_session", { httpOnly: true, sameSite: COOKIE_SAME_SITE, secure: COOKIE_SECURE });
  res.json({ data: { ok: true } });
});

authRouter.get("/me", (req, res, next) => {
  const token = req.cookies?.qa_session;
  if (!token) return next(new HttpError(401, "Unauthorized", "No active session."));
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = findUserById(payload.sub);
    if (!user) return next(new HttpError(401, "Unauthorized", "Session user no longer exists."));
    res.json({ data: { user: toPublicUser(user) } });
  } catch {
    next(new HttpError(401, "Unauthorized", "Session invalid or expired."));
  }
});

/**
 * Automation session bootstrap: lets a test script log in via the API (POST /login), grab the
 * `token` from the response body, then open this URL directly in the browser under test to become
 * authenticated and land straight on the target page — no UI login form needed. See auth.contract.md
 * for the full pattern and its security caveats (practice-platform only, not a production pattern
 * as-is).
 */
authRouter.get("/session-link", (req, res, next) => {
  const token = String(req.query.token ?? "");
  const redirectParam = String(req.query.redirect ?? "/");

  if (!token) return next(new HttpError(400, "Bad Request", "Query param 'token' is required."));

  let payload: { sub: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return next(new HttpError(401, "Unauthorized", "Session token is invalid or expired."));
  }

  const user = findUserById(payload.sub);
  if (!user) return next(new HttpError(401, "Unauthorized", "Session user no longer exists."));

  // Only allow same-app relative redirects — never an absolute/protocol-relative URL (open-redirect guard).
  const safeRedirect = redirectParam.startsWith("/") && !redirectParam.startsWith("//") && !redirectParam.includes("://")
    ? redirectParam
    : "/";

  issueSession(res, token);
  res.redirect(302, `${WEB_ORIGIN}${safeRedirect}`);
});

/** Resolves the authenticated user (or undefined) from the qa_session cookie. Used by role-gated lab routes. */
export function getSessionUser(req: import("express").Request): AppUser | undefined {
  const token = req.cookies?.qa_session;
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return findUserById(payload.sub);
  } catch {
    return undefined;
  }
}

/** Express middleware factory enforcing an exact role match (401 if unauthenticated, 403 if wrong role). */
export function requireRole(role: Role) {
  return (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    const user = getSessionUser(req);
    if (!user) return next(new HttpError(401, "Unauthorized", "Sign in required."));
    if (user.role !== role) return next(new HttpError(403, "Forbidden", `Requires '${role}' role; current role is '${user.role}'.`));
    next();
  };
}
