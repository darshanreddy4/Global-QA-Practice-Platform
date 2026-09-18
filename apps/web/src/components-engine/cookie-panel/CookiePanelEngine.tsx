import React, { useEffect, useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type CookiePanelEngineProps = { variant: string };

/** ONE engine component for the "Cookies" category. Uses real, non-httpOnly document.cookie. */
export function CookiePanelEngine({ variant }: CookiePanelEngineProps) {
  switch (variant) {
    case "set-read-clear":
      return <SetReadClear />;
    case "expiring-cookie":
      return <ExpiringCookie />;
    default:
      return <p className="text-sm text-red-600">Unknown cookie-panel variant: {variant}</p>;
  }
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match?.split("=")[1];
}

function SetReadClear() {
  const { setField } = useChallengeField();
  const [readValue, setReadValue] = useState<string>();

  const setTheme = (theme: string) => {
    document.cookie = `qalab_theme=${theme}; path=/`;
  };

  const read = () => {
    setReadValue(readCookie("qalab_theme") ?? "");
  };

  const clear = () => {
    document.cookie = "qalab_theme=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setReadValue(readCookie("qalab_theme") ?? "");
    setField("themeCookieValue", readCookie("qalab_theme") ?? "");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" data-testid="set-theme-dark" onClick={() => setTheme("dark")}>Set Dark</Button>
        <Button size="sm" variant="secondary" data-testid="set-theme-light" onClick={() => setTheme("light")}>Set Light</Button>
        <Button size="sm" data-testid="read-cookie-btn" onClick={read}>Read Cookie</Button>
        <Button size="sm" variant="ghost" data-testid="clear-cookie-btn" onClick={clear}>Clear Cookie</Button>
      </div>
      {readValue !== undefined && (
        <p data-testid="cookie-readout" className="text-sm text-slate-600">
          qalab_theme = {readValue === "" ? "(not set)" : readValue}
        </p>
      )}
    </div>
  );
}

function ExpiringCookie() {
  const { setField } = useChallengeField();
  const [checked, setChecked] = useState(false);
  const [present, setPresent] = useState(false);

  useEffect(() => {
    if (!checked) return;
    document.cookie = "qalab_remember=1; path=/; max-age=5";
    setPresent(true);
    const interval = window.setInterval(() => {
      const stillPresent = document.cookie.includes("qalab_remember=");
      setPresent(stillPresent);
      if (!stillPresent) {
        setField("rememberCookieExpired", true);
        window.clearInterval(interval);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [checked, setField]);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" data-testid="remember-me-checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        Remember me (cookie expires in 5s)
      </label>
      {checked && (
        <span data-testid="remember-cookie-status">
          <Badge tone={present ? "success" : "neutral"}>{present ? "Cookie present" : "Cookie expired"}</Badge>
        </span>
      )}
    </div>
  );
}
