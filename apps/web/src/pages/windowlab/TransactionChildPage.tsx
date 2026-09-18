import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Card, CardBody } from "../../design-system";

/** Standalone child-tab page for WINDOW-001 (spec §27 parent-child transaction scenario). */
export function TransactionChildPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const [approved, setApproved] = useState(false);

  const approve = () => {
    const channel = new BroadcastChannel("qa-transaction-channel");
    channel.postMessage({ type: "approved", id });
    channel.close();
    setApproved(true);
  };

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <Card>
        <CardBody className="space-y-3 text-center">
          <h1 className="text-base font-semibold text-slate-900">Transaction Processing</h1>
          <p className="text-xs text-slate-400">Transaction ID: {id}</p>
          {!approved ? (
            <Button data-testid="approve-transaction-btn" onClick={approve}>Approve</Button>
          ) : (
            <>
              <p className="text-sm text-emerald-700">Transaction completed.</p>
              <Button size="sm" variant="secondary" data-testid="close-tab-btn" onClick={() => window.close()}>
                Close this tab
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
