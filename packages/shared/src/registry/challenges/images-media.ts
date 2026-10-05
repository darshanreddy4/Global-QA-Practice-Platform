import type { ChallengeDefinition } from "../../challenge-schema";

/** Images & Media (spec category #19). All variants share the `media` engine component. */
export const imagesMediaChallenges: ChallengeDefinition[] = [
  {
    id: "MEDIA-001",
    title: "Image Gallery \u2014 Broken Images & Alt-Text Fallbacks",
    categoryId: "images-media",
    component: "media",
    variant: "image-gallery-broken-and-recoverable",
    behavior: ["static"],
    environment: ["none"],
    dataSource: "static/none",
    difficulty: "easy",
    frameworks: ["selenium", "playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "A 5-tile product gallery: 3 real photographs that load normally, and 2 broken product images. One broken image never recovers; the other can be fixed by the user and should then load successfully.",
      dataNeeded: "None.",
      action:
        "QA task: a bug report says some product images in this gallery are broken. Investigate the gallery and figure out, for each tile, whether it loaded, and if not, why. For \"Ergonomic Chair\", the image will never load \u2014 confirm the product is still properly labeled for screen-reader users even though no image renders. For \"Standing Desk\", find a way on the page to make the image load successfully, then confirm it actually did.",
      expectedResult:
        "\"Ergonomic Chair\" permanently shows a fallback message but is still correctly labeled. \"Standing Desk\" starts broken too, but after you take the right action on the page, it renders a real photograph.",
      validationPoints: [
        "The permanently-broken product still exposes the correct accessible name (alt text), independent of whether the image itself ever renders",
        "The recoverable product is confirmed to have genuinely finished loading afterward (a real success event, not just an error message disappearing)",
      ],
      automationConcepts: [
        "Testing accessible-name presence independent of visual rendering",
        "img onError/onLoad event handling",
        "Verifying a retry/recovery flow actually re-fetches and succeeds, not just hides an error message",
        "Locating the right control among several similar-looking tiles without relying on fixed visual position",
      ],
      hints: [
        "Don't assume every tile behaves the same way \u2014 inspect each one individually before deciding what action, if any, it needs.",
        "A tile's accessible name (alt text) and its visual load state are two separate things; test them independently.",
      ],
    },
    validation: [
      { kind: "equals", field: "imageAlt", expected: "Ergonomic Chair" },
      { kind: "truthy", field: "imageRetried" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 3,
    resettable: true,
    isActive: true,
  },
  {
    id: "MEDIA-002",
    title: "Full-Featured Video Player \u2014 Play, Volume, Brightness, Captions",
    categoryId: "images-media",
    component: "media",
    variant: "full-featured-video-player",
    behavior: ["static"],
    environment: ["none"],
    dataSource: "static/none",
    difficulty: "medium",
    frameworks: ["playwright", "cypress"],
    accessibility: "expected-accessible",
    guidance: {
      whatItDoes:
        "A real HTML5 `<video>` element (not a simulated timer) with a custom control bar: Play/Pause (calls the real `.play()`/`.pause()` methods), a seek bar bound to real `currentTime`, a volume slider + mute toggle bound to real `.volume`/`.muted`, a brightness slider (CSS filter), a Fullscreen button (real Fullscreen API), and a CC button that toggles a REAL `<track kind=\"captions\">` WebVTT text track's `mode` between \"showing\" and \"hidden\".",
      dataNeeded: "None.",
      action:
        "Click Play and confirm the time counter actually advances (it previously got stuck at 0 \u2014 that was a bug, now fixed). Click Pause. Drag the seek bar to 5 seconds. Drag the volume slider to 0.5. Click the CC button to enable captions and confirm caption text appears over the video.",
      expectedResult: "Playback time genuinely advances while playing and freezes on pause; seeking updates currentTime to 5; volume reads 0.5; captions become visible once CC is enabled.",
      validationPoints: [
        "videoPlayed is true (the real HTMLMediaElement onPlay event fired)",
        "videoPaused is true (the real onPause event fired after playback had actually started)",
        "currentTime equals 5 after seeking",
        "videoVolume equals 0.5 after adjusting the volume slider",
        "ccEnabled is true after turning captions on",
      ],
      automationConcepts: [
        "Real HTMLMediaElement property/event assertions (currentTime, duration, volume, muted, paused, play/pause/timeupdate/volumechange events)",
        "TextTrack API (video.textTracks[0].mode) for closed-caption automation instead of a fake overlay",
        "Polling/waiting for time-based state instead of asserting immediately after a seek",
      ],
      edgeCases: ["Dragging the brightness slider only changes a CSS filter \u2014 it is not part of required validation, but is a real, inspectable style change."],
    },
    validation: [
      { kind: "truthy", field: "videoPlayed" },
      { kind: "truthy", field: "videoPaused" },
      { kind: "equals", field: "currentTime", expected: 5 },
      { kind: "equals", field: "videoVolume", expected: 0.5 },
      { kind: "truthy", field: "ccEnabled" },
    ],
    mode: { deterministic: true, randomAvailable: false },
    estimatedMinutes: 5,
    resettable: true,
    isActive: true,
  },
];

