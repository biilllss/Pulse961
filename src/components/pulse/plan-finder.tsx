"use client";

/**
 * Plan Finder — an interactive starting-point tool under the pricing grid.
 * Height/weight in metric (Lebanese default), live BMI, a suggested first
 * class per range, and a WhatsApp CTA that pre-fills the whole result.
 * Deliberately framed as "a starting point, not a diagnosis".
 */

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

/* Plausible adult ranges; outside these we show the waiting state. */
const HEIGHT = { min: 130, max: 215, step: 1, fallback: 175 };
const WEIGHT = { min: 40, max: 180, step: 1, fallback: 75 };

type Category = "underweight" | "healthy" | "overweight" | "obese";
type Program = "strength" | "boxing" | "cardio" | "coached";

/** BMI range → display category + recommended first class. */
function classify(bmi: number): { category: Category; program: Program } {
  if (bmi < 18.5) return { category: "underweight", program: "strength" };
  if (bmi < 25) return { category: "healthy", program: "boxing" };
  if (bmi < 30) return { category: "overweight", program: "cardio" };
  return { category: "obese", program: "coached" };
}

export function PlanFinder() {
  const { t } = useLanguage();
  const [height, setHeight] = useState(HEIGHT.fallback);
  const [weight, setWeight] = useState(WEIGHT.fallback);

  const validHeight = height >= HEIGHT.min && height <= HEIGHT.max;
  const validWeight = weight >= WEIGHT.min && weight <= WEIGHT.max;

  const result = useMemo(() => {
    if (!validHeight || !validWeight) return null;
    const bmi = weight / Math.pow(height / 100, 2);
    const { category, program } = classify(bmi);
    return { bmi: bmi.toFixed(1), category, program };
  }, [height, weight, validHeight, validWeight]);

  const waHref = useMemo(() => {
    if (!result) return undefined;
    const message = t.finder.waTemplate
      .replace("{bmi}", result.bmi)
      .replace("{category}", t.finder.categories[result.category])
      .replace("{program}", t.finder.programs[result.program]);
    return waLink(message);
  }, [result, t]);

  return (
    <Reveal>
      <div className="mt-14 border border-white/10 bg-panel">
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14">
          {/* ── Inputs ─────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-volt">
              {t.finder.eyebrow}
            </p>
            <h3 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
              {t.finder.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {t.finder.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-6">
              <MetricField
                id="finder-height"
                label={t.finder.heightLabel}
                unit="cm"
                value={height}
                min={HEIGHT.min}
                max={HEIGHT.max}
                step={HEIGHT.step}
                onChange={setHeight}
              />
              <MetricField
                id="finder-weight"
                label={t.finder.weightLabel}
                unit="kg"
                value={weight}
                min={WEIGHT.min}
                max={WEIGHT.max}
                step={WEIGHT.step}
                onChange={setWeight}
              />
            </div>
          </div>

          {/* ── Live result ────────────────────────────────────── */}
          <div
            className="flex flex-col justify-between border border-white/10 bg-ink/70 p-6 sm:p-8"
            aria-live="polite"
          >
            {result ? (
              <div key={result.bmi} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  {t.finder.resultLabel}
                </p>
                <p className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-7xl leading-none text-volt sm:text-8xl">
                    {result.bmi}
                  </span>
                  <span className="border border-volt/60 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-volt">
                    {t.finder.categories[result.category]}
                  </span>
                </p>
                <p className="mt-4 text-sm text-white/65">{t.finder.goals[result.category]}</p>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  {t.finder.programLabel}
                </p>
                <p className="mt-2 inline-block bg-volt px-3 py-1.5 font-display text-2xl tracking-wide text-ink">
                  {t.finder.programs[result.program]}
                </p>

                {waHref && (
                  <Button
                    asChild
                    className="group/cta mt-8 w-full gap-2 bg-volt font-bold text-ink hover:bg-white sm:w-auto"
                  >
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.finder.cta}
                    >
                      <WhatsappIcon className="size-4" />
                      {t.finder.cta}
                      <ArrowRight className="cta-arrow size-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <p className="m-auto max-w-56 text-center text-sm text-white/40">
                {t.finder.waiting}
              </p>
            )}
          </div>
        </div>

        <p className="border-t border-white/10 px-6 py-3 text-xs text-white/40 sm:px-10">
          {t.finder.disclaimer}
        </p>
      </div>
    </Reveal>
  );
}

/**
 * One metric row: a numeric input + a range slider bound to the same
 * state (fast on touch, precise with the keyboard). The number input
 * is forced LTR — digits and "cm/kg" stay Western in Arabic too.
 */
function MetricField({
  id,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between text-sm font-semibold text-white/80"
      >
        {label}
        <span className="font-display text-2xl leading-none tracking-wide text-volt" aria-hidden="true">
          {value}
          <span className="ms-1 text-sm text-white/45">{unit}</span>
        </span>
      </label>
      <div className="mt-3 flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-hidden="true"
          tabIndex={-1}
          className="h-1.5 w-full cursor-pointer accent-volt"
        />
        <input
          id={id}
          type="number"
          dir="ltr"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onChange(next);
          }}
          className={cn(
            "w-20 border bg-ink px-2 py-1.5 text-center font-display text-xl tracking-wide text-white transition-colors",
            "focus:border-volt focus:outline-none",
            value >= min && value <= max ? "border-white/15" : "border-volt/70"
          )}
        />
      </div>
    </div>
  );
}
