import React, { useMemo, useRef, useState } from "react";
import { Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type MediaEngineProps = { variant: string };

/** ONE engine component for the "Images & Media" category. */
export function MediaEngine({ variant }: MediaEngineProps) {
  switch (variant) {
    case "image-gallery-broken-and-recoverable":
      return <ImageGallery />;
    case "full-featured-video-player":
      return <VideoControls />;
    default:
      return <p className="text-sm text-red-600">Unknown media variant: {variant}</p>;
  }
}

/** Dependency-free "real" image \u2014 a generated inline SVG data URI, so working
 * tiles never depend on an external image host being reachable. */
function svgPlaceholder(label: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#ffffff">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type GalleryItem = { id: string; alt: string; src: string; recoverable?: boolean };

const GALLERY: GalleryItem[] = [
  { id: "chair", alt: "Ergonomic Chair", src: "https://intentionally-broken.invalid/chair.jpg" },
  { id: "desk", alt: "Standing Desk", src: "https://intentionally-broken.invalid/desk.jpg", recoverable: true },
  { id: "monitor", alt: "Monitor Arm", src: svgPlaceholder("Monitor Arm", "#2563eb") },
  { id: "lamp", alt: "Desk Lamp", src: svgPlaceholder("Desk Lamp", "#d97706") },
  { id: "tray", alt: "Keyboard Tray", src: svgPlaceholder("Keyboard Tray", "#16a34a") },
];

function ImageGallery() {
  const { setField } = useChallengeField();
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [recoveredSrc, setRecoveredSrc] = useState<Record<string, string>>({});

  const onError = (item: GalleryItem) => {
    setBrokenIds((prev) => new Set(prev).add(item.id));
    if (item.id === "chair") setField("imageAlt", item.alt);
  };

  const onLoad = (item: GalleryItem) => {
    if (item.id === "desk" && recoveredSrc.desk) setField("imageRetried", true);
  };

  const retry = (item: GalleryItem) => {
    setRecoveredSrc((prev) => ({ ...prev, [item.id]: svgPlaceholder(item.alt, "#64748b") }));
    setBrokenIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
  };

  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
      {GALLERY.map((item) => {
        const isBroken = brokenIds.has(item.id);
        const src = recoveredSrc[item.id] ?? item.src;
        return (
          <div key={item.id} className="space-y-1">
            {isBroken ? (
              <div data-testid={`image-fallback-${item.id}`} className="flex h-28 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
                <span aria-hidden="true">{"\u{1F5BC}\ufe0f"}</span>
                <span>Image unavailable: {item.alt}</span>
                {item.recoverable && (
                  <button
                    type="button"
                    data-testid={`image-retry-${item.id}`}
                    onClick={() => retry(item)}
                    className="mt-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <img
                data-testid={`gallery-image-${item.id}`}
                src={src}
                alt={item.alt}
                onError={() => onError(item)}
                onLoad={() => onLoad(item)}
                className="h-28 w-full rounded-md border border-slate-200 object-cover"
              />
            )}
            <p className="text-center text-xs text-slate-500">{item.alt}</p>
          </div>
        );
      })}
    </div>
  );
}

const CAPTIONS_VTT = `WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to the training video.

00:00:03.000 --> 00:00:07.000
This is a real WebVTT caption track, not a simulated overlay.

00:00:07.000 --> 00:00:10.000
Keep practicing real HTMLMediaElement automation!
`;

function formatTime(t: number): string {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoControls() {
  const { setField } = useChallengeField();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [ccEnabled, setCcEnabled] = useState(false);

  const captionsUrl = useMemo(() => `data:text/vtt;charset=utf-8,${encodeURIComponent(CAPTIONS_VTT)}`, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const seekTo = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
  };

  const setVideoVolume = (vol: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = vol;
    v.muted = false;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const toggleCc = () => {
    const v = videoRef.current;
    if (!v || v.textTracks.length === 0) return;
    const track = v.textTracks[0];
    const next = track.mode === "showing" ? "hidden" : "showing";
    track.mode = next;
    setCcEnabled(next === "showing");
    if (next === "showing") setField("ccEnabled", true);
  };

  const toggleFullscreen = () => {
    videoRef.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="w-80 space-y-2">
      <div className="relative overflow-hidden rounded-md bg-black">
        <video
          ref={videoRef}
          data-testid="training-video"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          style={{ filter: `brightness(${brightness})` }}
          className="h-44 w-full"
          onPlay={() => {
            hasPlayedRef.current = true;
            setPlaying(true);
            setField("videoPlayed", true);
          }}
          onPause={() => {
            setPlaying(false);
            if (hasPlayedRef.current) setField("videoPaused", true);
          }}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            setCurrentTime(t);
            setField("currentTime", Math.round(t));
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => {
            setVolume(e.currentTarget.volume);
            setMuted(e.currentTarget.muted);
            setField("videoVolume", e.currentTarget.volume);
          }}
        >
          <track kind="captions" srcLang="en" label="English" src={captionsUrl} />
        </video>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" data-testid="play-pause-btn" onClick={togglePlay}>
          {playing ? "Pause" : "Play"}
        </Button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          data-testid="video-seek"
          onChange={(e) => seekTo(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-20 text-right text-xs text-slate-500" data-testid="video-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" data-testid="mute-toggle-btn" onClick={toggleMute} className="text-sm" aria-label="Toggle mute">
          {muted || volume === 0 ? "\u{1F507}" : "\u{1F50A}"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          data-testid="volume-slider"
          onChange={(e) => setVideoVolume(Number(e.target.value))}
          className="w-20"
        />
        <label className="flex items-center gap-1 text-xs text-slate-500">
          {"\u2600\ufe0f"}
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={brightness}
            data-testid="brightness-slider"
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-16"
          />
        </label>
        <button
          type="button"
          data-testid="cc-toggle-btn"
          aria-pressed={ccEnabled}
          onClick={toggleCc}
          className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${ccEnabled ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-slate-500"}`}
        >
          CC
        </button>
        <button type="button" data-testid="fullscreen-btn" onClick={toggleFullscreen} className="text-sm" aria-label="Fullscreen">
          {"\u26F6"}
        </button>
      </div>
    </div>
  );
}
