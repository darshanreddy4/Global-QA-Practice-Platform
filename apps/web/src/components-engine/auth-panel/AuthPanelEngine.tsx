import React, { useState } from "react";
import { apiRequest, ApiError, rawApiRequest } from "../../services/apiClient";
import { Badge, Button, ErrorState, FormField, inputBaseClasses } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type AuthPanelEngineProps = { variant: string };

/** ONE engine component for the "Authentication" category. */
export function AuthPanelEngine({ variant }: AuthPanelEngineProps) {
  switch (variant) {
    case "login-basic":
      return <LoginBasic />;
    case "account-lockout":
      return <AccountLockout />;
    case "mfa-otp-login":
      return <MfaOtpLogin />;
    case "role-based-access":
      return <RoleBasedAccess />;
    case "session-timeout":
      return <SessionTimeout />;
    default:
      return <p className="text-sm text-red-600">Unknown auth-panel variant: {variant}</p>;
  }
}

function LoginBasic() {
  const { setField } = useChallengeField();
  const [email, setEmail] = useState("learner@qaplatform.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setField("authStatus", "authenticated");
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Login failed");
      setField("authStatus", "rejected");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-sm space-y-3" onSubmit={submit}>
      <FormField label="Email" htmlFor="loginEmail" required>
        <input id="loginEmail" data-testid="login-email" className={inputBaseClasses} value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <FormField label="Password" htmlFor="loginPassword" required error={error}>
        <input id="loginPassword" type="password" data-testid="login-password" className={inputBaseClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>
      <Button type="submit" loading={loading} data-testid="login-submit">Sign in</Button>
    </form>
  );
}

function AccountLockout() {
  const { setField } = useChallengeField();
  const [password, setPassword] = useState("wrong-password");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState<string>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "locked_demo@qaplatform.dev", password }),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 423) {
        setLocked(true);
        setMessage(err.detail);
        setField("lockoutState", "locked");
        return;
      }
      setAttempts((a) => a + 1);
      setMessage(err instanceof ApiError ? err.detail : "Login failed");
    }
  };

  return (
    <form className="max-w-sm space-y-3" onSubmit={submit}>
      <p className="text-sm text-slate-500">Attempts so far: <strong data-testid="attempt-count">{attempts}</strong></p>
      <FormField label="Password" htmlFor="lockoutPassword">
        <input id="lockoutPassword" type="password" data-testid="lockout-password" className={inputBaseClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>
      <Button type="submit" disabled={locked} data-testid="lockout-submit">Sign in</Button>
      {message && <ErrorState title={locked ? "Account locked" : "Invalid credentials"} detail={message} />}
    </form>
  );
}

function MfaOtpLogin() {
  const { setField } = useChallengeField();
  const [step, setStep] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("Learner123!");
  const [serverOtp, setServerOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState<string>();

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const result = await apiRequest<{ mfaRequired: boolean; otp: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "mfa_demo@qaplatform.dev", password }),
    });
    if (result.mfaRequired) {
      setServerOtp(result.otp);
      setStep("otp");
      setField("mfaStep", "otp");
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ email: "mfa_demo@qaplatform.dev", otp: otpInput }),
      });
      setField("authStatus", "authenticated");
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Verification failed");
    }
  };

  if (step === "password") {
    return (
      <form className="max-w-sm space-y-3" onSubmit={submitPassword}>
        <FormField label="Password" htmlFor="mfaPassword" required>
          <input id="mfaPassword" type="password" data-testid="mfa-password" className={inputBaseClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <Button type="submit" data-testid="mfa-password-submit">Sign in</Button>
      </form>
    );
  }

  return (
    <form className="max-w-sm space-y-3" onSubmit={submitOtp}>
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700" data-testid="test-only-otp">
        Test-only field (stands in for SMS/email): code is <strong>{serverOtp}</strong>
      </p>
      <FormField label="Verification code" htmlFor="otpInput" required error={error}>
        <input id="otpInput" data-testid="otp-input" className={inputBaseClasses} value={otpInput} onChange={(e) => setOtpInput(e.target.value)} maxLength={6} />
      </FormField>
      <Button type="submit" data-testid="otp-submit">Verify</Button>
    </form>
  );
}

function RoleBasedAccess() {
  const { setField } = useChallengeField();
  const [email, setEmail] = useState("learner@qaplatform.dev");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<number>();
  const [signedInAs, setSignedInAs] = useState<string>();

  const passwords: Record<string, string> = {
    "learner@qaplatform.dev": "Learner123!",
    "manager@qaplatform.dev": "Manager123!",
    "admin@qaplatform.dev": "Admin123!",
  };

  const signIn = async () => {
    await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password: passwords[email] }) });
    setSignedInAs(email);
  };

  const requestReport = async () => {
    const res = await rawApiRequest("/lab/admin-report");
    if (res.networkFailure) return;
    setStatus(res.status);
    setField("adminReportStatus", res.status);
  };

  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Sign in as" htmlFor="rbacEmail">
        <select id="rbacEmail" data-testid="rbac-role-select" className={inputBaseClasses} value={email} onChange={(e) => setEmail(e.target.value)}>
          <option value="learner@qaplatform.dev">Learner</option>
          <option value="manager@qaplatform.dev">Manager</option>
          <option value="admin@qaplatform.dev">Admin</option>
        </select>
      </FormField>
      <Button size="sm" data-testid="rbac-signin-btn" onClick={signIn}>Sign in</Button>
      {signedInAs && <p className="text-xs text-slate-500">Signed in as: {signedInAs}</p>}
      <Button size="sm" variant="secondary" data-testid="request-admin-report-btn" onClick={requestReport}>Request admin report</Button>
      {status !== undefined && (
        <Badge tone={status === 200 ? "success" : "danger"}>Status: {status}</Badge>
      )}
    </div>
  );
}

function SessionTimeout() {
  const { setField } = useChallengeField();
  const [meStatus, setMeStatus] = useState<number>();

  const signIn = async () => {
    await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: "learner@qaplatform.dev", password: "Learner123!" }) });
    const res = await rawApiRequest("/auth/me");
    if (!res.networkFailure) setMeStatus(res.status);
  };

  const simulateExpiry = async () => {
    document.cookie = "qa_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const res = await rawApiRequest("/auth/me");
    if (!res.networkFailure) {
      setMeStatus(res.status);
      setField("sessionStatusAfterExpiry", res.status);
    }
  };

  return (
    <div className="max-w-sm space-y-3">
      <Button size="sm" data-testid="session-signin-btn" onClick={signIn}>Sign in</Button>
      <Button size="sm" variant="secondary" data-testid="simulate-expiry-btn" onClick={simulateExpiry}>Simulate session expiry</Button>
      {meStatus !== undefined && (
        <Badge tone={meStatus === 200 ? "success" : "danger"}>/auth/me status: {meStatus}</Badge>
      )}
    </div>
  );
}
