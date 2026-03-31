# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

npx prisma migrate dev --name <name>   # Apply schema changes and regenerate client
npx prisma studio                      # Open database browser (SQLite)
npx prisma generate                    # Regenerate client without migrating
```

There are no tests.

## Architecture

### Overview
Next.js 16 App Router app. All backend logic lives in API route handlers (`app/api/`). The database is SQLite via **Prisma 5** (pinned — do not upgrade to Prisma 6/7, they have breaking changes with the datasource URL config that conflict with Node.js v25).

### Data flow
1. User submits choices on `/` → `POST /api/register` → credentials returned → shown on `/credentials`
2. User logs in on `/login` → `POST /api/login` → JWT set in `jupas_token` HTTP-only cookie
3. `/results` fetches `GET /api/results` (auth-protected) → renders reveal animation
4. Re-roll calls `POST /api/results/reset` → re-runs band selection algorithm → updates DB

### Key files

**`lib/bands.ts`** — Core result logic. `rollResult(choices)` picks a band using weighted random selection (A=25%, B=25%, C=20%, D=18%, E=12%), then picks a random filled choice from that band. If the selected band has no filled choices, weight is redistributed to eligible bands.

**`lib/auth.ts`** — JWT sign/verify via `jose`. `getSession()` reads the `jupas_token` cookie and returns `{ userId, username }` or null. All protected API routes call this.

**`lib/db.ts`** — Prisma client singleton (standard Next.js global pattern to avoid hot-reload connection exhaustion).

**`data/programmes.ts`** — Static array of 330+ real 2026 JUPAS programmes (`{ code, university, name }`). Also exports `searchProgrammes(query, limit)` for the autocomplete and `PROGRAMMES_BY_CODE` Map for O(1) lookup during registration. No database involvement — all in-memory.

**`components/ResultReveal.tsx`** — Two-phase component: `loading` (4s progress bar + cycling status messages) then `reveal` (Framer Motion fade-in card). Band A/B triggers `canvas-confetti`. Re-rolling resets phase back to `loading`.

### Auth pattern
Protected API routes call `getSession()` at the top and return 401 if null. There is no middleware — auth is checked per-route. The `/results` page redirects to `/login` client-side if it gets a 401.

### Prisma schema
`User` has `admittedChoiceRank` (Int, the result) and `resetCount`. `Choice` stores the denormalised `university` and `program` strings (resolved from `data/programmes.ts` at registration time) alongside `jupasCode`. The `(userId, rank)` pair has a unique constraint.

### Credentials page
Credentials are passed via URL query params (`?u=...&p=...`) from the register API response. They are never stored in plain text — only the bcrypt hash lives in the DB. The page warns users to save them as they won't be shown again.
