# Deploying Pulse 961

The zip you downloaded is a complete, build-verified snapshot of the site
(extracted → installed → `next build` → production server → all pages verified).

## 1. Run it locally first (recommended sanity check)

```bash
unzip pulse961-project.zip -d pulse961
cd pulse961
cp .env.example .env        # portable DATABASE_URL, only needed for prisma
bun install                 # or: npm install
bun run dev                 # or: npm run dev  →  http://localhost:3000
```

If localhost:3000 shows the new dark design, the code is fine — any "no change"
on your live site is a deployment/caching issue, not a code issue.

## 2. Deploy to Vercel

**Option A — drag & drop (easiest):**
1. Go to vercel.com/new
2. Drag the **folder that directly contains `package.json`** into the page
3. Deploy — the default build command works as-is

**Option B — CLI:**
```bash
npm i -g vercel
cd <folder containing package.json>
vercel --prod
```

**Option C — GitHub:** push these files to a repo, then import it at
vercel.com/new. (Note: `.env` is intentionally not included; it is not needed.)

> ⚠️ **The #1 mistake:** the zip has NO top-level folder — the files unpack
> straight into the current directory. Make sure the folder you deploy is the
> one that *directly* contains `package.json`, `src/`, and `public/`. If Vercel
> shows "No framework detected" or the build output looks like the old site,
> you picked the wrong folder.

## 3. How to verify you are looking at the NEW version

Open your live URL and check any of these markers — if you **don't** see them,
the deployment did not actually update (wrong folder / failed build / old
deployment still active):

- Hero: **"Concept project by Mawqe3 Studio"** badge on the first line
- A **"Pick your goal"** selector (not a BMI calculator)
- Footer bottom bar: **"Download project (.zip)"** link

### The favicon ("logo next to the URL")

Browsers cache favicons extremely aggressively — they often survive a full
redeploy. After deploying:

1. Hard refresh: **Ctrl+Shift+R** (Mac: Cmd+Shift+R)
2. Or open the site in an **incognito window**
3. Sanity check: open `https://your-site.vercel.app/icon.svg` directly — you
   should see the black tile with the green heartbeat line

## 4. Build details (for troubleshooting)

- Build: `next build` (standalone output) — works on Vercel/Netlify/any Node host
- If the deploy "succeeds" but nothing changed, open your host's **build logs**
  and check which folder/commit it actually built
- Prisma is installed but **unused** by the site; no database setup is required

## 5. Before going live

Edit `src/lib/site-config.ts` (one file, two constants):

- `WHATSAPP_NUMBER` — currently the placeholder `"961XXXXXXXX"`
- `SITE_URL` — currently `"https://pulse-961.vercel.app"`; set your real URL so
  OG/Twitter cards and the sitemap resolve correctly
