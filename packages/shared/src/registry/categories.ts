/**
 * Category tree — mirrors the Global Enterprise QA Lab nav (spec §73),
 * grouping the 50 browsable practice categories under sensible parents.
 * Architecture-only concepts from the spec (metadata, guidance system,
 * validation engine, behavior matrix, etc.) are NOT nav items — they are
 * built into every challenge page instead (see ARCHITECTURE.md §21).
 */
import type { Category } from "../challenge-schema";
import type { AccessTier } from "../domain-types";

export type CategoryStatus = "available" | "planned";

export type CategoryNode = Category & {
  status: CategoryStatus;
  /** Roadmap phase from ARCHITECTURE.md §22 that will deliver this category. */
  phase: number;
  description: string;
  /**
   * Future monetization extension point (see ARCHITECTURE.md "Access Tier &
   * Monetization Architecture"). Undefined/omitted == "free". No payment
   * gateway exists yet, so nothing is actually gated today.
   */
  accessTier?: AccessTier;
};

/** Resolves a category's access tier, defaulting to "free" when unset. */
export function getAccessTier(category: CategoryNode): AccessTier {
  return category.accessTier ?? "free";
}

const c = (node: CategoryNode): CategoryNode => node;

export const categories: CategoryNode[] = [
  // Top-level
  c({ id: "dashboard", slug: "dashboard", title: "Dashboard", parentId: null, order: 0, status: "available", phase: 1, description: "Your practice overview." }),
  c({ id: "practice", slug: "practice", title: "Practice Catalog", parentId: null, order: 1, status: "available", phase: 1, description: "Browse every component practice category." }),

  // Components (parent)
  c({ id: "components", slug: "components", title: "Components", parentId: null, order: 2, status: "available", phase: 1, description: "Enterprise UI component practice library." }),
  c({ id: "basic-ui-actions", slug: "basic-ui-actions", title: "Basic UI Actions", parentId: "components", order: 1, status: "available", phase: 1, description: "Click, hover, keyboard, focus, and core DOM actions." }),
  c({ id: "input-controls", slug: "input-controls", title: "Input & Form Controls", parentId: "components", order: 2, status: "available", phase: 1, description: "Enterprise form fields with realistic validation." }),
  c({ id: "dropdowns", slug: "dropdowns", title: "Dropdowns & Selection Controls", parentId: "components", order: 3, status: "available", phase: 1, description: "Static, searchable, API-driven and dependent dropdowns." }),
  c({ id: "buttons", slug: "buttons", title: "Buttons & Click Behaviors", parentId: "components", order: 4, status: "available", phase: 1, description: "Buttons with realistic async and state-driven behavior." }),
  c({ id: "links-navigation", slug: "links-navigation", title: "Links & Navigation", parentId: "components", order: 5, status: "available", phase: 2, description: "Anchor, tab-target, popup and dynamic links." }),
  c({ id: "mouse-actions", slug: "mouse-actions", title: "Mouse Actions", parentId: "components", order: 6, status: "available", phase: 2, description: "Drag, hover, coordinate click, scroll-wheel practice." }),
  c({ id: "drag-drop", slug: "drag-drop", title: "Drag & Drop", parentId: "components", order: 7, status: "available", phase: 2, description: "HTML5 and JS-based drag/drop variations." }),
  c({ id: "tables-grids", slug: "tables-grids", title: "Tables & Grids", parentId: "components", order: 8, status: "available", phase: 2, description: "Enterprise data grids: sort, filter, page, edit." }),
  c({ id: "lists-cards", slug: "lists-cards", title: "Lists & Cards", parentId: "components", order: 9, status: "available", phase: 2, description: "Card catalogs with API-driven behavior." }),
  c({ id: "menus-navigation", slug: "menus-navigation", title: "Menus & Navigation", parentId: "components", order: 10, status: "available", phase: 1, description: "App shell header, sidebar and breadcrumb navigation." }),
  c({ id: "tabs", slug: "tabs", title: "Tabs", parentId: "components", order: 11, status: "available", phase: 2, description: "Standard, URL-based, closable and nested tabs." }),
  c({ id: "accordions", slug: "accordions", title: "Accordions", parentId: "components", order: 12, status: "available", phase: 2, description: "Single/multi open, nested, API-loaded accordions." }),
  c({ id: "modals-dialogs", slug: "modals-dialogs", title: "Modals & Dialogs", parentId: "components", order: 13, status: "available", phase: 2, description: "Confirmation, drawer, nested and form modals." }),
  c({ id: "alerts-notifications", slug: "alerts-notifications", title: "Alerts & Notifications", parentId: "components", order: 14, status: "available", phase: 2, description: "Native dialogs and toast notification queue." }),
  c({ id: "tooltips-hover", slug: "tooltips-hover", title: "Tooltips & Hover Elements", parentId: "components", order: 15, status: "available", phase: 2, description: "Hover/click/focus tooltips with dynamic positioning." }),
  c({ id: "date-time", slug: "date-time", title: "Date & Time Controls", parentId: "components", order: 16, status: "available", phase: 3, description: "Calendars, time pickers, restrictions." }),
  c({ id: "file-upload", slug: "file-upload", title: "File Upload", parentId: "components", order: 17, status: "available", phase: 3, description: "Single/multi/drag upload with validation." }),
  c({ id: "file-download", slug: "file-download", title: "File Download", parentId: "components", order: 18, status: "available", phase: 3, description: "Dynamic report and authenticated downloads." }),
  c({ id: "images-media", slug: "images-media", title: "Images & Media", parentId: "components", order: 19, status: "available", phase: 3, description: "Image states, carousels, audio/video controls." }),
  c({ id: "sliders-carousels", slug: "sliders-carousels", title: "Sliders & Carousels", parentId: "components", order: 20, status: "available", phase: 3, description: "Range sliders and content carousels." }),
  c({ id: "scroll-behaviors", slug: "scroll-behaviors", title: "Scroll Behaviors", parentId: "components", order: 21, status: "available", phase: 3, description: "Infinite scroll, sticky headers, nested scroll." }),

  // Dynamic DOM Lab
  c({ id: "dynamic-dom-lab", slug: "dynamic-dom-lab", title: "Dynamic DOM Lab", parentId: null, order: 3, status: "available", phase: 4, description: "Locator and synchronization practice." }),
  c({ id: "dynamic-elements", slug: "dynamic-elements", title: "Dynamic Elements", parentId: "dynamic-dom-lab", order: 1, status: "available", phase: 4, description: "IDs/classes/attributes/text that change at runtime." }),
  c({ id: "dynamic-xpath", slug: "dynamic-xpath", title: "Dynamic XPath Challenges", parentId: "dynamic-dom-lab", order: 2, status: "available", phase: 4, description: "contains(), ancestor/sibling relative XPath practice." }),
  c({ id: "moving-elements", slug: "moving-elements", title: "Moving Elements", parentId: "dynamic-dom-lab", order: 3, status: "available", phase: 4, description: "Deterministic and random-position moving UI." }),
  c({ id: "ajax-async", slug: "ajax-async", title: "Ajax / Asynchronous Elements", parentId: "dynamic-dom-lab", order: 4, status: "available", phase: 4, description: "Configurable-delay and failing API-backed UI." }),
  c({ id: "wait-sync", slug: "wait-sync", title: "Wait & Synchronization Challenges", parentId: "dynamic-dom-lab", order: 5, status: "available", phase: 4, description: "Explicit wait and API-synchronization practice." }),
  c({ id: "virtualized-lists", slug: "virtualized-lists", title: "Virtualized Lists", parentId: "dynamic-dom-lab", order: 6, status: "available", phase: 4, description: "10,000+ row virtualized rendering practice." }),

  // Browser Lab
  c({ id: "browser-lab", slug: "browser-lab", title: "Browser Lab", parentId: null, order: 4, status: "available", phase: 5, description: "Windows, iframes, shadow DOM, cookies, storage." }),
  c({ id: "browser-windows-tabs", slug: "browser-windows-tabs", title: "Browser Windows & Tabs", parentId: "browser-lab", order: 1, status: "available", phase: 5, description: "Parent/child window state synchronization." }),
  c({ id: "iframe-lab", slug: "iframe-lab", title: "Iframe Laboratory", parentId: "browser-lab", order: 2, status: "available", phase: 5, description: "Single and triple-nested iframe component practice." }),
  c({ id: "shadow-dom", slug: "shadow-dom", title: "Shadow DOM", parentId: "browser-lab", order: 3, status: "available", phase: 5, description: "Open shadow DOM component practice." }),
  c({ id: "cookies", slug: "cookies", title: "Cookies", parentId: "browser-lab", order: 4, status: "available", phase: 5, description: "Session, preference and secure cookie practice." }),
  c({ id: "browser-storage", slug: "browser-storage", title: "Browser Storage", parentId: "browser-lab", order: 5, status: "available", phase: 5, description: "LocalStorage/SessionStorage/IndexedDB practice." }),
  c({ id: "popups", slug: "popups", title: "Popups", parentId: "browser-lab", order: 6, status: "available", phase: 5, description: "HTML popups and simulated permission dialogs." }),

  // API Lab
  c({ id: "api-lab", slug: "api-lab", title: "API Lab", parentId: null, order: 5, status: "available", phase: 6, description: "REST, mocking, interception and API-driven UI." }),
  c({ id: "network-api-testing", slug: "network-api-testing", title: "Network / API Testing", parentId: "api-lab", order: 1, status: "available", phase: 6, description: "GET/POST/PUT/PATCH/DELETE practice endpoints." }),
  c({ id: "api-interception-mocking", slug: "api-interception-mocking", title: "API Interception & Mocking", parentId: "api-lab", order: 2, status: "available", phase: 6, description: "Controlled mock/response-modification scenarios." }),
  c({ id: "api-driven-ui", slug: "api-driven-ui", title: "API-Driven UI", parentId: "api-lab", order: 3, status: "available", phase: 1, description: "UI that depends on chained backend calls (see Dropdowns)." }),

  // Auth & Security
  c({ id: "auth-security-lab", slug: "auth-security-lab", title: "Auth & Security Lab", parentId: null, order: 6, status: "planned", phase: 7, description: "Authentication and safe security-testing practice." }),
  c({ id: "authentication", slug: "authentication", title: "Authentication", parentId: "auth-security-lab", order: 1, status: "available", phase: 1, description: "Login, session, and role-based access (basic in v1)." }),
  c({ id: "security-testing", slug: "security-testing", title: "Security Testing Practice", parentId: "auth-security-lab", order: 2, status: "planned", phase: 9, description: "Safe, isolated, non-destructive security scenarios." }),

  // Live/Async
  c({ id: "live-async-lab", slug: "live-async-lab", title: "Live & Async Lab", parentId: null, order: 7, status: "planned", phase: 8, description: "WebSocket live data and background task practice." }),
  c({ id: "websocket-live-data", slug: "websocket-live-data", title: "Web Socket / Live Data", parentId: "live-async-lab", order: 1, status: "planned", phase: 8, description: "Live order status, chat, notifications." }),
  c({ id: "web-workers-async", slug: "web-workers-async", title: "Web Workers / Async Processing", parentId: "live-async-lab", order: 2, status: "planned", phase: 8, description: "Long-running background task simulation." }),

  // Quality Lab
  c({ id: "quality-lab", slug: "quality-lab", title: "Quality Lab", parentId: null, order: 8, status: "planned", phase: 9, description: "Responsive, accessibility, error, performance, visual." }),
  c({ id: "responsive-design", slug: "responsive-design", title: "Responsive Design", parentId: "quality-lab", order: 1, status: "planned", phase: 9, description: "Desktop/tablet/mobile layout practice." }),
  c({ id: "mobile-web", slug: "mobile-web", title: "Mobile Web Behaviors", parentId: "quality-lab", order: 2, status: "planned", phase: 9, description: "Simulated touch: tap, swipe, long-press." }),
  c({ id: "accessibility", slug: "accessibility", title: "Accessibility", parentId: "quality-lab", order: 3, status: "planned", phase: 9, description: "Accessible vs intentional-defect challenge pairs." }),
  c({ id: "error-handling", slug: "error-handling", title: "Error Handling", parentId: "quality-lab", order: 4, status: "available", phase: 1, description: "Realistic enterprise error pages (400–504)." }),
  c({ id: "performance-testing", slug: "performance-testing", title: "Performance Testing Practice", parentId: "quality-lab", order: 5, status: "planned", phase: 9, description: "Large DOM, slow API, measurable metrics." }),
  c({ id: "visual-testing", slug: "visual-testing", title: "Visual Testing", parentId: "quality-lab", order: 6, status: "planned", phase: 9, description: "Stable and dynamic pages for visual regression." }),
  c({ id: "cross-browser", slug: "cross-browser", title: "Cross-Browser Practice", parentId: "quality-lab", order: 7, status: "planned", phase: 9, description: "Documented cross-browser expectations." }),

  // Framework Lab
  c({ id: "framework-lab", slug: "framework-lab", title: "Framework Lab", parentId: null, order: 9, status: "planned", phase: 10, description: "Framework-specific practice scenarios." }),

  // Real Applications
  c({ id: "real-applications", slug: "real-applications", title: "Real Applications", parentId: null, order: 10, status: "available", phase: 10, description: "Complete enterprise mini applications." }),
  c({ id: "ecommerce", slug: "ecommerce", title: "E-Commerce", parentId: "real-applications", order: 1, status: "available", phase: 10, description: "Login → cart → checkout → invoice." }),
  c({ id: "banking", slug: "banking", title: "Banking Demo", parentId: "real-applications", order: 2, status: "available", phase: 10, description: "OTP, transfer, statement — fictional data only." }),
  c({ id: "travel", slug: "travel", title: "Travel", parentId: "real-applications", order: 3, status: "available", phase: 10, description: "Search → seat selection → payment." }),
  c({ id: "hr", slug: "hr", title: "HR", parentId: "real-applications", order: 4, status: "planned", phase: 10, description: "Employees, leave, payroll, reports." }),
  c({ id: "education", slug: "education", title: "Education", parentId: "real-applications", order: 5, status: "planned", phase: 10, description: "Courses, assignments, results, certificates." }),
  c({ id: "healthcare", slug: "healthcare", title: "Healthcare Demo", parentId: "real-applications", order: 6, status: "planned", phase: 10, description: "Fictional patient/appointment demo." }),

  // Missions & benchmarks
  c({ id: "missions", slug: "missions", title: "Missions", parentId: null, order: 11, status: "planned", phase: 11, description: "End-to-end business-requirement workflows." }),
  c({ id: "ultimate-challenge", slug: "ultimate-challenge", title: "Ultimate Challenge", parentId: null, order: 12, status: "planned", phase: 11, description: "Every component category on one page." }),
  c({ id: "nightmare-dom", slug: "nightmare-dom", title: "Nightmare DOM", parentId: null, order: 13, status: "planned", phase: 11, description: "Advanced combined locator/sync practice." }),

  // Platform
  c({ id: "analytics", slug: "analytics", title: "Analytics", parentId: null, order: 14, status: "planned", phase: 12, description: "Personal and platform-wide analytics." }),
  c({ id: "admin", slug: "admin", title: "Admin", parentId: null, order: 15, status: "planned", phase: 12, description: "Challenge/category/user administration." }),
];

export function getChildren(parentId: string | null): CategoryNode[] {
  return categories.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order);
}

export function getCategoryById(id: string): CategoryNode | undefined {
  return categories.find((c) => c.id === id);
}
