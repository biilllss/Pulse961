"use client";

/**
 * Location & hours: info column (address, live staffed-hours status,
 * staffed hours with today's row highlighted, 24/7 note) next to a
 * styled placeholder map block — a lime grid with a pin, ready to be
 * swapped for a real Google Maps embed.
 */

import { useEffect, useState } from "react";
import { Check, Clock, Copy, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { beirutClock } from "@/lib/schedule-utils";
import { hoursRowFor, staffedStatus, type StaffedStatus } from "@/lib/hours-utils";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";

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

          {/* Placeholder map block — grid drifts + crosshair on hover.
              The Reveal wrapper is relative so the live badge can sit
              ON the map without nesting text inside its role="img". */}
          <Reveal delay={120} className="relative h-full">
            <div className="absolute start-3 top-3 z-10">{statusBadge(true)}</div>
            <div
              role="img"
              aria-label={t.location.mapNote}
              className="group-map map-grid relative flex h-full min-h-72 flex-col items-center justify-center gap-4 overflow-hidden border border-white/10 bg-panel/60 p-6 text-center"
            >
              {/* Drifting grid layer (parallax on hover) */}
              <span
                aria-hidden="true"
                className="map-drift pointer-events-none absolute inset-[-28px]"
              />
              {/* Stylized streets: two roads + a dashed lime walking route
                  from the street corner up to the pin. */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 size-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 24 L100 32"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="2.4"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M38 0 L46 100"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M76 0 L62 100"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M2 86 Q34 74 44 56 T49 50"
                  stroke="rgba(198,255,61,0.55)"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {/* Street name labels (localized, physical positioning
                  so they stay glued to the drawn streets in RTL too) */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[7%] top-[15%] rotate-[4.5deg] text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30"
              >
                {t.location.streetA}
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[66%] top-[36%] rotate-[98deg] text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25"
              >
                {t.location.streetB}
              </span>
              {/* Crosshair through the pin */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 start-1/2 w-px bg-volt/20 opacity-0 transition-opacity duration-700 group-map:hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-volt/20 opacity-0 transition-opacity duration-700 group-map:hover:opacity-100"
              />

              {/* Pin */}
              <span className="relative flex size-14 items-center justify-center">
                <span
                  className="absolute inline-flex size-14 animate-ping rounded-full bg-volt/25 motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="relative flex size-12 items-center justify-center rounded-full bg-volt">
                  <MapPin className="size-6 text-ink" aria-hidden="true" />
                </span>
              </span>
              <p className="font-display text-3xl tracking-wide text-white">MAR MIKHAEL</p>
              <p
                className="font-display text-sm tracking-[0.3em] text-volt/80"
                dir="ltr"
              >
                33.8816° N — 35.5183° E
              </p>
              <p className="max-w-xs text-xs text-white/45">{t.location.mapNote}</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-1 border-white/25 bg-transparent text-white hover:border-volt hover:bg-transparent hover:text-volt"
              >
                <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  {t.location.mapCta}
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
