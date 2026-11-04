# Booking API

REST API for appointment booking built with Node.js, Express, TypeScript, and PostgreSQL.

## Known Limitations

1. Time slots are fixed to 30-minute intervals on the `:00` and `:30` minute grid.
2. Each appointment booking creates a new customer record (no customer profile deduplication or reuse).
3. Admin accounts can only be created via database scripts (no public registration).
4. Authentication lacks rate limiting and brute-force protection, with variable response times.
5. No automated notifications (email/SMS) and no appointment rescheduling flow.
6. Supports only a single specialist.
7. Operates strictly within a single time zone (`Europe/Kyiv`).

## Appointment Lifecycle

1. Status transitions follow a strict state machine: `pending` -> `confirmed` -> `completed` (or `cancelled`).
2. `cancelled` and `completed` are terminal states and cannot be transitioned further.
3. An appointment can only be marked as `completed` after its scheduled start time has passed.

## Authentication & Security

1. Authentication uses the `Authorization: Bearer <jwt>` header. For the MVP scope, token storage is managed on the client side (in-memory or Web Storage), trading CSRF vulnerability mitigation for a potential XSS attack surface. HttpOnly cookies with SameSite policies and CSRF tokens are deferred beyond the MVP.