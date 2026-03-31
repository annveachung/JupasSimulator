# UI Specification — JUPAS Results Simulator

## Design Language

### Colour Palette
| Token | Hex | Usage |
|---|---|---|
| `navy` | `#1a2f5e` | Header, footer, primary buttons |
| `navy-light` | `#243b73` | Header hover states |
| `red` | `#c0392b` | Alert banners, mandatory field indicators, deadline notices |
| `white` | `#ffffff` | Page backgrounds, card backgrounds |
| `gray-100` | `#f5f5f5` | Alternate table row, input backgrounds |
| `gray-300` | `#d1d5db` | Borders, dividers |
| `gray-600` | `#4b5563` | Secondary text, labels |
| `gray-900` | `#111827` | Body text |
| `green-600` | `#16a34a` | Band A/B result — success state |
| `amber-600` | `#d97706` | Band D/E result — muted state |

### Typography
- **Font**: Inter (Google Fonts) — system fallback: `ui-sans-serif, system-ui, sans-serif`
- **Body**: 14px / 1.5 line-height
- **Headings**: Bold, 18–24px
- **Labels**: 12px uppercase letter-spacing for section headers

### Layout
- Max content width: `960px`, horizontally centered
- Page background: `white`
- All pages share the `JupasHeader` and a minimal footer

---

## Component: JupasHeader

Appears on every page.

```
┌─────────────────────────────────────────────────────────────┐
│  [JUPAS logo / wordmark]          [Year: 2026]   [Logout*] │
│  Joint University Programmes Admissions System              │
└─────────────────────────────────────────────────────────────┘
```

- Background: `navy`
- Text: white
- Logo: text-based wordmark "JUPAS" in bold, with subtitle in smaller weight
- Year badge: small pill showing current academic year
- Logout link: only shown when a session cookie is present; calls `DELETE /api/login` (or clears cookie) and redirects to `/login`

---

## Page: / (Choice Input Form)

### Layout

```
[JupasHeader]

┌─────────────────────────────────────────────────────────────┐
│  JUPAS 2026 — Programme Choice Submission                   │
│  ─────────────────────────────────────────────────────────  │
│  Please enter your programme choices in order of            │
│  preference. Choice 1 is your most preferred programme.     │
│  All choices must be entered in English.                    │
└─────────────────────────────────────────────────────────────┘

[Band A — First Priority Choices]
┌──────┬─────────────────────────────────────────────────────────────────┐
│ No.  │ Search by programme name, JUPAS code, or university             │
├──────┼─────────────────────────────────────────────────────────────────┤
│  1 * │ [search input                                               ]   │
│      │ ┌──────────────────────────────────────────────────────────┐   │
│      │ │ JS6999  The University of Hong Kong                      │   │
│      │ │         Computing and Data Science                       │   │
│      │ ├──────────────────────────────────────────────────────────┤   │
│      │ │ JS5240  HKUST                                            │   │
│      │ │         Dept of Computer Science and Engineering         │   │
│      │ └──────────────────────────────────────────────────────────┘   │
│      │ (dropdown disappears on selection)                              │
├──────┼─────────────────────────────────────────────────────────────────┤
│      │ After selection — row displays resolved data:                   │
├──────┼──────────┬──────────────────────────┬──────────────────────────┤
│  1 * │ JS6999   │ The University of HK     │ Computing and Data Sci.  │
│  2   │ [empty search input]                                            │
│  3   │ [empty search input]                                            │
└──────┴─────────────────────────────────────────────────────────────────┘

[Band B — Second Priority Choices]
... (rows 4–6, same autocomplete pattern)

[Band C — Third Priority Choices]
... (rows 7–10)

[Band D — Fourth Priority Choices]
... (rows 11–15)

[Band E — Fifth Priority Choices]
... (rows 16–20)

[Submit Choices]   ← primary button, navy background
```

### Autocomplete Behaviour
- The search input queries `GET /api/programmes/search?q=<value>` after each keystroke (debounced 200ms)
- Dropdown shows up to 10 results; each result displays:
  - Line 1: `[JUPAS code]  [University name]` — in `gray-600`, smaller font
  - Line 2: `[Programme name]` — in `gray-900`, normal weight
- Keyboard navigation: arrow keys to move, Enter to select, Escape to close
- After selection: the input is replaced by a read-only row showing `code | university | programme name`, with an `✕` button to clear and re-search
- If the user clears a selected item, the search input reappears for that row

### States
- **Default**: All rows show empty search inputs, submit button enabled
- **Typing**: Dropdown appears below the active row's input
- **Selected**: Row shows resolved `code | university | programme` in a compact display
- **Validation error**: Red border on Choice #1 row if it has no selection; inline error message
- **Submitting**: Button shows spinner + "Submitting..." text, all inputs disabled
- **Success**: Redirect to `/credentials`

### Notes
- `*` asterisk marks Choice #1 as required
- Band section headers use `12px uppercase` label styling with a left border in `navy`
- Row numbers are non-editable, displayed in `gray-600`
- The autocomplete data comes from `data/programmes.ts` (330+ programmes across 9 UGC institutions)

---

## Page: /credentials

### Layout

```
[JupasHeader]

┌─────────────────────────────────────────────────────────────┐
│  ✓  Choices Submitted Successfully                          │
│  ─────────────────────────────────────────────────────────  │
│  Your programme choices have been received. Please save     │
│  your login credentials below. You will need them to        │
│  access your results.                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Application Number    26-83741                     │   │
│  │  Password              Kx4mR9pL                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠  These credentials will not be shown again.             │
│     Please record them before proceeding.                  │
│                                                             │
│  [Proceed to Login]                                        │
└─────────────────────────────────────────────────────────────┘
```

### Notes
- Credentials box: light gray background (`gray-100`), monospace font, `border-l-4 border-navy`
- Warning banner: `red` left border, `red` text
- "Proceed to Login" button: `navy` background

---

## Page: /login

### Layout

```
[JupasHeader]

        ┌──────────────────────────────────────┐
        │  JUPAS Applicant Login               │
        │  ──────────────────────────────────  │
        │                                      │
        │  Application Number                  │
        │  [26-                             ]  │
        │                                      │
        │  Password                            │
        │  [••••••••                        ]  │
        │                                      │
        │  [● Invalid credentials — please    │
        │     check and try again.]           │
        │                                      │
        │  [Login]                             │
        │                                      │
        │  Don't have an account?              │
        │  Submit your choices →               │
        └──────────────────────────────────────┘
```

### States
- **Default**: Empty inputs, no error
- **Error**: Red alert box above the Login button with error message
- **Submitting**: Button shows spinner + "Logging in...", inputs disabled
- **Success**: Redirect to `/results`

### Notes
- Card: white, `border border-gray-300`, `shadow-sm`, max-width `400px`, centered
- Error box: `red` background tint, `red` text
- "Submit your choices →" links to `/`

---

## Page: /results

### Phase 1 — Loading Screen

```
[JupasHeader]

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           Retrieving your results from JUPAS...            │
│                                                             │
│   ████████████████████████░░░░░░░░░░  75%                  │
│                                                             │
│           Authenticating...                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Full-width progress bar, `navy` fill on `gray-100` track
- Status message cycles every ~1 second:
  1. "Connecting to JUPAS server..."
  2. "Authenticating..."
  3. "Retrieving offer data..."
  4. "Finalising..."
- Duration: ~4 seconds total before transitioning to Phase 2

### Phase 2 — Result Reveal

**Band A or B (celebratory)**
```
┌─────────────────────────────────────────────────────────────┐
│  ✦  CONGRATULATIONS                                         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  You have been offered a place in:                          │
│                                                             │
│  Choice 2 — Band A                                          │
│  The University of Hong Kong                                │
│  Bachelor of Science in Computer Science                    │
│                                                             │
│  [Re-roll Result]                                           │
└─────────────────────────────────────────────────────────────┘
```
- Card border: `green-600`
- Header background: light green tint
- Confetti animation on reveal

**Band C (neutral)**
```
┌─────────────────────────────────────────────────────────────┐
│  ─  Offer Result                                            │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  You have been offered a place in:                          │
│                                                             │
│  Choice 8 — Band C                                          │
│  City University of Hong Kong                               │
│  Bachelor of Engineering in Computer Science                │
│                                                             │
│  [Re-roll Result]                                           │
└─────────────────────────────────────────────────────────────┘
```
- Card border: `navy`
- Header background: light blue tint

**Band D or E (muted)**
```
┌─────────────────────────────────────────────────────────────┐
│  ─  Offer Result                                            │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  You have been offered a place in:                          │
│                                                             │
│  Choice 17 — Band E                                         │
│  Hong Kong Metropolitan University                          │
│  Bachelor of Arts in Communication Studies                  │
│                                                             │
│  [Re-roll Result]                                           │
└─────────────────────────────────────────────────────────────┘
```
- Card border: `amber-600`
- Header background: light amber tint

### Collapsible Choices Summary (below result card)

```
▼ View all submitted choices

  Band A (Choices 1–3)
  ┌──────┬──────────┬────────────────────────┬──────────────────────────┐
  │  1   │ JS6999   │ The University of HK   │ Computing and Data Sci.  │
  │  2   │ JS5240   │ HKUST                  │ Dept of CS & Engineering │
  │  3   │ JS4412   │ CUHK                   │ Computer Science & Eng.  │
  └──────┴──────────┴────────────────────────┴──────────────────────────┘

  Band B (Choices 4–6)
  ...
```

- Collapsed by default
- Admitted choice row is highlighted with a `✓` and `navy` left border

### Re-roll Behaviour
- Clicking "Re-roll Result" triggers POST `/api/results/reset`
- While request is in flight: button shows spinner, is disabled
- On success: full Phase 1 loading animation plays again, then new result reveals
- Result card animates in using Framer Motion `fade + scale` transition

---

## Animation Details

| Animation | Library | Spec |
|---|---|---|
| Loading progress bar | CSS transition | Linear fill over 4s |
| Status message swap | Framer Motion `AnimatePresence` | Fade out old, fade in new |
| Result card reveal | Framer Motion | `opacity: 0→1`, `scale: 0.95→1`, duration 0.5s |
| Confetti (Band A/B) | `canvas-confetti` | Burst on card enter |
| Re-roll transition | Framer Motion | Fade out result, show loading, fade in new result |
