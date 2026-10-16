"use client";

/**
 * "Compare all plans" — a collapsible feature matrix under the pricing
 * grid (the mobile affordance the plan cards can't give: everything
 * side by side). The popular column is tinted volt so it still pops.
 * true → check, false → dash, string → quantity text.
 */

import { Check, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE } from "@/lib/site-config";
import { lbpAmount } from "@/lib/hours-utils";
import { cn } from "@/lib/utils";
import { PLAN_PRICES, POPULAR_INDEX } from "./memberships";
import { useLanguage } from "./language-provider";
import { useLbp } from "./use-lbp";

export function PlanCompare() {
  const { t, lang } = useLanguage();
  const { showLbp } = useLbp();
  const { compare, plans } = t.memberships;

  return (
    <Accordion
      type="single"
      collapsible
      className="mt-10 border-y border-white/10"
    >
      <AccordionItem value="compare" className="border-0">
        <AccordionTrigger
          aria-label={compare.aria}
          className="py-5 text-sm font-bold uppercase tracking-[0.18em] text-white hover:no-underline hover:text-volt sm:text-base"
        >
          {compare.label}
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="scrollbox overflow-x-auto rounded-md border border-white/10 bg-ink/60">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <caption className="sr-only">{compare.label}</caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky start-0 z-20 bg-ink p-3"
                  >
                    <span className="sr-only">Feature</span>
                  </th>
                  {plans.map((plan, i) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className={cn(
                        "p-3 text-center align-top",
                        i === POPULAR_INDEX && "bg-volt/10"
                      )}
                    >
                      <span
                        className={cn(
                          "font-display block text-xl tracking-wide",
                          i === POPULAR_INDEX ? "text-volt" : "text-white"
                        )}
                      >
                        {plan.name}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs font-medium tabular-nums",
                          i === POPULAR_INDEX ? "text-volt/80" : "text-white/50"
                        )}
                      >
                        {plan.price}
                      </span>
                      {showLbp && (
                        <span
                          dir="auto"
                          className={cn(
                            "mt-0.5 block text-[11px] font-semibold tabular-nums",
                            i === POPULAR_INDEX ? "text-volt/70" : "text-white/35"
                          )}
                        >
                          {lbpAmount(lang, PLAN_PRICES[i].usd, SITE.lbpRate)}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compare.rows.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th
                      scope="row"
                      className="sticky start-0 z-10 border-e border-white/10 bg-ink px-3 py-3 text-start text-xs font-medium text-white/70 shadow-[1px_0_0_rgba(255,255,255,0.06)] sm:text-sm"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, i) => (
                      <td
                        key={`${row.label}-${i}`}
                        className={cn(
                          "px-3 py-3 text-center",
                          i === POPULAR_INDEX && "bg-volt/[0.07]"
                        )}
                      >
                        {value === true ? (
                          <>
                            <Check
                              aria-hidden="true"
                              className="mx-auto size-4 text-volt"
                            />
                            <span className="sr-only">{compare.yes}</span>
                          </>
                        ) : value === false ? (
                          <>
                            <Minus
                              aria-hidden="true"
                              className="mx-auto size-4 text-white/25"
                            />
                            <span className="sr-only">{compare.no}</span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-white/85">
                            {value}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
