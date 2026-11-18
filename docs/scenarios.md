# User Scenarios

## 1. Client Scenarios (MVP)

- **Browse Services:** As a client, I can view the list of active services along with their names, descriptions, and prices.
- **Check Availability:** As a client, I can select a specific date and see all available future (unbooked and unblocked) time slots.
- **Book an Appointment:** As a client, I can select an available time slot and book it for a chosen service by providing my name and phone number without creating an account.

## 2. Admin Scenarios (MVP)

- **Authentication:** As an admin, I can log in using my email and password to receive a JWT for protected endpoints.
- **Generate Slots:** As an admin, I can bulk-generate fixed 30-minute time slots across a date range.
- **View Schedule:** As an admin, I can view all scheduled appointments filtered by date and status.
- **Update Appointment Status:** As an admin, I can confirm, complete (after start time), or cancel an appointment (cancelling an appointment immediately releases the time slot for new bookings).
- **Manual Booking (via Public Flow):** When a client calls by phone or walks in, the admin generates the required time slot (if not already available) and submits the booking through the public booking form, creating an appointment in `pending` status.

## 3. Negative & Error Scenarios (MVP)

- **Double Booking Conflict:** When two users try to book the same slot simultaneously, the second request fails with a conflict error (`409 Conflict`).
- **Unavailable or Past Slot:** When a client attempts to book a slot that is already blocked by the admin or belongs to a past date/time, the request is rejected with a conflict error (`409 Conflict`).
- **Validation Failure:** When a client submits malformed data, the API rejects it (`400 Bad Request`); referencing a non-existent slot or service returns `404 Not Found`.
- **Unauthorized Access:** When a user attempts to call protected admin endpoints without a valid JWT, the API responds with an unauthorized error (`401 Unauthorized`).

## 4. Deferred to Future Iterations (Later)

- **Automated Notifications:** Email/SMS notifications for confirmation, reminders, and cancellations (currently handled manually by phone).
- **Rescheduling Workflow:** Dedicated rescheduling endpoint and UI flow (currently handled by cancelling and creating a new appointment).
- **Online Payments:** Integration with payment gateways.
- **Dynamic Durations:** Variable service durations and custom time intervals (MVP strictly uses fixed 30-minute slots where 1 slot = 1 appointment).
- **Admin UI for Services & Slot Blocking:** Creating/updating services (`POST/PATCH /services`) and manually blocking single slots (`PATCH /slots/:id`) are supported at the REST API level, while dedicated admin UI controls are deferred beyond the MVP.