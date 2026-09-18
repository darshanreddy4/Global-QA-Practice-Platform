import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, ErrorState, FormField, inputBaseClasses } from "../design-system";
import { useAuthStore } from "../store/authStore";
import { ApiError } from "../services/apiClient";

export function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("learner@qaplatform.dev");
  const [password, setPassword] = useState("Learner123!");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await login(identifier, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader title="Sign in" subtitle="Global QA Practice Platform" />
        <CardBody>
          <form className="space-y-3" onSubmit={submit}>
            <FormField label="Email or phone number" htmlFor="platformIdentifier" required>
              <input id="platformIdentifier" data-testid="login-identifier" className={inputBaseClasses} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </FormField>
            <FormField label="Password" htmlFor="platformPassword" required>
              <input id="platformPassword" type="password" data-testid="login-password-field" className={inputBaseClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            {error && <ErrorState detail={error} />}
            <Button type="submit" loading={loading} data-testid="platform-login-submit" className="w-full">Sign in</Button>
            <p className="text-xs text-slate-400">Seeded: learner@qaplatform.dev / Learner123!</p>
            <p className="text-center text-sm text-slate-500">
              New here? <Link to="/signup" className="text-brand-600 hover:underline">Create a real account</Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
