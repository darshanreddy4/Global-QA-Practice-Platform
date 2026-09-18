import React, { useEffect, useState } from "react";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type PopupEngineProps = { variant: string };

/** ONE engine component for the "Popups" category. */
export function PopupEngine({ variant }: PopupEngineProps) {
  switch (variant) {
    case "cookie-consent-banner":
      return <CookieConsentBanner />;
    case "delayed-newsletter-popup":
      return <DelayedNewsletterPopup />;
    case "geolocation-permission-real":
      return <GeolocationPermissionReal />;
    case "error-popup-retry":
      return <ErrorPopupRetry />;
    case "enter-value-prompt":
      return <EnterValuePrompt />;
    case "accept-decline-popup":
      return <AcceptDeclinePopup />;
    case "network-lost-popup":
      return <NetworkLostPopup />;
    case "notification-permission-real":
      return <NotificationPermissionReal />;
    case "auto-closing-info-popup":
      return <AutoClosingInfoPopup />;
    case "nested-popup":
      return <NestedPopup />;
    case "native-alert":
      return <NativeAlert />;
    case "native-print-dialog":
      return <NativePrintDialog />;
    default:
      return <p className="text-sm text-red-600">Unknown popup variant: {variant}</p>;
  }
}

function CookieConsentBanner() {
  const { setField } = useChallengeField();
  const [remountKey, setRemountKey] = useState(0);

  return <CookieBannerInner key={remountKey} onRemount={() => setRemountKey((k) => k + 1)} setField={setField} />;
}

function CookieBannerInner({ onRemount, setField }: { onRemount: () => void; setField: (f: string, v: unknown) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("qalab_cookie_consent")) return;
    const timer = window.setTimeout(() => setVisible(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const accept = () => {
    sessionStorage.setItem("qalab_cookie_consent", "accepted");
    setVisible(false);
    setField("cookieConsent", "accepted");
  };

  return (
    <div className="space-y-3">
      {visible && (
        <div data-testid="cookie-consent-banner" className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-sm shadow-md">
          <span className="text-slate-600">We use cookies to improve your experience.</span>
          <Button size="sm" data-testid="accept-cookies-btn" onClick={accept}>Accept</Button>
        </div>
      )}
      {!visible && <p className="text-sm text-slate-500">(Banner dismissed or not yet shown)</p>}
      <Button size="sm" variant="secondary" data-testid="simulate-remount-btn" onClick={onRemount}>Simulate page remount</Button>
    </div>
  );
}

function DelayedNewsletterPopup() {
  const { setField } = useChallengeField();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("qalab_newsletter_dismissed")) return;
    const showTimer = window.setTimeout(() => setVisible(true), 2000);
    return () => window.clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const autoCloseTimer = window.setTimeout(() => setVisible(false), 8000);
    return () => window.clearTimeout(autoCloseTimer);
  }, [visible]);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem("qalab_newsletter_dismissed", "1");
    setField("newsletterPopupOpen", false);
  };

  return (
    <div>
      {visible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
          <div role="dialog" aria-modal="true" data-testid="newsletter-popup" className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Subscribe to our newsletter</h3>
              <button aria-label="Close" data-testid="close-newsletter-popup" onClick={close} className="text-slate-400 hover:text-slate-600">
                {"\u2715"}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">Get product updates delivered to your inbox.</p>
          </div>
        </div>
      )}
      {!visible && <p className="text-sm text-slate-500">(Popup not currently shown)</p>}
    </div>
  );
}

function PopupShell({ testId, children }: { testId: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div role="dialog" aria-modal="true" data-testid={testId} className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function GeolocationPermissionReal() {
  const { setField } = useChallengeField();
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "unsupported">("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number }>();
  const [browserDecision, setBrowserDecision] = useState<PermissionState>();

  useEffect(() => {
    // The native permission popup only appears while the browser's stored decision for this
    // origin is "prompt" — once you Allow/Block once, Chrome remembers it and never asks again.
    if (!("permissions" in navigator)) return;
    let permissionStatus: PermissionStatus | undefined;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        permissionStatus = result;
        setBrowserDecision(result.state);
        result.onchange = () => setBrowserDecision(result.state);
      })
      .catch(() => {});
    return () => {
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setStatus("granted");
        setField("locationPermission", "granted");
      },
      () => {
        setStatus("denied");
        setField("locationPermission", "denied");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        This calls the real <code>navigator.geolocation.getCurrentPosition()</code> API{" \u2014 no in-app popup is rendered by this page."}
      </p>
      {browserDecision && browserDecision !== "prompt" && (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" data-testid="permission-already-decided">
          Your browser already has a stored decision for this site: <strong>{browserDecision}</strong>. That's why no
          native popup appears &mdash; Chrome only shows the prompt while the permission state is "prompt" (not yet
          decided). To see the popup again, click the icon left of the address bar &rarr; Site settings &rarr; Location &rarr; Reset,
          then reload this page.
        </p>
      )}
      <Button size="sm" data-testid="get-location-btn" loading={status === "requesting"} onClick={requestLocation}>
        Get my location
      </Button>
      {status === "granted" && coords && (
        <p className="text-sm text-emerald-700" data-testid="location-result">
          Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
        </p>
      )}
      {status === "denied" && <p className="text-sm text-red-600" data-testid="location-result">Location access denied</p>}
      {status === "unsupported" && <p className="text-sm text-slate-500">Geolocation is not supported in this browser context.</p>}
    </div>
  );
}

function ErrorPopupRetry() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "error" | "saved">("idle");
  const [attempted, setAttempted] = useState(false);

  const save = () => {
    if (!attempted) {
      setAttempted(true);
      setState("error");
    } else {
      setState("saved");
      setField("saveStatus", "saved");
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="save-changes-btn" onClick={save} disabled={state === "saved"}>Save Changes</Button>
      {state === "saved" && <p className="text-sm text-emerald-700">Changes saved</p>}
      {state === "error" && (
        <PopupShell testId="save-error-popup">
          <h3 className="text-sm font-semibold text-red-700">Failed to save changes</h3>
          <p className="mt-1 text-sm text-slate-500">An unexpected error occurred while saving.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="ghost" data-testid="error-cancel-btn" onClick={() => setState("idle")}>Cancel</Button>
            <Button size="sm" variant="danger" data-testid="error-retry-btn" onClick={save}>Retry</Button>
          </div>
        </PopupShell>
      )}
    </div>
  );
}

function EnterValuePrompt() {
  const { setField } = useChallengeField();
  const [nickname, setNickname] = useState<string>();

  const askNickname = () => {
    const value = window.prompt("Enter your nickname");
    if (value !== null) {
      setNickname(value);
      setField("nickname", value);
    }
  };

  return (
    <div className="space-y-2">
      <Button size="sm" data-testid="set-nickname-btn" onClick={askNickname}>Set nickname</Button>
      <p className="text-sm text-slate-600" data-testid="nickname-display">
        {nickname !== undefined ? `Nickname: ${nickname}` : "No nickname set"}
      </p>
    </div>
  );
}

function AcceptDeclinePopup() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">("pending");

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="open-terms-popup-btn" onClick={() => setOpen(true)}>Review Terms Update</Button>
      {status === "declined" && <p className="text-sm text-red-600">Access restricted until you accept</p>}
      {status === "accepted" && <p className="text-sm text-emerald-700">Full access granted</p>}
      {open && (
        <PopupShell testId="terms-update-popup">
          <h3 className="text-sm font-semibold text-slate-900">Terms Update</h3>
          <p className="mt-1 text-sm text-slate-500">We've updated our terms of service. Please accept to continue.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="secondary" data-testid="decline-terms-btn" onClick={() => { setStatus("declined"); setField("termsAccepted", false); setOpen(false); }}>
              Decline
            </Button>
            <Button size="sm" data-testid="accept-terms-popup-btn" onClick={() => { setStatus("accepted"); setField("termsAccepted", true); setOpen(false); }}>
              Accept
            </Button>
          </div>
        </PopupShell>
      )}
    </div>
  );
}

function NetworkLostPopup() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "lost" | "synced">("idle");
  const [attempted, setAttempted] = useState(false);

  const sync = () => {
    if (!attempted) {
      setAttempted(true);
      setState("lost");
    } else {
      setState("synced");
      setField("syncStatus", "synced");
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="sync-data-btn" onClick={sync} disabled={state === "synced"}>Sync Data</Button>
      {state === "synced" && <p className="text-sm text-emerald-700">Data synced</p>}
      {state === "lost" && (
        <PopupShell testId="network-lost-popup">
          <h3 className="text-sm font-semibold text-slate-900">Connection lost</h3>
          <p className="mt-1 text-sm text-slate-500">We couldn't reach the server. Check your connection and retry.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="ghost" data-testid="network-cancel-btn" onClick={() => setState("idle")}>Cancel</Button>
            <Button size="sm" data-testid="network-retry-btn" onClick={sync}>Retry</Button>
          </div>
        </PopupShell>
      )}
    </div>
  );
}

function NotificationPermissionReal() {
  const { setField } = useChallengeField();
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "unsupported">("idle");
  const [browserDecision, setBrowserDecision] = useState<NotificationPermission>();

  useEffect(() => {
    if ("Notification" in window) setBrowserDecision(Notification.permission);
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    const result = await Notification.requestPermission();
    setBrowserDecision(result);
    setStatus(result === "granted" ? "granted" : "denied");
    setField("notificationPermission", result);
  };

  return (
    <div className="space-y-3">
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        This calls the real <code>Notification.requestPermission()</code> API{" \u2014 no in-app popup is rendered by this page."}
      </p>
      {browserDecision && browserDecision !== "default" && (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" data-testid="permission-already-decided">
          Your browser already has a stored decision for this site: <strong>{browserDecision}</strong>. That's why no
          native popup appears &mdash; browsers only prompt while the permission is still "default" (not yet decided).
          To see the popup again, click the icon left of the address bar &rarr; Site settings &rarr; Notifications &rarr; Reset,
          then reload this page.
        </p>
      )}
      <Button size="sm" data-testid="enable-notifications-btn" loading={status === "requesting"} onClick={requestNotifications}>
        Enable notifications
      </Button>
      {status === "granted" && <p className="text-sm text-emerald-700" data-testid="notification-result">Notifications enabled</p>}
      {status === "denied" && <p className="text-sm text-slate-500" data-testid="notification-result">Notifications blocked</p>}
      {status === "unsupported" && <p className="text-sm text-slate-500">Notifications are not supported in this browser context.</p>}
    </div>
  );
}

function AutoClosingInfoPopup() {
  const { setField } = useChallengeField();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      setField("infoPopupClosed", true);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [visible, setField]);

  const closeManually = () => {
    setVisible(false);
    setField("infoPopupClosed", true);
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="show-tip-btn" onClick={() => setVisible(true)}>Show tip</Button>
      {visible && (
        <div data-testid="info-popup" className="max-w-xs rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800 shadow-sm">
          <div className="flex items-start justify-between">
            <span>Tip: use keyboard shortcuts to navigate faster.</span>
            <button aria-label="Close" data-testid="close-info-popup-btn" onClick={closeManually} className="ml-2 text-brand-500 hover:text-brand-700">
              {"\u2715"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NestedPopup() {
  const { setField } = useChallengeField();
  const [warningOpen, setWarningOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [deleted, setDeleted] = useState(false);

  const confirmDeletion = () => {
    setDeleted(true);
    setWarningOpen(false);
    setConfirmOpen(false);
    setField("accountDeletionConfirmed", true);
  };

  if (deleted) return <p className="text-sm text-emerald-700">Account deletion confirmed.</p>;

  return (
    <div>
      <Button size="sm" variant="danger" data-testid="delete-account-btn" onClick={() => setWarningOpen(true)}>
        Delete Account
      </Button>
      {warningOpen && (
        <PopupShell testId="delete-warning-popup">
          <h3 className="text-sm font-semibold text-slate-900">Delete your account?</h3>
          <p className="mt-1 text-sm text-slate-500">This action is permanent and cannot be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="ghost" data-testid="warning-cancel-btn" onClick={() => setWarningOpen(false)}>Cancel</Button>
            <Button size="sm" variant="danger" data-testid="warning-continue-btn" onClick={() => setConfirmOpen(true)}>Continue</Button>
          </div>

          {confirmOpen && (
            <PopupShell testId="delete-confirm-popup">
              <h3 className="text-sm font-semibold text-slate-900">Type DELETE to confirm</h3>
              <input
                data-testid="delete-confirm-input"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="ghost" data-testid="confirm-cancel-btn" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button size="sm" variant="danger" data-testid="confirm-deletion-btn" disabled={typedText !== "DELETE"} onClick={confirmDeletion}>
                  Confirm Deletion
                </Button>
              </div>
            </PopupShell>
          )}
        </PopupShell>
      )}
    </div>
  );
}

function NativeAlert() {
  const { setField } = useChallengeField();
  const [dismissed, setDismissed] = useState(false);

  const showAlert = () => {
    window.alert("This is a real native browser alert, not a styled popup.");
    // window.alert() is synchronous/blocking — this line only runs after it's dismissed.
    setDismissed(true);
    setField("alertDismissed", true);
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="show-alert-btn" onClick={showAlert}>Show browser alert</Button>
      {dismissed && <p className="text-sm text-emerald-700" data-testid="alert-result">Native alert was shown and dismissed.</p>}
    </div>
  );
}

function NativePrintDialog() {
  const { setField } = useChallengeField();
  const [triggered, setTriggered] = useState(false);

  const printInvoice = () => {
    window.print();
    setTriggered(true);
    setField("printTriggered", true);
  };

  return (
    <div className="space-y-3">
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        This calls the real <code>window.print()</code> API. The native print dialog it opens is not part of
        the page's DOM and cannot be automated{" \u2014 tests should stub/spy on "}<code>window.print</code>{" instead of trying to interact with the dialog."}
      </p>
      <Button size="sm" data-testid="print-invoice-btn" onClick={printInvoice}>Print Invoice</Button>
      {triggered && <p className="text-sm text-emerald-700" data-testid="print-result">window.print() was called.</p>}
    </div>
  );
}
