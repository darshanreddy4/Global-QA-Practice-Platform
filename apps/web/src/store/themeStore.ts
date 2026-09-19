import { create } from "zustand";

const STORAGE_KEY = "qa-lab-theme";
export type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore (private mode / storage disabled)
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

/**
 * Global light/dark theme, shared across every page (including the standalone
 * /store/* and /window-lab/* routes rendered outside AppShell) since it's
 * applied as a `dark` class on <html>, not scoped to any one layout.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getPreferredTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));

// Apply immediately on module load (before first paint of most routes) so a
// returning visitor never sees a flash of the wrong theme.
applyTheme(useThemeStore.getState().theme);
