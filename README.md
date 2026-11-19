# The Georgia Variant

An independent, student-run daily newsletter on financial markets: a website plus a weekday morning email.

- **Market Pulse:** indices, top movers, sector heatmap, "why it moved"
- **Macro Desk:** Treasury yields and the curve, the Fed, CPI, jobs, GDP
- **Variant View:** a weekly contrarian stock pick, with a public scorecard against the S&P 500
- **Founders Center:** profiles of Emory alumni in finance and startups
- **Archive:** every past issue, searchable

Built with Next.js 16, TypeScript, Tailwind CSS, MDX, Recharts, React Email, and Resend. Hosted on Vercel.

> For educational purposes only. Not investment advice.
> An independent student publication. Not affiliated with or endorsed by Emory University.

---

## Contents

1. [Run it on your computer](#1-run-it-on-your-computer)
2. [Get the free API keys](#2-get-the-free-api-keys-optional-but-recommended)
3. [Publish the daily issue](#3-publish-the-daily-issue)
4. [Add a Variant View pick or an alumni profile](#4-add-a-variant-view-pick-or-an-alumni-profile)
5. [Send the email newsletter](#5-send-the-email-newsletter)
6. [Put it on the internet (Vercel)](#6-put-it-on-the-internet-vercel)
7. [Turn on the automatic 7 a.m. email](#7-turn-on-the-automatic-7-am-email)
8. [Customize: name, logo, colors, team](#8-customize-name-logo-colors-team)
9. [Where things live](#9-where-things-live)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Run it on your computer

**You need:** [Node.js](https://nodejs.org) version 20 or newer (the "LTS" download is fine).
Check it's installed by running `node -v` in Terminal.

```bash
cd emory-ledger          # go into the project folder
npm install              # download the code libraries (first time only, ~1 minute)
cp .env.example .env.local   # create your private settings file
npm run dev              # start the site
```

Open **http://localhost:3000**. Leave that terminal running while you work; edits show up instantly.
Press `Ctrl + C` in that terminal to stop it.

**Without any API keys the whole site still works.** Numbers come from realistic sample data, and a
small amber **"Sample data"** badge appears wherever that's the case.

### Commands you'll use

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site locally at http://localhost:3000 |
| `npm run new-issue` | Create today's issue file (as a draft) |
| `npm run send-issue` | Email checks and sending (see section 5) |
| `npm run build` | Build the production version (catches errors before you deploy) |
| `npm run lint` | Check code style |
| `npm run a11y` | Accessibility check of every page (run while `npm run dev` is running) |

---

## 2. Get the free API keys (optional, but recommended)

Open `.env.local` in your editor and paste each key after its `=` sign (no quotes, no spaces).
Restart `npm run dev` after changing this file.

| Setting | What it's for | Where to get it (all free) |
| --- | --- | --- |
| `FRED_API_KEY` | Yields, Fed funds, CPI, jobs, GDP | https://fred.stlouisfed.org/docs/api/api_key.html |
| `FMP_API_KEY` | Stock & index prices, movers, sectors | https://site.financialmodelingprep.com/developer/docs |

`.env.local` is never uploaded to GitHub (it's listed in `.gitignore`), so your keys stay private.
On Mac, `bash scripts/key-from-clipboard.sh FRED_API_KEY` saves a copied key into `.env.local` for you.

**Why Financial Modeling Prep?** Its free plan allows 250 requests/day versus Alpha Vantage's 25,
and it has ready-made gainers/losers lists. All provider code sits behind `lib/marketData.ts`, so
you can switch providers by editing that one file.

**Staying under free limits:** prices refresh about every 15 minutes while the market is open and every
few hours when it's closed. If you see rate-limit warnings in the terminal, raise `FMP_REFRESH_MINUTES`
(e.g. to `45`).

**Still seeing "Sample data"?** The terminal running `npm run dev` prints a `[marketData]` or
`[macroData]` line saying exactly why (missing key, symbol not on the free plan, etc.).

---

## 3. Publish the daily issue

Each weekday is one file: `content/issues/YYYY-MM-DD.mdx`. You write the words; the numbers fill in automatically.

1. Create today's file:
   ```bash
   npm run new-issue
   ```
   (For another date: `npm run new-issue -- 2026-11-20`.)
2. Open the new file in `content/issues/` and replace the placeholder text:
   `headline`, `dek` (one-sentence summary), `editorsTake`, `movers` (ticker + one line on why it moved),
   and `macroCommentary`. Anything below the second `---` appears as extra notes at the bottom.
3. Preview at http://localhost:3000. New files start with `draft: true`: visible locally, hidden on the live site.
4. When it's ready, **delete the `draft: true` line**, then deploy (section 6). The newest issue becomes the
   home page, Market Pulse, Macro Desk, and email.

If you mistype a field, the site shows an error naming the file and field. Fix it and save.

> Archived issues keep everything you wrote, but market numbers always show *today's* data
> (there's no database to store daily snapshots in this version).

---

## 4. Add a Variant View pick or an alumni profile

**Variant View pick:** copy a file in `content/variant-view/` and name it `YYYY-MM-DD-TICKER.mdx`.
Fill in `ticker`, `company`, `published`, `priceAtPublication` (that day's close), `stance` (Long/Short),
`consensus`, `variantView`, 3–5 `thesis` points, `catalysts`, and `risks`. Write the longer analysis below.
The scorecard calculates returns vs the S&P 500 automatically.

**Alumni profile:** copy `content/alumni/_template.mdx`, rename it `firstname-lastname.mdx`, and fill it in.
Full instructions: [`content/alumni/README.md`](content/alumni/README.md). Get each person's OK before publishing.

**Before launch:** the two sample picks have made-up entry prices, and the three alumni files are templates.
Delete or replace them, and remove `sample: true` / `placeholder: true` from real files.

---

## 5. Send the email newsletter

Email goes through **[Resend](https://resend.com)**. The free plan covers up to 1,000 subscribers for
newsletters plus 100 one-off emails a day (welcome emails).

### One-time setup

1. Create a free Resend account.
2. **Domains → Add Domain**, then add the DNS records it shows you at your domain registrar. You need a domain you
   control. (Until then, `onboarding@resend.dev` works as the sender, but only to your own Resend login email.)
3. **Audience → Segments:** create a segment (e.g. "Newsletter") and copy its ID.
4. **API Keys:** create a key.
5. Fill these in `.env.local`:
   ```
   RESEND_API_KEY=re_...
   RESEND_SEGMENT_ID=...
   EMAIL_FROM=The Georgia Variant <newsletter@yourdomain.com>
   CRON_SECRET=any-long-random-string
   ```
6. Add a mailing address (a P.O. box or your org's mailbox) to `email.postalAddress` in `lib/site.ts`.
   U.S. anti-spam law expects one in bulk email.

### Every day

| Step | Command |
| --- | --- |
| Look at the email | open http://localhost:3000/api/email-preview |
| Check everything, send nothing | `npm run send-issue` |
| Send one test copy to yourself | `npm run send-issue -- --test you@emory.edu` |
| Send to all subscribers | `npm run send-issue -- --send` (asks you to type "send") |

Add `--url https://your-site.vercel.app` to run these against the live site instead of your computer.

**Built-in safety checks:** it won't send a draft, an issue not dated today, or the same day's issue twice.
Add `--force` only if you're sure.

The signup forms (home page and About page) add people to your Resend segment and send a welcome email.
Without Resend set up, the form works in "dev mode" and saves nothing.

---

## 6. Put it on the internet (Vercel)

Vercel's free **Hobby** plan is enough to start. You'll also need a free **GitHub** account.

### a) Put the code on GitHub

1. Create a new **private** repository at https://github.com/new (don't add a README; this project has one).
2. In Terminal, in the project folder:
   ```bash
   git add -A
   git commit -m "Launch"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

### b) Import into Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. Pick your repository → **Import**. Vercel detects Next.js; leave the build settings as they are.
3. Open **Environment Variables** and add each line from your `.env.local`:
   `FRED_API_KEY`, `FMP_API_KEY`, `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `EMAIL_FROM`, `CRON_SECRET`,
   plus `CRON_ENABLED=false`. You can skip any you don't have yet.
4. Click **Deploy**. In about a minute you'll get a URL like `your-project.vercel.app`.
5. Add one more variable, `NEXT_PUBLIC_SITE_URL`, set to that URL (or your custom domain), then
   **Deployments → ⋯ → Redeploy**. This makes share previews, the sitemap, and email links point to the right place.

### c) Publishing from now on

Every `git push` to `main` redeploys the site automatically (about a minute). So the daily routine is:

```bash
npm run new-issue          # write the issue, delete draft: true
git add -A
git commit -m "Issue 2026-11-19"
git push
```

…then send the email (section 5), or let the automatic send do it (section 7).

**Custom domain (optional):** Vercel → Project → Settings → Domains. Update `NEXT_PUBLIC_SITE_URL` afterwards.

---

## 7. Turn on the automatic 7 a.m. email

It's already set up and **off**. `vercel.json` calls `/api/send-issue` on weekdays at 11:00 and 12:00 UTC
(7 a.m. New York in summer and in winter). The route only sends when it's 7 a.m. in New York **and**
`CRON_ENABLED` is `true`.

To turn it on: Vercel → Project → Settings → Environment Variables → set `CRON_ENABLED` to `true` (and make sure
`CRON_SECRET` is set) → Redeploy. To turn it off, set it back to `false`.

Things to know:
- On the free Hobby plan, Vercel may run a scheduled job any time within its hour, so expect 7:00–7:59 a.m.
- It sends whatever issue is published for that date. If you haven't published one yet, it safely skips.
- Check runs under Vercel → Project → **Logs** (or Settings → Cron Jobs).

---

## 8. Customize: name, logo, colors, team

- **Newsletter name:** change `name` in `lib/site.ts`. The masthead, logo monogram (its initials),
  page titles, share images, and emails all update.
- **Logo:** an original monogram (`components/Logo.tsx`), generated from the name. Favicon, phone icon,
  and share images use the same design (`lib/og.tsx`). No university marks are used. Keep it that way
  unless your group gets official approval.
- **Colors and fonts:** `app/globals.css` (brand colors are at the top, with notes on contrast).
- **Team, mission, disclaimer:** `lib/site.ts`.
- **FOMC dates:** `lib/fomc.ts`. **Add next year's dates each December** from the Fed's calendar.

---

## 9. Where things live

| Path | What it is |
| --- | --- |
| `lib/site.ts` | Name, tagline, nav, footer text, team, email address settings |
| `app/` | Pages. Each folder is a URL (`app/macro/page.tsx` → `/macro`) |
| `app/api/send-issue/` | Sends the newsletter (manual + scheduled) |
| `app/api/email-preview/` | Shows the email in your browser |
| `app/actions/subscribe.ts` | Newsletter signup (runs on the server) |
| `components/` | Reusable UI: header, footer, logo, ticker, cards, forms |
| `components/charts/` | Charts (Recharts), loaded lazily so pages appear faster |
| `content/issues/` | Daily issues, `YYYY-MM-DD.mdx` |
| `content/variant-view/` | Weekly picks, `YYYY-MM-DD-TICKER.mdx` |
| `content/alumni/` | Founders Center profiles (`_template.mdx` to copy) |
| `emails/` | Email templates (React Email) |
| `lib/marketData.ts` | **The only file pages get stock data from.** Swap providers here |
| `lib/providers/fmp.ts` | Financial Modeling Prep calls |
| `lib/macroData.ts`, `lib/fred.ts` | FRED data (yields, Fed, CPI, jobs, GDP) |
| `lib/mockData.ts` | Sample data used when an API key is missing or a call fails |
| `lib/content.ts` | Reads and validates the content files |
| `lib/performance.ts` | Variant View scorecard math |
| `lib/og.tsx` | Share-image and icon design |
| `scripts/` | `new-issue`, `send-issue`, `a11y-check`, `build-logos`, key helpers |
| `brand/` | Exported logo files (SVG) and backup logo concepts. Run `npm run logos` to regenerate |
| `vercel.json` | The scheduled email job |

### How the pieces fit

- **Pages are pre-built** (fast and cheap to host). Anything that changes, like prices and today's date, says how long
  it can be cached (`"use cache"` + `cacheLife(...)`), so Next.js refreshes it in the background.
- **Every data call returns `{ data, isSample }`.** If a key is missing or an API fails, you get realistic sample
  data and the page shows a badge instead of breaking.
- **Search engines and sharing:** `app/sitemap.ts`, `app/robots.ts`, page-level `metadata`, and generated
  `opengraph-image.tsx` files give every issue, pick, and profile its own preview card.

---

## 10. Troubleshooting

| Problem | Fix |
| --- | --- |
| `command not found: npm` | Install Node.js (section 1), then open a new Terminal window |
| `Could not read package.json` | You're not in the project folder. `cd` into `emory-ledger` first |
| Port 3000 already in use | Another `npm run dev` is running. Stop it with `Ctrl + C`, or use the URL it prints (e.g. :3001) |
| "Sample data" badge won't go away | Check the terminal for `[marketData]`/`[macroData]` warnings; restart `npm run dev` after editing `.env.local` |
| Error naming a content file and field | Fix that field (dates are `YYYY-MM-DD`; lists need `- ` in front of each item) |
| Signup says "Signups aren't open yet" (live site) | Add the Resend variables in Vercel and redeploy |
| `npm run send-issue` says Unauthorized | `CRON_SECRET` in `.env.local` must match the one in Vercel (for `--url`) or the running dev server |
| Change not showing on the live site | Did you `git push`? Check Vercel → Deployments for a failed build and its error |

---

_For educational purposes only. Not investment advice. An independent student publication, not affiliated with or endorsed by Emory University._
