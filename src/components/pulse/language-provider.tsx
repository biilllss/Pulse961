"use client";

/**
 * Client-side language context for the EN | AR toggle.
 *
 * The active language lives in localStorage and is read through
 * useSyncExternalStore, so:
 *  - SSR/hydration render English (no mismatch), then a returning
 *    Arabic visitor is switched to AR immediately after hydration.
 *  - An inline script in layout.tsx fixes <html dir/class> BEFORE
 *    hydration, so the layout never flashes left-to-right.
 *
 * The provider also mirrors the choice onto <html lang/dir> and the
 * `lang-ar` class (used by CSS for the Arabic font + letter-spacing fixes).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { translations, type Language, type Translations } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Language;
  dir: "ltr" | "rtl";
  t: Translations;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "pulse961-lang";

/* ── localStorage as an external store ──────────────────────────── */
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other tabs stay in sync
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Language {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function getServerSnapshot(): Language {
  return "en";
}

function writeLang(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode — still notify in-memory */
  }
  listeners.forEach((notify) => notify());
}

/* ── Provider ───────────────────────────────────────────────────── */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Mirror the language onto <html> (an external system — no state here).
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.classList.toggle("lang-ar", lang === "ar");
  }, [lang]);

  const setLang = useCallback((next: Language) => writeLang(next), []);

  const toggleLang = useCallback(
    () => writeLang(getSnapshot() === "en" ? "ar" : "en"),
    []
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: translations[lang],
      setLang,
      toggleLang,
    }),
    [lang, setLang, toggleLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
