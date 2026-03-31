# Product Requirements Document — JUPAS Results Simulator

## 1. Overview

### 1.1 Purpose
A web application that simulates the JUPAS (Joint University Programmes Admissions System) results release experience for Hong Kong secondary school students. Users enter their programme choices, receive auto-generated login credentials, and re-live the tension of results day through a dramatic animated reveal.

### 1.2 Background
Every year, HKDSE students submit up to 20 programme choices through the JUPAS portal. On results day, they log in to see which programme they have been offered. The emotional experience of that reveal — the loading screen, the wait, the final result — is iconic. This simulator recreates that experience for entertainment and nostalgia.

### 1.3 Goals
- Faithfully recreate the JUPAS portal aesthetic and login flow
- Provide a suspenseful, animated result reveal
- Assign results randomly via a weighted distribution that mirrors realistic admission rates across bands
- Persist results per user so the experience can be revisited

---

## 2. User Flow

```
[Landing Page]
      |
      v
[Fill in 20 choices across 5 bands]
      |
      v
[Submit → System assigns result, generates credentials]
      |
      v
[Credentials Page — shown username + password]
      |
      v
[Login Page — enter credentials]
      |
      v
[Results Page — loading animation → result reveal]
      |
      v
[Optional: Re-roll Result → loading animation → new reveal]
```

---

## 3. Features

### 3.1 Choice Input Form (/)
- 20 programme choices, grouped into 5 bands:
  - Band A: Choices 1–3
  - Band B: Choices 4–6
  - Band C: Choices 7–10
  - Band D: Choices 11–15
  - Band E: Choices 16–20
- Each choice requires: University name (free text) + Programme name (free text)
- Choice #1 is mandatory; all others are optional
- Validation: Choice #1 must be filled before submission
- Submission triggers result assignment and credential generation

### 3.2 Credential Generation
- System auto-generates:
  - **Application Number**: `26-XXXXX` (year prefix + 5 random digits)
  - **Password**: 8-character random alphanumeric string
- Credentials are displayed once on the `/credentials` page
- User must save them manually (no recovery flow)

### 3.3 Login (/login)
- Fields: Application Number, Password
- On success: redirect to `/results`
- On failure: display inline error message
- No "forgot password" flow

### 3.4 Result Reveal (/results)
- **Phase 1 — Loading** (~4 seconds):
  - Progress bar animating 0% → 100%
  - Status messages cycling: "Connecting to JUPAS server...", "Authenticating...", "Retrieving offer data...", "Finalising..."
- **Phase 2 — Reveal**:
  - Animated card transition
  - Displays: Choice rank, Band, University, Programme
  - Visual tone by band:
    - Band A / B: Green accent, celebratory
    - Band C: Neutral blue
    - Band D / E: Amber/muted tone
- **Choices summary**: Collapsible table below the result showing all submitted choices grouped by band

### 3.5 Re-roll
- "Re-roll Result" button on the results page
- Re-runs the weighted random algorithm against the same saved choices
- Updates the stored result in the database
- Re-triggers the full loading + reveal animation sequence
- No limit on number of re-rolls

---

## 4. Result Assignment Logic

Results are assigned at registration time using a weighted random band selection:

| Band | Choices | Probability |
|------|---------|-------------|
| A    | 1–3     | 25%         |
| B    | 4–6     | 25%         |
| C    | 7–10    | 20%         |
| D    | 11–15   | 18%         |
| E    | 16–20   | 12%         |

1. Randomly select a band using the probabilities above
2. From the selected band, randomly pick one filled choice
3. If the selected band has no filled choices, redistribute its weight proportionally to bands that do have filled choices, then re-select
4. The same algorithm is used for re-rolls

---

## 5. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Platform | Web (desktop-first, responsive) |
| Authentication | JWT in HTTP-only cookie; session expires after 7 days |
| Data persistence | SQLite database via Prisma ORM |
| Performance | Result reveal animation must complete in under 5 seconds |
| Security | Passwords stored as bcrypt hashes (cost factor 12) |

---

## 6. Out of Scope

- Real JUPAS programme data / autocomplete (free-text input only)
- Email or SMS notifications
- Account recovery / password reset
- Multiple result profiles per user
- Admin dashboard
- Mobile app
- Internationalisation (English-only interface for now)
