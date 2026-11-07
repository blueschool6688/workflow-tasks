# Tasks — Agile project & workflow platform

pnpm + turbo monorepo. Docs/README are in Vietnamese; code and identifiers in English.
Hierarchy: Organization → Workspace → Project → Epic → Sprint → Task/Subtask.

## Layout

- `apps/api` — Laravel 13 (PHP 8.3+), Filament v5 admin, Passport 13 (OAuth2/JWT, scopes), Spatie Permission + Shield, Reverb WebSockets, Spatie Activitylog, Scramble (OpenAPI). PostgreSQL in dev/prod, SQLite in tests.
- `apps/web` — Next.js 15 (App Router, Turbopack), React 19, Ant Design 5, Tailwind 3, TanStack Query, Zustand, dnd-kit, Laravel Echo. Organised by feature in `src/features/*` (board, backlog, chat, workflow, ...); shared UI in `src/components`.
- `packages/api-types` (generated API types), `packages/ui`, `packages/config` — shared workspaces.
- `tasks/` — plan/todo notes for in-flight work. `.agents/` — agent rules, skills, workflows.

## Commands

- Root: `pnpm dev`, `pnpm build`, `pnpm lint` (turbo). `pnpm generate:types` regenerates `@tasks/api-types` from the API.
- API (`apps/api`): `composer dev` (runs `php artisan dev`), `composer setup`; PHPUnit tests in `apps/api/tests` (Feature/Unit).
- Web (`apps/web`): `pnpm dev` (port 3000), `pnpm lint`.
- No `test` or `typecheck` script exists in the JS workspaces; the pre-commit hook only runs lint-staged (Prettier).

## Conventions

- Real-time: no polling. Stores subscribe to Echo channels `project.{id}` using both UUID and project key (see `routes/channels.php`).
- Auth is Passport tokens; respect scopes (`read:tasks`, `write:tasks`, `read:chat`, ...) on new endpoints.
- Changing API shapes: regenerate `@tasks/api-types` rather than hand-editing types.
- Prettier config at root (double quotes, 80 cols, es5 trailing commas).

## Boundaries

- Never commit `.env` or secrets.
- Ask before changing DB schema or auth/permission logic.
- A PreToolUse hook (`.claude/hooks/block-dangerous-git.sh`) blocks pushes, hard resets, forced cleans, `branch -D`, and `checkout .`/`restore .`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (blueschool6688/workflow-tasks), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
