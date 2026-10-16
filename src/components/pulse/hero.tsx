"use client";

/**
 * Full-screen hero: dark photo, oversized Bebas headline, two CTAs
 * (WhatsApp trial / memberships anchor) and a member-rating trust line.
 * The rotated lime ticker sits right under it (see <Ticker/>).
 */

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { waLink } from "@/lib/site-config";
import { TRIAL_MESSAGE } from "@/lib/i18n";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";
import { LiveNow } from "./live-now";
import { Ticker } from "./ticker";

export function Hero() {
  const { t, lang } = useLanguage();

  return (
    <section id="top" className="relative flex min-h-svh flex-col">
      {/* Background photo + scrims */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={IMAGES.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="kenburns object-cover object-center opacity-45"
        />
        {/* Vertical gradient keeps the left text column readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
        {/* Faint blueprint grid, fading upward */}
        <div className="hero-grid absolute inset-0" />
        {/* Lime radial glow on the start side (mirrors in RTL) */}
        <div className="hero-glow absolute inset-0" />
        {/* Subtle lime edge glow at the very bottom */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-volt/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <p className="mb-5 inline-flex w-fit items-center gap-3 border border-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80 sm:text-xs">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-volt" aria-hidden="true" />
          {t.hero.eyebrow}
        </p>

        <h1 className="font-display max-w-4xl text-[clamp(3.75rem,13vw,10rem)] leading-[0.85] text-balance text-white">
          {t.hero.titleA}
          <br />
          <span className="text-volt">{t.hero.titleB}</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          {t.hero.subtitle}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="h-13 bg-volt px-7 text-base font-bold text-ink shadow-[0_0_36px_rgba(198,255,61,0.28)] transition-all hover:bg-white hover:shadow-[0_0_48px_rgba(198,255,61,0.4)]"
          >
            <a
              href={waLink(TRIAL_MESSAGE[lang])}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2.5"
            >
              <WhatsappIcon className="size-5" />
              {t.hero.primaryCta}
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-13 border-white/25 bg-transparent px-7 text-base font-semibold text-white transition-colors hover:border-volt hover:bg-transparent hover:text-volt"
          >
            <a href="#memberships" className="gap-2">
              {t.hero.secondaryCta}
              <ArrowDown className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </a>
          </Button>
        </div>

        {/* Live timetable chip — what's on / what's next (Beirut time) */}
        <div className="mt-8">
          <LiveNow />
        </div>

        <p className="mt-4 text-sm text-white/50">{t.hero.rating}</p>
      </div>

      {/* Signature lime ticker slicing out of the hero */}
      <Ticker />
    </section>
  );
}
