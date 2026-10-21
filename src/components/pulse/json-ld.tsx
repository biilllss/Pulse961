/**
 * JSON-LD structured data (SEO) — a server component rendered once in
 * page.tsx. Two schema.org entries:
 *  - ExerciseGym (a LocalBusiness subtype): name, address, geo, staffed
 *    opening hours, price range.
 *  - FAQPage: the five questions from the FAQ accordion.
 *
 * Copy for the gym description is bilingual-safe: schema favors a single
 * primary language, so English (the site's default) is used here.
 */

import { SITE, WHATSAPP_NUMBER } from "@/lib/site-config";
import { IMAGES } from "@/lib/images";
import { translations } from "@/lib/i18n";

export function JsonLd() {
  const gym = {
    "@type": "ExerciseGym",
    "@id": `${SITE.url}/#gym`,
    name: SITE.name,
    alternateName: SITE.nameAr,
    description:
      "Boutique gym in Mar Mikhael, Beirut. Strength, cardio & HIIT, boxing and women-only classes — 40+ classes a week, 24/7 member access.",
    url: SITE.url,
    image: `${SITE.url}${IMAGES.og}`,
    telephone: `+${WHATSAPP_NUMBER}`,
    priceRange: "$25 - $300",
    currenciesAccepted: "USD",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Armenia Street, Mar Mikhael",
      addressLocality: "Beirut",
      addressCountry: "LB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.8816,
      longitude: 35.5183,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "06:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };

  const faqSchema = {
    "@type": "FAQPage",
    "@id": `${SITE.url}/#faq`,
    mainEntity: translations.en.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [gym, faqSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
