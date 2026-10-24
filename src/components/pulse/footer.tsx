"use client";

/**
 * Footer: brand + tagline, explore links, contact column and social
 * icon buttons (all with aria-labels). Sticks to the viewport bottom
 * via the page wrapper (min-h-screen flex-col + mt-auto).
 */

import Link from "next/link";
import { useState } from "react";
import { Check, Instagram, Facebook, MapPin, Share2 } from "lucide-react";
import { SITE, waLink } from "@/lib/site-config";
import { TRIAL_MESSAGE } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLanguage } from "./language-provider";
import { TiktokIcon, WhatsappIcon } from "./icons";

export function Footer() {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  /** Native share sheet where supported, clipboard fallback elsewhere.
   * User cancellation lands in the catch — silently ignored. */
  const shareSite = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: SITE.name, text: t.footer.shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* cancelled or blocked — no-op */
    }
  };

  const explore = [
    { href: "#programs", label: t.nav.programs },
    { href: "#memberships", label: t.nav.memberships },
    { href: "#schedule", label: t.nav.schedule },
    { href: "#trainers", label: t.nav.trainers },
    { href: "#gallery", label: t.gallery.eyebrow },
    { href: "#faq", label: t.nav.faq },
    { href: "#location", label: t.location.eyebrow },
  ];

  /** Social icons are concept placeholders ("#") — the WhatsApp link is real. */
  const socials = [
    { href: "#", label: t.footer.socialAria.instagram, icon: <Instagram className="size-4" aria-hidden="true" /> },
    { href: "#", label: t.footer.socialAria.facebook, icon: <Facebook className="size-4" aria-hidden="true" /> },
    { href: "#", label: t.footer.socialAria.tiktok, icon: <TiktokIcon className="size-4" /> },
    {
      href: waLink(TRIAL_MESSAGE[lang]),
      label: t.footer.socialAria.whatsapp,
      icon: <WhatsappIcon className="size-4" />,
    },
  ];

  return (
    <footer className="mt-auto border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <p className="font-display text-4xl leading-none tracking-wide text-white">
            PULSE<span className="text-volt">961</span>
          </p>
          <p className="text-sm text-white/55">{t.footer.tagline}</p>
          <ul className="mt-2 flex items-center gap-2">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  {...(social.href === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition-all duration-200 hover:border-volt hover:bg-volt hover:text-ink"
                >
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <nav aria-label="Footer">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            {t.footer.exploreTitle}
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-volt"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            {t.footer.contactTitle}
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-volt" aria-hidden="true" />
              {t.location.address}
            </li>
            <li>
              <button
                type="button"
                onClick={shareSite}
                aria-label={t.footer.shareAria}
                className={cn(
                  "flex items-center gap-2 text-start transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt",
                  copied ? "text-volt" : "hover:text-volt"
                )}
              >
                {copied ? (
                  <Check className="size-4 shrink-0 text-volt" aria-hidden="true" />
                ) : (
                  <Share2 className="size-4 shrink-0 text-volt" aria-hidden="true" />
                )}
                {copied ? t.footer.shareCopied : t.footer.shareCta}
              </button>
            </li>
          </ul>
        </div>

        {/* Hours summary */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            {t.location.hoursLabel}
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
            {t.location.hours.map((row) => (
              <li key={row.days} className="flex items-center justify-between gap-3">
                <span>{row.days}</span>
                <span className="text-white/45">{row.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-white/40 sm:flex-row sm:px-6 sm:text-start lg:px-8">
          <p>© {year} {t.footer.rights}</p>
          <p>
            <span className="text-white/55">{t.footer.credit}</span>
          </p>
        </div>
      </div>

      {/* Ghost wordmark — huge outlined type, purely editorial */}
      <div aria-hidden="true" className="overflow-hidden">
        <p className="footer-watermark font-display -mb-[0.16em] w-full text-center text-[21vw] leading-none tracking-wide">
          PULSE961
        </p>
      </div>
    </footer>
  );
}
