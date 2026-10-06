import type { ChallengeDefinition } from "../../challenge-schema";

/**
 * XPath & CSS Locator Practice (new category) \u2014 unlike every other category,
 * this one does NOT give the learner a data-testid to click; it gives them a
 * rendered element and makes THEM write a CSS selector or XPath expression
 * that uniquely matches it, validated live against the real DOM (exact node
 * match via direct reference comparison, not just "matched something").
 */
export const locatorPracticeChallenges: ChallengeDefinition[] = [
  {
    id: "LOCATOR-001",
    title: "The Locator Gauntlet \u2014 Write Your Own CSS/XPath",
    categoryId: "locator-practice",
    component: "locator-lab",
    variant: "locator-gauntlet",
    behavior: ["static"],
    environment: ["none"],
    dataSource: "static/none",
    difficulty: "nightmare",
    frameworks: ["selenium", "playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "Ten scenarios, basic to advanced. Each renders a small piece of real markup and asks you to identify ONE specific element among look-alike siblings. You write the CSS selector or XPath expression yourself (pick the mode toggle) in the field next to it and click Validate \u2014 it runs your exact expression against the live document and checks it matches exactly that element, not zero, not several, and not the wrong one.",
      dataNeeded: "None \u2014 all ten answers are achievable with standard CSS selector syntax or XPath 1.0 expressions.",
      action:
        "Work through all 10 rows. Some are only solvable in CSS (ids/classes/attributes/position), some are only solvable in XPath (matching by visible text content or by a preceding sibling's text \u2014 CSS cannot do either), and some can be solved either way.",
      expectedResult: "Every row's badge turns green (\"Correct\") after clicking Validate with the right expression.",
      validationPoints: [
        "row1Solved through row10Solved are all true \u2014 each only flips once Validate confirms your expression matches exactly the intended single element",
      ],
      automationConcepts: [
        "CSS selector syntax: id/class/attribute selectors, attribute contains/exact match, :nth-child() position selectors, :not()",
        "XPath syntax: text(), contains(), following-sibling::, ancestor::, positional predicates, combining conditions with and",
        "Recognizing which problems CSS fundamentally cannot solve (no text-content matching, no previous-sibling axis) and switching to XPath",
        "Writing a selector that is exactly specific enough \u2014 too loose matches extra elements, too narrow matches none",
      ],
      edgeCases: [
        "A selector that matches more than one element is marked incorrect even if the correct element is among the matches \u2014 real automation requires exact, unambiguous locators.",
        "Several rows deliberately give every candidate element the SAME class name, so a correct CSS answer must rely on attributes or position, not class, to disambiguate.",
      ],
      hints: [
        "If CSS can't seem to express the rule no matter what you try, the scenario is probably one of the two XPath-only ones (text-content matching, or a 'previous sibling' relationship).",
        "Toggle between CSS and XPath per row independently \u2014 you don't have to use the same mode for every scenario.",
      ],
    },
    validation: [
      { kind: "truthy", field: "row1Solved" },
      { kind: "truthy", field: "row2Solved" },
      { kind: "truthy", field: "row3Solved" },
      { kind: "truthy", field: "row4Solved" },
      { kind: "truthy", field: "row5Solved" },
      { kind: "truthy", field: "row6Solved" },
      { kind: "truthy", field: "row7Solved" },
      { kind: "truthy", field: "row8Solved" },
      { kind: "truthy", field: "row9Solved" },
      { kind: "truthy", field: "row10Solved" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 25,
    resettable: true,
    isActive: true,
  },
];
