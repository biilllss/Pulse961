"use client";

/**
 * Memberships: four USD plans. The 3-month plan is the highlighted
 * "Most popular" card (solid lime). Every card gets its own WhatsApp
 * button with a pre-filled message naming that exact plan.
 *
 * Below the grid: a comparison matrix, an interactive plan finder,
 * and a "gift a membership" strip (any plan, pre-filled WhatsApp).
 */

import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, waLink } from "@/lib/site-config";
import { lbpAmount } from "@/lib/hours-utils";
import { cn } from "@/lib/utils";
import { Reveal, spotlightMove } from "./motion";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "./language-provider";
import { useLbp } from "./use-lbp";
import { WhatsappIcon } from "./icons";
import { PlanFinder } from "./plan-finder";
import { PlanCompare } from "./plan-compare";

/** Index of the highlighted plan in translations.memberships.plans */
export const POPULAR_INDEX = 1;

/**
 * Numeric mirror of translations.memberships.plans (positional — same
 * contract as PROGRAM_TYPES/COACH_TYPES): total price in USD and the
 * number of days the plan covers, for the cost-per-day line and the
 * LBP hints. Exported for the compare matrix + gift select.
 */
export const PLAN_PRICES: Array<{ usd: number; days: number }> = [
  { usd: 35, days: 30 }, // Monthly
  { usd: 90, days: 90 }, // 3 Months
  { usd: 300, days: 365 }, // 12 Months
  { usd: 25, days: 30 }, // Student
];

/** 1.1666 → "$1.17", 1 → "$1" — no trailing zeros, always a $ sign. */
function perDayPrice(usd: number, days: number): string {
  return `$${parseFloat((usd / days).toFixed(2))}`;
}

export function Memberships() {
  const { t, lang } = useLanguage();
  /** Which plan is being gifted (defaults to the popular one). */
  const [giftPlan, setGiftPlan] = useState(POPULAR_INDEX);
  /** Shared LBP preference (pricing grid ↔ compare matrix ↔ gift select). */
  const { showLbp, toggleLbp } = useLbp();

  return (
    <section id="memberships" className="bg-panel/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <SectionHeading
          index="02"
          eyebrow={t.memberships.eyebrow}
          title={t.memberships.title}
          subtitle={t.memberships.subtitle}
        />

        {/* Optional LBP price hints — right-aligned toggle above the grid */}
        <div className="mb-8 flex justify-start sm:justify-end">
          <button
            type="button"
            role="switch"
            aria-checked={showLbp}
            onClick={toggleLbp}
            className={cn(
              "inline-flex h-10 items-center gap-3 border px-3.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt",
              showLbp
                ? "border-volt bg-volt/10 text-volt"
                : "border-white/15 bg-transparent text-white/55 hover:border-white/30 hover:text-white/80"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "relative h-4 w-8 border transition-colors duration-200",
                showLbp ? "border-volt bg-volt/25" : "border-white/25 bg-white/10"
              )}
            >
              <span
                className={cn(
                  "absolute start-0.5 top-1/2 size-2.5 -translate-y-1/2 bg-current transition-transform duration-200",
                  showLbp && "translate-x-[18px] rtl:-translate-x-[18px]"
                )}
              />
            </span>
            {t.memberships.lbpToggle}
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {t.memberships.plans.map((plan, i) => {
            const popular = i === POPULAR_INDEX;
            return (
              <Reveal key={plan.name} delay={i * 90} className="h-full">
                <article
                  onMouseMove={popular ? undefined : spotlightMove}
                  className={cn(
                    "plan-card relative flex h-full flex-col border p-6 hover:-translate-y-1",
                    popular
                      ? "border-volt bg-volt text-ink shadow-[0_18px_60px_rgba(198,255,61,0.18)] xl:-translate-y-2"
                      : "spotlight hover-glow border-white/10 bg-panel hover:border-white/25"
                  )}
                >
                  {popular && (
                    <span className="absolute -top-3 start-6 bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-volt">
                      {t.memberships.popularBadge}
                    </span>
                  )}

                  <h3 className="font-display text-3xl tracking-wide">{plan.name}</h3>

                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-6xl leading-none tabular-nums">{plan.price}</span>
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      popular ? "text-ink/70" : "text-white/55"
                    )}
                  >
                    {plan.note}
                  </p>

                  {/* Cost-per-day + optional LBP hint */}
                  <p
                    className={cn(
                      "mt-1.5 text-[13px] tabular-nums",
                      popular ? "text-ink/60" : "text-white/45"
                    )}
                  >
                    {t.memberships.perDay.replace(
                      "{price}",
                      perDayPrice(PLAN_PRICES[i].usd, PLAN_PRICES[i].days)
                    )}
                  </p>
                  {showLbp && (
                    <p
                      className={cn(
                        "mt-1 text-[13px] font-semibold tabular-nums",
                        popular ? "text-ink/75" : "text-volt/90"
                      )}
                    >
                      <span dir="auto">
                        {t.memberships.lbpLine.replace(
                          "{amount}",
                          lbpAmount(lang, PLAN_PRICES[i].usd, SITE.lbpRate)
                        )}
                      </span>
                    </p>
                  )}

                  <ul className="mt-5 flex flex-col gap-2.5 border-t pt-5 text-sm"
                      style={{ borderColor: popular ? "rgba(10,10,10,0.15)" : undefined }}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            popular ? "text-ink" : "text-volt"
                          )}
                          aria-hidden="true"
                        />
                        <span className={popular ? "text-ink/85" : "text-white/75"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={cn(
                      "group/cta mt-6 w-full gap-2 font-bold",
                      popular
                        ? "bg-ink text-volt hover:bg-black/80"
                        : "bg-volt text-ink hover:bg-volt/90"
                    )}
                  >
                    <a
                      href={waLink(plan.wa)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.memberships.joinAria.replace("{plan}", plan.name)}
                    >
                      <WhatsappIcon className="size-4" />
                      {plan.cta}
                      <ArrowRight className="cta-arrow size-4" aria-hidden="true" />
                    </a>
                  </Button>
                  <span className="sr-only">({lang === "ar" ? "واتساب" : "WhatsApp"})</span>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Mobile-friendly side-by-side comparison of every plan */}
        <PlanCompare />

        {/* Interactive starting-point tool (BMI → first class) */}
        <PlanFinder />

        {/* Gift a membership — any plan as a present, one WhatsApp tap */}
        <Reveal>
          <div className="mt-12 flex flex-col gap-6 border border-dashed border-volt/40 bg-panel p-6 transition-colors duration-300 hover:border-volt/70 sm:p-8 md:flex-row md:items-center">
            <div className="flex flex-1 items-start gap-4">
              <span
                aria-hidden="true"
                className="hidden size-12 shrink-0 items-center justify-center border border-volt/40 text-volt sm:flex"
              >
                <Gift className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-2xl tracking-wide text-white">
                  {t.memberships.gift.title}
                </h3>
                <p className="mt-1 max-w-md text-sm text-white/55">
                  {t.memberships.gift.line}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-56">
                <select
                  aria-label={t.memberships.gift.selectAria}
                  value={giftPlan}
                  onChange={(e) => setGiftPlan(Number(e.target.value))}
                  className="h-12 w-full appearance-none border border-white/15 bg-ink ps-4 pe-10 text-sm text-white outline-none transition-colors focus-visible:border-volt focus-visible:outline-none"
                >
                  {t.memberships.plans.map((plan, i) => (
                    <option key={plan.name} value={i}>
                      {showLbp
                        ? `${plan.name} — ${plan.price} (${lbpAmount(lang, PLAN_PRICES[i].usd, SITE.lbpRate)})`
                        : `${plan.name} — ${plan.price}`}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-white/50"
                />
              </div>
              <Button
                asChild
                className="group/cta h-12 gap-2 bg-volt font-bold text-ink hover:bg-volt/90"
              >
                <a
                  href={waLink(
                    t.memberships.gift.wa.replace(
                      "{plan}",
                      t.memberships.plans[giftPlan].name
                    )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.memberships.gift.aria}
                >
                  <WhatsappIcon className="size-4" />
                  {t.memberships.gift.cta}
                  <ArrowRight className="cta-arrow size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8 text-center text-xs text-white/45 sm:text-sm">
            <p>{t.memberships.footnote}</p>
            {showLbp && (
              <p aria-live="polite" className="mt-1.5 text-white/35">
                {t.memberships.lbpNote.replace(
                  "{rate}",
                  SITE.lbpRate.toLocaleString("en-US")
                )}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
