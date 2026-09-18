import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ModalEngineProps = { variant: string };

/** ONE engine component for the "Modals & Dialogs" category. */
export function ModalEngine({ variant }: ModalEngineProps) {
  switch (variant) {
    case "outside-click-and-escape":
      return <OutsideClickAndEscapeModal />;
    case "non-dismissible":
      return <NonDismissibleModal />;
    case "nested-modal":
      return <NestedModal />;
    case "form-modal-close-only":
      return <FormModalCloseOnly />;
    default:
      return <p className="text-sm text-red-600">Unknown modal variant: {variant}</p>;
  }
}

function ModalOverlay({
  onOverlayClick,
  children,
}: {
  onOverlayClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOverlayClick?.();
      }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40"
    >
      {children}
    </div>
  );
}

function OutsideClickAndEscapeModal() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);

  useEffect(() => setField("modalOpen", open), [open, setField]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div>
      <Button data-testid="edit-profile-btn" onClick={() => setOpen(true)}>Edit Profile</Button>
      {open && (
        <ModalOverlay onOverlayClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" data-testid="edit-profile-modal" className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Edit Profile</h3>
            <p className="mt-1 text-sm text-slate-500">Click outside or press Escape to close.</p>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function NonDismissibleModal() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(true);

  return (
    <div>
      {!open && <p className="text-sm text-emerald-700">Terms accepted.</p>}
      {open && (
        <ModalOverlay>
          <div role="dialog" aria-modal="true" data-testid="terms-modal" className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Terms of Service</h3>
            <p className="mt-1 max-h-32 overflow-y-auto text-sm text-slate-500">
              By continuing you agree to our fictional enterprise terms of service for practice purposes only.
            </p>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                data-testid="accept-terms-btn"
                onClick={() => {
                  setOpen(false);
                  setField("termsAccepted", true);
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function NestedModal() {
  const { setField } = useChallengeField();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [savedAddress, setSavedAddress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setField("selectedAddress", savedAddress), [savedAddress, setField]);

  return (
    <div>
      <Button data-testid="open-checkout-btn" onClick={() => setCheckoutOpen(true)}>Checkout</Button>
      {checkoutOpen && (
        <ModalOverlay>
          <div role="dialog" aria-modal="true" data-testid="checkout-modal" className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Checkout</h3>
            <p className="mt-2 text-sm text-slate-600">Address: {savedAddress || "None selected"}</p>
            <div className="mt-3 flex justify-between">
              <Button size="sm" variant="secondary" data-testid="add-address-btn" onClick={() => setAddressModalOpen(true)}>
                Add new address
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCheckoutOpen(false)}>Close</Button>
            </div>
          </div>

          {addressModalOpen && (
            <ModalOverlay>
              <div role="dialog" aria-modal="true" data-testid="address-modal" className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <h3 className="text-sm font-semibold text-slate-900">New Address</h3>
                <input
                  ref={inputRef}
                  data-testid="address-input"
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    data-testid="save-address-btn"
                    onClick={() => {
                      setSavedAddress(address);
                      setAddressModalOpen(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </ModalOverlay>
          )}
        </ModalOverlay>
      )}
    </div>
  );
}

const TERMS_TEXT =
  "By adding a team member you confirm they have accepted the company handbook, security policy, and code of conduct. ".repeat(6);

function FormModalCloseOnly() {
  const { setField } = useChallengeField();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Contributor");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState<"yes" | "no">("yes");
  const [team, setTeam] = useState<string[]>(["Sara Lindqvist", "Rohan Mehta"]);

  useEffect(() => setField("popupOpen", open), [open, setField]);

  const closeAndSave = () => {
    if (name.trim()) {
      const next = [...team, name.trim()];
      setTeam(next);
      setField("teamMembers", next);
    }
    setName("");
    setOpen(false);
  };

  return (
    <div>
      <div className={open ? "pointer-events-none select-none opacity-60" : ""} data-testid="background-team-area">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Team</h3>
        <ul className="space-y-1">
          {team.map((member) => (
            <li key={member} data-testid={`team-member-${member.replace(/\s/g, "-")}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
              {member}
            </li>
          ))}
        </ul>
        <Button size="sm" className="mt-3" data-testid="add-team-member-btn" onClick={() => setOpen(true)}>
          Add Team Member
        </Button>
      </div>

      {open && (
        <ModalOverlay>
          <div role="dialog" aria-modal="true" data-testid="team-member-modal" className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <button
              aria-label="Close"
              data-testid="close-modal-x-btn"
              onClick={closeAndSave}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {"\u2715"}
            </button>
            <h3 className="text-sm font-semibold text-slate-900">Add Team Member</h3>

            <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor="memberName">Name</label>
            <input id="memberName" data-testid="member-name-input" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} />

            <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor="memberRole">Role</label>
            <select id="memberRole" data-testid="member-role-select" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Manager</option>
              <option>Contributor</option>
              <option>Viewer</option>
            </select>

            <fieldset className="mt-3">
              <legend className="text-xs font-medium text-slate-600">Send welcome email?</legend>
              <label className="mr-4 inline-flex items-center gap-1.5 text-sm text-slate-700">
                <input type="radio" name="welcomeEmail" data-testid="welcome-email-yes" checked={sendWelcomeEmail === "yes"} onChange={() => setSendWelcomeEmail("yes")} />
                Yes
              </label>
              <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                <input type="radio" name="welcomeEmail" data-testid="welcome-email-no" checked={sendWelcomeEmail === "no"} onChange={() => setSendWelcomeEmail("no")} />
                No
              </label>
            </fieldset>

            <p className="mt-3 text-xs font-medium text-slate-600">Terms</p>
            <div data-testid="terms-scroll-box" className="mt-1 max-h-20 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-500">
              {TERMS_TEXT}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
