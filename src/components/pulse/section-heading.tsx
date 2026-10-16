"use client";

/**
 * Consistent section header used by every section:
 * ghost index number -> lime eyebrow -> oversized display title -> subtitle.
 */

import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Editorial section number, e.g. "01" — rendered as a ghost digit. */
  index?: string;
  align?: "start" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  index,
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-col gap-3 sm:mb-14",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <p className="flex items-baseline gap-3">
        {index && (
          <span
            aria-hidden="true"
            className="font-display text-2xl leading-none text-white/20 sm:text-3xl"
          >
            {index}
          </span>
        )}
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-volt sm:text-sm">
          {eyebrow}
        </span>
        {/* Editorial ruled hairline trailing the eyebrow (start-aligned headings) */}
        {align === "start" && (
          <span
            aria-hidden="true"
            className="hidden h-px w-20 self-center bg-gradient-to-r from-volt/50 to-transparent sm:block rtl:-scale-x-100"
          />
        )}
      </p>
      <h2 className="font-display text-5xl leading-[0.92] text-balance text-white sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-xl text-base text-white/60 sm:text-lg">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
