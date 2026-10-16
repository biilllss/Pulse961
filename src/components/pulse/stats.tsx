"use client";

/**
 * Stats strip: four big count-up numbers separated by hairline gaps
 * (gap-px over a faint white grid = direction-safe dividers).
 */

import { CountUp, Reveal } from "./motion";
import { useLanguage } from "./language-provider";

export function Stats() {
  const { t } = useLanguage();

  return (
    <section aria-label="Key numbers" className="border-b border-white/10 bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
            {t.stats.items.map((stat) => (
              <div
                key={stat.label}
                className="group flex flex-col items-center gap-1 bg-ink px-4 py-8 text-center transition-colors duration-300 hover:bg-white/[0.03] sm:py-10"
              >
                <dd className="font-display text-6xl leading-none text-volt transition-transform duration-300 ease-out group-hover:scale-105 sm:text-7xl">
                  {/* Animated digits are decorative; screen readers get the final value */}
                  <span aria-hidden="true" className="tabular-nums">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="sr-only">
                    {stat.value}
                    {stat.suffix}
                  </span>
                </dd>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-white/55 transition-colors duration-300 group-hover:text-white/80 sm:text-sm">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
