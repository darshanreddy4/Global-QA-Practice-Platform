import React from "react";
import { useParams } from "react-router-dom";
import { getChallengeById, getCategoryById } from "@qaplatform/shared";
import { Breadcrumbs, EmptyState } from "../design-system";
import { GuidancePanel } from "../features/guidance/GuidancePanel";
import { ChallengeRunner } from "../features/challenge-runner/ChallengeRunner";
import { EngineComponent } from "../components-engine";

export function ChallengePage() {
  const { id } = useParams();
  const challenge = id ? getChallengeById(id) : undefined;

  if (!challenge) {
    return <EmptyState title="Challenge not found" description="It may have been deactivated or the id is incorrect." />;
  }

  const category = getCategoryById(challenge.categoryId);

  return (
    <div className="max-w-3xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: category?.title ?? "Category", href: category ? `/category/${category.slug}` : undefined },
          { label: challenge.title },
        ]}
      />
      <GuidancePanel challenge={challenge} />
      <ChallengeRunner challenge={challenge}>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <EngineComponent challenge={challenge} />
        </div>
      </ChallengeRunner>
    </div>
  );
}
