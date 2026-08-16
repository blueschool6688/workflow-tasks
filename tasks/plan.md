# Implementation Plan: Sprints Timeline, Summary Reports, Workspace Dashboard & Rich Content Editor

## Overview
Nâng cấp và hoàn thiện 5 tính năng cốt lõi cho ứng dụng:
1. Module Dự án: Hiển thị các Sprints theo biểu đồ đường ngang (Horizontal Timeline Chart) có bộ lọc ngày tháng linh hoạt.
2. Khi click vào chi tiết Sprint -> Tự động chuyển hướng đến trang Quản lý Backlog / Board lọc riêng các tasks của Sprint đó.
3. Tab Báo cáo Dự án (Project Summary): Tổng hợp toàn bộ Sprints và Tasks trong dự án kèm biểu đồ và bảng dữ liệu chi tiết.
4. Tab Dashboard: Tổng hợp toàn diện dữ liệu trong Workspace hiện tại với hệ thống KPI, biểu đồ Recharts và bảng dữ liệu công việc.
5. Task Detail Modal: Sử dụng trình soạn thảo nội dung giàu tính năng (Rich Content / Markdown Editor) cho trường Description.

## Task Breakdown

### Phase 1: Rich Text / Markdown Editor Component
- [x] Task 1.1: Xây dựng component [`RichTextEditor.tsx`](file:///c:/laragon/www/tasks/apps/web/src/components/ui/RichTextEditor.tsx) với đầy đủ công cụ định dạng (Bold, Italic, Strike, H1-H3, Bullet, Numbered list, Code, Blockquote, Link, Preview).
- [x] Task 1.2: Tích hợp `RichTextEditor` vào [`TaskDetailModal.tsx`](file:///c:/laragon/www/tasks/apps/web/src/features/tasks/components/TaskDetailModal.tsx) và [`CreateTaskModal.tsx`](file:///c:/laragon/www/tasks/apps/web/src/features/tasks/components/CreateTaskModal.tsx).

### Phase 2: Sprints Horizontal Timeline & Drill-down Redirection
- [x] Task 2.1: Nâng cấp [`ProjectGanttPage.tsx`](file:///c:/laragon/www/tasks/apps/web/src/features/gantt/pages/ProjectGanttPage.tsx) hiển thị các thanh ngang Sprints theo trục thời gian thực kèm bộ lọc ngày tháng (RangePicker, Quick Presets).
- [x] Task 2.2: Thêm sự kiện click trên Sprint bar điều hướng sang `/projects/[projectKey]/backlog?sprintId=...` và `/board?sprintId=...`.
- [x] Task 2.3: Xử lý bộ lọc `sprintId` trong [`BacklogPage.tsx`](file:///c:/laragon/www/tasks/apps/web/src/features/backlog/pages/BacklogPage.tsx) và [`KanbanBoardPage.tsx`](file:///c:/laragon/www/tasks/apps/web/src/features/board/pages/KanbanBoardPage.tsx).

### Phase 3: Project Summary Aggregation
- [x] Task 3.1: Nâng cấp [`ProjectSummaryPage.tsx`](file:///c:/laragon/www/tasks/apps/web/src/app/(app)/projects/[projectKey]/summary/page.tsx) tổng hợp tất cả Sprints (Active, Future, Completed) và tổng hợp danh sách Tasks.
- [x] Task 3.2: Bổ sung bảng Master Tasks trong Project Summary kèm liên kết mở trực tiếp Modal 1000px Task Detail.

### Phase 4: Workspace Global Dashboard
- [x] Task 4.1: Nâng cấp [`MyWorkDashboard.tsx`](file:///c:/laragon/www/tasks/apps/web/src/features/dashboard/pages/MyWorkDashboard.tsx) với các widget thống kê toàn workspace và biểu đồ Recharts (Trạng thái, Phân bổ theo Dự án, Khối lượng công việc theo nhân sự).
- [x] Task 4.2: Tích hợp bảng danh sách công việc toàn diện (Workspace Tasks Table) có tìm kiếm, lọc theo dự án, trạng thái, người thực hiện và mở Task Detail Modal.

## Verification
- [x] Kiểm thử tự động backend: `php artisan test` đạt 100% pass (31/31 tests, 63 assertions).
- [x] Kiểm tra giao diện người dùng trên web client mượt mà, không có lỗi console hay deprecation warnings.
