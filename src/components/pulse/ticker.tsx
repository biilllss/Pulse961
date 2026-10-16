"use client";

/**
 * The signature lime "ticker tape" — a slightly rotated marquee strip that
 * slices out of the hero. Mirrors its rotation in RTL, and freezes entirely
 * under prefers-reduced-motion (see globals.css).
 */

import { useLanguage } from "./language-provider";

export function Ticker() {
  const { t } = useLanguage();
  // Duplicate the item list so the -50% translate loops seamlessly.
  const loop = [...t.ticker, ...t.ticker, ...t.ticker];

  return (
    <div aria-hidden="true" className="relative z-20 -mt-7 overflow-hidden py-4 sm:-mt-9">
      <div className="relative start-[-2%] w-[104%] rotate-[-1.5deg] border-y-2 border-ink bg-volt shadow-[0_10px_40px_rgba(198,255,61,0.15)] rtl:rotate-[1.5deg]">
        <div className="marquee-track flex w-max items-center gap-10 py-2.5">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap font-display text-xl tracking-wide text-ink sm:text-2xl"
            >
              {item}
              <span className="inline-block size-2 rotate-45 bg-ink" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
