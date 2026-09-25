import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/apiClient";
import { Badge, Button, Card, FormField, inputBaseClasses } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type I18nLabEngineProps = { variant: string };

type LangCode = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "bn" | "mr";
type Language = { code: LangCode; label: string };
type LmtKeysResponse = { sessionId: string; language: LangCode; keys: Record<string, string> };

const PRODUCTS = [
  { id: "p1", name: "Wireless Earbuds", price: "$49.99", emoji: "\ud83c\udfa7" },
  { id: "p2", name: "4K Action Camera", price: "$129.00", emoji: "\ud83d\udcf7" },
  { id: "p3", name: "Ergonomic Office Chair", price: "$189.50", emoji: "\ud83e\ude91" },
];

/** ONE engine component for the "Internationalization (i18n)" category. */
export function I18nLabEngine({ variant }: I18nLabEngineProps) {
  switch (variant) {
    case "language-switcher-storefront":
      return <LanguageSwitcherStorefront />;
    default:
      return <p className="text-sm text-red-600">Unknown i18n-lab variant: {variant}</p>;
  }
}

function LanguageSwitcherStorefront() {
  const { setField } = useChallengeField();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [language, setLanguage] = useState<LangCode>("en");
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [verifyState, setVerifyState] = useState<"idle" | "checking" | "match" | "mismatch">("idle");

  const [cart, setCart] = useState<{ id: string; name: string; price: string; qty: number }[]>([]);
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [wishlistPanelOpen, setWishlistPanelOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    (async () => {
      const langRes = await apiRequest<{ languages: Language[] }>("/lmt/languages");
      setLanguages(langRes.languages);
      const keysRes = await apiRequest<LmtKeysResponse>("/lmt/keys");
      setSessionId(keysRes.sessionId);
      setLanguage(keysRes.language);
      setKeys(keysRes.keys);
    })();
  }, []);

  useEffect(() => {
    if (language === "en" || !keys.LOGIN_BTN) return;
    setField("selectedLanguage", language);
    setField("loginButtonText", keys.LOGIN_BTN);
    setField("addToCartButtonText", keys.ADD_TO_CART_BTN);
  }, [language, keys, setField]);

  const totalQty = cart.reduce((sum, line) => sum + line.qty, 0);

  useEffect(() => {
    if (totalQty > 0) setField("cartItemCount", totalQty);
  }, [totalQty, setField]);

  useEffect(() => {
    if (wishlist.size > 0) setField("wishlistToggled", true);
  }, [wishlist, setField]);

  const t = (key: string, fallback: string) => keys[key] ?? fallback;

  const selectLanguage = async (code: LangCode) => {
    setMenuOpen(false);
    setVerifyState("idle");
    await apiRequest("/lmt/language", { method: "POST", body: JSON.stringify({ language: code }) });
    const keysRes = await apiRequest<LmtKeysResponse>("/lmt/keys");
    setSessionId(keysRes.sessionId);
    setLanguage(keysRes.language);
    setKeys(keysRes.keys);
  };

  const verifyViaApi = async () => {
    setVerifyState("checking");
    const keysRes = await apiRequest<LmtKeysResponse>("/lmt/keys");
    const domText = document.querySelector('[data-testid="lang-login-link"]')?.textContent?.trim();
    const match = keysRes.language !== "en" && domText === keysRes.keys.LOGIN_BTN;
    setVerifyState(match ? "match" : "mismatch");
    if (match) setField("lmtApiVerified", true);
  };

  const addToCart = (p: (typeof PRODUCTS)[number]) => {
    setCart((c) => {
      const existing = c.find((line) => line.id === p.id);
      if (existing) return c.map((line) => (line.id === p.id ? { ...line, qty: line.qty + 1 } : line));
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((line) => line.id !== id));

  const buyNow = (p: (typeof PRODUCTS)[number]) => {
    addToCart(p);
    setOrderPlaced(p.name);
  };

  const checkout = () => {
    if (cart.length === 0) return;
    setOrderPlaced(cart.map((line) => `${line.name} x${line.qty}`).join(", "));
    setCart([]);
    setCartPanelOpen(false);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((w) => {
      const next = new Set(w);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createAccount = () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !address.trim()) {
      setAccountError(t("FIELD_REQUIRED_MSG", "All fields are required."));
      setAccountCreated(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setAccountError("Enter a valid email address.");
      setAccountCreated(false);
      return;
    }
    if (password.length < 6) {
      setAccountError("Password must be at least 6 characters.");
      setAccountCreated(false);
      return;
    }
    setAccountError("");
    setAccountCreated(true);
    setField("accountCreated", true);
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-4 text-sm text-slate-700">
        <p className="mb-1 font-semibold text-brand-800">Language Management &amp; Translation (LMT) storefront</p>
        <p>
          Nothing here is hardcoded per language: every label below is a stable LMT key (see each
          element's <code>data-lmt-key</code> attribute), and its displayed VALUE comes back from{" "}
          <code>GET /api/lmt/keys</code> for whichever language your session (<code>X-Session-Key</code>)
          currently has selected. Locate elements by <code>data-testid</code>/<code>data-lmt-key</code>,
          never by visible text &#8212; the text changes every time the language does. Cart, wishlist,
          account creation and checkout are fully working, exactly like a real storefront.
        </p>
      </div>

      {orderPlaced && (
        <div data-testid="order-confirmation-banner" className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          <span data-lmt-key="ORDER_PLACED_MSG">
            {t("ORDER_PLACED_MSG", "Order placed successfully!")} ({orderPlaced})
          </span>
          <button data-testid="order-confirmation-close" onClick={() => setOrderPlaced(null)} className="text-xs font-medium hover:underline">
            {"\u2715"}
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 px-4 py-3 text-white">
          <span data-testid="lang-lab-logo" className="text-base font-bold">QAMart</span>
          <span data-testid="lang-delivery-text" data-lmt-key="DELIVERY_TEXT" className="hidden text-xs text-slate-300 sm:inline">
            {t("DELIVERY_TEXT", "Delivering to Bengaluru 560066")}
          </span>
          <input
            data-testid="lang-search-input"
            data-lmt-key="SEARCH_PLACEHOLDER"
            placeholder={t("SEARCH_PLACEHOLDER", "Search products\u2026")}
            className="min-w-0 flex-1 rounded-md border-0 px-3 py-1.5 text-sm text-slate-900"
          />
          <div className="relative">
            <button
              data-testid="lang-switcher-btn"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-md border border-slate-600 px-2 py-1.5 text-xs font-medium hover:bg-slate-800"
            >
              {language.toUpperCase()} {"\u25be"}
            </button>
            {menuOpen && (
              <div data-testid="lang-switcher-panel" className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-slate-200 bg-white p-1 text-slate-700 shadow-lg">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    data-testid={`lang-option-${l.code}`}
                    onClick={() => selectLanguage(l.code)}
                    className={`block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100 ${l.code === language ? "font-semibold text-brand-700" : ""}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {loggedIn ? (
            <button data-testid="lang-login-link" data-lmt-key="SIGNOUT_BTN" onClick={() => setLoggedIn(false)} className="text-xs font-medium hover:underline">
              {t("SIGNOUT_BTN", "Sign Out")}
            </button>
          ) : (
            <button data-testid="lang-login-link" data-lmt-key="LOGIN_BTN" onClick={() => setLoggedIn(true)} className="text-xs font-medium hover:underline">
              {t("LOGIN_BTN", "Login")}
            </button>
          )}
          <div className="relative">
            <button data-testid="lang-wishlist-link" data-lmt-key="WISHLIST_LABEL" onClick={() => setWishlistPanelOpen((o) => !o)} className="text-xs hover:underline">
              {wishlist.size > 0 ? "\u2665" : "\u2661"} {t("WISHLIST_LABEL", "Wishlist")} ({wishlist.size})
            </button>
            {wishlistPanelOpen && (
              <div data-testid="lang-wishlist-panel" className="absolute right-0 top-full z-10 mt-1 w-52 rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-lg">
                {wishlist.size === 0 ? (
                  <p className="px-1 py-1 text-xs text-slate-400">{t("CART_EMPTY_MSG", "Nothing here yet")}</p>
                ) : (
                  PRODUCTS.filter((p) => wishlist.has(p.id)).map((p) => (
                    <p key={p.id} className="px-1 py-1 text-xs">{p.name}</p>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <button data-testid="lang-cart-link" data-lmt-key="CART_LABEL" onClick={() => setCartPanelOpen((o) => !o)} className="text-xs hover:underline">
              {"\ud83d\uded2"} {t("CART_LABEL", "Cart")} ({totalQty})
            </button>
            {cartPanelOpen && (
              <div data-testid="lang-cart-panel" className="absolute right-0 top-full z-10 mt-1 w-64 rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-lg">
                {cart.length === 0 ? (
                  <p className="px-1 py-1 text-xs text-slate-400" data-lmt-key="CART_EMPTY_MSG">{t("CART_EMPTY_MSG", "Your cart is empty")}</p>
                ) : (
                  <>
                    {cart.map((line) => (
                      <div key={line.id} data-testid={`lang-cart-line-${line.id}`} className="flex items-center justify-between gap-2 border-b border-slate-100 px-1 py-1.5 text-xs last:border-0">
                        <span>{line.name} x{line.qty}</span>
                        <button data-testid={`lang-cart-remove-${line.id}`} data-lmt-key="REMOVE_BTN" onClick={() => removeFromCart(line.id)} className="text-red-600 hover:underline">
                          {t("REMOVE_BTN", "Remove")}
                        </button>
                      </div>
                    ))}
                    <button data-testid="lang-checkout-btn" data-lmt-key="CHECKOUT_BTN" onClick={checkout} className="mt-2 w-full rounded-md bg-brand-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                      {t("CHECKOUT_BTN", "Checkout")}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
          <span data-testid="lang-nav-home" data-lmt-key="HOME_NAV">{t("HOME_NAV", "Home")}</span>
          <span data-testid="lang-nav-deals" data-lmt-key="DEALS_NAV">{t("DEALS_NAV", "Deals")}</span>
          <span data-testid="lang-nav-electronics" data-lmt-key="ELECTRONICS_NAV">{t("ELECTRONICS_NAV", "Electronics")}</span>
          <span data-testid="lang-nav-fashion" data-lmt-key="FASHION_NAV">{t("FASHION_NAV", "Fashion")}</span>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>
              Session ID: <code data-testid="lmt-session-id-display">{sessionId || "\u2014"}</code>
            </span>
            <span>
              Current language: <code data-testid="lmt-current-language-display">{language}</code>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="relative rounded-lg border border-slate-200 p-3 text-center">
                <button
                  data-testid={`lang-wishlist-toggle-${p.id}`}
                  onClick={() => toggleWishlist(p.id)}
                  aria-label="Toggle wishlist"
                  className="absolute right-2 top-2 text-base text-red-500"
                >
                  {wishlist.has(p.id) ? "\u2665" : "\u2661"}
                </button>
                <div className="text-3xl">{p.emoji}</div>
                <p className="mt-1 text-sm font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500">
                  <span data-lmt-key="PRICE_LABEL">{t("PRICE_LABEL", "Price")}</span>: {p.price}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  <span data-lmt-key="QUANTITY_LABEL">{t("QUANTITY_LABEL", "Quantity")}</span>: {cart.find((line) => line.id === p.id)?.qty ?? 1}
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    data-testid={`lang-add-to-cart-btn-${p.id}`}
                    data-lmt-key="ADD_TO_CART_BTN"
                    onClick={() => addToCart(p)}
                    className="rounded-md bg-amber-400 px-2 py-1 text-xs font-medium text-slate-900 hover:bg-amber-500"
                  >
                    {t("ADD_TO_CART_BTN", "Add to Cart")}
                  </button>
                  <button
                    data-testid={`lang-buy-now-btn-${p.id}`}
                    data-lmt-key="BUY_NOW_BTN"
                    onClick={() => buyNow(p)}
                    className="rounded-md bg-orange-500 px-2 py-1 text-xs font-medium text-white hover:bg-orange-600"
                  >
                    {t("BUY_NOW_BTN", "Buy Now")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800" data-lmt-key="CREATE_ACCOUNT_BTN">
              {t("CREATE_ACCOUNT_BTN", "Create Account")}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label={t("FULL_NAME_LABEL", "Full Name")} htmlFor="lang-full-name">
                <input id="lang-full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} data-testid="lang-full-name-input" data-lmt-key="FULL_NAME_LABEL" className={inputBaseClasses} />
              </FormField>
              <FormField label={t("EMAIL_LABEL", "Email Address")} htmlFor="lang-email">
                <input id="lang-email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="lang-email-input" data-lmt-key="EMAIL_LABEL" className={inputBaseClasses} />
              </FormField>
              <FormField label={t("PASSWORD_LABEL", "Password")} htmlFor="lang-password">
                <input id="lang-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="lang-password-input" data-lmt-key="PASSWORD_LABEL" className={inputBaseClasses} />
              </FormField>
              <FormField label={t("ADDRESS_LABEL", "Delivery Address")} htmlFor="lang-address">
                <input id="lang-address" value={address} onChange={(e) => setAddress(e.target.value)} data-testid="lang-address-input" data-lmt-key="ADDRESS_LABEL" className={inputBaseClasses} />
              </FormField>
            </div>
            <label className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} data-testid="lang-remember-me-checkbox" data-lmt-key="REMEMBER_ME_LABEL" />
              {t("REMEMBER_ME_LABEL", "Remember me")}
            </label>
            <label className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} data-testid="lang-subscribe-checkbox" data-lmt-key="SUBSCRIBE_LABEL" />
              {t("SUBSCRIBE_LABEL", "Subscribe to newsletter")}
            </label>
            {accountError && <p data-testid="lang-account-error" className="mt-2 text-xs font-medium text-red-600">{accountError}</p>}
            {accountCreated && (
              <p data-testid="lang-account-success" data-lmt-key="ACCOUNT_CREATED_MSG" className="mt-2 text-xs font-medium text-emerald-700">
                {t("ACCOUNT_CREATED_MSG", "Account created successfully!")}
              </p>
            )}
            <Button size="sm" className="mt-3" data-testid="lang-create-account-btn" data-lmt-key="CREATE_ACCOUNT_BTN" onClick={createAccount}>
              {t("CREATE_ACCOUNT_BTN", "Create Account")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 p-3">
            <Button size="sm" variant="secondary" data-testid="verify-lmt-api-btn" loading={verifyState === "checking"} onClick={verifyViaApi}>
              Verify via LMT API
            </Button>
            {verifyState === "match" && <Badge tone="success">API confirms displayed text matches GET /api/lmt/keys</Badge>}
            {verifyState === "mismatch" && <Badge tone="danger">Mismatch {"\u2014"} switch to a non-English language first</Badge>}
            <span data-testid="lmt-verify-result" className="sr-only">{verifyState}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <span data-testid="lang-footer-about" data-lmt-key="ABOUT_US_LINK">{t("ABOUT_US_LINK", "About Us")}</span>
          <span data-testid="lang-footer-contact" data-lmt-key="CONTACT_US_LINK">{t("CONTACT_US_LINK", "Contact Us")}</span>
          <span data-testid="lang-footer-terms" data-lmt-key="TERMS_LINK">{t("TERMS_LINK", "Terms & Conditions")}</span>
          <span data-testid="lang-footer-privacy" data-lmt-key="PRIVACY_LINK">{t("PRIVACY_LINK", "Privacy Policy")}</span>
        </div>
      </Card>
    </div>
  );
}
