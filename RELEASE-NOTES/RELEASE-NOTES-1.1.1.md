# Damodar Vows / Kartik Maas — version 1.1.1

- Follow-up QA corrections to the 1.1.0 accessibility and interface refresh.
- Corrected the special-day label so Kartik Purnima appears on Day 30 (24 November 2026), matching the configured 26 Oct–24 Nov journey.
- Added explicit `type="button"` to all static action buttons so they cannot accidentally submit if later wrapped in a form.
- Updated cache-busting asset versions and syncs the browser theme-color meta tag when light/dark mode changes.
- Improved greeting-choice modal keyboard focus: Escape closes it, Tab stays within the dialog, the background is made inert while the modal is open, and selection returns focus to the edit control.
- Added bilingual errors when Google sign-in configuration is missing, the Google Identity script cannot load, or a sign-in request fails. The saved language preference is now applied to the sign-in screen immediately on page load.

- Normalized imported japa goal/round values, fixed restored-default vow handling so renamed vows do not cause duplicate defaults, and enforced the 60-vow cap during restore.

The release keeps the existing API environment variable names, VAPID keys, Google client ID and MongoDB collections unchanged. No secrets are included.

Tests are smoke/static checks; they do not replace a production test of Google sign-in, database persistence or a real push notification. Render Free sleep can pause the in-process scheduler.
