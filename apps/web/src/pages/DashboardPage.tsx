import React from "react";
import { Link } from "react-router-dom";
import { categories, challengeRegistry, FrameworkTagEnum } from "@qaplatform/shared";
import { Card, CardBody, CardHeader, Badge } from "../design-system";
import { useProgressStore } from "../store/progressStore";

const FRAMEWORKS = FrameworkTagEnum.options;

export function DashboardPage() {
  const available = categories.filter((c) => c.status === "available" && c.parentId !== null);
  const planned = categories.filter((c) => c.status === "planned").length;
  const activeChallenges = challengeRegistry.filter((c) => c.isActive);
  const completedIds = useProgressStore((s) => s.completedIds);
  const completedCount = activeChallenges.filter((c) => completedIds.has(c.id)).length;
  const overallPct = activeChallenges.length ? Math.round((completedCount / activeChallenges.length) * 100) : 0;

  const nextChallenge = activeChallenges.find((c) => !completedIds.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Global Enterprise QA Lab &mdash; {challengeRegistry.length} challenges live across {available.length} categories,
          {" "}{planned} more on the roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat label="Challenges available" value={activeChallenges.length} />
        <Stat label="Completed" value={completedCount} />
        <Stat label="Overall progress" value={`${overallPct}%`} />
        <Stat label="Categories planned" value={planned} />
      </div>

      {nextChallenge && (
        <Card>
          <CardHeader title="Continue practicing" subtitle="Pick up where you left off" />
          <CardBody>
            <Link
              to={`/challenge/${nextChallenge.id}`}
              className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div>
                <p className="font-mono text-xs text-slate-400">{nextChallenge.id}</p>
                <p className="text-sm font-medium text-slate-800">{nextChallenge.title}</p>
              </div>
              <Badge tone="info">{nextChallenge.difficulty}</Badge>
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Automation Progress" subtitle="Completion by framework tag across all available challenges" />
        <CardBody className="space-y-3">
          {FRAMEWORKS.map((fw) => {
            const tagged = activeChallenges.filter((c) => c.frameworks.includes(fw));
            if (tagged.length === 0) return null;
            const done = tagged.filter((c) => completedIds.has(c.id)).length;
            const pct = Math.round((done / tagged.length) * 100);
            return (
              <div key={fw}>
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{fw}</span>
                  <span>{done}/{tagged.length}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Start practicing" subtitle="Jump into a live category" />
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {available.map((cat) => {
            const catChallenges = activeChallenges.filter((c) => c.categoryId === cat.id);
            const catDone = catChallenges.filter((c) => completedIds.has(c.id)).length;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="rounded-md border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{cat.title}</p>
                  {catChallenges.length > 0 && (
                    <span className="text-xs text-slate-400">{catDone}/{catChallenges.length}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{cat.description}</p>
              </Link>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  );
}
