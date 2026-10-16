import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE.name} — Boutique Gym in Beirut`,
    short_name: SITE.name,
    description:
      "Pulse 961 is Mar Mikhael's boutique gym — strength, boxing and classes that fill up fast. بلس ٩٦١، جيم بوتيك بمرعبا، بيروت.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    lang: "en",
    dir: "ltr",
    categories: ["fitness", "sports", "health"],
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
