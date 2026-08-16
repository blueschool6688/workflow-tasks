# Todo List: Chatbox Advanced Enhancements

## Phase 1: Database & Backend API
- [x] 1.1 Tạo Migration `2026_08_16_130000_add_pin_fields_to_project_messages_table.php` (`is_pinned`, `pinned_at`, `pinned_by_id`)
- [x] 1.2 Cập nhật Model `ProjectMessage` (fillable, pinnedBy relation)
- [x] 1.3 Cập nhật `ProjectChatController@index` trả về `pinned_message` và danh sách `tasks` cho autocomplete
- [x] 1.4 Thêm `ProjectChatController@upload` xử lý upload ảnh/tệp đính kèm
- [x] 1.5 Thêm `ProjectChatController@pin` xử lý ghim/bỏ ghim tin nhắn (tối đa 1 tin ghim / project)
- [x] 1.6 Tạo Event `ProjectMessagePinned` phát sóng realtime
- [x] 1.7 Đăng ký routes mới trong `routes/api.php`

## Phase 2: Frontend API Client & State Management
- [x] 2.1 Cập nhật `projectChatApi.ts` (upload attachment, pin message, task ref types)
- [x] 2.2 Nâng cấp `projectChatStore.ts` (throttled typing, project switcher, pinned message state, attachments state)

## Phase 3: Project Chatbox UI & Interaction
- [x] 3.1 Thêm Project Switcher dropdown trên Header của Chatbox
- [x] 3.2 Thêm Pinned Message Banner trên đầu luồng chat kèm nút Jump to Message & Unpin
- [x] 3.3 Tích hợp Autocomplete Popup khi gõ `@` (Member + Tasks) và `#` (Tasks)
- [x] 3.4 Thêm nút toolbar `[#] Task` và `[@] Member`
- [x] 3.5 Tích hợp Upload hình ảnh với thumbnail preview và Lightbox xem ảnh trong tin nhắn
- [x] 3.6 Bộ parser nội dung tin nhắn tự động biến mã task thành thẻ liên kết mở `TaskDetailModal` khi click

## Phase 4: Automated Testing & Verification
- [x] 4.1 Bổ sung tests trong `NotificationAndChatTest.php` (6/6 passed, 42 assertions)
- [x] 4.2 Chạy `php artisan test` đạt 100% pass
