# Kartik Maas Tracker — QA report for release 1.1.1

## Automated checks performed

- Node syntax checks passed for `server.js`, `site/kartik.js`, and `site/sw.js`.
- Smoke suite: 10 passed, 0 failed, 1 skipped out of 11 tests.
- The skipped test is a local HTTP endpoint integration smoke test. The Node dependencies are not installed in this build environment, so the app server could not be loaded there. It is designed to run after `npm install`.
- HTML parser audit: 201 elements; 85 unique IDs; no duplicate IDs; every static button declares `type`.
- CSS parser audit: 195 top-level rules parsed with no syntax errors.
- Local HTML/CSS asset references checked against files in `site/`; the 1200 × 630 social-sharing image is present.
- The 26 October–24 November 2026 India-calendar journey is consistent across frontend, backend and deployment notes; Kartik Purnima is labelled on Day 30.
- No actual secrets are bundled in `.env.example`; existing env-variable names, MongoDB model names and collection names are preserved.

## Still requires a real deployment check

The following cannot be proven by static/smoke tests alone and must be checked on the existing Render service: Google sign-in with an account not on the test-user list, reading/writing an existing account's MongoDB progress, a real subscribed-device push test, multi-device conflict behavior, and performance under 200 simultaneous users.

## Reminder reliability limitation

The scheduler is in-process and checks every minute while the Node server is running. A sleeping or suspended Render Free instance cannot run the timer. Therefore the release does not promise exact-time push delivery on a sleeping Free service. A five-minute keep-awake ping can consume around 720 instance-hours in a 30-day month, shared against the workspace's Free quota.

## Deployment safety

Upload the contents of `kartik-maas-main/` to the root of the existing Kartik GitHub repository. Keep the existing Render environment variables and MongoDB database. Do not delete MongoDB collections or upload any real `.env` file.
