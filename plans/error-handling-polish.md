# Plan: Error Handling Polish

> Source PRD: `docs/prds/error-handling-polish.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Add App Router `error` and `not-found` surfaces. Unknown routes use the not-found page; unexpected route failures use the global error boundary.
- **Schema**: No frontend-owned persistence schema is introduced. Optional generation failure text is read from existing project detail response attributes when present.
- **Key models**: Project detail exposes an optional generation failure message. Existing project lifecycle statuses remain `draft`, `generating`, `ready`, and `failed`.
- **Auth**: Supabase-authenticated API calls continue through the shared axios client. 401 handling continues to sign out and redirect to `/login`, honoring `skipAuthRedirectOn401`.
- **External services**: No new external services are introduced. The frontend does not call LLM providers or monitoring tools directly.
- **Server state**: TanStack Query remains responsible for project detail server state. Zustand is not used for this work.
- **Design system**: New pages and states preserve the galaxy aesthetic with glassmorphism, violet primary CTAs, red destructive failure styling, shadcn Skeleton loading states, and mobile-safe layouts.

---

## Phase 1: Route-Level Recovery Pages

**User stories**: 1-11, 31, 34

### What to build

Add branded App Router recovery pages for unexpected errors and unknown routes. The error boundary lets users retry the failed route or return to the dashboard. The not-found page gives users a polished "Lost in space" state with a floating astronaut SVG and dashboard CTA.

### Acceptance criteria

- [ ] Unexpected route errors render a galaxy-themed page with "Houston, we have a problem".
- [ ] The error page includes a reset button that calls the App Router reset callback.
- [ ] The error page includes dashboard navigation.
- [ ] Unknown routes render a "Lost in space" page.
- [ ] The not-found page includes a floating astronaut SVG.
- [ ] The not-found page includes a "Back to dashboard" CTA targeting `/dashboard`.
- [ ] Both pages are keyboard-accessible and fit at 375px width.

---

## Phase 2: Generation Failure Data Contract

**User stories**: 14-15, 26-28, 33

### What to build

Extend the project detail data boundary to expose an optional generation failure message without requiring backend changes. The normalizer should defensively accept snake_case or camelCase attributes and keep generic fallback behavior when no failure text is present.

### Acceptance criteria

- [ ] Project detail includes an optional generation failure message field.
- [ ] The normalizer reads snake_case generation failure attributes when present.
- [ ] The normalizer reads camelCase generation failure attributes when present.
- [ ] Missing generation failure metadata remains valid.
- [ ] Focused normalizer tests cover failure metadata.

---

## Phase 3: Project Failed-State Polish

**User stories**: 12-18, 29-30

### What to build

Polish the failed generation state on the project detail page. Preserve project header context, render a red glassmorphic failure card with the best available error message, and route Retry through the existing generation mutation while respecting pending-state protections.

### Acceptance criteria

- [ ] Failed projects show a red glassmorphic card after the project header.
- [ ] The failed card displays backend-provided failure text when available.
- [ ] The failed card displays generic fallback copy when no failure text is available.
- [ ] Retry uses the same generation flow as Generate Tickets.
- [ ] Retry is disabled while generation is pending.
- [ ] Page/content loading states use shadcn Skeleton; button-level pending states keep stable spinner treatment.

---

## Phase 4: Centralized API Error Toasts

**User stories**: 19-25

### What to build

Add browser-only network failure feedback to the shared axios response interceptor. Preserve existing 401 sign-out redirect behavior, keep the opt-out flag working, and show destructive toasts for backend 5xx and response-less network failures.

### Acceptance criteria

- [ ] 401 responses sign out through Supabase and redirect to `/login`.
- [ ] `skipAuthRedirectOn401` still suppresses the 401 redirect path.
- [ ] 5xx responses show `Server error, try again`.
- [ ] Network errors without a response show a destructive connection toast.
- [ ] Toast and redirect side effects only run in the browser.
- [ ] Feature modules do not duplicate centralized network handling.

---

## Phase 5: Loading-State Audit And QA

**User stories**: 5-6, 22-23, 29-30, 34

### What to build

Run the required frontend QA and polish pass. Audit relevant loading states, verify responsive layouts, check recovery flows, and run repository verification commands.

### Acceptance criteria

- [ ] Existing page/content loading states use shadcn Skeleton.
- [ ] Button pending states remain stable and readable.
- [ ] Desktop visual check passes for new error and not-found pages.
- [ ] 375px mobile visual check passes for new error and not-found pages.
- [ ] Focused tests pass.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Any verification that cannot be completed is documented.
