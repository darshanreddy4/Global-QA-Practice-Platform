import React, { useState } from "react";

/**
 * Standalone content meant to be embedded via <iframe src="/store/payment-widget">
 * on the checkout page \u2014 mirrors how real payment providers (Stripe Elements,
 * Razorpay, etc.) isolate card fields inside their own frame for PCI compliance.
 * Automation must switch into this frame (page.frameLocator() / driver.switchTo().frame())
 * to interact with these fields; they are NOT reachable from the parent document.
 */
export function StorePaymentWidgetFrame() {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const notifyParent = () => {
    window.parent.postMessage({ type: "qa-payment-widget:card-captured", hasNumber: number.trim().length > 0 }, "*");
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 12, fontSize: 13 }}>
      <label style={{ display: "block", marginBottom: 4, color: "#475569" }} htmlFor="iframeCardNumber">
        Card number
      </label>
      <input
        id="iframeCardNumber"
        data-testid="iframe-card-number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        onBlur={notifyParent}
        style={{ width: "100%", padding: "6px 8px", marginBottom: 8, border: "1px solid #cbd5e1", borderRadius: 6, boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 4, color: "#475569" }} htmlFor="iframeCardExpiry">
            Expiry (MM/YY)
          </label>
          <input
            id="iframeCardExpiry"
            data-testid="iframe-card-expiry"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 4, color: "#475569" }} htmlFor="iframeCardCvv">
            CVV
          </label>
          <input
            id="iframeCardCvv"
            data-testid="iframe-card-cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, boxSizing: "border-box" }}
          />
        </div>
      </div>
    </div>
  );
}
