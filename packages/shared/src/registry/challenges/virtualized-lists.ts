import type { ChallengeDefinition } from "../../challenge-schema";

/** Virtualized Lists (spec category #40). Shares the `dynamic-dom` engine component. */
export const virtualizedListsChallenges: ChallengeDefinition[] = [
  {
    id: "VIRTUAL-001",
    title: "10,000-Row Virtualized List — Find Row #5000",
    categoryId: "virtualized-lists",
    component: "dynamic-dom",
    variant: "virtualized-10000-rows",
    behavior: ["virtualized"],
    environment: ["none"],
    dataSource: "static/none",
    difficulty: "expert",
    frameworks: ["playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes: "A list of 10,000 logical transaction records renders only ~20 DOM nodes at a time (windowed/virtualized rendering); scrolling swaps which records occupy those DOM nodes.",
      dataNeeded: "None.",
      action: "Scroll the list until \"Transaction #5000\" is rendered, then click it.",
      expectedResult: "Only a small, roughly-constant number of row elements exist in the DOM at any time, yet every one of the 10,000 records becomes reachable by scrolling far enough.",
      validationPoints: ["selectedTransaction equals 5000", "The DOM never contains anywhere near 10,000 row elements simultaneously"],
      automationConcepts: ["Virtualized/windowed list scrolling strategies", "Scrolling by container height increments instead of scrollIntoView on a non-existent node", "Understanding why a naive '10,000 elements' assumption fails"],
      edgeCases: ["Elements for a given logical row are reused/replaced as you scroll \u2014 do not cache a handle for \"row 5000\" before it is actually rendered."],
    },
    validation: [{ kind: "equals", field: "selectedTransaction", expected: 5000 }],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 5,
    resettable: true,
    isActive: true,
  },
];
