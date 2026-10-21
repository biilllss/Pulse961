# Pulse 961 — Boutique Gym in Beirut (Concept)

A one-page marketing site for a fictional Beirut gym. English + Arabic (full RTL), dark
`#0A0A0A` theme with a single electric-lime `#C6FF3D` accent. Concept design by Mawqe3 Studio.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- next/font: Bebas Neue (display) · Inter (body) · Cairo (Arabic)

## Structure

```
src/
├── app/
│   ├── layout.tsx            # fonts, SEO/OG metadata, LanguageProvider
│   ├── page.tsx              # section order for the one-pager
│   └── globals.css           # brand tokens, reveal/marquee CSS, RTL fixes
├── components/pulse/         # one file per section + shared utilities
└── lib/
    ├── site-config.ts        # WHATSAPP_NUMBER, SITE_URL, waLink() builder
    ├── i18n.ts               # ALL EN/AR copy in one typed object
    └── images.ts             # Unsplash photo URLs (swap freely)
```

## Customize

- **WhatsApp number / site URL** → `src/lib/site-config.ts` (`WHATSAPP_NUMBER`, `SITE_URL`), one place each, every CTA/metadata updates.
- **Copy (EN/AR)** → `src/lib/i18n.ts`. Arabic is typed against the English object, so keys can't drift.
- **Photos** → `src/lib/images.ts`. Unsplash is allowed in `next.config.ts`.
- **Map** → `src/components/pulse/location.tsx` — lazy Google Maps embed for Armenia Street, Mar Mikhael.

## Beyond the base design

- **Plan Finder** — "Pick your goal" selector (build strength / lose fat / learn boxing /
  women's classes) under the pricing grid (`plan-finder.tsx`), with a WhatsApp CTA that
  pre-fills the chosen goal. EN + AR.
- **Live status chip** — hero shows what's happening now / next in Beirut time (`live-now.tsx`).
- **Personalized trial form** — final CTA builds a name + program WhatsApp message.
- **Click-to-book timetable** — every class cell in the schedule opens WhatsApp with a
  pre-filled booking message (open-gym slots get their own wording). EN + AR.
- **"Inside Pulse" gallery** — snap-scrolling photo strip (`gallery.tsx`) with desktop
  chevrons, caption chips, ghost numbers and direction-aware edge fades.
- **Coach cards with booking** — specialty chips and a "Train with {name}"
  WhatsApp CTA pre-filled per coach (Karim Mansour, Rania, Jad).
- **Program detail dialogs** — every program card opens a modal (`programs.tsx`) with
  what-to-expect list, intensity meter (1–5 bars, labelled), duration/coach meta and a
  program-specific WhatsApp CTA. Full-card accessible trigger; localized close button.
- **Program ↔ schedule linkage** — each program dialog computes its own sessions from
  the weekly grid (`programSessions()` in `schedule-utils.ts`): a "sessions a week"
  count, day·time chips, and a "See it on the schedule" link that closes the dialog,
  travels to the timetable (reduced-motion aware) **and flash-highlights the exact
  cells while pre-setting the class filter**.
- **Class-type filter** — segmented filter chips above the timetable (All / Strength /
  Cardio & HIIT / Boxing / Women's only / Open gym) with live counts, a "Showing N of
  M classes" line (`aria-live`) and a dim-out treatment (opacity + grayscale) for
  non-matching cells. Fully localized EN + AR, deep-linkable via the flash event.
- **Deep-link flash channel** — programs and coach chips dispatch a
  `pulse961:flash-schedule` custom event; the timetable pulses the matching cells
  twice (volt ring + tint, `.flash-cell` in `globals.css`), never dims them, and
  announces the highlight to screen readers.
- **Add-to-calendar (.ics)** — every program dialog has an "Add all sessions to
  calendar" button (`buildProgramIcs()` in `schedule-utils.ts`) that generates an
  RFC 5545 file on the fly: one weekly-recurring event (8 weeks) per session,
  localized summaries/description, with a brief "Saved ✓" feedback state.
- **Coach "next class" chips** — every coach card shows their actual next upcoming
  class, computed live in Beirut time from the timetable (`nextClassForTypes()`),
  refreshed every 60s. Clicking a chip deep-links to the timetable (filter resets to
  All) and pulses that coach's classes on arrival. No duplicated data: coach →
  class-type mapping only.
- **Compare-all-plans matrix** — a collapsible feature table under the pricing grid
  (`plan-compare.tsx`): 6 features × 4 plans, popular column tinted volt, sr-only
  check/dash labels, horizontal scroll on mobile.
- **Stories upgrade** — initials avatars (first grapheme, works in Arabic), giant
  ghost quote glyphs, hover lift with volt top hairline; localized goals label.
- **"How it works" strip** — 3-step (message → free week → pick plan) editorial list
  above the final-CTA form, direction-aware dividers.
- **"Best time to train" busyness chart** — 18 hourly bars (06:00–23:00) in the
  schedule section (`busy-hours.tsx`): auto weekday/weekend curve picked from the
  Beirut clock, PEAK label over the busiest hour, a volt NOW marker on the current
  Beirut hour and a live quiet/steady/packed status line (`aria-live`). Bars are
  mono→lime by crowding level; the whole chart mirrors to right-to-left in Arabic
  automatically (hours read RTL). Editorially fictional data, live clock logic.
- **Full-week .ics export** — "Whole week to calendar" button under the timetable:
  all 28 weekly sessions as weekly-recurring events in one RFC 5545 file.
- **Shareable filter state** — clicking a class-type filter writes
  `#schedule-boxing`-style hashes (`history.replaceState`), and loading the page
  with such a hash restores the filter. "All" resets to `#schedule`.
- **Gift a membership** — dashed volt strip under the plan finder: pick any plan
  from a native select, WhatsApp opens with a localized "I'd like to gift the
  {plan} membership" message.
- **LBP price hints** — optional "Show prices in LBP" switch (`role="switch"`)
  above the pricing grid: adds the Lebanese "millions" figure under every plan
  ("≈ 3.13M LBP" / "≈ 3.13 مليون ل.ل", computed from `SITE.lbpRate` in
  `site-config.ts` via `lbpMillions()` in `hours-utils.ts`), plus an indicative-rate
  footnote. Persisted in `localStorage` (`pulse961-lbp`), off by default — the gym
  still charges in USD.
- **Cost-per-day lines** — every plan card shows "≈ $1.17 a day" computed from a
  positional `PLAN_PRICES` table (usd + days) in `memberships.tsx`.
- **Live staffed-hours status** — an "Open now · closes 23:00" / "Closed now ·
  opens Friday 06:00" chip (`staffedStatus()` + `hoursRowFor()` in the new
  `hours-utils.ts`) computed from the Beirut clock, refreshed every 60s, rendered
  above the hours list **and** as a corner badge on the map block. `aria-live`,
  pulsing volt dot when open, hollow dot when closed.
- **Today highlight** — the current day's row in the staffed-hours list gets a
  volt edge marker, a localized "Today / اليوم" chip and full-opacity times.
- **Gallery lightbox** — every "Inside Pulse" card opens a fullscreen lightbox
  (`gallery.tsx`, controlled Radix Dialog): photo counter chip ("03 / 06"), localized
  caption bar (volt chip + alt text), direction-aware prev/next controls and
  ArrowLeft/ArrowRight navigation that MIRRORS in Arabic (visual right = strip start
  in RTL). Custom dark backdrop (`overlayClassName` on the shared Dialog), focus
  returns to the card that opened it (explicit restore — Radix can't disambiguate
  6 triggers on one root), Escape closes.
- **Scan-to-chat QR poster** — the final CTA renders the free-week WhatsApp deep
  link as a real QR code (`uqr`, zero deps): ink modules on the volt card with
  viewfinder corner brackets and a hard offset shadow, poster-style. Regenerates
  per language (Arabic encodes the Arabic message). Screen- and print-scannable.
- **LBP hints everywhere** — the "Show prices in LBP" preference moved into a
  shared external store (`use-lbp.ts`, same pattern as the language provider), so
  the toggle, the plan cards, the compare-matrix headers ("≈ 8.05M LBP" under each
  price) and the gift-select options ("3 Months — $90 (≈ 8.05M LBP)") all react
  to one switch and stay in sync across tabs.
- **Compare matrix: pinned feature rail** — the label column of the
  compare table is `sticky start-0` (inset-inline-start, so it pins RIGHT
  in Arabic automatically): on narrow screens the plan columns scroll
  under an opaque ink rail with a hairline edge, and row labels never
  scroll away. Includes the header corner cell (z-20).
- **Lightbox neighbor preload** — while the lightbox is open, both adjacent
  photos load eagerly through the *same* `fill` + `sizes` props as the
  visible image, so the optimizer URL and srcset candidate match exactly
  and arrow taps render instantly. Wraps around the strip ends.
- **Share the gym** — footer "Share Pulse 961" button: native share sheet
  (`navigator.share`) where supported, one-tap clipboard copy fallback
  with a localized "Link copied / تم نسخ الرابط" feedback. Cancellations
  are silent by design.
- **Back-to-top progress ring** — the desktop back-to-top button's ring is
  a live `conic-gradient` driven by scroll depth (volt fills as you
  descend — a glanceable depth cue, no keyframes so reduced-motion is
  unaffected).
- **Copy address** — one-tap "Copy address" under the location info
  (`navigator.clipboard`, silent catch in restricted contexts) with a
  localized "Copied ✓" feedback state.
- **First-visit language auto-detect** — the pre-hydration script in `layout.tsx`
  stores Arabic when the browser language starts with "ar" and no preference is
  stored yet (an explicit toggle always wins afterwards).
- **Header scrollspy** — the desktop nav highlights + underlines the section you're in
  (`aria-current`), driven by a rAF-throttled scroll probe.
- **SEO & PWA plumbing** — `ExerciseGym` + `FAQPage` JSON-LD (`json-ld.tsx`),
  `sitemap.ts`, `manifest.ts` (installable web app, brand colors/icons), branded
  bilingual 404 (`not-found.tsx`), branded OG card `public/og.jpg` (1200×630).
- **Texture & motion details** — fixed film-grain overlay, giant outlined footer
  wordmark, slow Ken Burns drift on the hero photo, mouse-spotlight glow on program &
  plan cards (fine pointers only), stats hover micro-interactions, tabular numerals
  for prices/stats, plan-card volt glow, direction-aware CTA arrows, trainer underline
  sweep, marquee pause-on-hover, volt focus rings, uniform button
  press-in on `:active`, `text-balance` headings, ruled hairline ticks after section
  eyebrows, and a stylized street map (SVG roads, localized street labels, dashed
  lime walking route to the pin).
  All motion respects `prefers-reduced-motion`.

## Scripts

```bash
bun run dev    # develop
bun run lint   # eslint
bun run build  # production build
```

Deploy-ready for Vercel as-is.
