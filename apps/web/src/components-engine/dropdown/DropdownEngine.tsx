import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GeoCity, GeoCountry, GeoState } from "@qaplatform/shared";
import { apiRequest, ApiError } from "../../services/apiClient";
import { Badge, Button, ErrorState, LoadingState } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type DropdownEngineProps = { variant: string };

/** ONE engine component for the entire "Dropdowns & Selection Controls" category. */
export function DropdownEngine({ variant }: DropdownEngineProps) {
  switch (variant) {
    case "static-single":
      return <StaticSingle />;
    case "static-multi":
      return <StaticMulti />;
    case "searchable-single":
      return <SearchableSingle />;
    case "api-departments":
      return <ApiDepartments />;
    case "dependent-geo":
      return <DependentGeo />;
    case "grouped-disabled":
      return <GroupedDisabled />;
    case "radio-enables-dropdown":
      return <RadioEnablesDropdown />;
    case "parent-changes-child-options":
      return <ParentChangesChildOptions />;
    case "type-to-create-from-textfield":
      return <TypeToCreateFromTextfield />;
    case "click-to-load-delayed":
      return <ClickToLoadDelayed />;
    default:
      return <p className="text-sm text-red-600">Unknown dropdown variant: {variant}</p>;
  }
}

const selectClasses =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-400";

function StaticSingle() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  return (
    <div className="max-w-xs">
      <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-slate-700">Ticket priority</label>
      <select
        id="priority"
        data-testid="priority-select"
        className={selectClasses}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setField("priority", e.target.value);
        }}
      >
        <option value="" disabled>Select priority</option>
        {["Low", "Medium", "High", "Critical"].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      {value && <Badge tone="info">{value}</Badge>}
    </div>
  );
}

const REVIEWERS = ["Priya Sharma", "Wei Chen", "Amara Okafor", "Diego Fernandez", "Sara Lindqvist", "Rohan Mehta"];

function StaticMulti() {
  const { setField } = useChallengeField();
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const commit = (next: string[]) => {
    setSelected(next);
    setField("reviewers", next);
  };

  // Close the dropdown panel on outside click / Escape, like a real multi-select.
  useEffect(() => {
    if (!open) return;
    const onDocumentMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const summary =
    selected.length === 0 ? "Select reviewers…" : selected.length === 1 ? selected[0] : `${selected.length} reviewers selected`;

  return (
    <div className="max-w-sm space-y-2" ref={containerRef}>
      <p className="text-sm font-medium text-slate-700">Assign reviewers</p>
      <div className="relative">
        <button
          type="button"
          data-testid="reviewers-dropdown-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm hover:border-slate-400"
        >
          <span className={selected.length === 0 ? "text-slate-400" : ""}>{summary}</span>
          <span aria-hidden="true" className="text-slate-400">{open ? "\u25b4" : "\u25be"}</span>
        </button>

        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            data-testid="reviewers-dropdown-panel"
            className="absolute z-10 mt-1 w-full rounded-md border border-slate-300 bg-white p-2 shadow-lg"
          >
            {REVIEWERS.map((name) => (
              <label key={name} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  data-testid={`reviewer-${name.replace(/\s/g, "-")}`}
                  checked={selected.includes(name)}
                  onChange={(e) =>
                    commit(e.target.checked ? [...selected, name] : selected.filter((n) => n !== name))
                  }
                />
                {name}
              </label>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-2">
              <Button size="sm" variant="secondary" data-testid="select-all" onClick={() => commit(REVIEWERS)}>Select All</Button>
              <Button size="sm" variant="secondary" data-testid="clear-all" onClick={() => commit([])}>Clear All</Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5" data-testid="reviewer-chips">
        {selected.map((s) => <Badge key={s} tone="info">{s}</Badge>)}
      </div>
    </div>
  );
}

const PRODUCTS = Array.from({ length: 500 }, (_, i) => `Product ${i + 1}`).concat([
  "Wireless Mechanical Keyboard",
  "Wireless Ergonomic Mouse",
]);

function SearchableSingle() {
  const { setField } = useChallengeField();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const filtered = useMemo(
    () => (query ? PRODUCTS.filter((p) => p.toLowerCase().includes(query.toLowerCase())) : []),
    [query]
  );

  return (
    <div className="max-w-sm">
      <label htmlFor="productSearch" className="mb-1.5 block text-sm font-medium text-slate-700">Search products</label>
      <input
        id="productSearch"
        data-testid="product-search-input"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Type to search…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected("");
        }}
      />
      {query && (
        <ul data-testid="product-options" className="mt-1 max-h-40 overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-sm">
          {filtered.length === 0 && <li className="px-3 py-2 text-slate-400">No matching products</li>}
          {filtered.slice(0, 8).map((p) => (
            <li
              key={p}
              data-testid={`product-option-${p.replace(/\s/g, "-")}`}
              className="cursor-pointer px-3 py-1.5 hover:bg-brand-50"
              onClick={() => {
                setSelected(p);
                setQuery(p);
                setField("selectedProduct", p);
              }}
            >
              {p}
            </li>
          ))}
        </ul>
      )}
      {selected && <p className="mt-2 text-sm text-slate-600">Selected: <strong>{selected}</strong></p>}
    </div>
  );
}

function ApiDepartments() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "error" | "loaded">("idle");
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [errorDetail, setErrorDetail] = useState("");

  const load = async () => {
    setState("loading");
    try {
      const data = await apiRequest<string[]>("/lab/departments");
      setOptions(data);
      setState("loaded");
    } catch (e) {
      setErrorDetail(e instanceof ApiError ? e.detail : "Unknown error");
      setState("error");
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && state === "idle") void load();
  };

  return (
    <div className="max-w-sm">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
      <button
        type="button"
        data-testid="department-dropdown-trigger"
        onClick={toggle}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm"
      >
        {selected || "Select department\u2026"}
      </button>
      {open && (
        <div className="mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          {state === "loading" && <LoadingState label="Loading departments\u2026" />}
          {state === "error" && <ErrorState title="Failed to load departments" detail={errorDetail} onRetry={load} />}
          {state === "loaded" && (
            <ul data-testid="department-options">
              {options.map((d) => (
                <li
                  key={d}
                  data-testid={`department-option-${d.replace(/\s/g, "-")}`}
                  className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-brand-50"
                  onClick={() => {
                    setSelected(d);
                    setField("department", d);
                    setOpen(false);
                  }}
                >
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Flagship dependent dropdown: Country -> State -> City, each backed by a real API call. */
function DependentGeo() {
  const { setField } = useChallengeField();

  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [states, setStates] = useState<GeoState[]>([]);
  const [cities, setCities] = useState<GeoCity[]>([]);

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [statesStatus, setStatesStatus] = useState<"idle" | "loading" | "loaded">("idle");
  const [citiesStatus, setCitiesStatus] = useState<"idle" | "loading" | "loaded">("idle");

  useEffect(() => {
    apiRequest<GeoCountry[]>("/geo/countries").then(setCountries);
  }, []);

  const onCountryChange = async (code: string) => {
    setCountry(code);
    setState("");
    setCity("");
    setStates([]);
    setCities([]);
    setField("country", countries.find((c) => c.code === code)?.name ?? "");
    setField("state", "");
    setField("availableCities", []);
    if (!code) return;
    setStatesStatus("loading");
    const data = await apiRequest<GeoState[]>(`/geo/states?country=${code}`);
    setStates(data);
    setStatesStatus("loaded");
  };

  const onStateChange = async (code: string) => {
    setState(code);
    setCity("");
    setCities([]);
    setField("state", states.find((s) => s.code === code)?.name ?? "");
    setField("availableCities", []);
    if (!code) return;
    setCitiesStatus("loading");
    const data = await apiRequest<GeoCity[]>(`/geo/cities?state=${code}`);
    setCities(data);
    setField("availableCities", data.map((c) => c.name));
    setCitiesStatus("loaded");
  };

  return (
    <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="geo-country" className="mb-1.5 block text-sm font-medium text-slate-700">Country</label>
        <select id="geo-country" data-testid="geo-country-select" className={selectClasses} value={country} onChange={(e) => onCountryChange(e.target.value)}>
          <option value="">{"Select country\u2026"}</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="geo-state" className="mb-1.5 block text-sm font-medium text-slate-700">State</label>
        <select
          id="geo-state"
          data-testid="geo-state-select"
          className={selectClasses}
          value={state}
          disabled={!country}
          onChange={(e) => onStateChange(e.target.value)}
        >
          <option value="">{statesStatus === "loading" ? "Loading\u2026" : "Select state\u2026"}</option>
          {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="geo-city" className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
        <select
          id="geo-city"
          data-testid="geo-city-select"
          className={selectClasses}
          value={city}
          disabled={!state}
          onChange={(e) => {
            setCity(e.target.value);
            setField("city", cities.find((c) => c.id === e.target.value)?.name ?? "");
          }}
        >
          <option value="">{citiesStatus === "loading" ? "Loading\u2026" : "Select city\u2026"}</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </div>
  );
}

function GroupedDisabled() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState("");
  return (
    <div className="max-w-xs">
      <label htmlFor="shipping" className="mb-1.5 block text-sm font-medium text-slate-700">Shipping method</label>
      <select
        id="shipping"
        data-testid="shipping-select"
        className={selectClasses}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setField("shippingMethod", e.target.value);
        }}
      >
        <option value="" disabled>{"Select method\u2026"}</option>
        <optgroup label="Domestic">
          <option value="Same-Day (Domestic)" disabled>Same-Day (Domestic) &mdash; unavailable</option>
          <option value="Standard (Domestic)">Standard (Domestic)</option>
        </optgroup>
        <optgroup label="International">
          <option value="Standard (International)">Standard (International)</option>
          <option value="Express (International)">Express (International)</option>
        </optgroup>
      </select>
    </div>
  );
}

const APPROVERS = ["Priya Sharma", "Wei Chen", "Amara Okafor"];

function RadioEnablesDropdown() {
  const { setField } = useChallengeField();
  const [requiresApproval, setRequiresApproval] = useState<"yes" | "no">("no");
  const [approver, setApprover] = useState("");

  const onRadioChange = (value: "yes" | "no") => {
    setRequiresApproval(value);
    if (value === "no") {
      setApprover("");
      setField("approver", "");
    }
  };

  return (
    <div className="max-w-sm space-y-3">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">Requires manager approval?</legend>
        <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="requiresApproval" data-testid="approval-yes" checked={requiresApproval === "yes"} onChange={() => onRadioChange("yes")} />
          Yes
        </label>
        <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" name="requiresApproval" data-testid="approval-no" checked={requiresApproval === "no"} onChange={() => onRadioChange("no")} />
          No
        </label>
      </fieldset>
      <div>
        <label htmlFor="approverSelect" className="mb-1.5 block text-sm font-medium text-slate-700">Approver</label>
        <select
          id="approverSelect"
          data-testid="approver-select"
          className={selectClasses}
          disabled={requiresApproval === "no"}
          value={approver}
          onChange={(e) => {
            setApprover(e.target.value);
            setField("approver", e.target.value);
          }}
        >
          <option value="">{"Select approver\u2026"}</option>
          {APPROVERS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
}

const LEAVE_REASONS: Record<string, string[]> = {
  Sick: ["Illness", "Medical Appointment", "Family Care"],
  Vacation: ["Family Trip", "Relocation", "Personal Travel"],
  Personal: ["Bereavement", "Personal Matter", "Other"],
};

function ParentChangesChildOptions() {
  const { setField } = useChallengeField();
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");

  const onLeaveTypeChange = (value: string) => {
    setLeaveType(value);
    setReason("");
    setField("leaveType", value);
    setField("leaveReason", "");
  };

  const reasonOptions = leaveType ? LEAVE_REASONS[leaveType] ?? [] : [];

  return (
    <div className="grid max-w-md grid-cols-2 gap-4">
      <div>
        <label htmlFor="leaveType" className="mb-1.5 block text-sm font-medium text-slate-700">Leave type</label>
        <select id="leaveType" data-testid="leave-type-select" className={selectClasses} value={leaveType} onChange={(e) => onLeaveTypeChange(e.target.value)}>
          <option value="">{"Select\u2026"}</option>
          {Object.keys(LEAVE_REASONS).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="leaveReason" className="mb-1.5 block text-sm font-medium text-slate-700">Reason</label>
        <select
          id="leaveReason"
          data-testid="leave-reason-select"
          className={selectClasses}
          disabled={!leaveType}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setField("leaveReason", e.target.value);
          }}
        >
          <option value="">{"Select\u2026"}</option>
          {reasonOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
}

function TypeToCreateFromTextfield() {
  const { setField } = useChallengeField();
  const [draft, setDraft] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const next = [...tags, trimmed];
    setTags(next);
    setField("createdTags", next);
    setDraft("");
  };

  return (
    <div className="max-w-sm space-y-3">
      <div className="flex gap-2">
        <input
          data-testid="new-tag-input"
          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="Type a tag name…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <Button size="sm" data-testid="add-tag-btn" onClick={addTag}>Add</Button>
      </div>
      <div>
        <label htmlFor="tagsSelect" className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
        <select
          id="tagsSelect"
          data-testid="tags-select"
          className={selectClasses}
          disabled={tags.length === 0}
          value={selectedTag}
          onChange={(e) => {
            setSelectedTag(e.target.value);
            setField("selectedTag", e.target.value);
          }}
        >
          <option value="">{tags.length === 0 ? "No tags yet" : "Select a tag\u2026"}</option>
          {tags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}

function ClickToLoadDelayed() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && state === "idle") {
      setState("loading");
      const data = await apiRequest<string[]>("/lab/assignees");
      setOptions(data);
      setState("loaded");
    }
  };

  return (
    <div className="max-w-sm">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Assigned Engineer</label>
      <button
        type="button"
        data-testid="assignee-dropdown-trigger"
        onClick={toggle}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm"
      >
        {selected || "Select engineer\u2026"}
      </button>
      {open && (
        <div className="mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          {state === "loading" && <LoadingState label="Loading engineers\u2026" />}
          {state === "loaded" && (
            <ul data-testid="assignee-options">
              {options.map((name) => (
                <li
                  key={name}
                  data-testid={`assignee-option-${name.replace(/\s/g, "-")}`}
                  className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-brand-50"
                  onClick={() => {
                    setSelected(name);
                    setField("assignedEngineer", name);
                    setOpen(false);
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
