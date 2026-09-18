import React from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { categories, getChildren } from "@qaplatform/shared";
import { Badge } from "../design-system";
import { useAuthStore } from "../store/authStore";
import { GlobalSearch } from "../features/search/GlobalSearch";
import { ErrorBoundary } from "../app/ErrorBoundary";

const topLevel = getChildren(null);

export function AppShell() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="border-b border-slate-100 px-4 py-4">
          <Link to="/" className="text-sm font-semibold text-brand-700">
            Global QA Practice Platform
          </Link>
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
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <GlobalSearch />
          <span className="hidden text-xs text-slate-400 lg:inline">Enterprise QA practice environment &mdash; fictional data only</span>
          <div className="flex items-center gap-3">
            <Link to="/automation-access" className="text-sm text-slate-500 hover:text-brand-600 hover:underline">
              Automation Access
            </Link>
            {user ? (
              <>
                <span className="text-sm text-slate-700">{user.fullName}</span>
                <Badge tone="neutral">{user.role}</Badge>
                <button className="text-sm text-brand-600 hover:underline" onClick={() => logout()}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-brand-600 hover:underline">Sign in</Link>
            )}
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

const dedicatedRoutes: Record<string, string> = {
  dashboard: "/",
  practice: "/practice",
};

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
