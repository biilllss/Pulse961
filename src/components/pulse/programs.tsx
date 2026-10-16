"use client";

/**
 * Programs: four image cards, each opening a detail dialog — what to
 * expect, an intensity meter, who coaches it and a WhatsApp CTA.
 * The whole card is clickable via an accessible overlay trigger
 * (a real <button> stretched over the article, so the visible text
 * never sits inside a button). Cards also carry the mouse spotlight.
 */

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, CalendarPlus, Check, Clock, Dumbbell, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { waLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { programSessions, buildProgramIcs, type ClassType } from "@/lib/schedule-utils";
import { Reveal, spotlightMove } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

/** Which weekly-grid class type each program (by index) maps to. */
const PROGRAM_TYPES: ClassType[] = ["strength", "cardio", "boxing", "womens"];

export function Programs() {
  const { t } = useLanguage();
  const images = [
    IMAGES.programs.strength,
    IMAGES.programs.cardio,
    IMAGES.programs.boxing,
    IMAGES.programs.womens,
  ];

  /** Controlled dialog: which program card's details are open (null = none). */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  /** Which program's .ics was just downloaded (shows a brief "Saved ✓"). */
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  /** Deep-link to the timetable: close, travel, then set the filter and
      pulse this program's cells so the eye lands on the right rows. */
  const goToSchedule = (type: ClassType) => {
    setOpenIndex(null);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("pulse961:flash-schedule", {
          detail: { types: [type], filter: type },
        })
      );
      document.getElementById("schedule")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }, 90);
  };

  /** Build and download an .ics with every session of this program
      (each recurring weekly for 8 weeks, floating local times). */
  const downloadIcs = (i: number, sessions: ReturnType<typeof programSessions>) => {
    const ics = buildProgramIcs(
      sessions,
      t.schedule.slots,
      `${t.programs.items[i].name} — Pulse 961`,
      PROGRAM_TYPES[i],
      t.programs.calendarDesc
    );
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse961-${PROGRAM_TYPES[i]}-classes.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSavedIndex(i);
    window.setTimeout(() => setSavedIndex((cur) => (cur === i ? null : cur)), 2400);
  };

  return (
    <section id="programs" className="bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeading
          index="01"
          eyebrow={t.programs.eyebrow}
          title={t.programs.title}
          subtitle={t.programs.subtitle}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.programs.items.map((program, i) => {
            // Live link to the timetable: which days/slots this program's
            // class type actually runs, straight from the weekly grid.
            const sessions = programSessions(
              t.schedule.grid,
              t.schedule.slots,
              PROGRAM_TYPES[i]
            );
            return (
              <Reveal key={program.name} delay={i * 90} className="h-full">
                <Dialog
                  open={openIndex === i}
                  onOpenChange={(open) => setOpenIndex(open ? i : null)}
                >
                  <article
                  onMouseMove={spotlightMove}
                  className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-panel transition-colors duration-300 hover:border-volt/70 focus-within:border-volt/70"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={images[i]}
                      alt={program.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent"
                      aria-hidden="true"
                    />
                    {/* Big ghost index */}
                    <span
                      aria-hidden="true"
                      className="font-display absolute end-3 top-2 text-6xl leading-none text-white/15 transition-colors duration-300 group-hover:text-volt/80"
                    >
                      0{i + 1}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-3xl tracking-wide text-white">
                        {program.name}
                      </h3>
                      <span className="shrink-0 border border-volt/40 px-2 py-0.5 text-[11px] font-semibold text-volt">
                        {program.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">{program.description}</p>

                    {/* Visible affordance for the dialog (touch-safe) */}
                    <span
                      aria-hidden="true"
                      className="mt-2 inline-flex w-fit items-center gap-1.5 border border-volt/40 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-volt transition-colors duration-300 group-hover:bg-volt group-hover:text-ink"
                    >
                      {t.programs.detailsLabel}
                      <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
                    </span>
                  </div>

                  {/* Lime underline sweep on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 start-0 h-1 w-0 bg-volt transition-all duration-300 group-hover:w-full"
                  />

                  {/* Accessible full-card trigger (visible text stays outside the button) */}
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={t.programs.detailsAria.replace("{name}", program.name)}
                      className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-volt"
                    />
                  </DialogTrigger>
                </article>

                {/* ── Detail dialog ─────────────────────────────── */}
                <DialogContent
                  showCloseButton={false}
                  className="scrollbox max-h-[85svh] gap-0 overflow-y-auto border-white/10 bg-panel p-0 sm:max-w-lg"
                >
                  <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
                    <Image
                      src={images[i]}
                      alt={program.alt}
                      fill
                      sizes="(min-width: 640px) 512px, 100vw"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="absolute bottom-3 start-5 border border-volt/50 bg-ink/70 px-2 py-1 text-[11px] font-semibold text-volt backdrop-blur-sm">
                      {program.tag}
                    </span>
                  </div>

                  <DialogClose
                    aria-label={t.programs.closeLabel}
                    className="absolute end-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink hover:text-volt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </DialogClose>

                  <div className="flex flex-col gap-5 p-6">
                    <div>
                      <DialogTitle className="font-display text-4xl tracking-wide text-white">
                        {program.name}
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm leading-relaxed text-white/60">
                        {program.description}
                      </DialogDescription>
                    </div>

                    {/* Duration + coach meta row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
                      <span className="inline-flex items-center gap-2">
                        <Clock className="size-4 text-volt" aria-hidden="true" />
                        {program.tag}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Dumbbell className="size-4 text-volt" aria-hidden="true" />
                        {t.programs.coachLabel} {program.coach}
                      </span>
                    </div>

                    {/* Intensity meter */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                        {t.programs.intensityLabel}
                      </p>
                      <div
                        role="img"
                        aria-label={t.programs.intensityAria.replace(
                          "{level}",
                          String(program.intensity)
                        )}
                        className="mt-2 flex items-center gap-1.5"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            aria-hidden="true"
                            className={cn(
                              "h-1.5 w-9 transition-colors",
                              n <= program.intensity ? "bg-volt" : "bg-white/15"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* What to expect */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                        {t.programs.expectLabel}
                      </p>
                      <ul className="mt-2.5 flex flex-col gap-2">
                        {program.expect.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm leading-relaxed text-white/75"
                          >
                            <Check
                              className="mt-0.5 size-4 shrink-0 text-volt"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Live link to the weekly grid: when this program runs */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                        {t.programs.scheduleLabel}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {t.programs.sessionCount.replace(
                          "{count}",
                          String(sessions.length)
                        )}
                      </p>
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {sessions.map((s) => (
                          <li
                            key={`${s.dayIdx}-${s.slotIdx}`}
                            className="border border-white/10 bg-ink/60 px-2 py-1 text-[11px] font-medium text-white/70"
                          >
                            <span className="text-volt">{t.schedule.days[s.dayIdx]}</span>
                            <span aria-hidden="true"> · </span>
                            <span dir="ltr">{t.schedule.slots[s.slotIdx]}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Radix skips its own close when a handler calls
                          preventDefault, so the dialog is controlled and
                          we close it ourselves, then travel to the grid —
                          and flash this program's cells on arrival. */}
                      <a
                        href="#schedule"
                        onClick={(e) => {
                          e.preventDefault();
                          goToSchedule(PROGRAM_TYPES[i]);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-volt transition-colors hover:text-white"
                      >
                        {t.programs.seeSchedule}
                        <ArrowDown className="size-3.5" aria-hidden="true" />
                      </a>

                      {/* Add-to-calendar: one .ics with all sessions. */}
                      <button
                        type="button"
                        onClick={() => downloadIcs(i, sessions)}
                        aria-label={t.programs.calendarAria.replace("{name}", program.name)}
                        className="mt-3 ms-4 inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/65 transition-colors hover:border-volt hover:text-volt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
                      >
                        <CalendarPlus className="size-3.5" aria-hidden="true" />
                        {savedIndex === i ? t.programs.calendarDone : t.programs.addToCalendar}
                      </button>
                    </div>

                    <Button
                      asChild
                      className="mt-1 w-full gap-2 bg-volt font-bold text-ink hover:bg-volt/90"
                    >
                      <a
                        href={waLink(t.programs.detailsWa.replace("{name}", program.name))}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsappIcon className="size-4" />
                        {t.programs.detailsCta.replace("{name}", program.name)}
                      </a>
                    </Button>
                  </div>
                </DialogContent>
                </Dialog>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
