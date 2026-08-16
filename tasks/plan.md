# Implementation Plan: Enterprise Project, Task & Workflow Management System (Jira / Base.vn style)

## Overview
Xây dựng hệ thống quản lý dự án, công việc và quy trình làm việc (workflow) đa tổ chức/workspace theo mô hình Monorepo. Hệ thống gồm backend Laravel (kèm Filament Admin Console cho quản trị toàn diện) và frontend client giàu tính năng (Board Kanban, Backlog, Sprint, Gantt/Timeline, Calendar, Dashboard, Automation, Time Tracking) sử dụng React/Next.js với TypeScript, đồng bộ OpenAPI type và áp dụng tiêu chuẩn thẩm mỹ **taste-skill** (`design-taste-frontend` / `minimalist-ui` phong cách Linear/Notion cao cấp).

---

## Architecture Decisions

1. **Monorepo Architecture:**
   - Cấu trúc: `apps/api` (Laravel 11, Filament v3, Sanctum, Spatie Permission, Spatie ActivityLog, Scramble OpenAPI), `apps/web` (React/Next.js Client, TailwindCSS v4, dnd-kit, TanStack Query, Zustand, Motion), `packages/api-types` (sinh tự động từ OpenAPI), `packages/ui` (Shared UI components/design tokens), `packages/config` (ESLint/Prettier/TSConfigs).
   - Quản lý JS/TS bằng `pnpm workspaces` + `Turborepo`; quản lý PHP backend bằng `Composer`.

2. **Frontend UI Standard with taste-skill (`design-taste-frontend`):**
   - **Design Read:** Enterprise Work & Project Management tool (phong cách Linear + Notion + Jira Modern), tối ưu mật độ dữ liệu, trực quan và chuyên nghiệp.
   - **The Three Dials:** `DESIGN_VARIANCE: 6` (Cấu trúc ngay ngắn, rõ ràng) | `MOTION_INTENSITY: 4` (Chuyển động nhẹ nhàng, có mục đích rõ ràng, zero-jank) | `VISUAL_DENSITY: 7` (Tối ưu không gian hiển thị danh sách task, board và timeline mà không bị chật chội).
   - **Typography & Color:** Phông chữ `Geist` / `Inter` + `Geist Mono` cho code/ID; bảng màu trung tính Zinc/Slate với **duy nhất 1 màu nhấn (Accent Color)** nhất quán toàn trang (Indigo/Electric Blue), tuyệt đối không dùng gradient AI tím generic, bóng đổ đen gắt hay card rập khuôn.
   - **Icons & Motion:** Sử dụng `@phosphor-icons/react` hoặc `@radix-ui/react-icons` đồng nhất `strokeWidth`; hiệu ứng chuyển động dùng `motion/react` (Spring physics, layout transitions, layoutId khi kéo thả hoặc đổi view) và luôn tuân thủ `prefers-reduced-motion`.
   - **Anti-Slop Guidelines:** Không dùng placeholder giả, không lặp layout zig-zag sáo rỗng, đầy đủ 4 trạng thái tương tác (Loading Skeleton, Empty State có định hướng, Error contextual, Active tactile feedback).

3. **Database & Multi-tenancy / Multi-workspace:**
   - PostgreSQL làm CSDL quan hệ chính; Redis cho Cache, Queue worker và Realtime Broadcasting (Laravel Reverb).
   - Kiến trúc Workspace Scoping: Mọi bảng dữ liệu (Project, Task, Workflow, Custom Field...) đều thuộc về `workspace_id` và `org_id` với Global Scopes & Policies chặt chẽ.

4. **Configurable Dynamic Workflow Engine:**
   - Bảng `workflows`, `workflow_statuses` (category: `todo`, `in_progress`, `done`), và `workflow_transitions` (kèm `allowed_roles`, `required_fields`, `conditions`, `post_actions`).
   - Task status transitions được kiểm soát qua `WorkflowTransitionService` độc lập.

5. **Automation Engine (No-code rule runner):**
   - Event-driven architecture thông qua Laravel Events & Listeners (`TaskStatusChanged`, `TaskDueApproaching`, `TaskCreated`).
   - `AutomationRuleEngine` khớp conditions (JSON-based schema) và thực thi actions (reassign, notify, update priority, webhook).

6. **Type Safety & Contracts:**
   - Backend sinh OpenAPI spec qua `dedoc/scramble` hoặc `laravel-openapi`.
   - `packages/api-types` sinh TypeScript interfaces tự động qua `openapi-typescript` cho `apps/web`.

7. **Admin Console vs. Client App:**
   - Quản trị viên sử dụng **Laravel Filament v3** trong `apps/api` (quản lý user, role/permissions Spatie Shield, workflow templates, custom fields, audit log, backup).
   - Người dùng cuối sử dụng **Client Web App** (`apps/web`) áp dụng **taste-skill** để mang lại trải nghiệm Linear/Notion-grade mượt mà và trực quan.

---

## Phased Implementation Roadmap

### Phase 1: Monorepo Foundation & Workspace Scaffolding
- **Task 1:** Monorepo Workspace Setup (`pnpm-workspace.yaml`, `turbo.json`, `package.json`, root tooling)
- **Task 2:** Laravel API Project Scaffolding in `apps/api` with PostgreSQL & Redis Docker setup
- **Task 3:** Frontend App & Design System Foundation in `apps/web` (áp dụng **taste-skill** `design-taste-frontend`, Geist font, Tailwind, Phosphor Icons)
- **Task 4:** OpenAPI Spec Generator & `packages/api-types` generation pipeline
- *Checkpoint: Foundation passes lint, builds, and type-checks.*

### Phase 2: Authentication, Organization & Role-Based Access Control (RBAC)
- **Task 5:** Auth & Token System with Laravel Sanctum (Register, Login, 2FA readiness, Me endpoint)
- **Task 6:** Multi-tenant Organization & Workspace Data Models & Migrations
- **Task 7:** Spatie Permission & Project-Level Membership RBAC Policies
- **Task 8:** Client Auth & Workspace Switcher UI Shell (áp dụng **taste-skill** cho Layout Sidebar, Breadcrumb & Switcher)
- *Checkpoint: Users can register, log in, switch workspaces, and access authorized scopes.*

### Phase 3: Dynamic Workflow Engine & Project Core
- **Task 9:** Project Schema, CRUD API & Project Membership Management
- **Task 10:** Configurable Workflow Data Models (`Workflow`, `WorkflowStatus`, `WorkflowTransition`)
- **Task 11:** Workflow Transition Engine & Validation Service
- **Task 12:** Project Settings & Visual Workflow Builder UI (áp dụng **taste-skill** cho Node & Status Connection Graph)
- *Checkpoint: Projects can be created with customized workflow status graphs and enforced transition rules.*

### Phase 4: Task / Issue Management (Vertical Slice)
- **Task 13:** Task / Issue Schema, Parent/Sub-task relations & API Endpoints
- **Task 14:** Task Checklist, Attachments (Spatie MediaLibrary), & Task Dependencies
- **Task 15:** Task Detail Modal / Slide-over with Markdown Description & Metadata Controls (áp dụng **taste-skill** Linear-style)
- **Task 16:** Task Activity Log (Spatie ActivityLog integration) & Change History Timeline UI
- *Checkpoint: Complete Task creation, hierarchy, checklists, file attachments, and audit tracking.*

### Phase 5: Agile Views — Kanban Board, List & Backlog / Sprint
- **Task 17:** Agile Sprint & Epic Schema, CRUD API & Sprint Lifecycle
- **Task 18:** Kanban Board View with Drag-and-Drop (`dnd-kit` + `motion/react`), WIP Limits & Realtime Status (**taste-skill**)
- **Task 19:** Backlog & Sprint Planning View with Drag-to-Sprint functionality (**taste-skill**)
- **Task 20:** Table / List View with Fast Sorting, Filtering, and Inline Status Editing (**taste-skill** high-density data grid)
- *Checkpoint: Full Agile workflow — Backlog planning, Sprint management, and interactive Kanban board.*

### Phase 6: Timeline / Gantt, Calendar & Time Tracking
- **Task 21:** Calendar View & Deadline Scheduling UI (**taste-skill**)
- **Task 22:** Interactive Gantt / Timeline Chart with Dependency Lines & Drag Resizing (**taste-skill**)
- **Task 23:** Time Tracking Engine (Global Timer Widget + Manual worklog) & Task Estimates vs. Actuals
- *Checkpoint: Visual timeline scheduling and accurate time tracking per task and project.*

### Phase 7: Collaboration, Comments & Notification System
- **Task 24:** Task Comment System with Markdown Editor, File Attachments & @Mentions (**taste-skill** conversation thread)
- **Task 25:** In-App Notification Center & Realtime Broadcasting (Laravel Reverb / WebSockets)
- **Task 26:** Notification Preferences & External Webhooks / Slack / Email Alerts
- *Checkpoint: Realtime collaboration with notifications and rich commentary.*

### Phase 8: Automation Engine & Custom Fields
- **Task 27:** Custom Fields Schema & Dynamic Form Attributes for Tasks
- **Task 28:** Automation Rules Schema & Event Listener Triggers
- **Task 29:** Automation Condition & Action Execution Engine
- **Task 30:** No-code Automation Rule Builder UI (**taste-skill** block workflow editor)
- *Checkpoint: Flexible custom fields and automated event-condition-action workflow rules.*

### Phase 9: Dashboards, Reports & Filament Admin Console
- **Task 31:** Laravel Filament v3 Admin Console Setup with Spatie Shield & Audit Log Explorer
- **Task 32:** Filament Admin Resources for System-wide Workflows, Project Types & Global Labels
- **Task 33:** Project & Team Analytics API (Burndown, Velocity, Workload, Due dates)
- **Task 34:** Client Dashboard with Interactive Metrics, Charts (Recharts + **taste-skill**) & Export
- *Checkpoint: Comprehensive reporting for managers and full admin control via Filament.*

### Phase 10: Performance Optimization, Security & Mobile Responsiveness
- **Task 35:** Database Indexing, Query Optimization, and Virtualized Task Lists (1,000+ items)
- **Task 36:** API Rate Limiting, Sanctum Security Audit & Input Sanitization
- **Task 37:** Mobile & Tablet Responsive Polish & PWA Manifest (**taste-skill** touch interaction & bottom sheet)
- *Checkpoint: Production readiness, fast load times, and hardened security.*

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Generic/cluttered UI ("AI-slop" syndrome) | High | Áp dụng nghiêm ngặt quy chuẩn **taste-skill** (`design-taste-frontend`): Dials (6/4/7), typographic hierarchy với Geist, locked accent color, và layout discipline. |
| Complex Workflow Transition cyclic graph or deadlocks | High | Enforce transition validation on server-side state machine; validate connected status paths on workflow save. |
| API/Frontend contract divergence | High | Automated OpenAPI schema generation via Scramble + CI step to generate TypeScript types into `packages/api-types`. |
| Performance degradation with 1,000+ tasks on Kanban/Gantt | Medium | Implement windowing/virtualization (TanStack Virtual) and efficient paginated state with TanStack Query. |
| Monorepo tooling complexity across PHP and Node.js | Low | Clear separation: Turborepo / pnpm handles JS/TS packages; Composer handles Laravel. Docker Compose coordinates both. |

---

## Open Questions & Review Items
1. **SSO & 2FA Providers:** Ưu tiên hỗ trợ Google OAuth và Microsoft Entra ID trước, hay bắt đầu với Email/Password + 2FA TOTP?
2. **Realtime Driver:** Mặc định sử dụng Laravel Reverb (tích hợp sẵn, open-source) cho tính năng realtime Kanban & Notification.
3. **Database Preference:** Mặc định PostgreSQL 16 + Redis 7 cho toàn bộ cache/queue/realtime.
