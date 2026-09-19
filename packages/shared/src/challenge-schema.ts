import { z } from "zod";

/**
 * Core enums shared by frontend + backend so a ChallengeDefinition means the
 * exact same thing wherever it is authored (hardcoded JSON today, database or
 * AI-generator output tomorrow).
 */

export const DifficultyEnum = z.enum([
  "beginner",
  "easy",
  "medium",
  "hard",
  "expert",
  "nightmare",
]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const ComponentKeyEnum = z.enum([
  "action-surface", // click/hover/keyboard/etc. basic UI actions
  "text-input",
  "dropdown",
  "button",
  "link",
  "table",
  "card",
  "menu",
  "tabs",
  "accordion",
  "modal",
  "toast",
  "tooltip",
  "date-time",
  "file-upload",
  "file-download",
  "media",
  "slider",
  "carousel",
  "scroll-area",
  "dynamic-dom",
  "iframe-lab",
  "shadow-dom",
  "api-panel",
  "auth-panel",
  "cookie-panel",
  "storage-panel",
  "popup",
  "live-data",
  "mission",
  "error-page",
  "drag-drop",
  "window-lab",
  "nightmare-dom",
]);
export type ComponentKey = z.infer<typeof ComponentKeyEnum>;

export const BehaviorTagEnum = z.enum([
  "static",
  "searchable",
  "multi-select",
  "api",
  "lazy-loaded",
  "dependent",
  "cascading",
  "dynamic",
  "dynamic-id",
  "grouped",
  "paginated",
  "virtualized",
  "delayed",
  "random-delay",
  "failure",
  "retry",
  "debounced",
  "masked",
  "auto-format",
  "keyboard-controlled",
  "drag-drop",
  "sortable",
  "infinite-scroll",
  "websocket",
  "validated-on-blur",
  "validated-on-submit",
  "validated-live",
]);
export type BehaviorTag = z.infer<typeof BehaviorTagEnum>;

export const EnvironmentTagEnum = z.enum([
  "none",
  "modal",
  "iframe",
  "nested-iframe",
  "shadow-dom",
  "new-tab",
  "new-window",
]);
export type EnvironmentTag = z.infer<typeof EnvironmentTagEnum>;

export const FrameworkTagEnum = z.enum([
  "selenium",
  "playwright",
  "cypress",
  "webdriverio",
  "puppeteer",
  "appium",
  "rest-assured",
  "postman",
  "karate",
  "generic-api",
]);
export type FrameworkTag = z.infer<typeof FrameworkTagEnum>;

export const AccessibilityStatusEnum = z.enum([
  "expected-accessible",
  "intentional-defect",
]);
export type AccessibilityStatus = z.infer<typeof AccessibilityStatusEnum>;

export const GuidanceContentSchema = z.object({
  whatItDoes: z.string().min(1),
  dataNeeded: z.string().min(1),
  action: z.string().min(1),
  expectedResult: z.string().min(1),
  validationPoints: z.array(z.string().min(1)).min(1),
  automationConcepts: z.array(z.string().min(1)).min(1),
  edgeCases: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional(),
});
export type GuidanceContent = z.infer<typeof GuidanceContentSchema>;

/** Machine-checkable expected behavior — the "Validation Engine" (§67). */
export const ValidationRuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("equals"), field: z.string(), expected: z.unknown() }),
  z.object({ kind: z.literal("contains"), field: z.string(), expected: z.unknown() }),
  z.object({ kind: z.literal("matches"), field: z.string(), pattern: z.string() }),
  z.object({
    kind: z.literal("range"),
    field: z.string(),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  z.object({ kind: z.literal("truthy"), field: z.string() }),
  z.object({ kind: z.literal("custom"), description: z.string() }),
]);
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

export const ChallengeDefinitionSchema = z.object({
  id: z.string().regex(/^[A-Z0-9-]+$/, "Challenge id must be UPPER-KEBAB e.g. DROPDOWN-014"),
  title: z.string().min(1),
  categoryId: z.string().min(1),
  component: ComponentKeyEnum,
  variant: z.string().min(1),
  behavior: z.array(BehaviorTagEnum).default([]),
  environment: z.array(EnvironmentTagEnum).default(["none"]),
  dataSource: z.string().min(1),
  difficulty: DifficultyEnum,
  frameworks: z.array(FrameworkTagEnum).default([]),
  accessibility: AccessibilityStatusEnum.default("expected-accessible"),
  guidance: GuidanceContentSchema,
  validation: z.array(ValidationRuleSchema).min(1),
  mode: z.object({
    deterministic: z.boolean().default(true),
    randomAvailable: z.boolean().default(false),
  }),
  estimatedMinutes: z.number().int().positive().default(5),
  resettable: z.literal(true).default(true),
  isActive: z.boolean().default(true),
});
export type ChallengeDefinition = z.infer<typeof ChallengeDefinitionSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  parentId: z.string().nullable(),
  order: z.number().int().nonnegative(),
});
export type Category = z.infer<typeof CategorySchema>;
