import type { ChallengeDefinition } from "../../challenge-schema";

/**
 * Internationalization / Language Management & Translation (LMT) testing
 * (Real Applications, spec #49 extension). A language-switcher storefront
 * modeled on real e-commerce sites (e.g. Amazon's language picker): every
 * label is a stable LMT key backed by `GET/POST /api/lmt/*`, and switching
 * language changes ONLY the displayed values, never the underlying
 * data-testid/data-lmt-key locators — the exact real-world pattern QA teams
 * hit when a product goes multi-language. Uses the `i18n-lab` engine component.
 */
export const internationalizationChallenges: ChallengeDefinition[] = [
  {
    id: "LANG-001",
    title: "Multi-Language Storefront \u2014 LMT Key/Value API",
    categoryId: "internationalization",
    component: "i18n-lab",
    variant: "language-switcher-storefront",
    behavior: ["api", "dynamic"],
    environment: ["none"],
    dataSource: "api/lmt",
    difficulty: "hard",
    frameworks: ["selenium", "playwright", "cypress", "generic-api"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "A fully working storefront header/nav/product-grid/account-form/footer where every visible label is driven by a translation KEY (e.g. LOGIN_BTN, ADD_TO_CART_BTN), not a hardcoded string. On load, the page calls GET /api/lmt/languages and GET /api/lmt/keys (the latter scoped to your browser tab's X-Session-Key, exactly like the existing flaky/failure lab endpoints) to render the current language's values. Picking a language from the switcher calls POST /api/lmt/language { language }, then re-fetches GET /api/lmt/keys \u2014 only the rendered TEXT changes; every element's data-testid and data-lmt-key attribute stay fixed across every language, including English. Add to Cart/Buy Now/wishlist heart toggles/Checkout/Create Account all perform REAL state changes (cart line items with quantities and Remove buttons, a wishlist count, an order-confirmation banner, client-side account-form validation) exactly like a real e-commerce site, not decorative buttons.",
      dataNeeded: "A supported language code: en, hi, ta, te, kn, ml, bn, mr (shown in the switcher as English/\u0939\u093f\u0928\u094d\u0926\u0940/\u0ba4\u0bae\u0bbf\u0bb4\u0bcd/\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41/\u0c95\u0ca8\u0ccd\u0ca8\u0ca1/\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02/\u09ac\u09be\u0982\u09b2\u09be/\u092e\u0930\u093e\u0920\u0940).",
      action:
        "Open the language switcher (data-testid=\"lang-switcher-btn\") and pick \"\u0939\u093f\u0928\u094d\u0926\u0940 - HI\" (data-testid=\"lang-option-hi\"). Confirm the Login link and both product \"Add to Cart\" buttons re-render in Hindi without their data-testid changing. Click \"Add to Cart\" on any product (updates the header Cart count and shows a Remove button in the cart panel), toggle a product's wishlist heart (updates the header Wishlist count), and fill in + submit the Create Account form with valid values. Then click \"Verify via LMT API\" (data-testid=\"verify-lmt-api-btn\") \u2014 it independently calls GET /api/lmt/keys with your session and compares the returned LOGIN_BTN value against the DOM.",
      expectedResult:
        "The Login link reads \u0932\u0949\u0917 \u0907\u0928 and both Add to Cart buttons read \u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u0921\u093e\u0932\u0947\u0902; the Cart badge shows a real item count, the Wishlist badge shows a real count, the account form shows a success message, and \"Verify via LMT API\" shows a green \"matches\" badge.",
      validationPoints: [
        "selectedLanguage equals \"hi\"",
        "loginButtonText equals the LMT dictionary's Hindi value for LOGIN_BTN",
        "addToCartButtonText equals the LMT dictionary's Hindi value for ADD_TO_CART_BTN",
        "lmtApiVerified is true (only set after an independent API call confirms the DOM text, not just the language flag)",
        "cartItemCount is at least 1 (a real Add to Cart/Buy Now click, not a decorative button)",
        "wishlistToggled is true (a real wishlist heart toggle)",
        "accountCreated is true (the account form's own client-side validation passed)",
      ],
      automationConcepts: [
        "Never locate elements by visible text in a multi-language app \u2014 locate by a stable attribute (data-testid/data-lmt-key) instead",
        "Independently verifying rendered UI text against the backend's own source of truth (the translation API), rather than hardcoding expected strings per language in test code",
        "Session-scoped state carried via a request header (X-Session-Key) rather than a login-bound cookie \u2014 the same key an automation script must forward on every call to see consistent results",
        "Designing translation systems around stable KEYS with changing VALUES, so tests written against one language don't need to be rewritten for another",
      ],
      edgeCases: [
        "The exact same LOGIN_BTN/ADD_TO_CART_BTN element ids and data-testid values are used in every language \u2014 only GET /api/lmt/keys' returned VALUE changes, proving the locator strategy is language-independent.",
        "Calling GET /api/lmt/keys without ever having called POST /api/lmt/language returns the \"en\" defaults \u2014 language state is session-scoped, not global, so two tabs with different X-Session-Key values can show two different languages simultaneously.",
        "Product names and the QAMart logo are intentionally NOT translated (realistic \u2014 real e-commerce sites usually leave brand/product names as-is).",
      ],
      hints: [
        "The current tab's X-Session-Key is the same value shown in the on-page \"Session ID\" panel \u2014 also visible in DevTools \u2192 Network \u2192 any /api/* request's request headers.",
        "If \"Verify via LMT API\" shows a mismatch, check you actually switched away from English first \u2014 the check intentionally fails on the English default to prove it isn't a no-op.",
      ],
    },
    validation: [
      { kind: "equals", field: "selectedLanguage", expected: "hi" },
      { kind: "equals", field: "loginButtonText", expected: "\u0932\u0949\u0917 \u0907\u0928" },
      { kind: "equals", field: "addToCartButtonText", expected: "\u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u0921\u093e\u0932\u0947\u0902" },
      { kind: "truthy", field: "lmtApiVerified" },
      { kind: "range", field: "cartItemCount", min: 1 },
      { kind: "truthy", field: "wishlistToggled" },
      { kind: "truthy", field: "accountCreated" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 8,
    resettable: true,
    isActive: true,
  },
];
