# Todo List: Pure Real-Time WebSocket Engine

## Phase 1: Backend Broadcasting & Channels
- [x] 1.1 Sửa `routes/channels.php` hỗ trợ xác thực `project.{id}` cho cả UUID và Project Key
- [x] 1.2 Cập nhật `ProjectMessageSent.php` broadcast trên cả UUID và Project Key
- [x] 1.3 Cập nhật `ProjectMessagePinned.php` broadcast trên cả UUID và Project Key
- [x] 1.4 Cập nhật `TypingIndicator.php` broadcast trên cả UUID và Project Key

## Phase 2: Loại bỏ hoàn toàn Polling & Hoàn thiện Pure Real-Time Stores
- [x] 2.1 Xóa sạch toàn bộ polling timer, `setInterval` trong `projectChatStore.ts`
- [x] 2.2 Xóa sạch toàn bộ polling timer, `setInterval` trong `notificationStore.ts`
- [x] 2.3 Cập nhật `subscribeToProjectChannel` đăng ký đa kênh (UUID + Key) và bind các alias event
- [x] 2.4 Cập nhật `subscribeToUserChannel` bind các alias event và trigger toast thông báo realtime

## Phase 3: Kiểm thử tự động (TDD) & Xác nhận
- [x] 3.1 Bổ sung tests trong `NotificationAndChatTest.php`
- [x] 3.2 Chạy test suite `php artisan test` đạt 100% pass
