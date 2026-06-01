# Plan: Dashboard Project List

> Source PRD: `docs/prds/dashboard-project-list.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/dashboard` remains the protected project-list route. Project title links navigate to `/projects/:id`.
- **Schema**: No frontend-owned persistence schema is introduced. Project data is owned by the Rails backend.
- **Key models**: The frontend `Project` model includes `id`, `name`, `description`, `llmProvider`, `status`, `ticketCount`, `createdAt`, `updatedAt`, `githubRepoFullName`, and `llmModel`.
- **Auth**: The existing Supabase-authenticated app shell and shared API client remain the auth boundary. Project calls rely on bearer-token attachment already handled by the API client.
- **External services**: `GET /projects` fetches dashboard projects. `DELETE /projects/:id` deletes a project after confirmation.
- **Server state**: TanStack Query owns project server state with query key `["projects"]`; Zustand is not used for project data.
- **Design system**: Dashboard surfaces preserve the galaxy aesthetic with glassmorphism, violet glow, Space Grotesk-style heading treatment, and responsive one-column mobile / three-column desktop layout.

---

## Phase 1: Project Data Contract And Query Boundary

**User stories**: 1, 2, 31-35

### What to build

Create the shared project model and query/mutation boundary for the dashboard. Fetch projects through the authenticated API client, normalize Rails-style snake_case responses to camelCase, and expose project list/delete hooks through TanStack Query.

### Acceptance criteria

- [ ] The frontend has a shared `Project` type with the required dashboard and project-detail fields.
- [ ] Project fetch uses `GET /projects` through the shared API client.
- [ ] Project delete uses `DELETE /projects/:id` through the shared API client.
- [ ] The project list query uses `["projects"]`.
- [ ] Components consume camelCase project fields even when the API returns snake_case.
- [ ] Project server state is not stored in Zustand.

---

## Phase 2: Dashboard States And Project Grid

**User stories**: 3-22, 28-30, 36

### What to build

Replace the placeholder dashboard with a client dashboard surface that includes the page header, New Project action, placeholder New Project dialog, loading skeletons, error/retry state, empty state, and populated project grid.

### Acceptance criteria

- [ ] The existing protected app nav remains the only top navigation.
- [ ] The dashboard header shows a top-right "New Project" button on desktop and a usable mobile layout.
- [ ] The New Project button opens a project-scoped placeholder dialog with no fake form fields.
- [ ] Loading state renders skeleton cards matching the project card grid.
- [ ] Error state renders a glassmorphic retry surface.
- [ ] Empty state renders a centered glassmorphic card with violet star icon, "Forge your first project", and CTA opening the same dialog.
- [ ] Populated state renders a strict one-column mobile and three-column desktop grid.
- [ ] Project cards show name, two-line description, provider badge, status badge, and ticket count.
- [ ] Groq badge is violet and Ollama badge is cyan.
- [ ] Generating status is violet with pulse.

---

## Phase 3: Project Card Actions And Safe Delete

**User stories**: 16-18, 23-27

### What to build

Add accessible project navigation and safe deletion to each project card. The card title links to the project detail route. Delete is a separate action that opens a confirmation dialog, then optimistically removes the project and rolls back if the API fails.

### Acceptance criteria

- [ ] Project card titles link to `/projects/:id`.
- [ ] The entire card is not wrapped in a link.
- [ ] Delete action is keyboard-accessible and has an accessible name containing the project name.
- [ ] Delete opens a confirmation dialog before mutation.
- [ ] Confirmed delete removes the project optimistically.
- [ ] Successful delete shows `Project deleted`.
- [ ] Failed delete restores the project and shows `Couldn't delete project. Try again.`
- [ ] Card hover uses subtle violet glow without causing layout shift.

---

## Phase 4: Responsive, Accessibility, And Verification Pass

**User stories**: All, with emphasis on 17, 29, 30

### What to build

Run the frontend QA pass. Verify layout, keyboard affordances, async states, mutation rollback behavior where practical, lint/build, and browser rendering at desktop and 375px mobile widths.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Desktop browser check shows the dashboard grid and dialogs render coherently.
- [ ] 375px mobile browser check shows no overflow or overlapping controls.
- [ ] Loading, error, empty, populated, and delete confirmation states are accounted for.
- [ ] Backend-off or failed delete behavior is manually checked or explicitly documented if not runnable.
