import React, { useEffect, useMemo, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type DateTimeEngineProps = { variant: string };

/** ONE engine component for the "Date & Time Controls" category. */
export function DateTimeEngine({ variant }: DateTimeEngineProps) {
  switch (variant) {
    case "min-max-restriction":
      return <MinMaxRestriction />;
    case "date-range-picker":
      return <DateRangePicker />;
    case "dynamic-time-slots":
      return <DynamicTimeSlots />;
    case "multi-format-date-input":
      return <MultiFormatDateInput />;
    default:
      return <p className="text-sm text-red-600">Unknown date-time variant: {variant}</p>;
  }
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function MinMaxRestriction() {
  const { setField } = useChallengeField();
  const today = useMemo(() => new Date(), []);
  const min = toIso(today);
  const max = toIso(new Date(today.getTime() + 30 * 86400000));
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const onChange = (v: string) => {
    if (v && (v < min || v > max)) {
      setError("Date must be between today and +30 days");
      setValue("");
      return;
    }
    setError(undefined);
    setValue(v);
    setField("scheduledDate", v);
  };

  return (
    <div className="max-w-xs space-y-1.5">
      <label htmlFor="maintenanceDate" className="block text-sm font-medium text-slate-700">Schedule Maintenance</label>
      <input
        id="maintenanceDate"
        type="date"
        data-testid="maintenance-date-input"
        min={min}
        max={max}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function DateRangePicker() {
  const { setField } = useChallengeField();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
    return Math.round(diff);
  }, [checkIn, checkOut]);

  useEffect(() => setField("nights", nights), [nights, setField]);

  const onCheckOutChange = (v: string) => {
    if (checkIn && v <= checkIn) {
      const next = new Date(new Date(checkIn).getTime() + 86400000);
      setCheckOut(toIso(next));
      return;
    }
    setCheckOut(v);
  };

  return (
    <div className="flex max-w-md gap-4">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="checkIn" className="block text-sm font-medium text-slate-700">Check-in</label>
        <input id="checkIn" type="date" data-testid="check-in-input" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </div>
      <div className="flex-1 space-y-1.5">
        <label htmlFor="checkOut" className="block text-sm font-medium text-slate-700">Check-out</label>
        <input
          id="checkOut"
          type="date"
          data-testid="check-out-input"
          min={checkIn ? toIso(new Date(new Date(checkIn).getTime() + 86400000)) : undefined}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={checkOut}
          onChange={(e) => onCheckOutChange(e.target.value)}
        />
      </div>
      {nights > 0 && <p className="self-end pb-2 text-sm text-slate-500">{nights} night(s)</p>}
    </div>
  );
}

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Auto-generated business-hours grid (09:00-18:00, 30-min steps) instead of a
// short hardcoded list — this is what actually makes the slot set "dynamic".
const ALL_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const MIN_DURATION_MIN = 30;
const MAX_DURATION_MIN = 90;

function slotMinutes(slot: string): number {
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m;
}

function DynamicTimeSlots() {
  const { setField } = useChallengeField();
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [date, setDate] = useState(today);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  const isPastSlot = (slot: string) => {
    if (date > today) return false;
    if (date < today) return true;
    return new Date(`${date}T${slot}:00`).getTime() <= Date.now();
  };

  const onDateChange = (value: string) => {
    setDate(value);
    setCheckInTime("");
    setCheckOutTime("");
    setField("checkInTime", "");
    setField("checkOutTime", "");
  };

  const onCheckInSelect = (slot: string) => {
    setCheckInTime(slot);
    // Changing/choosing a new check-in always clears the check-out — the only
    // way to "redo" the appointment is via the check-in slot, per spec.
    setCheckOutTime("");
    setField("checkInTime", slot);
    setField("checkOutTime", "");
  };

  const onCheckOutSelect = (slot: string) => {
    setCheckOutTime(slot);
    setField("checkOutTime", slot);
    setField("appointmentDurationMinutes", slotMinutes(slot) - slotMinutes(checkInTime));
  };

  const duration = checkInTime && checkOutTime ? slotMinutes(checkOutTime) - slotMinutes(checkInTime) : null;

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="appointment-date">Date</label>
        <input
          id="appointment-date"
          type="date"
          data-testid="appointment-date-input"
          min={today}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Check-in time</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SLOTS.map((slot) => {
            const disabled = isPastSlot(slot);
            const active = checkInTime === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={disabled}
                data-testid={`checkin-slot-${slot.replace(":", "")}`}
                onClick={() => onCheckInSelect(slot)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  disabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                    : active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 text-slate-700 hover:border-brand-400"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-slate-400">Past date/time slots are automatically disabled.</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Check-out time</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SLOTS.map((slot) => {
            const gap = checkInTime ? slotMinutes(slot) - slotMinutes(checkInTime) : -1;
            const disabled = !checkInTime || gap < MIN_DURATION_MIN || gap > MAX_DURATION_MIN;
            const active = checkOutTime === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={disabled}
                data-testid={`checkout-slot-${slot.replace(":", "")}`}
                onClick={() => onCheckOutSelect(slot)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  disabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                    : active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 text-slate-700 hover:border-brand-400"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {checkInTime
            ? `Only slots ${MIN_DURATION_MIN}-${MAX_DURATION_MIN} minutes after ${checkInTime} are selectable. Pick a different check-in time to change this window.`
            : "Select a check-in time first."}
        </p>
      </div>

      {duration !== null && (
        <p className="text-sm font-medium text-slate-700" data-testid="appointment-duration">
          Appointment duration: {duration} minute(s)
        </p>
      )}
    </div>
  );
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Resolves numeric hyphenated dates as dd-mm-yyyy (day first) and accepts long-form month names. */
function parseFlexibleDate(input: string): string | null {
  const trimmed = input.trim();

  const numeric = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const year = Number(numeric[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const dayMonthYear = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dayMonthYear) {
    const monthIdx = MONTH_NAMES.indexOf(dayMonthYear[2].toLowerCase());
    if (monthIdx < 0) return null;
    return `${dayMonthYear[3]}-${String(monthIdx + 1).padStart(2, "0")}-${dayMonthYear[1].padStart(2, "0")}`;
  }

  const monthDayYear = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthDayYear) {
    const monthIdx = MONTH_NAMES.indexOf(monthDayYear[1].toLowerCase());
    if (monthIdx < 0) return null;
    return `${monthDayYear[3]}-${String(monthIdx + 1).padStart(2, "0")}-${monthDayYear[2].padStart(2, "0")}`;
  }

  return null;
}

function MultiFormatDateInput() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  const [normalized, setNormalized] = useState<string>();
  const [error, setError] = useState<string>();

  const onBlur = () => {
    if (!value.trim()) {
      setNormalized(undefined);
      setError(undefined);
      return;
    }
    const parsed = parseFlexibleDate(value);
    if (parsed) {
      setNormalized(parsed);
      setError(undefined);
      setField("normalizedDate", parsed);
    } else {
      setNormalized(undefined);
      setError("Unrecognized date format");
      setField("normalizedDate", "");
    }
  };

  return (
    <div className="max-w-sm space-y-1.5">
      <label htmlFor="dobInput" className="block text-sm font-medium text-slate-700">
        Date of birth <span className="text-xs font-normal text-slate-400">(dd-mm-yyyy, MM-DD-YYYY, or "06 July 1990")</span>
      </label>
      <input
        id="dobInput"
        data-testid="dob-input"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
      {normalized && <p data-testid="normalized-date" className="text-xs text-emerald-700">Normalized: {normalized}</p>}
    </div>
  );
}
