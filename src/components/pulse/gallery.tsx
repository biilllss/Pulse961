"use client";

/**
 * "Inside Pulse" gallery: a horizontally-snapping photo strip that lets
 * visitors walk the gym before they ever step in. Native overflow scroll
 * (touch-first, keyboard accessible), desktop chevron buttons that are
 * direction-aware, edge fade masks, caption chips and photo counters.
 *
 * Every card opens a fullscreen lightbox (controlled Radix Dialog) with
 * direction-aware prev/next controls, ArrowLeft/ArrowRight navigation
 * (mirrored in RTL), a photo counter and localized aria labels.
 */

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";

export function Gallery() {
  const { t, lang } = useLanguage();
  const scrollerRef = useRef<HTMLUListElement>(null);

  /** Lightbox state — `index` survives close so the exit frame keeps its photo. */
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = t.gallery.items.length;
  /** The card that opened the lightbox — Radix can't disambiguate focus
   * return between 6 triggers sharing one Dialog root, so we do it ourselves. */
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const step = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  /** Close: hand focus back to the opening card once Radix is done.
   * Radix restores focus to its (ambiguous) trigger AFTER the ~200ms
   * exit animation, so our restore has to outlast it. */
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      const target = lastTrigger.current;
      requestAnimationFrame(() => target?.focus());
      setTimeout(() => target?.focus(), 280);
    }
  };

  const openCard = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    lastTrigger.current = e.currentTarget;
    setIndex(i);
    setOpen(true);
  };

  /** Arrow keys: "visual right" always means "toward the strip's start" in RTL. */
  const onLightboxKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") step(lang === "ar" ? -1 : 1);
    else if (e.key === "ArrowLeft") step(lang === "ar" ? 1 : -1);
  };

  /**
   * Scroll one card left/right. Physical direction is derived from the
   * content direction so "next" always means "further down the strip".
   */
  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const rtl = lang === "ar";
    const card = el.querySelector("li");
    const stepWidth = (card?.getBoundingClientRect().width ?? 320) + 16;
    el.scrollBy({ left: dir * stepWidth * (rtl ? -1 : 1), behavior: "smooth" });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <section id="gallery" className="bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            index="05"
            eyebrow={t.gallery.eyebrow}
            title={t.gallery.title}
            subtitle={t.gallery.subtitle}
            className="mb-0 sm:mb-0"
          />

          {/* Desktop scroll controls */}
          <div className="mb-1 hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label={t.gallery.scrollHint}
              className="flex size-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-volt hover:bg-volt hover:text-ink"
            >
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label={t.gallery.scrollHint}
              className="flex size-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-volt hover:bg-volt hover:text-ink"
            >
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </div>

        <Reveal>
          <div className="relative">
            {/* Edge fades — direction aware via start/end CSS rules */}
            <div aria-hidden="true" className="gallery-fade-start pointer-events-none absolute inset-y-0 start-0 z-10 w-8 sm:w-12" />
            <div aria-hidden="true" className="gallery-fade-end pointer-events-none absolute inset-y-0 end-0 z-10 w-8 sm:w-12" />

            <ul
              ref={scrollerRef}
              tabIndex={0}
              aria-label={t.gallery.eyebrow}
              className="scrollbox -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
            >
              {t.gallery.items.map((item, i) => {
                const image = IMAGES.gallery.find((g) => g.altKey === item.altKey);
                return (
                  <li
                    key={item.altKey}
                    className="group relative w-[76%] shrink-0 snap-start overflow-hidden rounded-md border border-white/10 sm:w-[46%] lg:w-[31.5%]"
                  >
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => openCard(i, e)}
                        aria-label={t.gallery.openAria.replace("{n}", String(i + 1))}
                        className="block w-full cursor-pointer text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt"
                      >
                        <div className="relative aspect-[4/5] w-full sm:aspect-[5/5]">
                          <Image
                            src={image?.src ?? ""}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 640px) 76vw, (max-width: 1024px) 46vw, 31vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                          {/* Bottom vignette so the caption always reads */}
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent"
                          />

                          {/* Ghost number + expand affordance */}
                          <span
                            aria-hidden="true"
                            className="font-display absolute end-4 top-3 text-4xl leading-none text-white/35 sm:text-5xl"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            aria-hidden="true"
                            className="absolute end-4 top-[4.25rem] flex size-7 translate-y-1 items-center justify-center border border-white/25 bg-ink/60 text-white/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:top-[4.75rem]"
                          >
                            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M6 2H2v4M10 14h4v-4M2 10v4h4M14 6V2h-4" strokeLinecap="square" />
                            </svg>
                          </span>

                          {/* Caption chip */}
                          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                            <span className="rounded-sm bg-ink/80 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-volt group-hover:text-ink sm:text-[13px]">
                              {item.caption}
                            </span>
                            <span
                              aria-hidden="true"
                              className={cn(
                                "size-2 shrink-0 bg-volt transition-transform duration-300",
                                "group-hover:rotate-45"
                              )}
                            />
                          </div>
                        </div>
                      </button>
                    </DialogTrigger>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Hint + photo counter */}
          <p className="mt-3 flex items-center gap-2 text-xs text-white/45">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-volt" aria-hidden="true" />
            {t.gallery.scrollHint}
            <span aria-hidden="true" className="text-white/25">/</span>
            <span>
              {t.gallery.counterLabel} 01–{String(count).padStart(2, "0")}
            </span>
          </p>
        </Reveal>
      </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      <DialogContent
          showCloseButton={false}
          overlayClassName="bg-ink/95 backdrop-blur-sm"
          onKeyDown={onLightboxKeyDown}
          aria-label={t.gallery.dialogLabel}
          className="max-w-3xl gap-0 overflow-hidden rounded-md border-white/15 bg-panel p-0"
        >
          <DialogTitle className="sr-only">{t.gallery.dialogLabel}</DialogTitle>

          {(() => {
            const item = t.gallery.items[index];
            const image = IMAGES.gallery.find((g) => g.altKey === item.altKey);
            return (
              <>
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                  <Image
                    key={image?.src ?? index}
                    src={image?.src ?? ""}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />

                  {/* Photo counter */}
                  <span className="tabular-nums absolute start-3 top-3 border border-white/15 bg-ink/85 px-2.5 py-1.5 text-xs font-bold text-white/90 backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                    <span aria-hidden="true" className="text-white/35"> / {String(count).padStart(2, "0")}</span>
                  </span>

                  {/* Localized close */}
                  <DialogClose
                    aria-label={t.gallery.closeAria}
                    className="absolute end-3 top-3 flex size-10 items-center justify-center border border-white/15 bg-ink/85 text-white/80 backdrop-blur-sm transition-colors hover:border-volt hover:text-volt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </DialogClose>

                  {/* Direction-aware prev / next */}
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={t.gallery.prevAria}
                    className="absolute start-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-ink/70 text-white/80 backdrop-blur-sm transition-colors hover:border-volt hover:text-volt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt"
                  >
                    <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={t.gallery.nextAria}
                    className="absolute end-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-ink/70 text-white/80 backdrop-blur-sm transition-colors hover:border-volt hover:text-volt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt"
                  >
                    <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
                  </button>
                </div>

                {/* Caption bar */}
                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3.5">
                  <span className="rounded-sm bg-volt px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink sm:text-[13px]">
                    {item.caption}
                  </span>
                  <span className="hidden truncate text-xs text-white/45 sm:block">
                    {item.alt}
                  </span>
                </div>
              </>
            );
          })()}
      </DialogContent>

      {/* Neighbor preloader — while the lightbox is open, silently pull
          both adjacent photos through the SAME next/image props as the
          lightbox <Image> (fill + same sizes string) so the optimizer
          URL and srcset candidate match exactly → instant arrow taps.
          Alt is empty: decorative. */}
      {open && (
        <div aria-hidden="true" className="hidden">
          {[-1, 1].map((d) => (
            <div key={d} className="relative aspect-[16/10] w-[768px]">
              <Image
                src={IMAGES.gallery[(index + d + count) % count].src}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
