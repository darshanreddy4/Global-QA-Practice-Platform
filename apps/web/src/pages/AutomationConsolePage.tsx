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

type Tab = { id: string; initialUrl: string; currentUrl: string };

let tabCounter = 0;
const makeTabId = () => `tab-${++tabCounter}`;

function resolveUrl(raw: string, fallback: string): string {
  try {
    return new URL(raw, window.location.origin).href;
  } catch {
    return fallback;
  }
}

function tabLabel(url: string): string {
  try {
    const path = new URL(url).pathname;
    return path === "/" ? "Dashboard" : path;
  } catch {
    return url;
  }
}

export function AutomationConsolePage() {
  const [framework, setFramework] = useState<Framework>("cypress");
  const [target, setTarget] = useState(TARGET_OPTIONS[0].path);
  const [code, setCode] = useState(CYPRESS_STARTER);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<"idle" | "pass" | "fail">("idle");

  // Multiple embedded "tabs", exactly like a real multi-tab browser window. This matters because the
  // platform has genuine `target="_blank"` links and `window.open()` calls (by design, to teach real
  // new-tab behavior) — without interception those would escape the console and open a real OS browser
  // tab outside it. Each tab gets its own iframe (own document/JS realm), kept mounted so switching back
  // to a tab doesn't lose its state; only the active one is visible.
  const firstUrl = useMemo(() => resolveUrl(target, window.location.origin), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [tabs, setTabs] = useState<Tab[]>(() => [{ id: makeTabId(), initialUrl: firstUrl, currentUrl: firstUrl }]);
  const [activeTabId, setActiveTabId] = useState(() => tabs[0].id);
  const iframeRefs = useRef(new Map<string, HTMLIFrameElement>());

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Real address-bar state: synced from the active tab's `currentUrl` (kept fresh by the polling
  // effect below, since the embedded app is a client-side router — plain `<Link>` clicks inside it
  // change the URL via pushState with no "load" event we could otherwise hook into). `addressDraft`
  // is the editable text shown in the input; it only diverges from the live value while the tester is
  // actively typing a URL to navigate to.
  const [addressDraft, setAddressDraft] = useState(activeTab.currentUrl);
  const editingAddressRef = useRef(false);

  useEffect(() => {
    if (!editingAddressRef.current) setAddressDraft(activeTab.currentUrl);
  }, [activeTab.currentUrl, activeTabId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTabs((prev) => {
        let changed = false;
        const next = prev.map((tab) => {
          const iframeEl = iframeRefs.current.get(tab.id);
          if (!iframeEl) return tab;
          let href: string | undefined;
          try {
            href = iframeEl.contentWindow?.location.href;
          } catch {
            return tab; // cross-origin frame — can't read its location, leave it as-is
          }
          if (href && href !== tab.currentUrl) {
            changed = true;
            return { ...tab, currentUrl: href };
          }
          return tab;
        });
        return changed ? next : prev;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const openNewTab = useCallback((rawUrl: string) => {
    setTabs((prev) => {
      const resolved = resolveUrl(rawUrl, prev[0]?.currentUrl ?? window.location.origin);
      const id = makeTabId();
      setActiveTabId(id);
      return [...prev, { id, initialUrl: resolved, currentUrl: resolved }];
    });
    editingAddressRef.current = false;
  }, []);

  const closeTab = (id: string) => {
    if (tabs.length <= 1) return; // always keep at least one tab open
    const idx = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    if (activeTabId === id) {
      setActiveTabId((next[idx - 1] ?? next[0]).id);
    }
    setTabs(next);
    iframeRefs.current.delete(id);
  };

  // Catches both real `<a target="_blank">` clicks (native browser behavior that bypasses JS
  // entirely, so this must be a capturing click listener) and `window.open()` calls made by the
  // embedded app (e.g. the Window Handling / AwesomeMart mission launchers), redirecting either one
  // into a new embedded tab instead of a real new OS browser tab.
  const handleIframeLoad = (tabId: string) => {
    const iframeEl = iframeRefs.current.get(tabId);
    const win = iframeEl?.contentWindow;
    const doc = iframeEl?.contentDocument;
    if (!iframeEl || !win || !doc) return;

    win.open = ((url?: string | URL) => {
      if (url) openNewTab(String(url));
      return null;
    }) as typeof win.open;

    doc.addEventListener(
      "click",
      (e) => {
        const anchor = (e.target as Element | null)?.closest?.("a[target='_blank']");
        if (anchor) {
          e.preventDefault();
          openNewTab((anchor as HTMLAnchorElement).href);
        }
      },
      true,
    );
  };

  const navigateTo = (rawValue: string) => {
    const iframeEl = iframeRefs.current.get(activeTabId);
    if (!iframeEl) return;
    editingAddressRef.current = false;
    iframeEl.src = resolveUrl(rawValue, activeTab.currentUrl);
  };

  const goBack = () => iframeRefs.current.get(activeTabId)?.contentWindow?.history.back();
  const goForward = () => iframeRefs.current.get(activeTabId)?.contentWindow?.history.forward();
  const reloadFrame = () => iframeRefs.current.get(activeTabId)?.contentWindow?.location.reload();

  // Draggable splitter between the code editor and the preview, like a real IDE/browser devtools
  // split — `splitPct` is the code editor's width as a percentage of the row.
  const [splitPct, setSplitPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const splitRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const row = splitRowRef.current;
      if (!row) return;
      const rect = row.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(80, Math.max(20, pct)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const switchFramework = (fw: Framework) => {
    setFramework(fw);
    setCode(fw === "cypress" ? CYPRESS_STARTER : PLAYWRIGHT_STARTER);
  };

  const appendLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  }, []);

  const run = async () => {
    const iframeEl = iframeRefs.current.get(activeTabId);
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

      <div ref={splitRowRef} className={`flex flex-1 overflow-hidden ${isDragging ? "select-none" : ""}`}>
        <div className="flex flex-col border-r border-slate-800" style={{ width: `${splitPct}%` }}>
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
        <div
          data-testid="console-split-handle"
          onMouseDown={() => setIsDragging(true)}
          title="Drag to resize"
          className="w-1.5 shrink-0 cursor-col-resize bg-slate-800 hover:bg-brand-600 active:bg-brand-600"
        />
        <div className="flex flex-col" style={{ width: `${100 - splitPct}%` }}>
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900 px-2 pt-1.5">
            {tabs.map((tab, i) => (
              <div
                key={tab.id}
                className={`flex max-w-[180px] items-center gap-1 rounded-t-md border border-b-0 pl-2.5 pr-1 py-1 text-xs ${
                  tab.id === activeTabId ? "border-slate-700 bg-slate-950 text-white" : "border-transparent bg-slate-800/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <button
                  type="button"
                  data-testid={`console-tab-${i}`}
                  onClick={() => setActiveTabId(tab.id)}
                  title={tab.currentUrl}
                  className="min-w-0 flex-1 truncate py-0.5 text-left"
                >
                  {tabLabel(tab.currentUrl)}
                </button>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    data-testid={`console-tab-close-${i}`}
                    onClick={() => closeTab(tab.id)}
                    className="shrink-0 rounded px-1.5 py-0.5 leading-none text-slate-500 hover:bg-slate-700 hover:text-white"
                  >
                    {"\u00D7"}
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              data-testid="console-tab-new"
              title="Open new tab"
              onClick={() => openNewTab(target)}
              className="rounded px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              +
            </button>
          </div>
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
                setAddressDraft(activeTab.currentUrl);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigateTo(addressDraft);
                if (e.key === "Escape") {
                  editingAddressRef.current = false;
                  setAddressDraft(activeTab.currentUrl);
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
          <div className="relative flex-1">
            {tabs.map((tab) => (
              <iframe
                key={tab.id}
                ref={(el) => {
                  if (el) iframeRefs.current.set(tab.id, el);
                  else iframeRefs.current.delete(tab.id);
                }}
                data-testid={tab.id === activeTabId ? "console-preview-frame" : `console-preview-frame-inactive-${tab.id}`}
                src={tab.initialUrl}
                title="Automation console preview"
                onLoad={() => handleIframeLoad(tab.id)}
                className={`absolute inset-0 h-full w-full border-0 bg-white ${tab.id === activeTabId ? "block" : "hidden"}`}
              />
            ))}
          </div>
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
