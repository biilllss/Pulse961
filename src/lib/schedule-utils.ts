/**
 * Schedule helpers shared by the timetable and the "Happening now" chip.
 *
 * All times are resolved in Asia/Beirut (the gym's clock) regardless of
 * where the visitor is, via Intl.DateTimeFormat.
 */

export type ClassType = "strength" | "cardio" | "boxing" | "womens" | "open" | "other";

/**
 * Map a class name (EN or AR) to a display type.
 * Check order matters: "Women's Only HIIT" must hit `womens` before
 * the HIIT check, and "Open Gym" must hit `open` first.
 */
export function classTypeOf(name: string): ClassType {
  const n = name.toLowerCase();
  // NOTE: the Arabic open-gym cell is the full phrase "مفتوح للجميع";
  // matching on "مفتوح" alone would also swallow "ملاكمة مفتوحة"
  // (Open Mat Boxing) and misfile it as open gym.
  if (n.includes("open gym") || n.includes("مفتوح للجميع")) return "open";
  if (n.includes("women") || n.includes("نسائي") || n.includes("نسائية")) return "womens";
  if (n.includes("box") || n.includes("ملاكمة") || n.includes("نزال")) return "boxing";
  if (
    n.includes("hiit") ||
    n.includes("spin") ||
    n.includes("سبن") ||
    n.includes("cardio") ||
    n.includes("كارديو") ||
    n.includes("دايرة") ||
    n.includes("circuit") ||
    n.includes("conditioning") ||
    n.includes("كوندشنينغ") ||
    n.includes("wod") ||
    n.includes("تمرين جماعي")
  ) {
    return "cardio";
  }
  if (
    n.includes("strength") ||
    n.includes("قوة") ||
    n.includes("powerlifting") ||
    n.includes("باور") ||
    n.includes("حديد") ||
    n.includes("101")
  ) {
    return "strength";
  }
  return "other";
}

/** Monday-first index (0 = Mon … 6 = Sun) from a JS getDay() (0 = Sun). */
export function mondayFirstIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export type Session = { dayIdx: number; slotIdx: number; name: string };

/**
 * All sessions of one class type across the weekly grid, in
 * Monday-first order then slot order. Used to link a program card
 * to the exact days/times its classes run.
 */
export function programSessions(
  grid: string[][],
  slots: string[],
  type: ClassType
): Session[] {
  const out: Session[] = [];
  grid.forEach((row, dayIdx) => {
    row.forEach((name, slotIdx) => {
      if (name && classTypeOf(name) === type) out.push({ dayIdx, slotIdx, name });
    });
  });
  return out;
}

/**
 * The next upcoming session (Beirut time) matching ANY of the given
 * class types — used for the coach "next class" chips. Scans today
 * from the next slot onwards, then the following days, up to a week.
 */
export function nextClassForTypes(
  grid: string[][],
  slots: string[],
  types: ClassType[]
): { session: Session; name: string; dayIdx: number } | null {
  const { dayIdx: today, minutes } = beirutClock();

  for (let offset = 0; offset < 7; offset++) {
    const dayIdx = (today + offset) % 7;
    const row = grid[dayIdx] ?? [];
    for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
      // On day 0, only slots that haven't started yet count.
      if (offset === 0 && minutes >= slotToMinutes(slots[slotIdx]) + 60) continue;
      const name = row[slotIdx] ?? "";
      if (name && types.includes(classTypeOf(name))) {
        return { session: { dayIdx, slotIdx, name }, name, dayIdx };
      }
    }
  }
  return null;
}

/** Current wall-clock time in Beirut: Monday-first day index + minutes since midnight. */
export function beirutClock(): { dayIdx: number; minutes: number } {
  const DAY_MAP: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Beirut",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayIdx = DAY_MAP[get("weekday")] ?? 0;
  const hour = parseInt(get("hour"), 10) || 0;
  const minute = parseInt(get("minute"), 10) || 0;
  return { dayIdx, minutes: hour * 60 + minute };
}

/** "06:30" → 390 */
export function slotToMinutes(slot: string): number {
  const [h, m] = slot.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/* ── .ics calendar export ─────────────────────────────────────────
   Builds a downloadable calendar file for one program's weekly
   sessions. Times are floating local (no TZID) — the universal,
   dependency-free convention for "same wall-clock time every week"
   recurring classes. Each session recurs weekly for 8 weeks. */

const BYDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

/** Next calendar date (local) matching a Monday-first day index, at the given slot time. */
function nextDateFor(dayIdx: number, slot: string): Date {
  const now = new Date();
  const today = (now.getDay() + 6) % 7;
  const diff = (dayIdx - today + 7) % 7;
  const [h, m] = slot.split(":").map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff, h || 0, m || 0, 0);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Floating local stamp: 2025-01-06 06:30 → "20250106T063000" */
function floatStamp(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

/** UTC stamp for DTSTAMP: "20250106T043000Z" */
function utcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/**
 * Build a complete .ics file text for the given sessions (one weekly
 * recurring event per session, 8 occurrences). Lines use CRLF per
 * RFC 5545. `calName` is a human label for the calendar subscription.
 */
export function buildProgramIcs(
  sessions: Session[],
  slots: string[],
  calName: string,
  typeSlug: string,
  description: string
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pulse 961//Class Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
  ];
  const stamp = utcStamp(new Date());
  for (const s of sessions) {
    const start = nextDateFor(s.dayIdx, slots[s.slotIdx] ?? "00:00");
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:pulse961-${typeSlug}-${s.dayIdx}-${s.slotIdx}@pulse961.example`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${floatStamp(start)}`,
      `DTEND:${floatStamp(end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[s.dayIdx]};COUNT=8`,
      `SUMMARY:${s.name} — Pulse 961`,
      "LOCATION:Pulse 961 — Mar Mikhael\\, Beirut",
      `DESCRIPTION:${description}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export type SlotStatus =
  | { kind: "live"; className: string; slot: string }
  | { kind: "next"; className: string; slot: string; tomorrow: boolean };

/**
 * What's on right now (or next) given the weekly grid and slot times.
 * A class occupies its slot for 60 minutes. If today's classes are over,
 * the first class of tomorrow is returned.
 */
export function currentOrNextClass(grid: string[][], slots: string[]): SlotStatus {
  const { dayIdx, minutes } = beirutClock();
  const today = grid[dayIdx] ?? [];

  // Live right now?
  for (let i = 0; i < slots.length; i++) {
    const start = slotToMinutes(slots[i]);
    if (minutes >= start && minutes < start + 60) {
      return { kind: "live", className: today[i] ?? "", slot: slots[i] };
    }
  }

  // Next class later today?
  for (let i = 0; i < slots.length; i++) {
    if (minutes < slotToMinutes(slots[i])) {
      return { kind: "next", className: today[i] ?? "", slot: slots[i], tomorrow: false };
    }
  }

  // Otherwise: first class tomorrow.
  const tomorrow = grid[(dayIdx + 1) % 7] ?? [];
  return { kind: "next", className: tomorrow[0] ?? "", slot: slots[0] ?? "", tomorrow: true };
}
