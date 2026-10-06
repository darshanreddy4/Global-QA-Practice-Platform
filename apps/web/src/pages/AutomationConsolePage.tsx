import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CyContext, type LogEntry } from "../features/automation-console/cypressFacade";
import { PwPage, createExpect } from "../features/automation-console/playwrightFacade";

type Framework = "cypress" | "playwright";

type TargetOption = { label: string; path: string };

const TARGET_OPTIONS: TargetOption[] = [
  { label: "AwesomeMart storefront (/store)", path: "/store" },
  { label: "Practice dashboard (/)", path: "/" },
  { label: "Dropdowns challenge", path: "/challenge/DROPDOWN-002" },
  { label: "XPath & CSS Locator Lab", path: "/challenge/LOCATOR-001" },
];

const CYPRESS_STARTER = `// Practice shim: real Cypress syntax, running against the embedded preview on the right.
cy.visit('/store');
cy.get('[data-testid="store-search-input"]').type('Nike');
cy.contains('Nike Air Runner').should('exist');
cy.get('[data-testid="add-to-cart-f1"]').click();
cy.get('[data-testid="cart-link"]').should('exist');
`;

const PLAYWRIGHT_STARTER = `// Practice shim: real Playwright syntax, running against the embedded preview on the right.
await page.goto('/store');
await page.locator('[data-testid="store-search-input"]').fill('Nike');
await expect(page.getByText('Nike Air Runner')).toBeVisible();
await page.locator('[data-testid="add-to-cart-f1"]').click();
await expect(page.locator('[data-testid="cart-link"]')).toBeVisible();
`;

function LogLine({ entry }: { entry: LogEntry }) {
  const color = entry.type === "pass" ? "text-emerald-400" : entry.type === "fail" ? "text-rose-400" : "text-slate-400";
  const icon = entry.type === "pass" ? "\u2713" : entry.type === "fail" ? "\u2717" : "\u2022";
  return (
    <div className={`whitespace-pre-wrap ${color}`}>
      {icon} {entry.message}
    </div>
  );
}

export function AutomationConsolePage() {
  const [framework, setFramework] = useState<Framework>("cypress");
  const [target, setTarget] = useState(TARGET_OPTIONS[0].path);
  const [code, setCode] = useState(CYPRESS_STARTER);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<"idle" | "pass" | "fail">("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Real address-bar state: `liveUrl` always mirrors the iframe's actual current location (updated
  // by polling below, since the embedded app is a client-side router — plain `<Link>` clicks inside
  // it change the URL via pushState with no "load" event we could otherwise hook into). `addressDraft`
  // is the editable text shown in the input; it only diverges from `liveUrl` while the tester is
  // actively typing a URL to navigate to.
  const [liveUrl, setLiveUrl] = useState(() => new URL(target, window.location.origin).href);
  const [addressDraft, setAddressDraft] = useState(liveUrl);
  const editingAddressRef = useRef(false);
  const lastSeenUrlRef = useRef(liveUrl);

  useEffect(() => {
    const interval = setInterval(() => {
      const iframeEl = iframeRef.current;
      if (!iframeEl) return;
      let href: string | undefined;
      try {
        href = iframeEl.contentWindow?.location.href;
      } catch {
        return; // cross-origin frame — can't read its location, leave the bar as-is
      }
      if (href && href !== lastSeenUrlRef.current) {
        lastSeenUrlRef.current = href;
        setLiveUrl(href);
        if (!editingAddressRef.current) setAddressDraft(href);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (rawValue: string) => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;
    let resolved: string;
    try {
      resolved = new URL(rawValue, window.location.origin).href;
    } catch {
      return;
    }
    editingAddressRef.current = false;
    iframeEl.src = resolved;
  };

  const goBack = () => iframeRef.current?.contentWindow?.history.back();
  const goForward = () => iframeRef.current?.contentWindow?.history.forward();
  const reloadFrame = () => iframeRef.current?.contentWindow?.location.reload();

  const switchFramework = (fw: Framework) => {
    setFramework(fw);
    setCode(fw === "cypress" ? CYPRESS_STARTER : PLAYWRIGHT_STARTER);
  };

  const appendLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  }, []);

  const run = async () => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;
    setRunning(true);
    setSummary("idle");
    setLogs([{ type: "info", message: `Running as ${framework === "cypress" ? "Cypress" : "Playwright"} practice script\u2026` }]);
    try {
      if (framework === "cypress") {
        const ctx = new CyContext(iframeEl);
        const fn = new Function("cy", `"use strict";\n${code}`);
        fn(ctx);
        await ctx.runAll(appendLog);
      } else {
        const pageObj = new PwPage(iframeEl, appendLog);
        const expectFn = createExpect(appendLog);
        const fn = new Function("page", "expect", `"use strict";\nreturn (async () => {\n${code}\n})();`);
        await fn(pageObj, expectFn);
      }
      setSummary("pass");
      appendLog({ type: "pass", message: "Script finished \u2014 all steps passed." });
    } catch (e) {
      setSummary("fail");
      const message = e instanceof Error ? e.message : String(e);
      appendLog({ type: "fail", message: `Script stopped \u2014 ${message}` });
    } finally {
      setRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setSummary("idle");
  };

  const summaryBadge = useMemo(() => {
    if (summary === "pass") return <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">PASSED</span>;
    if (summary === "fail") return <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400">FAILED</span>;
    return <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-300">IDLE</span>;
  }, [summary]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
        <Link to="/" data-testid="console-back-link" className="text-sm text-slate-400 hover:text-white hover:underline">
          {"\u2190"} Back to platform
        </Link>
        <span className="text-sm font-semibold text-white">Automation Console</span>
        <div className="ml-2 flex items-center overflow-hidden rounded-md border border-slate-700">
          <button
            type="button"
            data-testid="console-framework-cypress"
            onClick={() => switchFramework("cypress")}
            className={`px-3 py-1 text-xs font-medium ${framework === "cypress" ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            Cypress
          </button>
          <button
            type="button"
            data-testid="console-framework-playwright"
            onClick={() => switchFramework("playwright")}
            className={`px-3 py-1 text-xs font-medium ${framework === "playwright" ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            Playwright
          </button>
        </div>
        <select
          data-testid="console-target-select"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            navigateTo(e.target.value);
          }}
          className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200"
        >
          {TARGET_OPTIONS.map((opt) => (
            <option key={opt.path} value={opt.path}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          {summaryBadge}
          <button
            type="button"
            data-testid="console-clear-btn"
            onClick={clearLogs}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Clear
          </button>
          <button
            type="button"
            data-testid="console-run-btn"
            onClick={run}
            disabled={running}
            className="rounded-md bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {running ? "Running\u2026" : "\u25B6 Run"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 flex-col border-r border-slate-800">
          <div className="border-b border-slate-800 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {framework === "cypress" ? "spec.cy.js" : "spec.pw.ts"}
          </div>
          <textarea
            data-testid="console-code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none"
          />
        </div>
        <div className="flex w-1/2 flex-col">
          <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-900 px-2 py-1.5">
            <button
              type="button"
              data-testid="console-nav-back"
              title="Back"
              onClick={goBack}
              className="rounded px-1.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {"\u2190"}
            </button>
            <button
              type="button"
              data-testid="console-nav-forward"
              title="Forward"
              onClick={goForward}
              className="rounded px-1.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {"\u2192"}
            </button>
            <button
              type="button"
              data-testid="console-nav-reload"
              title="Reload"
              onClick={reloadFrame}
              className="rounded px-1.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {"\u21BB"}
            </button>
            <input
              data-testid="console-address-bar"
              value={addressDraft}
              onFocus={() => {
                editingAddressRef.current = true;
              }}
              onChange={(e) => setAddressDraft(e.target.value)}
              onBlur={() => {
                editingAddressRef.current = false;
                setAddressDraft(liveUrl);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigateTo(addressDraft);
                if (e.key === "Escape") {
                  editingAddressRef.current = false;
                  setAddressDraft(liveUrl);
                  e.currentTarget.blur();
                }
              }}
              spellCheck={false}
              className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 outline-none focus:border-brand-500"
            />
            <button
              type="button"
              data-testid="console-nav-go"
              onClick={() => navigateTo(addressDraft)}
              className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Go
            </button>
          </div>
          <iframe ref={iframeRef} data-testid="console-preview-frame" src={target} title="Automation console preview" className="flex-1 border-0 bg-white" />
        </div>
      </div>

      <div className="h-48 overflow-y-auto border-t border-slate-800 bg-slate-900 px-4 py-2 font-mono text-xs" data-testid="console-log-panel">
        {logs.length === 0 ? (
          <p className="text-slate-500">Output will appear here after you click Run.</p>
        ) : (
          logs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
      </div>

      <p className="border-t border-slate-800 bg-slate-900 px-4 py-1.5 text-center text-[11px] text-slate-500">
        {"Practice shim \u2014 mimics real Cypress/Playwright syntax against the embedded preview. Not the actual npm packages."}
      </p>
    </div>
  );
}
