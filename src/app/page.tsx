/**
 * Pulse 961 — one-page site (concept).
 *
 * Sections in order:
 * Header → Hero → Stats → Programs → Memberships → Schedule →
 * Trainers → Gallery → Stories → FAQ → Location → Final CTA → Footer
 * (+ floating WhatsApp button on mobile, JSON-LD for SEO, subtle
 * film-grain texture over everything).
 *
 * All copy comes from src/lib/i18n.ts (EN/AR) via LanguageProvider.
 */

import { Header } from "@/components/pulse/header";
import { Hero } from "@/components/pulse/hero";
import { Stats } from "@/components/pulse/stats";
import { Programs } from "@/components/pulse/programs";
import { Memberships } from "@/components/pulse/memberships";
import { Schedule } from "@/components/pulse/schedule";
import { Trainers } from "@/components/pulse/trainers";
import { Gallery } from "@/components/pulse/gallery";
import { Stories } from "@/components/pulse/stories";
import { Faq } from "@/components/pulse/faq";
import { Location } from "@/components/pulse/location";
import { FinalCta } from "@/components/pulse/final-cta";
import { Footer } from "@/components/pulse/footer";
import { FloatingWhatsapp } from "@/components/pulse/floating-whatsapp";
import { BackToTop } from "@/components/pulse/back-to-top";
import { SkipLink } from "@/components/pulse/skip-link";
import { JsonLd } from "@/components/pulse/json-ld";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      {/* Structured data (server-rendered, invisible) */}
      <JsonLd />

      {/* Film-grain texture — fixed, non-interactive, pure CSS */}
      <div aria-hidden="true" className="grain" />

      <SkipLink />
      <Header />
      <main id="main" className="flex-1">
        <Hero />
        <Stats />
        <Programs />
        <Memberships />
        <Schedule />
        <Trainers />
        <Gallery />
        <Stories />
        <Faq />
        <Location />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsapp />
      <BackToTop />
    </div>
  );
}
