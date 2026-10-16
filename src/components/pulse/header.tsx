"use client";

/**
 * Sticky header: transparent over the hero, solid after scroll.
 * Contains the wordmark, section links, EN|AR toggle and the trial CTA.
 * On mobile it collapses into a Sheet menu (mirrored in RTL).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE, waLink } from "@/lib/site-config";
import { TRIAL_MESSAGE } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

export function Header() {
  const { t, lang, dir, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const links = [
    { href: "#programs", label: t.nav.programs },
    { href: "#memberships", label: t.nav.memberships },
    { href: "#schedule", label: t.nav.schedule },
    { href: "#trainers", label: t.nav.trainers },
    { href: "#faq", label: t.nav.faq },
  ];

  // Solid background, reading progress and scrollspy once the page scrolls.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        setScrolled(scrollTop > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, scrollTop / max) : 0);

        // Scrollspy: the nav item whose section has passed a probe line
        // at ~35% viewport height is the active one.
        const probe = window.innerHeight * 0.35;
        let current: string | null = null;
        for (const link of links) {
          const el = document.getElementById(link.href.slice(1));
          if (el && el.getBoundingClientRect().top <= probe) {
            current = link.href.slice(1);
          }
        }
        setActiveId(current);
      });
    };
    const initialRaf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initialRaf);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-white/10 bg-ink/95"
          : "border-b border-transparent bg-transparent"
      )}
    >
      {/* Reading progress bar (grows from the reading direction) */}
      <div
        aria-hidden="true"
        className="scroll-progress absolute inset-x-0 top-0 h-0.5 origin-inline-start bg-volt"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="#top"
          className="font-display text-3xl leading-none tracking-wide text-white"
          aria-label={`${SITE.name} — home`}
        >
          PULSE<span className="text-volt">961</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const isActive = activeId === link.href.slice(1);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  isActive ? "text-volt" : "text-white/70 hover:text-volt"
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-1.5 start-0 h-px w-full bg-volt transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language toggle */}
          <div
            role="group"
            aria-label={t.nav.langToggleLabel}
            className="flex items-center rounded-full border border-white/15 p-0.5 text-xs font-bold"
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={cn(
                "rounded-full px-2.5 py-1 transition-colors",
                lang === "en" ? "bg-volt text-ink" : "text-white/60 hover:text-white"
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              aria-pressed={lang === "ar"}
              className={cn(
                "rounded-full px-2.5 py-1 transition-colors",
                lang === "ar" ? "bg-volt text-ink" : "text-white/60 hover:text-white"
              )}
            >
              ع
            </button>
          </div>

          {/* Trial CTA */}
          <Button
            asChild
            size="sm"
            className="hidden bg-volt font-semibold text-ink hover:bg-volt/90 sm:inline-flex"
          >
            <a
              href={waLink(TRIAL_MESSAGE[lang])}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5"
            >
              <WhatsappIcon className="size-4" />
              {t.nav.freeTrial}
            </a>
          </Button>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-volt lg:hidden"
                aria-label={t.nav.openMenu}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={dir === "rtl" ? "left" : "right"}
              className="w-72 border-white/10 bg-ink text-white"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-3xl tracking-wide text-white">
                  PULSE<span className="text-volt">961</span>
                </SheetTitle>
                <SheetDescription className="sr-only">{t.footer.tagline}</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-2 py-3 font-display text-2xl tracking-wide text-white/85 transition-colors hover:bg-white/5 hover:text-volt"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 bg-volt font-semibold text-ink hover:bg-volt/90"
                >
                  <a
                    href={waLink(TRIAL_MESSAGE[lang])}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="gap-2"
                  >
                    <WhatsappIcon className="size-4" />
                    {t.nav.freeTrial}
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
