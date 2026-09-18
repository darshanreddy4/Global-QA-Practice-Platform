import React, { useEffect, useRef, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type IframeLabEngineProps = { variant: string };

/** ONE engine component for the "Iframe Laboratory" category. */
export function IframeLabEngine({ variant }: IframeLabEngineProps) {
  switch (variant) {
    case "input-in-iframe":
      return <InputInIframe />;
    case "triple-nested-iframe":
      return <TripleNestedIframe />;
    case "dropdown-in-iframe":
      return <DropdownInIframe />;
    default:
      return <p className="text-sm text-red-600">Unknown iframe-lab variant: {variant}</p>;
  }
}

const INPUT_IFRAME_HTML = `
  <label style="font: 13px system-ui; color:#334155;">Shipping notes
    <input id="notes" data-testid="iframe-shipping-notes" style="display:block;margin-top:4px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;width:220px;" />
  </label>
  <script>
    document.getElementById('notes').addEventListener('input', function () {
      parent.postMessage({ type: 'shipping-notes', value: this.value }, '*');
    });
  </script>
`;

function InputInIframe() {
  const { setField } = useChallengeField();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "shipping-notes") {
        setNotes(e.data.value);
        setField("shippingNotes", e.data.value);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setField]);

  return (
    <div>
      <iframe title="Shipping notes widget" data-testid="shipping-notes-iframe" srcDoc={INPUT_IFRAME_HTML} className="h-24 w-72 rounded-md border border-slate-200" />
      <p className="mt-2 text-xs text-slate-500">Parent summary: {notes || "\u2014"}</p>
    </div>
  );
}

const FRAME_C_HTML = `
  <button id="confirm" data-testid="frame-c-confirm-btn" style="font:13px system-ui;padding:6px 10px;border-radius:6px;border:1px solid #94a3b8;">Confirm</button>
  <p style="font:12px system-ui;color:#64748b;">Frame C (innermost)</p>
  <script>
    document.getElementById('confirm').addEventListener('click', function () {
      top.postMessage({ type: 'nested-confirm' }, '*');
    });
  </script>
`;

/** Escapes `</script>` so nesting HTML-with-scripts as a JS string literal doesn't prematurely close the outer <script> tag. */
function embedHtml(html: string) {
  return JSON.stringify(html).replace(/<\/script/gi, "<\\/script");
}

function buildFrameBHtml() {
  return `
    <p style="font:12px system-ui;color:#64748b;">Frame B</p>
    <script>
      const f = document.createElement('iframe');
      f.setAttribute('data-testid', 'frame-c');
      f.style.cssText = 'width:200px;height:90px;border:1px solid #cbd5e1;border-radius:6px;';
      f.srcdoc = ${embedHtml(FRAME_C_HTML)};
      document.body.appendChild(f);
    </script>
  `;
}

function buildFrameAHtml() {
  const frameBHtml = buildFrameBHtml();
  return `
    <p style="font:12px system-ui;color:#64748b;">Frame A</p>
    <script>
      const f = document.createElement('iframe');
      f.setAttribute('data-testid', 'frame-b');
      f.style.cssText = 'width:220px;height:130px;border:1px solid #cbd5e1;border-radius:6px;';
      f.srcdoc = ${embedHtml(frameBHtml)};
      document.body.appendChild(f);
    </script>
  `;
}

function TripleNestedIframe() {
  const { setField } = useChallengeField();
  const [confirmed, setConfirmed] = useState(false);
  const frameAHtml = useRef(buildFrameAHtml()).current;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "nested-confirm") {
        setConfirmed(true);
        setField("nestedConfirmed", true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setField]);

  return (
    <div>
      <iframe title="Frame A" data-testid="frame-a" srcDoc={frameAHtml} className="h-64 w-72 rounded-md border border-slate-200" />
      {confirmed && <p className="mt-2 text-sm text-emerald-700">Confirmation received from Frame C.</p>}
    </div>
  );
}

const DROPDOWN_IFRAME_HTML = `
  <label style="font:13px system-ui;color:#334155;">Preferred contact method
    <select id="contact" data-testid="iframe-contact-select" style="display:block;margin-top:4px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;">
      <option value="">Select...</option>
      <option value="Email">Email</option>
      <option value="Phone">Phone</option>
      <option value="SMS">SMS</option>
    </select>
  </label>
  <script>
    document.getElementById('contact').addEventListener('change', function () {
      parent.postMessage({ type: 'preferred-contact', value: this.value }, '*');
    });
  </script>
`;

function DropdownInIframe() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "preferred-contact") {
        setValue(e.data.value);
        setField("preferredContact", e.data.value);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setField]);

  return (
    <div>
      <iframe title="Contact preference widget" data-testid="contact-preference-iframe" srcDoc={DROPDOWN_IFRAME_HTML} className="h-24 w-72 rounded-md border border-slate-200" />
      <p className="mt-2 text-xs text-slate-500">Parent summary: {value || "\u2014"}</p>
    </div>
  );
}
