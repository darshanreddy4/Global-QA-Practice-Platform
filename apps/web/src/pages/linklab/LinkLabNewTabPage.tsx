import React, { useState } from "react";
import { Button, Card, CardBody } from "../../design-system";

/** Standalone child-tab page for LINK-001 — a genuinely different page/URL opened
 * via a real target="_blank" link, reporting back to the opener tab over BroadcastChannel. */
export function LinkLabNewTabPage() {
  const [confirmed, setConfirmed] = useState(false);

  const confirm = () => {
    const channel = new BroadcastChannel("qa-link-lab-channel");
    channel.postMessage({ type: "new-tab-confirmed", path: window.location.pathname });
    channel.close();
    setConfirmed(true);
  };

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <Card>
        <CardBody className="space-y-3 text-center">
          <h1 className="text-base font-semibold text-slate-900" data-testid="new-tab-heading">
            You&apos;re on a brand-new tab!
          </h1>
          <p className="text-xs text-slate-500">
            This is a completely different page with its own URL ({window.location.pathname}), not the
            challenge page you clicked the link from.
          </p>
          {!confirmed ? (
            <Button data-testid="new-tab-confirm-btn" onClick={confirm}>
              Confirm I&apos;m on the new tab
            </Button>
          ) : (
            <>
              <p className="text-sm text-emerald-700">Confirmed! You can close this tab now.</p>
              <Button size="sm" variant="secondary" data-testid="close-new-tab-btn" onClick={() => window.close()}>
                Close this tab
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
