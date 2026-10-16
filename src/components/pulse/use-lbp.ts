"use client";

/**
 * Shared "show prices in LBP" preference, so the toggle in the pricing
 * grid, the compare matrix and the gift-strip select all stay in sync.
 *
 * Same external-store pattern as the language provider: the value lives
 * in localStorage (plain "1"/"0" strings) and is read through
 * useSyncExternalStore, so every consumer re-renders when any of them
 * toggles it, and the preference survives reloads. Defaults to OFF.
 */

import { useCallback, useSyncExternalStore } from "react";

const LBP_KEY = "pulse961-lbp";
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other tabs stay in sync
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(LBP_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function writeLbp(next: boolean) {
  try {
    window.localStorage.setItem(LBP_KEY, next ? "1" : "0");
  } catch {
    /* private mode — still notify in-memory */
  }
  listeners.forEach((notify) => notify());
}

export function useLbp(): { showLbp: boolean; toggleLbp: () => void } {
  const showLbp = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggleLbp = useCallback(() => writeLbp(!getSnapshot()), []);
  return { showLbp, toggleLbp };
}
