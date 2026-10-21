"use client";

/**
 * Plan Finder — an interactive starting-point tool under the pricing grid.
 * One tap picks a goal (build strength / lose fat / learn boxing /
 * women's classes), the panel suggests the first class to open with,
 * and the WhatsApp CTA sends a pre-filled message with that goal.
 * Deliberately framed as "a starting point, not a diagnosis".
 */

import { useMemo, useState } from "react";
import { ArrowRight, Dumbbell, Flame, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { useLanguage } from "./language-provider";
import { WhatsappIcon } from "./icons";

type Goal = "strength" | "fatloss" | "boxing" | "womens";

const GOAL_ORDER: Goal[] = ["strength", "fatloss", "boxing", "womens"];

/** Icon per goal — decorative only, the label carries the meaning. */
const GOAL_ICONS: Record<Goal, typeof Dumbbell> = {
  strength: Dumbbell,
  fatloss: Flame,
  boxing: Target,
  womens: Users,
};

export function PlanFinder() {
  const { t } = useLanguage();
  const [goal, setGoal] = useState<Goal | null>(null);

  const waHref = useMemo(() => {
    if (!goal) return undefined;
    const message = t.finder.waTemplate
      .replace("{goal}", t.finder.goals[goal])
      .replace("{program}", t.finder.programs[goal]);
    return waLink(message);
  }, [goal, t]);

  return (
    <Reveal>
      <div className="mt-14 border border-white/10 bg-panel">
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14">
          {/* ── Goal picker ─────────────────────────────────────── */}
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

            <div
              role="group"
              aria-label={t.finder.groupAria}
              className="mt-8 grid grid-cols-2 gap-3"
            >
              {GOAL_ORDER.map((key) => {
                const Icon = GOAL_ICONS[key];
                const selected = goal === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGoal(key)}
                    aria-pressed={selected}
                    className={cn(
                      "group flex flex-col items-start gap-3 border p-4 text-start transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-volt sm:p-5",
                      selected
                        ? "border-volt bg-volt/10 text-white"
                        : "border-white/10 bg-ink/60 text-white/80 hover:border-volt/50 hover:text-white"
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "size-6 transition-colors",
                        selected ? "text-volt" : "text-white/50 group-hover:text-volt/80"
                      )}
                    />
                    <span className="text-sm font-bold uppercase tracking-[0.1em]">
                      {t.finder.goals[key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Suggestion ──────────────────────────────────────── */}
          <div
            className="flex flex-col justify-between border border-white/10 bg-ink/70 p-6 sm:p-8"
            aria-live="polite"
          >
            {goal ? (
              <div key={goal} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  {t.finder.yourGoal}
                </p>
                <p className="mt-2 inline-block border border-volt/60 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-volt">
                  {t.finder.goals[goal]}
                </p>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  {t.finder.programLabel}
                </p>
                <p className="mt-2 inline-block bg-volt px-3 py-1.5 font-display text-2xl tracking-wide text-ink sm:text-3xl">
                  {t.finder.programs[goal]}
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
