# Plan: Project Detail Ticket Board

> Source PRD: `docs/prds/project-detail-ticket-board.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: The authenticated project workspace lives at `/projects/:id`. Project generation uses `POST /projects/:id/generate`; ticket status updates use `PATCH /tickets/:id`.
- **Schema**: No frontend-owned persistence schema is introduced. Project, phase, and ticket persistence is owned by the Rails backend.
- **Key models**: Project lifecycle statuses are `draft`, `generating`, `ready`, and `failed`. Ticket statuses are `pending`, `in_progress`, and `done`. Ticket repos are `frontend`, `backend`, `fullstack`, and `devops`.
- **Auth**: Supabase-authenticated API calls continue through the shared API client, including centralized bearer-token attachment and 401 handling.
- **External services**: The frontend does not call LLM providers directly. Generation is owned by the backend project generation endpoint.
- **Server state**: TanStack Query owns project board reads and mutations. Zustand is not used for project, phase, or ticket server data.
- **Design system**: The page preserves the galaxy aesthetic with glassmorphism, violet glow on primary CTAs, Space Grotesk headings, shadcn primitives, and mobile-safe layouts.

---

## Phase 1: Board Data Contract

**User stories**: 1-8, 50-56

### What to build

Create the project board data boundary. Fetch project detail through the authenticated API client, normalize the JSON:API graph into project metadata with ordered phases and tickets, handle empty boards, and expose reusable query keys and mutation contracts for later slices.

### Acceptance criteria

- [ ] Project detail uses `GET /projects/:id` through the shared API client.
- [ ] The normalizer handles JSON:API `data`, `relationships`, and `included`.
- [ ] The normalizer tolerates `included: []` and returns an empty phase list.
- [ ] The same normalizer can process the generation response shape.
- [ ] Phase and ticket ordering is stable using API order with `position` fallback.
- [ ] Query keys are tuple-style and compatible with existing TanStack Query patterns.
- [ ] No project board server state is stored in Zustand.

---

## Phase 2: Draft And Generation Flow

**User stories**: 10-19

### What to build

Render the draft/no-phase project state with an editable description textarea and large centered Generate Tickets CTA. Save refined descriptions before generation, call the generation endpoint, prevent duplicate requests, and show the full-screen generation overlay with animated starfield and cycling copy.

### Acceptance criteria

- [ ] Draft projects show the Generate Tickets experience.
- [ ] Projects with no phases show the Generate Tickets experience.
- [ ] The textarea is prefilled from the loaded project description.
- [ ] Changed description text is saved before generation.
- [ ] Generation calls `POST /projects/:id/generate`.
- [ ] Duplicate generation clicks are prevented while pending.
- [ ] The overlay appears during generation mutation.
- [ ] The overlay cycles through the four required status messages.

---

## Phase 3: Generating Polling And Failure States

**User stories**: 20-22, 42-45

### What to build

Complete lifecycle handling around asynchronous generation. Poll the project detail endpoint every 3 seconds while a project is generating, stop when it becomes ready or failed, and provide clear failure, load error, retry, and missing-project states.

### Acceptance criteria

- [ ] The project detail query polls every 3 seconds only while status is `generating`.
- [ ] Polling stops when status is `ready`.
- [ ] Polling stops when status is `failed`.
- [ ] The overlay appears while loaded project status is `generating`.
- [ ] Failed projects render a red glassmorphic card.
- [ ] Retry on a failed project starts the same generation flow.
- [ ] Initial load errors expose retry and dashboard navigation paths.

---

## Phase 4: Ready Phase Accordion

**User stories**: 23-29

### What to build

Render ready projects as a shadcn Accordion. Phase 1 opens by default, later phases start collapsed, and each phase header exposes phase number, title, and ticket count. The board remains readable and stacked across desktop and mobile widths.

### Acceptance criteria

- [ ] Ready projects with phases render an accordion board.
- [ ] Phase 1 is expanded by default.
- [ ] Later phases are collapsed by default.
- [ ] Phase headers show phase number, title, and ticket count.
- [ ] Tickets render in their phase order.
- [ ] The accordion remains keyboard-accessible through the shadcn primitive.
- [ ] The board layout does not overflow at 375px width.

---

## Phase 5: TicketCard Interactions

**User stories**: 30-41, 46-49

### What to build

Build the TicketCard interaction surface inside each phase. Cards include repo badges, title, three-line body preview with expand/collapse, copy-to-clipboard with toast feedback, status dropdown backed by `PATCH /tickets/:id`, failure reconciliation, and done styling.

### Acceptance criteria

- [ ] Repo badges use the established frontend, backend, fullstack, and devops color mapping.
- [ ] Ticket titles use bold heading typography.
- [ ] Ticket bodies are clamped to 3 lines by default.
- [ ] Show more and Show less toggle full body visibility.
- [ ] Copy copies the full body and shows `Copied to clipboard`.
- [ ] Status dropdown options are Pending, In Progress, and Done.
- [ ] Status changes call `PATCH /tickets/:id` with `{ ticket: { status } }`.
- [ ] Status updates feel immediate and reconcile on failure.
- [ ] Done tickets render at 50% opacity with strikethrough title.
- [ ] Controls have accessible names and remain usable on mobile.

---

## Phase 6: QA And Polish

**User stories**: All project detail stories

### What to build

Run the frontend QA pass. Verify loading, empty, error, generating, ready, failed, and mutation states; check desktop/mobile layout; confirm keyboard accessibility basics; and run repository verification commands.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Desktop browser check shows the page renders coherently.
- [ ] 375px mobile browser check shows no overflow or overlapping controls.
- [ ] Loading, empty, error, generating, failed, and ready states are accounted for.
- [ ] Keyboard-accessible controls and accessible names are reviewed.
- [ ] Any verification that cannot be completed is documented.
