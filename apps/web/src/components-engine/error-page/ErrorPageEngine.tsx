import React, { useState } from "react";
import { apiRequest, ApiError } from "../../services/apiClient";
import { Button, Badge } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ErrorPageEngineProps = { variant: string };

/** ONE engine component for the "Error Handling" category. */
export function ErrorPageEngine({ variant }: ErrorPageEngineProps) {
  switch (variant) {
    case "http-404":
      return <Http404 />;
    case "http-500":
      return <Http500 />;
    case "http-429":
      return <Http429 />;
    default:
      return <p className="text-sm text-red-600">Unknown error-page variant: {variant}</p>;
  }
}

function ErrorShell({
  code,
  title,
  requestId,
  children,
}: {
  code: number;
  title: string;
  requestId?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <p className="text-5xl font-bold text-slate-300">{code}</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">Timestamp: {new Date().toLocaleString()}</p>
      {requestId && <p className="text-xs text-slate-400">Request ID: {requestId}</p>}
      <div className="mt-4 flex justify-center gap-2">{children}</div>
    </div>
  );
}

function Http404() {
  const { setField } = useChallengeField();
  const [triggered, setTriggered] = useState(false);
  const [requestId, setRequestId] = useState<string>();

  const open = async () => {
    try {
      await apiRequest("/lab/failure/404");
    } catch (e) {
      if (e instanceof ApiError) {
        setRequestId(e.requestId);
        setField("httpStatus", e.status);
      }
    }
    setTriggered(true);
  };

  if (!triggered) {
    return <Button data-testid="open-invoice-999999" onClick={open}>Open Invoice INV-999999</Button>;
  }

  return (
    <ErrorShell code={404} title="Invoice not found" requestId={requestId}>
      <Button size="sm" variant="secondary" data-testid="back-to-invoices" onClick={() => setTriggered(false)}>
        Back to Invoices
      </Button>
    </ErrorShell>
  );
}

function Http500() {
  const { setField } = useChallengeField();
  const [phase, setPhase] = useState<"idle" | "failed" | "succeeded">("idle");
  const [requestId, setRequestId] = useState<string>();

  const call = async () => {
    try {
      await apiRequest("/lab/failure/500");
      setPhase("succeeded");
      setField("httpStatus", 200);
    } catch (e) {
      if (e instanceof ApiError) setRequestId(e.requestId);
      setPhase("failed");
      setField("httpStatus", 500);
    }
  };

  if (phase === "idle") {
    return <Button data-testid="generate-report-btn" onClick={call}>Generate Report</Button>;
  }
  if (phase === "failed") {
    return (
      <ErrorShell code={500} title="Report generation failed unexpectedly" requestId={requestId}>
        <Button size="sm" variant="danger" data-testid="retry-report-btn" onClick={call}>Retry</Button>
      </ErrorShell>
    );
  }
  return <Badge tone="success">Report ready: Q3-Sales-Report.pdf</Badge>;
}

function Http429() {
  const { setField } = useChallengeField();
  const [calls, setCalls] = useState(0);
  const [limited, setLimited] = useState(false);

  const call = async () => {
    try {
      await apiRequest("/lab/failure/429");
      setCalls((c) => c + 1);
      setField("httpStatus", 200);
    } catch (e) {
      setLimited(true);
      if (e instanceof ApiError) setField("httpStatus", e.status);
    }
  };

  return (
    <div className="space-y-2">
      <Button data-testid="rapid-action-btn" onClick={call}>Trigger Action ({calls} calls so far)</Button>
      {limited && (
        <ErrorShell code={429} title="Too many requests — retry in 10s">
          <span className="text-sm text-slate-500">Wait for the countdown, then try again.</span>
        </ErrorShell>
      )}
    </div>
  );
}
