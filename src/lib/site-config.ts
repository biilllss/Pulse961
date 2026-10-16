/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PULSE 961 — Central site configuration
 *  Everything that could change per-deployment lives here.
 *  Change the WhatsApp number once and every CTA on the page updates.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SITE = {
  name: "Pulse 961",
  nameAr: "بلس ٩٦١",
  /**
   * Fictional WhatsApp business number in international format (no "+").
   * TODO: replace with the real number before going live.
   */
  whatsappPhone: "96176123456",
  email: "hello@pulse961.com",
  instagramUrl: "https://instagram.com/pulse961",
  facebookUrl: "https://facebook.com/pulse961",
  tiktokUrl: "https://tiktok.com/@pulse961",
  mapsUrl: "https://maps.google.com/?q=Armenia+Street+Mar+Mikhael+Beirut",
  url: "https://pulse961.example.com", // concept URL used for canonical/OG
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
  return `https://wa.me/${SITE.whatsappPhone}?text=${encoded}`;
}
