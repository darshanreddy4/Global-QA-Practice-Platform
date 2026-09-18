import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/apiClient";
import { Button, Badge } from "../../design-system";
import { useToast } from "../../design-system/Toast";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ButtonEngineProps = { variant: string };

/** ONE engine component for the entire "Buttons & Click Behaviors" category. */
export function ButtonEngine({ variant }: ButtonEngineProps) {
  switch (variant) {
    case "trigger-toast":
      return <TriggerToast />;
    case "enabled-after-input":
      return <EnabledAfterInput />;
    case "api-triggered":
      return <ApiTriggered />;
    case "confirm-destructive":
      return <ConfirmDestructive />;
    case "prevent-double-submit":
      return <PreventDoubleSubmit />;
    case "full-page-blocking-loader":
      return <FullPageBlockingLoader />;
    default:
      return <p className="text-sm text-red-600">Unknown button variant: {variant}</p>;
  }
}

function TriggerToast() {
  const { setField } = useChallengeField();
  const { pushToast } = useToast();
  return (
    <Button
      data-testid="send-reminder-btn"
      onClick={() => {
        pushToast("success", "Reminder sent");
        setField("lastToast", "Reminder sent");
      }}
    >
      Send Reminder
    </Button>
  );
}

function EnabledAfterInput() {
  const { setField } = useChallengeField();
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const numeric = Number(amount);

  return (
    <div className="flex max-w-sm items-end gap-3">
      <div className="flex-1">
        <label htmlFor="expenseAmount" className="mb-1.5 block text-sm font-medium text-slate-700">Amount (USD)</label>
        <input
          id="expenseAmount"
          data-testid="expense-amount-input"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            setAmount(v);
            setField("amount", Number(v) || 0);
          }}
        />
      </div>
      <Button
        data-testid="submit-expense-btn"
        disabled={!(numeric > 0)}
        onClick={() => setSubmitted(true)}
      >
        Submit Expense
      </Button>
      {submitted && <Badge tone="success">Submitted</Badge>}
    </div>
  );
}

function ApiTriggered() {
  const { setField } = useChallengeField();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const process = async () => {
    setLoading(true);
    setStatus("");
    const result = await apiRequest<{ status: "approved" | "declined" }>("/lab/process-payment", { method: "POST" });
    const label = result.status === "approved" ? "Payment Approved" : "Payment Declined";
    setStatus(label);
    setField("paymentStatus", label);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Button data-testid="process-payment-btn" loading={loading} onClick={process}>
        {loading ? "Processing\u2026" : "Process Payment"}
      </Button>
      {status && <Badge tone={status === "Payment Approved" ? "success" : "danger"}>{status}</Badge>}
    </div>
  );
}

function ConfirmDestructive() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { pushToast } = useToast();

  if (deleted) return <Badge tone="neutral">Project deleted</Badge>;

  return (
    <div>
      <Button variant="danger" data-testid="delete-project-btn" onClick={() => setOpen(true)}>
        Delete Project
      </Button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="confirm-delete-modal"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Delete "Atlas Migration" project?</h3>
            <p className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" variant="secondary" data-testid="cancel-delete" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                variant="danger"
                data-testid="confirm-delete"
                onClick={() => {
                  setDeleted(true);
                  setField("projectDeleted", true);
                  setOpen(false);
                  pushToast("success", "Project deleted");
                }}
              >
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreventDoubleSubmit() {
  const { setField } = useChallengeField();
  const [inFlight, setInFlight] = useState(false);
  const [orders, setOrders] = useState(0);

  const place = async () => {
    if (inFlight) return;
    setInFlight(true);
    await apiRequest("/lab/create-order", { method: "POST", headers: { "Idempotency-Key": "demo-key" } });
    setOrders((prev) => {
      const next = prev + 1;
      setField("ordersCreated", next);
      return next;
    });
    setInFlight(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Button data-testid="place-order-btn" disabled={inFlight} onClick={place}>
        {inFlight ? "Placing\u2026" : "Place Order"}
      </Button>
      <span className="text-sm text-slate-500" data-testid="orders-created-count">Orders created: {orders}</span>
    </div>
  );
}

function FullPageBlockingLoader() {
  const { setField } = useChallengeField();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [decoyClicks, setDecoyClicks] = useState(0);

  useEffect(() => {
    setField("decoyClicksDuringLoad", 0);
  }, [setField]);

  const submit = () => {
    setLoading(true);
    setSubmitted(false);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setField("reportSubmitted", true);
    }, 2500);
  };

  return (
    <div className="space-y-3">
      <Button data-testid="submit-report-btn" onClick={submit}>Submit Large Report</Button>
      <Button
        variant="secondary"
        data-testid="decoy-btn"
        onClick={() => {
          const next = decoyClicks + 1;
          setDecoyClicks(next);
          setField("decoyClicksDuringLoad", loading ? next : 0);
        }}
      >
        Decoy Button
      </Button>
      {submitted && <Badge tone="success">Report submitted</Badge>}
      <p className="text-xs text-slate-400" data-testid="decoy-click-count">Decoy clicks registered: {decoyClicks}</p>

      {loading && (
        <div
          data-testid="full-page-loader"
          role="alert"
          aria-busy="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">{"Submitting report\u2026 please wait"}</p>
        </div>
      )}
    </div>
  );
}
