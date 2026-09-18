import React, { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, FormField, inputBaseClasses } from "../design-system";
import { apiRequest, apiUrl, ApiError } from "../services/apiClient";
import type { EnterpriseUser } from "@qaplatform/shared";

/**
 * Self-service documentation + live demo of the "log in via API, then jump straight
 * into an authenticated UI action via a session link" automation pattern. See
 * apps/api/src/modules/auth/auth.contract.md for the full backend contract.
 */
export function AutomationAccessPage() {
  const [identifier, setIdentifier] = useState("learner@qaplatform.dev");
  const [password, setPassword] = useState("Learner123!");
  const [target, setTarget] = useState("/challenge/DROPDOWN-005");
  const [token, setToken] = useState<string>();
  const [user, setUser] = useState<EnterpriseUser>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const loginViaApi = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await apiRequest<{ user: EnterpriseUser; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Login failed");
      setToken(undefined);
    } finally {
      setLoading(false);
    }
  };

  const sessionLink = token
    ? `${apiUrl("/auth/session-link")}?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(target)}`
    : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Automation Access</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log in once via the API, capture the token, and jump any browser straight into an authenticated
          page &mdash; no UI login form required. This is the real pattern your test suite should use.
        </p>
      </div>

      <Card>
        <CardHeader title="1. Log in via API" subtitle="POST /api/auth/login" />
        <CardBody className="space-y-3">
          <FormField label="Email or phone number" htmlFor="autoIdentifier">
            <input id="autoIdentifier" data-testid="automation-identifier" className={inputBaseClasses} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </FormField>
          <FormField label="Password" htmlFor="autoPassword">
            <input id="autoPassword" type="password" data-testid="automation-password" className={inputBaseClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          {error && <ErrorState detail={error} />}
          <Button size="sm" loading={loading} data-testid="automation-login-btn" onClick={loginViaApi}>Sign in via API</Button>
          {user && (
            <div className="flex items-center gap-2">
              <Badge tone="success">Token captured</Badge>
              <span className="text-sm text-slate-600">Signed in as {user.fullName}</span>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="2. Build a session link" subtitle="GET /api/auth/session-link?token=...&redirect=..." />
        <CardBody className="space-y-3">
          <FormField label="Target page to jump to" htmlFor="autoTarget" hint="Any in-app path, e.g. /challenge/DROPDOWN-005">
            <input id="autoTarget" data-testid="automation-target" className={inputBaseClasses} value={target} onChange={(e) => setTarget(e.target.value)} />
          </FormField>
          {sessionLink ? (
            <>
              <pre data-testid="session-link-output" className="overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                {sessionLink}
              </pre>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  data-testid="copy-session-link-btn"
                  onClick={() => navigator.clipboard.writeText(sessionLink)}
                >
                  Copy link
                </Button>
                <Button size="sm" data-testid="open-session-link-btn" onClick={() => { window.location.href = sessionLink; }}>
                  Open this link now
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Sign in above first to generate a session link.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="3. Same flow from a script" subtitle="What your automation code actually does" />
        <CardBody>
          <pre className="overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
{`# 1. Log in and capture the token
curl -s -X POST ${apiUrl("/auth/login")} \\
  -H 'Content-Type: application/json' \\
  -d '{"identifier":"learner@qaplatform.dev","password":"Learner123!"}'
# -> { "data": { "user": {...}, "token": "eyJhbGciOi..." } }

# 2. Open the session link in your test browser (Playwright example)
await page.goto(
  \`${apiUrl("/auth/session-link")}?token=\${token}&redirect=/challenge/DROPDOWN-005\`
);
# The browser is now authenticated and landed directly on the target challenge.`}
          </pre>
        </CardBody>
      </Card>
    </div>
  );
}
