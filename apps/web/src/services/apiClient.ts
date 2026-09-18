export type ApiProblem = {
  type: string;
  title: string;
  status: number;
  detail: string;
  requestId: string;
};

export class ApiError extends Error {
  status: number;
  detail: string;
  requestId: string;
  constructor(problem: ApiProblem) {
    super(problem.title);
    this.status = problem.status;
    this.detail = problem.detail;
    this.requestId = problem.requestId;
  }
}

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

/**
 * Resolves a path under the API base to an ABSOLUTE url, correct whether the API is
 * same-origin (BASE_URL="/api") or hosted on a different domain
 * (BASE_URL="https://your-api.onrender.com/api"). Needed anywhere a full URL must be
 * displayed/navigated-to directly (e.g. the automation session-link builder) rather
 * than passed to `fetch`, which resolves relative URLs against the page origin itself.
 */
export function apiUrl(path: string): string {
  return /^https?:\/\//.test(BASE_URL) ? `${BASE_URL}${path}` : `${window.location.origin}${BASE_URL}${path}`;
}

/**
 * Stable per-browser-tab identifier sent as X-Session-Key so stateful lab
 * endpoints (flaky/failure counters) are deterministic per attempt instead of
 * being shared across every visitor under one "anonymous" bucket.
 */
function getSessionKey(): string {
  const storageKey = "qa-lab-session-key";
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
  }
  return key;
}

/** Thin fetch wrapper: JSON in/out, credentials for session cookie, typed errors. */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Key": getSessionKey(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      body ?? { type: "about:blank", title: "Request failed", status: res.status, detail: res.statusText, requestId: "unknown" }
    );
  }

  return (body?.data ?? body) as T;
}

export type RawApiResult =
  | { ok: true; networkFailure: false; status: number; headers: Headers; body: unknown }
  | { ok: false; networkFailure: true }
  | { ok: false; networkFailure: false; status: number; headers: Headers; body: unknown };

/**
 * Low-level request helper for the API Lab playground: never throws, and
 * surfaces the raw status/headers so learners can inspect them directly
 * (rather than the throw-on-error ergonomics of `apiRequest`).
 */
export async function rawApiRequest(path: string, init?: RequestInit): Promise<RawApiResult> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Key": getSessionKey(),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    return { ok: res.ok, networkFailure: false, status: res.status, headers: res.headers, body };
  } catch {
    return { ok: false, networkFailure: true };
  }
}
