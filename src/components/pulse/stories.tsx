"use client";

/**
 * Member stories: quote cards with lime quote marks and goal chips.
 * Deliberately no before/after photos — words and milestones only.
 * Each member gets an initials avatar (a lime ring around the first
 * letter of their name) and a giant ghost quote glyph behind the card;
 * the card lifts on hover with a volt top hairline.
 */

import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";

/** First grapheme of a name (works for Arabic too) — "وليد، 41" → "و". */
function initialOf(name: string): string {
  return Array.from(name.trim())[0] ?? "?";
}

export function Stories() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="stories-title" className="bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div id="stories-title">
          <SectionHeading
            index="06"
            eyebrow={t.stories.eyebrow}
            title={t.stories.title}
            subtitle={t.stories.subtitle}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {t.stories.items.map((story, i) => (
            <Reveal key={story.name} delay={i * 90} className="h-full">
              <figure
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden border border-white/10 bg-panel p-6",
                  "transition-all duration-300 hover:-translate-y-1 hover:border-volt/60",
                  "hover:shadow-[0_16px_44px_rgba(198,255,61,0.09)] sm:p-7"
                )}
              >
                {/* Ghost quote glyph, cropped by the card edge */}
                <span
                  aria-hidden="true"
                  className="font-display pointer-events-none absolute -end-4 -top-9 select-none text-[11rem] leading-none text-white/[0.05] transition-colors duration-300 group-hover:text-volt/[0.07]"
                >
                  ”
                </span>

                {/* Volt top hairline on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-volt via-volt/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rtl:-scale-x-100"
                />

                <Quote
                  className="relative size-8 rotate-180 text-volt rtl:rotate-0"
                  aria-hidden="true"
                />
                <blockquote className="relative mt-4 flex-1 text-balance text-base leading-relaxed text-white/85 sm:text-lg">
                  “{story.quote}”
                </blockquote>
                <figcaption className="relative mt-6 flex flex-col gap-3 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-3">
                    {/* Initials avatar — no photos, per the design brief */}
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-volt/50 bg-ink font-display text-xl text-volt transition-colors duration-300 group-hover:bg-volt group-hover:text-ink"
                    >
                      {initialOf(story.name)}
                    </span>
                    <span className="font-display text-2xl tracking-wide text-white">
                      {story.name}
                    </span>
                  </span>
                  <ul className="flex flex-wrap gap-2" aria-label={t.stories.goalsAria}>
                    {story.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border border-volt/40 px-2 py-0.5 text-[11px] font-semibold text-volt"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
