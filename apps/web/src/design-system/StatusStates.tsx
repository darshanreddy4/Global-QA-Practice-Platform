import React from "react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  detail,
  requestId,
  onRetry,
}: {
  title?: string;
  detail?: string;
  requestId?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-sm font-semibold text-red-800">{title}</p>
      {detail && <p className="mt-1 text-sm text-red-700">{detail}</p>}
      {requestId && <p className="mt-1 text-xs text-red-500">Request ID: {requestId}</p>}
      {onRetry && (
        <Button className="mt-3" size="sm" variant="danger" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading\u2026" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
      />
      <span role="status">{label}</span>
    </div>
  );
}

export function SkeletonRow() {
  return <div className="h-4 w-full animate-pulse rounded bg-slate-200" />;
}
