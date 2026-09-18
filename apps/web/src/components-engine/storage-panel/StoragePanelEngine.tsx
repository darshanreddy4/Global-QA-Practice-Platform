import React, { useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type StoragePanelEngineProps = { variant: string };

/** ONE engine component for the "Browser Storage" category. */
export function StoragePanelEngine({ variant }: StoragePanelEngineProps) {
  switch (variant) {
    case "localstorage-persistence":
      return <LocalStoragePersistence />;
    case "sessionstorage-cart":
      return <SessionStorageCart />;
    default:
      return <p className="text-sm text-red-600">Unknown storage-panel variant: {variant}</p>;
  }
}

function LocalStoragePersistence() {
  const [remountKey, setRemountKey] = useState(0);
  return <LocalStorageInner key={remountKey} onReload={() => setRemountKey((k) => k + 1)} />;
}

function LocalStorageInner({ onReload }: { onReload: () => void }) {
  const { setField } = useChallengeField();
  const [density, setDensity] = useState(() => localStorage.getItem("qalab_density") ?? "comfortable");

  const save = () => {
    localStorage.setItem("qalab_density", density);
  };

  const simulateReload = () => {
    const persisted = localStorage.getItem("qalab_density") ?? "comfortable";
    setField("densityPreference", persisted);
    onReload();
  };

  return (
    <div className="max-w-xs space-y-2">
      <label htmlFor="densitySelect" className="block text-sm font-medium text-slate-700">Density</label>
      <select id="densitySelect" data-testid="density-select" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" value={density} onChange={(e) => setDensity(e.target.value)}>
        <option value="comfortable">Comfortable</option>
        <option value="compact">Compact</option>
      </select>
      <div className="flex gap-2">
        <Button size="sm" data-testid="save-preference-btn" onClick={save}>Save preference</Button>
        <Button size="sm" variant="secondary" data-testid="simulate-reload-btn" onClick={simulateReload}>Simulate reload</Button>
      </div>
    </div>
  );
}

function SessionStorageCart() {
  const [remountKey, setRemountKey] = useState(0);
  return <SessionCartInner key={remountKey} onNewSession={() => setRemountKey((k) => k + 1)} />;
}

function SessionCartInner({ onNewSession }: { onNewSession: () => void }) {
  const { setField } = useChallengeField();
  const [cart, setCart] = useState<string[]>(() => JSON.parse(sessionStorage.getItem("qalab_cart") ?? "[]"));

  const addItem = () => {
    const next = [...cart, `Item ${cart.length + 1}`];
    sessionStorage.setItem("qalab_cart", JSON.stringify(next));
    setCart(next);
    setField("cartCount", next.length);
  };

  const simulateNewSession = () => {
    sessionStorage.removeItem("qalab_cart");
    setField("cartCount", 0);
    onNewSession();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button size="sm" data-testid="add-cart-item-btn" onClick={addItem}>Add item</Button>
        <Button size="sm" variant="secondary" data-testid="simulate-new-session-btn" onClick={simulateNewSession}>Simulate new session</Button>
        <Badge tone="info">Cart: {cart.length}</Badge>
      </div>
    </div>
  );
}
