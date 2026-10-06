import React, { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { categories, getChildren } from "@qaplatform/shared";
import { Badge } from "../design-system";
import { useAuthStore } from "../store/authStore";
import { useThemeStore, type Theme } from "../store/themeStore";
import { GlobalSearch } from "../features/search/GlobalSearch";
import { ErrorBoundary } from "../app/ErrorBoundary";

const topLevel = getChildren(null);

export function AppShell() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile nav drawer automatically on every route change, so it
  // never lingers open over the new page's content.
  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {mobileNavOpen && (
        <div
          data-testid="mobile-nav-overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
        />
      )}

      <aside
        data-testid="app-sidebar"
        className={[
          "w-64 shrink-0 border-r border-slate-200 bg-white",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200",
          "md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:transition-none",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <Link to="/" className="text-sm font-semibold text-brand-700">
            Global QA Practice Platform
          </Link>
          <button
            type="button"
            data-testid="mobile-nav-close"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 md:hidden"
            aria-label="Close navigation"
          >
            {"\u2715"}
          </button>
        </div>
        <nav aria-label="Primary" className="space-y-4 overflow-y-auto px-2 py-4" style={{ maxHeight: "calc(100vh - 60px)" }}>
          {topLevel.map((section) => {
            const children = getChildren(section.id);
            return (
              <div key={section.id}>
                <SidebarLink category={section} />
                {children.length > 0 && (
                  <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
                    {children.map((child) => (
                      <SidebarLink key={child.id} category={child} small />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            data-testid="mobile-nav-toggle"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 md:hidden"
            aria-label="Open navigation"
          >
            {"\u2630"}
          </button>
          <div className="min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
            <GlobalSearch />
          </div>
          <Link
            to="/automation-console"
            data-testid="automation-console-link"
            title="Automation Console — run Cypress/Playwright-style scripts"
            aria-label="Open Automation Console"
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 font-mono text-xs font-semibold text-white shadow-sm hover:bg-slate-700"
          >
            <span aria-hidden="true">{"</>"}</span>
            <span className="hidden sm:inline">Console</span>
          </Link>
          <span className="hidden text-xs text-slate-400 lg:inline">Enterprise QA practice environment &mdash; fictional data only</span>
          <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/automation-access"
              className="hidden rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 sm:inline"
            >
              Automation Access
            </Link>
            {user ? (
              <>
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.fullName}</span>
                <Badge tone="neutral">{user.role}</Badge>
                <button
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  onClick={() => logout()}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                data-testid="header-sign-in-link"
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-[1800px]">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

const dedicatedRoutes: Record<string, string> = {
  dashboard: "/",
  practice: "/practice",
};

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Day", icon: "\u2600\ufe0f" },
  { value: "gray", label: "Gray", icon: "\u25d1" },
  { value: "dark", label: "Night", icon: "\ud83c\udf19" },
];

/** Explicit 3-way segmented control (not a single cycling toggle) so Day/Gray/Night
 * are all visible and independently selectable at a glance, enterprise-settings style. */
function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  return (
    <div
      data-testid="theme-toggle"
      role="group"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-md border border-slate-300 bg-slate-100 p-0.5"
    >
      {THEME_OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            data-testid={`theme-option-${opt.value}`}
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            title={`${opt.label} mode`}
            className={[
              "inline-flex h-7 w-7 items-center justify-center rounded text-sm transition-colors",
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}

function SidebarLink({ category, small }: { category: (typeof topLevel)[number]; small?: boolean }) {
  const to = dedicatedRoutes[category.id] ?? `/category/${category.slug}`;
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center justify-between rounded-md px-2.5 py-1.5",
          small ? "text-xs" : "text-sm font-medium",
          isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
        ].join(" ")
      }
    >
      <span>{category.title}</span>
      {category.status === "planned" && (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">Phase {category.phase}</span>
      )}
    </NavLink>
  );
}
