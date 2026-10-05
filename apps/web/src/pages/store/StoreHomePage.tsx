import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button } from "../../design-system";
import { useStoreCartStore } from "../../store/storeCartStore";
import { postStoreEvent } from "../../services/storeBroadcast";
import { PRODUCTS, CATEGORIES } from "./storeData";

const COMPARE_PRODUCT_IDS = ["f1", "f4", "f6"]; // Nike Air Runner, Reebok Classic Move, Bata Everyday Walk
const COMPARE_ATTRIBUTES = ["Best Price", "Top Rated", "Fast Delivery"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Standalone real storefront (opened in its own tab from ECOM-001) \u2014 a real,
 * multi-page e-commerce site: browse/search/filter/favorite/add-to-cart here,
 * checkout on /store/checkout, track delivery on /store/orders/:id. Every
 * milestone is broadcast back to the ECOM-001 mission tab via BroadcastChannel
 * so its self-check can validate real actions taken on this separate site. */
export function StoreHomePage() {
  const { favorites, cart, toggleFavorite, addToCart } = useStoreCartStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [compareSelections, setCompareSelections] = useState<Record<string, boolean>>({});
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const toggleCompareCell = (productId: string, attr: string) => {
    const key = `${productId}__${attr}`;
    setCompareSelections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /** Product matches a free-text query by product name (incl. brand, which is embedded
   * in the name, e.g. "Nike" in "Nike Air Runner") OR by category — all substring/"contains",
   * case-insensitive, so partial words like "run" or a whole category like "Footwear" both work. */
  const matchesQuery = (p: (typeof PRODUCTS)[number], query: string) => {
    const q = query.trim().toLowerCase();
    if (q === "") return true;
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  };

  const suggestions = useMemo(() => {
    if (search.trim() === "") return [];
    return PRODUCTS.filter((p) => matchesQuery(p, search)).slice(0, 6);
  }, [search]);

  const filtered = useMemo(() => {
    const min = minPrice.trim() === "" ? -Infinity : Number(minPrice);
    const max = maxPrice.trim() === "" ? Infinity : Number(maxPrice);
    return PRODUCTS.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesPrice = p.price >= min && p.price <= max;
      return matchesCategory && matchesQuery(p, search) && matchesPrice;
    });
  }, [search, category, minPrice, maxPrice]);

  const selectSuggestion = (p: (typeof PRODUCTS)[number]) => {
    setSearch(p.name);
    setCategory("All");
    setSuggestionsOpen(false);
  };

  const cartUnits = cart.reduce((sum, l) => sum + l.qty, 0);

  const onToggleFavorite = (id: string, name: string) => {
    toggleFavorite(id);
    const nowFavorited = !favorites.has(id);
    postStoreEvent({ type: "favorite", productId: id, productName: name, favorited: nowFavorited });
  };

  const onAddToCart = (id: string) => {
    addToCart(id, 1);
    const next = useStoreCartStore.getState().cart;
    const subtotal = next.reduce((sum, l) => sum + (PRODUCTS.find((p) => p.id === l.productId)?.price ?? 0) * l.qty, 0);
    postStoreEvent({ type: "cart-updated", lineCount: next.length, subtotal });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-bold text-brand-700">AwesomeMart</span>
            <div className="flex shrink-0 items-center gap-4">
              <Link to="/store/cart" data-testid="cart-link" className="relative whitespace-nowrap text-sm font-medium text-slate-700 hover:text-brand-600">
                {"\u{1F6D2}"} Cart
                {cartUnits > 0 && <Badge tone="info">{cartUnits}</Badge>}
              </Link>
              <Link to="/store/wishlist" data-testid="wishlist-link" className="whitespace-nowrap text-sm font-medium text-slate-700 hover:text-brand-600">
                {"\u2665"} Wishlist ({favorites.size})
              </Link>
            </div>
          </div>
          <div className="relative">
            <input
              data-testid="store-search-input"
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
            {suggestionsOpen && suggestions.length > 0 && (
              <div data-testid="search-suggestions" className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`search-suggestion-${p.id}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(p)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="text-slate-800">{p.name}</span>
                    <span className="text-xs text-slate-400">{p.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              data-testid={`category-filter-${c.replace(/\s/g, "-")}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-sm ${
                category === c ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-2 text-xs text-slate-400">Price range:</span>
          <input
            type="number"
            data-testid="price-min-input"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="number"
            data-testid="price-max-input"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((p) => {
            const isFavorited = favorites.has(p.id);
            const cartLine = cart.find((l) => l.productId === p.id);
            return (
              <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-3" data-testid={`product-card-${p.id}`}>
                <div className="mb-2 flex h-24 items-center justify-center rounded-md bg-slate-100 text-4xl">{p.emoji}</div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">${p.price.toFixed(2)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    data-testid={`favorite-btn-${p.id}`}
                    aria-pressed={isFavorited}
                    onClick={() => onToggleFavorite(p.id, p.name)}
                    className={`rounded-md border px-2 py-1 text-sm ${isFavorited ? "border-red-300 bg-red-50 text-red-600" : "border-slate-300 text-slate-400 hover:border-red-300"}`}
                  >
                    {isFavorited ? "\u2665" : "\u2661"}
                  </button>
                  <Button size="sm" data-testid={`add-to-cart-${p.id}`} onClick={() => onAddToCart(p.id)}>
                    {cartLine ? `In cart (${cartLine.qty})` : "Add to Cart"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <p data-testid="store-no-results" className="mt-6 text-center text-sm text-slate-400">No products match your search/filter.</p>}

        {category === "Footwear" && (
          <div className="mt-8" data-testid="compare-shoes-section">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Compare Shoes {"\u2014"} check the boxes that matter to you for each shoe
            </p>
            <table className="w-full text-left text-sm" data-testid="compare-shoes-table">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Shoe</th>
                  {COMPARE_ATTRIBUTES.map((attr) => (
                    <th key={attr} className="py-2 text-center">{attr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_PRODUCT_IDS.map((productId) => {
                  const product = PRODUCTS.find((p) => p.id === productId)!;
                  return (
                    <tr key={productId} className="border-b border-slate-100">
                      <td className="py-1.5">{product.emoji} {product.name}</td>
                      {COMPARE_ATTRIBUTES.map((attr) => (
                        <td key={attr} className="py-1.5 text-center">
                          <input
                            type="checkbox"
                            data-testid={`compare-cell-${slugify(product.name)}-${slugify(attr)}`}
                            checked={!!compareSelections[`${productId}__${attr}`]}
                            onChange={() => toggleCompareCell(productId, attr)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
