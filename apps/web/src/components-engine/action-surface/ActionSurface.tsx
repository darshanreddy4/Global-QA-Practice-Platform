import React, { useRef, useState } from "react";
import type { ChallengeDefinition } from "@qaplatform/shared";
import { Button, Badge, Card, CardBody } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ActionSurfaceProps = { variant: ChallengeDefinition["variant"] };

/** ONE engine component for the entire "Basic UI Actions" category — only `variant` differs. */
export function ActionSurface({ variant }: ActionSurfaceProps) {
  switch (variant) {
    case "click-counter":
      return <ClickCounter />;
    case "double-click":
      return <DoubleClickArchive />;
    case "right-click-context-menu":
      return <RightClickMenu />;
    case "hover-reveal":
      return <HoverReveal />;
    case "focus-blur-tracker":
      return <FocusBlurTracker />;
    case "enable-disable-toggle":
      return <EnableDisableToggle />;
    case "coordinate-click":
      return <CoordinateClick />;
    case "click-and-hold":
      return <ClickAndHold />;
    case "mouse-wheel-zoom":
      return <MouseWheelZoom />;
    default:
      return <p className="text-sm text-red-600">Unknown action-surface variant: {variant}</p>;
  }
}

function ClickCounter() {
  const { setField } = useChallengeField();
  const [count, setCount] = useState(0);
  const increment = () => {
    const next = count + 1;
    setCount(next);
    setField("counter", next);
  };
  return (
    <Card>
      <CardBody className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Open Tickets</p>
          <p className="text-2xl font-semibold text-slate-900" data-testid="ticket-counter">{count}</p>
        </div>
        <Button data-testid="new-ticket-btn" onClick={increment}>New Ticket</Button>
      </CardBody>
    </Card>
  );
}

function DoubleClickArchive() {
  const { setField } = useChallengeField();
  const [status, setStatus] = useState<"open" | "archived">("open");
  return (
    <Card>
      <CardBody>
        <div
          data-testid="invoice-row"
          data-status={status}
          onDoubleClick={() => {
            setStatus("archived");
            setField("rowStatus", "archived");
          }}
          className="flex cursor-default items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50"
        >
          <span className="font-mono text-sm text-slate-700">INV-2044</span>
          <Badge tone={status === "archived" ? "neutral" : "success"}>{status}</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

function RightClickMenu() {
  const { setField } = useChallengeField();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderIds, setOrderIds] = useState(["ORD-5521", "ORD-5522"]);

  const duplicate = () => {
    const next = [...orderIds, "ORD-5521-COPY"];
    setOrderIds(next);
    setField("orderIds", next);
    setMenuOpen(false);
  };

  return (
    <Card>
      <CardBody className="relative space-y-2">
        {orderIds.map((id) => (
          <div
            key={id}
            data-testid={`order-row-${id}`}
            onContextMenu={(e) => {
              e.preventDefault();
              if (id === "ORD-5521") setMenuOpen(true);
            }}
            className="rounded-md border border-slate-200 px-4 py-2 font-mono text-sm text-slate-700"
          >
            {id}
          </div>
        ))}
        {menuOpen && (
          <div
            data-testid="context-menu"
            className="absolute left-4 top-14 z-10 w-40 rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
          >
            <button className="block w-full px-3 py-1.5 text-left hover:bg-slate-50" onClick={duplicate} data-testid="context-menu-duplicate">
              Duplicate
            </button>
            <button className="block w-full px-3 py-1.5 text-left hover:bg-slate-50">Cancel</button>
            <button className="block w-full px-3 py-1.5 text-left hover:bg-slate-50">Export</button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function HoverReveal() {
  const { setField } = useChallengeField();
  const [hovered, setHovered] = useState(false);
  return (
    <Card>
      <CardBody>
        <div
          data-testid="employee-row"
          onMouseEnter={() => {
            setHovered(true);
            setField("actionsVisible", true);
          }}
          onMouseLeave={() => {
            setHovered(false);
            setField("actionsVisible", false);
          }}
          className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
        >
          <span className="text-sm text-slate-700">Priya Sharma &mdash; Senior QA Engineer</span>
          <div data-testid="row-actions" className={hovered ? "flex gap-2 opacity-100" : "flex gap-2 opacity-0"}>
            <Button size="sm" variant="ghost">Edit</Button>
            <Button size="sm" variant="ghost">Delete</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function FocusBlurTracker() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "focused" | "blurred">("idle");
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <input
          data-testid="global-search"
          placeholder="Search invoices, orders, employees..."
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
          onFocus={() => {
            setState("focused");
            setField("focusState", "focused");
          }}
          onBlur={() => {
            setState("blurred");
            setField("focusState", "blurred");
          }}
        />
        <Badge tone={state === "focused" ? "info" : "neutral"} >{state}</Badge>
      </CardBody>
    </Card>
  );
}

function EnableDisableToggle() {
  const { setField } = useChallengeField();
  const [reviewed, setReviewed] = useState(false);
  const [approved, setApproved] = useState(false);
  return (
    <Card>
      <CardBody className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            data-testid="reviewed-checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          I reviewed the receipt
        </label>
        <div className="flex items-center gap-3">
          <Button
            data-testid="approve-expense-btn"
            disabled={!reviewed}
            onClick={() => {
              setApproved(true);
              setField("approvalState", "approved");
            }}
          >
            Approve Expense
          </Button>
          {approved && <Badge tone="success">Approved</Badge>}
        </div>
      </CardBody>
    </Card>
  );
}

function CoordinateClick() {
  const { setField } = useChallengeField();
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  return (
    <Card>
      <CardBody>
        <div
          data-testid="heatmap-surface"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left);
            const y = Math.round(e.clientY - rect.top);
            setPoint({ x, y });
            setField("clickX", x);
            setField("clickY", y);
          }}
          className="relative h-[150px] w-[300px] cursor-crosshair rounded-md bg-gradient-to-br from-brand-100 via-slate-100 to-slate-200"
        >
          {point && (
            <span
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"
              style={{ left: point.x, top: point.y }}
            />
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500" data-testid="coordinate-readout">
          {point ? `x=${point.x}, y=${point.y}` : "Click anywhere on the surface"}
        </p>
      </CardBody>
    </Card>
  );
}

function ClickAndHold() {
  const { setField } = useChallengeField();
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "stopped">("idle");
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>();

  const tick = () => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(100, (elapsed / 1500) * 100);
    setProgress(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const onDown = () => {
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const onUp = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const elapsed = Date.now() - startRef.current;
    if (elapsed >= 1500) {
      setState("stopped");
      setField("stopState", "stopped");
    } else {
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <button
          data-testid="hold-to-stop-btn"
          onMouseDown={onDown}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          disabled={state === "stopped"}
          className="relative h-16 w-16 rounded-full border-4 border-red-200"
          style={{ background: `conic-gradient(#dc2626 ${progress * 3.6}deg, #fee2e2 0deg)` }}
        >
          <span className="absolute inset-1 flex items-center justify-center rounded-full bg-white text-[10px] font-semibold text-red-700">
            {state === "stopped" ? "STOPPED" : "HOLD"}
          </span>
        </button>
        <p className="text-sm text-slate-500">Hold for 1.5s to arm the emergency stop.</p>
      </CardBody>
    </Card>
  );
}

function MouseWheelZoom() {
  const { setField } = useChallengeField();
  const [zoom, setZoom] = useState(100);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const next = Math.min(300, Math.max(100, z + (e.deltaY < 0 ? 25 : -25)));
      setField("zoomLevel", next);
      return next;
    });
  };

  return (
    <Card>
      <CardBody>
        <div
          data-testid="zoomable-image"
          onWheel={onWheel}
          className="flex h-40 w-56 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100"
        >
          <span
            className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-200 text-xs font-medium text-brand-800 transition-transform"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            Product
          </span>
        </div>
        <Badge tone="info">Zoom: {zoom}%</Badge>
      </CardBody>
    </Card>
  );
}
