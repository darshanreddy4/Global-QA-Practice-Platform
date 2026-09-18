import React, { useState } from "react";
import { Badge } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type LinkEngineProps = { variant: string };

/** ONE engine component for the "Links & Navigation" category. */
export function LinkEngine({ variant }: LinkEngineProps) {
  switch (variant) {
    case "same-vs-new-tab":
      return <SameVsNewTab />;
    case "js-triggered-navigation":
      return <JsTriggeredNavigation />;
    case "query-and-hash-links":
      return <QueryAndHashLinks />;
    default:
      return <p className="text-sm text-red-600">Unknown link variant: {variant}</p>;
  }
}

function SameVsNewTab() {
  const { setField } = useChallengeField();
  return (
    <div className="flex flex-col gap-2">
      <a href="/challenge/LINK-001" data-testid="same-tab-link" className="text-sm text-brand-600 hover:underline">
        View Invoice (same tab)
      </a>
      <a
        href="/challenge/LINK-001"
        target="_blank"
        rel="noopener"
        data-testid="new-tab-link"
        onClick={() => setField("newTabOpened", true)}
        className="text-sm text-brand-600 hover:underline"
      >
        View Invoice (new tab)
      </a>
    </div>
  );
}

function JsTriggeredNavigation() {
  const { setField } = useChallengeField();
  const [route, setRoute] = useState("");
  const go = () => {
    setRoute("reports");
    setField("route", "reports");
  };
  return (
    <div className="space-y-2">
      <span
        role="link"
        tabIndex={0}
        data-testid="js-nav-span"
        onClick={go}
        onKeyDown={(e) => e.key === "Enter" && go()}
        className="cursor-pointer text-sm text-brand-600 underline"
      >
        Go to Reports
      </span>
      {route && <Badge tone="info">Current route: /{route}</Badge>}
    </div>
  );
}

function QueryAndHashLinks() {
  const { setField } = useChallengeField();
  const [tab, setTab] = useState("");
  const [hash, setHash] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <a
        href="#"
        data-testid="query-param-link"
        onClick={(e) => {
          e.preventDefault();
          setTab("archived");
          setField("queryTab", "archived");
        }}
        className="text-sm text-brand-600 hover:underline"
      >
        Archived Orders
      </a>
      <a
        href="#section-notes"
        data-testid="hash-fragment-link"
        onClick={() => {
          setHash("section-notes");
          setField("hash", "section-notes");
        }}
        className="text-sm text-brand-600 hover:underline"
      >
        Jump to Notes
      </a>
      <p className="text-xs text-slate-500">
        URL state: ?tab={tab || "\u2014"} #{hash || "\u2014"}
      </p>
    </div>
  );
}
