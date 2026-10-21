/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PULSE 961 — Central site configuration
 *  Everything that could change per-deployment lives here.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * The ONE WhatsApp number every CTA on the site deep-links to — header,
 * hero, memberships, trainers, goal picker, schedule, final CTA, footer,
 * floating button and the QR code all go through waLink() below.
 * International format, no "+". Concept placeholder: replace with the
 * real number before going live.
 */
export const WHATSAPP_NUMBER = "961XXXXXXXX";

/**
 * Canonical site URL — used for metadataBase, Open Graph, Twitter cards,
 * sitemap and JSON-LD. Point this at your Vercel deployment URL.
 */
export const SITE_URL = "https://pulse-961.vercel.app";

export const SITE = {
  name: "Pulse 961",
  nameAr: "بلس ٩٦١",
  mapsUrl: "https://maps.google.com/?q=Armenia+Street+Mar+Mikhael+Beirut",
  url: SITE_URL,
  /**
   * Indicative LBP rate used by the optional "show prices in LBP" toggle.
   * The gym still charges in USD — this is a convenience estimate only.
   */
  lbpRate: 89_500,
} as const;

/**
 * Build a wa.me deep link with a URL-encoded, pre-filled message.
 * Apostrophes are encoded as %27 to match the WhatsApp deep-link spec exactly.
 */
export function waLink(message: string): string {
  const encoded = encodeURIComponent(message).replace(/'/g, "%27");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
