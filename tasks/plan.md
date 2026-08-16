# Implementation Plan: Real-time Task Status Notifications & Project Team Chatbox

## Overview
Xây dựng hệ sinh thái thông báo thời gian thực (Real-time Notifications) khi chuyển trạng thái Task (bắn notify cho Người được giao / Assignee, Người theo dõi/tạo / Reporter/Consignee, và Quản trị viên / Admins) cùng hệ thống Chatbox Dự án thời gian thực (Project Team Chatbox).

## Task List

### Phase 1: Database Architecture & Backend Events
- [x] Task 1.1: Tạo migration và Model cho `Notification` (`notifications` table).
- [x] Task 1.2: Tạo migration và Model cho `ProjectMessage` (`project_messages` table).
- [x] Task 1.3: Tạo các Event phát sóng `TaskStatusChanged` và `ProjectMessageSent`, `TypingIndicator`.
- [x] Task 1.4: Tạo `NotificationController` và `ProjectChatController` kèm định tuyến API.
- [x] Task 1.5: Tích hợp logic tự động tạo thông báo và kích hoạt event trong `TaskController` qua `NotificationService`.

### Phase 2: Real-time Client Engine & Stores (Frontend)
- [x] Task 2.1: Xây dựng service `echoService.ts` quản lý kết nối Laravel Echo & Reverb WebSocket.
- [x] Task 2.2: Xây dựng `notificationStore.ts` quản lý state thông báo và nhận notify realtime + Sonner toast.
- [x] Task 2.3: Xây dựng `projectChatStore.ts` quản lý state chatbox và tin nhắn realtime, typing indicator.
- [x] Task 2.4: Xây dựng `RealtimeProvider.tsx` quản lý vòng đời socket và kích hoạt mở nhanh TaskDetailModal.

### Phase 3: Notification Center UI
- [x] Task 3.1: Nâng cấp `NotificationBell.tsx` với badge đếm số, dropdown phân tab (Tất cả, Chưa đọc, Công việc), visual status badge.
- [x] Task 3.2: Tích hợp click thông báo mở trực tiếp `TaskDetailModal` 1000px.

### Phase 4: Project Team Chatbox Widget (Taste Design)
- [x] Task 4.1: Xây dựng `ProjectChatWidget.tsx` với giao diện Glassmorphism, danh sách thành viên online, soạn tin nhắn, quick emoji picker, reply thread, typing indicator.
- [x] Task 4.2: Tích hợp Chatbox vào `AppHeader.tsx` và `AppLayout.tsx`.

### Phase 5: Automated Testing & Verification
- [x] Task 5.1: Viết test tự động PHPUnit `NotificationAndChatTest.php`.
- [x] Task 5.2: Chạy kiểm thử xác nhận 100% test suite pass (38/38 tests passed, 93 assertions).
