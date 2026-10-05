import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, FormField, inputBaseClasses } from "../../design-system";

const STORAGE_SUBMITTED_KEY = "qa-link-lab-feedback-submitted";
const STORAGE_TEXT_KEY = "qa-link-lab-feedback-text";

/** Real, same-tab page navigation for LINK-002 — clicking the link on the challenge
 * replaces the whole route; submitting this form navigates back to where you came from. */
export function LinkLabFeedbackFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/";
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Feedback is required.");
      return;
    }
    sessionStorage.setItem(STORAGE_SUBMITTED_KEY, "1");
    sessionStorage.setItem(STORAGE_TEXT_KEY, feedback.trim());
    navigate(returnTo);
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader title="Share Feedback" subtitle="This is a genuinely different page/route, not a modal." />
        <CardBody>
          <form className="space-y-3" onSubmit={submit}>
            <FormField label="Your feedback" htmlFor="feedback-text" required error={error}>
              <input
                id="feedback-text"
                data-testid="feedback-text-input"
                className={inputBaseClasses}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  setError("");
                }}
              />
            </FormField>
            <Button type="submit" data-testid="feedback-submit-btn" className="w-full">
              Submit &amp; Return
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
