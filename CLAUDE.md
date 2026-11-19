# The Georgia Variant: notes for Claude

This is a student-run markets newsletter site (Next.js 16, TypeScript, Tailwind v4, MDX, Resend).
Two people work on it, often with Claude.

Before making changes, read and follow:

@CONTRIBUTING.md
@AGENTS.md

Quick reminders:
- Run `npm run build` and `npm run lint` before saying a change is done; check UI changes in the browser
  (light and dark mode, phone width).
- Data goes through `lib/marketData.ts` / `lib/macroData.ts`; the name and settings live in `lib/site.ts`.
- Never put API keys in code, commits, or chat. They live in `.env.local` and in Vercel.
- No university logos or endorsement wording. Keep the "not investment advice" disclaimer.
- Ask before adding paid services or new dependencies.
