import React from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  info: "bg-brand-100 text-brand-800",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

const difficultyTone: Record<string, BadgeTone> = {
  beginner: "success",
  easy: "success",
  medium: "info",
  hard: "warning",
  expert: "danger",
  nightmare: "danger",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <Badge tone={difficultyTone[difficulty] ?? "neutral"}>{difficulty}</Badge>;
}
