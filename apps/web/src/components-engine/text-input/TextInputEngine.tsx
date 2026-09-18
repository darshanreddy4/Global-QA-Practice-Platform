import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/apiClient";
import { FormField, inputBaseClasses, inputErrorClasses, Badge } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type TextInputEngineProps = { variant: string };

/** ONE engine component for the entire "Input & Form Controls" category. */
export function TextInputEngine({ variant }: TextInputEngineProps) {
  switch (variant) {
    case "required-basic":
      return <RequiredBasic />;
    case "email-blur-validation":
      return <EmailBlurValidation />;
    case "password-strength":
      return <PasswordStrength />;
    case "number-range":
      return <NumberRange />;
    case "textarea-counter":
      return <TextareaCounter />;
    case "debounced-username-check":
      return <DebouncedUsernameCheck />;
    case "readonly-prefilled":
      return <ReadonlyPrefilled />;
    case "radio-reveals-fields":
      return <RadioRevealsFields />;
    case "min-max-char-length":
      return <MinMaxCharLength />;
    default:
      return <p className="text-sm text-red-600">Unknown text-input variant: {variant}</p>;
  }
}

function RequiredBasic() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const error = submitted && value.trim() === "" ? "Full name is required" : undefined;

  return (
    <form
      className="max-w-sm space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (value.trim() !== "") {
          setField("fullName", value);
          setSuccess(true);
        }
      }}
    >
      <FormField label="Full name" htmlFor="fullName" required error={error}>
        <input
          id="fullName"
          data-testid="full-name-input"
          className={`${inputBaseClasses} ${error ? inputErrorClasses : ""}`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSuccess(false);
          }}
        />
      </FormField>
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Save
        </button>
        {success && <Badge tone="success">Saved</Badge>}
      </div>
    </form>
  );
}

function EmailBlurValidation() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const [blurred, setBlurred] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  const error = blurred && !valid ? "Enter a valid corporate email" : undefined;

  return (
    <div className="max-w-sm">
      <FormField label="Corporate email" htmlFor="corpEmail" required error={error}>
        <input
          id="corpEmail"
          data-testid="corp-email-input"
          className={`${inputBaseClasses} ${error ? inputErrorClasses : ""}`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setField("email", e.target.value);
          }}
          onBlur={() => setBlurred(true)}
        />
      </FormField>
    </div>
  );
}

function PasswordStrength() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const strong = value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
  const label = value.length === 0 ? "\u2014" : strong ? "Strong" : "Weak";
  const tone = strong ? "success" : value.length > 0 ? "danger" : "neutral";

  return (
    <div className="max-w-sm">
      <FormField label="Password" htmlFor="pw" required hint="8+ chars, 1 uppercase, 1 number">
        <input
          id="pw"
          type="password"
          data-testid="password-input"
          className={inputBaseClasses}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setField("password", e.target.value);
          }}
        />
      </FormField>
      <div className="mt-2">
        <Badge tone={tone as any}>{label}</Badge>
      </div>
    </div>
  );
}

function NumberRange() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const [blurred, setBlurred] = useState(false);
  const numeric = Number(value);
  const inRange = value !== "" && numeric >= 1 && numeric <= 500;
  const error = blurred && !inRange ? "Quantity must be between 1 and 500" : undefined;

  return (
    <div className="max-w-xs">
      <FormField label="Quantity" htmlFor="qty" required error={error}>
        <input
          id="qty"
          type="number"
          data-testid="quantity-input"
          className={`${inputBaseClasses} ${error ? inputErrorClasses : ""}`}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "");
            setValue(v);
            setField("quantity", Number(v));
          }}
          onBlur={() => setBlurred(true)}
        />
      </FormField>
    </div>
  );
}

function TextareaCounter() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const max = 500;
  return (
    <div className="max-w-lg">
      <FormField label="Ticket description" htmlFor="desc" hint={`${value.length} / ${max}`}>
        <textarea
          id="desc"
          rows={4}
          maxLength={max}
          data-testid="ticket-description"
          className={inputBaseClasses}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setField("description", e.target.value);
          }}
        />
      </FormField>
    </div>
  );
}

function DebouncedUsernameCheck() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    if (!value) {
      setState("idle");
      return;
    }
    setState("checking");
    const handle = window.setTimeout(async () => {
      try {
        const result = await apiRequest<{ username: string; available: boolean }>(
          `/lab/username-availability?username=${encodeURIComponent(value)}`
        );
        const nextState = result.available ? "available" : "taken";
        setState(nextState);
        setField("availability", nextState);
      } catch {
        setState("idle");
      }
    }, 500);
    return () => window.clearTimeout(handle);
  }, [value, setField]);

  return (
    <div className="max-w-sm">
      <FormField label="Username" htmlFor="username" hint="Try 'admin' (taken) vs a new name (available)">
        <input
          id="username"
          data-testid="username-input"
          className={inputBaseClasses}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </FormField>
      <div className="mt-2">
        {state === "checking" && <Badge tone="info">{"Checking\u2026"}</Badge>}
        {state === "available" && <Badge tone="success">Available</Badge>}
        {state === "taken" && <Badge tone="danger">Taken</Badge>}
      </div>
    </div>
  );
}

function ReadonlyPrefilled() {
  const { setField } = useChallengeField();
  useEffect(() => setField("department", "Engineering"), [setField]);
  return (
    <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
      <FormField label="Employee ID" htmlFor="empId">
        <input id="empId" readOnly data-testid="employee-id-input" className={inputBaseClasses} value="EMP-10293" />
      </FormField>
      <FormField label="Fax Number (legacy)" htmlFor="fax">
        <input id="fax" disabled data-testid="fax-input" className={inputBaseClasses} value="+1 555 0100" />
      </FormField>
      <FormField label="Department" htmlFor="dept">
        <input id="dept" data-testid="department-input" className={inputBaseClasses} defaultValue="Engineering" />
      </FormField>
    </div>
  );
}

const INDIA_STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
];

function RadioRevealsFields() {
  const { setField } = useChallengeField();
  const [hasReferral, setHasReferral] = useState<"yes" | "no">("no");
  const [referralCode, setReferralCode] = useState("");
  const [isIndiaResident, setIsIndiaResident] = useState<"yes" | "no">("no");
  const [indiaState, setIndiaState] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

  const onChange = (value: "yes" | "no") => {
    setHasReferral(value);
    if (value === "no") {
      setReferralCode("");
      setField("referralCode", "");
    }
  };

  const onIndiaResidentChange = (value: "yes" | "no") => {
    setIsIndiaResident(value);
    setField("indiaResident", value);
    if (value === "no") {
      // Collapsing back to "No" discards the revealed fields entirely, same as the referral scenario above.
      setIndiaState("");
      setGender("");
      setField("indiaState", "");
      setField("gender", "");
      setField("visaRequired", "");
    } else {
      // A resident of India never needs a work visa for India — locked to "No", not user-editable.
      setField("visaRequired", "no");
    }
  };

  return (
    <div className="max-w-sm space-y-3">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">Do you have a referral code?</legend>
        <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="hasReferral" data-testid="referral-yes" checked={hasReferral === "yes"} onChange={() => onChange("yes")} />
          Yes
        </label>
        <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="hasReferral" data-testid="referral-no" checked={hasReferral === "no"} onChange={() => onChange("no")} />
          No
        </label>
      </fieldset>
      {hasReferral === "yes" && (
        <FormField label="Referral code" htmlFor="referralCode" required>
          <input
            id="referralCode"
            data-testid="referral-code-input"
            className={inputBaseClasses}
            value={referralCode}
            onChange={(e) => {
              setReferralCode(e.target.value);
              setField("referralCode", e.target.value);
            }}
          />
        </FormField>
      )}

      <fieldset className="border-t border-slate-100 pt-3">
        <legend className="mb-1.5 text-sm font-medium text-slate-700">Are you a resident of India?</legend>
        <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="indiaResident" data-testid="india-resident-yes" checked={isIndiaResident === "yes"} onChange={() => onIndiaResidentChange("yes")} />
          Yes
        </label>
        <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="indiaResident" data-testid="india-resident-no" checked={isIndiaResident === "no"} onChange={() => onIndiaResidentChange("no")} />
          No
        </label>
      </fieldset>

      {isIndiaResident === "yes" && (
        <>
          <FormField label="State" htmlFor="indiaState" required>
            <select
              id="indiaState"
              data-testid="india-state-select"
              className={inputBaseClasses}
              value={indiaState}
              onChange={(e) => {
                setIndiaState(e.target.value);
                setField("indiaState", e.target.value);
              }}
            >
              <option value="">Select state…</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Gender</legend>
            <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="gender" data-testid="gender-male" checked={gender === "male"} onChange={() => { setGender("male"); setField("gender", "male"); }} />
              Male
            </label>
            <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="gender" data-testid="gender-female" checked={gender === "female"} onChange={() => { setGender("female"); setField("gender", "female"); }} />
              Female
            </label>
            <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="gender" data-testid="gender-other" checked={gender === "other"} onChange={() => { setGender("other"); setField("gender", "other"); }} />
              Other
            </label>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Need visa to work in India?</legend>
            <p className="mb-1 text-xs text-slate-400">Locked — a resident of India never needs a work visa for India.</p>
            <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-400">
              <input type="radio" name="visaRequired" data-testid="visa-required-yes" checked={false} disabled readOnly />
              Yes
            </label>
            <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="visaRequired" data-testid="visa-required-no" checked disabled readOnly />
              No
            </label>
          </fieldset>
        </>
      )}
    </div>
  );
}

const SKU_MIN = 1;
const SKU_MAX = 200;

function MinMaxCharLength() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && value.trim().length === 0 ? "This field is required" : undefined;

  return (
    <form
      className="max-w-md space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (value.trim().length >= SKU_MIN) setField("skuDescription", value);
      }}
    >
      <FormField label="Product SKU description" htmlFor="skuDescription" required error={error} hint={`${value.length} / ${SKU_MAX}`}>
        <textarea
          id="skuDescription"
          rows={3}
          maxLength={SKU_MAX}
          data-testid="sku-description-input"
          className={`${inputBaseClasses} ${error ? inputErrorClasses : ""}`}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, SKU_MAX))}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            if (value.length + pasted.length > SKU_MAX) {
              e.preventDefault();
              setValue((value + pasted).slice(0, SKU_MAX));
            }
          }}
        />
      </FormField>
      <button type="submit" className="rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
        Save
      </button>
    </form>
  );
}
