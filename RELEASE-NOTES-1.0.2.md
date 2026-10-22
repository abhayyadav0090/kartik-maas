# Kartik Tracker 1.0.2 — Sign-in and log hygiene

- Devotees now stay signed in for 35 days (previously 7), so they do not need to sign in again during the 30-day journey.
- Server logs no longer include URL query strings.
- The optional `/api/kartik/alerts/tick` endpoint now accepts the secret only in the `x-cron-key` header (the `?key=` form was removed).
- Added smoke tests for the above.

No environment variable names, database collection names, API routes, or user data schemas were changed. Existing 7-day sessions simply expire as before; new sign-ins last 35 days.
