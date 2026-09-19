import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../design-system";
import { useStoreCartStore } from "../../store/storeCartStore";
import { postStoreEvent } from "../../services/storeBroadcast";

const STAGES = ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export function StoreOrderTrackingPage() {
  const { orderId } = useParams();
  const { lastOrder } = useStoreCartStore();
  const [stageIndex, setStageIndex] = useState(0);

  const order = lastOrder?.orderId === orderId ? lastOrder : null;
  const status = STAGES[stageIndex];

  const advance = () => {
    const nextIndex = Math.min(STAGES.length - 1, stageIndex + 1);
    setStageIndex(nextIndex);
    if (orderId) {
      useStoreCartStore.getState().setDeliveryStatus(orderId, STAGES[nextIndex]);
      postStoreEvent({ type: "delivery-status", orderId, status: STAGES[nextIndex] });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <span className="text-lg font-bold text-brand-700">AwesomeMart</span>
          <Link to="/store" data-testid="back-to-store-link" className="text-sm text-brand-600 hover:underline">
            {"\u2190"} Back to store
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Order Confirmation</h1>
        <p className="text-sm text-slate-600" data-testid="tracking-order-id">Order ID: {orderId}</p>
        {order && (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>Shipping to: {order.shippingFullName}, {order.shippingCity}</p>
            <p>Payment: {order.paymentMethod.toUpperCase()}</p>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Delivery status</p>
          <div className="flex flex-wrap items-center gap-2" data-testid="delivery-status-stages">
            {STAGES.map((s, i) => (
              <span
                key={s}
                data-testid={`delivery-stage-${s.replace(/\s/g, "-")}`}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  i === stageIndex ? "bg-brand-600 text-white" : i < stageIndex ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-600" data-testid="current-delivery-status">Current status: {status}</p>
        </div>

        {status !== "Delivered" && (
          <Button data-testid="advance-status-btn" onClick={advance}>Advance to next status</Button>
        )}
        {status === "Delivered" && <p className="text-sm font-semibold text-emerald-700">Delivered! Order complete.</p>}
      </main>
    </div>
  );
}
