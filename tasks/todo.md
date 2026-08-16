# Master Task List: Project, Task & Workflow Management System

---

## Phase 1: Monorepo Foundation & Scaffolding

### Task 1: Monorepo Setup & Workspace Configuration
**Description:** Thiết lập cấu trúc monorepo với `pnpm-workspace.yaml`, `turbo.json`, `package.json` gốc, và các package dùng chung `packages/config`, `packages/ui`, `packages/api-types`.
**Acceptance criteria:**
- [x] Cấu trúc thư mục monorepo chuẩn (`apps/`, `packages/`) được khởi tạo.
- [x] Root `pnpm install` và `turbo build` chạy trơn tru không lỗi.
- [x] Cấu hình ESLint, Prettier và TypeScript dùng chung trong `packages/config`.
**Verification:**
- [x] `pnpm install`
- [x] `pnpm turbo build`
**Dependencies:** None
**Files likely touched:**
- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `packages/config/package.json`
- `packages/config/tsconfig.base.json`
**Estimated scope:** S (4 files)

---

### Task 2: Laravel 11 Backend & Docker Environment Setup
**Description:** Khởi tạo dự án Laravel 11 trong `apps/api`, cấu hình `docker-compose.yml` (Postgres 16, Redis 7, PHP-FPM, Nginx, Mailpit) và kết nối CSDL.
**Acceptance criteria:**
- [x] Laravel 11 được cài đặt trong `apps/api` với `composer.json` sạch, tuân thủ Clean Code.
- [x] `docker-compose.yml` ở root khởi động thành công PostgreSQL, Redis và Laravel service.
- [x] Chạy migration khởi tạo kết nối DB thành công.
**Verification:**
- [x] `cd apps/api && php artisan migrate:status`
- [x] `php artisan test`
**Dependencies:** Task 1
**Files likely touched:**
- `docker-compose.yml`
- `apps/api/composer.json`
- `apps/api/.env.example`
- `apps/api/config/database.php`
**Estimated scope:** M (4-5 files)

---

### Task 3: Client Web App & Design System Scaffolding (taste-skill Standard)
**Description:** Khởi tạo ứng dụng client `apps/web` với Next.js/React App Router, TailwindCSS v4, Geist font family, `@phosphor-icons/react`, `motion/react`, TanStack Query và Zustand store theo tiêu chuẩn **taste-skill** (`design-taste-frontend`, Dials: 6/4/7).
**Acceptance criteria:**
- [x] Cấu hình typography chuẩn: Geist Sans + Geist Mono; locked neutral base (Zinc/Slate) + 1 accent color duy nhất.
- [x] Không có AI-purple gradients, không có generic card containers hoặc black drop shadows.
- [x] Tích hợp ThemeProvider (Light / Dark mode nhất quán toàn trang, không lộn xộn giữa các component).
- [x] Cấu hình sẵn Animation tokens với Motion spring physics (`stiffness: 100, damping: 20`) và `useReducedMotion()`.
**Verification:**
- [x] `pnpm --filter=web build`
- [x] `pnpm --filter=web lint`
**Dependencies:** Task 1
**Files likely touched:**
- `apps/web/package.json`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/lib/design-system.ts`
**Estimated scope:** S (4 files)

---

### Task 4: OpenAPI Spec & API Types Pipeline
**Description:** Tích hợp `dedoc/scramble` vào `apps/api` để sinh tự động OpenAPI spec, và cấu hình script sinh type TypeScript sang `packages/api-types`.
**Acceptance criteria:**
- [x] Endpoint `/docs/api.json` hoặc lệnh `php artisan scramble:export` sinh ra OpenAPI JSON chuẩn.
- [x] Script `pnpm generate:types` sinh TypeScript interfaces chính xác vào `packages/api-types/src/index.ts`.
- [x] `apps/web` có thể import và sử dụng types từ `@tasks/api-types`.
**Verification:**
- [x] `cd apps/api && php artisan scramble:export openapi.json`
- [x] `pnpm --filter=@tasks/api-types build`
**Dependencies:** Task 2, Task 3
**Files likely touched:**
- `apps/api/composer.json`
- `packages/api-types/package.json`
- `packages/api-types/src/index.ts`
- `package.json`
**Estimated scope:** S (3 files)

---

### Checkpoint 1: Foundation Complete
- [x] Monorepo build, lint, và typecheck vượt qua toàn bộ.
- [x] API backend và client frontend kết nối được với nhau.

---

## Phase 2: Authentication, Organization & RBAC

### Task 5: Auth API with Laravel Sanctum
**Description:** Xây dựng hệ thống Authentication bằng Laravel Sanctum: Đăng ký, Đăng nhập, Đăng xuất, Refresh Token, Forgot/Reset Password, và endpoint `/api/v1/auth/me`.
**Acceptance criteria:**
- [ ] Các API Auth trả về Sanctum token kèm HTTP status chuẩn và validation error messages.
- [ ] User password được hash an toàn (Argon2id/Bcrypt), có rate-limiting chống brute-force.
- [ ] Unit & Feature tests cho Auth controller đạt 100% pass.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=AuthTest`
**Dependencies:** Task 2
**Files likely touched:**
- `apps/api/app/Http/Controllers/Api/V1/AuthController.php`
- `apps/api/app/Http/Requests/Auth/LoginRequest.php`
- `apps/api/app/Http/Requests/Auth/RegisterRequest.php`
- `apps/api/routes/api.php`
- `apps/api/tests/Feature/AuthTest.php`
**Estimated scope:** M (5 files)

---

### Task 6: Organization & Multi-Workspace Data Models
**Description:** Tạo Migrations, Models, và Seeder cho `organizations`, `workspaces`, và `workspace_members`.
**Acceptance criteria:**
- [ ] Migration tạo đúng quan hệ: Organization -> Workspaces -> WorkspaceMembers (kèm role: Owner, Admin, Member, Guest).
- [ ] Eloquent Model quan hệ chặt chẽ (`hasMany`, `belongsTo`, scopes lọc theo workspace active).
- [ ] Global Scope hoặc Middleware `SetCurrentWorkspace` áp dụng cho các route yêu cầu workspace context.
**Verification:**
- [ ] `cd apps/api && php artisan migrate`
- [ ] `cd apps/api && php artisan test --filter=WorkspaceTest`
**Dependencies:** Task 5
**Files likely touched:**
- `apps/api/database/migrations/*_create_organizations_table.php`
- `apps/api/database/migrations/*_create_workspaces_table.php`
- `apps/api/app/Models/Organization.php`
- `apps/api/app/Models/Workspace.php`
- `apps/api/app/Http/Middleware/WorkspaceContextMiddleware.php`
**Estimated scope:** M (5 files)

---

### Task 7: RBAC System with Spatie Permission & Project Policies
**Description:** Cấu hình `spatie/laravel-permission` cho hệ thống phân quyền vai trò (Role & Permission) ở cấp Workspace và cấp Project.
**Acceptance criteria:**
- [ ] Các role tiêu chuẩn (`super-admin`, `workspace-admin`, `project-manager`, `member`, `guest`) được khởi tạo qua Seeder.
- [ ] Laravel Policies (`WorkspacePolicy`, `ProjectPolicy`, `TaskPolicy`) kiểm soát quyền truy cập API chính xác.
- [ ] API trả về lỗi 403 Forbidden kèm lý do khi không đủ quyền.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=PermissionTest`
**Dependencies:** Task 6
**Files likely touched:**
- `apps/api/config/permission.php`
- `apps/api/app/Policies/ProjectPolicy.php`
- `apps/api/app/Policies/TaskPolicy.php`
- `apps/api/database/seeders/RoleAndPermissionSeeder.php`
**Estimated scope:** S (4 files)

---

### Task 8: Client Auth UI & Shell Layout (taste-skill Standard)
**Description:** Xây dựng màn hình Đăng nhập/Đăng ký trên `apps/web`, App Shell (Collapsible Sidebar, Top Breadcrumb, Workspace Switcher, User Profile Menu) áp dụng **taste-skill** (`design-taste-frontend`).
**Acceptance criteria:**
- [ ] Form Đăng nhập & Đăng ký đạt chuẩn WCAG AA Contrast, tactile feedback `:active:scale-[0.98]`, label đặt trên input, không dùng placeholder thay label.
- [ ] App Sidebar gọn gàng kiểu Linear/Notion, phím tắt thu gọn (`Cmd/Ctrl + B`), dropdown đổi Workspace mượt mà.
- [ ] Navigation hiển thị đúng 1 dòng trên Desktop, không vỡ layout khi co dãn.
**Verification:**
- [ ] `pnpm --filter=web lint`
- [ ] Kiểm tra flow đăng nhập, lưu token và đổi workspace trên UI.
**Dependencies:** Task 4, Task 5, Task 6
**Files likely touched:**
- `apps/web/src/features/auth/components/LoginForm.tsx`
- `apps/web/src/features/auth/components/RegisterForm.tsx`
- `apps/web/src/features/workspace/components/WorkspaceSwitcher.tsx`
- `apps/web/src/components/layout/AppSidebar.tsx`
- `apps/web/src/components/layout/AppHeader.tsx`
**Estimated scope:** M (5 files)

---

### Checkpoint 2: Auth & Organization Ready
- [ ] Người dùng có thể đăng ký tài khoản, đăng nhập, tạo/chọn workspace và được phân quyền chính xác.

---

## Phase 3: Dynamic Workflow Engine & Project Core

### Task 9: Project Schema & Management API
**Description:** Xây dựng Migration, Model và API CRUD cho Dự án (`projects`, `project_members`, project templates).
**Acceptance criteria:**
- [ ] Project có các trường: `name`, `key` (prefix ví dụ: PROJ), `description`, `type` (`scrum`, `kanban`, `freeform`), `status`, `start_date`, `target_end_date`.
- [ ] API CRUD đầy đủ: Tạo mới, Danh sách theo workspace, Chi tiết, Cập nhật, Lưu trữ (Archive), Xóa mềm (Soft delete).
- [ ] Quản lý danh sách thành viên trong dự án và gán vai trò (`project_lead`, `developer`, `reporter`, `viewer`).
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=ProjectApiTest`
**Dependencies:** Task 7
**Files likely touched:**
- `apps/api/database/migrations/*_create_projects_table.php`
- `apps/api/app/Models/Project.php`
- `apps/api/app/Http/Controllers/Api/V1/ProjectController.php`
- `apps/api/app/Http/Requests/Projects/CreateProjectRequest.php`
- `apps/api/tests/Feature/ProjectApiTest.php`
**Estimated scope:** M (5 files)

---

### Task 10: Dynamic Workflow Data Models & Schemas
**Description:** Tạo Migrations và Models cho `workflows`, `workflow_statuses`, và `workflow_transitions`.
**Acceptance criteria:**
- [ ] `workflow_statuses` hỗ trợ: `name`, `slug`, `color`, `order`, `category` (`todo`, `in_progress`, `done`).
- [ ] `workflow_transitions` định nghĩa luồng cho phép từ `from_status_id` sang `to_status_id`, hỗ trợ cấu hình `rules` (JSON: role được phép, trường bắt buộc khi chuyển).
- [ ] Dự án có thể liên kết với 1 Workflow tùy chỉnh hoặc kế thừa Workflow mặc định của Workspace.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=WorkflowModelTest`
**Dependencies:** Task 9
**Files likely touched:**
- `apps/api/database/migrations/*_create_workflows_table.php`
- `apps/api/database/migrations/*_create_workflow_statuses_table.php`
- `apps/api/database/migrations/*_create_workflow_transitions_table.php`
- `apps/api/app/Models/Workflow.php`
- `apps/api/app/Models/WorkflowTransition.php`
**Estimated scope:** M (5 files)

---

### Task 11: Workflow Transition Validation Engine
**Description:** Viết `WorkflowTransitionService` để thẩm định và thực thi việc chuyển trạng thái của một Task.
**Acceptance criteria:**
- [ ] Ngăn chặn chuyển trạng thái không hợp lệ (ví dụ: từ `Mới` nhảy cóc sang `Hoàn thành` nếu chưa qua `Review`).
- [ ] Kiểm tra điều kiện ràng buộc (Permission người thực hiện, các trường bắt buộc phải điền).
- [ ] Phát sinh Domain Event `TaskStatusChangedEvent` sau khi chuyển thành công.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=WorkflowTransitionServiceTest`
**Dependencies:** Task 10
**Files likely touched:**
- `apps/api/app/Services/Workflow/WorkflowTransitionService.php`
- `apps/api/app/Events/TaskStatusChangedEvent.php`
- `apps/api/app/Exceptions/InvalidWorkflowTransitionException.php`
- `apps/api/tests/Unit/WorkflowTransitionServiceTest.php`
**Estimated scope:** S (4 files)

---

### Task 12: Project Hub & Visual Workflow Builder UI (taste-skill Standard)
**Description:** Xây dựng màn hình danh sách Dự án, Project Settings và Trình thiết kế Workflow trực quan (Status nodes & Transition lines) trên `apps/web` theo tiêu chuẩn **taste-skill**.
**Acceptance criteria:**
- [ ] Project Grid/List hiển thị gọn gàng, thẻ dự án tối giản (không bóng đổ đen, phân chia bằng đường viền tinh tế `border-zinc-200 dark:border-zinc-800`).
- [ ] Trình thiết kế Workflow trực quan: Thêm trạng thái (Category Todo/Doing/Done), kéo nối mũi tên luồng chuyển đổi trạng thái với animation mượt mà.
- [ ] Loading Skeleton khớp layout thật, Empty state hướng dẫn tạo dự án đầu tiên.
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 8, Task 11
**Files likely touched:**
- `apps/web/src/features/projects/pages/ProjectListPage.tsx`
- `apps/web/src/features/projects/components/CreateProjectModal.tsx`
- `apps/web/src/features/workflow/components/WorkflowEditor.tsx`
- `apps/web/src/features/workflow/components/StatusNode.tsx`
- `apps/web/src/features/workflow/api/workflowApi.ts`
**Estimated scope:** M (5 files)

---

### Checkpoint 3: Project & Workflow Engine Complete
- [ ] Tạo dự án mới với workflow tùy chỉnh và hệ thống kiểm duyệt transition hoạt động chuẩn xác.

---

## Phase 4: Task / Issue Management (Vertical Slice)

### Task 13: Task Data Schema & CRUD API
**Description:** Tạo Migrations, Models và API CRUD cho Tasks/Issues (`tasks` table) với đầy đủ thuộc tính Jira-like.
**Acceptance criteria:**
- [ ] Task fields: `id`, `project_id`, `task_number` (PROJ-1, PROJ-2), `title`, `description` (Markdown/JSON), `type` (`task`, `bug`, `story`, `epic`, `subtask`), `status_id`, `priority` (`low`, `medium`, `high`, `urgent`), `assignee_id`, `reporter_id`, `due_date`, `estimate_minutes`, `time_spent_minutes`, `parent_task_id`, `order`.
- [ ] Hỗ trợ phân cấp Parent Task / Sub-tasks.
- [ ] API lọc Task đa tiêu chí: theo assignee, status, priority, due date, type, search term.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=TaskApiTest`
**Dependencies:** Task 11
**Files likely touched:**
- `apps/api/database/migrations/*_create_tasks_table.php`
- `apps/api/app/Models/Task.php`
- `apps/api/app/Http/Controllers/Api/V1/TaskController.php`
- `apps/api/app/Http/Requests/Tasks/CreateTaskRequest.php`
- `apps/api/app/Http/Requests/Tasks/UpdateTaskRequest.php`
**Estimated scope:** M (5 files)

---

### Task 14: Task Checklists, Attachments & Dependencies
**Description:** Xây dựng API và CSDL cho Checklist đầu việc nhỏ, Đính kèm file (Spatie MediaLibrary), và Phụ thuộc Task (Blocks / Blocked by / Relates to).
**Acceptance criteria:**
- [ ] Checklist items có thể thêm, sửa, đánh dấu hoàn thành, sắp xếp thứ tự.
- [ ] Hỗ trợ tải lên file đính kèm với validation định dạng, dung lượng và sinh thumbnail cho hình ảnh.
- [ ] Task Dependencies ngăn chặn cycle (Task A blocks Task B -> Task B không thể block Task A).
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=TaskChecklistAndAttachmentTest`
**Dependencies:** Task 13
**Files likely touched:**
- `apps/api/database/migrations/*_create_task_checklists_and_dependencies_table.php`
- `apps/api/app/Models/TaskChecklist.php`
- `apps/api/app/Models/TaskDependency.php`
- `apps/api/app/Http/Controllers/Api/V1/TaskAttachmentController.php`
**Estimated scope:** S (4 files)

---

### Task 15: Linear-Grade Task Detail Modal & Drawer (taste-skill Standard)
**Description:** Xây dựng component Chi tiết công việc dạng Slide-over/Modal trên `apps/web` chuẩn phong cách Linear/Notion (phím tắt Esc, inline editing, Markdown editor, Phosphor icons, spring transition).
**Acceptance criteria:**
- [ ] Title và Description hỗ trợ click-to-edit và render Markdown với Typography chuẩn (`prose prose-zinc`).
- [ ] Sidebar metadata: Status, Assignee, Priority, Due Date, Estimate dạng dropdown popover tinh tế, không giật layout.
- [ ] Checklist trực quan với thanh tiến độ (Progress bar) tự động cập nhật phần trăm hoàn thành.
- [ ] Drag-and-drop file dropzone với preview thumbnail hình ảnh và kích thước file.
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 13, Task 14
**Files likely touched:**
- `apps/web/src/features/tasks/components/TaskDetailModal.tsx`
- `apps/web/src/features/tasks/components/TaskChecklistSection.tsx`
- `apps/web/src/features/tasks/components/TaskAttachmentList.tsx`
- `apps/web/src/features/tasks/components/TaskMetadataSidebar.tsx`
- `apps/web/src/features/tasks/api/taskApi.ts`
**Estimated scope:** M (5 files)

---

### Task 16: Task Activity Log & Change History
**Description:** Tích hợp `spatie/laravel-activitylog` để tự động ghi vết mọi thay đổi của Task và hiển thị Activity Timeline tab trên UI.
**Acceptance criteria:**
- [ ] Mọi thay đổi về Status, Assignee, Due Date, Title, Priority đều được ghi vào Activity Log.
- [ ] API `/api/v1/tasks/{id}/activities` trả về timeline lịch sử rõ ràng.
- [ ] Timeline hiển thị avatar thành viên, timestamp tương đối ("2 giờ trước") và badge thay đổi trực quan.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=TaskActivityLogTest`
**Dependencies:** Task 15
**Files likely touched:**
- `apps/api/app/Observers/TaskObserver.php`
- `apps/api/app/Http/Controllers/Api/V1/TaskActivityController.php`
- `apps/web/src/features/tasks/components/TaskActivityTimeline.tsx`
**Estimated scope:** S (3 files)

---

### Checkpoint 4: Task Management Vertically Verified
- [ ] Tạo, sửa, phân công, đính kèm file, checklist và tra cứu lịch sử thay đổi của Task hoạt động trơn tru từ Backend đến Frontend.

---

## Phase 5: Agile Views — Kanban Board, List & Backlog / Sprint

### Task 17: Sprint & Epic Management API
**Description:** Xây dựng Migrations, Models và API cho `sprints` (Scrum lifecycle: Planned, Active, Closed) và `epics`.
**Acceptance criteria:**
- [ ] Quản lý Sprint: `name`, `goal`, `start_date`, `end_date`, `status` (`future`, `active`, `completed`).
- [ ] Action Start Sprint (chỉ 1 active sprint tại một thời điểm cho mỗi project board) và Complete Sprint (chuyển task dở dang sang sprint mới hoặc backlog).
- [ ] Gán Task vào Epic hoặc Sprint.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=SprintApiTest`
**Dependencies:** Task 13
**Files likely touched:**
- `apps/api/database/migrations/*_create_sprints_and_epics_table.php`
- `apps/api/app/Models/Sprint.php`
- `apps/api/app/Models/Epic.php`
- `apps/api/app/Http/Controllers/Api/V1/SprintController.php`
**Estimated scope:** S (4 files)

---

### Task 18: High-Performance Kanban Board (taste-skill Standard)
**Description:** Xây dựng Bảng Kanban với `@dnd-kit` và `motion/react` layout transitions, hiển thị thẻ Task tối giản, cảnh báo WIP limit tinh tế và bộ lọc thành viên nhanh.
**Acceptance criteria:**
- [ ] Kéo-thả thẻ task giữa các cột mượt mà ở 60fps; kích hoạt API cập nhật status và tự động rollback vị trí nếu transition bị từ chối.
- [ ] Thẻ Task hiển thị: Key (PROJ-12), Title, Priority icon (`@phosphor-icons/react`), Assignee avatar nhỏ gọn, Subtask/Checklist progress badge.
- [ ] Cảnh báo cột vượt WIP Limit bằng viền màu hổ phách/đỏ tinh tế, không làm vỡ bố cục cột.
- [ ] Thanh công cụ lọc: Lọc tức thì theo Assignee (avatar pills), Priority, Label và ô tìm kiếm nhanh (phím `/`).
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 11, Task 15
**Files likely touched:**
- `apps/web/src/features/board/pages/KanbanBoardPage.tsx`
- `apps/web/src/features/board/components/KanbanColumn.tsx`
- `apps/web/src/features/board/components/KanbanCard.tsx`
- `apps/web/src/features/board/components/BoardFilterBar.tsx`
- `apps/web/src/features/board/hooks/useKanbanDragAndDrop.ts`
**Estimated scope:** M (5 files)

---

### Task 19: Backlog & Sprint Planning View (taste-skill Standard)
**Description:** Xây dựng màn hình Backlog & Kế hoạch Sprint kiểu Jira hiện đại trên `apps/web`, hỗ trợ kéo task giữa Backlog và Sprint containers, tạo task inline tốc độ cao.
**Acceptance criteria:**
- [ ] Danh sách Backlog hiển thị dạng hàng cô đọng (Compact row), tạo task mới trực tiếp bằng phím `Enter` không cần mở modal.
- [ ] Kéo thả task từ Backlog vào Sprint container; hiển thị tổng Story points và số task trong Sprint.
- [ ] Modal Start Sprint và Complete Sprint chỉn chu với thống kê hoàn thành.
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 17, Task 18
**Files likely touched:**
- `apps/web/src/features/backlog/pages/BacklogPage.tsx`
- `apps/web/src/features/backlog/components/SprintSection.tsx`
- `apps/web/src/features/backlog/components/BacklogList.tsx`
- `apps/web/src/features/backlog/components/StartSprintModal.tsx`
**Estimated scope:** M (4-5 files)

---

### Task 20: High-Density Table / List View (taste-skill Standard)
**Description:** Xây dựng màn hình List View dạng bảng dữ liệu mật độ cao (High-density table), hỗ trợ inline editing, phân nhóm (Group by Status/Assignee) và phím tắt điều hướng.
**Acceptance criteria:**
- [ ] Chỉnh sửa trực tiếp Status, Assignee, Priority, Due Date trên từng ô của bảng không cần mở modal.
- [ ] Phân nhóm (Group by Status, Priority, Assignee) với khả năng thu gọn/mở rộng nhóm mượt mà.
- [ ] Lưu bộ lọc cá nhân (Saved Views) và chuyển đổi nhanh giữa các view (My Tasks, Overdue, High Priority).
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 15
**Files likely touched:**
- `apps/web/src/features/task-list/pages/TaskListViewPage.tsx`
- `apps/web/src/features/task-list/components/TaskDataTable.tsx`
- `apps/web/src/features/task-list/components/InlineEditCell.tsx`
- `apps/web/src/features/task-list/components/SavedViewsDropdown.tsx`
**Estimated scope:** S (4 files)

---

### Checkpoint 5: Agile Project Views Fully Operable
- [ ] Đội ngũ có thể quản lý Backlog, chạy Sprint, và điều phối công việc hàng ngày trên Kanban Board hoặc List View.

---

## Phase 6: Timeline / Gantt, Calendar & Time Tracking

### Task 21: Calendar View for Deadlines & Milestones (taste-skill Standard)
**Description:** Xây dựng màn hình Lịch (Tháng / Tuần / Ngày) hiển thị các task theo Due Date, cho phép kéo thả để dời hạn chót công việc.
**Acceptance criteria:**
- [ ] Hiển thị task trên ô lịch với màu sắc theo Status/Priority.
- [ ] Kéo thả task sang ngày khác tự động cập nhật `due_date` qua API.
- [ ] Modal tạo task nhanh khi click vào một ngày bất kỳ trên lịch.
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 15
**Files likely touched:**
- `apps/web/src/features/calendar/pages/ProjectCalendarPage.tsx`
- `apps/web/src/features/calendar/components/MonthCalendarGrid.tsx`
- `apps/web/src/features/calendar/components/CalendarTaskCard.tsx`
**Estimated scope:** S (3 files)

---

### Task 22: Interactive Gantt / Timeline View (taste-skill Standard)
**Description:** Xây dựng biểu đồ Gantt hiển thị tiến độ dự án theo dòng thời gian, vẽ đường liên kết phụ thuộc (Task Dependencies) và kéo dài/rút ngắn thời lượng task.
**Acceptance criteria:**
- [ ] Biểu đồ Timeline hiển thị thanh tiến độ task theo `start_date` -> `due_date`.
- [ ] Kéo mép thanh để thay đổi thời lượng (resize) hoặc kéo cả thanh để tịnh tiến thời gian.
- [ ] Vẽ đường nối mũi tên thể hiện quan hệ phụ thuộc (Blocks/Blocked by).
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 14, Task 21
**Files likely touched:**
- `apps/web/src/features/gantt/pages/ProjectGanttPage.tsx`
- `apps/web/src/features/gantt/components/GanttTimelineChart.tsx`
- `apps/web/src/features/gantt/components/GanttDependencyLinks.tsx`
**Estimated scope:** M (3-4 files)

---

### Task 23: Time Tracking Engine & Worklogs
**Description:** Xây dựng tính năng Ghi nhận thời gian làm việc (`time_logs` table), bao gồm đồng hồ bấm giờ (Global Timer widget) và nhập log thời gian thủ công.
**Acceptance criteria:**
- [ ] Timer Widget chạy nền ở góc màn hình, có nút Start/Pause/Stop và tự động lưu worklog khi dừng.
- [ ] Modal nhập thủ công thời gian (Số giờ, Ngày làm, Ghi chú công việc).
- [ ] Báo cáo tổng thời gian đã làm vs. Ước lượng ban đầu trên Task Modal và Project Summary.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=TimeLogTest`
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 15
**Files likely touched:**
- `apps/api/database/migrations/*_create_time_logs_table.php`
- `apps/api/app/Models/TimeLog.php`
- `apps/api/app/Http/Controllers/Api/V1/TimeLogController.php`
- `apps/web/src/features/time-tracking/components/GlobalTimerWidget.tsx`
- `apps/web/src/features/time-tracking/components/LogWorkModal.tsx`
**Estimated scope:** M (5 files)

---

### Checkpoint 6: Planning, Scheduling & Time Logs Ready
- [ ] Xem hạn chót trên Lịch, theo dõi tiến độ phụ thuộc trên Gantt và kiểm soát thời gian làm việc chính xác.

---

## Phase 7: Collaboration, Comments & Notification System

### Task 24: Task Comment System with Markdown & @Mentions (taste-skill Standard)
**Description:** Xây dựng hệ thống Bình luận trong Task hỗ trợ Markdown, Upload ảnh/file, Emoji Reactions, và Gắn thẻ người dùng (`@username`).
**Acceptance criteria:**
- [ ] API CRUD bình luận kèm chính sách phân quyền (chỉ tác giả hoặc admin được sửa/xóa).
- [ ] Rich text / Markdown editor hỗ trợ popup gợi ý danh sách thành viên khi gõ `@`.
- [ ] Gắn thẻ thành viên sẽ tự động kích hoạt sự kiện `UserMentionedInCommentEvent`.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=CommentApiTest`
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 15
**Files likely touched:**
- `apps/api/database/migrations/*_create_comments_table.php`
- `apps/api/app/Models/Comment.php`
- `apps/api/app/Http/Controllers/Api/V1/CommentController.php`
- `apps/web/src/features/comments/components/CommentSection.tsx`
- `apps/web/src/features/comments/components/CommentInput.tsx`
**Estimated scope:** M (5 files)

---

### Task 25: In-App Notifications & Realtime Broadcasting
**Description:** Tích hợp Laravel Notifications và Laravel Reverb để đẩy thông báo realtime tới người dùng khi được giao task, được mention, hoặc khi task cập nhật.
**Acceptance criteria:**
- [ ] Lưu notification vào CSDL (`notifications` table) và broadcast qua WebSocket channel riêng của user.
- [ ] Chuông thông báo trên Header của `apps/web` hiển thị số badge chưa đọc và popup danh sách thông báo.
- [ ] Đánh dấu đã đọc đơn lẻ hoặc tất cả thông báo.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=NotificationTest`
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 24
**Files likely touched:**
- `apps/api/app/Notifications/TaskAssignedNotification.php`
- `apps/api/app/Notifications/TaskCommentMentionNotification.php`
- `apps/api/app/Http/Controllers/Api/V1/NotificationController.php`
- `apps/web/src/features/notifications/components/NotificationBell.tsx`
- `apps/web/src/features/notifications/hooks/useRealtimeNotifications.ts`
**Estimated scope:** M (5 files)

---

### Task 26: External Alert Integrations (Slack / Telegram / Email)
**Description:** Xây dựng bộ gửi thông báo ra kênh ngoài (Webhook Slack, Telegram Bot, Email Digest) dựa trên cấu hình Notification Settings của từng người dùng và dự án.
**Acceptance criteria:**
- [ ] Cấu hình Webhook URL trong Project Settings để tự động bắn tin nhắn vào Slack/Telegram khi có task mới hoặc task trễ hạn.
- [ ] Email gửi qua Laravel Queue với giao diện HTML template chỉn chu, có link truy cập trực tiếp vào task.
- [ ] Trang Cài đặt thông báo (Notification Preferences) cho phép bật/tắt từng loại tin nhắn.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=WebhookIntegrationTest`
**Dependencies:** Task 25
**Files likely touched:**
- `apps/api/app/Services/Integrations/SlackWebhookService.php`
- `apps/api/app/Services/Integrations/TelegramBotService.php`
- `apps/api/app/Mail/TaskDigestMail.php`
- `apps/web/src/features/settings/pages/NotificationSettingsPage.tsx`
**Estimated scope:** S (4 files)

---

### Checkpoint 7: Collaboration & Alerting Operational
- [ ] Đội ngũ thảo luận trực tiếp trên task và nhận thông báo tức thì qua app, email hoặc kênh chat công ty.

---

## Phase 8: Automation Engine & Custom Fields

### Task 27: Custom Fields Schema & Dynamic Attributes
**Description:** Xây dựng hệ thống trường tùy chỉnh cho Task (`custom_fields`, `custom_field_values`) hỗ trợ các kiểu: Text, Number, Dropdown, Date, Checkbox, User Picker.
**Acceptance criteria:**
- [ ] Định nghĩa Custom Fields ở cấp Workspace hoặc Dự án.
- [ ] Dynamic form render trên Task Modal tự động hiển thị các trường tùy chỉnh theo đúng kiểu dữ liệu và validation rules.
- [ ] Hỗ trợ tìm kiếm, lọc task theo giá trị của Custom Field.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=CustomFieldTest`
**Dependencies:** Task 13, Task 15
**Files likely touched:**
- `apps/api/database/migrations/*_create_custom_fields_table.php`
- `apps/api/app/Models/CustomField.php`
- `apps/api/app/Http/Controllers/Api/V1/CustomFieldController.php`
- `apps/web/src/features/custom-fields/components/DynamicCustomFieldsRenderer.tsx`
**Estimated scope:** S (4 files)

---

### Task 28: Automation Rules Engine (Triggers & Conditions)
**Description:** Xây dựng mô hình dữ liệu (`automation_rules`) và Listener xử lý các sự kiện hệ thống (`TaskCreated`, `TaskStatusChanged`, `TaskDueApproaching`).
**Acceptance criteria:**
- [ ] Cấu trúc Rule dạng JSON: Trigger -> Conditions (AND/OR logic) -> Actions.
- [ ] Bộ lọc điều kiện kiểm tra chính xác các thuộc tính: Status cũ/mới, Priority, Assignee, Quá hạn X ngày.
- [ ] Khả năng chạy thử nghiệm (dry-run/test rule) mà không làm thay đổi dữ liệu thật.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=AutomationRuleEngineTest`
**Dependencies:** Task 11, Task 27
**Files likely touched:**
- `apps/api/database/migrations/*_create_automation_rules_table.php`
- `apps/api/app/Models/AutomationRule.php`
- `apps/api/app/Services/Automation/AutomationRuleEvaluator.php`
- `apps/api/app/Listeners/ExecuteAutomationRulesListener.php`
**Estimated scope:** S (4 files)

---

### Task 29: Automation Actions Execution Pipeline
**Description:** Triển khai các Action tự động: Đổi Assignee (round-robin / người cụ thể), Đổi Priority, Gửi thông báo, Tạo subtask tự động, Gửi Webhook.
**Acceptance criteria:**
- [ ] Các action được thực thi bất đồng bộ qua Laravel Queue để đảm bảo tốc độ phản hồi API.
- [ ] Ghi nhật ký thực thi Automation Log (`automation_logs` table) để kiểm tra lịch sử kích hoạt và lỗi (nếu có).
- [ ] Cơ chế chống lặp vô tận (Loop protection / Max recursion depth = 3).
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=AutomationActionExecutionTest`
**Dependencies:** Task 28
**Files likely touched:**
- `apps/api/app/Services/Automation/Actions/ChangeAssigneeAction.php`
- `apps/api/app/Services/Automation/Actions/UpdateFieldAction.php`
- `apps/api/app/Services/Automation/Actions/SendWebhookAction.php`
- `apps/api/app/Jobs/ExecuteAutomationRuleJob.php`
**Estimated scope:** S (4 files)

---

### Task 30: No-code Automation Rule Builder UI (taste-skill Standard)
**Description:** Xây dựng giao diện tạo quy tắc tự động hóa "Khi [Sự kiện] - Nếu [Điều kiện] - Thì [Hành động]" trực quan trên `apps/web`.
**Acceptance criteria:**
- [ ] Giao diện dạng khối trực quan, có danh sách mẫu gợi ý (Rule templates phổ biến).
- [ ] Dropdown chọn Trigger, Condition và Action linh hoạt với validation chặt chẽ.
- [ ] Danh sách quy tắc kèm công tắc Bật/Tắt (Toggle Active) và xem Audit Log của từng quy tắc.
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 29
**Files likely touched:**
- `apps/web/src/features/automation/pages/ProjectAutomationPage.tsx`
- `apps/web/src/features/automation/components/RuleBuilderModal.tsx`
- `apps/web/src/features/automation/components/AutomationRuleCard.tsx`
- `apps/web/src/features/automation/api/automationApi.ts`
**Estimated scope:** S (4 files)

---

### Checkpoint 8: Custom Fields & Automation Active
- [ ] Hệ thống có thể tùy biến thuộc tính công việc và tự động hóa quy trình theo các điều kiện đặt trước.

---

## Phase 9: Dashboards, Reports & Filament Admin Console

### Task 31: Filament v3 Admin Console Setup & Shield Integration
**Description:** Cài đặt Laravel Filament v3 trong `apps/api`, tích hợp `filament-shield` cho Spatie Role/Permission và bảng điều khiển Quản trị viên hệ thống.
**Acceptance criteria:**
- [ ] Panel Admin `/admin` bảo mật, chỉ user có quyền `super-admin` hoặc `admin` mới truy cập được.
- [ ] Quản lý Người dùng, Tổ chức, Workspace, Roles & Permissions thông qua Filament Resources chuẩn mực.
- [ ] Tích hợp `spatie/laravel-activitylog` hiển thị Audit Trail toàn hệ thống trên Filament.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=FilamentAdminTest`
**Dependencies:** Task 7, Task 16
**Files likely touched:**
- `apps/api/app/Providers/Filament/AdminPanelProvider.php`
- `apps/api/app/Filament/Resources/UserResource.php`
- `apps/api/app/Filament/Resources/OrganizationResource.php`
- `apps/api/app/Filament/Resources/ActivityLogResource.php`
**Estimated scope:** S (4 files)

---

### Task 32: Filament Admin Workflow & Global Settings Resources
**Description:** Xây dựng Filament Resources để Admin quản lý Workflow templates, Project templates, Nhãn mặc định, và cấu hình Sao lưu/Khôi phục (`spatie/laravel-backup`).
**Acceptance criteria:**
- [ ] Tạo và chỉnh sửa các bộ Workflow mẫu toàn công ty qua giao diện Filament.
- [ ] Trang quản trị Sao lưu dữ liệu (Manual backup trigger & download backup zip file).
- [ ] Filament Dashboard Widgets thống kê tổng số User, Dự án, Task theo thời gian thực.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=FilamentWorkflowResourceTest`
**Dependencies:** Task 31
**Files likely touched:**
- `apps/api/app/Filament/Resources/WorkflowTemplateResource.php`
- `apps/api/app/Filament/Pages/ManageBackups.php`
- `apps/api/app/Filament/Widgets/SystemOverviewWidget.php`
**Estimated scope:** S (3 files)

---

### Task 33: Project & Team Analytics API
**Description:** Viết các API thống kê báo cáo: Tỷ lệ hoàn thành dự án, Phân bổ công việc theo nhân sự (Workload), Burndown Chart (Scrum), Velocity Chart, và Task trễ hạn.
**Acceptance criteria:**
- [ ] API tính toán điểm số Story Points / Giờ làm đã hoàn thành theo từng ngày trong Sprint (dữ liệu cho Burndown chart).
- [ ] API Workload tổng hợp số lượng task và tổng giờ ước tính đang gán cho từng thành viên.
- [ ] Cache kết quả thống kê bằng Redis để tối ưu tốc độ tải báo cáo.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=AnalyticsApiTest`
**Dependencies:** Task 17, Task 23
**Files likely touched:**
- `apps/api/app/Services/Analytics/ProjectAnalyticsService.php`
- `apps/api/app/Http/Controllers/Api/V1/AnalyticsController.php`
- `apps/api/tests/Feature/AnalyticsApiTest.php`
**Estimated scope:** S (3 files)

---

### Task 34: Client Dashboard & Visual Reports with Export (taste-skill Standard)
**Description:** Xây dựng trang Báo cáo & Dashboard tổng quan trên `apps/web` với biểu đồ tương tác (Recharts + Phosphor Icons), thống kê năng suất và nút Xuất dữ liệu Excel / PDF.
**Acceptance criteria:**
- [ ] Các widget chỉ số: Tổng task, Tỷ lệ hoàn thành %, Task trễ hạn, Phân bổ theo Priority/Status đạt chuẩn tương phản và không dùng card elevation giả tạo.
- [ ] Biểu đồ Burndown chart trực quan cho Sprint hiện tại và biểu đồ Phân bổ nhân sự.
- [ ] Xuất báo cáo ra định dạng CSV/Excel tải về máy.
**Verification:**
- [ ] `pnpm --filter=web lint`
**Dependencies:** Task 33
**Files likely touched:**
- `apps/web/src/features/dashboard/pages/ProjectDashboardPage.tsx`
- `apps/web/src/features/dashboard/components/BurndownChartWidget.tsx`
- `apps/web/src/features/dashboard/components/WorkloadDistributionWidget.tsx`
- `apps/web/src/features/dashboard/components/ExportReportButton.tsx`
**Estimated scope:** S (4 files)

---

### Checkpoint 9: Administration & Reporting Completed
- [ ] Ban lãnh đạo và quản lý có thể theo dõi tiến độ qua biểu đồ trực quan và quản trị viên vận hành hệ thống trọn vẹn qua Filament.

---

## Phase 10: Performance Optimization, Security & Mobile Polish

### Task 35: Database Indexing, Query Optimization & Virtualization
**Description:** Rà soát N+1 queries với Laravel Telescope, bổ sung composite indexes cho CSDL và áp dụng `@tanstack/react-virtual` cho danh sách 1.000+ tasks.
**Acceptance criteria:**
- [ ] Bổ sung indexes cho: `(workspace_id, status_id)`, `(project_id, sprint_id)`, `(assignee_id, due_date)`.
- [ ] Danh sách task và board Kanban tải mượt mà với 1.000+ items mà không giật lag DOM.
- [ ] Thời gian phản hồi API trung bình dưới 150ms cho các query danh sách có phân trang.
**Verification:**
- [ ] `cd apps/api && php artisan test`
- [ ] `pnpm --filter=web build`
**Dependencies:** Task 18, Task 20
**Files likely touched:**
- `apps/api/database/migrations/*_add_performance_indexes.php`
- `apps/web/src/features/task-list/components/VirtualizedTaskList.tsx`
**Estimated scope:** S (2 files)

---

### Task 36: Security Hardening & Rate Limiting
**Description:** Cấu hình Rate Limiting (Throttle Middleware), rà soát SQL injection, XSS trong Markdown rendering, và kiểm tra CORS & Security Headers.
**Acceptance criteria:**
- [ ] Rate limiting chặt chẽ cho endpoint nhạy cảm (Auth: 5 req/min, Search: 30 req/min, API chung: 120 req/min).
- [ ] DOMPurify / Sanitization được áp dụng triệt để cho nội dung Markdown và bình luận người dùng.
- [ ] Bật CSP (Content Security Policy) và HSTS headers.
**Verification:**
- [ ] `cd apps/api && php artisan test --filter=SecurityHeadersTest`
**Dependencies:** Task 5, Task 24
**Files likely touched:**
- `apps/api/app/Http/Middleware/SecurityHeadersMiddleware.php`
- `apps/api/bootstrap/app.php`
- `apps/web/src/lib/sanitizer.ts`
**Estimated scope:** S (3 files)

---

### Task 37: Responsive Layout Polish & Mobile PWA Manifest (taste-skill Standard)
**Description:** Tối ưu hóa toàn bộ giao diện cho Tablet & Smartphone (ẩn/hiện sidebar, bottom navigation bar cho mobile, swipe gestures) và bổ sung Web App Manifest PWA theo tiêu chuẩn **taste-skill**.
**Acceptance criteria:**
- [ ] Giao diện hiển thị chuẩn xác trên mobile screen (< 768px): Xem task, cập nhật trạng thái, bình luận dễ dàng bằng ngón tay.
- [ ] Cấu hình `manifest.json` và service worker hỗ trợ cài đặt PWA lên màn hình chính điện thoại.
**Verification:**
- [ ] `pnpm --filter=web build`
- [ ] Kiểm tra responsive trên Chrome DevTools với kích thước iPhone / iPad.
**Dependencies:** Task 34, Task 36
**Files likely touched:**
- `apps/web/public/manifest.json`
- `apps/web/src/components/layout/MobileNavigation.tsx`
- `apps/web/src/components/layout/AppLayout.tsx`
**Estimated scope:** S (3 files)

---

### Checkpoint 10: Production-Ready Release
- [ ] Toàn bộ 37 nhiệm vụ hoàn thành, hệ thống hoạt động ổn định, bảo mật cao, tải mượt và sẵn sàng triển khai.
