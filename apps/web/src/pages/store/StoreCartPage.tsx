import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../design-system";
import { useStoreCartStore } from "../../store/storeCartStore";
import { postStoreEvent } from "../../services/storeBroadcast";
import { getProduct } from "./storeData";

export function StoreCartPage() {
  const navigate = useNavigate();
  const { cart, setQty, removeFromCart } = useStoreCartStore();

  const lines = useMemo(
    () => cart.map((l) => ({ ...l, product: getProduct(l.productId) })).filter((l) => l.product),
    [cart]
  );
  const subtotal = lines.reduce((sum, l) => sum + (l.product!.price * l.qty), 0);

  const onQtyChange = (productId: string, qty: number) => {
    setQty(productId, qty);
    const next = useStoreCartStore.getState().cart;
    const nextSubtotal = next.reduce((sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
    postStoreEvent({ type: "cart-updated", lineCount: next.length, subtotal: nextSubtotal });
  };

  const onRemove = (productId: string) => {
    removeFromCart(productId);
    const next = useStoreCartStore.getState().cart;
    const nextSubtotal = next.reduce((sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
    postStoreEvent({ type: "cart-updated", lineCount: next.length, subtotal: nextSubtotal });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <span className="text-lg font-bold text-brand-700">AwesomeMart</span>
          <Link to="/store" data-testid="continue-shopping-link" className="text-sm text-brand-600 hover:underline">
            {"\u2190"} Continue shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="mb-4 text-lg font-semibold text-slate-900">Your Cart</h1>
        {lines.length === 0 ? (
          <p className="text-sm text-slate-400" data-testid="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <table className="w-full text-left text-sm" data-testid="cart-page-table">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Line total</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.productId} className="border-b border-slate-100">
                    <td className="py-1.5">{l.product!.emoji} {l.product!.name}</td>
                    <td className="py-1.5">${l.product!.price.toFixed(2)}</td>
                    <td className="py-1.5">
                      <input
                        type="number"
                        min={1}
                        data-testid={`cart-page-qty-${l.productId}`}
                        value={l.qty}
                        onChange={(e) => onQtyChange(l.productId, Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-1.5">${(l.product!.price * l.qty).toFixed(2)}</td>
                    <td className="py-1.5">
                      <button type="button" data-testid={`remove-from-cart-${l.productId}`} onClick={() => onRemove(l.productId)} className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-right text-base font-semibold text-slate-900" data-testid="cart-page-subtotal">
              Subtotal: ${subtotal.toFixed(2)}
            </p>
            <div className="mt-4 text-right">
              <Button data-testid="proceed-to-checkout-btn" onClick={() => navigate("/store/checkout")}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
