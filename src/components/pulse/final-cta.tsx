"use client";

/**
 * Final CTA band: angled top edge (the one big diagonal in the page),
 * oversized display line, and a personalized free-trial form — the
 * visitor's name + preferred program are baked into the WhatsApp
 * pre-filled message on submit.
 */

import { useMemo, useState, type FormEvent } from "react";
import { renderSVG } from "uqr";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRIAL_MESSAGE } from "@/lib/i18n";
import { waLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/i18n";
import { Reveal } from "./motion";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

type Interest = "strength" | "cardio" | "boxing" | "womens" | "unsure";

/** Compose the personalized WhatsApp message (natural copy per language). */
function buildMessage(
  lang: Language,
  name: string,
  interest: Interest,
  interestLabel: string
): string {
  const specific =
    interest !== "unsure"
      ? lang === "ar"
        ? ` — ${interestLabel} شكلها اللي بيناسبني.`
        : ` — ${interestLabel} sounds like my thing.`
      : lang === "ar"
        ? "."
        : ".";
  return lang === "ar"
    ? `أهلا Pulse 961، أنا ${name}. حابب أحجز حصة تجريبية${specific}`
    : `Hi Pulse 961, I'm ${name}. I'd like to book a free trial${specific}`;
}

export function FinalCta() {
  const { t, lang } = useLanguage();
  const [name, setName] = useState("");
  const [interest, setInterest] = useState<Interest>("unsure");
  const [submitted, setSubmitted] = useState(false);

  /**
   * Poster-style QR: encodes the free-week WhatsApp deep link so anyone
   * can point a phone camera at the screen (or a printed poster of this
   * card) and land on a pre-filled chat. Ink modules on the volt
   * background keep the dark-on-light contrast QR scanners need.
   */
  const qrSvg = useMemo(
    () =>
      renderSVG(waLink(TRIAL_MESSAGE[lang]), {
        ecc: "M",
        border: 1,
        pixelSize: 10,
        whiteColor: "transparent",
        blackColor: "#0A0A0A",
      }),
    [lang]
  );

  const interestLabels: Record<Interest, string> = {
    strength: t.trialForm.interests.strength,
    cardio: t.trialForm.interests.cardio,
    boxing: t.trialForm.interests.boxing,
    womens: t.trialForm.interests.womens,
    unsure: t.trialForm.interests.unsure,
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    const url = waLink(buildMessage(lang, clean, interest, interestLabels[interest]));
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <section aria-labelledby="final-cta-title" className="clip-slant-cta bg-volt">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <Reveal className="flex w-full flex-col items-center gap-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink/60 sm:text-sm">
            {t.cta.eyebrow}
          </p>
          <h2
            id="final-cta-title"
            className="font-display max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.9] text-ink"
          >
            {t.cta.title}
          </h2>
          <p className="max-w-xl text-base font-medium text-ink/70 sm:text-lg">
            {t.cta.subtitle}
          </p>

          {/* How it works — three steps before the form */}
          <div className="mt-8 w-full max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink/50">
              {t.cta.stepsLabel}
            </p>
            <ol className="mt-3 grid sm:grid-cols-3">
              {t.cta.steps.map((step, i) => (
                <li
                  key={step.title}
                  className={cn(
                    "flex flex-col items-start gap-1.5 border-ink/15 px-1 py-4 text-start sm:px-5",
                    i > 0 && "border-t sm:border-s sm:border-t-0",
                    i === 0 && "sm:ps-1",
                    i === t.cta.steps.length - 1 && "sm:pe-1"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-4xl leading-none text-ink/25"
                  >
                    0{i + 1}
                  </span>
                  <p className="font-bold text-ink">{step.title}</p>
                  <p className="text-sm leading-relaxed text-ink/65">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Personalized trial form → WhatsApp deep link */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
            noValidate={false}
          >
            <div className="flex flex-1 flex-col items-start gap-1 text-start">
              <label htmlFor="trial-name" className="text-xs font-bold uppercase tracking-widest text-ink/70">
                {t.trialForm.name}
              </label>
              <Input
                id="trial-name"
                name="name"
                required
                maxLength={40}
                autoComplete="name"
                placeholder={t.trialForm.namePlaceholder}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSubmitted(false);
                }}
                className="h-12 border-transparent bg-ink text-base text-white placeholder:text-white/40 focus-visible:ring-ink/40 focus-visible:border-volt"
              />
            </div>

            <div className="flex flex-1 flex-col items-start gap-1 text-start">
              <label htmlFor="trial-interest" className="text-xs font-bold uppercase tracking-widest text-ink/70">
                {t.trialForm.interest}
              </label>
              <div className="relative w-full">
                <select
                  id="trial-interest"
                  name="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value as Interest)}
                  className="h-12 w-full appearance-none border border-transparent bg-ink px-4 pe-10 text-base text-white outline-none focus-visible:ring-[3px] focus-visible:ring-ink/40"
                >
                  {(Object.keys(interestLabels) as Interest[]).map((key) => (
                    <option key={key} value={key}>
                      {interestLabels[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-white/50"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-1 sm:justify-end">
              <Button
                type="submit"
                className="h-12 w-full gap-2.5 bg-ink px-7 text-base font-bold text-volt transition-transform hover:scale-[1.02] hover:bg-black sm:w-auto"
              >
                <WhatsappIcon className="size-5" />
                {t.trialForm.submit}
              </Button>
            </div>
          </form>

          <div aria-live="polite" className="min-h-5">
            {submitted && (
              <p role="status" className="text-sm font-bold text-ink">
                {t.trialForm.success}
              </p>
            )}
          </div>

          <p className="max-w-md text-xs leading-relaxed text-ink/55">
            {t.trialForm.privacy}
          </p>

          {/* Scan-to-chat poster — the same free-week link, camera-ready */}
          <figure
            aria-label={t.cta.qrAria}
            className="mt-10 flex w-full max-w-60 flex-col items-center gap-3 border-2 border-ink bg-volt p-5 [box-shadow:6px_6px_0_#0A0A0A]"
          >
            {/* Viewfinder corner brackets around the code */}
            <div className="relative w-full">
              <div
                aria-hidden="true"
                className="[&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <span
                aria-hidden="true"
                className="absolute -start-1.5 -top-1.5 size-4 border-s-2 border-t-2 border-ink"
              />
              <span
                aria-hidden="true"
                className="absolute -end-1.5 -top-1.5 size-4 border-e-2 border-t-2 border-ink"
              />
              <span
                aria-hidden="true"
                className="absolute -start-1.5 -bottom-1.5 size-4 border-b-2 border-s-2 border-ink"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 -end-1.5 size-4 border-b-2 border-e-2 border-ink"
              />
            </div>
            <figcaption className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-ink">
                {t.cta.qrLabel}
              </span>
              <span className="text-[11px] leading-snug text-ink/60">
                {t.cta.qrSub}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
