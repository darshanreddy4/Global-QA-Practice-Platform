import React, { useEffect, useState } from "react";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type SliderEngineProps = { variant: string };

/** ONE engine component for the range-slider variants of "Sliders & Carousels". */
export function SliderEngine({ variant }: SliderEngineProps) {
  switch (variant) {
    case "single-slider-keyboard":
      return <SingleSliderKeyboard />;
    case "dual-range-slider":
      return <DualRangeSlider />;
    default:
      return <p className="text-sm text-red-600">Unknown slider variant: {variant}</p>;
  }
}

function SingleSliderKeyboard() {
  const { setField } = useChallengeField();
  const [value, setValue] = useState(0);

  const commit = (next: number) => {
    const clamped = Math.max(0, Math.min(100, next));
    setValue(clamped);
    setField("volume", clamped);
  };

  return (
    <div className="max-w-xs">
      <label htmlFor="volumeSlider" className="mb-1.5 block text-sm font-medium text-slate-700">Volume</label>
      <input
        id="volumeSlider"
        type="range"
        role="slider"
        aria-valuenow={value}
        min={0}
        max={100}
        step={5}
        data-testid="volume-slider"
        value={value}
        onChange={(e) => commit(Number(e.target.value))}
        className="w-full"
      />
      <p className="mt-1 text-sm text-slate-500" data-testid="volume-value">{value}</p>
    </div>
  );
}

function DualRangeSlider() {
  const { setField } = useChallengeField();
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1000);

  useEffect(() => {
    setField("minPrice", min);
    setField("maxPrice", max);
  }, [min, max, setField]);

  return (
    <div className="max-w-sm space-y-2">
      <p className="text-sm font-medium text-slate-700">Price range: ${min} &ndash; ${max}</p>
      <div className="space-y-1">
        <label htmlFor="minHandle" className="text-xs text-slate-500">Min</label>
        <input
          id="minHandle"
          type="range"
          min={0}
          max={1000}
          step={10}
          data-testid="min-price-handle"
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max - 10))}
          className="w-full"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="maxHandle" className="text-xs text-slate-500">Max</label>
        <input
          id="maxHandle"
          type="range"
          min={0}
          max={1000}
          step={10}
          data-testid="max-price-handle"
          value={max}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min + 10))}
          className="w-full"
        />
      </div>
    </div>
  );
}
