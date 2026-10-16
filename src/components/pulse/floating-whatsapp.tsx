"use client";

/**
 * Floating WhatsApp button — mobile only (the header CTA covers desktop).
 * `end-*` is a logical property, so it mirrors automatically in RTL.
 */

import { waLink } from "@/lib/site-config";
import { TRIAL_MESSAGE } from "@/lib/i18n";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

export function FloatingWhatsapp() {
  const { t, lang } = useLanguage();

  return (
    <a
      href={waLink(TRIAL_MESSAGE[lang])}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.floating.aria}
      className="fixed bottom-5 end-5 z-50 flex size-14 items-center justify-center rounded-full bg-volt text-ink shadow-[0_8px_30px_rgba(198,255,61,0.4)] transition-transform hover:scale-105 md:hidden"
    >
      {/* Soft ping ring (disabled under reduced motion) */}
      <span
        aria-hidden="true"
        className="absolute inline-flex size-full animate-ping rounded-full bg-volt/40 motion-reduce:animate-none"
      />
      <WhatsappIcon className="relative size-7" />
    </a>
  );
}
