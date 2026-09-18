import React, { useEffect, useRef, useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type WindowLabEngineProps = { variant: string };

/** ONE engine component for the "Browser Windows & Tabs" category. */
export function WindowLabEngine({ variant }: WindowLabEngineProps) {
  switch (variant) {
    case "parent-child-transaction":
      return <ParentChildTransaction />;
    case "multi-tab-tracker":
      return <MultiTabTracker />;
    default:
      return <p className="text-sm text-red-600">Unknown window-lab variant: {variant}</p>;
  }
}

function ParentChildTransaction() {
  const { setField } = useChallengeField();
  const [status, setStatus] = useState<"PENDING" | "COMPLETED">("PENDING");
  const transactionId = useRef(`TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`).current;

  useEffect(() => {
    const channel = new BroadcastChannel("qa-transaction-channel");
    channel.onmessage = (e) => {
      if (e.data?.type === "approved" && e.data?.id === transactionId) {
        setStatus("COMPLETED");
        setField("transactionStatus", "COMPLETED");
      }
    };
    return () => channel.close();
  }, [transactionId, setField]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Transaction ID: {transactionId}</p>
      <Button
        size="sm"
        data-testid="process-transaction-btn"
        onClick={() => window.open(`/window-lab/transaction?id=${transactionId}`, "_blank")}
      >
        Process Transaction
      </Button>
      <p className="text-sm text-slate-700">
        Transaction Status:{" "}
        <Badge tone={status === "COMPLETED" ? "success" : "warning"}>{status}</Badge>
      </p>
    </div>
  );
}

function MultiTabTracker() {
  const { setField } = useChallengeField();
  const [openTabs, setOpenTabs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = new BroadcastChannel("qa-report-tabs-channel");
    channel.onmessage = (e) => {
      setOpenTabs((prev) => {
        const next = new Set(prev);
        if (e.data?.type === "register") next.add(e.data.id);
        if (e.data?.type === "unregister") next.delete(e.data.id);
        setField("openTabCount", next.size);
        return next;
      });
    };
    return () => channel.close();
  }, [setField]);

  return (
    <div className="space-y-3">
      <Button
        size="sm"
        data-testid="open-report-tab-btn"
        onClick={() => window.open(`/window-lab/report?id=${Math.random().toString(36).slice(2, 8)}`, "_blank")}
      >
        Open Report Tab
      </Button>
      <p className="text-sm text-slate-700">
        Open report tabs: <Badge tone="info">{openTabs.size}</Badge>
      </p>
    </div>
  );
}
