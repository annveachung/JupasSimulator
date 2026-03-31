# API Specification — JUPAS Results Simulator

All endpoints are Next.js App Router route handlers under `/app/api/`.  
Base URL (local): `http://localhost:3000`

---

## Authentication

Protected endpoints require a valid JWT in the `jupas_token` HTTP-only cookie, set by `/api/login`. If the cookie is missing or invalid, the endpoint returns `401 Unauthorized`.

JWT payload shape:
```json
{
  "userId": "string",
  "username": "string",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Endpoints

### POST /api/register

Submit programme choices and receive auto-generated credentials. The result band and specific choice are assigned server-side at this point.

**Request body**
```json
{
  "choices": [
    {
      "rank": 1,
      "jupasCode": "JS6999"
    },
    {
      "rank": 2,
      "jupasCode": "JS5240"
    }
    // ... up to rank 20; only filled choices need to be included
  ]
}
```

The server resolves `university` and `program` from `data/programmes.ts` using `jupasCode` — the client does not send these separately.

**Validation**
- `choices` must be a non-empty array
- At least one entry with `rank: 1` must be present
- `rank` must be an integer between 1 and 20 (inclusive)
- `jupasCode` must match a known code in `data/programmes.ts`
- Duplicate ranks are rejected

**Response — 201 Created**
```json
{
  "username": "26-83741",
  "password": "Kx4mR9pL"
}
```

**Error responses**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_CHOICE_1` | Choice #1 not provided |
| 400 | `INVALID_RANK` | A rank is outside 1–20 or duplicated |
| 400 | `EMPTY_FIELDS` | University or program field is empty |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

### POST /api/login

Verify credentials and set a session cookie.

**Request body**
```json
{
  "username": "26-83741",
  "password": "Kx4mR9pL"
}
```

**Response — 200 OK**
```json
{
  "success": true
}
```

Sets cookie: `jupas_token` (HTTP-only, Secure in production, SameSite=Lax, 7-day expiry)

**Error responses**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_FIELDS` | Username or password not provided |
| 401 | `INVALID_CREDENTIALS` | Username not found or password mismatch |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

### GET /api/results

Fetch the stored result and all choices for the authenticated user.

**Auth**: Required (`jupas_token` cookie)

**Response — 200 OK**
```json
{
  "admittedChoiceRank": 2,
  "admittedChoice": {
    "rank": 2,
    "university": "HKUST",
    "program": "BEng in Computer Science and Engineering",
    "band": "A"
  },
  "resetCount": 0,
  "choices": [
    {
      "rank": 1,
      "university": "The University of Hong Kong",
      "program": "Bachelor of Science in Computer Science",
      "band": "A"
    },
    {
      "rank": 2,
      "university": "HKUST",
      "program": "BEng in Computer Science and Engineering",
      "band": "A"
    }
    // ...
  ]
}
```

The `band` field is derived server-side:
- Rank 1–3 → `"A"`
- Rank 4–6 → `"B"`
- Rank 7–10 → `"C"`
- Rank 11–15 → `"D"`
- Rank 16–20 → `"E"`

**Error responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | Missing or invalid session cookie |
| 404 | `USER_NOT_FOUND` | User record not found in DB |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

### POST /api/results/reset

Re-roll the result for the authenticated user. Runs the same weighted band selection algorithm against the user's saved choices, updates `admittedChoiceRank` and increments `resetCount`.

**Auth**: Required (`jupas_token` cookie)

**Request body**: None

**Response — 200 OK**
```json
{
  "admittedChoiceRank": 7,
  "admittedChoice": {
    "rank": 7,
    "university": "CUHK",
    "program": "BSc in Information Engineering",
    "band": "C"
  },
  "resetCount": 1
}
```

**Error responses**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | Missing or invalid session cookie |
| 404 | `USER_NOT_FOUND` | User record not found in DB |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

## Error Response Shape

All error responses follow a consistent envelope:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The application number or password is incorrect."
  }
}
```

---

### GET /api/programmes/search

Client-side autocomplete search. Returns up to 10 matching programmes for a query string. Matches against JUPAS code, programme name, and university name.

**Query params**
- `q` — search string (min 1 character)

**Response — 200 OK**
```json
[
  {
    "code": "JS6999",
    "university": "The University of Hong Kong",
    "name": "Computing and Data Science"
  },
  {
    "code": "JS5240",
    "university": "The Hong Kong University of Science and Technology",
    "name": "Department of Computer Science and Engineering"
  }
]
```

Returns an empty array if `q` is missing or blank.

---

## Band Derivation Helper (shared logic in `lib/bands.ts`)

```ts
const BANDS = [
  { name: 'A', min: 1,  max: 3,  weight: 0.25 },
  { name: 'B', min: 4,  max: 6,  weight: 0.25 },
  { name: 'C', min: 7,  max: 10, weight: 0.20 },
  { name: 'D', min: 11, max: 15, weight: 0.18 },
  { name: 'E', min: 16, max: 20, weight: 0.12 },
]

function getBand(rank: number): string
function rollResult(choices: Choice[]): number  // returns admittedChoiceRank
```
