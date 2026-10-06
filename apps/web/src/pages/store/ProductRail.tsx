import React, { useRef } from "react";
import { Button } from "../../design-system";
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from "./icons";
import type { StoreProduct } from "./storeData";

/** Horizontally-scrolling product rail with side-arrow navigation, like a real
 * storefront's "Deals" rail \u2014 distinct `data-testid`s from the main grid below
 * since the same product can legitimately appear in both at once. */
export function ProductRail({
  title,
  products,
  favorites,
  cartQtyById,
  onToggleFavorite,
  onAddToCart,
}: {
  title: string;
  products: StoreProduct[];
  favorites: Set<string>;
  cartQtyById: Map<string, number>;
  onToggleFavorite: (id: string, name: string) => void;
  onAddToCart: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  return (
    <section className="mb-8" data-testid="product-rail">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            data-testid="product-rail-prev"
            aria-label="Scroll products left"
            onClick={() => scrollByPage(-1)}
            className="rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            data-testid="product-rail-next"
            aria-label="Scroll products right"
            onClick={() => scrollByPage(1)}
            className="rounded-full border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-2" style={{ scrollSnapType: "x proximity" }}>
        {products.map((p) => {
          const isFavorited = favorites.has(p.id);
          const qty = cartQtyById.get(p.id);
          return (
            <div
              key={p.id}
              data-testid={`rail-product-${p.id}`}
              style={{ scrollSnapAlign: "start" }}
              className="w-40 shrink-0 rounded-lg border border-slate-200 bg-white p-2.5"
            >
              <img src={p.image} alt={p.name} className="mb-2 h-24 w-full rounded-md object-cover" />
              <p className="truncate text-xs font-medium text-slate-800">{p.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">${p.price.toFixed(2)}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid={`rail-favorite-btn-${p.id}`}
                  aria-pressed={isFavorited}
                  onClick={() => onToggleFavorite(p.id, p.name)}
                  className={`rounded-md border p-1 ${isFavorited ? "border-red-300 bg-red-50 text-red-500" : "border-slate-300 text-slate-400 hover:border-red-300"}`}
                >
                  <HeartIcon className="h-3.5 w-3.5" filled={isFavorited} />
                </button>
                <Button size="sm" className="flex-1 !px-2 !text-xs" data-testid={`rail-add-to-cart-${p.id}`} onClick={() => onAddToCart(p.id)}>
                  {qty ? `In cart (${qty})` : "Add"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
