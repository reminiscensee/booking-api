# User Scenarios

## 1. Client Scenarios (MVP)

- **Browse Services:** As a client, I can view the list of active services along with their names, descriptions, and prices.
- **Check Availability:** As a client, I can select a specific date and see all available (unbooked and unblocked) time slots.
- **Book an Appointment:** As a client, I can select an available time slot and book it for a chosen service by providing my name and phone number without creating an account.

## 2. Admin Scenarios (MVP)

- **Authentication:** As an admin, I can log in using my email and password to receive a JWT for protected endpoints.
- **Manage Services:** As an admin, I can create new services, update prices, or deactivate existing ones (`is_active = false`).
- **Manage Slots:** As an admin, I can generate fixed 30-minute time slots for specific dates and manually block/unblock slots (e.g., for breaks or days off).
- **View Schedule:** As an admin, I can view all scheduled appointments filtered by date and status.
- **Update Appointment Status:** As an admin, I can confirm or cancel an appointment (cancelling an appointment immediately releases the time slot for new bookings).
- **Manual Booking:** As an admin, I can create an appointment manually on behalf of a client who calls by phone or walks in.

## 3. Negative & Error Scenarios (MVP)

- **Double Booking Conflict:** When two users try to book the same slot simultaneously, the second request fails with a conflict error (`409 Conflict`).
- **Unavailable or Past Slot:** When a client attempts to book a slot that is already blocked by the admin or belongs to a past date/time, the request is rejected with a validation error (`400 Bad Request`).
- **Validation Failure:** When a client submits malformed data or references a non-existent slot/service, the API rejects it (`400 Bad Request`).
- **Unauthorized Access:** When a user attempts to call protected admin endpoints without a valid JWT, the API responds with an unauthorized error (`401 Unauthorized`).

## 4. Deferred to Future Iterations (Later)

- **Automated Notifications:** Email/SMS notifications for confirmation, reminders, and cancellations (currently handled manually by phone).
- **Rescheduling Workflow:** Dedicated rescheduling endpoint and UI flow (currently handled by cancelling and creating a new appointment).
- **Online Payments:** Integration with payment gateways.
- **Dynamic Durations:** Variable service durations and custom time intervals (MVP strictly uses fixed 30-minute slots where 1 slot = 1 appointment).