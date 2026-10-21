"use client";

/**
 * Location & hours: info column (address, live staffed-hours status,
 * staffed hours with today's row highlighted, 24/7 note) next to a
 * real, lazy-loaded Google Maps embed for Armenia Street, Mar Mikhael.
 */

import { useEffect, useState } from "react";
import { Check, Clock, Copy, MapPin } from "lucide-react";
import { beirutClock } from "@/lib/schedule-utils";
import { hoursRowFor, staffedStatus, type StaffedStatus } from "@/lib/hours-utils";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";

/** Google Maps embed — Armenia Street, Mar Mikhael, Beirut (keyless embed URL). */
const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=Armenia%20Street%2C%20Mar%20Mikhael%2C%20Beirut%2C%20Lebanon&z=16&output=embed";

export function Location() {
  const { t } = useLanguage();

  /** Live staffed status + today's Monday-first index (client clock — null on SSR). */
  const [live, setLive] = useState<{ status: StaffedStatus | null; todayIdx: number }>({
    status: null,
    todayIdx: -1,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => setLive({ status: staffedStatus(), todayIdx: beirutClock().dayIdx });
    // Defer first computation to a frame (no sync setState in effects).
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 60_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const { status, todayIdx } = live;
  const todayRow = status ? hoursRowFor(todayIdx) : -1;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(t.location.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (permissions/insecure context) — no-op */
    }
  };

  /** Shared JSX for the live status badge (info card + map corner). */
  const statusBadge = (onMap = false) =>
    status ? (
      <p
        aria-live="polite"
        aria-label={t.location.statusAria}
        className={cn(
          "inline-flex w-fit items-center gap-2 border px-3 py-1.5 text-xs",
          status.open
            ? onMap
              ? "border-volt/40 bg-ink/85 text-white/85 backdrop-blur-sm"
              : "border-volt/40 bg-volt/[0.07] text-white/85"
            : onMap
              ? "border-white/15 bg-ink/85 text-white/70 backdrop-blur-sm"
              : "border-white/15 bg-white/[0.04] text-white/70"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-2 shrink-0 rounded-full",
            status.open
              ? "animate-pulse bg-volt motion-reduce:animate-none"
              : "border border-white/40"
          )}
        />
        <span
          className={cn(
            "font-bold uppercase tracking-[0.14em]",
            status.open ? "text-volt" : "text-white/60"
          )}
        >
          {status.open ? t.location.openNow : t.location.closedNow}
        </span>
        <span aria-hidden="true" className="text-white/30">
          ·
        </span>
        <span dir="auto">
          {status.open
            ? t.location.closesAt.replace("{time}", status.closesAt)
            : t.location.opensAt
                .replace(
                  "{day}",
                  status.dayIdx === todayIdx ? t.location.today : t.schedule.days[status.dayIdx]
                )
                .replace("{time}", status.opensAt)}
        </span>
      </p>
    ) : null;

  return (
    <section id="location" className="bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeading index="08" eyebrow={t.location.eyebrow} title={t.location.title} />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col gap-6 border border-white/10 bg-panel p-6 sm:p-8">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  <MapPin className="size-4 text-volt" aria-hidden="true" />
                  {t.location.addressLabel}
                </h3>
                <p className="mt-2 text-lg font-medium text-white">{t.location.address}</p>
                <button
                  type="button"
                  onClick={copyAddress}
                  aria-label={t.location.copyAria}
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt",
                    copied ? "text-volt" : "text-white/50 hover:text-volt"
                  )}
                >
                  {copied ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
                  {copied ? t.location.copied : t.location.copyCta}
                </button>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  <Clock className="size-4 text-volt" aria-hidden="true" />
                  {t.location.hoursLabel}
                </h3>
                {/* Live open/closed chip — computed from the Beirut clock */}
                <div className="mt-3">{statusBadge()}</div>
                <ul className="mt-3 flex flex-col divide-y divide-white/10 border-y border-white/10">
                  {t.location.hours.map((row, i) => {
                    const isToday = i === todayRow;
                    return (
                      <li
                        key={row.days}
                        className={cn(
                          "relative flex items-center justify-between py-2.5 text-sm",
                          isToday && "ps-3"
                        )}
                      >
                        {isToday && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1.5 start-0 w-0.5 bg-volt"
                          />
                        )}
                        <span className={isToday ? "font-medium text-white" : "text-white/75"}>
                          {row.days}
                          {isToday && (
                            <span className="ms-2 border border-volt/50 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-[0.14em] text-volt">
                              {t.location.today}
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "font-display text-lg tracking-wider",
                            isToday ? "text-volt" : "text-volt/70"
                          )}
                        >
                          {row.time}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="text-sm leading-relaxed text-white/55">{t.location.access247}</p>
            </div>
          </Reveal>

          {/* Real map — lazy Google Maps embed. The live status badge
              floats on top of it (rendered outside the iframe). */}
          <Reveal delay={120} className="relative h-full">
            <div className="absolute start-3 top-3 z-10">{statusBadge(true)}</div>
            <div className="relative h-full min-h-72 overflow-hidden border border-white/10 bg-panel/60 sm:min-h-80">
              <iframe
                src={MAP_EMBED_SRC}
                title={t.location.mapTitle}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
