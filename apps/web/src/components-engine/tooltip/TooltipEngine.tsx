import React, { useEffect, useRef, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type TooltipEngineProps = { variant: string };

/** ONE engine component for the "Tooltips & Hover Elements" category. */
export function TooltipEngine({ variant }: TooltipEngineProps) {
  switch (variant) {
    case "hover-delayed":
      return <HoverDelayedTooltip />;
    case "rich-html-with-button":
      return <RichHtmlTooltip />;
    default:
      return <p className="text-sm text-red-600">Unknown tooltip variant: {variant}</p>;
  }
}

function HoverDelayedTooltip() {
  const { setField } = useChallengeField();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number>();

  const onEnter = () => {
    timerRef.current = window.setTimeout(() => {
      setVisible(true);
      setField("tooltipVisible", true);
    }, 400);
  };

  const onLeave = () => {
    window.clearTimeout(timerRef.current);
    setVisible(false);
    setField("tooltipVisible", false);
  };

  return (
    <div className="relative inline-block">
      <span className="text-sm text-slate-700">Net Revenue </span>
      <span
        tabIndex={0}
        data-testid="info-icon"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        className="cursor-help rounded-full bg-slate-200 px-1.5 text-xs text-slate-600"
        aria-describedby="net-revenue-tooltip"
      >
        {"\u24d8"}
      </span>
      {visible && (
        <div id="net-revenue-tooltip" role="tooltip" data-testid="net-revenue-tooltip" className="absolute left-0 top-6 z-10 w-56 rounded-md bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
          Net Revenue = Gross Revenue minus refunds, discounts, and taxes.
        </div>
      )}
    </div>
  );
}

function RichHtmlTooltip() {
  const { setField } = useChallengeField();
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number>();

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setVisible(true);
  };
  const scheduleHide = () => {
    closeTimer.current = window.setTimeout(() => setVisible(false), 150);
  };

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={scheduleHide}>
      <div data-testid="user-avatar" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
        AR
      </div>
      {visible && (
        <div
          data-testid="rich-tooltip"
          role="tooltip"
          className="absolute left-0 top-12 z-10 w-56 rounded-md border border-slate-200 bg-white p-3 text-sm shadow-lg"
        >
          <p className="font-medium text-slate-900">Ananya Rao</p>
          <p className="text-xs text-slate-500">Senior QA Engineer</p>
          <button
            data-testid="message-btn"
            onClick={() => setField("composeOpen", true)}
            className="mt-2 rounded-md bg-brand-600 px-2 py-1 text-xs text-white"
          >
            Message
          </button>
        </div>
      )}
    </div>
  );
}
