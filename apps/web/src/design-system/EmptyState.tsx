import React from "react";
import { Button } from "./Button";

/** Reusable empty state — used for "no data yet" AND "category not built yet" (roadmap-aware). */
export function EmptyState({
  icon = "\u{1F4C2}",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <span aria-hidden="true" className="text-3xl">{icon}</span>
      <h3 className="mt-3 text-sm font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && (
        <Button className="mt-4" size="sm" variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
