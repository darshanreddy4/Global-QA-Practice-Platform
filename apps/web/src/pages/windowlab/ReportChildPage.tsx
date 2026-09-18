import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Card, CardBody } from "../../design-system";

/** Standalone child-tab page for WINDOW-002 (multi-tab tracker scenario). */
export function ReportChildPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("qa-report-tabs-channel");
    channel.postMessage({ type: "register", id });
    return () => {
      channel.postMessage({ type: "unregister", id });
      channel.close();
    };
  }, [id]);

  const closeTab = () => {
    const channel = new BroadcastChannel("qa-report-tabs-channel");
    channel.postMessage({ type: "unregister", id });
    channel.close();
    setClosed(true);
    window.close();
  };

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <Card>
        <CardBody className="space-y-3 text-center">
          <h1 className="text-base font-semibold text-slate-900">Report Tab</h1>
          <p className="text-xs text-slate-400">Tab ID: {id}</p>
          <Button size="sm" variant="secondary" data-testid="close-report-tab-btn" disabled={closed} onClick={closeTab}>
            Close tab
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
