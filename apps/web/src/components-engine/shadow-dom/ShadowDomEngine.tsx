import React, { useEffect, useRef, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ShadowDomEngineProps = { variant: string };

/** ONE engine component for the "Shadow DOM" category. */
export function ShadowDomEngine({ variant }: ShadowDomEngineProps) {
  switch (variant) {
    case "input-in-open-shadow-dom":
      return <InputInOpenShadowDom />;
    case "nested-shadow-dom":
      return <NestedShadowDom />;
    default:
      return <p className="text-sm text-red-600">Unknown shadow-dom variant: {variant}</p>;
  }
}

class QaCouponField extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>input{padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font:13px system-ui;}</style>
      <input data-testid="coupon-input" placeholder="Coupon code" />
    `;
    const input = root.querySelector("input")!;
    input.addEventListener("input", () => {
      this.dispatchEvent(new CustomEvent("coupon-change", { detail: input.value, bubbles: true, composed: true }));
    });
  }
}

function InputInOpenShadowDom() {
  const { setField } = useChallengeField();
  const [applied, setApplied] = useState("");
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customElements.get("qa-coupon-field")) customElements.define("qa-coupon-field", QaCouponField);
    const el = hostRef.current;
    const onChange = (e: Event) => {
      const value = (e as CustomEvent<string>).detail;
      setApplied(value);
      setField("appliedCoupon", value);
    };
    el?.addEventListener("coupon-change", onChange);
    return () => el?.removeEventListener("coupon-change", onChange);
  }, [setField]);

  return (
    <div ref={hostRef}>
      {/* @ts-expect-error custom element not in JSX intrinsic types */}
      <qa-coupon-field data-testid="qa-coupon-field" />
      <p className="mt-2 text-sm text-slate-600">{applied ? `Coupon applied: ${applied}` : "No coupon applied"}</p>
    </div>
  );
}

class QaInnerWidget extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>button{padding:6px 10px;border-radius:6px;border:1px solid #94a3b8;font:13px system-ui;}</style>
      <button data-testid="inner-confirm-btn">Confirm</button>
    `;
    root.querySelector("button")!.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("confirm", { bubbles: true, composed: true }));
    });
  }
}

class QaOuterWidget extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<p style="font:12px system-ui;color:#64748b;">Outer widget shadow root</p>`;
    const inner = document.createElement("qa-inner-widget");
    inner.setAttribute("data-testid", "qa-inner-widget");
    root.appendChild(inner);
  }
}

function NestedShadowDom() {
  const { setField } = useChallengeField();
  const [confirmed, setConfirmed] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customElements.get("qa-inner-widget")) customElements.define("qa-inner-widget", QaInnerWidget);
    if (!customElements.get("qa-outer-widget")) customElements.define("qa-outer-widget", QaOuterWidget);
    const el = hostRef.current;
    const onConfirm = () => {
      setConfirmed(true);
      setField("nestedShadowConfirmed", true);
    };
    el?.addEventListener("confirm", onConfirm);
    return () => el?.removeEventListener("confirm", onConfirm);
  }, [setField]);

  return (
    <div ref={hostRef}>
      {/* @ts-expect-error custom element not in JSX intrinsic types */}
      <qa-outer-widget data-testid="qa-outer-widget" />
      {confirmed && <p className="mt-2 text-sm text-emerald-700">Confirmed via nested shadow roots.</p>}
    </div>
  );
}
