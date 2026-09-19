import React, { useMemo, useState } from "react";
import { Badge, Button, FormField, inputBaseClasses } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type MissionEngineProps = { variant: string };

/** ONE engine component for the entire "Real Applications" mini-app missions. */
export function MissionEngine({ variant }: MissionEngineProps) {
  switch (variant) {
    case "ecommerce-checkout":
      return <EcommerceCheckoutMission />;
    case "banking-fund-transfer":
      return <BankingFundTransferMission />;
    case "travel-flight-booking":
      return <TravelFlightBookingMission />;
    default:
      return <p className="text-sm text-red-600">Unknown mission variant: {variant}</p>;
  }
}

function StepHeader({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="mission-step-header">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              i === current ? "bg-brand-600 text-white" : i < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
            }`}
          >
            {i + 1}. {label}
          </span>
          {i < steps.length - 1 && <span aria-hidden="true" className="text-slate-300">{"\u2192"}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ================= E-Commerce Checkout Mission =================

type CartLine = { id: string; name: string; price: number; qty: number };

function EcommerceCheckoutMission() {
  const { setField } = useChallengeField();
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([
    { id: "mouse", name: "Wireless Mouse", price: 25, qty: 1 },
    { id: "keyboard", name: "Mechanical Keyboard", price: 65, qty: 1 },
    { id: "hub", name: "USB-C Hub", price: 30, qty: 1 },
  ]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [shipping, setShipping] = useState({ fullName: "", address: "", city: "", postalCode: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "">("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId] = useState(() => `ORD-${100000 + Math.floor(Math.random() * 899999)}`);

  const subtotal = useMemo(() => cart.reduce((sum, l) => sum + l.price * l.qty, 0), [cart]);
  const discount = appliedCoupon === "SAVE10" ? subtotal * 0.1 : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;

  const setQty = (id: string, qty: number) => {
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)));
  };

  const applyCoupon = () => {
    setAppliedCoupon(couponInput.trim().toUpperCase() === "SAVE10" ? "SAVE10" : null);
  };

  const shippingValid = Object.values(shipping).every((v) => v.trim().length > 0);

  const placeOrder = () => {
    setOrderPlaced(true);
    setField("shippingFullName", shipping.fullName);
    setField("shippingCity", shipping.city);
    setField("orderTotal", total);
    setField("paymentMethod", paymentMethod);
    setField("orderPlaced", true);
  };

  const steps = ["Cart", "Shipping", "Payment", "Confirmation"];

  return (
    <div className="max-w-xl">
      <StepHeader steps={steps} current={step} />

      {step === 0 && (
        <div className="space-y-3">
          <table className="w-full text-left text-sm" data-testid="cart-table">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Product</th>
                <th className="py-2">Price</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Line total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-1.5">{l.name}</td>
                  <td className="py-1.5">${l.price.toFixed(2)}</td>
                  <td className="py-1.5">
                    <input
                      type="number"
                      min={1}
                      data-testid={`cart-qty-${l.id}`}
                      value={l.qty}
                      onChange={(e) => setQty(l.id, Number(e.target.value))}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="py-1.5">${(l.price * l.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-2">
            <input
              data-testid="coupon-input"
              placeholder="Coupon code"
              className={inputBaseClasses}
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <Button size="sm" variant="secondary" data-testid="apply-coupon-btn" onClick={applyCoupon}>Apply</Button>
            {appliedCoupon && <Badge tone="success">SAVE10 applied</Badge>}
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm" data-testid="cart-summary">
            <p>Subtotal: <span data-testid="cart-subtotal">${subtotal.toFixed(2)}</span></p>
            <p>Discount: <span data-testid="cart-discount">${discount.toFixed(2)}</span></p>
            <p className="font-semibold">Total: <span data-testid="cart-total">${total.toFixed(2)}</span></p>
          </div>

          <Button data-testid="to-shipping-btn" onClick={() => setStep(1)}>Proceed to Shipping</Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <FormField label="Full name" htmlFor="shipFullName" required>
            <input id="shipFullName" data-testid="shipping-fullname" className={inputBaseClasses} value={shipping.fullName} onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))} />
          </FormField>
          <FormField label="Address" htmlFor="shipAddress" required>
            <input id="shipAddress" data-testid="shipping-address" className={inputBaseClasses} value={shipping.address} onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))} />
          </FormField>
          <FormField label="City" htmlFor="shipCity" required>
            <input id="shipCity" data-testid="shipping-city" className={inputBaseClasses} value={shipping.city} onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))} />
          </FormField>
          <FormField label="Postal code" htmlFor="shipPostal" required>
            <input id="shipPostal" data-testid="shipping-postal" className={inputBaseClasses} value={shipping.postalCode} onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))} />
          </FormField>
          <FormField label="Phone" htmlFor="shipPhone" required>
            <input id="shipPhone" data-testid="shipping-phone" className={inputBaseClasses} value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} />
          </FormField>
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="back-to-cart-btn" onClick={() => setStep(0)}>Back</Button>
            <Button disabled={!shippingValid} data-testid="to-payment-btn" onClick={() => setStep(2)}>Continue to Payment</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Payment method</legend>
            {(["card", "upi", "cod"] as const).map((m) => (
              <label key={m} className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
                <input type="radio" name="paymentMethod" data-testid={`payment-${m}`} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                {m === "card" ? "Card" : m === "upi" ? "UPI" : "Cash on Delivery"}
              </label>
            ))}
          </fieldset>
          {paymentMethod === "card" && (
            <div className="space-y-2">
              <FormField label="Card number" htmlFor="cardNumber" required>
                <input id="cardNumber" data-testid="card-number" className={inputBaseClasses} value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} />
              </FormField>
              <div className="flex gap-2">
                <FormField label="Expiry (MM/YY)" htmlFor="cardExpiry" required>
                  <input id="cardExpiry" data-testid="card-expiry" className={inputBaseClasses} value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} />
                </FormField>
                <FormField label="CVV" htmlFor="cardCvv" required>
                  <input id="cardCvv" data-testid="card-cvv" className={inputBaseClasses} value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} />
                </FormField>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="back-to-shipping-btn" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!paymentMethod} data-testid="place-order-btn" onClick={() => { placeOrder(); setStep(3); }}>Place Order</Button>
          </div>
        </div>
      )}

      {step === 3 && orderPlaced && (
        <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">Order confirmed!</p>
          <p className="text-sm text-emerald-700" data-testid="order-id">Order ID: {orderId}</p>
          <p className="text-sm text-emerald-700">Total charged: ${total.toFixed(2)}</p>
          <p className="text-sm text-emerald-700">Shipping to: {shipping.fullName}, {shipping.city}</p>
        </div>
      )}
    </div>
  );
}

// ================= Banking Fund Transfer Mission =================

const ACCOUNTS = [
  { id: "savings", label: "Savings \u2022\u2022\u2022\u20221234", balance: 5000 },
  { id: "current", label: "Current \u2022\u2022\u2022\u20225678", balance: 12000 },
];
const BENEFICIARIES = [
  { id: "ravi", name: "Ravi Kumar", label: "Ravi Kumar \u2022\u2022\u2022\u20229090" },
  { id: "meena", name: "Meena Shah", label: "Meena Shah \u2022\u2022\u2022\u20224455" },
];

function BankingFundTransferMission() {
  const { setField } = useChallengeField();
  const [step, setStep] = useState(0);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toBeneficiaryId, setToBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [balances, setBalances] = useState<Record<string, number>>(() =>
    Object.fromEntries(ACCOUNTS.map((a) => [a.id, a.balance]))
  );
  const [transferComplete, setTransferComplete] = useState(false);

  const fromAccount = ACCOUNTS.find((a) => a.id === fromAccountId);
  const toBeneficiary = BENEFICIARIES.find((b) => b.id === toBeneficiaryId);
  const amountNum = Number(amount);
  const amountValid = amountNum >= 100 && !!fromAccount && amountNum <= balances[fromAccountId];

  const sendOtp = () => {
    // Test-only convention (see Auth Lab): OTP is displayed directly so
    // automation can read and use it without needing SMS/email access.
    setOtp(String(100000 + Math.floor(Math.random() * 900000)));
  };

  const verifyAndTransfer = () => {
    if (!otp || otpInput !== otp || !fromAccount || !toBeneficiary) return;
    const newBalance = balances[fromAccountId] - amountNum;
    setBalances((b) => ({ ...b, [fromAccountId]: newBalance }));
    setTransferComplete(true);
    setField("transferAmount", amountNum);
    setField("toBeneficiary", toBeneficiary.name);
    setField("newFromBalance", newBalance);
    setField("otpVerified", true);
    setStep(4);
  };

  const steps = ["Accounts", "Amount", "Review & OTP", "Verify", "Done"];

  return (
    <div className="max-w-xl">
      <StepHeader steps={steps} current={step} />

      {step === 0 && (
        <div className="space-y-3">
          <FormField label="From account" htmlFor="fromAccount" required>
            <select id="fromAccount" data-testid="from-account-select" className={inputBaseClasses} value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
              <option value="">{"Select account\u2026"}</option>
              {ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.label} (${balances[a.id].toLocaleString()})</option>)}
            </select>
          </FormField>
          <FormField label="To beneficiary" htmlFor="toBeneficiary" required>
            <select id="toBeneficiary" data-testid="to-beneficiary-select" className={inputBaseClasses} value={toBeneficiaryId} onChange={(e) => setToBeneficiaryId(e.target.value)}>
              <option value="">{"Select beneficiary\u2026"}</option>
              {BENEFICIARIES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </FormField>
          <Button disabled={!fromAccountId || !toBeneficiaryId} data-testid="to-amount-btn" onClick={() => setStep(1)}>Continue</Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <FormField label="Amount (min $100)" htmlFor="transferAmount" required hint={fromAccount ? `Available: $${balances[fromAccountId].toLocaleString()}` : undefined}>
            <input id="transferAmount" type="number" data-testid="transfer-amount-input" className={inputBaseClasses} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
          {amount && !amountValid && <p className="text-xs text-red-600" data-testid="amount-error">Enter an amount between $100 and your available balance.</p>}
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="back-to-accounts-btn" onClick={() => setStep(0)}>Back</Button>
            <Button disabled={!amountValid} data-testid="to-review-btn" onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm" data-testid="transfer-summary">
            <p>From: {fromAccount?.label}</p>
            <p>To: {toBeneficiary?.label}</p>
            <p>Amount: ${amountNum.toLocaleString()}</p>
          </div>
          <Button data-testid="send-otp-btn" onClick={() => { sendOtp(); setStep(3); }}>Send OTP</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {otp && <p className="text-xs text-slate-400" data-testid="otp-display">Test-only OTP (would be sent via SMS in production): <span className="font-mono font-semibold">{otp}</span></p>}
          <FormField label="Enter OTP" htmlFor="otpInput" required>
            <input id="otpInput" data-testid="otp-input" className={inputBaseClasses} value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
          </FormField>
          <Button data-testid="verify-transfer-btn" onClick={verifyAndTransfer}>Verify & Transfer</Button>
        </div>
      )}

      {step === 4 && transferComplete && (
        <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">Transfer complete!</p>
          <p className="text-sm text-emerald-700" data-testid="new-balance">New {fromAccount?.label} balance: ${balances[fromAccountId].toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// ================= Travel Flight Booking Mission =================

const FLIGHTS = [
  { number: "6E-202", airline: "IndiGo", time: "06:00", price: 120 },
  { number: "AI-505", airline: "Air India", time: "09:30", price: 145 },
  { number: "UK-811", airline: "Vistara", time: "14:15", price: 110 },
  { number: "SG-330", airline: "SpiceJet", time: "19:45", price: 135 },
];

function TravelFlightBookingMission() {
  const { setField } = useChallengeField();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [searched, setSearched] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [passenger, setPassenger] = useState({ name: "", age: "" });
  const [seatPreference, setSeatPreference] = useState<"window" | "middle" | "aisle" | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "">("");
  const [upiId, setUpiId] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [pnr] = useState(() => `PNR${Math.floor(100000 + Math.random() * 900000)}`);

  const sortedFlights = useMemo(() => {
    if (!sortDir) return FLIGHTS;
    return [...FLIGHTS].sort((a, b) => (sortDir === "asc" ? a.price - b.price : b.price - a.price));
  }, [sortDir]);

  const passengerValid = passenger.name.trim().length > 0 && Number(passenger.age) > 0 && !!seatPreference;

  const confirmBooking = () => {
    const flight = FLIGHTS.find((f) => f.number === selectedFlight);
    setBookingConfirmed(true);
    setField("selectedFlightNumber", flight?.number ?? "");
    setField("passengerName", passenger.name);
    setField("seatPreference", seatPreference);
    setField("paymentMethod", paymentMethod);
    setField("bookingConfirmed", true);
  };

  const steps = ["Search", "Select Flight", "Passenger", "Payment", "Confirmation"];

  return (
    <div className="max-w-xl">
      <StepHeader steps={steps} current={step} />

      {step === 0 && (
        <div className="space-y-3">
          <FormField label="From" htmlFor="fromCity" required>
            <select id="fromCity" data-testid="from-city-select" className={inputBaseClasses} value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">{"Select city\u2026"}</option>
              <option>Bengaluru</option>
              <option>Delhi</option>
              <option>Mumbai</option>
            </select>
          </FormField>
          <FormField label="To" htmlFor="toCity" required>
            <select id="toCity" data-testid="to-city-select" className={inputBaseClasses} value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">{"Select city\u2026"}</option>
              <option>Bengaluru</option>
              <option>Delhi</option>
              <option>Mumbai</option>
            </select>
          </FormField>
          <FormField label="Date" htmlFor="travelDate" required>
            <input id="travelDate" type="date" data-testid="travel-date-input" className={inputBaseClasses} value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <Button disabled={!from || !to || !date} data-testid="search-flights-btn" onClick={() => { setSearched(true); setStep(1); }}>Search Flights</Button>
        </div>
      )}

      {step === 1 && searched && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort by price:</span>
            <button type="button" data-testid="sort-price-asc" aria-pressed={sortDir === "asc"} onClick={() => setSortDir("asc")} className={`rounded px-2 py-1 text-xs ${sortDir === "asc" ? "bg-brand-100 text-brand-700" : "hover:bg-slate-100"}`}>{"\u2191 Low to High"}</button>
            <button type="button" data-testid="sort-price-desc" aria-pressed={sortDir === "desc"} onClick={() => setSortDir("desc")} className={`rounded px-2 py-1 text-xs ${sortDir === "desc" ? "bg-brand-100 text-brand-700" : "hover:bg-slate-100"}`}>{"\u2193 High to Low"}</button>
          </div>
          <table className="w-full text-left text-sm" data-testid="flights-table">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Flight</th>
                <th className="py-2">Airline</th>
                <th className="py-2">Time</th>
                <th className="py-2">Price</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedFlights.map((f) => (
                <tr key={f.number} className="border-b border-slate-100">
                  <td className="py-1.5">{f.number}</td>
                  <td className="py-1.5">{f.airline}</td>
                  <td className="py-1.5">{f.time}</td>
                  <td className="py-1.5">${f.price}</td>
                  <td className="py-1.5">
                    <button
                      type="button"
                      data-testid={`select-flight-${f.number}`}
                      onClick={() => setSelectedFlight(f.number)}
                      className={`rounded-md border px-2 py-1 text-xs ${selectedFlight === f.number ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-slate-700 hover:border-brand-400"}`}
                    >
                      {selectedFlight === f.number ? "Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="back-to-search-btn" onClick={() => setStep(0)}>Back</Button>
            <Button disabled={!selectedFlight} data-testid="to-passenger-btn" onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <FormField label="Full name" htmlFor="passengerName" required>
            <input id="passengerName" data-testid="passenger-name" className={inputBaseClasses} value={passenger.name} onChange={(e) => setPassenger((p) => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="Age" htmlFor="passengerAge" required>
            <input id="passengerAge" type="number" data-testid="passenger-age" className={inputBaseClasses} value={passenger.age} onChange={(e) => setPassenger((p) => ({ ...p, age: e.target.value }))} />
          </FormField>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Seat preference</legend>
            {(["window", "middle", "aisle"] as const).map((s) => (
              <label key={s} className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
                <input type="radio" name="seatPreference" data-testid={`seat-${s}`} checked={seatPreference === s} onChange={() => setSeatPreference(s)} />
                {s[0].toUpperCase() + s.slice(1)}
              </label>
            ))}
          </fieldset>
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="back-to-flights-btn" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!passengerValid} data-testid="to-travel-payment-btn" onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Payment method</legend>
            {(["card", "upi"] as const).map((m) => (
              <label key={m} className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
                <input type="radio" name="travelPaymentMethod" data-testid={`travel-payment-${m}`} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                {m === "card" ? "Card" : "UPI"}
              </label>
            ))}
          </fieldset>
          {paymentMethod === "upi" && (
            <FormField label="UPI ID" htmlFor="upiId" required>
              <input id="upiId" data-testid="upi-id-input" className={inputBaseClasses} value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </FormField>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="back-to-passenger-btn" onClick={() => setStep(2)}>Back</Button>
            <Button disabled={!paymentMethod || (paymentMethod === "upi" && !upiId)} data-testid="confirm-booking-btn" onClick={() => { confirmBooking(); setStep(4); }}>Confirm Booking</Button>
          </div>
        </div>
      )}

      {step === 4 && bookingConfirmed && (
        <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">Booking confirmed!</p>
          <p className="text-sm text-emerald-700" data-testid="pnr-code">PNR: {pnr}</p>
          <p className="text-sm text-emerald-700">Flight {selectedFlight} {"\u2014"} {passenger.name}, seat: {seatPreference}</p>
        </div>
      )}
    </div>
  );
}
