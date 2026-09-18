import React from "react";
import type { ChallengeDefinition } from "@qaplatform/shared";
import { Badge, DifficultyBadge } from "../../design-system";

/**
 * Renders the guidance block that must appear ABOVE every practice component
 * (spec §58). Content is entirely data-driven from ChallengeDefinition.guidance
 * so it works identically for hardcoded, DB-backed, or AI-generated challenges.
 */
export function GuidancePanel({ challenge }: { challenge: ChallengeDefinition }) {
  const { guidance } = challenge;
  return (
    <section
      aria-label="Challenge guidance"
      className="rounded-lg border border-brand-100 bg-brand-50/40 px-5 py-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-brand-700">{challenge.id}</span>
        <DifficultyBadge difficulty={challenge.difficulty} />
        {challenge.environment
          .filter((e) => e !== "none")
          .map((e) => (
            <Badge key={e} tone="info">{e}</Badge>
          ))}
        {challenge.accessibility === "intentional-defect" && (
          <Badge tone="danger">Intentional accessibility defect</Badge>
        )}
        <span className="ml-auto text-xs text-slate-500">~{challenge.estimatedMinutes} min</span>
      </div>

      <h2 className="mt-2 text-base font-semibold text-slate-900">{challenge.title}</h2>

      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <GuidanceItem term="What it does" detail={guidance.whatItDoes} />
        <GuidanceItem term="Data needed" detail={guidance.dataNeeded} />
        <GuidanceItem term="Action to perform" detail={guidance.action} />
        <GuidanceItem term="Expected result" detail={guidance.expectedResult} />
      </dl>

      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <GuidanceList term="What to validate" items={guidance.validationPoints} />
        <GuidanceList term="Automation concepts" items={guidance.automationConcepts} tone="info" />
      </div>

      {guidance.edgeCases && guidance.edgeCases.length > 0 && (
        <GuidanceList term="Edge cases" items={guidance.edgeCases} tone="warning" className="mt-3" />
      )}
    </section>
  );
}

function GuidanceItem({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{term}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{detail}</dd>
    </div>
  );
}

function GuidanceList({
  term,
  items,
  tone = "neutral",
  className = "",
}: {
  term: string;
  items: string[];
  tone?: "neutral" | "info" | "warning";
  className?: string;
}) {
  const toneClass =
    tone === "info" ? "text-brand-700" : tone === "warning" ? "text-amber-700" : "text-slate-800";
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{term}</p>
      <ul className={`mt-0.5 list-inside list-disc space-y-0.5 text-sm ${toneClass}`}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
