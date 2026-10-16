"use client";

/**
 * Trainers: three cards, grayscale photos that regain color on hover,
 * Bebas names with a lime underline sweep, specialty chips and a
 * per-coach WhatsApp booking CTA ("Train with {name}"). The Instagram
 * chip stays always-visible too (touch screens have no hover).
 *
 * Each coach also gets a live "Next class" chip computed from the
 * weekly timetable in Beirut time (resolves which class types belong
 * to which coach), refreshed every 60s — tying the coaches to the
 * schedule without a single duplicated row of data.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { waLink } from "@/lib/site-config";
import { nextClassForTypes, type ClassType } from "@/lib/schedule-utils";
import { Reveal, spotlightMove } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

/** Weekly-grid class types each coach (by index) actually teaches. */
const COACH_TYPES: ClassType[][] = [
  ["strength"], // Karim — barbell side
  ["cardio", "womens"], // Rania — HIIT + women's floor
  ["boxing"], // Jad — ring corner
];

/** Fill a {key} template (keeps Arabic word order intact). */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function Trainers() {
  const { t } = useLanguage();
  const images = [IMAGES.trainers.karim, IMAGES.trainers.rania, IMAGES.trainers.jad];

  /** Next upcoming class per coach, resolved in Beirut time after mount. */
  const [nextClasses, setNextClasses] = useState<Array<ReturnType<
    typeof nextClassForTypes
  > | null>>([]);

  useEffect(() => {
    const compute = () =>
      setNextClasses(
        COACH_TYPES.map((types) =>
          nextClassForTypes(t.schedule.grid, t.schedule.slots, types)
        )
      );
    const raf = requestAnimationFrame(compute);
    const interval = setInterval(compute, 60_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [t]);

  return (
    <section id="trainers" className="bg-panel/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeading
          index="04"
          eyebrow={t.trainers.eyebrow}
          title={t.trainers.title}
          subtitle={t.trainers.subtitle}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.trainers.items.map((coach, i) => (
            <Reveal key={coach.name} delay={i * 90} className="h-full">
              <article
                onMouseMove={spotlightMove}
                className="group flex h-full flex-col border border-white/10 bg-panel transition-colors duration-300 hover:border-volt/70"
              >
                <div className="relative aspect-[3/4] shrink-0 overflow-hidden">
                  <Image
                    src={images[i]}
                    alt={coach.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent"
                    aria-hidden="true"
                  />
                  {/* Corner index — editorial numbering echoes the section headers */}
                  <span
                    aria-hidden="true"
                    className="absolute end-4 top-4 font-display text-4xl leading-none text-white/25 transition-colors duration-300 group-hover:text-volt/80"
                  >
                    0{i + 1}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-3xl tracking-wide text-white">
                    <span className="sweep inline-block">{coach.name}</span>
                  </h3>
                  <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-volt">
                    {coach.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{coach.bio}</p>

                  {/* Specialty chips */}
                  <ul
                    aria-label={t.trainers.specialtiesLabel}
                    className="mt-4 flex flex-wrap gap-1.5"
                  >
                    {coach.specialties.map((specialty) => (
                      <li
                        key={specialty}
                        className="border border-white/10 px-2 py-0.5 text-[11px] font-medium text-white/55 transition-colors group-hover:border-white/20 group-hover:text-white/70"
                      >
                        {specialty}
                      </li>
                    ))}
                  </ul>

                  {/* Live "next class" chip — computed from the timetable
                      (Beirut time). Clicking it deep-links to the weekly
                      grid and pulses that coach's classes on arrival. */}
                  {nextClasses[i] && (
                    <button
                      type="button"
                      onClick={() => {
                        // Reset the filter to "all" so the flashed cells are
                        // never dimmed by a leftover type filter.
                        window.dispatchEvent(
                          new CustomEvent("pulse961:flash-schedule", {
                            detail: { types: COACH_TYPES[i], filter: "all" },
                          })
                        );
                        document.getElementById("schedule")?.scrollIntoView({
                          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                            .matches
                            ? "auto"
                            : "smooth",
                        });
                      }}
                      aria-label={fill(t.trainers.chipAria, { coach: coach.name })}
                      className="mt-4 inline-flex w-fit cursor-pointer items-center gap-2 border border-volt/25 bg-ink/60 px-2.5 py-1.5 text-[11px] font-semibold text-white/75 transition-colors hover:border-volt/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt group-hover:border-volt/50"
                    >
                      <span aria-hidden="true" className="relative flex size-2 shrink-0">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-volt/70 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-volt" />
                      </span>
                      {fill(t.trainers.nextClass, {
                        name: nextClasses[i]!.name,
                        day: t.schedule.days[nextClasses[i]!.dayIdx],
                        time: t.schedule.slots[nextClasses[i]!.session.slotIdx],
                      })}
                      <ArrowDown
                        className="size-3 shrink-0 text-volt"
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  {/* Actions: Instagram chip + WhatsApp booking CTA */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`https://instagram.com/${coach.ig}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.trainers.followAria.replace("{name}", coach.name)}
                      className="inline-flex items-center gap-2 border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:border-volt hover:text-volt"
                    >
                      <Instagram className="size-3.5" aria-hidden="true" />
                      <span dir="ltr">@{coach.ig}</span>
                    </a>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-volt/50 bg-transparent px-3 text-xs font-bold text-volt hover:bg-volt hover:text-ink"
                    >
                      <a
                        href={waLink(t.trainers.bookWa.replace("{coach}", coach.name))}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.trainers.bookAria.replace("{coach}", coach.name)}
                      >
                        <WhatsappIcon className="size-3.5" />
                        {t.trainers.bookCta.replace("{name}", coach.name)}
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
