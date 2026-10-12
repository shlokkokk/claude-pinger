# Claude Pulse Roadmap & TODO

## 1. Dynamic "Run at Time" / Custom Reset Scheduler
- [x] **Custom Reset Time Input on Web & Android App**:
  - Optional time picker field on Overnight Task Autopilot form (`Auto-execute at: exact time`).
  - Allows entering the exact reset time Claude specifies in the rate limit notice.
- [x] **Cloudflare Worker Precision Queue Execution via Durable Object Alarms**:
  - Stores `targetTimestamp` in `TASK_QUEUE` KV alongside `chatUrl` and `prompt`.
  - Precision edge scheduling via Cloudflare SQLite Durable Object (`TaskScheduler.storage.setAlarm()`).
  - Wakes Worker edge at the exact second without waiting for the 8 daily cron slots.
- [x] **Android App Native Integration**:
  - Syncs with `targetTimestamp` field with native `AlarmManager.setExactAndAllowWhileIdle()` fallback and task countdown badges.

## 2. Completed Features
- [x] Multi-account support with dynamic names and colors (`shlokshah412` & `pcgpt`).
- [x] Overnight Task Autopilot queue via Cloudflare KV.
- [x] Browserless stealth automation for direct conversation continuation.
- [x] URL Verification endpoint & auto-formatter for Claude conversation links.
- [x] Full mobile responsive UI overhaul (100% full-width URL input, stacked buttons, zero text wrapping).
- [x] Android Jetpack Compose native app with 84dp bottom scroll padding and luxurious action banner.
- [x] Separated Active Queue vs. Completed Execution History with accordion expanders (`+N more`), one-tap history cleanup (`DELETE /api/queue?clearCompleted=true`), and confirmation dialogs across all interactive buttons.
- [x] Smart Reset & Cascade Presets with Multi-Account Rolling Limit Buffers (+5h 2m buffer calculated from dialed times and queued account tasks, e.g. 04:45 AM -> 09:47 AM, cascading chaining, and quota clears).
