import { Router } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { resetProductsForSession } from "./api-lab.router";
import { resetLanguageForSession } from "../lmt/lmt.router";

export const labRouter = Router();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isRandomMode = (req: any) => req.query.mode === "random";

const DEPARTMENTS = ["Engineering", "Finance", "Human Resources", "Sales", "Customer Support", "Legal"];
const TAKEN_USERNAMES = new Set(["admin", "qa_lead"]);

labRouter.get("/departments", async (req, res, next) => {
  await delay(800);
  if (isRandomMode(req) && Math.random() < 0.15) {
    return next(new HttpError(503, "Service Unavailable", "Department directory service is temporarily unavailable."));
  }
  res.json({ data: DEPARTMENTS, meta: { requestId: res.locals.requestId } });
});

labRouter.get("/username-availability", async (req, res, next) => {
  const username = String(req.query.username ?? "");
  if (!username) return next(new HttpError(400, "Bad Request", "Query param 'username' is required."));
  await delay(400);
  res.json({ data: { username, available: !TAKEN_USERNAMES.has(username.toLowerCase()) } });
});

const ASSIGNEES = ["Priya Sharma", "Wei Chen", "Amara Okafor", "Diego Fernandez"];

/** Backs DROPDOWN-010: deterministic ~2.5s load delay, triggered on dropdown open (not on page load). */
labRouter.get("/assignees", async (req, res) => {
  await delay(2500);
  res.json({ data: ASSIGNEES });
});

labRouter.post("/process-payment", async (req, res) => {
  await delay(1200);
  const declined = isRandomMode(req) && Math.random() < 0.2;
  res.json({ data: { status: declined ? "declined" : "approved" } });
});

let orderCounter = 0;
const seenIdempotencyKeys = new Set<string>();
labRouter.post("/create-order", async (req, res) => {
  await delay(600);
  const idempotencyKey = req.header("Idempotency-Key");
  if (idempotencyKey && seenIdempotencyKeys.has(idempotencyKey)) {
    return res.json({ data: { orderId: `ORD-${orderCounter}`, deduplicated: true } });
  }
  orderCounter += 1;
  if (idempotencyKey) seenIdempotencyKeys.add(idempotencyKey);
  res.json({ data: { orderId: `ORD-${orderCounter}` } });
});

const failure500CallLog = new Map<string, number>();
const failure429CallLog = new Map<string, number[]>();

labRouter.get("/failure/:code", async (req, res, next) => {
  const code = req.params.code;
  const sessionKey = req.header("X-Session-Key") ?? "anonymous";

  if (code === "404") {
    return next(new HttpError(404, "Not Found", "The requested report does not exist."));
  }

  if (code === "500") {
    const calls = failure500CallLog.get(sessionKey) ?? 0;
    failure500CallLog.set(sessionKey, calls + 1);
    if (calls === 0) {
      return next(new HttpError(500, "Internal Server Error", "Report generation failed unexpectedly. Please retry."));
    }
    return res.json({ data: { report: "Q3-Sales-Report.pdf" } });
  }

  if (code === "429") {
    const now = Date.now();
    const history = failure429CallLog.get(sessionKey) ?? [];
    const recent = history.filter((t) => now - t < 10_000);
    recent.push(now);
    failure429CallLog.set(sessionKey, recent);
    if (recent.length > 3) {
      res.setHeader("Retry-After", "10");
      return next(new HttpError(429, "Too Many Requests", "Rate limit exceeded. Retry after 10 seconds."));
    }
    return res.json({ data: { ok: true, callsInWindow: recent.length } });
  }

  return next(new HttpError(400, "Bad Request", `Unsupported failure code '${code}'.`));
});

/** Backs AJAX-001: waits exactly `ms` (capped at 10s) then responds. */
labRouter.get("/delay/:ms", async (req, res, next) => {
  const ms = Math.min(10_000, Math.max(0, Number(req.params.ms) || 0));
  await delay(ms);
  res.json({ data: { loadedLabel: `Loaded after ${ms}ms` } });
});

/** Backs AJAX-002: fails the first 2 calls per session, succeeds on the 3rd. */
const flakyCallLog = new Map<string, number>();
labRouter.get("/flaky", async (req, res, next) => {
  const sessionKey = req.header("X-Session-Key") ?? "anonymous";
  const calls = (flakyCallLog.get(sessionKey) ?? 0) + 1;
  flakyCallLog.set(sessionKey, calls);
  await delay(400);
  if (calls < 3) {
    return next(new HttpError(500, "Internal Server Error", "Transient upstream failure, please retry."));
  }
  res.json({ data: { attemptCount: calls, accountBalance: "$12,450.00" } });
});

/** Backs AJAX-003: always returns a successful, empty list. */
labRouter.get("/empty-response", async (req, res) => {
  await delay(300);
  res.json({ data: [] });
});

/** Backs WAIT-002: two chained calls, step2 requires a token minted by step1. */
const validChainTokens = new Set<string>();
labRouter.get("/chained/step1", async (req, res) => {
  await delay(500);
  const token = `tok_${Math.random().toString(36).slice(2, 10)}`;
  validChainTokens.add(token);
  res.json({ data: { token } });
});

labRouter.get("/chained/step2", async (req, res, next) => {
  const token = String(req.query.token ?? "");
  if (!token || !validChainTokens.has(token)) {
    return next(new HttpError(400, "Bad Request", "A valid token from /chained/step1 is required."));
  }
  await delay(500);
  res.json({ data: { eta: "3 business days" } });
});

/**
 * Resets every session-scoped stateful counter (flaky/failure/rate-limit) for
 * the caller's X-Session-Key so a "Reset" click gives a truly clean attempt,
 * matching the "make all challenges resettable" requirement.
 */
labRouter.post("/reset", (req, res) => {
  const sessionKey = req.header("X-Session-Key") ?? "anonymous";
  flakyCallLog.delete(sessionKey);
  failure500CallLog.delete(sessionKey);
  failure429CallLog.delete(sessionKey);
  resetProductsForSession(sessionKey);
  resetLanguageForSession(sessionKey);
  res.json({ data: { ok: true } });
});

