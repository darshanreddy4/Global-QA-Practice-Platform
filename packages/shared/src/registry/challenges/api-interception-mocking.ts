import type { ChallengeDefinition } from "../../challenge-schema";

/**
 * API Interception & Mocking (spec category #31). All variants share the `api-panel`
 * engine component. These exercises require the TESTER's own framework
 * (Playwright route.fulfill / Cypress cy.intercept / a proxy) to intercept the
 * real network call — the platform cannot fake this from inside the app, which
 * is exactly what makes the validation trustworthy: it only passes if a real
 * interception changed what the browser actually received.
 */
export const apiInterceptionMockingChallenges: ChallengeDefinition[] = [
  {
    id: "MOCK-001",
    title: "Intercept & Modify Response Body — Stock Price",
    categoryId: "api-interception-mocking",
    component: "api-panel",
    variant: "intercept-modify-response",
    behavior: ["api"],
    environment: ["none"],
    dataSource: "api/lab-stock-price",
    difficulty: "expert",
    frameworks: ["playwright", "cypress", "generic-api"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes: "\"Refresh Price\" calls `GET /api/lab/stock-price`, which deterministically returns `{ price: 142.5 }` when NOT intercepted.",
      dataNeeded: "None from the UI \u2014 the mock is configured in your test code.",
      action: "In your test framework, intercept `GET /api/lab/stock-price` and fulfill it with `{ data: { symbol: \"QALB\", price: 999.99 } }`. Then click \"Refresh Price\" in the app.",
      expectedResult: "The displayed price is $999.99, proving your interception replaced the real network response before the app ever saw it.",
      validationPoints: ["Displayed price equals 999.99 (impossible without a real interception, since the real endpoint always returns 142.5)"],
      automationConcepts: ["Playwright route.fulfill / Cypress cy.intercept", "Response-body mocking", "Distinguishing real vs mocked network responses"],
    },
    validation: [{ kind: "equals", field: "stockPrice", expected: 999.99 }],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 5,
    resettable: true,
    isActive: true,
  },
  {
    id: "MOCK-002",
    title: "Simulate Server Error via Interception",
    categoryId: "api-interception-mocking",
    component: "api-panel",
    variant: "intercept-force-error",
    behavior: ["api", "failure"],
    environment: ["none"],
    dataSource: "api/lab-products",
    difficulty: "expert",
    frameworks: ["playwright", "cypress", "generic-api"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes: "\"Load Products\" normally calls `GET /api/lab/products` and succeeds (200). This exercise asks you to force it to fail instead.",
      dataNeeded: "None.",
      action: "Intercept `GET /api/lab/products` in your framework and fulfill it with status 500. Then click \"Load Products\".",
      expectedResult: "The panel shows its real error state (not a hardcoded demo error) because the app genuinely received a 500 from the (mocked) network layer.",
      validationPoints: ["Panel's error state is shown with status 500", "No products are rendered when the forced error occurs"],
      automationConcepts: ["Forcing failure paths that are hard to trigger naturally", "Verifying UI error-handling code paths via mocked failures"],
    },
    validation: [{ kind: "equals", field: "lastStatus", expected: 500 }],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 4,
    resettable: true,
    isActive: true,
  },
  {
    id: "MOCK-003",
    title: "Abort Request via Interception",
    categoryId: "api-interception-mocking",
    component: "api-panel",
    variant: "intercept-abort-request",
    behavior: ["api", "failure"],
    environment: ["none"],
    dataSource: "api/lab-products",
    difficulty: "expert",
    frameworks: ["playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes: "Instead of returning any response, this exercise asks you to abort the underlying request entirely (simulating an offline/network-failure condition).",
      dataNeeded: "None.",
      action: "Intercept `GET /api/lab/products` and abort/fail the request (e.g. Playwright `route.abort()`). Then click \"Load Products\".",
      expectedResult: "The panel shows a network-failure state distinct from a normal HTTP error response (no status code available at all).",
      validationPoints: ["networkFailure flag is true", "No HTTP status is recorded for the aborted attempt"],
      automationConcepts: ["route.abort() / simulated offline conditions", "Distinguishing HTTP-error states from connection-level failures"],
    },
    validation: [{ kind: "equals", field: "networkFailure", expected: true }],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 4,
    resettable: true,
    isActive: true,
  },
];
