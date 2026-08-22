"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const BLOSSOM_THEME_KEY = "blossom_home_scene";
export type BlossomTheme = "beach" | "macaron";

type BlossomThemeContextValue = {
  theme: BlossomTheme;
  setTheme: (theme: BlossomTheme) => void;
};

const BlossomThemeContext = createContext<BlossomThemeContextValue | null>(null);

function isBlossomTheme(value: string | null | undefined): value is BlossomTheme {
  return value === "beach" || value === "macaron";
}

function applyRootTheme(theme: BlossomTheme) {
  document.documentElement.dataset.blossomTheme = theme;
}

export function BlossomThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<BlossomTheme>("beach");

  const setTheme = useCallback((nextTheme: BlossomTheme) => {
    applyRootTheme(nextTheme);
    try {
      window.localStorage.setItem(BLOSSOM_THEME_KEY, nextTheme);
    } catch {
      // Storage can be unavailable; the in-memory/root theme still updates.
    }
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    const rootTheme = document.documentElement.dataset.blossomTheme;
    const initialTheme = isBlossomTheme(rootTheme) ? rootTheme : "beach";
    applyRootTheme(initialTheme);
    // The pre-hydration initializer owns the first paint; mirror it in React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);

    function handleStorage(event: StorageEvent) {
      if (event.key !== BLOSSOM_THEME_KEY || !isBlossomTheme(event.newValue)) return;
      applyRootTheme(event.newValue);
      setThemeState(event.newValue);
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [setTheme, theme]);

  return (
    <BlossomThemeContext.Provider value={value}>
      {children}
    </BlossomThemeContext.Provider>
  );
}

export function useBlossomTheme() {
  const context = useContext(BlossomThemeContext);
  if (!context) {
    throw new Error("useBlossomTheme must be used within BlossomThemeProvider");
  }
  return context;
}
