import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "../design-system/Toast";
import { AppShell } from "../layouts/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { PracticeCatalogPage } from "../pages/PracticeCatalogPage";
import { CategoryPage } from "../pages/CategoryPage";
import { ChallengePage } from "../pages/ChallengePage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { AutomationAccessPage } from "../pages/AutomationAccessPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { TransactionChildPage } from "../pages/windowlab/TransactionChildPage";
import { ReportChildPage } from "../pages/windowlab/ReportChildPage";
import { useAuthStore } from "../store/authStore";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Rehydrate auth state from the httpOnly session cookie on every fresh app load —
  // critical for the automation session-link flow, which lands the browser on a
  // brand-new page load where no client-side login ever ran in this tab.
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone child-tab pages (WINDOW-001/002) render without the app shell,
              exactly like a real second tab/window would. */}
          <Route path="/window-lab/transaction" element={<ErrorBoundary><TransactionChildPage /></ErrorBoundary>} />
          <Route path="/window-lab/report" element={<ErrorBoundary><ReportChildPage /></ErrorBoundary>} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/practice" element={<PracticeCatalogPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/challenge/:id" element={<ChallengePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/automation-access" element={<AutomationAccessPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
