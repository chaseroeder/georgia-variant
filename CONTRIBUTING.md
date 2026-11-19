# Contributing to The Georgia Variant

How we work on the site together, for both people and AI assistants (Claude, etc.).
Setup and deploy details live in the [README](README.md); this file covers the team routine and house rules.

---

## First-time setup (new collaborator)

1. **Accept the GitHub invite** from the repo owner (check your email).
2. **Clone the repo:** GitHub Desktop → **File → Clone repository** → `georgia-variant`.
3. **Install [Node.js](https://nodejs.org) 20+** (LTS), then in the project folder:
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```
   Open http://localhost:3000. It works right away with sample data.
4. **Get the API keys privately** from a teammate (password manager or in person, never in a group chat)
   and paste them into your `.env.local`. That file is ignored by git, so it never leaves your computer.
5. **Using Claude?** Open this folder in Claude Code (desktop app → Code tab). It reads `CLAUDE.md`,
   which points it here.

---

## Daily routine

Every work session, in GitHub Desktop:

1. **Fetch origin → Pull** *before* you start, to get your teammate's latest changes.
2. Make your changes. Preview them at http://localhost:3000.
3. Run the checks (see below).
4. **Commit** with a short, clear summary (e.g. `Issue 2026-11-19`, `Add DG pick`, `Fix macro chart labels`).
5. **Push origin.** The live site redeploys from `main` in about a minute.

### Avoiding conflicts

- **Split by file.** Content is one file per item, so divide work by issue, pick, or profile.
  Avoid editing the same file at the same time.
- **Say who's on what** in your group chat before touching shared files: `lib/site.ts`,
  `app/globals.css`, `components/`, `lib/`.
- **Pull often.** If GitHub Desktop reports a conflict, don't guess. Ask your teammate (or Claude) to help
  resolve it.

### This repository is public

Anyone on the internet can **read** this repo; only invited collaborators can **push**. Because it's public,
every push to `main` by either of us goes live automatically. That also means:

- **Never commit anything you wouldn't put on the website.** That includes unpublished Variant View picks: keep a
  pick on your computer (don't commit it) until the day it's published, or it can be read early on GitHub.
  Draft issues (`draft: true`) are hidden on the site but **visible on GitHub** once pushed.
- **Keep your email private.** Turn on GitHub → Settings → Emails → "Keep my email addresses private", and use
  the `…@users.noreply.github.com` address it shows as your git email
  (`git config user.email "ID+username@users.noreply.github.com"` in this folder).
- **Secrets stay out.** API keys live only in `.env.local` and in Vercel. If one is ever committed, regenerate it
  immediately: deleting the file isn't enough, because git history keeps it.
- **`main` is protected against force pushes and deletion.** History can't be rewritten or wiped by accident.

Strangers can suggest changes (pull requests), but nothing merges unless one of us approves it.

### Who can do what

| | Chase (owner) | Luke (collaborator) |
| --- | --- | --- |
| Push changes and publish to the live site | ✓ | ✓ |
| Review and merge pull requests | ✓ | ✓ |
| Vercel dashboard, environment variables, API keys | ✓ | Ask Chase |
| Repository settings, adding people | ✓ | Ask Chase |

---

## Before every push: checks

```bash
npm run build    # must succeed: catches broken pages and bad content files
npm run lint     # code style
```

For bigger design or layout changes, also run (with `npm run dev` running in another terminal):

```bash
npm run a11y     # accessibility check of every page
```

And look at your change on a phone-sized screen and in dark mode (moon icon in the header).

---

## Content rules

| What | Where | File name |
| --- | --- | --- |
| Daily issue | `content/issues/` | `YYYY-MM-DD.mdx` (create with `npm run new-issue`) |
| Variant View pick | `content/variant-view/` | `YYYY-MM-DD-TICKER.mdx` |
| Alumni profile | `content/alumni/` | `firstname-lastname.mdx` (copy `_template.mdx`) |

- **Drafts:** new issues start with `draft: true`. They show locally but stay off the live site.
  Delete that line to publish.
- **Samples and templates:** remove `sample: true` / `placeholder: true` when content is real.
- **Variant View entry price** = that day's closing price. Don't change it after publishing; the scorecard depends on it.
- **Alumni:** get the person's OK before publishing their profile, and let them review it.
- **Accuracy:** double-check numbers and names. If we get something wrong, fix it and note the correction.
- **Not investment advice.** Write as analysis and opinion, never "you should buy". Disclose if you own a stock you write about.
- **Independence:** we're an independent student publication. Don't use university logos, seals, or
  wording that suggests official endorsement. Keep the footer disclaimer.

---

## Code rules

The README's "Where things live" table maps every folder. The essentials:

- **Market data only comes through `lib/marketData.ts`** (and macro data through `lib/macroData.ts`).
  Pages never call an API directly. Every data function returns `{ data, isSample }` and falls back
  to mock data, so the site never breaks when an API fails.
- **Name, logo, nav, footer text, team:** `lib/site.ts`. Don't hard-code the newsletter name anywhere else.
- **Colors and fonts** are tokens in `app/globals.css`. Use the theme classes (`bg-surface`, `text-ink`,
  `text-ink-muted`, `border-rule`, `text-gain`, `text-loss`…) rather than raw hex values, so dark mode keeps working.
  Green and red are only for gains and losses.
- **Numbers:** put the `num` class on every price and percentage (tabular numerals), and use the helpers in
  `lib/format.ts`.
- **Accessibility:** every input has a label, color is never the only signal (we pair it with arrows or text),
  charts have a text description, and contrast stays at WCAG AA.
- **Next.js 16 is newer than most tutorials** (and newer than many AI models' training). Check the docs bundled
  at `node_modules/next/dist/docs/` before using an API you haven't seen in this codebase.
- **Secrets never go in code or git.** Keys live in `.env.local` locally and in Vercel → Settings → Environment
  Variables for the live site. If a key is ever committed by accident, tell the team and regenerate it right away.
- **New libraries or paid services:** agree as a team first. Don't add a paid service without both of us saying yes.

---

## Working with Claude (or another AI assistant)

- Start by asking it to read `CONTRIBUTING.md` and the README if it hasn't already.
- Ask it to run `npm run build` and `npm run lint` before you commit, and to check the change in the browser.
- Keep changes small and focused, one feature or fix per commit, so they're easy to review and undo.
- Review what it changed before you push (GitHub Desktop shows every changed line).
- Don't paste API keys into the chat. Put them in `.env.local` yourself.
