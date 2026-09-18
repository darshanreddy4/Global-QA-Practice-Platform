import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, ErrorState, FormField, inputBaseClasses } from "../design-system";
import { useAuthStore } from "../store/authStore";
import { ApiError } from "../services/apiClient";

type IdentifierKind = "email" | "phone";

export function SignupPage() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [identifierKind, setIdentifierKind] = useState<IdentifierKind>("email");
  const [identifierValue, setIdentifierValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(fullName, { [identifierKind]: identifierValue }, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader title="Create your account" subtitle="Sign up with an email or phone number" />
        <CardBody>
          <form className="space-y-3" onSubmit={submit}>
            <FormField label="Full name" htmlFor="signupFullName" required>
              <input id="signupFullName" data-testid="signup-fullname" className={inputBaseClasses} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </FormField>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-slate-700">Sign up with</legend>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="radio" name="identifierKind" data-testid="signup-kind-email" checked={identifierKind === "email"} onChange={() => { setIdentifierKind("email"); setIdentifierValue(""); }} />
                  Email
                </label>
                <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="radio" name="identifierKind" data-testid="signup-kind-phone" checked={identifierKind === "phone"} onChange={() => { setIdentifierKind("phone"); setIdentifierValue(""); }} />
                  Phone number
                </label>
              </div>
            </fieldset>

            <FormField label={identifierKind === "email" ? "Email address" : "Phone number"} htmlFor="signupIdentifier" required hint={identifierKind === "phone" ? "Include country code, e.g. +91XXXXXXXXXX" : undefined}>
              <input
                id="signupIdentifier"
                data-testid="signup-identifier"
                type={identifierKind === "email" ? "email" : "tel"}
                className={inputBaseClasses}
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
              />
            </FormField>

            <FormField label="Password" htmlFor="signupPassword" required hint="At least 8 characters">
              <input id="signupPassword" type="password" data-testid="signup-password" className={inputBaseClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <FormField label="Confirm password" htmlFor="signupConfirmPassword" required>
              <input id="signupConfirmPassword" type="password" data-testid="signup-confirm-password" className={inputBaseClasses} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </FormField>

            {error && <ErrorState detail={error} />}
            <Button type="submit" loading={loading} data-testid="signup-submit" className="w-full">Create account</Button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
