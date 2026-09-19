import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormField, inputBaseClasses } from "../../design-system";
import { useStoreCartStore } from "../../store/storeCartStore";
import { postStoreEvent } from "../../services/storeBroadcast";
import { getProduct } from "./storeData";

const STATE_CITY_MAP: Record<string, string[]> = {
  Karnataka: ["Bengaluru", "Mysuru"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  Maharashtra: ["Mumbai", "Pune"],
};

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function StoreCheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, placeOrder } = useStoreCartStore();
  const [shippingFullName, setShippingFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "">("");

  // Real min/max constrained date picker (delivery must be 2-14 days out).
  const minDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return toInputDate(d);
  }, []);
  const maxDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return toInputDate(d);
  }, []);
  const [deliveryDate, setDeliveryDate] = useState("");

  const [giftWrap, setGiftWrap] = useState<"yes" | "no" | "">("");
  const [wrapColor, setWrapColor] = useState("");

  const lines = useMemo(
    () => cart.map((l) => ({ ...l, product: getProduct(l.productId) })).filter((l) => l.product),
    [cart]
  );
  const subtotal = lines.reduce((sum, l) => sum + l.product!.price * l.qty, 0);

  const shippingValid =
    shippingFullName.trim().length > 0 &&
    phone.trim().length > 0 &&
    address.trim().length > 0 &&
    !!state &&
    !!city &&
    postalCode.trim().length > 0 &&
    !!deliveryDate &&
    (giftWrap !== "yes" || !!wrapColor);

  const placeOrderNow = () => {
    if (!paymentMethod) return;
    const orderId = `ORD-${100000 + Math.floor(Math.random() * 899999)}`;
    const productNames = lines.map((l) => l.product!.name);
    placeOrder({
      orderId,
      total: subtotal,
      shippingFullName,
      shippingCity: city,
      paymentMethod,
    });
    postStoreEvent({
      type: "order-placed",
      orderId,
      total: subtotal,
      shippingFullName,
      shippingCity: city,
      paymentMethod,
      productNames,
      deliveryDate,
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
            <input id="checkoutFullName" data-testid="checkout-fullname" className={inputBaseClasses} value={shippingFullName} onChange={(e) => setShippingFullName(e.target.value)} />
          </FormField>
          <FormField label="Phone" htmlFor="checkoutPhone" required>
            <input id="checkoutPhone" data-testid="checkout-phone" className={inputBaseClasses} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label="Address" htmlFor="checkoutAddress" required>
            <input id="checkoutAddress" data-testid="checkout-address" className={inputBaseClasses} value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <FormField label="Postal code" htmlFor="checkoutPostal" required>
            <input id="checkoutPostal" data-testid="checkout-postal" className={inputBaseClasses} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </FormField>
          <FormField label="State" htmlFor="checkoutState" required>
            <select
              id="checkoutState"
              data-testid="checkout-state-select"
              className={inputBaseClasses}
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setCity("");
              }}
            >
              <option value="">{"Select state\u2026"}</option>
              {Object.keys(STATE_CITY_MAP).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
          <FormField label="City" htmlFor="checkoutCity" required hint={!state ? "Select a state first" : undefined}>
            <select
              id="checkoutCity"
              data-testid="checkout-city-select"
              className={inputBaseClasses}
              value={city}
              disabled={!state}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">{"Select city\u2026"}</option>
              {(STATE_CITY_MAP[state] ?? []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Preferred delivery date" htmlFor="deliveryDate" required hint={`Between ${minDeliveryDate} and ${maxDeliveryDate}`}>
            <input
              id="deliveryDate"
              type="date"
              data-testid="delivery-date-input"
              min={minDeliveryDate}
              max={maxDeliveryDate}
              className={inputBaseClasses}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </FormField>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Gift wrap?</legend>
          <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
            <input type="radio" name="giftWrap" data-testid="gift-wrap-yes" checked={giftWrap === "yes"} onChange={() => setGiftWrap("yes")} />
            Yes
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
            <input type="radio" name="giftWrap" data-testid="gift-wrap-no" checked={giftWrap === "no"} onChange={() => { setGiftWrap("no"); setWrapColor(""); }} />
            No
          </label>
        </fieldset>
        {giftWrap === "yes" && (
          <FormField label="Wrap color" htmlFor="wrapColor" required>
            <select id="wrapColor" data-testid="wrap-color-select" className={inputBaseClasses} value={wrapColor} onChange={(e) => setWrapColor(e.target.value)}>
              <option value="">{"Select color\u2026"}</option>
              <option>Red</option>
              <option>Gold</option>
              <option>Silver</option>
            </select>
          </FormField>
        )}

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
          <div>
            <p className="mb-1 text-xs text-slate-500">
              Secure card details are collected by a separate embedded payment provider {"\u2014"} the
              fields below live inside a real &lt;iframe&gt;, not this page.
            </p>
            <iframe
              title="Secure payment form"
              data-testid="payment-iframe"
              src="/store/payment-widget"
              style={{ width: "100%", height: 150, border: "1px solid #e2e8f0", borderRadius: 8 }}
            />
          </div>
        )}

        <Button disabled={!shippingValid || !paymentMethod || lines.length === 0} data-testid="checkout-place-order-btn" onClick={placeOrderNow}>
          Place Order
        </Button>
      </main>
    </div>
  );
}
