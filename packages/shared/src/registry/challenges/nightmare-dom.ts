import type { ChallengeDefinition } from "../../challenge-schema";

/**
 * Nightmare DOM (spec #55) — a single dedicated benchmark page that combines
 * random ids, dynamic classes, nested DOM, duplicate elements, hidden
 * elements, dynamic text/attributes, moving elements, an iframe, shadow DOM,
 * a dynamic/virtualized table, a delayed+flaky API and popup/ad-style click
 * interception, all on one page. Uses the `nightmare-dom` engine component.
 */
export const nightmareDomChallenges: ChallengeDefinition[] = [
  {
    id: "NIGHTMARE-001",
    title: "The Nightmare DOM Gauntlet",
    categoryId: "nightmare-dom",
    component: "nightmare-dom",
    variant: "the-gauntlet",
    behavior: ["dynamic", "dynamic-id", "delayed", "failure", "retry", "infinite-scroll"],
    environment: ["iframe", "shadow-dom"],
    dataSource: "static/nightmare-dom",
    difficulty: "nightmare",
    frameworks: ["selenium", "playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "Eight independent obstacles stacked on one page, each modeling a real production failure QA automation engineers hit: an id/class that regenerate with a rotating label (Stage 1); five visually-identical \"Approve\" buttons disambiguated only by a title/aria-label attribute (Stage 2); three elements sharing one data-testid where two are display:none/visibility:hidden decoys (Stage 3); deeply nested, identically-classed rows where only an ancestor wrapper carries a stable test id (Stage 4); a status badge whose text and data-state attribute change over ~4.4s, natively gating a Continue button (Stage 5); a moving \"Claim Reward\" button periodically covered by a real pointer-events-enabled ad overlay (Stage 6); an iframe wrapping a custom element with an open shadow root containing the actual \"Finalize\" button (Stage 7); and a flaky endpoint (fails twice, succeeds on the 3rd call) that loads a 400-row virtualized ledger whose column order is reshuffled on every load (Stage 8).",
      dataNeeded: "None — every trap is deterministic once you know the rule (only the 3rd load attempt of Stage 8 ever succeeds; Stage 5's gate always opens at ~4.4s; Stage 2's correct id is always 4821; Stage 4's correct company is always \"Globex Corporation\"; Stage 8's target invoice is always INV-0387).",
      action:
        "Clear all 8 stages: (1) click the churning-id/label button via its data-testid; (2) approve request #4821 specifically, not any of the other four identical buttons; (3) click only the genuinely visible \"Archive Report\" button, ignoring the two hidden ones sharing its data-testid; (4) delete the \"Globex Corporation\" row by locating its ancestor wrapper then its relative Delete button; (5) wait/poll for the status badge's data-state to reach \"ready\", then click Continue; (6) close the ad overlay and click the moving \"Claim Reward\" button; (7) switch into the iframe, pierce its shadow root, and click \"Finalize\"; (8) retry the flaky ledger load until it succeeds, scroll to invoice INV-0387 by matching its data-col=\"id\" cell (column order is shuffled), and click its Flag button.",
      expectedResult: "All 8 stage badges flip from \"Open\" to \"Solved\".",
      validationPoints: [
        "stage1Confirmed is true",
        "stage2ApprovedRequestId equals \"4821\"",
        "stage3VisibleArchiveClicked is true",
        "stage4DeletedCompany equals \"Globex Corporation\"",
        "stage5ContinuedAfterReady is true",
        "stage6AdDismissed and stage6RewardClaimed are both true",
        "stage7Finalized is true",
        "stage8LedgerInvoiceFlagged is true",
      ],
      automationConcepts: [
        "Stable data-testid locators vs brittle id/class/exact-text locators",
        "Disambiguating duplicate elements via attributes (title/aria-label) instead of visible text",
        "Visibility-aware element selection (toBeVisible()/isDisplayed()) among elements sharing a locator",
        "Relative/ancestor-descendant XPath and CSS when only a wrapper is stably identifiable",
        "Polling for real application state instead of fixed sleeps",
        "Real click-interception from overlays (z-index/pointer-events), not simulated failure",
        "Combining iframe frame-switching with shadow-root piercing",
        "Bounded-retry loops against a flaky endpoint, and column-header-relative table locators against reshuffled markup",
      ],
      edgeCases: [
        "Stage 3's hidden buttons are technically present in the DOM and force-clickable via raw JS — a properly visibility-aware locator strategy must still reject them.",
        "Stage 6's ad overlay genuinely stacks above the moving button in the real DOM (not simulated) — a click during that window is truly intercepted.",
        "Stage 8 reshuffles its column order independently on every successful load (including after Reset), so any position-based (nth-child) locator is designed to fail intermittently.",
      ],
      hints: [
        "If a locator that worked a second ago suddenly \"can't find\" the element, suspect a regenerated id/class — switch to data-testid.",
        "If `getByText()`/`By.xpath(\"//button[text()='Approve']\")` matches more than one node, add a second constraint from an attribute instead of guessing an index.",
      ],
    },
    validation: [
      { kind: "truthy", field: "stage1Confirmed" },
      { kind: "equals", field: "stage2ApprovedRequestId", expected: "4821" },
      { kind: "truthy", field: "stage3VisibleArchiveClicked" },
      { kind: "equals", field: "stage4DeletedCompany", expected: "Globex Corporation" },
      { kind: "truthy", field: "stage5ContinuedAfterReady" },
      { kind: "truthy", field: "stage6AdDismissed" },
      { kind: "truthy", field: "stage6RewardClaimed" },
      { kind: "truthy", field: "stage7Finalized" },
      { kind: "truthy", field: "stage8LedgerInvoiceFlagged" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 20,
    resettable: true,
    isActive: true,
  },
];
