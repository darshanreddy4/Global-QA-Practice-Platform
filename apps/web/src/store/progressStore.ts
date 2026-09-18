import { create } from "zustand";

const STORAGE_KEY = "qa-lab-progress";

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persist(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

type ProgressState = {
  completedIds: Set<string>;
  markCompleted: (challengeId: string) => void;
  resetProgress: () => void;
};

/**
 * Tracks which challenges a learner has passed "Check my work" on, persisted
 * in localStorage. This is the v1 (client-only) stand-in for the future
 * backend-persisted `attempts`/`user_progress` tables (see ARCHITECTURE.md
 * §4/§62) — same shape, just not synced across devices yet.
 */
export const useProgressStore = create<ProgressState>((set, get) => ({
  completedIds: loadCompleted(),
  markCompleted: (challengeId) => {
    if (get().completedIds.has(challengeId)) return;
    const next = new Set(get().completedIds);
    next.add(challengeId);
    persist(next);
    set({ completedIds: next });
  },
  resetProgress: () => {
    persist(new Set());
    set({ completedIds: new Set() });
  },
}));
