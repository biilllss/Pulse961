/**
 * Staffed-hours helpers for the live "Open now / Closed" badge in the
 * Location section. All times resolve in Asia/Beirut (the gym's clock)
 * via beirutClock(), regardless of where the visitor is.
 *
 * This numeric model mirrors the display strings in i18n
 * (Mon–Fri 06:00–23:00, Sat 08:00–20:00, Sun 09:00–18:00).
 * If the staffed hours change, update BOTH places.
 */

import { beirutClock } from "./schedule-utils";

/** Monday-first open/close minutes: Mon, Tue, Wed, Thu, Fri, Sat, Sun. */
const STAFFED: Array<[open: number, close: number]> = [
  [6 * 60, 23 * 60], // Mon
  [6 * 60, 23 * 60], // Tue
  [6 * 60, 23 * 60], // Wed
  [6 * 60, 23 * 60], // Thu
  [6 * 60, 23 * 60], // Fri
  [8 * 60, 20 * 60], // Sat
  [9 * 60, 18 * 60], // Sun
];

/** Row index into t.location.hours ([Mon–Fri, Sat, Sun]) for a Monday-first day. */
export function hoursRowFor(dayIdx: number): 0 | 1 | 2 {
  return dayIdx <= 4 ? 0 : dayIdx === 5 ? 1 : 2;
}

/** Minutes-since-midnight → "23:00". */
function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type StaffedStatus =
  | { open: true; closesAt: string }
  | { open: false; /** Monday-first day the gym next opens (0 = Mon). */ dayIdx: number; opensAt: string };

/**
 * Live staffed status. When closed, scans forward (today → +6 days) to
 * find the next opening day, so "opens {day} {time}" is always honest:
 * before opening on a staffed day it returns that same day (render as
 * "today"), after close it returns the next staffed day.
 */
export function staffedStatus(): StaffedStatus {
  const { dayIdx, minutes } = beirutClock();

  for (let offset = 0; offset < 7; offset++) {
    const d = (dayIdx + offset) % 7;
    const [open, close] = STAFFED[d];
    if (offset === 0) {
      if (minutes < open) return { open: false, dayIdx: d, opensAt: fmt(open) };
      if (minutes < close) return { open: true, closesAt: fmt(close) };
      continue; // after close — fall through to the next day
    }
    return { open: false, dayIdx: d, opensAt: fmt(open) };
  }
  // Unreachable (the loop always returns within 7 days).
  return { open: false, dayIdx: 0, opensAt: fmt(STAFFED[0][0]) };
}

/**
 * USD price → the numeric part of the LBP display, in the Lebanese
 * "millions" convention: 35 × 89,500 = 3,132,500 → "3.13". Keeps at
 * most 2 decimals, trims trailing zeros. The caller appends the unit
 * ("M LBP" / "مليون ل.ل") so each language keeps its own phrasing.
 */
export function lbpMillions(usd: number, rate: number): string {
  const value = (usd * rate) / 1_000_000;
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Full LBP hint line ("≈ 3.13M LBP" / "≈ 3.13 مليون ل.ل") for a USD
 * price, phrased per language. Used by the plan cards, the compare
 * matrix headers and the gift select.
 */
export function lbpAmount(lang: "en" | "ar", usd: number, rate: number): string {
  const value = lbpMillions(usd, rate);
  return lang === "ar" ? `≈ ${value} مليون ل.ل` : `≈ ${value}M LBP`;
}
