import React, { useEffect, useState } from "react";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type MediaEngineProps = { variant: string };

/** ONE engine component for the "Images & Media" category. */
export function MediaEngine({ variant }: MediaEngineProps) {
  switch (variant) {
    case "broken-image-alt-fallback":
      return <BrokenImageAltFallback />;
    case "video-controls":
      return <VideoControls />;
    default:
      return <p className="text-sm text-red-600">Unknown media variant: {variant}</p>;
  }
}

function BrokenImageAltFallback() {
  const { setField } = useChallengeField();
  const [broken, setBroken] = useState(false);

  useEffect(() => setField("imageAlt", "Ergonomic Chair"), [setField]);

  return (
    <div className="w-48">
      {broken ? (
        <div data-testid="image-fallback" className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
          <span aria-hidden="true">{"\u{1F5BC}\ufe0f"}</span>
          <span>Image unavailable: Ergonomic Chair</span>
        </div>
      ) : (
        <img
          data-testid="product-image"
          src="https://intentionally-broken.invalid/chair.jpg"
          alt="Ergonomic Chair"
          onError={() => setBroken(true)}
          className="h-32 w-full rounded-md object-cover"
        />
      )}
    </div>
  );
}

function VideoControls() {
  const { setField } = useChallengeField();
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  return (
    <div className="w-72 space-y-2">
      <div data-testid="video-surface" className="flex h-40 items-center justify-center rounded-md bg-slate-800 text-sm text-white">
        {playing ? "\u25b6 Playing\u2026" : "\u23f8 Paused"}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          data-testid="play-pause-btn"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "Pause" : "Play"}
        </Button>
        <input
          type="range"
          min={0}
          max={120}
          value={time}
          data-testid="video-seek"
          onChange={(e) => {
            const t = Number(e.target.value);
            setTime(t);
            setField("currentTime", t);
          }}
          className="flex-1"
        />
        <span className="text-xs text-slate-500" data-testid="video-time">{time}s</span>
      </div>
    </div>
  );
}
