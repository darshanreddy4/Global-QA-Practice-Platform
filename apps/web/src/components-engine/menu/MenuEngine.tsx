import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type MenuEngineProps = { variant: string };

/** ONE engine component for the entire "Menus & Navigation" category. */
export function MenuEngine({ variant }: MenuEngineProps) {
  switch (variant) {
    case "multi-level-dropdown-nav":
      return <MultiLevelDropdownNav />;
    case "mobile-hamburger-collapsible":
      return <MobileHamburgerCollapsible />;
    case "side-nav-adjacent-submenu":
      return <SideNavAdjacentSubmenu />;
    case "enterprise-hover-collapse-sidenav":
      return <EnterpriseHoverCollapseSideNav />;
    default:
      return <p className="text-sm text-red-600">Unknown menu variant: {variant}</p>;
  }
}

type Destination = { breadcrumb: string[]; title: string; body: string };

const DESTINATIONS: Record<string, Destination> = {
  "/products": { breadcrumb: ["Home", "Products"], title: "All Products", body: "Browse our full product catalog." },
  "/products/electronics/laptops": { breadcrumb: ["Home", "Products", "Electronics", "Laptops"], title: "Laptops", body: "Ultrabooks, gaming laptops, and 2-in-1 convertibles." },
  "/products/electronics/phones": { breadcrumb: ["Home", "Products", "Electronics", "Phones"], title: "Phones", body: "The latest smartphones from every major brand." },
  "/products/electronics/cameras": { breadcrumb: ["Home", "Products", "Electronics", "Cameras"], title: "Cameras", body: "Mirrorless, DSLR, and action cameras." },
  "/products/home-kitchen/furniture": { breadcrumb: ["Home", "Products", "Home & Kitchen", "Furniture"], title: "Furniture", body: "Sofas, desks, and storage for every room." },
  "/products/home-kitchen/appliances": { breadcrumb: ["Home", "Products", "Home & Kitchen", "Appliances"], title: "Appliances", body: "Refrigerators, ovens, and small kitchen appliances." },
  "/company/about": { breadcrumb: ["Home", "Company", "About Us"], title: "About Us", body: "We build tools that help QA teams practice for real." },
  "/company/careers": { breadcrumb: ["Home", "Company", "Careers"], title: "Careers", body: "Open roles across engineering, QA, and design." },
  "/company/contact": { breadcrumb: ["Home", "Company", "Contact"], title: "Contact", body: "Reach our support team 24/7." },
  "/support/help-center": { breadcrumb: ["Home", "Support", "Help Center"], title: "Help Center", body: "Search articles or open a ticket." },
  "/support/track-order": { breadcrumb: ["Home", "Support", "Track Order"], title: "Track Order", body: "Enter your order number to see its status." },
};

/** Real, assertable navigation: the destination lives in an actual URL query param. */
function useMenuNavigation() {
  const { setField } = useChallengeField();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = searchParams.get("page");

  const openPage = (path: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", path);
      return next;
    });
    setField("visitedPath", path);
  };

  return { currentPath, openPage };
}

function PageOutlet({ currentPath }: { currentPath: string | null }) {
  if (!currentPath || !DESTINATIONS[currentPath]) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400" data-testid="page-outlet-empty">
        No page open yet — use the menu above to navigate somewhere.
      </div>
    );
  }
  const dest = DESTINATIONS[currentPath];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5" data-testid="page-outlet">
      <p className="mb-1 text-xs text-slate-400" data-testid="page-breadcrumb">{dest.breadcrumb.join(" / ")}</p>
      <h3 className="mb-1 text-lg font-semibold text-slate-800" data-testid="page-title">{dest.title}</h3>
      <p className="text-sm text-slate-600">{dest.body}</p>
    </div>
  );
}

// ---------- Variant 1: Multi-level dropdown nav (desktop e-commerce header) ----------

function MultiLevelDropdownNav() {
  const { currentPath, openPage } = useMenuNavigation();
  const [openTopMenu, setOpenTopMenu] = useState<string | null>(null);
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openTopMenu) return;
    const onDocumentMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenTopMenu(null);
        setOpenFlyout(null);
      }
    };
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, [openTopMenu]);

  const toggleTopMenu = (name: string) => {
    setOpenFlyout(null);
    setOpenTopMenu((cur) => (cur === name ? null : name));
  };

  const select = (path: string) => {
    openPage(path);
    setOpenTopMenu(null);
    setOpenFlyout(null);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <nav className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-sm" aria-label="Primary site navigation">
        <div className="relative">
          <button
            type="button"
            data-testid="nav-products-trigger"
            aria-haspopup="true"
            aria-expanded={openTopMenu === "products"}
            onClick={() => toggleTopMenu("products")}
            className="rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Products
          </button>
          {openTopMenu === "products" && (
            <div data-testid="nav-products-menu" role="menu" className="absolute left-0 z-20 mt-1 w-56 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg">
              <button type="button" data-testid="menu-item-all-products" role="menuitem" onClick={() => select("/products")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">
                All Products
              </button>
              <div className="relative">
                <button
                  type="button"
                  data-testid="nav-electronics-trigger"
                  aria-haspopup="true"
                  aria-expanded={openFlyout === "electronics"}
                  onClick={() => setOpenFlyout((cur) => (cur === "electronics" ? null : "electronics"))}
                  className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left hover:bg-slate-50"
                >
                  Electronics <span aria-hidden="true">&rsaquo;</span>
                </button>
                {openFlyout === "electronics" && (
                  <div data-testid="nav-electronics-submenu" role="menu" className="absolute left-full top-0 z-30 ml-1 w-44 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg">
                    <button type="button" data-testid="menu-item-laptops" role="menuitem" onClick={() => select("/products/electronics/laptops")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Laptops</button>
                    <button type="button" data-testid="menu-item-phones" role="menuitem" onClick={() => select("/products/electronics/phones")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Phones</button>
                    <button type="button" data-testid="menu-item-cameras" role="menuitem" onClick={() => select("/products/electronics/cameras")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Cameras</button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  data-testid="nav-home-kitchen-trigger"
                  aria-haspopup="true"
                  aria-expanded={openFlyout === "home-kitchen"}
                  onClick={() => setOpenFlyout((cur) => (cur === "home-kitchen" ? null : "home-kitchen"))}
                  className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left hover:bg-slate-50"
                >
                  Home &amp; Kitchen <span aria-hidden="true">&rsaquo;</span>
                </button>
                {openFlyout === "home-kitchen" && (
                  <div data-testid="nav-home-kitchen-submenu" role="menu" className="absolute left-full top-0 z-30 ml-1 w-44 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg">
                    <button type="button" data-testid="menu-item-furniture" role="menuitem" onClick={() => select("/products/home-kitchen/furniture")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Furniture</button>
                    <button type="button" data-testid="menu-item-appliances" role="menuitem" onClick={() => select("/products/home-kitchen/appliances")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Appliances</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            data-testid="nav-company-trigger"
            aria-haspopup="true"
            aria-expanded={openTopMenu === "company"}
            onClick={() => toggleTopMenu("company")}
            className="rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Company
          </button>
          {openTopMenu === "company" && (
            <div data-testid="nav-company-menu" role="menu" className="absolute left-0 z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg">
              <button type="button" data-testid="menu-item-about" role="menuitem" onClick={() => select("/company/about")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">About Us</button>
              <button type="button" data-testid="menu-item-careers" role="menuitem" onClick={() => select("/company/careers")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Careers</button>
              <button type="button" data-testid="menu-item-contact" role="menuitem" onClick={() => select("/company/contact")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Contact</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            data-testid="nav-support-trigger"
            aria-haspopup="true"
            aria-expanded={openTopMenu === "support"}
            onClick={() => toggleTopMenu("support")}
            className="rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Support
          </button>
          {openTopMenu === "support" && (
            <div data-testid="nav-support-menu" role="menu" className="absolute left-0 z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg">
              <button type="button" data-testid="menu-item-help-center" role="menuitem" onClick={() => select("/support/help-center")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Help Center</button>
              <button type="button" data-testid="menu-item-track-order" role="menuitem" onClick={() => select("/support/track-order")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50">Track Order</button>
            </div>
          )}
        </div>
      </nav>

      <PageOutlet currentPath={currentPath} />
    </div>
  );
}

// ---------- Variant 2: Mobile hamburger + collapsible sections ----------

function MobileHamburgerCollapsible() {
  const { currentPath, openPage } = useMenuNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const select = (path: string) => {
    openPage(path);
    setDrawerOpen(false);
    setExpandedSection(null);
  };

  return (
    <div className="max-w-sm space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <button
          type="button"
          data-testid="hamburger-toggle"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span aria-hidden="true">{"\u2630"}</span> Menu
        </button>

        {drawerOpen && (
          <div data-testid="mobile-drawer" className="mt-2 space-y-1 border-t border-slate-100 pt-2">
            <button
              type="button"
              data-testid="section-company-toggle"
              aria-expanded={expandedSection === "company"}
              onClick={() => setExpandedSection((cur) => (cur === "company" ? null : "company"))}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Company <span aria-hidden="true">{expandedSection === "company" ? "\u2212" : "+"}</span>
            </button>
            {expandedSection === "company" && (
              <div className="ml-3 space-y-0.5 border-l border-slate-100 pl-3">
                <button type="button" data-testid="mobile-menu-item-about" onClick={() => select("/company/about")} className="block w-full rounded px-2 py-1 text-left text-sm text-slate-600 hover:bg-slate-50">About Us</button>
                <button type="button" data-testid="mobile-menu-item-careers" onClick={() => select("/company/careers")} className="block w-full rounded px-2 py-1 text-left text-sm text-slate-600 hover:bg-slate-50">Careers</button>
              </div>
            )}

            <button
              type="button"
              data-testid="section-support-toggle"
              aria-expanded={expandedSection === "support"}
              onClick={() => setExpandedSection((cur) => (cur === "support" ? null : "support"))}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Support <span aria-hidden="true">{expandedSection === "support" ? "\u2212" : "+"}</span>
            </button>
            {expandedSection === "support" && (
              <div className="ml-3 space-y-0.5 border-l border-slate-100 pl-3">
                <button type="button" data-testid="mobile-menu-item-help-center" onClick={() => select("/support/help-center")} className="block w-full rounded px-2 py-1 text-left text-sm text-slate-600 hover:bg-slate-50">Help Center</button>
                <button type="button" data-testid="mobile-menu-item-track-order" onClick={() => select("/support/track-order")} className="block w-full rounded px-2 py-1 text-left text-sm text-slate-600 hover:bg-slate-50">Track Order</button>
              </div>
            )}
          </div>
        )}
      </div>

      <PageOutlet currentPath={currentPath} />
    </div>
  );
}

// ---------- Variant 3: Side navigation with an adjacent submenu panel ----------

const SIDE_ITEMS = ["products", "company", "support"] as const;
type SideItem = (typeof SIDE_ITEMS)[number];
const SIDE_ITEM_LABELS: Record<SideItem, string> = { products: "Products", company: "Company", support: "Support" };

function SideNavAdjacentSubmenu() {
  const { currentPath, openPage } = useMenuNavigation();
  const [activeItem, setActiveItem] = useState<SideItem | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const selectItem = (item: SideItem) => {
    setExpandedGroup(null);
    setActiveItem((cur) => (cur === item ? null : item));
  };

  // Selecting a leaf keeps the sidebar + submenu panel open and highlights the
  // active trail, matching how a real persistent app sidebar (e.g. an admin
  // dashboard) behaves — unlike the click-to-close dropdown/drawer variants above.
  const selectLeaf = (path: string) => {
    openPage(path);
  };

  return (
    <div className="flex items-start gap-4" data-testid="side-nav-root">
      <nav className="w-40 shrink-0 rounded-l-lg border border-slate-200 bg-white p-1.5 text-sm" aria-label="Side navigation">
        {SIDE_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            data-testid={`sidemenu-item-${item}`}
            aria-current={activeItem === item ? "true" : undefined}
            aria-expanded={activeItem === item}
            onClick={() => selectItem(item)}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-medium ${
              activeItem === item ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {SIDE_ITEM_LABELS[item]} <span aria-hidden="true">&rsaquo;</span>
          </button>
        ))}
      </nav>

      {activeItem && (
        <div
          data-testid="sidemenu-submenu-panel"
          className="w-52 shrink-0 rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 p-1.5 text-sm"
        >
          {activeItem === "products" && (
            <>
              <button type="button" data-testid="sidemenu-leaf-all-products" aria-current={currentPath === "/products" ? "true" : undefined} onClick={() => selectLeaf("/products")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-white">
                All Products
              </button>
              <button
                type="button"
                data-testid="sidemenu-group-electronics-toggle"
                aria-expanded={expandedGroup === "electronics"}
                onClick={() => setExpandedGroup((cur) => (cur === "electronics" ? null : "electronics"))}
                className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left font-medium text-slate-700 hover:bg-white"
              >
                Electronics <span aria-hidden="true">{expandedGroup === "electronics" ? "\u2212" : "+"}</span>
              </button>
              {expandedGroup === "electronics" && (
                <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-3">
                  <button type="button" data-testid="sidemenu-leaf-laptops" aria-current={currentPath === "/products/electronics/laptops" ? "true" : undefined} onClick={() => selectLeaf("/products/electronics/laptops")} className="block w-full rounded px-2 py-1 text-left hover:bg-white">Laptops</button>
                  <button type="button" data-testid="sidemenu-leaf-phones" aria-current={currentPath === "/products/electronics/phones" ? "true" : undefined} onClick={() => selectLeaf("/products/electronics/phones")} className="block w-full rounded px-2 py-1 text-left hover:bg-white">Phones</button>
                  <button type="button" data-testid="sidemenu-leaf-cameras" aria-current={currentPath === "/products/electronics/cameras" ? "true" : undefined} onClick={() => selectLeaf("/products/electronics/cameras")} className="block w-full rounded px-2 py-1 text-left hover:bg-white">Cameras</button>
                </div>
              )}
              <button
                type="button"
                data-testid="sidemenu-group-home-kitchen-toggle"
                aria-expanded={expandedGroup === "home-kitchen"}
                onClick={() => setExpandedGroup((cur) => (cur === "home-kitchen" ? null : "home-kitchen"))}
                className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left font-medium text-slate-700 hover:bg-white"
              >
                Home &amp; Kitchen <span aria-hidden="true">{expandedGroup === "home-kitchen" ? "\u2212" : "+"}</span>
              </button>
              {expandedGroup === "home-kitchen" && (
                <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-3">
                  <button type="button" data-testid="sidemenu-leaf-furniture" aria-current={currentPath === "/products/home-kitchen/furniture" ? "true" : undefined} onClick={() => selectLeaf("/products/home-kitchen/furniture")} className="block w-full rounded px-2 py-1 text-left hover:bg-white">Furniture</button>
                  <button type="button" data-testid="sidemenu-leaf-appliances" aria-current={currentPath === "/products/home-kitchen/appliances" ? "true" : undefined} onClick={() => selectLeaf("/products/home-kitchen/appliances")} className="block w-full rounded px-2 py-1 text-left hover:bg-white">Appliances</button>
                </div>
              )}
            </>
          )}

          {activeItem === "company" && (
            <>
              <button type="button" data-testid="sidemenu-leaf-about" aria-current={currentPath === "/company/about" ? "true" : undefined} onClick={() => selectLeaf("/company/about")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-white">About Us</button>
              <button type="button" data-testid="sidemenu-leaf-careers" aria-current={currentPath === "/company/careers" ? "true" : undefined} onClick={() => selectLeaf("/company/careers")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-white">Careers</button>
              <button type="button" data-testid="sidemenu-leaf-contact" aria-current={currentPath === "/company/contact" ? "true" : undefined} onClick={() => selectLeaf("/company/contact")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-white">Contact</button>
            </>
          )}

          {activeItem === "support" && (
            <>
              <button type="button" data-testid="sidemenu-leaf-help-center" aria-current={currentPath === "/support/help-center" ? "true" : undefined} onClick={() => selectLeaf("/support/help-center")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-white">Help Center</button>
              <button type="button" data-testid="sidemenu-leaf-track-order" aria-current={currentPath === "/support/track-order" ? "true" : undefined} onClick={() => selectLeaf("/support/track-order")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-white">Track Order</button>
            </>
          )}
        </div>
      )}

      <div className="flex-1">
        <PageOutlet currentPath={currentPath} />
      </div>
    </div>
  );
}

// ---------- Variant 4: Enterprise hover-to-reveal side nav that collapses after navigation ----------

type EnterpriseLeaf = { path: string; label: string; testid: string };

const ENTERPRISE_SUBMENU: Record<SideItem, EnterpriseLeaf[]> = {
  products: [
    { path: "/products", label: "All Products", testid: "all-products" },
    { path: "/products/electronics/laptops", label: "Laptops", testid: "laptops" },
    { path: "/products/electronics/phones", label: "Phones", testid: "phones" },
    { path: "/products/electronics/cameras", label: "Cameras", testid: "cameras" },
    { path: "/products/home-kitchen/furniture", label: "Furniture", testid: "furniture" },
    { path: "/products/home-kitchen/appliances", label: "Appliances", testid: "appliances" },
  ],
  company: [
    { path: "/company/about", label: "About Us", testid: "about" },
    { path: "/company/careers", label: "Careers", testid: "careers" },
    { path: "/company/contact", label: "Contact", testid: "contact" },
  ],
  support: [
    { path: "/support/help-center", label: "Help Center", testid: "help-center" },
    { path: "/support/track-order", label: "Track Order", testid: "track-order" },
  ],
};

function EnterpriseHoverCollapseSideNav() {
  const { currentPath, openPage } = useMenuNavigation();
  const [hoveredItem, setHoveredItem] = useState<SideItem | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { setField } = useChallengeField();
  // Debounce the close so briefly crossing the (now-zero-width) gap between the
  // trigger and its flyout while moving the mouse never prematurely hides the menu.
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openSubmenu = (item: SideItem) => {
    clearCloseTimer();
    setHoveredItem(item);
  };

  const scheduleCloseSubmenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setHoveredItem(null), 200);
  };

  useEffect(() => clearCloseTimer, []);

  const select = (path: string) => {
    clearCloseTimer();
    openPage(path);
    setHoveredItem(null);
    // Real enterprise nav pattern: navigating away auto-collapses the rail to give the page more room.
    setCollapsed(true);
    setField("sidebarCollapsedAfterSelect", true);
  };

  return (
    <div className="flex items-start gap-4" data-testid="enterprise-sidenav-root">
      <div className="shrink-0">
        <div className="mb-1 flex justify-end">
          <button
            type="button"
            data-testid="enterprise-sidenav-toggle"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            onClick={() => setCollapsed((v) => !v)}
            className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-100"
          >
            {collapsed ? "\u00bb" : "\u00ab"}
          </button>
        </div>
        <nav
          data-testid="enterprise-sidenav"
          aria-label="Enterprise side navigation"
          className={`space-y-0.5 rounded-lg border border-slate-200 bg-white p-1.5 text-sm transition-all ${collapsed ? "w-12" : "w-44"}`}
        >
          {SIDE_ITEMS.map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => openSubmenu(item)}
              onMouseLeave={scheduleCloseSubmenu}
            >
              <button
                type="button"
                data-testid={`enterprise-nav-item-${item}`}
                aria-haspopup="true"
                aria-expanded={hoveredItem === item}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-100"
              >
                {collapsed ? SIDE_ITEM_LABELS[item][0] : SIDE_ITEM_LABELS[item]}
                {!collapsed && <span aria-hidden="true">&rsaquo;</span>}
              </button>

              {/* Always mounted (not conditionally rendered) so the open/close transition can actually
                  slide, and positioned flush against the trigger (no gap) so the cursor never crosses
                  dead space to reach it. onMouseEnter/Leave are duplicated here so hovering the flyout
                  itself also keeps it open, exactly like hovering the trigger does. */}
              <div
                data-testid={`enterprise-submenu-${item}`}
                role="menu"
                onMouseEnter={() => openSubmenu(item)}
                onMouseLeave={scheduleCloseSubmenu}
                className={`absolute left-full top-0 z-30 w-48 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg transition-all duration-150 ease-out ${
                  hoveredItem === item
                    ? "visible translate-x-0 opacity-100"
                    : "invisible -translate-x-2 opacity-0"
                }`}
              >
                {ENTERPRISE_SUBMENU[item].map((leaf) => (
                  <button
                    key={leaf.path}
                    type="button"
                    data-testid={`enterprise-leaf-${leaf.testid}`}
                    role="menuitem"
                    onClick={() => select(leaf.path)}
                    className="block w-full rounded px-3 py-1.5 text-left hover:bg-slate-50"
                  >
                    {leaf.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <PageOutlet currentPath={currentPath} />
      </div>
    </div>
  );
}
