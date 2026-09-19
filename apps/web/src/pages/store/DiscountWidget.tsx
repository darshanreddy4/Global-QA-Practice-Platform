import React, { useEffect, useRef } from "react";

/**
 * Floating "chat" bubble whose panel \u2014 including the coupon code itself \u2014 lives
 * entirely inside a real open shadow root (same pattern as ShadowDomEngine). A plain
 * `document.querySelector` from the main document cannot see the coupon code text;
 * automation must pierce the shadow root (Playwright does this automatically through
 * CSS locators; Selenium needs `element.shadowRoot.findElement(...)`).
 */
class QaDiscountWidget extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        .bubble { position: fixed; bottom: 20px; right: 20px; z-index: 50; background: #2563eb; color: white;
          border: none; border-radius: 9999px; padding: 10px 16px; font: 13px system-ui, sans-serif; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .panel { position: fixed; bottom: 72px; right: 20px; z-index: 50; background: white; border: 1px solid #cbd5e1;
          border-radius: 8px; padding: 12px; font: 13px system-ui, sans-serif; width: 220px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; }
        .panel.open { display: block; }
        .code { font-weight: 600; color: #2563eb; }
      </style>
      <button class="bubble" data-testid="chat-widget-toggle" type="button">\u{1F4AC} Need a discount?</button>
      <div class="panel" data-testid="chat-widget-panel">
        <p>Hi! Use code <span class="code" data-testid="shadow-coupon-code">CHAT15</span> for 15% off your cart.</p>
      </div>
    `;
    const button = root.querySelector(".bubble")!;
    const panel = root.querySelector(".panel")!;
    button.addEventListener("click", () => panel.classList.toggle("open"));
  }
}

export function DiscountWidget() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customElements.get("qa-discount-widget")) customElements.define("qa-discount-widget", QaDiscountWidget);
  }, []);

  return (
    <div ref={hostRef}>
      {/* @ts-expect-error custom element not in JSX intrinsic types */}
      <qa-discount-widget data-testid="discount-widget-host" />
    </div>
  );
}
