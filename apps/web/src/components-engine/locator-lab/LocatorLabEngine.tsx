import React, { useRef, useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type LocatorLabEngineProps = { variant: string };

/** ONE engine component for the "XPath & CSS Locator Practice" category. */
export function LocatorLabEngine({ variant }: LocatorLabEngineProps) {
  switch (variant) {
    case "locator-gauntlet":
      return <LocatorGauntlet />;
    default:
      return <p className="text-sm text-red-600">Unknown locator-lab variant: {variant}</p>;
  }
}

type LocatorMode = "css" | "xpath";
type RowResult = { outcome: "idle" | "pass" | "fail"; message: string };

/** Evaluates a user-typed CSS selector or XPath expression against the live document. */
function evaluateLocator(mode: LocatorMode, expr: string): { nodes: Element[]; error: string | null } {
  const trimmed = expr.trim();
  if (!trimmed) return { nodes: [], error: null };
  try {
    if (mode === "css") {
      return { nodes: Array.from(document.querySelectorAll(trimmed)), error: null };
    }
    const result = document.evaluate(trimmed, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const nodes: Element[] = [];
    for (let i = 0; i < result.snapshotLength; i++) nodes.push(result.snapshotItem(i) as Element);
    return { nodes, error: null };
  } catch {
    return { nodes: [], error: `Invalid ${mode === "css" ? "CSS selector" : "XPath expression"} syntax.` };
  }
}

function LocatorGauntlet() {
  const { setField } = useChallengeField();
  const answerRefs = useRef<Record<string, Element | null>>({});
  const [modes, setModes] = useState<Record<string, LocatorMode>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, RowResult>>({});

  const setAnswer = (rowId: string) => (el: Element | null) => {
    answerRefs.current[rowId] = el;
  };

  const validate = (rowId: string, fieldName: string, cssImpossible?: boolean) => {
    const mode = modes[rowId] ?? "css";
    const value = values[rowId] ?? "";
    const answerNode = answerRefs.current[rowId];
    const { nodes, error } = evaluateLocator(mode, value);

    let result: RowResult;
    if (!value.trim()) {
      result = { outcome: "fail", message: "Enter a selector/expression first." };
    } else if (error) {
      result = { outcome: "fail", message: error };
    } else if (nodes.length === 0) {
      result = {
        outcome: "fail",
        message:
          mode === "css" && cssImpossible
            ? "Matched 0 elements \u2014 CSS cannot match by visible text content. Try XPath for this one."
            : "Matched 0 elements.",
      };
    } else if (nodes.length > 1) {
      result = { outcome: "fail", message: `Matched ${nodes.length} elements \u2014 must match exactly 1.` };
    } else if (nodes[0] !== answerNode) {
      result = { outcome: "fail", message: "Matched an element, but not the correct one." };
    } else {
      result = { outcome: "pass", message: "Correct \u2014 matched exactly the right element." };
      setField(fieldName, true);
    }
    setResults((prev) => ({ ...prev, [rowId]: result }));
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-4 text-sm text-slate-700">
        <p className="mb-1 font-semibold text-brand-800">The Locator Gauntlet</p>
        <p>
          For each scenario below, inspect the rendered elements and write a CSS selector or XPath
          expression (pick the mode toggle) that matches <strong>exactly</strong> the correct target
          element — no more, no less. Click Validate to check it live against the real DOM.
        </p>
      </div>

      <LocatorRow
        rowId="r1"
        n={1}
        difficulty="Basic"
        instructions='Target the "Save" button.'
        setAnswerRef={setAnswer("r1")}
        mode={modes.r1 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r1: m }))}
        value={values.r1 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r1: v }))}
        onValidate={() => validate("r1", "row1Solved")}
        result={results.r1}
        render={(ref) => (
          <div className="flex gap-2">
            <button className="rounded border border-slate-300 px-2 py-1 text-xs">Cancel</button>
            <button ref={ref as React.Ref<HTMLButtonElement>} id="save-btn" className="rounded border border-slate-300 px-2 py-1 text-xs">
              Save
            </button>
          </div>
        )}
      />

      <LocatorRow
        rowId="r2"
        n={2}
        difficulty="Basic"
        instructions='Target the status badge showing "Active" (the only one with this status).'
        setAnswerRef={setAnswer("r2")}
        mode={modes.r2 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r2: m }))}
        value={values.r2 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r2: v }))}
        onValidate={() => validate("r2", "row2Solved")}
        result={results.r2}
        render={(ref) => (
          <div className="flex gap-2">
            <span className="status-pending rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">Pending</span>
            <span ref={ref as React.Ref<HTMLSpanElement>} className="status-active rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
              Active
            </span>
            <span className="status-closed rounded bg-slate-200 px-2 py-1 text-xs text-slate-600">Closed</span>
          </div>
        )}
      />

      <LocatorRow
        rowId="r3"
        n={3}
        difficulty="Easy"
        instructions='Target the card marked as "featured" — all cards share the exact same class, only an attribute differs.'
        setAnswerRef={setAnswer("r3")}
        mode={modes.r3 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r3: m }))}
        value={values.r3 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r3: v }))}
        onValidate={() => validate("r3", "row3Solved")}
        result={results.r3}
        render={(ref) => (
          <div className="flex gap-2">
            <div className="card rounded border border-slate-200 px-3 py-2 text-xs">Card A</div>
            <div ref={ref as React.Ref<HTMLDivElement>} className="card rounded border border-slate-200 px-3 py-2 text-xs" data-role="featured">
              Card B
            </div>
            <div className="card rounded border border-slate-200 px-3 py-2 text-xs">Card C</div>
          </div>
        )}
      />

      <LocatorRow
        rowId="r4"
        n={4}
        difficulty="Easy"
        instructions="Target the 4th row in this identical-looking list (position-based)."
        setAnswerRef={setAnswer("r4")}
        mode={modes.r4 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r4: m }))}
        value={values.r4 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r4: v }))}
        onValidate={() => validate("r4", "row4Solved")}
        result={results.r4}
        render={(ref) => (
          <ul className="space-y-1">
            {[1, 2, 3, 4, 5].map((n) =>
              n === 4 ? (
                <li key={n} ref={ref as React.Ref<HTMLLIElement>} className="row rounded bg-slate-50 px-2 py-1 text-xs">
                  Row item
                </li>
              ) : (
                <li key={n} className="row rounded bg-slate-50 px-2 py-1 text-xs">
                  Row item
                </li>
              ),
            )}
          </ul>
        )}
      />

      <LocatorRow
        rowId="r5"
        n={5}
        difficulty="Medium"
        instructions='Target the button whose visible text is "Archive" (text content, not an attribute).'
        setAnswerRef={setAnswer("r5")}
        mode={modes.r5 ?? "xpath"}
        onModeChange={(m) => setModes((s) => ({ ...s, r5: m }))}
        value={values.r5 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r5: v }))}
        onValidate={() => validate("r5", "row5Solved", true)}
        result={results.r5}
        render={(ref) => (
          <div className="flex gap-2">
            <button className="action-btn rounded border border-slate-300 px-2 py-1 text-xs">Approve</button>
            <button className="action-btn rounded border border-slate-300 px-2 py-1 text-xs">Reject</button>
            <button ref={ref as React.Ref<HTMLButtonElement>} className="action-btn rounded border border-slate-300 px-2 py-1 text-xs">
              Archive
            </button>
          </div>
        )}
      />

      <LocatorRow
        rowId="r6"
        n={6}
        difficulty="Medium"
        instructions="Target the button inside the 2nd wrapper (identical nested markup, distinguish by position/nesting)."
        setAnswerRef={setAnswer("r6")}
        mode={modes.r6 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r6: m }))}
        value={values.r6 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r6: v }))}
        onValidate={() => validate("r6", "row6Solved")}
        result={results.r6}
        render={(ref) => (
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="wrap rounded border border-slate-200 p-2">
                <div className="inner">
                  <div className="row">
                    {n === 2 ? (
                      <button ref={ref as React.Ref<HTMLButtonElement>} className="rounded border border-slate-300 px-2 py-0.5 text-xs">
                        Click
                      </button>
                    ) : (
                      <button className="rounded border border-slate-300 px-2 py-0.5 text-xs">Click</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      />

      <LocatorRow
        rowId="r7"
        n={7}
        difficulty="Hard"
        instructions='Target the input field that follows the label reading "Email" (sibling relationship, not attributes).'
        setAnswerRef={setAnswer("r7")}
        mode={modes.r7 ?? "xpath"}
        onModeChange={(m) => setModes((s) => ({ ...s, r7: m }))}
        value={values.r7 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r7: v }))}
        onValidate={() => validate("r7", "row7Solved", true)}
        result={results.r7}
        render={(ref) => (
          <div className="space-y-1">
            <div>
              <label className="mr-2 text-xs text-slate-600">Name</label>
              <input className="rounded border border-slate-300 px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="mr-2 text-xs text-slate-600">Email</label>
              <input ref={ref as React.Ref<HTMLInputElement>} className="rounded border border-slate-300 px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="mr-2 text-xs text-slate-600">Phone</label>
              <input className="rounded border border-slate-300 px-2 py-1 text-xs" />
            </div>
          </div>
        )}
      />

      <LocatorRow
        rowId="r8"
        n={8}
        difficulty="Advanced"
        instructions='Target the Price cell in the row where Product = "Keyboard" (relative to a sibling cell’s text).'
        setAnswerRef={setAnswer("r8")}
        mode={modes.r8 ?? "xpath"}
        onModeChange={(m) => setModes((s) => ({ ...s, r8: m }))}
        value={values.r8 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r8: v }))}
        onValidate={() => validate("r8", "row8Solved", true)}
        result={results.r8}
        render={(ref) => (
          <table className="text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Product</th>
                <th className="px-2 py-1 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Mouse", "$19.99"],
                ["Keyboard", "$49.99"],
                ["Monitor", "$199.99"],
              ].map(([product, price]) => (
                <tr key={product}>
                  <td className="px-2 py-1">{product}</td>
                  {product === "Keyboard" ? (
                    <td ref={ref as React.Ref<HTMLTableCellElement>} className="px-2 py-1">
                      {price}
                    </td>
                  ) : (
                    <td className="px-2 py-1">{price}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />

      <LocatorRow
        rowId="r9"
        n={9}
        difficulty="Advanced"
        instructions="Target the button with data-variant='primary' (every button's class is otherwise an unpredictable generated string)."
        setAnswerRef={setAnswer("r9")}
        mode={modes.r9 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r9: m }))}
        value={values.r9 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r9: v }))}
        onValidate={() => validate("r9", "row9Solved")}
        result={results.r9}
        render={(ref) => (
          <div className="flex gap-2">
            <button className="btn-a1x9 rounded border border-slate-300 px-2 py-1 text-xs">One</button>
            <button ref={ref as React.Ref<HTMLButtonElement>} className="btn-b2y7 rounded border border-slate-300 px-2 py-1 text-xs" data-variant="primary">
              Two
            </button>
            <button className="btn-c3z5 rounded border border-slate-300 px-2 py-1 text-xs">Three</button>
          </div>
        )}
      />

      <LocatorRow
        rowId="r10"
        n={10}
        difficulty="Advanced"
        instructions='Target the checkbox that is marked data-category="urgent" AND is NOT disabled (combine two conditions).'
        setAnswerRef={setAnswer("r10")}
        mode={modes.r10 ?? "css"}
        onModeChange={(m) => setModes((s) => ({ ...s, r10: m }))}
        value={values.r10 ?? ""}
        onValueChange={(v) => setValues((s) => ({ ...s, r10: v }))}
        onValidate={() => validate("r10", "row10Solved")}
        result={results.r10}
        render={(ref) => (
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1">
              <input type="checkbox" data-category="urgent" disabled />
              urgent (disabled)
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" data-category="normal" />
              normal
            </label>
            <label className="flex items-center gap-1">
              <input ref={ref as React.Ref<HTMLInputElement>} type="checkbox" data-category="urgent" />
              urgent (enabled)
            </label>
          </div>
        )}
      />
    </div>
  );
}

function LocatorRow({
  rowId,
  n,
  difficulty,
  instructions,
  render,
  setAnswerRef,
  mode,
  onModeChange,
  value,
  onValueChange,
  onValidate,
  result,
}: {
  rowId: string;
  n: number;
  difficulty: string;
  instructions: string;
  render: (ref: React.Ref<Element>) => React.ReactNode;
  setAnswerRef: (el: Element | null) => void;
  mode: LocatorMode;
  onModeChange: (m: LocatorMode) => void;
  value: string;
  onValueChange: (v: string) => void;
  onValidate: () => void;
  result?: RowResult;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4" data-testid={`locator-row-${rowId}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {n}. {instructions}
          </p>
        </div>
        <Badge tone="neutral">{difficulty}</Badge>
      </div>

      <div className="mb-3 rounded-md bg-slate-50 p-3">{render(setAnswerRef as React.Ref<Element>)}</div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-slate-300 text-xs">
          <button
            type="button"
            data-testid={`locator-mode-css-${rowId}`}
            onClick={() => onModeChange("css")}
            className={`rounded-l-md px-2 py-1 ${mode === "css" ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}
          >
            CSS
          </button>
          <button
            type="button"
            data-testid={`locator-mode-xpath-${rowId}`}
            onClick={() => onModeChange("xpath")}
            className={`rounded-r-md px-2 py-1 ${mode === "xpath" ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}
          >
            XPath
          </button>
        </div>
        <input
          data-testid={`locator-input-${rowId}`}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={mode === "css" ? "e.g. #save-btn" : "e.g. //button[text()='Save']"}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 font-mono text-xs"
        />
        <Button size="sm" data-testid={`locator-validate-${rowId}`} onClick={onValidate}>
          Validate
        </Button>
        {result && result.outcome !== "idle" && (
          <Badge tone={result.outcome === "pass" ? "success" : "danger"}>{result.message}</Badge>
        )}
      </div>
    </div>
  );
}
