# JUPAS Results Simulator

A web app that recreates the JUPAS (Joint University Programmes Admissions System) results release experience for Hong Kong secondary school students.

Users submit up to 20 programme choices, receive auto-generated login credentials, then relive the tension of results day through a dramatic animated reveal.

## Features

- **Programme choice submission** — 20 choices across 5 bands (A–E), with autocomplete search across 330+ real 2026 JUPAS programmes from all 9 UGC-funded institutions
- **Auto-generated credentials** — application number and password generated on submission
- **Login-gated results** — credentials required to view your result, just like the real portal
- **Weighted random result assignment** — outcome determined by the system using realistic band probabilities
- **Dramatic reveal** — 4-second loading animation with status messages, followed by an animated result card
- **Re-roll** — re-run the random draw on your existing choices as many times as you like
- **JUPAS portal aesthetic** — institutional navy/white design mimicking the real site

## Result Distribution

| Band | Choices | Probability |
|------|---------|-------------|
| A    | 1–3     | 25%         |
| B    | 4–6     | 25%         |
| C    | 7–10    | 20%         |
| D    | 11–15   | 18%         |
| E    | 16–20   | 12%         |

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Database** — SQLite via Prisma 5
- **Auth** — JWT in HTTP-only cookie (`jose`)
- **Styling** — Tailwind CSS v4
- **Animations** — Framer Motion + canvas-confetti

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

The `.env` file is created automatically. Ensure it contains:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=<random 32-byte hex string>
```

To generate a JWT secret:

```bash
openssl rand -hex 32
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── login/          # POST — authenticate and set session cookie
│   │   ├── logout/         # POST — clear session cookie
│   │   ├── programmes/
│   │   │   └── search/     # GET  — autocomplete search
│   │   ├── register/       # POST — submit choices, get credentials
│   │   └── results/
│   │       ├── route.ts    # GET  — fetch result (auth-protected)
│   │       └── reset/      # POST — re-roll result (auth-protected)
│   ├── credentials/        # Show generated credentials
│   ├── login/              # Login page
│   ├── results/            # Result reveal page
│   └── page.tsx            # Choice input form (/)
├── components/
│   ├── ChoiceForm.tsx             # 20-row form with band grouping
│   ├── ChoiceTable.tsx            # Collapsible choices summary
│   ├── JupasHeader.tsx            # Institutional nav bar
│   ├── ProgrammeAutocomplete.tsx  # Search input with dropdown
│   └── ResultReveal.tsx           # Loading animation + result card
├── data/
│   └── programmes.ts       # 330+ JUPAS 2026 programmes
├── lib/
│   ├── auth.ts             # JWT helpers
│   ├── bands.ts            # Band derivation + weighted random roll
│   ├── db.ts               # Prisma client singleton
│   └── generate.ts         # Username/password generation
├── docs/                   # Spec documents
│   ├── PRD.md
│   ├── api-spec.md
│   ├── data-model.md
│   └── ui-spec.md
└── prisma/
    └── schema.prisma
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database browser |
| `npx prisma migrate dev` | Apply schema changes |

## Disclaimer

For simulation and entertainment purposes only. Not affiliated with or endorsed by JUPAS or any Hong Kong university.
