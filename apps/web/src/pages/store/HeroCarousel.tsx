import React, { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import type { CATEGORIES } from "./storeData";

type SlideCategory = (typeof CATEGORIES)[number];

type Slide = { id: string; title: string; subtitle: string; cta: string; category: SlideCategory; image: string };

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=1200&h=420&fit=crop&q=80`;
}

const SLIDES: Slide[] = [
  { id: "fall-fashion", title: "Fall Styles, Fresh Prices", subtitle: "Up to 40% off jackets & footwear", cta: "Shop Footwear", category: "Footwear", image: unsplash("1441986300917-64674bd600d8") },
  { id: "electronics-deals", title: "Top Electronics Deals", subtitle: "Headphones, speakers & smart watches", cta: "Shop Electronics", category: "Electronics", image: unsplash("1607082348824-0a96f2a4b9da") },
  { id: "flash-sale", title: "Flash Sale \u2014 Today Only", subtitle: "Save big across every category", cta: "Shop All Deals", category: "All", image: unsplash("1512436991641-6745cdb1723f") },
  { id: "new-arrivals", title: "New Arrivals for Home & Kitchen", subtitle: "Upgrade your space this season", cta: "Shop Home & Kitchen", category: "Home & Kitchen", image: unsplash("1472851294608-062f824d29cc") },
];

/** Auto-advancing promotional banner carousel, like a real storefront's hero slot \u2014
 * side arrows + dot indicators + a "Shop" CTA that jumps straight to a filtered category. */
export function HeroCarousel({ onShopCategory }: { onShopCategory: (category: SlideCategory) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SLIDES.length;

  const goTo = (i: number) => setIndex(((i % total) + total) % total);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => goTo(indexRef.current + 1), 5000);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const slide = SLIDES[index];

  return (
    <div
      data-testid="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mb-6 overflow-hidden rounded-xl"
    >
      <div
        data-testid="hero-slide"
        data-slide-id={slide.id}
        className="relative flex h-44 items-center bg-cover bg-center px-6 sm:h-56 sm:px-10"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.75), rgba(15,23,42,0.15)), url(${slide.image})` }}
      >
        <div className="max-w-sm text-white">
          <h2 className="text-xl font-bold sm:text-2xl">{slide.title}</h2>
          <p className="mt-1 text-sm text-slate-100 sm:text-base">{slide.subtitle}</p>
          <button
            type="button"
            data-testid="hero-cta-btn"
            onClick={() => onShopCategory(slide.category)}
            className="mt-4 rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            {slide.cta}
          </button>
        </div>
      </div>

      <button
        type="button"
        data-testid="hero-prev-btn"
        aria-label="Previous promotion"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        data-testid="hero-next-btn"
        aria-label="Next promotion"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-testid={`hero-dot-${i}`}
            aria-label={`Go to promotion ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
}
