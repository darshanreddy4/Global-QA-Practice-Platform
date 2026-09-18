export const PORT = Number(process.env.PORT ?? 4000);
export const NODE_ENV = process.env.NODE_ENV ?? "development";

const DEV_ONLY_JWT_SECRET = "dev-only-insecure-secret-change-me";
if (NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEV_ONLY_JWT_SECRET)) {
  throw new Error(
    "JWT_SECRET must be set to a real, private value in production (set it in your host's environment variables)."
  );
}
export const JWT_SECRET = process.env.JWT_SECRET ?? DEV_ONLY_JWT_SECRET;

// Comma-separated list of allowed origins, e.g. "https://app.example.com,https://example.com".
export const WEB_ORIGINS = (process.env.WEB_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
/** @deprecated use WEB_ORIGINS; kept for any existing single-origin call sites. */
export const WEB_ORIGIN = WEB_ORIGINS[0];

// Cookies must be `secure` (HTTPS-only) in production. If the frontend and API are
// deployed on DIFFERENT domains (e.g. frontend on Vercel, API on Render/Railway),
// set COOKIE_SAME_SITE=none so the browser will still send the session cookie
// cross-site — SameSite=None additionally requires Secure, which is why it's tied
// to production here rather than left independently configurable.
export const COOKIE_SECURE = NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
export const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE as "lax" | "none" | "strict" | undefined) ?? "lax";
