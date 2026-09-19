import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, FormField, inputBaseClasses } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";
import { STORE_CHANNEL_NAME, type StoreEvent } from "../../services/storeBroadcast";

export type MissionEngineProps = { variant: string };

/** ONE engine component for the entire "Real Applications" mini-app missions. */
export function MissionEngine({ variant }: MissionEngineProps) {
  switch (variant) {
    case "ecommerce-real-site":
      return <EcommerceRealSiteMission />;
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

// ================= E-Commerce: real separate storefront (opens a new tab) =================

type OrderRecord = { orderId: string; total: number; shippingCity: string; paymentMethod: string; productNames: string[]; cancelled: boolean };

function EcommerceRealSiteMission() {
  const { setField } = useChallengeField();
  const [log, setLog] = useState<string[]>([]);
  const [favoritedProductName, setFavoritedProductName] = useState("");
  const [cartLineCount, setCartLineCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [deliveryStatus, setDeliveryStatus] = useState("");

  useEffect(() => {
    const channel = new BroadcastChannel(STORE_CHANNEL_NAME);
    channel.onmessage = (e) => {
      const event = e.data as StoreEvent;
      setLog((l) => [...l, JSON.stringify(event)].slice(-10));
      if (event.type === "favorite" && event.favorited) {
        setFavoritedProductName(event.productName);
        setField("favoritedProductName", event.productName);
      }
      if (event.type === "cart-updated") {
        setCartLineCount(event.lineCount);
        setCartSubtotal(event.subtotal);
        setField("cartItemCount", event.lineCount);
      }
      if (event.type === "order-placed") {
        setOrders((prev) => [
          ...prev,
          { orderId: event.orderId, total: event.total, shippingCity: event.shippingCity, paymentMethod: event.paymentMethod, productNames: event.productNames, cancelled: false },
        ]);
      }
      if (event.type === "order-cancelled") {
        setOrders((prev) => prev.map((o) => (o.orderId === event.orderId ? { ...o, cancelled: true } : o)));
      }
      if (event.type === "delivery-status") {
        setDeliveryStatus(event.status);
        setField("deliveryStatus", event.status);
      }
    };
    return () => channel.close();
  }, [setField]);

  // Derive the "did any order get cancelled" + "what's the final (non-cancelled) order"
  // facts every time the order list changes \u2014 supports the two-order (place, cancel,
  // place again) scenario without the message handler needing to know the full history.
  useEffect(() => {
    setField("firstOrderCancelled", orders.some((o) => o.cancelled));
    const finalOrder = [...orders].reverse().find((o) => !o.cancelled);
    if (finalOrder) {
      setField("finalOrderPlaced", true);
      setField("finalOrderPaymentMethod", finalOrder.paymentMethod);
      setField("finalOrderProductNames", finalOrder.productNames.join(", "));
      setField("finalOrderCity", finalOrder.shippingCity);
    }
  }, [orders, setField]);

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-md border border-brand-100 bg-brand-50/40 p-4 text-sm text-slate-700">
        <p className="mb-2 font-semibold text-brand-800">A real, separate storefront</p>
        <p>
          AwesomeMart is a genuine multi-page e-commerce site (search &amp; category/price-range filters,
          wishlist, cart, checkout, order tracking + cancellation) running in its own browser tab {"\u2014"}{" "}
          not embedded on this page. Every milestone you complete there is reported back here in real time
          over a BroadcastChannel, exactly like a real cross-application integration a QA engineer might test.
        </p>
      </div>

      <Button data-testid="launch-store-btn" onClick={() => window.open("/store", "_blank")}>
        Open AwesomeMart in a new tab
      </Button>

      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm" data-testid="mission-progress">
        <p className="mb-2 font-medium text-slate-700">Live progress from AwesomeMart</p>
        <ul className="space-y-1">
          <li>Wishlisted product: <span data-testid="progress-favorited">{favoritedProductName || "\u2014"}</span></li>
          <li>Cart line items: <span data-testid="progress-cart-count">{cartLineCount}</span> (subtotal ${cartSubtotal.toFixed(2)})</li>
          <li>Delivery status: <span data-testid="progress-delivery-status">{deliveryStatus || "\u2014"}</span></li>
        </ul>
        {orders.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-2" data-testid="progress-orders">
            <p className="mb-1 font-medium text-slate-700">Orders placed</p>
            <ul className="space-y-1">
              {orders.map((o) => (
                <li key={o.orderId} data-testid={`progress-order-${o.orderId}`}>
                  {o.orderId}: {o.productNames.join(", ")} {"\u2014"} ${o.total.toFixed(2)} ({o.paymentMethod.toUpperCase()}, {o.shippingCity}){" "}
                  {o.cancelled ? <Badge tone="danger">Cancelled</Badge> : <Badge tone="success">Active</Badge>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {log.length > 0 && (
        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer">Raw event log ({log.length})</summary>
          <pre className="mt-1 overflow-auto rounded bg-slate-900 p-2 text-slate-100" data-testid="mission-activity-log">{log.join("\n")}</pre>
        </details>
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
