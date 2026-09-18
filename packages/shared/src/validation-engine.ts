import type { ValidationRule } from "./challenge-schema";

/**
 * Reusable Validation Engine (spec §67).
 *
 * A challenge's `validation` array describes machine-checkable expected
 * behavior. `evaluateValidationRules` runs those rules against a plain
 * "context" object collected from the live component (current field value,
 * API response, selected option, etc). It is deliberately framework-agnostic
 * (no DOM access) so it can run identically in the browser (live self-check /
 * "Show Expected Result") and on the server (future attempt-scoring).
 */

export type ValidationOutcome = {
  rule: ValidationRule;
  passed: boolean;
  actual: unknown;
  message: string;
};

function getField(context: Record<string, unknown>, field: string): unknown {
  return field.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    // Plain property access (not just plain objects) so built-ins like
    // string.length / array.length / array[0] resolve correctly too.
    return (acc as Record<string, unknown>)[key];
  }, context);
}

export function evaluateValidationRule(
  rule: ValidationRule,
  context: Record<string, unknown>
): ValidationOutcome {
  const actual = "field" in rule ? getField(context, rule.field) : undefined;

  switch (rule.kind) {
    case "equals":
      return {
        rule,
        actual,
        passed: actual === rule.expected,
        message: `Expected "${rule.field}" to equal ${JSON.stringify(rule.expected)}, got ${JSON.stringify(actual)}`,
      };
    case "contains":
      return {
        rule,
        actual,
        passed:
          typeof actual === "string" && typeof rule.expected === "string"
            ? actual.includes(rule.expected)
            : Array.isArray(actual)
              ? actual.includes(rule.expected)
              : false,
        message: `Expected "${rule.field}" to contain ${JSON.stringify(rule.expected)}, got ${JSON.stringify(actual)}`,
      };
    case "matches": {
      const re = new RegExp(rule.pattern);
      return {
        rule,
        actual,
        passed: typeof actual === "string" && re.test(actual),
        message: `Expected "${rule.field}" to match /${rule.pattern}/, got ${JSON.stringify(actual)}`,
      };
    }
    case "range": {
      const num = typeof actual === "number" ? actual : Number(actual);
      const min = rule.min ?? -Infinity;
      const max = rule.max ?? Infinity;
      return {
        rule,
        actual,
        passed: !Number.isNaN(num) && num >= min && num <= max,
        message: `Expected "${rule.field}" to be within [${rule.min ?? "-inf"}, ${rule.max ?? "inf"}], got ${JSON.stringify(actual)}`,
      };
    }
    case "truthy":
      return {
        rule,
        actual,
        passed: Boolean(actual),
        message: `Expected "${rule.field}" to be truthy, got ${JSON.stringify(actual)}`,
      };
    case "custom":
      // Custom rules are documented but evaluated by bespoke component logic;
      // the engine reports them as informational, never silently "passed".
      return {
        rule,
        actual: undefined,
        passed: false,
        message: `Custom rule requires component-level evaluation: ${rule.description}`,
      };
    default:
      return { rule, actual: undefined, passed: false, message: "Unknown rule kind" };
  }
}

export function evaluateValidationRules(
  rules: ValidationRule[],
  context: Record<string, unknown>
): ValidationOutcome[] {
  return rules.map((rule) => evaluateValidationRule(rule, context));
}

export function allPassed(outcomes: ValidationOutcome[]): boolean {
  return outcomes.every((o) => o.passed);
}
