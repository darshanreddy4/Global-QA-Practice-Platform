import React, { useEffect, useState } from "react";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type AlertsEngineProps = { variant: string };

/** ONE engine component for the "Alerts & Notifications" category. */
export function AlertsEngine({ variant }: AlertsEngineProps) {
  switch (variant) {
    case "native-confirm":
      return <NativeConfirm />;
    case "stacked-toast-queue":
      return <StackedToastQueue />;
    default:
      return <p className="text-sm text-red-600">Unknown toast variant: {variant}</p>;
  }
}

function NativeConfirm() {
  const { setField } = useChallengeField();
  const [text, setText] = useState("");
  const [left, setLeft] = useState(false);

  const leave = () => {
    if (window.confirm("Discard changes?")) {
      setLeft(true);
      setField("leftPage", true);
    }
  };

  if (left) return <p className="text-sm text-emerald-700">Navigated away from the form.</p>;

  return (
    <div className="max-w-sm space-y-2">
      <textarea
        data-testid="draft-field"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Draft notes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button size="sm" variant="secondary" data-testid="leave-page-btn" onClick={leave}>
        Leave page
      </Button>
    </div>
  );
}

let toastSeq = 0;

function StackedToastQueue() {
  const { setField } = useChallengeField();
  const [toasts, setToasts] = useState<{ id: number }[]>([]);

  useEffect(() => setField("toastCount", toasts.length), [toasts, setField]);

  const runJob = () => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <div>
      <Button size="sm" data-testid="run-job-btn" onClick={runJob}>Run job</Button>
      <div className="mt-3 flex flex-col gap-2" data-testid="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} data-testid={`job-toast-${t.id}`} className="w-64 rounded-md bg-slate-800 px-3 py-2 text-sm text-white shadow">
            Job #{t.id} completed
          </div>
        ))}
      </div>
    </div>
  );
}
