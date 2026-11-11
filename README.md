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

## API Contract

All error responses strictly follow the format:

```json
{
  "error": "Detailed error message"
}
```

## Endpoints

| Method | Endpoint | Auth Required | Request Parameters / Body | Response Format | Status Codes |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` | No | Body: `{ "email": *string*, "password": *string* }` | `{ "token": *string* }` | 200, 400, 401 |
| GET | `/api/v1/services` | No | None | Array<{ *id*: *number*, *name*: *string*, *description*: *string*, *price*: *number*, *is_active*: *boolean* }> (active only) | 200 |
| GET | `/api/v1/admin/services` | Yes (Bearer `<token>`) | None | Array<{ *id*: *number*, *name*: *string*, *description*: *string*, *price*: *number*, *is_active*: *boolean* }> (all) | 200, 401 |
| GET | `/api/v1/slots` | No | Query: `?date=YYYY-MM-DD&service_id=number` | Array<{ *id*: *number*, *starts_at*: *string*, *ends_at*: *string*, *is_available*: *boolean* }> | 200, 400 |
| POST | `/api/v1/appointments` | No | Body: `{ "slot_id": *number*, "service_id": *number*, "customer_name": *string*, "customer_phone": *string*, "customer_email"*?*: *string* }` | Flat record: `{ "id": *number*, "slot_id": *number*, "customer_id": *number*, "service_id": *number*, "status": "pending", "created_at": *string* }` | 201, 400, 409 |
| GET | `/api/v1/appointments` | Yes (Bearer `<token>`) | Query: `?date=YYYY-MM-DD` (required), `&status=pending\|confirmed\|completed\|cancelled` (optional) | Array<{ *id*: *number*, *status*: *string*, *starts_at*: *string*, *ends_at*: *string*, *service_name*: *string*, *customer_name*: *string*, *customer_phone*: *string* }> | 200, 400, 401 |
| PATCH | `/api/v1/appointments/:id` | Yes (Bearer `<token>`) | Params: `:id` Body: `{ "status": "confirmed" *\|* "completed" *\|* "cancelled" }` | Flat record: `{ "id": *number*, "slot_id": *number*, "customer_id": *number*, "service_id": *number*, "status": *string*, "created_at": *string* }` | 200, 400, 401, 404, 409 |
