"use client";

/**
 * FAQ: five questions in a shadcn accordion, hairline dividers,
 * lime open-state. Two-column on desktop (heading | accordion).
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./motion";
import { useLanguage } from "./language-provider";

export function Faq() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="bg-panel/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="flex items-baseline gap-3">
              <span
                aria-hidden="true"
                className="font-display text-2xl leading-none text-white/20 sm:text-3xl"
              >
                07
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-volt sm:text-sm">
                {t.faq.eyebrow}
              </span>
            </p>
            <h2 className="font-display text-5xl leading-[0.92] text-white sm:text-6xl lg:text-7xl">
              {t.faq.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <Accordion type="single" collapsible className="w-full">
            {t.faq.items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="border-white/10"
              >
                <AccordionTrigger className="py-5 text-start text-base font-semibold text-white hover:text-volt hover:no-underline sm:text-lg [&[data-state=open]]:text-volt">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-white/65 sm:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
