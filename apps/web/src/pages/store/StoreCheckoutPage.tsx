import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormField, inputBaseClasses } from "../../design-system";
import { useStoreCartStore } from "../../store/storeCartStore";
import { postStoreEvent } from "../../services/storeBroadcast";
import { getProduct } from "./storeData";

export function StoreCheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, placeOrder } = useStoreCartStore();
  const [shipping, setShipping] = useState({ fullName: "", address: "", city: "", postalCode: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "">("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });

  const lines = useMemo(
    () => cart.map((l) => ({ ...l, product: getProduct(l.productId) })).filter((l) => l.product),
    [cart]
  );
  const subtotal = lines.reduce((sum, l) => sum + l.product!.price * l.qty, 0);
  const shippingValid = Object.values(shipping).every((v) => v.trim().length > 0);

  const placeOrderNow = () => {
    if (!paymentMethod) return;
    const orderId = `ORD-${100000 + Math.floor(Math.random() * 899999)}`;
    const productNames = lines.map((l) => l.product!.name);
    placeOrder({
      orderId,
      total: subtotal,
      shippingFullName: shipping.fullName,
      shippingCity: shipping.city,
      paymentMethod,
    });
    postStoreEvent({
      type: "order-placed",
      orderId,
      total: subtotal,
      shippingFullName: shipping.fullName,
      shippingCity: shipping.city,
      paymentMethod,
      productNames,
    });
    clearCart();
    navigate(`/store/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto max-w-3xl">
          <span className="text-lg font-bold text-brand-700">AwesomeMart</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-6 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Checkout</h1>

        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm" data-testid="checkout-summary">
          {lines.map((l) => (
            <p key={l.productId}>{l.product!.emoji} {l.product!.name} {"\u00d7"} {l.qty} {"\u2014"} ${(l.product!.price * l.qty).toFixed(2)}</p>
          ))}
          <p className="mt-1 font-semibold">Total: ${subtotal.toFixed(2)}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="checkoutFullName" required>
            <input id="checkoutFullName" data-testid="checkout-fullname" className={inputBaseClasses} value={shipping.fullName} onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))} />
          </FormField>
          <FormField label="Phone" htmlFor="checkoutPhone" required>
            <input id="checkoutPhone" data-testid="checkout-phone" className={inputBaseClasses} value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} />
          </FormField>
          <FormField label="Address" htmlFor="checkoutAddress" required>
            <input id="checkoutAddress" data-testid="checkout-address" className={inputBaseClasses} value={shipping.address} onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))} />
          </FormField>
          <FormField label="City" htmlFor="checkoutCity" required>
            <input id="checkoutCity" data-testid="checkout-city" className={inputBaseClasses} value={shipping.city} onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))} />
          </FormField>
          <FormField label="Postal code" htmlFor="checkoutPostal" required>
            <input id="checkoutPostal" data-testid="checkout-postal" className={inputBaseClasses} value={shipping.postalCode} onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))} />
          </FormField>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Payment method</legend>
          {(["card", "upi", "cod"] as const).map((m) => (
            <label key={m} className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="checkoutPaymentMethod" data-testid={`checkout-payment-${m}`} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
              {m === "card" ? "Card" : m === "upi" ? "UPI" : "Cash on Delivery"}
            </label>
          ))}
        </fieldset>
        {paymentMethod === "card" && (
          <div className="grid gap-2 sm:grid-cols-3">
            <FormField label="Card number" htmlFor="checkoutCardNumber" required>
              <input id="checkoutCardNumber" data-testid="checkout-card-number" className={inputBaseClasses} value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} />
            </FormField>
            <FormField label="Expiry" htmlFor="checkoutCardExpiry" required>
              <input id="checkoutCardExpiry" data-testid="checkout-card-expiry" className={inputBaseClasses} value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} />
            </FormField>
            <FormField label="CVV" htmlFor="checkoutCardCvv" required>
              <input id="checkoutCardCvv" data-testid="checkout-card-cvv" className={inputBaseClasses} value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} />
            </FormField>
          </div>
        )}

        <Button disabled={!shippingValid || !paymentMethod || lines.length === 0} data-testid="checkout-place-order-btn" onClick={placeOrderNow}>
          Place Order
        </Button>
      </main>
    </div>
  );
}
