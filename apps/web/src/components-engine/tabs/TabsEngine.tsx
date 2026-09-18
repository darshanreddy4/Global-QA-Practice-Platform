import React, { useEffect, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type TabsEngineProps = { variant: string };

/** ONE engine component for the "Tabs" category. */
export function TabsEngine({ variant }: TabsEngineProps) {
  switch (variant) {
    case "state-preserving":
      return <StatePreservingTabs />;
    case "closable-dynamic":
      return <ClosableDynamicTabs />;
    case "disabled-until-prerequisite":
      return <DisabledUntilPrerequisiteTabs />;
    default:
      return <p className="text-sm text-red-600">Unknown tabs variant: {variant}</p>;
  }
}

function TabButton({ active, disabled, onClick, children, testId }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode; testId: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      data-testid={testId}
      onClick={onClick}
      className={`border-b-2 px-3 py-2 text-sm ${
        active ? "border-brand-600 font-medium text-brand-700" : disabled ? "border-transparent text-slate-300" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function StatePreservingTabs() {
  const { setField } = useChallengeField();
  const [tab, setTab] = useState<"details" | "billing">("details");
  const [company, setCompany] = useState("");

  useEffect(() => setField("companyName", company), [company, setField]);

  return (
    <div>
      <div role="tablist" className="flex gap-4 border-b border-slate-200">
        <TabButton active={tab === "details"} onClick={() => setTab("details")} testId="tab-details">Details</TabButton>
        <TabButton active={tab === "billing"} onClick={() => setTab("billing")} testId="tab-billing">Billing</TabButton>
      </div>
      <div className="pt-4">
        {tab === "details" ? (
          <label className="flex flex-col gap-1.5 text-sm text-slate-700">
            Company
            <input data-testid="company-input" className="rounded-md border border-slate-300 px-3 py-2" value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
        ) : (
          <p className="text-sm text-slate-500">Billing address and payment method go here.</p>
        )}
      </div>
    </div>
  );
}

const REPORTS = ["Q3 Sales", "Q3 Expenses", "Q3 Headcount"];

function ClosableDynamicTabs() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setField("tabCount", open.length);
    setField("activeTab", active ?? "");
  }, [open, active, setField]);

  const openReport = (name: string) => {
    if (!open.includes(name)) setOpen([...open, name]);
    setActive(name);
  };

  const closeTab = (name: string) => {
    const idx = open.indexOf(name);
    const next = open.filter((t) => t !== name);
    setOpen(next);
    if (active === name) setActive(next[Math.max(0, idx - 1)] ?? null);
  };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {REPORTS.map((r) => (
          <button key={r} data-testid={`open-report-${r.replace(/\s/g, "-")}`} onClick={() => openReport(r)} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
            Open {r}
          </button>
        ))}
      </div>
      <div role="tablist" className="flex gap-1 border-b border-slate-200">
        {open.map((r) => (
          <div key={r} className={`flex items-center gap-1 border-b-2 px-3 py-1.5 text-sm ${active === r ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500"}`}>
            <button data-testid={`tab-${r.replace(/\s/g, "-")}`} onClick={() => setActive(r)}>{r}</button>
            <button data-testid={`close-${r.replace(/\s/g, "-")}`} onClick={() => closeTab(r)} aria-label={`Close ${r}`}>
              {"\u00d7"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisabledUntilPrerequisiteTabs() {
  const { setField } = useChallengeField();
  const [tab, setTab] = useState<"account" | "company" | "review">("account");
  const [companyName, setCompanyName] = useState("");
  const reviewEnabled = companyName.trim().length > 0;

  useEffect(() => setField("reviewTabEnabled", reviewEnabled), [reviewEnabled, setField]);

  return (
    <div>
      <div role="tablist" className="flex gap-4 border-b border-slate-200">
        <TabButton active={tab === "account"} onClick={() => setTab("account")} testId="tab-account">Account</TabButton>
        <TabButton active={tab === "company"} onClick={() => setTab("company")} testId="tab-company">Company</TabButton>
        <TabButton active={tab === "review"} disabled={!reviewEnabled} onClick={() => reviewEnabled && setTab("review")} testId="tab-review">Review</TabButton>
      </div>
      <div className="pt-4 text-sm">
        {tab === "company" && (
          <label className="flex flex-col gap-1.5 text-slate-700">
            Company name
            <input data-testid="company-name-input" className="rounded-md border border-slate-300 px-3 py-2" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </label>
        )}
        {tab === "review" && <p className="text-slate-600">Review: {companyName}</p>}
        {tab === "account" && <p className="text-slate-500">Account setup fields go here.</p>}
      </div>
    </div>
  );
}
