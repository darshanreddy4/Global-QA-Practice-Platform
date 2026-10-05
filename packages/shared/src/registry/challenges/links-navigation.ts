import type { ChallengeDefinition } from "../../challenge-schema";

/** Links & Navigation (spec category #5). All variants share the `link` engine component. */
export const linksNavigationChallenges: ChallengeDefinition[] = [
  {
    id: "LINK-001",
    title: "Link Opens a Genuine New Tab",
    categoryId: "links-navigation",
    component: "link",
    variant: "link-opens-new-tab",
    behavior: ["static"],
    environment: ["new-tab"],
    dataSource: "static/none",
    difficulty: "medium",
    frameworks: ["selenium", "playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "A real anchor (target=\"_blank\" rel=\"noopener\") opens a genuinely different page (/link-lab/new-tab) in a brand-new browser tab \u2014 not a simulation. That page has its own distinct heading/text and a \"Confirm I'm on the new tab\" button. Clicking that button posts a BroadcastChannel message back to the original tab, which is the only way this page's progress fields get set, proving the confirmation really happened in the new tab.",
      dataNeeded: "None.",
      action:
        "Click \"Open Support Article (new tab)\" (data-testid=\"open-new-tab-link\"). Switch to the new tab, confirm its URL (/link-lab/new-tab) differs from this challenge's URL, read its distinct heading, then click \"Confirm I'm on the new tab\" (data-testid=\"new-tab-confirm-btn\").",
      expectedResult: "The original tab shows \"New tab confirmed at /link-lab/new-tab.\" once the button in the new tab is clicked.",
      validationPoints: [
        "newTabConfirmed is true (only set via a real cross-tab message, not a plain onClick on the link itself)",
        "newTabPath equals \"/link-lab/new-tab\" \u2014 proving the opened tab's URL is genuinely different",
      ],
      automationConcepts: [
        "Asserting target=\"_blank\" and rel=\"noopener\" on the anchor before clicking",
        "Switching to a newly opened tab/window (Playwright context.waitForEvent(\"page\"), Selenium window handles)",
        "Asserting the new tab's page.url() differs from the opener's URL",
        "Cross-tab verification via BroadcastChannel instead of trusting the opener's own click handler",
      ],
    },
    validation: [
      { kind: "truthy", field: "newTabConfirmed" },
      { kind: "equals", field: "newTabPath", expected: "/link-lab/new-tab" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 4,
    resettable: true,
    isActive: true,
  },
  {
    id: "LINK-002",
    title: "Link Navigates to a Form Page, Submitting Returns You",
    categoryId: "links-navigation",
    component: "link",
    variant: "link-navigates-to-form-and-back",
    behavior: ["static"],
    environment: ["none"],
    dataSource: "static/none",
    difficulty: "medium",
    frameworks: ["selenium", "playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "Clicking \"Share Feedback\" performs a REAL same-tab page navigation (a full React Router route change to /link-lab/feedback-form, not a modal) to a page with a text field and a Submit button. Submitting that form (after validating the field isn't empty) navigates you back to this exact challenge page automatically.",
      dataNeeded: "Any non-empty feedback text.",
      action:
        "Click \"Share Feedback\" (data-testid=\"open-feedback-form-link\"). On the new page, type feedback into the text field (data-testid=\"feedback-text-input\") and click \"Submit & Return\" (data-testid=\"feedback-submit-btn\").",
      expectedResult: "You land back on this challenge page, which now shows \"Welcome back! You submitted: ...\" with your exact feedback text.",
      validationPoints: [
        "feedbackSubmitted is true",
        "feedbackText is non-empty and equals exactly what you typed",
      ],
      automationConcepts: [
        "Verifying a real URL/route change rather than assuming a link always means \"same page\"",
        "Filling a field and submitting a form that lives on an entirely different route",
        "Asserting a post-submit redirect brought you back to the expected originating URL",
      ],
      edgeCases: ["Submitting with an empty feedback field shows a validation error and does not navigate anywhere."],
    },
    validation: [
      { kind: "truthy", field: "feedbackSubmitted" },
      { kind: "truthy", field: "feedbackText" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 4,
    resettable: true,
    isActive: true,
  },
  {
    id: "LINK-003",
    title: "Link Opens a Blocking Popup (No Navigation at All)",
    categoryId: "links-navigation",
    component: "link",
    variant: "link-opens-blocking-popup",
    behavior: ["static"],
    environment: ["modal"],
    dataSource: "static/none",
    difficulty: "medium",
    frameworks: ["selenium", "playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "A \"Terms & Conditions\" link doesn't navigate anywhere at all \u2014 it opens an in-page popup (\"You are awesome!\" plus a Name field and Submit/Close buttons) behind a real full-screen overlay. While open, the rest of the page (including a \"Background action\" button) is genuinely unclickable \u2014 the overlay physically sits on top of it in the DOM, it isn't just visually dimmed.",
      dataNeeded: "Any non-empty name.",
      action:
        "Click \"Background action\" once to see its counter increment. Click \"Terms & Conditions\" (data-testid=\"open-popup-link\") to open the popup. Try clicking \"Background action\" again while the popup is open \u2014 the counter must NOT increase. Then type a name into the popup (data-testid=\"popup-name-input\") and click \"Submit\" (data-testid=\"popup-submit-btn\").",
      expectedResult: "The popup closes and the page shows \"Thanks, <name>! Popup submitted.\"",
      validationPoints: ["popupFormSubmitted is true", "popupName equals the name you typed into the popup"],
      automationConcepts: [
        "Distinguishing a real navigation from a same-page overlay that only LOOKS like a dialog",
        "Proving a background element is inert while a modal is open (a real click attempt fails/no-ops, not a fake disabled flag)",
        "Required-field validation inside a modal before it's allowed to close via Submit",
      ],
      edgeCases: [
        "Clicking \"Close\" instead of \"Submit\" dismisses the popup without setting popupFormSubmitted \u2014 only a successful Submit counts.",
        "Submitting with an empty name shows a validation error and keeps the popup open.",
      ],
    },
    validation: [
      { kind: "truthy", field: "popupFormSubmitted" },
      { kind: "truthy", field: "popupName" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 4,
    resettable: true,
    isActive: true,
  },
];

