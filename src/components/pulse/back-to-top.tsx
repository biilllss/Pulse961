"use client";

/**
 * Back-to-top button — desktop only (on mobile the floating WhatsApp
 * button owns the corner). Uses `end-*` so it mirrors in RTL, and
 * appears once the visitor has scrolled down a bit.
 *
 * The ring is a conic-gradient driven by live scroll progress: it fills
 * volt as you descend the page, giving an at-a-glance depth cue. Not an
 * animation (no keyframes), so `prefers-reduced-motion` is unaffected.
 */

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "./language-provider";

/** Volt hex — inline conic-gradient can't use Tailwind classes. */
const VOLT = "#C6FF3D";

export function BackToTop() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 700);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    // Defer first read to a frame (no sync setState in effects).
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label={t.toTop}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        background: `conic-gradient(${VOLT} ${Math.round(progress * 360)}deg, rgba(255,255,255,0.14) 0deg)`,
      }}
      className="fixed bottom-5 end-5 z-40 hidden size-11 animate-in fade-in slide-in-from-bottom-2 rounded-full p-[2px] duration-300 transition-colors md:flex"
    >
      <span className="flex size-full items-center justify-center rounded-full bg-ink text-white/80 transition-colors hover:text-volt">
        <ArrowUp className="size-5" aria-hidden="true" />
      </span>
    </button>
  );
}
