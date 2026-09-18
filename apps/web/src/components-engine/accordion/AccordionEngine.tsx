import React, { useEffect, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type AccordionEngineProps = { variant: string };

/** ONE engine component for the "Accordions" category. */
export function AccordionEngine({ variant }: AccordionEngineProps) {
  switch (variant) {
    case "single-open":
      return <SingleOpenAccordion />;
    case "multi-open-nested":
      return <MultiOpenNestedAccordion />;
    default:
      return <p className="text-sm text-red-600">Unknown accordion variant: {variant}</p>;
  }
}

const FAQ = [
  { q: "How do refunds work?", a: "Refunds are processed within 5-7 business days to the original payment method." },
  { q: "What is your SLA?", a: "We guarantee 99.9% uptime with 24/7 incident response." },
  { q: "Do you offer annual billing?", a: "Yes, annual plans receive a 15% discount." },
];

function SingleOpenAccordion() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => setField("openPanel", open ?? ""), [open, setField]);

  return (
    <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
      {FAQ.map((item) => (
        <div key={item.q}>
          <button
            data-testid={`faq-header-${item.q.replace(/\W+/g, "-")}`}
            aria-expanded={open === item.q}
            onClick={() => setOpen(open === item.q ? null : item.q)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800"
          >
            {item.q}
            <span aria-hidden="true">{open === item.q ? "\u2212" : "+"}</span>
          </button>
          {open === item.q && <p className="px-4 pb-3 text-sm text-slate-600">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

const POLICIES = [
  { title: "Data Retention", body: "Customer data is retained for 24 months after account closure." },
  {
    title: "Pricing Tiers",
    body: null,
    table: [
      { tier: "Starter", price: "$9/mo" },
      { tier: "Growth", price: "$49/mo" },
      { tier: "Enterprise", price: "Custom" },
    ],
  },
  { title: "Support Hours", body: "Support is available Monday-Friday, 9am-6pm local time." },
];

function MultiOpenNestedAccordion() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => setField("expandedCount", open.size), [open, setField]);

  const toggle = (title: string) => {
    const next = new Set(open);
    next.has(title) ? next.delete(title) : next.add(title);
    setOpen(next);
  };

  return (
    <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
      {POLICIES.map((p) => (
        <div key={p.title}>
          <button
            data-testid={`policy-header-${p.title.replace(/\W+/g, "-")}`}
            aria-expanded={open.has(p.title)}
            onClick={() => toggle(p.title)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800"
          >
            {p.title}
            <span aria-hidden="true">{open.has(p.title) ? "\u2212" : "+"}</span>
          </button>
          {open.has(p.title) && (
            <div className="px-4 pb-3 text-sm text-slate-600">
              {p.body && <p>{p.body}</p>}
              {p.table && (
                <table data-testid="pricing-table" className="mt-1 w-full text-left text-xs">
                  <tbody>
                    {p.table.map((row) => (
                      <tr key={row.tier} className="border-t border-slate-100">
                        <td className="py-1">{row.tier}</td>
                        <td className="py-1">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
