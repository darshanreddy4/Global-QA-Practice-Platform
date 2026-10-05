import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type LinkEngineProps = { variant: string };

/** ONE engine component for the "Links & Navigation" category. */
export function LinkEngine({ variant }: LinkEngineProps) {
  switch (variant) {
    case "link-opens-new-tab":
      return <LinkOpensNewTab />;
    case "link-navigates-to-form-and-back":
      return <LinkNavigatesToFormAndBack />;
    case "link-opens-blocking-popup":
      return <LinkOpensBlockingPopup />;
    default:
      return <p className="text-sm text-red-600">Unknown link variant: {variant}</p>;
  }
}

// ---------- Scenario 1: link opens a genuine new tab, reports back ----------

function LinkOpensNewTab() {
  const { setField } = useChallengeField();
  const [confirmed, setConfirmed] = useState(false);
  const [newTabPath, setNewTabPath] = useState("");

  useEffect(() => {
    const channel = new BroadcastChannel("qa-link-lab-channel");
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "new-tab-confirmed") {
        setConfirmed(true);
        setNewTabPath(e.data.path);
        setField("newTabConfirmed", true);
        setField("newTabPath", e.data.path);
      }
    };
    channel.addEventListener("message", onMessage);
    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
    };
  }, [setField]);

  return (
    <div className="space-y-2">
      <a
        href="/link-lab/new-tab"
        target="_blank"
        rel="noopener"
        data-testid="open-new-tab-link"
        className="text-sm text-brand-600 hover:underline"
      >
        Open Support Article (new tab)
      </a>
      <p className="text-xs text-slate-500">
        target=&quot;_blank&quot; rel=&quot;noopener&quot; {"\u2014"} opens a genuinely separate browser tab/page, not a simulation.
      </p>
      {confirmed && (
        <p className="text-sm text-emerald-700">
          New tab confirmed at <code>{newTabPath}</code>.
        </p>
      )}
    </div>
  );
}

// ---------- Scenario 2: link navigates same-tab to a form page, submitting returns here ----------

function LinkNavigatesToFormAndBack() {
  const { setField } = useChallengeField();
  const [submittedText, setSubmittedText] = useState("");

  useEffect(() => {
    const submitted = sessionStorage.getItem("qa-link-lab-feedback-submitted");
    const text = sessionStorage.getItem("qa-link-lab-feedback-text");
    if (submitted && text) {
      setSubmittedText(text);
      setField("feedbackSubmitted", true);
      setField("feedbackText", text);
      sessionStorage.removeItem("qa-link-lab-feedback-submitted");
      sessionStorage.removeItem("qa-link-lab-feedback-text");
    }
  }, [setField]);

  return (
    <div className="space-y-2">
      <Link
        to={`/link-lab/feedback-form?returnTo=${encodeURIComponent("/challenge/LINK-002")}`}
        data-testid="open-feedback-form-link"
        className="text-sm text-brand-600 hover:underline"
      >
        Share Feedback
      </Link>
      <p className="text-xs text-slate-500">
        A real page navigation (full route change, same tab) {"\u2014"} not a modal. Submitting the form
        there routes back here automatically.
      </p>
      {submittedText && (
        <p className="text-sm text-emerald-700" data-testid="feedback-returned-message">
          Welcome back! You submitted: &quot;{submittedText}&quot;
        </p>
      )}
    </div>
  );
}

// ---------- Scenario 3: link opens a blocking popup, background is inert until closed ----------

function LinkOpensBlockingPopup() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [backgroundClicks, setBackgroundClicks] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitted(true);
    setOpen(false);
    setField("popupFormSubmitted", true);
    setField("popupName", name.trim());
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        data-testid="background-counter-btn"
        onClick={() => setBackgroundClicks((c) => c + 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
      >
        Background action (clicks: {backgroundClicks})
      </button>
      <div>
        <a
          href="#"
          data-testid="open-popup-link"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className="text-sm text-brand-600 hover:underline"
        >
          Terms &amp; Conditions
        </a>
      </div>
      {submitted && <p className="text-sm text-emerald-700">Thanks, {name}! Popup submitted.</p>}

      {open && (
        <div
          data-testid="popup-overlay"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40"
        >
          <div data-testid="popup-panel" className="w-80 rounded-lg bg-white p-5 shadow-xl">
            <p className="mb-2 text-sm font-semibold text-slate-800">You are awesome! {"\u{1F389}"}</p>
            <p className="mb-3 text-xs text-slate-500">
              This page behind the popup is inert {"\u2014"} the overlay blocks every click until you
              submit or close. Try clicking "Background action" right now; it won't register.
            </p>
            <label htmlFor="popup-name" className="mb-1 block text-xs font-medium text-slate-700">
              Your name
            </label>
            <input
              id="popup-name"
              data-testid="popup-name-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="mb-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
            {error && <p className="mb-2 text-xs font-medium text-red-600">{error}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="secondary" data-testid="popup-close-btn" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button size="sm" data-testid="popup-submit-btn" onClick={submit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

