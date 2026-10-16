/**
 * All Unsplash photography in one place.
 * Replace any URL here (e.g. with your own CDN links) — components never
 * hardcode image paths. Alt text lives in the translations file.
 */

const unsplash = (id: string, w: number, extra = "") =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop${extra}`;

export const IMAGES = {
  hero: unsplash("photo-1517836357463-d25dfeac3438", 2000),
  /** Branded OG card (1200×630) — generated, lives in /public/og.jpg */
  og: "/og.jpg",
  programs: {
    strength: unsplash("photo-1526506118085-60ce8714f8c5", 900),
    cardio: unsplash("photo-1552674605-db6ffd4facb5", 900),
    boxing: unsplash("photo-1549719386-74dfcbf7dbed", 900),
    womens: unsplash("photo-1571019613454-1cb2f99b2d8b", 900),
  },
  trainers: {
    karim: unsplash("photo-1567013127542-490d757e51fc", 800),
    rania: unsplash("photo-1548690312-e3b507d8c110", 800),
    jad: unsplash("photo-1517438322307-e67111335449", 800),
  },
  /** "Inside Pulse" gallery strip (verified visually before adding). */
  gallery: [
    { src: unsplash("photo-1534438327276-14e5300c3a48", 1200), altKey: "dumbbells" },
    { src: unsplash("photo-1540497077202-7c8a3999166f", 1200), altKey: "floor" },
    { src: unsplash("photo-1571902943202-507ec2618e8f", 1200), altKey: "cardio" },
    { src: unsplash("photo-1517838277536-f5f99be501cd", 1200), altKey: "lift" },
    { src: unsplash("photo-1549060279-7e168fcee0c2", 1200), altKey: "plates" },
    { src: unsplash("photo-1593079831268-3381b0db4a77", 1200), altKey: "treadmills" },
  ],
} as const;
