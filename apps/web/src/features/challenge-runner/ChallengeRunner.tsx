import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ChallengeDefinition } from "@qaplatform/shared";
import { evaluateValidationRules, allPassed } from "@qaplatform/shared";
import { Button, Card, CardBody, CardHeader, Badge } from "../../design-system";
import { apiRequest } from "../../services/apiClient";
import { useProgressStore } from "../../store/progressStore";

type ChallengeContextValue = {
  setField: (field: string, value: unknown) => void;
  resetKey: number;
};

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

/** Engine components call this to report live state used by the validation engine. */
export function useChallengeField() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) throw new Error("Engine components must render inside <ChallengeRunner>");
  return ctx;
}

export function ChallengeRunner({
  challenge,
  children,
}: {
  challenge: ChallengeDefinition;
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [resetKey, setResetKey] = useState(0);
  const [checked, setChecked] = useState(false);

  // Stable identity across re-renders — otherwise every engine component's
  // `useEffect(..., [setField])` (e.g. setInterval-based recreation/movement
  // challenges) would tear down and recreate its interval on every render.
  const setField = useCallback((field: string, value: unknown) => {
    setContext((prev) => ({ ...prev, [field]: value }));
  }, []);

  const outcomes = useMemo(() => evaluateValidationRules(challenge.validation, context), [challenge, context]);
  const passed = checked && allPassed(outcomes);
  const markCompleted = useProgressStore((s) => s.markCompleted);

  useEffect(() => {
    if (passed) markCompleted(challenge.id);
  }, [passed, challenge.id, markCompleted]);

  const handleReset = () => {
    setContext({});
    setChecked(false);
    setResetKey((k) => k + 1);
    // Best-effort: also clears session-scoped flaky/failure counters server-side.
    void apiRequest("/lab/reset", { method: "POST" }).catch(() => {});
  };

  return (
    <ChallengeContext.Provider value={{ setField, resetKey }}>
      <div className="space-y-4">
        <div key={resetKey}>{children}</div>

        <Card>
          <CardHeader
            title="Self-check"
            subtitle="Runs the same machine-checkable validation rules stored on this challenge."
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleReset} data-testid="reset-challenge">
                  Reset
                </Button>
                <Button size="sm" variant="primary" onClick={() => setChecked(true)} data-testid="check-my-work">
                  Check my work
                </Button>
              </div>
            }
          />
          <CardBody>
            {!checked ? (
              <p className="text-sm text-slate-500">Perform the task above, then click "Check my work".</p>
            ) : (
              <div className="space-y-2">
                <Badge tone={passed ? "success" : "danger"}>{passed ? "All checks passed" : "Not yet complete"}</Badge>
                <ul className="mt-2 space-y-1 text-sm">
                  {outcomes.map((o, i) => (
                    <li key={i} className={o.passed ? "text-emerald-700" : "text-red-600"}>
                      {o.passed ? "\u2713" : "\u2717"} {o.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ChallengeContext.Provider>
  );
}
