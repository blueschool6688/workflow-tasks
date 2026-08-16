# Implementation Plan: Pure Real-Time WebSocket Engine (Zero Polling)

## Context & Problem Analysis
- User explicitly identified that WebSocket events were not functioning as pure real-time, and that internal API polling was used as a fallback, which is incorrect.
- Real-time notifications and project chat messages MUST be pushed instantly via WebSocket events (Laravel Reverb + Laravel Echo/Pusher).
- Root causes identified:
  1. Internal polling intervals in `projectChatStore` and `notificationStore` masking socket events.
  2. Channel authorization for `project.{id}` in `routes/channels.php` only checked UUID `find()`, failing when frontend subscribed with project key (e.g., `CORE-ENG`).
  3. Broadcast events (`ProjectMessageSent`, `ProjectMessagePinned`, `TypingIndicator`) only published on UUID channel, whereas clients may subscribe via key or UUID.
  4. Event listeners in Echo need to bind both prefixed (`.EventName`) and fully-qualified / unprefixed event names to ensure 100% reception across all Pusher/Reverb protocols.

---

## Phase Breakdown

### Phase 1: Backend Broadcasting & Channel Authorization Hardening
- [ ] 1.1 Update `routes/channels.php` so `project.{id}` channel authorizes both UUID and project key (`Project::where('key', $id)`).
- [ ] 1.2 Update `ProjectMessageSent`, `ProjectMessagePinned`, and `TypingIndicator` to broadcast on both UUID and Project Key private channels.
- [ ] 1.3 Update `ProjectChatController` and `TaskController` to ensure events broadcast immediately with `ShouldBroadcastNow`.

### Phase 2: Elimination of All Polling & Pure Real-Time Frontend Stores
- [ ] 2.1 Remove all `setInterval`, `startFallbackPolling`, and background poll timers from `projectChatStore.ts`.
- [ ] 2.2 Remove all `setInterval` and unread count polling from `notificationStore.ts`.
- [ ] 2.3 Ensure `RealtimeProvider.tsx` establishes persistent socket connection on user login and subscribes to `user.{id}`.
- [ ] 2.4 In `projectChatStore.ts`, subscribe to both UUID and project key channels upon opening chat or switching projects, and listen to all event variations (`.ProjectMessageSent`, `ProjectMessageSent`, etc.).
- [ ] 2.5 In `notificationStore.ts`, when `TaskStatusChanged` event arrives, immediately push to store, increment unread counter, and display dynamic toast notification with click-to-open task detail.

### Phase 3: Automated Testing & End-to-End Verification (TDD)
- [ ] 3.1 Write automated PHPUnit tests in `NotificationAndChatTest.php` verifying:
  - Channel authorization with project key and UUID.
  - Immediate event broadcast dispatch with correct payload and channels.
- [ ] 3.2 Verify real-time message sending and reception across client instances.
