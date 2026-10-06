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
        "Twelve scenarios, basic to nightmare. Each renders a small piece of real markup and asks you to identify ONE specific element among look-alike siblings. For each row, pick a mode: CSS or XPath (type the expression directly), or Code (write a real `it('...', () => { ... })` script using helpers \u2014 `$(css)`, `$x(xpath)`, `click(el)`, `type(el, text)`, `getText(el)`, `log(...)`, and `expect(el).toBeTheTarget()`). Click Validate/Run \u2014 it executes your exact input against the live document and checks it resolves to exactly that element, not zero, not several, and not the wrong one. Any syntactically valid selector or script that resolves to the correct element passes \u2014 validation is live DOM evaluation and exact-node comparison, not a hardcoded string match, so there is no single \"correct answer\" string to guess. (Real Selenium/Playwright/Cypress code can't literally execute inside a browser tab \u2014 those frameworks drive the browser from an external process \u2014 so Code mode runs genuine JavaScript against the real DOM using the same underlying APIs those frameworks are built on.)",
      dataNeeded: "None \u2014 all twelve answers are achievable with standard CSS selector syntax or XPath 1.0 expressions.",
      action:
        "Work through all 12 rows. Some are only solvable in CSS (ids/classes/attributes/position), some are only solvable in XPath (matching by visible text content, a preceding sibling's text, or a deep identical-looking ancestor chain), and some can be solved either way. Row 11 buries the target 5 levels deep with zero distinguishing text/attributes anywhere \u2014 only position through the full chain works. Row 12's id/class regenerate every time the page reloads (click Reset to watch it change) \u2014 locate it by something that stays stable instead.",
      expectedResult: "Every row's badge turns green (\"Correct\") after clicking Validate with the right expression.",
      validationPoints: [
        "row1Solved through row12Solved are all true \u2014 each only flips once Validate confirms your expression matches exactly the intended single element",
      ],
      automationConcepts: [
        "CSS selector syntax: id/class/attribute selectors, attribute contains/exact match, :nth-child()/:nth-of-type() position selectors, :not()",
        "XPath syntax: text(), contains(), following-sibling::, ancestor::, positional predicates, combining conditions with and",
        "Writing an actual test script (it block + assertion) against real DOM APIs, the same layer Selenium/Playwright/Cypress are built on",
        "Recognizing which problems CSS fundamentally cannot solve (no text-content matching, no previous-sibling axis) and switching to XPath",
        "Writing a selector that is exactly specific enough \u2014 too loose matches extra elements, too narrow matches none",
        "Navigating a long, repetitive ancestor/descendant chain by position when nothing else disambiguates it",
        "Never hardcoding a selector built from a regenerating id/class \u2014 anchoring on a stable attribute (e.g. type, name, data-testid) instead",
      ],
      edgeCases: [
        "A selector that matches more than one element is marked incorrect even if the correct element is among the matches \u2014 real automation requires exact, unambiguous locators.",
        "Several rows deliberately give every candidate element the SAME class name, so a correct CSS answer must rely on attributes or position, not class, to disambiguate.",
        "Row 12's id/class are freshly randomized on every mount (Reset included) \u2014 a selector built from whatever id happened to be on screen a moment ago will stop matching the instant it regenerates.",
      ],
      hints: [
        "If CSS can't seem to express the rule no matter what you try, the scenario is probably one of the XPath-only ones (text-content matching, or a 'previous sibling' relationship).",
        "Toggle between CSS and XPath per row independently \u2014 you don't have to use the same mode for every scenario.",
        "For row 11, count nesting levels carefully and use position (nth-of-type / positional predicates) at each level that has more than one identical sibling.",
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
      { kind: "truthy", field: "row11Solved" },
      { kind: "truthy", field: "row12Solved" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 30,
    resettable: true,
    isActive: true,
  },
];
