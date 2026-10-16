"use client";

/**
 * Accessible skip link — first focusable element on the page.
 */

import { useLanguage } from "./language-provider";

export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-volt focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink"
    >
      {t.nav.skipToContent}
    </a>
  );
}
