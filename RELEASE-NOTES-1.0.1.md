# Kartik Tracker 1.0.1 — Reliability polish

- Preserved the confirmed 26 October–24 November 2026 journey window.
- Fixed reminder-time persistence when reminders are OFF; failed saves revert the time field to its previous saved value.
- Added a bilingual reminder explanation, including the calendar window and device-controlled sound/vibration behavior.
- Added accessible live status for reminder messages.
- Reduced unnecessary animation timer work and respected the operating system's reduced-motion preference.
- Added social-preview image alt text and bumped stylesheet/script cache versions.
- Added a dependency-free `npm test` smoke suite.

No environment variable names, database collection names, API keys, or user data schemas were changed.
