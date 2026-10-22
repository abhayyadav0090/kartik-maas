# Kartik Maas — deployment and reminder operations

## Calendar
The 30-day tracker is aligned to the supplied calendar: **26 October through 24 November 2026 (India calendar)**. Day 1 is 26 October; Day 30 is 24 November. The frontend and backend use the same start date. The date gate prevents scheduled reminders before Day 1 and after Day 30.

## Existing Render service
This repository is a standalone Node/Express Web Service. Keep the existing environment values for `MONGO_URI`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`. No MongoDB collections or saved tracker data need to be deleted or reset.

Build command: `npm install`
Start command: `npm start`
Health endpoint: `https://kartik-maas.onrender.com/api/health`

## Reminder scheduler

The selected time is saved even while reminders are OFF, so devotees can configure it in advance. The app sends a test notification when reminders are enabled. Web notifications use the phone/browser notification sound; the website cannot force a particular ringtone or devotional tune, and vibration is device/browser-dependent.
The server now starts an in-process reminder checker automatically and checks once per minute. Render logs include `[Kartik scheduler]` messages so it can be verified without setting up a separate cron provider. A reminder is attempted only if:

- the India calendar date is between 26 Oct and 24 Nov 2026;
- the devotee has reminders enabled and a valid push subscription;
- the selected reminder time has arrived (within a four-hour delivery window); and
- at least one active vow remains incomplete for that day.

**Do not set `KARTIK_ALERTS_ANYDAY=1` in production.** Leave it unset or set it to `0`, so no pre-season reminders are sent.

## UptimeRobot / Render Free
If using UptimeRobot, the monitor should request `https://kartik-maas.onrender.com/api/health` every 5 minutes and expect HTTP 200. This keeps sending inbound requests, which can prevent an idle spin-down while the monitor is healthy; it does not guarantee uptime or prevent Render restarts. Render Free has a shared workspace pool of 750 instance-hours per calendar month. If multiple Free web services are continuously kept awake, the workspace can exhaust that pool and all Free web services may be suspended until the next month. For a service that devotees depend on, use an always-on paid instance if dependable availability is required.

## External tick endpoint (optional)
You do **not** need cron-job.org when the in-process scheduler and UptimeRobot health monitor are enabled. The protected endpoint `/api/kartik/alerts/tick` remains available only for optional external/manual triggering; it requires `KARTIK_CRON_KEY` in the environment and the `x-cron-key` header. The `?key=` query form was removed in 1.0.2 so the secret can never appear in URLs or logs. Do not expose the secret publicly.

## Deploy and verify
1. Upload the contents of this ZIP's `kartik-maas-main/` folder to the root of the existing `kartik-maas` GitHub repository.
2. Let Render deploy the latest commit.
3. In Render logs, confirm `Kartik reminder scheduler started: one-minute checks; journey 26 Oct–24 Nov 2026`.
4. Confirm repeated `[Kartik scheduler]` log lines appear about every five minutes; before 26 October, these should show `outsideJourney: true` and should not send any reminders.
5. After 26 October begins, a push is attempted only for devotees who opted in and still have incomplete vows.

## Preserving existing user data
Do not delete MongoDB collections. The backend continues to use the existing `User` and `KartikState` collection names. Existing Day 1 test progress is not deleted by the date change; consider clearing test entries through the app before the journey begins if you don't want them in Day 1.


## Notification preview
See [`NOTIFICATION-PREVIEW.md`](NOTIFICATION-PREVIEW.md) for English and Hindi examples to share with devotees.
