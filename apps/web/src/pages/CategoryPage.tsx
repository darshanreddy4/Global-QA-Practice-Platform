import React from "react";
import { Link, useParams } from "react-router-dom";
import { categories, getChallengesByCategory, getChildren } from "@qaplatform/shared";
import { Badge, Breadcrumbs, Card, CardBody, DifficultyBadge, EmptyState } from "../design-system";
import { useProgressStore } from "../store/progressStore";

export function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const completedIds = useProgressStore((s) => s.completedIds);

  if (!category) {
    return <EmptyState title="Category not found" description="Check the sidebar for available categories." />;
  }

  const children = getChildren(category.id);
  const challenges = getChallengesByCategory(category.id);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: category.title }]} />
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{category.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{category.description}</p>
      </div>

      {children.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Link
              key={child.id}
              to={`/category/${child.slug}`}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300 hover:bg-brand-50/30"
            >
              <p className="text-sm font-medium text-slate-800">{child.title}</p>
              <p className="mt-1 text-xs text-slate-500">{child.description}</p>
              {child.status === "planned" && (
                <p className="mt-2 text-[11px] font-medium text-amber-600">Coming in Phase {child.phase}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {category.status === "planned" && children.length === 0 && (
        <EmptyState
          icon="\u{1F6A7}"
          title={`${category.title} is on the roadmap`}
          description={`Scheduled for Phase ${category.phase}. See ARCHITECTURE.md for the full delivery plan — this category is intentionally not implemented yet, not broken.`}
        />
      )}

      {challenges.length > 0 && (
        <Card>
          <CardBody className="divide-y divide-slate-100 p-0">
            {challenges.map((challenge) => (
              <Link
                key={challenge.id}
                to={`/challenge/${challenge.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{challenge.title}</p>
                  <p className="font-mono text-xs text-slate-400">{challenge.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {completedIds.has(challenge.id) && <Badge tone="success">Completed</Badge>}
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </div>
              </Link>
            ))}
          </CardBody>
        </Card>
      )}

      {challenges.length === 0 && children.length === 0 && category.status === "available" && (
        <EmptyState title="No challenges yet in this category" description="Check back soon." />
      )}
    </div>
  );
}
