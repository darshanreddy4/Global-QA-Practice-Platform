import React, { useEffect, useRef, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type CarouselEngineProps = { variant: string };

const SLIDES = ["Wireless Keyboard", "27in Monitor", "Standing Desk", "Ergo Chair"];

/** ONE engine component for the "Sliders & Carousels" carousel variants. */
export function CarouselEngine({ variant }: CarouselEngineProps) {
  switch (variant) {
    case "carousel-navigation":
      return <CarouselNavigation />;
    default:
      return <p className="text-sm text-red-600">Unknown carousel variant: {variant}</p>;
  }
}

function CarouselNavigation() {
  const { setField } = useChallengeField();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => setField("activeSlide", index + 1), [index, setField]);

  useEffect(() => {
    if (hovered) return;
    timerRef.current = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 3000);
    return () => window.clearInterval(timerRef.current);
  }, [hovered]);

  return (
    <div
      data-testid="product-carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-72"
    >
      <div className="flex h-32 items-center justify-center rounded-md bg-brand-50 text-sm font-medium text-brand-800">
        {SLIDES[index]}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button data-testid="carousel-prev" onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)} className="text-sm text-slate-600">
          {"\u2039 Prev"}
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              data-testid={`carousel-dot-${i + 1}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-brand-600" : "bg-slate-300"}`}
            />
          ))}
        </div>
        <button data-testid="carousel-next" onClick={() => setIndex((i) => (i + 1) % SLIDES.length)} className="text-sm text-slate-600">
          {"Next \u203a"}
        </button>
      </div>
    </div>
  );
}
