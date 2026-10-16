"use client";

/**
 * "Happening now / Next up" chip for the hero.
 * Computes the live class from the weekly timetable using Beirut time,
 * refreshes every minute, and is fully localized.
 */

import { useEffect, useState } from "react";
import { currentOrNextClass, type SlotStatus } from "@/lib/schedule-utils";
import { useLanguage } from "./language-provider";

export function LiveNow() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<SlotStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(currentOrNextClass(t.schedule.grid, t.schedule.slots));
    // Defer first computation to a frame (no sync setState in effects).
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 60_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [t]);

  if (!status) return null;

  const isOpenGym =
    status.className.toLowerCase().includes("open gym") ||
    status.className.includes("مفتوح");
  const name = isOpenGym ? t.live.openGym : status.className;
  const when = status.kind === "live" ? name : `${name} — ${status.tomorrow ? t.live.tomorrow + " " : ""}${status.slot}`;

  return (
    <p
      className="inline-flex w-fit items-center gap-2.5 border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs text-white/80 sm:text-sm"
      aria-label={t.live.ariaLabel}
    >
      <span
        aria-hidden="true"
        className={
          status.kind === "live"
            ? "size-2 shrink-0 animate-pulse rounded-full bg-volt"
            : "size-2 shrink-0 rounded-full border border-volt/70"
        }
      />
      <span className="font-bold uppercase tracking-[0.18em] text-volt">
        {status.kind === "live" ? t.live.live : t.live.next}
      </span>
      <span className="text-white/35" aria-hidden="true">
        /
      </span>
      <span className="font-medium">{when}</span>
    </p>
  );
}
