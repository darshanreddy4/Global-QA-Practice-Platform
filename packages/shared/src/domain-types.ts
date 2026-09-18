/** Shared domain types for realistic enterprise data used across challenges. */

export type GeoCountry = { code: string; name: string };
export type GeoState = { code: string; countryCode: string; name: string };
export type GeoCity = { id: string; stateCode: string; name: string };

export type ApiEnvelope<T> = {
  data: T;
  meta?: { requestId: string; durationMs: number };
};

export type ApiProblem = {
  type: string;
  title: string;
  status: number;
  detail: string;
  requestId: string;
};

export type EnterpriseUser = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: "admin" | "manager" | "learner";
  /** Future monetization hook: true once the user has made the one-time lifetime-access payment. */
  hasLifetimeAccess?: boolean;
};

/** Free-vs-paid extension point (spec: some categories free post-login, rest via one-time payment). */
export type AccessTier = "free" | "premium";
