
# Booking API

REST API for appointment booking and schedule management built with Node.js, Express, TypeScript, and PostgreSQL. Implements concurrency-safe slot reservations, strict appointment lifecycle transitions, and JWT-protected admin operations.

> **Frontend repository:** [booking-web](https://github.com/reminiscensee/booking-web)

## Features

- Public browsing of active services and available 30-minute time slots (`Europe/Kyiv`).
- Guest appointment booking without registration (`pending` initial status).
- Database-level double-booking prevention using a partial unique index.
- JWT-authenticated admin endpoints for schedule management and appointment status updates.
- Strict state machine governing appointment lifecycle transitions (`pending` → `confirmed` → `completed` / `cancelled`).
- Idempotent bulk generation of 30-minute time slots across multi-day ranges.

## Tech Stack

- **Runtime & Framework:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL (`pg`, raw parameterized SQL, sequential SQL migrations)
- **Validation & Auth:** Zod, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Testing:** Vitest, Supertest

## Architecture

The application follows a layered architecture separating routing, validation, business rules, and SQL persistence:

```text
Request ─▶ Route ─▶ Middlewares (requireAuth / validate) ─▶ Controller ─▶ Service ─▶ PostgreSQL (pg)
                                                                                          │
                                                                             next(err) ───▼
                                                                                     globalError
```

```text
booking-api/
├── docs/                # Database design and user scenarios
├── migrations/          # Sequential SQL schema migrations (001–005)
├── scripts/             # CLI utility scripts (admin creation)
├── seeds/               # SQL seed files
├── src/
│   ├── config/          # Environment validation and configuration
│   ├── controllers/     # HTTP request/response handling
│   ├── db/              # PostgreSQL connection pool and query helpers
│   ├── errors/          # Custom application error classes
│   ├── middlewares/     # Zod validation, JWT auth guard, globalError handler
│   ├── routes/          # Express route definitions (/api/v1/...)
│   ├── schemas/         # Zod schemas for params, query, and body
│   ├── services/        # Business logic, transactions, and raw SQL queries
│   ├── app.ts           # Express app setup and middleware registration
│   └── server.ts        # HTTP server entry point
└── tests/               # Vitest + Supertest test suite
```

## Key Design Decisions

### Partial Unique Index for Concurrency (`uq_appointments_active_slot`)

Enforces `UNIQUE (slot_id) WHERE status IN ('pending', 'confirmed')` at the PostgreSQL level instead of relying on racy SELECT-before-INSERT checks; the error handler catches SQLSTATE 23505 on this constraint and returns 409 Conflict.

### Atomic Booking Transactions

Creating an appointment wraps customer insertion and appointment creation in a single database transaction (`BEGIN` / `COMMIT` / `ROLLBACK`), preventing orphaned customer records if a slot conflict occurs.

### Timezone Normalization & Fixed Grid

All timestamps are stored as `TIMESTAMPTZ` in UTC while business rules (slot generation boundaries and past-slot filtering) operate strictly in `Europe/Kyiv` on a fixed `:00` / `:30` 30-minute grid.

### Soft Deactivation with Referential Integrity

Services use an `is_active` flag combined with `ON DELETE RESTRICT` foreign keys so historical appointments keep intact references when services are retired.

### Column Whitelisting for Dynamic Updates

Partial updates (`PATCH /services/:id`) map validated fields against an explicit column whitelist before building parameterized SET clauses, preventing SQL injection via dynamic keys.

### Finite State Machine for Appointments

Status transitions are validated in the service layer (`pending` → `confirmed` → `completed`, with `cancelled` reachable from `pending` or `confirmed`), blocking transitions out of terminal states and preventing completed before starts_at.

## Additional Documentation

- [Database Design](docs/database.md)
- [User Scenarios](docs/scenarios.md)

## Local Setup

### Prerequisites

- Node.js 24 (developed and tested on this version) and pnpm 11
- PostgreSQL (tested with Neon)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials (the application validates required environment variables on startup and exits if any are missing or invalid):

```env
PORT=3000
DATABASE_URL=postgres://user:password@host/dbname
JWT_SECRET=replace-with-a-long-random-secret-of-at-least-32-characters
FRONTEND_URL=http://localhost:5173
```

Generate a secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Apply migrations and create an admin

Run the SQL files from `migrations/` in numerical order (`001` through `005`):

```bash
for f in migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

> **Windows:** the loop above and the `curl` examples below use bash syntax, so run them in Git Bash. Alternatively, paste the migration files in numerical order into the Neon SQL Editor.

Create an admin account:

```bash
pnpm tsx scripts/create-admin.ts admin@example.com strongpassword123
```

Services do not have a separate seed file; add them via SQL `INSERT` or via `POST /api/v1/services` after authenticating:

```sql
INSERT INTO services (name, description, price, is_active)
VALUES ('Classic Fade', 'Precision haircut and styling', 650, true);
```

### 4. Run the server

```bash
pnpm dev     # Start development server on http://localhost:3000
pnpm build   # Compile TypeScript to dist/
```

### 5. Try it yourself

Run these examples in Git Bash. Replace `<FUTURE_DATE>` with a future date in `YYYY-MM-DD` format, `<TOKEN>` with the JWT from step 1, and `<SLOT_ID>` with the `id` of a free slot from step 3. `service_id` must match a service you created earlier. Booking a slot in the past or a blocked slot returns `409`.

```bash
# 1. Authenticate as admin and copy the returned JWT
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"strongpassword123"}'

# 2. Generate 30-minute slots for a future date range
curl -X POST http://localhost:3000/api/v1/admin/slots/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"start_date":"<FUTURE_DATE>","days":3,"start_time":"09:00","end_time":"18:00"}'

# 3. List free slots for that date and pick an id
curl "http://localhost:3000/api/v1/slots?date=<FUTURE_DATE>"

# 4. Book the chosen slot as a guest
curl -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{"slot_id":<SLOT_ID>,"service_id":1,"customer_name":"Oleksandr","customer_phone":"+380671234567"}'
```

## API Contract

All error responses follow a uniform JSON structure:

```json
{
  "error": "Detailed error message"
}
```

### Endpoints

| Method | Endpoint | Auth | Request Parameters / Body | Response Format | Status Codes |
|---|---|---|---|---|---|
| GET | `/api/v1/health` | No | None | `{ "status": "ok" }` | 200 |
| POST | `/api/v1/auth/login` | No | Body: `{ "email": string, "password": string }` | `{ "token": string }` | 200, 400, 401 |
| GET | `/api/v1/auth/me` | Bearer | None | `{ "id": number, "email": string }` | 200, 401 |
| GET | `/api/v1/services` | No | None | `Array<{ id, name, description, price, is_active }>` (active only) | 200 |
| GET | `/api/v1/services/:id` | No | Params: `:id` | `{ id, name, description, price, is_active }` | 200, 400, 404 |
| POST | `/api/v1/services` | Bearer | Body: `{ "name": string, "description"?: string, "price": number, "is_active"?: boolean }` | `{ id, name, description, price, is_active }` | 201, 400, 401 |
| PATCH | `/api/v1/services/:id` | Bearer | Params: `:id`, Body: `{ "name"?: string, "description"?: string \| null, "price"?: number, "is_active"?: boolean }` | `{ id, name, description, price, is_active }` | 200, 400, 401, 404 |
| GET | `/api/v1/admin/services` | Bearer | None | `Array<{ id, name, description, price, is_active }>` (all) | 200, 401 |
| GET | `/api/v1/slots` | No | Query: `?date=YYYY-MM-DD` | `Array<{ id, starts_at, ends_at, is_blocked }>` | 200, 400 |
| POST | `/api/v1/slots` | Bearer | Body: `{ "starts_at": string }` | `{ id, starts_at, ends_at, is_blocked }` | 201, 400, 401, 409 |
| PATCH | `/api/v1/slots/:id` | Bearer | Params: `:id`, Body: `{ "is_blocked": boolean }` | `{ id, starts_at, ends_at, is_blocked }` | 200, 400, 401, 404 |
| GET | `/api/v1/admin/slots` | Bearer | Query: `?date=YYYY-MM-DD` | `Array<{ id, starts_at, ends_at, is_blocked, is_booked }>` | 200, 400, 401 |
| POST | `/api/v1/admin/slots/generate` | Bearer | Body: `{ "start_date": "YYYY-MM-DD", "days": number, "start_time": "HH:MM", "end_time": "HH:MM" }` | `{ "created": number }` | 201, 400, 401 |
| POST | `/api/v1/appointments` | No | Body: `{ "slot_id": number, "service_id": number, "customer_name": string, "customer_phone": string, "customer_email"?: string, "notes"?: string }` | `{ id, slot_id, customer_id, service_id, status: "pending", created_at }` | 201, 400, 404, 409 |
| GET | `/api/v1/appointments` | Bearer | Query: `?date=YYYY-MM-DD` (required), `&status=pending\|confirmed\|completed\|cancelled` (optional) | `Array<{ id, status, starts_at, ends_at, service_name, customer_name, customer_phone }>` | 200, 400, 401 |
| PATCH | `/api/v1/appointments/:id` | Bearer | Params: `:id`, Body: `{ "status": "confirmed" \| "completed" \| "cancelled" }` | `{ id, slot_id, customer_id, service_id, status, created_at }` | 200, 400, 401, 404, 409 |

## Authentication & Security

Protected routes expect an `Authorization: Bearer <jwt>` header. For the MVP scope, the frontend stores the JWT in localStorage rather than HttpOnly cookies, accepting XSS exposure in exchange for simpler stateless API authentication without CSRF token plumbing.

Login returns immediately when an email is not found, whereas existing accounts execute `bcryptjs.compare`, resulting in measurable response-time differences between unknown emails and invalid passwords.

## Testing

```bash
pnpm test
```

The Vitest + Supertest suite runs 7 integration tests covering the HTTP transport, authentication middleware, and Zod validation layers:

1. `GET /api/v1/health` — returns `200` with `{ "status": "ok" }`.
2. `GET /api/v1/unknown-route` — returns `404` (`Route not found`).
3. `POST /api/v1/services` — returns `401` (`Unauthorized`) when the Bearer token is missing.
4. `POST /api/v1/auth/login` — returns `400` on invalid email/password validation.
5. `POST /api/v1/auth/login` — returns `400` (`Invalid JSON payload`) on malformed JSON.
6. `POST /api/v1/admin/slots/generate` — returns `401` (`Unauthorized`) without authentication.
7. `POST /api/v1/admin/slots/generate` — returns `400` when an authenticated request fails body schema validation.

All 7 tests short-circuit in middleware before executing SQL queries (valid `.env` variables are still required at app startup).


## Known Limitations

- Time slots are fixed to 30-minute intervals on the :00 and :30 minute grid.
- Each appointment booking creates a new customer record (no customer profile deduplication or reuse).
- Admin accounts can only be created via CLI scripts (no public registration).
- Authentication lacks rate limiting, brute-force protection, and constant-time responses for unknown emails.
- No automated notifications (email/SMS) and no dedicated appointment rescheduling endpoint.
- Supports only a single specialist.
- Operates strictly within a single time zone (`Europe/Kyiv`).
- Bulk slot generation (`POST /api/v1/admin/slots/generate`) creates slots across all consecutive days without skipping weekends or filtering past timestamps (past slots are excluded on public `GET /api/v1/slots`).
- Repeated slot generation is idempotent via `ON CONFLICT (starts_at) DO NOTHING`, silently skipping existing timestamps rather than reporting per-slot conflicts.
- Admin service management (`POST/PATCH /services`) and single-slot manual blocking (`PATCH /slots/:id`) are supported by the API, while their dedicated admin UI controls are deferred beyond the MVP.
