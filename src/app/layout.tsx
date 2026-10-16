import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/pulse/language-provider";
import { IMAGES } from "@/lib/images";
import { SITE } from "@/lib/site-config";

/**
 * Fonts:
 * - Bebas Neue  → oversized display headings (Latin only)
 * - Inter       → body copy (Latin)
 * - Cairo       → all Arabic text (body + display fallback)
 */
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse 961 — Boutique Gym in Beirut | بلس ٩٦١",
  description:
    "Pulse 961 is a boutique gym in Mar Mikhael, Beirut. Strength, cardio & HIIT, boxing and women-only classes — 40+ classes a week, 24/7 member access. Claim your free trial on WhatsApp.",
  keywords: [
    "gym Beirut",
    "Mar Mikhael gym",
    "boxing Beirut",
    "strength training Lebanon",
    "women only gym Beirut",
    "جيم بيروت",
    "بلس 961",
  ],
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: "Pulse 961 — Boutique Gym in Beirut | بلس ٩٦١",
    description:
      "Strength, boxing and classes that fill up fast — coached by people who know your name. Your first week is free.",
    url: SITE.url,
    siteName: "Pulse 961",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_LB",
    images: [{ url: IMAGES.og, width: 1200, height: 630, alt: "Training at Pulse 961, Beirut" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse 961 — Boutique Gym in Beirut",
    description:
      "Strength, boxing and classes that fill up fast. Mar Mikhael, Beirut. First week free.",
    images: [IMAGES.og],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

/**
 * Applied before hydration so an Arabic-returning visitor never sees a
 * flash of left-to-right layout. React's own sync in LanguageProvider
 * takes over right after mount (mismatch suppressed on <html>).
 *
 * First-visit auto-detect: if no stored preference exists and the
 * browser language starts with "ar" (Lebanese audience), Arabic is
 * stored and applied before first paint. An explicit toggle choice
 * always wins afterwards.
 */
const earlyLangScript = `(function(){try{var K="pulse961-lang";var l=localStorage.getItem(K);if(!l&&(navigator.language||"").toLowerCase().indexOf("ar")===0){l="ar";try{localStorage.setItem(K,"ar")}catch(e){}}if(l==="ar"){var d=document.documentElement;d.lang="ar";d.dir="rtl";d.classList.add("lang-ar");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyLangScript }} />
      </head>
      <body
        className={`${bebas.variable} ${inter.variable} ${cairo.variable} bg-ink font-sans text-white antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
