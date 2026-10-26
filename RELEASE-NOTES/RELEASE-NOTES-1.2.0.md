# 1.2.0

- Bottom navigation: Home · Daily · My Vows · Analysis; each tab shows only its own content.
- Home holds the shloka, title/dates, greeting, slogan and global reminder card.
- Per-vow reminders (time + on/off per vow, saved with the tracker), scheduled per user time zone, de-duplicated, skipping completed/inactive vows.
- Removed Day 1 testing mode, its banner, the clear-test button and `KARTIK_ALERTS_ANYDAY`.
- Fixed: `/api/push/config` and `/api/auth/logout` no longer need a database connection.
- Fixed: changing time zone no longer resets the global reminder time to 18:00.
- Dates unchanged: Day 1 = 26 Oct 2026, Day 30 = 24 Nov 2026.
