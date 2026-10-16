"use client";

/**
 * "Best time to train" — an at-a-glance busyness chart for the
 * schedule section. 18 hourly bars (06:00 → 23:00) show the typical
 * crowd level, auto-switching between a weekday and a weekend curve
 * based on the Beirut clock. The current Beirut hour gets a NOW
 * marker and a live status line tells the visitor whether it's a
 * good moment to walk in or they should book a class ahead.
 *
 * The crowding data is editorial (fictional gym) but the "now"
 * marker and the weekday/weekend switch are computed live from the
 * Asia/Beirut clock, like the rest of the schedule features.
 *
 * RTL: the bar row is a normal flex row, so in Arabic the hours
 * read right-to-left automatically — the correct RTL chart order.
 */

import { useEffect, useMemo, useState } from "react";
import { beirutClock } from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";
import { spotlightMove } from "./motion";
import { useLanguage } from "./language-provider";

/** First hour on the chart (06:00) — bars run to 23:00. */
const HOUR_START = 6;

/**
 * Hourly crowding, 0–100. Index 0 = 06:00 … index 17 = 23:00.
 * Editorial data: double class blocks (18:00/19:30 weekdays and
 * midday weekends) are the peaks, per the weekly grid.
 */
const BUSYNESS: Record<"weekday" | "weekend", number[]> = {
  weekday: [58, 46, 30, 24, 26, 34, 48, 42, 38, 44, 58, 76, 94, 100, 84, 62, 42, 28],
  weekend: [22, 26, 34, 52, 68, 80, 86, 72, 58, 62, 74, 82, 86, 78, 66, 52, 36, 20],
};

type Level = "quiet" | "moderate" | "busy";

function levelOf(v: number): Level {
  if (v >= 70) return "busy";
  if (v >= 35) return "moderate";
  return "quiet";
}

/** Mono + lime discipline: lime = packed (book ahead), white = quiet. */
const BAR_CLASS: Record<Level, string> = {
  quiet: "bg-white/20 group-hover/bar:bg-white/35",
  moderate: "bg-volt/40 group-hover/bar:bg-volt/60",
  busy: "bg-volt/80 group-hover/bar:bg-volt",
};

const DOT_CLASS: Record<Level, string> = {
  quiet: "bg-volt animate-pulse",
  moderate: "border border-white/60",
  busy: "bg-white/40",
};

/** Bars keep exact proportions; scaled to 86% so the PEAK chip fits above. */
const SCALE = 0.86;

export function BusyHours() {
  const { t } = useLanguage();
  const [nowHour, setNowHour] = useState<number | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);

  // Compute after mount (inside a frame) so SSR and client match.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const { dayIdx, minutes } = beirutClock();
      setIsWeekend(dayIdx >= 5); // Sat / Sun
      const h = Math.floor(minutes / 60);
      setNowHour(h >= HOUR_START && h < HOUR_START + BUSYNESS.weekday.length ? h - HOUR_START : null);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const data = BUSYNESS[isWeekend ? "weekend" : "weekday"];
  const peakIdx = useMemo(() => data.indexOf(Math.max(...data)), [data]);

  // Live status: computed from the current Beirut hour. Outside the
  // chart range (e.g. 03:00) the honest answer is "quiet" — no marker.
  const currentLevel: Level = nowHour !== null ? levelOf(data[nowHour]) : "quiet";
  const statusText =
    currentLevel === "busy"
      ? t.schedule.busy.statusBusy
      : currentLevel === "moderate"
        ? t.schedule.busy.statusModerate
        : t.schedule.busy.statusQuiet;

  const levelLabel = (lv: Level) =>
    lv === "busy"
      ? t.schedule.busy.levelsBusy
      : lv === "moderate"
        ? t.schedule.busy.levelsModerate
        : t.schedule.busy.levelsQuiet;

  return (
    <div
      onMouseMove={spotlightMove}
      className="spotlight mt-12 border border-white/10 bg-panel p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-2xl tracking-wide text-white">
          {t.schedule.busy.title}
        </h3>
        <span className="border border-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
          {isWeekend ? t.schedule.busy.weekend : t.schedule.busy.weekday}
        </span>
      </div>
      <p className="mt-1 text-sm text-white/50">{t.schedule.busy.subtitle}</p>

      {/* Chart (role=img: bars are decorative, the label carries the meaning) */}
      <div
        role="img"
        aria-label={t.schedule.busy.chartAria.replace("{status}", statusText)}
        className="mt-6 flex items-stretch gap-1 sm:gap-1.5"
      >
          {data.map((v, i) => {
            const lv = levelOf(v);
            const isPeak = i === peakIdx;
            const isNow = i === nowHour;
            const hour = HOUR_START + i;
            return (
              <div key={hour} className="group/bar relative flex-1">
                {/* Bar track */}
                <div className="relative h-32 sm:h-36">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 bottom-0 transition-[height,background-color] duration-500 ease-out",
                      BAR_CLASS[lv],
                      isNow && "outline outline-1 -outline-offset-1 outline-volt"
                    )}
                    style={{ height: `${v * SCALE}%` }}
                    title={t.schedule.busy.barAria
                      .replace("{hour}", String(hour).padStart(2, "0"))
                      .replace("{level}", levelLabel(lv))}
                  />
                  {isPeak && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 text-center text-[9px] font-bold uppercase tracking-[0.1em] text-volt"
                      style={{ bottom: `calc(${v * SCALE}% + 4px)` }}
                    >
                      {t.schedule.busy.peakLabel}
                    </span>
                  )}
                </div>
                {/* Labels row: every 3rd hour + NOW chip under the live hour */}
                <div className="mt-1.5 flex h-8 flex-col items-center justify-start gap-1">
                  <span className="text-[10px] font-semibold tabular-nums text-white/40">
                    {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
                  </span>
                  {isNow && (
                    <span className="bg-volt px-1 text-[8px] font-bold uppercase leading-3 tracking-[0.08em] text-ink">
                      {t.schedule.busy.nowLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Live status */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs">
        <p className="flex items-center gap-2 font-medium text-white/75" aria-live="polite">
          <span
            aria-hidden="true"
            className={cn("inline-block size-2 shrink-0 rounded-full", DOT_CLASS[currentLevel])}
          />
          {statusText}
        </p>
      </div>
    </div>
  );
}
