# Kartik Maas — deployment and reminder operations

## Calendar

The 30-day tracker is aligned to the supplied calendar: **26 October through 24 November 2026 (India calendar)**. Day 1 is 26 October; Day 30 is 24 November. Browser labels and backend date gates both use `Asia/Kolkata`. Reminders are not sent before Day 1 or after Day 30.

## Existing Render service

This repository is a standalone Node/Express Web Service. Keep the existing environment values for `MONGO_URI`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`. Do not delete collections or recreate the MongoDB database.

Build command: `npm install`  
Start command: `npm start`  
Health endpoint: `https://kartik-maas.onrender.com/api/health`

## Reminder behavior

The selected reminder time is saved even while reminders are OFF, so devotees can configure it in advance. Enabling reminders triggers a test notification. The title/body of a daily push are personalized with the journey day, pending count, and up to three incomplete vow names. Tapping it opens `/kartik`. The phone/browser controls the actual sound and vibration; the site cannot force a custom ringtone or devotional tune.

The server starts an in-process reminder checker automatically and checks once per minute while the process is running. Render logs should include:

`[Kartik scheduler] started: one-minute checks; journey 26 Oct–24 Nov 2026 (Asia/Kolkata)`

A daily push is attempted only when all of these conditions hold:

- The India calendar date is between 26 October and 24 November 2026.
- The devotee has enabled reminders and has an active push subscription.
- The chosen local reminder time has arrived and the scheduler checks within the following four-hour window.
- At least one active vow remains incomplete for that day.

**Render Free limitation:** the in-process timer cannot run while the web service is sleeping or suspended. Free services can spin down after a period without incoming traffic, so reminder delivery at an exact time is not guaranteed without a running process. A health monitor pinged every five minutes can keep the service awake but can use about 720 instance-hours per 30-day month. Since Render’s Free instance-hour pool is shared by the workspace’s Free services, keeping several of them awake can exhaust the shared quota. UptimeRobot is therefore a trade-off, not a free way to guarantee reliable reminders. Do not add it just to hide cold starts without considering this quota.

**Do not set `KARTIK_ALERTS_ANYDAY=1` in production.** Leave it unset or set it to `0`.

## Optional external tick endpoint

The endpoint `/api/kartik/alerts/tick` remains available for a separate scheduler/manual trigger. It requires `KARTIK_CRON_KEY` set in Render and the same value sent in the `x-cron-key` HTTP header. Do not put the secret in the URL or expose it publicly. No external tick service is configured automatically by this repository. If using a separate free cron provider, confirm that it supports the required custom HTTP header, that its usage limits suit the task, and test a real reminder before relying on it.

## Deploy and verify

1. Extract the ZIP and upload the contents of `kartik-maas-main/` into the root of the **existing** `kartik-maas` GitHub repository. Do not create another nested `kartik-maas-main/kartik-maas-main` folder.
2. Let Render deploy the latest commit. Keep the existing environment values and MongoDB data.
3. Confirm the service is live and `GET /api/health` returns HTTP 200.
4. Confirm the scheduler startup line shown above appears in logs. While outside the journey, routine checks should report `outsideJourney: true` and must not send reminders.
5. For an end-to-end push check, sign in with a test account, enable reminders, and confirm the test notification arrives on a subscribed device. Production test delivery is not guaranteed by syntax/smoke tests alone.

## Preserving user data

Do not delete MongoDB collections or change their names. This version keeps the existing model/collection names and API environment-variable names. Existing test entries in Day 1 are not automatically deleted; use the tracker’s test-data action before the journey if you do not want them counted as Day 1 progress.

## Notification samples

See [`NOTIFICATION-PREVIEW.md`](NOTIFICATION-PREVIEW.md) for English and Hindi examples that can be shared with devotees.
