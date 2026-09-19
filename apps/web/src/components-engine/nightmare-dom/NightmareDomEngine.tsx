import React, { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../services/apiClient";
import { Badge, Button, Card, ErrorState } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type NightmareDomEngineProps = { variant: string };

/** ONE engine component for the "Nightmare DOM" category (spec #55) — a single
 * combined benchmark page stacking 8 independent real-world automation traps. */
export function NightmareDomEngine({ variant }: NightmareDomEngineProps) {
  switch (variant) {
    case "the-gauntlet":
      return <TheGauntlet />;
    default:
      return <p className="text-sm text-red-600">Unknown nightmare-dom variant: {variant}</p>;
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function StageShell({
  n,
  title,
  hint,
  solved,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  solved: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Stage {n}: {title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        </div>
        <Badge tone={solved ? "success" : "neutral"}>{solved ? "Solved" : "Open"}</Badge>
      </div>
      {children}
    </Card>
  );
}

function TheGauntlet() {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-lg border border-red-100 bg-red-50/40 p-4 text-sm text-slate-700">
        <p className="mb-1 font-semibold text-red-800">The Nightmare DOM Gauntlet</p>
        <p>
          Eight independent traps, each modeling a failure real QA automation engineers hit in production
          apps: churning ids/classes, ambiguous duplicate elements, hidden decoys, deeply nested generic
          markup, state you must poll for instead of sleeping on, a click-intercepting overlay, iframe +
          shadow-DOM nesting, and a flaky/delayed API feeding a reshuffled, virtualized table. Nothing here
          is decorative &#8212; every trap must be defeated with a resilient locator or wait strategy, not luck.
        </p>
      </div>
      <Stage1RandomIdentity />
      <Stage2DuplicateApprove />
      <Stage3HiddenDuplicate />
      <Stage4NestedRelativeDelete />
      <Stage5PollForReady />
      <Stage6MovingAndAd />
      <Stage7IframeAndShadow />
      <Stage8FlakyLedger />
    </div>
  );
}

// ---------- Stage 1: random ids, churning classes, rotating label ----------

function Stage1RandomIdentity() {
  const { setField } = useChallengeField();
  const [confirmed, setConfirmed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1800);
    return () => window.clearInterval(id);
  }, []);

  const suffix = useRef(Math.random().toString(36).slice(2, 8));
  suffix.current = Math.random().toString(36).slice(2, 8);
  const labels = ["Confirm", "Verify", "Proceed"];
  const label = labels[tick % labels.length];

  return (
    <StageShell
      n={1}
      title="Random ids, churning classes & a label that never sits still"
      hint='This button&#8217;s id/class regenerate and its visible label rotates every ~1.8s. Never locate or assert by id, class or exact text here &#8212; use the fixed data-testid.'
      solved={confirmed}
    >
      <button
        id={`gate-${suffix.current}`}
        className={`gate-${suffix.current} rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700`}
        data-testid="stage1-confirm-btn"
        onClick={() => {
          setConfirmed(true);
          setField("stage1Confirmed", true);
        }}
      >
        {label}
      </button>
      <p className="mt-1 text-[11px] text-slate-400">
        current id: <code>gate-{suffix.current}</code>
      </p>
    </StageShell>
  );
}

// ---------- Stage 2: duplicate elements disambiguated only by an attribute ----------

const APPROVAL_REQUESTS = [
  { id: "1000", dept: "Ops" },
  { id: "2500", dept: "Sales" },
  { id: "4821", dept: "Finance" },
  { id: "3300", dept: "Legal" },
  { id: "9100", dept: "IT" },
];

function Stage2DuplicateApprove() {
  const { setField } = useChallengeField();
  const [approvedId, setApprovedId] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const approve = (req: (typeof APPROVAL_REQUESTS)[number]) => {
    if (req.id === "4821") {
      setApprovedId(req.id);
      setField("stage2ApprovedRequestId", req.id);
    } else {
      setWrongCount((c) => c + 1);
    }
  };

  return (
    <StageShell
      n={2}
      title='Five identical "Approve" buttons &#8212; only one is correct'
      hint="All five share the same text, class and data-testid. Approve request #4821 specifically, disambiguating by each button's title/aria-label attribute, not its visible text."
      solved={!!approvedId}
    >
      <div className="flex flex-wrap gap-2">
        {APPROVAL_REQUESTS.map((r) => (
          <button
            key={r.id}
            data-testid="approve-btn"
            title={`Request #${r.id} \u2014 ${r.dept} Dept`}
            aria-label={`Approve request ${r.id}`}
            disabled={approvedId === r.id}
            onClick={() => approve(r)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:bg-emerald-50 disabled:text-emerald-700"
          >
            Approve
          </button>
        ))}
      </div>
      {wrongCount > 0 && !approvedId && (
        <p className="mt-1 text-xs text-red-600">Wrong request approved {wrongCount} time(s) &#8212; check the title attribute.</p>
      )}
      {approvedId && <p className="mt-1 text-xs text-emerald-700">Approved request #{approvedId}.</p>}
    </StageShell>
  );
}

// ---------- Stage 3: hidden decoys sharing one data-testid ----------

function Stage3HiddenDuplicate() {
  const { setField } = useChallengeField();
  const [archived, setArchived] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const genuinelyVisible = style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    if (genuinelyVisible) {
      setArchived(true);
      setField("stage3VisibleArchiveClicked", true);
    }
  };

  return (
    <StageShell
      n={3}
      title="Three elements, one data-testid, only one is really visible"
      hint='All three "Archive Report" buttons share data-testid="archive-report-btn". Two are display:none / visibility:hidden &#8212; a real toBeVisible()/isDisplayed() check must filter down to the one truly on screen.'
      solved={archived}
    >
      <div className="space-y-1.5">
        <button data-testid="archive-report-btn" onClick={handleClick} style={{ display: "none" }} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          Archive Report
        </button>
        <button data-testid="archive-report-btn" onClick={handleClick} style={{ visibility: "hidden" }} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          Archive Report
        </button>
        <button
          data-testid="archive-report-btn"
          onClick={handleClick}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Archive Report
        </button>
      </div>
      {archived && <p className="mt-1 text-xs text-emerald-700">Report archived.</p>}
    </StageShell>
  );
}

// ---------- Stage 4: identically-classed nested rows, relative locate ----------

const NIGHTMARE_COMPANIES = ["Initech Global", "Umbrella Dynamics", "Globex Corporation", "Stark Logistics", "Wayne Industrial"];

function Stage4NestedRelativeDelete() {
  const { setField } = useChallengeField();
  const [deleted, setDeleted] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(NIGHTMARE_COMPANIES);

  const del = (name: string) => {
    setDeleted(name);
    setRemaining((r) => r.filter((c) => c !== name));
    if (name === "Globex Corporation") setField("stage4DeletedCompany", name);
  };

  return (
    <StageShell
      n={4}
      title="Deeply nested, identically-classed rows"
      hint='Every row is div.wrap > div.body > div.line with IDENTICAL classnames and no per-row id. Only the outer row wrapper carries data-testid="company-row-<slug>" &#8212; find that ancestor, then locate its Delete button as a relative descendant.'
      solved={deleted === "Globex Corporation"}
    >
      <div className="space-y-1.5">
        {remaining.map((name) => (
          <div key={name} data-testid={`company-row-${slugify(name)}`} className="wrap rounded border border-slate-200">
            <div className="body px-3 py-2">
              <div className="line flex items-center justify-between">
                <span className="text-sm text-slate-700">{name}</span>
                <button onClick={() => del(name)} className="delete-btn rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {deleted && <p className="mt-1 text-xs text-slate-500">Last deleted: {deleted}</p>}
    </StageShell>
  );
}

// ---------- Stage 5: dynamic text + dynamic attribute, poll don't sleep ----------

type PipelineState = "queued" | "validating" | "ready";

function Stage5PollForReady() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<PipelineState>("queued");
  const [continued, setContinued] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setState("validating"), 2200);
    const t2 = window.setTimeout(() => setState("ready"), 4400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const labels: Record<PipelineState, string> = { queued: "Queued", validating: "Validating\u2026", ready: "Ready" };
  const toneClasses: Record<PipelineState, string> = {
    queued: "bg-slate-100 text-slate-700",
    validating: "bg-amber-100 text-amber-800",
    ready: "bg-emerald-100 text-emerald-800",
  };

  return (
    <StageShell
      n={5}
      title="Poll the real state, don&#8217;t sleep(5000)"
      hint='The badge&#8217;s text AND its data-state attribute change over ~4.4s. "Continue" is natively disabled until data-state="ready" &#8212; poll for that state instead of a fixed wait.'
      solved={continued}
    >
      <div className="flex items-center gap-3">
        <span
          data-testid="pipeline-status-badge"
          data-state={state}
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[state]}`}
        >
          {labels[state]}
        </span>
        <button
          data-testid="continue-after-ready-btn"
          disabled={state !== "ready"}
          onClick={() => {
            setContinued(true);
            setField("stage5ContinuedAfterReady", true);
          }}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continue
        </button>
      </div>
    </StageShell>
  );
}

// ---------- Stage 6: moving target + real click-intercepting overlay ----------

function Stage6MovingAndAd() {
  const { setField } = useChallengeField();
  const [pos, setPos] = useState({ x: 20, y: 20 });
  const velocity = useRef({ dx: 2.2, dy: 1.6 });
  const [adVisible, setAdVisible] = useState(false);
  const [adDismissed, setAdDismissed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const box = { w: 260, h: 130 };
    const btn = { w: 120, h: 36 };
    const frame = window.setInterval(() => {
      setPos((p) => {
        let { x, y } = p;
        let { dx, dy } = velocity.current;
        x += dx;
        y += dy;
        if (x <= 0 || x >= box.w - btn.w) {
          dx = -dx;
          x = Math.max(0, Math.min(x, box.w - btn.w));
        }
        if (y <= 0 || y >= box.h - btn.h) {
          dy = -dy;
          y = Math.max(0, Math.min(y, box.h - btn.h));
        }
        velocity.current = { dx, dy };
        return { x, y };
      });
    }, 40);
    const adInterval = window.setInterval(() => setAdVisible(true), 5000);
    return () => {
      window.clearInterval(frame);
      window.clearInterval(adInterval);
    };
  }, []);

  useEffect(() => {
    if (!adVisible) return;
    const hide = window.setTimeout(() => setAdVisible(false), 2200);
    return () => window.clearTimeout(hide);
  }, [adVisible]);

  return (
    <StageShell
      n={6}
      title="A moving target, plus a real click-blocking overlay"
      hint='"Claim Reward" bounces inside the box. Every ~5s a "Sponsored" overlay covers it with pointer-events enabled &#8212; a click on the button underneath is genuinely intercepted until the overlay is closed.'
      solved={claimed && adDismissed}
    >
      <div className="relative h-[140px] w-[260px] overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        <button
          data-testid="claim-reward-btn"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          onClick={() => {
            setClaimed(true);
            setField("stage6RewardClaimed", true);
          }}
          className="absolute rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
        >
          Claim Reward
        </button>
        {adVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
            <div className="rounded-md bg-white p-3 text-center shadow-lg">
              <p className="mb-2 text-xs font-medium text-slate-700">Sponsored: Upgrade now!</p>
              <button
                data-testid="ad-close-btn"
                onClick={() => {
                  setAdVisible(false);
                  setAdDismissed(true);
                  setField("stage6AdDismissed", true);
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-1 text-[11px] text-slate-400">Ad interval: every ~5s for ~2.2s.</p>
    </StageShell>
  );
}

// ---------- Stage 7: iframe wrapping a shadow-DOM button ----------

const NIGHTMARE_FRAME_HTML = `
  <style>body{font:12px system-ui;color:#475569;margin:0;padding:12px;}</style>
  <p style="margin:0 0 8px;">Approval frame &#8212; the real "Finalize" control lives inside a shadow root.</p>
  <div id="host"></div>
  <script>
    class QaFinalGate extends HTMLElement {
      connectedCallback() {
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = '<button id="finalize" style="padding:6px 12px;border-radius:6px;border:1px solid #16a34a;background:#22c55e;color:#fff;font:12px system-ui;cursor:pointer;">Finalize</button>';
        root.getElementById("finalize").addEventListener("click", function () {
          top.postMessage({ type: "nightmare-finalized" }, "*");
        });
      }
    }
    customElements.define("qa-final-gate", QaFinalGate);
    var el = document.createElement("qa-final-gate");
    el.setAttribute("data-testid", "qa-final-gate");
    document.getElementById("host").appendChild(el);
  <\/script>
`;

function Stage7IframeAndShadow() {
  const { setField } = useChallengeField();
  const [finalized, setFinalized] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "nightmare-finalized") {
        setFinalized(true);
        setField("stage7Finalized", true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setField]);

  return (
    <StageShell
      n={7}
      title="Iframe wrapping a shadow-DOM button"
      hint='Switch into the iframe, then pierce its open shadow root to reach the real "Finalize" button &#8212; its data-testid lives inside the shadow root, not on the light-DOM host.'
      solved={finalized}
    >
      <iframe
        title="Approval frame"
        data-testid="nightmare-approval-iframe"
        srcDoc={NIGHTMARE_FRAME_HTML}
        className="h-28 w-72 rounded-md border border-slate-200"
      />
      {finalized && <p className="mt-1 text-xs text-emerald-700">Finalized.</p>}
    </StageShell>
  );
}

// ---------- Stage 8: flaky/delayed API feeding a reshuffled virtualized table ----------

type LedgerCol = "id" | "date" | "amount" | "status" | "action";
const COLUMN_LABELS: Record<LedgerCol, string> = { id: "Invoice ID", date: "Date", amount: "Amount", status: "Status", action: "Action" };
const LEDGER_TOTAL_ROWS = 400;
const LEDGER_ROW_HEIGHT = 34;
const LEDGER_VIEWPORT_HEIGHT = 220;
const LEDGER_TARGET_ROW = 387;

function shuffledLedgerColumns(): LedgerCol[] {
  const cols: LedgerCol[] = ["id", "date", "amount", "status", "action"];
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cols[i], cols[j]] = [cols[j], cols[i]];
  }
  return cols;
}

function ledgerCellValue(n: number, col: LedgerCol): string {
  switch (col) {
    case "id":
      return `INV-${String(n).padStart(4, "0")}`;
    case "date":
      return `2026-${String((n % 12) + 1).padStart(2, "0")}-${String((n % 28) + 1).padStart(2, "0")}`;
    case "amount":
      return `$${(n * 3.4 + 50).toFixed(2)}`;
    case "status":
      return n % 5 === 0 ? "Overdue" : "Paid";
    default:
      return "";
  }
}

function Stage8FlakyLedger() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [attempts, setAttempts] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const columns = useRef<LedgerCol[]>(shuffledLedgerColumns()).current;

  const load = async () => {
    setState("loading");
    try {
      const result = await apiRequest<{ attemptCount: number }>("/lab/flaky");
      setAttempts(result.attemptCount);
      setState("ready");
    } catch {
      setAttempts((a) => a + 1);
      setState("error");
    }
  };

  const visibleCount = Math.ceil(LEDGER_VIEWPORT_HEIGHT / LEDGER_ROW_HEIGHT) + 4;
  const startIndex = Math.max(0, Math.floor(scrollTop / LEDGER_ROW_HEIGHT) - 2);
  const endIndex = Math.min(LEDGER_TOTAL_ROWS, startIndex + visibleCount);
  const rows = Array.from({ length: Math.max(0, endIndex - startIndex) }, (_, i) => startIndex + i + 1);
  const targetId = `INV-${String(LEDGER_TARGET_ROW).padStart(4, "0")}`;

  return (
    <StageShell
      n={8}
      title="Flaky+delayed load, then a shuffled, virtualized ledger"
      hint={`Loading fails twice before succeeding (a real bounded-retry loop). Once loaded, scroll to invoice ${targetId} \u2014 column order is reshuffled every load, so locate cells by data-col, not position, then flag that row.`}
      solved={flagged}
    >
      {state !== "ready" && (
        <div className="space-y-2">
          <Button size="sm" data-testid="load-ledger-btn" loading={state === "loading"} onClick={load}>
            {attempts === 0 ? "Load Ledger" : "Retry"}
          </Button>
          {state === "error" && <ErrorState title={`Attempt ${attempts} failed`} detail="Transient upstream failure." onRetry={load} />}
        </div>
      )}
      {state === "ready" && (
        <div
          data-testid="nightmare-ledger"
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          style={{ height: LEDGER_VIEWPORT_HEIGHT, overflowY: "auto", position: "relative" }}
          className="w-full max-w-md rounded-md border border-slate-200"
        >
          <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-500">
            {columns.map((col) => (
              <span key={col} data-col={col} className="flex-1 px-2 py-1">
                {COLUMN_LABELS[col]}
              </span>
            ))}
          </div>
          <div style={{ height: LEDGER_TOTAL_ROWS * LEDGER_ROW_HEIGHT, position: "relative" }}>
            {rows.map((n) => (
              <div
                key={n}
                data-testid={n === LEDGER_TARGET_ROW ? `ledger-row-${n}` : undefined}
                style={{ position: "absolute", top: LEDGER_ROW_HEIGHT * (n - 1) + 28, height: LEDGER_ROW_HEIGHT }}
                className="flex w-full items-center border-b border-slate-100 text-xs text-slate-600"
              >
                {columns.map((col) =>
                  col === "action" ? (
                    <span key={col} data-col="action" className="flex-1 px-2">
                      <button
                        data-testid={`flag-btn-${n}`}
                        onClick={() => {
                          if (n === LEDGER_TARGET_ROW) {
                            setFlagged(true);
                            setField("stage8LedgerInvoiceFlagged", true);
                          }
                        }}
                        className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700 hover:bg-amber-100"
                      >
                        Flag
                      </button>
                    </span>
                  ) : (
                    <span key={col} data-col={col} className="flex-1 px-2">
                      {ledgerCellValue(n, col)}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {flagged && <p className="mt-1 text-xs text-emerald-700">Flagged {targetId}.</p>}
    </StageShell>
  );
}
