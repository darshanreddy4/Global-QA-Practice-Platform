import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ScrollAreaEngineProps = { variant: string };

/** ONE engine component for the "Scroll Behaviors" category. */
export function ScrollAreaEngine({ variant }: ScrollAreaEngineProps) {
  switch (variant) {
    case "scroll-to-top-threshold":
      return <ScrollToTopThreshold />;
    case "nested-scroll-containers":
      return <NestedScrollContainers />;
    case "sticky-header":
      return <StickyHeader />;
    default:
      return <p className="text-sm text-red-600">Unknown scroll-area variant: {variant}</p>;
  }
}

function ScrollToTopThreshold() {
  const { setField } = useChallengeField();
  const ref = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);

  const onScroll = () => {
    const top = ref.current?.scrollTop ?? 0;
    setShowButton(top > 400);
    setField("scrollTop", top);
  };

  return (
    <div className="relative">
      <div ref={ref} data-testid="report-scroll-area" onScroll={onScroll} className="h-64 w-full overflow-y-auto rounded-md border border-slate-200 p-4">
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i} className="py-2 text-sm text-slate-600">Report line {i + 1}</p>
        ))}
      </div>
      {showButton && (
        <Button
          size="sm"
          data-testid="back-to-top-btn"
          className="absolute bottom-3 right-3"
          onClick={() => {
            ref.current?.scrollTo({ top: 0, behavior: "smooth" });
            setField("scrollTop", 0);
          }}
        >
          Back to top
        </Button>
      )}
    </div>
  );
}

function NestedScrollContainers() {
  const { setField } = useChallengeField();
  const innerRef = useRef<HTMLDivElement>(null);

  const onInnerScroll = () => {
    const el = innerRef.current;
    if (!el) return;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setField("innerPanelScrolledToEnd", atEnd);
  };

  return (
    <div className="h-40 overflow-y-auto rounded-md border border-slate-200 p-4" data-testid="outer-page-area">
      <p className="text-sm text-slate-600">Outer page content above the panel.</p>
      <div ref={innerRef} onScroll={onInnerScroll} data-testid="activity-log-panel" className="mt-3 h-32 overflow-y-auto rounded-md border border-slate-300 bg-slate-50 p-2">
        {Array.from({ length: 25 }, (_, i) => (
          <p key={i} className="py-1 text-xs text-slate-500">Activity entry {i + 1}</p>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">More outer page content below the panel.</p>
    </div>
  );
}

function StickyHeader() {
  const { setField } = useChallengeField();

  useEffect(() => setField("headerStuckAtTop", true), [setField]);

  return (
    <div className="h-56 overflow-y-auto rounded-md border border-slate-200" data-testid="sticky-table-container">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-slate-100" data-testid="sticky-header-row">
          <tr>
            <th className="px-3 py-2">Order</th>
            <th className="px-3 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 30 }, (_, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-3 py-1.5 font-mono">ORD-{1000 + i}</td>
              <td className="px-3 py-1.5">${((i + 1) * 12.5).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
