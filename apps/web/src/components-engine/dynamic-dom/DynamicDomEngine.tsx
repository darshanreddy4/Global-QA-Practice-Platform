import React, { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../services/apiClient";
import { Badge, Button, ErrorState, LoadingState, FormField, inputBaseClasses } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type DynamicDomEngineProps = { variant: string };

/**
 * ONE engine component for the entire Dynamic DOM Lab (Dynamic Elements,
 * Dynamic XPath, Moving Elements, Ajax/Async, Wait & Sync, Virtualized Lists).
 */
export function DynamicDomEngine({ variant }: DynamicDomEngineProps) {
  switch (variant) {
    case "regenerated-id-stable-testid":
      return <RegeneratedIdStableTestId />;
    case "element-recreated-on-interval":
      return <ElementRecreatedOnInterval />;
    case "xpath-contains-text-among-siblings":
      return <XPathContainsTextAmongSiblings />;
    case "table-row-relative-xpath":
      return <TableRowRelativeXPath />;
    case "deterministic-moving-banner":
      return <DeterministicMovingBanner />;
    case "moving-close-button-settle":
      return <MovingCloseButtonSettle />;
    case "configurable-delay-api":
      return <ConfigurableDelayApi />;
    case "flaky-retry-api":
      return <FlakyRetryApi />;
    case "empty-api-response":
      return <EmptyApiResponse />;
    case "button-enabled-after-spinner":
      return <ButtonEnabledAfterSpinner />;
    case "chained-api-dependency":
      return <ChainedApiDependency />;
    case "virtualized-10000-rows":
      return <Virtualized10000Rows />;
    default:
      return <p className="text-sm text-red-600">Unknown dynamic-dom variant: {variant}</p>;
  }
}

// ---------- Dynamic Elements ----------

function RegeneratedIdStableTestId() {
  const { setField } = useChallengeField();
  const [count, setCount] = useState(0);
  const [note, setNote] = useState("");
  const [scope, setScope] = useState<"readonly" | "readwrite" | "">("");
  const [region, setRegion] = useState("");
  // Recomputed on every render of THIS component (any state change below), so every
  // field's id/class churns on every interaction — while the DOM nodes themselves stay
  // connected the whole time (contrast with DYNAMIC-002, where the nodes are destroyed).
  const dynamicSuffix = Math.random().toString(36).slice(2, 8);

  const [capturedId, setCapturedId] = useState<string | null>(null);
  const [oldIdCheck, setOldIdCheck] = useState<"idle" | "still-found" | "confirmed-broken">("idle");
  const [testIdCheck, setTestIdCheck] = useState<"idle" | "confirmed-works">("idle");

  const captureId = () => {
    const el = document.querySelector('[data-testid="session-note-input"]') as HTMLInputElement | null;
    setCapturedId(el?.id ?? null);
    setOldIdCheck("idle");
    setTestIdCheck("idle");
  };

  const checkOldId = () => {
    if (!capturedId) return;
    const found = document.getElementById(capturedId);
    if (found) {
      setOldIdCheck("still-found");
    } else {
      setOldIdCheck("confirmed-broken");
      setField("idLocatorBrokenConfirmed", true);
    }
  };

  const checkStableTestId = () => {
    const el = document.querySelector('[data-testid="session-note-input"]');
    if (el) {
      setTestIdCheck("confirmed-works");
      setField("stableTestIdConfirmed", true);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-4 text-sm text-slate-700">
        <p className="mb-2 font-semibold text-brand-800">Learn: why avoid id/class locators?</p>
        <p className="mb-2">
          Many real apps auto-generate <strong>id</strong> and <strong>class</strong> attributes on every render
          (CSS-in-JS hashes, server-issued session tokens, A/B test variants). If a locator is built from one of
          these values, it silently stops matching the next time the component re-renders — even though the exact
          same element is still on screen. (This is different from DYNAMIC-002: there the whole DOM node is
          destroyed and rebuilt; here the node stays connected, only its <strong>id</strong>/<strong>class</strong>{" "}
          attribute values change.)
        </p>
        <p className="mb-1">A brittle locator like this breaks after any re-render:</p>
        <pre className="mb-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
{`WebElement note = driver.findElement(By.id("note_48fa2c"));
note.sendKeys("more text"); // any interaction on this panel regenerates every id
driver.findElement(By.id("note_48fa2c")).sendKeys("!");
// -> NoSuchElementException, the id is now something like "note_91cd07"`}
        </pre>
        <p className="mb-1 font-medium text-slate-800">Correct QA approach — locate by a stable test id instead:</p>
        <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
{`driver.findElement(By.cssSelector("[data-testid='session-note-input']")).sendKeys("more text");
driver.findElement(By.cssSelector("[data-testid='session-note-input']")).sendKeys("!");
// data-testid never changes, no matter how many times id/class regenerate.`}
        </pre>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-1 text-sm font-medium text-slate-700">
          Session Panel{" "}
          <span className="font-normal text-slate-400">
            — every field&apos;s id/class is regenerated on every interaction; only its data-testid stays fixed.
          </span>
        </p>

        <FormField label="Session note" htmlFor={`note_${dynamicSuffix}`}>
          <input
            id={`note_${dynamicSuffix}`}
            data-testid="session-note-input"
            className={`${inputBaseClasses} note-${dynamicSuffix}`}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setField("sessionNote", e.target.value);
            }}
            placeholder="e.g. Approved"
          />
        </FormField>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Session scope</legend>
          <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
            <input
              type="radio"
              id={`scope-ro-${dynamicSuffix}`}
              name={`scope-${dynamicSuffix}`}
              data-testid="scope-readonly"
              checked={scope === "readonly"}
              onChange={() => { setScope("readonly"); setField("sessionScope", "readonly"); }}
            />
            Read-only
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
            <input
              type="radio"
              id={`scope-rw-${dynamicSuffix}`}
              name={`scope-${dynamicSuffix}`}
              data-testid="scope-readwrite"
              checked={scope === "readwrite"}
              onChange={() => { setScope("readwrite"); setField("sessionScope", "readwrite"); }}
            />
            Read-write
          </label>
        </fieldset>

        <FormField label="Session region" htmlFor={`region_${dynamicSuffix}`}>
          <select
            id={`region_${dynamicSuffix}`}
            data-testid="session-region-select"
            className={`${inputBaseClasses} region-${dynamicSuffix}`}
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setField("sessionRegion", e.target.value);
            }}
          >
            <option value="">Select region…</option>
            <option value="US">US</option>
            <option value="EU">EU</option>
            <option value="APAC">APAC</option>
          </select>
        </FormField>

        <p className="text-xs text-slate-400" data-testid="current-id-readout">
          Current note field id: <code>note_{dynamicSuffix}</code>
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-1 text-sm font-semibold text-slate-800">
          Test — confirm the regenerated id breaks a locator, the stable testid doesn&apos;t
        </p>
        <ol className="mb-3 list-decimal space-y-0.5 pl-5 text-xs text-slate-500">
          <li>Capture the Session note field&apos;s current id.</li>
          <li>Interact with any field above (forces a re-render and regenerates every id/class).</li>
          <li>Look up the OLD id — verify it no longer finds anything.</li>
          <li>Look up by the stable data-testid — verify it still finds the field.</li>
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" data-testid="capture-id-btn" onClick={captureId}>
            1. Capture current id
          </Button>
          <Button size="sm" variant="secondary" data-testid="check-old-id-btn" disabled={!capturedId} onClick={checkOldId}>
            2. Look up old id now
          </Button>
          <Button size="sm" variant="secondary" data-testid="check-stable-testid-btn" onClick={checkStableTestId}>
            3. Look up stable testid now
          </Button>
          {capturedId && <Badge tone="neutral">Captured: {capturedId}</Badge>}
        </div>
        {oldIdCheck === "still-found" && (
          <p className="mt-2 text-xs text-amber-600" data-testid="old-id-check-result">
            The id hasn&apos;t regenerated yet — interact with a field above first, then try again.
          </p>
        )}
        {oldIdCheck === "confirmed-broken" && (
          <p className="mt-2 text-xs text-emerald-700" data-testid="old-id-check-result">
            Confirmed: <code>document.getElementById(&quot;{capturedId}&quot;)</code> returns null — a locator built
            on this id is now broken, even though the field is still visibly on the page.
          </p>
        )}
        {testIdCheck === "confirmed-works" && (
          <p className="mt-2 text-xs text-emerald-700" data-testid="stable-testid-check-result">
            Confirmed: <code>[data-testid=&quot;session-note-input&quot;]</code> still finds the field, regardless of
            how many times its id/class have regenerated.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-slate-800">Bonus — same concept on a button</p>
        <button
          id={`btn_${dynamicSuffix}`}
          data-testid="refresh-token-btn"
          onClick={() => {
            const next = count + 1;
            setCount(next);
            setField("clickCount", next);
          }}
          className={`rounded-md border border-slate-300 px-3 py-2 text-sm token-${dynamicSuffix}`}
        >
          Refresh session token
        </button>
        <p className="mt-2 text-xs text-slate-400" data-testid="current-token-id-readout">
          Current id: btn_{dynamicSuffix} &middot; clicks: {count}
        </p>
      </div>
    </div>
  );
}

function ElementRecreatedOnInterval() {
  const { setField } = useChallengeField();
  const [generation, setGeneration] = useState(0);
  // Snapshots one specific radio-input node instance so we can prove it goes stale after recreation.
  const capturedElRef = useRef<HTMLInputElement | null>(null);
  const capturedGenerationRef = useRef<number | null>(null);

  const [captured, setCaptured] = useState(false);
  const [staleCheck, setStaleCheck] = useState<"idle" | "still-live" | "stale-confirmed">("idle");

  useEffect(() => {
    const interval = window.setInterval(() => setGeneration((g) => g + 1), 2000);
    return () => window.clearInterval(interval);
  }, []);

  const captureReference = () => {
    // Exactly what an automation script does: driver.findElement(By.cssSelector('[data-testid="priority-medium"]')).
    capturedElRef.current = document.querySelector('[data-testid="priority-medium"]');
    capturedGenerationRef.current = generation;
    setCaptured(true);
    setStaleCheck("idle");
  };

  const checkOldReference = () => {
    const node = capturedElRef.current;
    if (node && node.isConnected) {
      setStaleCheck("still-live");
    } else {
      setStaleCheck("stale-confirmed");
      setField("staleReferenceConfirmed", true);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-4 text-sm text-slate-700">
        <p className="mb-2 font-semibold text-brand-800">Learn: what is a Stale Element Reference?</p>
        <p className="mb-2">
          A <strong>stale element reference</strong> means your automation script is trying to interact with a web
          element that <strong>used to exist in the DOM but has since been removed or replaced</strong>.
        </p>
        <p className="mb-2">Think of it like this:</p>
        <ul className="mb-2 list-disc space-y-0.5 pl-5">
          <li>You find a button and store it in a variable.</li>
          <li>The page refreshes, or React re-renders that section.</li>
          <li>A new button appears that looks exactly the same.</li>
          <li>Your variable still points to the <strong>old button</strong>, which no longer exists.</li>
        </ul>
        <p className="mb-1">If your test does this:</p>
        <pre className="mb-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
{`WebElement priority = driver.findElement(By.cssSelector("[data-testid='priority-medium']"));
Thread.sleep(3000); // the live form below silently re-renders in this window
priority.click();
// -> StaleElementReferenceException`}
        </pre>
        <p className="mb-1 font-medium text-slate-800">Correct QA approach — re-query, don&apos;t reuse:</p>
        <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
{`driver.findElement(By.cssSelector("[data-testid='live-comment-input']")).sendKeys("Approved");
driver.findElement(By.cssSelector("[data-testid='priority-medium']")).click();
new Select(driver.findElement(By.cssSelector("[data-testid='assignee-select']")))
    .selectByVisibleText("Priya Nair");
// Locate fresh immediately before each interaction — never hold a handle across a wait.`}
        </pre>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">
          Live Ticket Form{" "}
          <span className="font-normal text-slate-400">
            — this entire form (text field, radio group, dropdown) is destroyed and rebuilt as brand-new DOM nodes
            every 2 seconds, exactly like a live dashboard row re-rendering under you.
          </span>
        </p>
        <LiveTicketForm key={generation} setField={setField} />
        <p className="mt-2 text-xs text-slate-400">Recreated {generation} time(s) (new DOM nodes each time)</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-1 text-sm font-semibold text-slate-800">Test — stale reference on a real form control</p>
        <ol className="mb-3 list-decimal space-y-0.5 pl-5 text-xs text-slate-500">
          <li>Capture a reference to the "Medium" priority radio button above.</li>
          <li>Wait more than 2 seconds (let the form regenerate at least once).</li>
          <li>Try interacting with that same captured reference.</li>
          <li>Verify a stale-element condition is detected — never assume a handle survives a re-render.</li>
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" data-testid="capture-reference-btn" onClick={captureReference}>
            1. Capture the "Medium" radio now
          </Button>
          <Button size="sm" variant="secondary" data-testid="check-old-reference-btn" disabled={!captured} onClick={checkOldReference}>
            2. Click the old reference now
          </Button>
          {captured && <Badge tone="neutral">Captured at cycle #{capturedGenerationRef.current}</Badge>}
        </div>
        {staleCheck === "still-live" && (
          <p className="mt-2 text-xs text-amber-600" data-testid="stale-check-result">
            Not stale yet — the recreation cycle hasn&apos;t fired since you captured it. Wait a little longer and try again.
          </p>
        )}
        {staleCheck === "stale-confirmed" && (
          <p className="mt-2 text-xs text-emerald-700" data-testid="stale-check-result">
            Confirmed stale: the captured radio input is no longer attached to the document
            (<code>node.isConnected === false</code>). A real Selenium/Playwright handle captured at the same moment
            would throw a stale-element error the instant you tried to click it.
          </p>
        )}
      </div>
    </div>
  );
}

function LiveTicketForm({ setField }: { setField: (field: string, value: unknown) => void }) {
  const [comment, setComment] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("");
  const [assignee, setAssignee] = useState("");

  return (
    <div className="space-y-3" data-testid="live-ticket-form">
      <FormField label="Comment" htmlFor="live-comment-input">
        <input
          id="live-comment-input"
          data-testid="live-comment-input"
          className={inputBaseClasses}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setField("liveComment", e.target.value);
          }}
          placeholder="e.g. Approved"
        />
      </FormField>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">Priority</legend>
        <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="priority" data-testid="priority-low" checked={priority === "low"} onChange={() => { setPriority("low"); setField("priority", "low"); }} />
          Low
        </label>
        <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="priority" data-testid="priority-medium" checked={priority === "medium"} onChange={() => { setPriority("medium"); setField("priority", "medium"); }} />
          Medium
        </label>
        <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="priority" data-testid="priority-high" checked={priority === "high"} onChange={() => { setPriority("high"); setField("priority", "high"); }} />
          High
        </label>
      </fieldset>

      <FormField label="Assignee" htmlFor="assignee-select">
        <select
          id="assignee-select"
          data-testid="assignee-select"
          className={inputBaseClasses}
          value={assignee}
          onChange={(e) => {
            setAssignee(e.target.value);
            setField("assignee", e.target.value);
          }}
        >
          <option value="">Unassigned</option>
          <option value="Aisha Khan">Aisha Khan</option>
          <option value="Marcus Lee">Marcus Lee</option>
          <option value="Priya Nair">Priya Nair</option>
        </select>
      </FormField>
    </div>
  );
}

// ---------- Dynamic XPath ----------

const TICKETS = ["TCK-10001", "TCK-10002", "TCK-10003", "TCK-10004", "TCK-10005"];

function XPathContainsTextAmongSiblings() {
  const { setField } = useChallengeField();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  return (
    <ul className="max-w-sm space-y-1.5" data-testid="ticket-list">
      {TICKETS.map((t) => (
        <li key={t} data-testid={`ticket-row-${t}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
          <span>Ticket #{t}</span>
          <div className="flex items-center gap-2">
            {resolved.has(t) && <Badge tone="success">Resolved</Badge>}
            <Button
              size="sm"
              variant="secondary"
              data-testid={`resolve-${t}`}
              onClick={() => {
                const next = new Set(resolved);
                next.add(t);
                setResolved(next);
                setField("resolvedTicket", t);
              }}
            >
              Resolve
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const INVOICE_ROWS = [
  { vendor: "Umbrella Inc", amount: "$3,050.00" },
  { vendor: "Acme Ltd", amount: "$1,200.00" },
  { vendor: "Globex Corp", amount: "$4,820.00" },
  { vendor: "Initech", amount: "$980.00" },
];

function TableRowRelativeXPath() {
  const { setField } = useChallengeField();
  const [read, setRead] = useState<string>();

  return (
    <table className="w-full max-w-md text-left text-sm" data-testid="vendor-table">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2">Vendor</th>
          <th className="py-2">Amount</th>
          <th className="py-2" />
        </tr>
      </thead>
      <tbody>
        {INVOICE_ROWS.map((row) => (
          <tr key={row.vendor} data-testid={`vendor-row-${row.vendor.replace(/\s/g, "-")}`} className="border-b border-slate-100">
            <td className="py-1.5">{row.vendor}</td>
            <td className="py-1.5 font-mono">{row.amount}</td>
            <td className="py-1.5">
              <button
                data-testid={`read-amount-${row.vendor.replace(/\s/g, "-")}`}
                className="text-xs text-brand-600 underline"
                onClick={() => {
                  setRead(row.amount);
                  setField("readAmount", row.amount);
                }}
              >
                Read amount
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      {read && (
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-2 text-xs text-slate-500" data-testid="read-amount-readout">
              Last read: {read}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

// ---------- Moving Elements ----------

function DeterministicMovingBanner() {
  const { setField } = useChallengeField();
  const [position, setPosition] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => setPosition((p) => (p % 3) + 1), 800);
    return () => window.clearInterval(interval);
  }, []);

  const offsets = { 1: 0, 2: 96, 3: 192 } as const;

  return (
    <div className="relative h-16 w-72 rounded-md border border-slate-200 bg-slate-50">
      <button
        data-testid="promo-banner"
        data-position={position}
        onClick={() => setField("clickedAtPosition", position)}
        style={{ transform: `translateX(${offsets[position as 1 | 2 | 3]}px)` }}
        className="absolute top-2 rounded-md bg-brand-600 px-3 py-2 text-xs text-white transition-transform duration-300"
      >
        Position {position}
      </button>
    </div>
  );
}

function MovingCloseButtonSettle() {
  const { setField } = useChallengeField();
  const [dodges, setDodges] = useState(0);
  const [closed, setClosed] = useState(false);
  const [corner, setCorner] = useState<"tl" | "tr" | "bl" | "br">("tl");
  const corners: Array<"tl" | "tr" | "bl" | "br"> = ["tl", "tr", "bl", "br"];

  const cornerClass: Record<string, string> = {
    tl: "top-2 left-2",
    tr: "top-2 right-2",
    bl: "bottom-2 left-2",
    br: "bottom-2 right-2",
  };

  const onHover = () => {
    if (dodges >= 5 || closed) return;
    const next = dodges + 1;
    setDodges(next);
    setField("dodgeCount", next);
    setCorner(corners[next % corners.length]);
  };

  if (closed) return <Badge tone="neutral">Ad closed</Badge>;

  return (
    <div className="relative h-40 w-64 rounded-md border border-slate-200 bg-amber-50">
      <p className="p-3 text-xs text-amber-700">Special offer! Act now!</p>
      <button
        data-testid="ad-close-btn"
        onMouseEnter={onHover}
        onClick={() => {
          if (dodges >= 5) {
            setClosed(true);
            setField("adClosed", true);
          }
        }}
        className={`absolute h-6 w-6 rounded-full bg-white text-xs shadow ${cornerClass[corner]}`}
        aria-label="Close ad"
      >
        {"\u2715"}
      </button>
      <p className="absolute bottom-1 left-1 text-[10px] text-amber-500" data-testid="dodge-count">Dodges: {dodges} / 5</p>
    </div>
  );
}

// ---------- Ajax / Async ----------

function ConfigurableDelayApi() {
  const { setField } = useChallengeField();
  const [ms, setMs] = useState(1000);
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");
  const [label, setLabel] = useState("");

  const load = async () => {
    setState("loading");
    const result = await apiRequest<{ loadedLabel: string }>(`/lab/delay/${ms}`);
    setLabel(result.loadedLabel);
    setField("loadedLabel", result.loadedLabel);
    setState("loaded");
  };

  return (
    <div className="space-y-2">
      <select data-testid="delay-select" className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={ms} onChange={(e) => setMs(Number(e.target.value))}>
        <option value={1000}>1s</option>
        <option value={3000}>3s</option>
        <option value={5000}>5s</option>
      </select>
      <Button size="sm" data-testid="load-delay-btn" onClick={load} loading={state === "loading"}>Load</Button>
      {state === "loading" && <LoadingState label={`Waiting ${ms}ms\u2026`} />}
      {state === "loaded" && <Badge tone="success">{label}</Badge>}
    </div>
  );
}

function FlakyRetryApi() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [attempts, setAttempts] = useState(0);
  const [balance, setBalance] = useState("");

  const fetchBalance = async () => {
    setState("loading");
    try {
      const result = await apiRequest<{ attemptCount: number; accountBalance: string }>("/lab/flaky");
      setAttempts(result.attemptCount);
      setBalance(result.accountBalance);
      setField("attemptCount", result.attemptCount);
      setField("accountBalance", result.accountBalance);
      setState("success");
    } catch {
      setAttempts((a) => a + 1);
      setState("error");
    }
  };

  return (
    <div className="space-y-2">
      {state !== "success" && (
        <Button size="sm" data-testid="fetch-balance-btn" loading={state === "loading"} onClick={fetchBalance}>
          {attempts === 0 ? "Fetch account balance" : "Retry"}
        </Button>
      )}
      {state === "error" && <ErrorState title={`Attempt ${attempts} failed`} detail="Transient upstream failure." onRetry={fetchBalance} />}
      {state === "success" && <Badge tone="success">Balance: {balance} (attempt {attempts})</Badge>}
    </div>
  );
}

function EmptyApiResponse() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");

  const load = async () => {
    setState("loading");
    await apiRequest<[]>("/lab/empty-response");
    setState("loaded");
    setField("emptyStateShown", true);
  };

  return (
    <div className="space-y-2">
      <Button size="sm" data-testid="load-notifications-btn" loading={state === "loading"} onClick={load}>Load notifications</Button>
      {state === "loading" && <LoadingState label="Loading notifications\u2026" />}
      {state === "loaded" && (
        <p data-testid="empty-notifications" className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          No notifications yet
        </p>
      )}
    </div>
  );
}

// ---------- Wait & Synchronization ----------

function ButtonEnabledAfterSpinner() {
  const { setField } = useChallengeField();
  const [preparing, setPreparing] = useState(false);
  const [ready, setReady] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const prepare = () => {
    setPreparing(true);
    setReady(false);
    window.setTimeout(() => {
      setPreparing(false);
      setReady(true);
    }, 1500);
  };

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" data-testid="prepare-export-btn" loading={preparing} onClick={prepare}>Prepare Export</Button>
      <Button
        size="sm"
        variant="secondary"
        data-testid="download-export-btn"
        disabled={!ready}
        onClick={() => {
          setDownloaded(true);
          setField("downloadClicked", true);
        }}
      >
        Download
      </Button>
      {downloaded && <Badge tone="success">Downloaded</Badge>}
    </div>
  );
}

function ChainedApiDependency() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "step1" | "step2" | "done">("idle");
  const [eta, setEta] = useState("");

  const run = async () => {
    setState("step1");
    const { token } = await apiRequest<{ token: string }>("/lab/chained/step1");
    setState("step2");
    const result = await apiRequest<{ eta: string }>(`/lab/chained/step2?token=${token}`);
    setEta(result.eta);
    setField("eta", result.eta);
    setState("done");
  };

  return (
    <div className="space-y-2">
      <Button size="sm" data-testid="get-eta-btn" loading={state === "step1" || state === "step2"} onClick={run}>Get Shipment ETA</Button>
      {state === "step1" && <LoadingState label="Fetching tracking token\u2026" />}
      {state === "step2" && <LoadingState label="Fetching ETA with token\u2026" />}
      {state === "done" && <Badge tone="success">ETA: {eta}</Badge>}
    </div>
  );
}

// ---------- Virtualized Lists ----------

const TOTAL_ROWS = 10_000;
const ROW_HEIGHT = 28;
const VIEWPORT_HEIGHT = 300;
const BUFFER = 5;

function Virtualized10000Rows() {
  const { setField } = useChallengeField();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [selected, setSelected] = useState<number>();

  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + BUFFER * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIndex = Math.min(TOTAL_ROWS, startIndex + visibleCount);
  const rows = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i + 1);

  return (
    <div>
      <div
        ref={containerRef}
        data-testid="virtualized-list"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: VIEWPORT_HEIGHT, overflowY: "auto", position: "relative" }}
        className="w-80 rounded-md border border-slate-200"
      >
        <div style={{ height: TOTAL_ROWS * ROW_HEIGHT, position: "relative" }}>
          {rows.map((n) => (
            <button
              key={n}
              data-testid={`txn-row-${n}`}
              onClick={() => {
                setSelected(n);
                setField("selectedTransaction", n);
              }}
              style={{ position: "absolute", top: (n - 1) * ROW_HEIGHT, height: ROW_HEIGHT }}
              className={`w-full border-b border-slate-100 px-3 text-left text-sm ${selected === n ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600"}`}
            >
              Transaction #{n}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Rendered rows: {rows.length} of {TOTAL_ROWS} logical records
      </p>
    </div>
  );
}
