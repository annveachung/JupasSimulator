# Data Model — JUPAS Results Simulator

## Technology
- **ORM**: Prisma
- **Database**: SQLite (file: `prisma/dev.db`)
- **ID strategy**: `cuid()` for all primary keys

---

## Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // "file:./dev.db"
}

model User {
  id                 String   @id @default(cuid())
  username           String   @unique
  passwordHash       String
  admittedChoiceRank Int
  resetCount         Int      @default(0)
  choices            Choice[]
  createdAt          DateTime @default(now())
}

model Choice {
  id         String @id @default(cuid())
  userId     String
  user       User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  rank       Int
  jupasCode  String  // e.g. "JS6200" — selected from autocomplete
  university String  // denormalised from programme data at save time
  program    String  // denormalised from programme data at save time

  @@unique([userId, rank])
}
```

---

## Model Descriptions

### User

Represents one simulated JUPAS applicant session.

| Field | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `username` | String | Auto-generated application number, e.g. `26-83741`. Unique across all users. |
| `passwordHash` | String | bcrypt hash (cost factor 12) of the auto-generated password |
| `admittedChoiceRank` | Int | The choice rank (1–20) the system assigned as the offer. Re-writable on re-roll. |
| `resetCount` | Int | How many times the user has re-rolled their result. Starts at 0. |
| `choices` | Choice[] | The 1–20 programme choices submitted at registration |
| `createdAt` | DateTime | Timestamp of registration |

### Choice

Represents a single programme choice submitted by a user.

| Field | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | Foreign key → User.id. Cascades on delete. |
| `rank` | Int | Position in the applicant's preference list (1 = most preferred, 20 = least preferred) |
| `jupasCode` | String | JUPAS programme code selected via autocomplete, e.g. `JS6200` |
| `university` | String | University name, denormalised from `data/programmes.ts` at registration time |
| `program` | String | Programme name, denormalised from `data/programmes.ts` at registration time |

**Unique constraint**: `(userId, rank)` — a user cannot have two choices at the same rank.

---

## Relationships

```
User (1) ──────< Choice (many)
```

One user has many choices. Deleting a user cascades to delete all their choices.

---

## Derived Data (not stored)

The following are computed at query time and never persisted:

| Value | Source |
|---|---|
| `band` | Derived from `rank`: 1–3→A, 4–6→B, 7–10→C, 11–15→D, 16–20→E |
| `admittedChoice` (full object) | Joined from `choices` where `rank = admittedChoiceRank` |
| Plain-text password | Only returned once at registration; never stored |
| Programme lookup | `data/programmes.ts` — 330+ programmes across 9 UGC-funded institutions, keyed by JUPAS code |

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Path to SQLite database file |
| `JWT_SECRET` | `<random 32-byte hex>` | Secret key for signing/verifying JWTs |

---

## Migrations

```bash
# Create and apply initial migration
npx prisma migrate dev --name init

# Regenerate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (DB browser)
npx prisma studio
```
