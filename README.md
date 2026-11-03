# Booking API

REST API for appointment booking built with Node.js, Express, TypeScript, and PostgreSQL.

## Known Limitations

- Time slots are fixed to 30-minute intervals on the `:00` and `:30` minute grid.
- Each appointment booking creates a new customer record (no customer profile deduplication or reuse).
- Admin accounts can only be created via database scripts (no public registration).
- Authentication lacks rate limiting and brute-force protection, with variable response times.
- No automated notifications (email/SMS) and no appointment rescheduling flow.
- Supports only a single specialist.
- Operates strictly within a single time zone (`Europe/Kyiv`).