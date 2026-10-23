# Kartik Tracker 1.1.0 — Accessibility, reliability, and interface refresh

- Refreshed the interface with a calm, responsive Material/Fluent-inspired layout while retaining the Damodara artwork, bilingual tracker, vows, progress charts, and the existing sharing image.
- Added a user-selectable light/dark theme remembered on the device.
- Added visible keyboard focus, tab-keyboard navigation, status announcements, a concise completion toast, and a reflection textarea. Removed the unused hidden floating-text animation timer.
- Fixed date rendering to use the India calendar consistently, including for people whose browser timezone is outside India.
- Kept HTML, CSS, browser JavaScript, and service worker as separate files; refreshed the static asset version.
- Reduced unnecessary database waits for public push-config and logout routes.
- Bounded simultaneous reminder processing and improved handling for enabled alerts with no active push device or temporary provider failures.
- Added `.env.example`, `.gitignore`, updated deployment documentation, and expanded smoke/integration checks.

No environment-variable names or MongoDB model/collection names were changed. Real secrets are not included. Existing saved vow data is not intentionally migrated or deleted.

**Important:** The in-process scheduler runs only while the Render service process is running. Render Free sleep/suspension can delay or prevent reminders; see `SETUP-REMINDERS.md`.
