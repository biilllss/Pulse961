"use client";

/**
 * Weekly class timetable: a proper grid that scrolls horizontally on
 * small screens (custom thin scrollbar). Each class gets a small
 * type marker (strength / cardio / boxing / open gym) with a legend,
 * and the current day's row is highlighted with a lime "Today" chip.
 *
 * Every class cell is a button → opens WhatsApp with a pre-filled
 * "book this class" message (open-gym cells get their own wording).
 *
 * On top of that: a class-type filter (with live counts, non-matching
 * cells dim out) and a "flash" highlight channel — program dialogs
 * and coach chips deep-link here by dispatching a custom event, which
 * sets the filter and pulses the matching cells so the eye lands on
 * exactly the right rows after the scroll.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  classTypeOf,
  mondayFirstIndex,
  buildProgramIcs,
  type ClassType,
  type Session,
} from "@/lib/schedule-utils";
import { waLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";
import { BusyHours } from "./busy-hours";

/** Small square marker color per class type (mono + lime discipline). */
const TYPE_MARKER: Record<ClassType, string> = {
  strength: "bg-white",
  cardio: "bg-volt",
  boxing: "border-2 border-volt bg-transparent",
  womens: "bg-white/60",
  open: "bg-white/25",
  other: "bg-white/40",
};

function TypeMarker({ type }: { type: ClassType }) {
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0", TYPE_MARKER[type])} />;
}

/** Fill a {name}/{day}/{time} template (keeps Arabic word order intact). */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

/** Filter chip keys: "all" plus every type the timetable actually uses. */
type FilterType = "all" | ClassType;

/** Custom event fired by program dialogs / coach chips to highlight classes. */
const FLASH_EVENT = "pulse961:flash-schedule";

export function Schedule() {
  const { t } = useLanguage();
  const [today, setToday] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [flashTypes, setFlashTypes] = useState<ClassType[] | null>(null);
  const flashTimer = useRef<number | null>(null);
  const [weekSaved, setWeekSaved] = useState(false);

  // Compute after mount (inside a frame) so SSR and client markup match.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(mondayFirstIndex(new Date().getDay())));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Deep-linkable filter state: #schedule-boxing survives reloads and
  // shares. Read once on mount; no scrolling is forced (the hash never
  // matches a real element id, so the browser doesn't jump either).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const m = /^#schedule-([a-z]+)$/.exec(window.location.hash);
      const key = m?.[1] as FilterType | undefined;
      if (key && key !== "all" && key !== "other") setFilter(key);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Set the filter AND persist it to the URL hash (shareable). */
  const applyFilter = (key: FilterType) => {
    setFilter(key);
    try {
      window.history.replaceState(null, "", key === "all" ? "#schedule" : `#schedule-${key}`);
    } catch {
      /* sandboxed environments — filter still works */
    }
  };

  // Listen for deep-link "flash" requests from programs / trainers.
  useEffect(() => {
    const onFlash = (e: Event) => {
      const detail = (e as CustomEvent<{ types?: ClassType[]; filter?: FilterType }>).detail;
      const types = Array.isArray(detail?.types) ? detail!.types : [];
      if (detail?.filter) setFilter(detail.filter);
      if (types.length > 0) {
        if (flashTimer.current) window.clearTimeout(flashTimer.current);
        setFlashTypes(types);
        // Two pulse cycles, then back to calm.
        flashTimer.current = window.setTimeout(() => setFlashTypes(null), 2600);
      }
    };
    window.addEventListener(FLASH_EVENT, onFlash);
    return () => {
      window.removeEventListener(FLASH_EVENT, onFlash);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, []);

  /** Live counts per class type (for the filter chip badges). */
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0, strength: 0, cardio: 0, boxing: 0, womens: 0, open: 0, other: 0,
    };
    t.schedule.grid.forEach((row) =>
      row.forEach((name) => {
        if (!name) return;
        counts[classTypeOf(name)] += 1;
        counts.all += 1;
      })
    );
    return counts;
  }, [t]);

  const filters: Array<{ key: FilterType; label: string }> = [
    { key: "all", label: t.schedule.filterAll },
    { key: "strength", label: t.legend.strength },
    { key: "cardio", label: t.legend.cardio },
    { key: "boxing", label: t.legend.boxing },
    { key: "womens", label: t.schedule.filterWomens },
    { key: "open", label: t.legend.open },
  ];

  const legend: Array<{ type: ClassType; label: string }> = [
    { type: "strength", label: t.legend.strength },
    { type: "cardio", label: t.legend.cardio },
    { type: "boxing", label: t.legend.boxing },
    { type: "open", label: t.legend.open },
  ];

  /** Build the localized "book this class" WhatsApp message. */
  const bookMessage = (name: string, day: string, time: string) => {
    const isOpen = classTypeOf(name) === "open";
    const template = isOpen ? t.schedule.bookOpenWa : t.schedule.bookClassWa;
    return fill(template, { name, day, time });
  };

  /** Every session of the week, for the full-week .ics export. */
  const weekSessions = useMemo<Session[]>(() => {
    const out: Session[] = [];
    t.schedule.grid.forEach((row, dayIdx) =>
      row.forEach((name, slotIdx) => {
        if (name) out.push({ dayIdx, slotIdx, name });
      })
    );
    return out;
  }, [t]);

  /** Download the whole week as a recurring calendar file. */
  const downloadWeekIcs = () => {
    const ics = buildProgramIcs(
      weekSessions,
      t.schedule.slots,
      t.schedule.weekIcs.calName,
      "full-week",
      t.schedule.weekIcs.desc
    );
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulse961-full-week.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setWeekSaved(true);
    window.setTimeout(() => setWeekSaved(false), 2400);
  };

  return (
    <section id="schedule" className="bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeading
          index="03"
          eyebrow={t.schedule.eyebrow}
          title={t.schedule.title}
          subtitle={t.schedule.subtitle}
        />

        <Reveal>
          {/* Class-type filter: live counts, dim-out behavior, deep-linkable
              (program dialogs and coach chips set it via the flash event). */}
          <div
            role="group"
            aria-label={t.schedule.filterLabel}
            className="mb-4 flex flex-wrap items-center gap-2"
          >
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyFilter(f.key)}
                  className={cn(
                    "inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt",
                    active
                      ? "border-volt bg-volt text-ink"
                      : "border-white/15 text-white/60 hover:border-volt/60 hover:text-white"
                  )}
                >
                  {f.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-bold leading-4 tabular-nums",
                      active ? "bg-ink/15 text-ink" : "bg-white/10 text-white/50"
                    )}
                  >
                    {typeCounts[f.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="mb-3 text-xs font-medium text-white/50">
            {t.schedule.resultsCount
              .replace("{count}", String(typeCounts[filter] ?? 0))
              .replace("{total}", String(typeCounts.all))}
          </p>
          {/* Screen-reader announcement for deep-link flashes. */}
          <span className="sr-only" aria-live="polite">
            {flashTypes
              ? t.schedule.flashAnnounce.replace(
                  "{name}",
                  filters.find((f) => f.key === flashTypes[0])?.label ?? ""
                )
              : ""}
          </span>
          <div className="scrollbox overflow-x-auto rounded-md border border-white/10 bg-panel">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-start text-white/50">
                    {t.schedule.dayHeader}
                  </TableHead>
                  {t.schedule.slots.map((slot) => (
                    <TableHead key={slot} className="text-start text-white/50">
                      <span className="font-display text-base tracking-wide text-volt">
                        {slot}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.schedule.grid.map((row, dayIdx) => {
                  const isToday = today === dayIdx;
                  const day = t.schedule.days[dayIdx];
                  return (
                    <TableRow
                      key={day}
                      className={cn(
                        "border-white/10 transition-colors duration-200",
                        isToday ? "bg-volt/10" : "hover:bg-volt/[0.06]"
                      )}
                    >
                      <TableCell className="whitespace-nowrap font-semibold text-white">
                        <span className="flex items-center gap-2">
                          <span className={cn(isToday && "text-volt")}>{day}</span>
                          {isToday && (
                            <span className="bg-volt px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink">
                              {t.schedule.todayLabel}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      {row.map((className, slotIdx) => {
                        const isOpen = classTypeOf(className) === "open";
                        const cellType = classTypeOf(className);
                        const isFlashing = flashTypes?.includes(cellType) ?? false;
                        // Flashing cells are never dimmed, even if a filter
                        // for a different type is somehow active.
                        const matches =
                          filter === "all" || cellType === filter || isFlashing;
                        const time = t.schedule.slots[slotIdx];
                        const aria = fill(t.schedule.bookAria, {
                          name: className,
                          day,
                          time,
                        });
                        return (
                          <TableCell
                            key={`${dayIdx}-${slotIdx}`}
                            className={cn(
                              "whitespace-nowrap p-0",
                              isOpen ? "text-white/40" : "text-white/80"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  waLink(bookMessage(className, day, time)),
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              aria-label={aria}
                              title={aria}
                              className={cn(
                                "group/cell flex w-full items-center gap-2 px-3 py-3 text-start transition-all duration-300 hover:text-volt focus-visible:text-volt",
                                !matches && "opacity-25 saturate-0",
                                isFlashing && "flash-cell"
                              )}
                            >
                              <TypeMarker type={classTypeOf(className)} />
                              <span className={cn("transition-transform duration-200 group-hover/cell:translate-x-0.5 rtl:group-hover/cell:-translate-x-0.5")}>
                                {className}
                              </span>
                              <WhatsappIcon
                                className="size-3.5 shrink-0 text-volt opacity-0 transition-opacity duration-200 group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100"
                              />
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <ul
            aria-label={t.legend.ariaLabel}
            className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/55"
          >
            {legend.map((item) => (
              <li key={item.type} className="flex items-center gap-2">
                <TypeMarker type={item.type} />
                {item.label}
              </li>
            ))}
          </ul>

          {/* Booking hint */}
          <p className="mt-3 flex items-center gap-2 text-xs text-white/45">
            <WhatsappIcon className="size-4 shrink-0 text-volt" />
            {t.schedule.bookHint}
          </p>

          {/* Full-week .ics export */}
          <button
            type="button"
            onClick={downloadWeekIcs}
            aria-label={t.schedule.weekIcs.aria}
            className="mt-4 inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-xs font-semibold text-white/65 transition-colors hover:border-volt hover:text-volt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
          >
            <CalendarPlus className="size-4 shrink-0" aria-hidden="true" />
            {weekSaved ? t.programs.calendarDone : t.schedule.weekIcs.label}
          </button>

          {/* Best time to train — busyness chart */}
          <BusyHours />
        </Reveal>
      </div>
    </section>
  );
}
