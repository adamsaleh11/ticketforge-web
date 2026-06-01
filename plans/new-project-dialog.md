# Plan: New Project Dialog

> Source PRD: `docs/prds/new-project-dialog.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: The dashboard opens the New Project dialog. Successful creation navigates to `/projects/:id`.
- **Schema**: No frontend-owned persistence schema is introduced. Project creation data is owned by the Rails backend.
- **Key models**: Project creation submits `name`, `description`, `llm_provider`, and `llm_model`; provider values are `groq` and `ollama`.
- **Auth**: The existing Supabase-authenticated app shell and shared API client remain the auth boundary. Project creation relies on bearer-token attachment already handled by the API client.
- **External services**: `POST /projects` creates a project. GitHub repository search and Ollama setup are deferred integrations.
- **Server state**: TanStack Query owns project creation effects and invalidates `["projects"]`; Zustand is not used for project server data.
- **Design system**: The dialog preserves the galaxy aesthetic with glassmorphism, dark controls, violet focus rings, and mobile-safe layout.

---

## Phase 1: Creation Mutation Contract

**User stories**: 30, 31, 33-38

### What to build

Add the direct form dependencies and project creation mutation boundary. Submit creation payloads through the authenticated API client, handle either a full project response or minimal id response, invalidate the project list cache on success, and expose a typed mutation for the dialog.

### Acceptance criteria

- [ ] Direct dependencies include `react-hook-form`, `@hookform/resolvers`, and `zod`.
- [ ] Project creation uses `POST /projects` through the shared API client.
- [ ] The create payload includes `name`, `description`, `llm_provider`, and `llm_model`.
- [ ] The create payload does not include `github_repo_full_name`.
- [ ] The create mutation returns a usable project id for navigation.
- [ ] Successful creation invalidates `["projects"]`.
- [ ] Project server state is not stored in Zustand.

---

## Phase 2: Validated Dialog Form

**User stories**: 1-17, 22-24, 32, 36

### What to build

Replace the placeholder New Project dialog with a shadcn Dialog containing a validated project creation form. Include project name, description, provider selection, provider-aware model input, inline validation errors, defaults, and on-brand dark glassmorphic controls.

### Acceptance criteria

- [ ] The dialog opens from the existing dashboard entry points.
- [ ] The form uses `react-hook-form` and a `zod` resolver.
- [ ] Name is required with a minimum length of 3.
- [ ] Description is required with a minimum length of 20.
- [ ] Groq Cloud is selected by default.
- [ ] Groq model is a dropdown with the three approved model options.
- [ ] The default Groq model is `llama-3.3-70b-versatile`.
- [ ] Local Ollama changes the model field into a text input with default `llama3.1`.
- [ ] Switching providers resets the model to a valid default for the selected provider.
- [ ] Fields show labels, inline errors, accessible invalid states, violet focus rings, and dark glassmorphic backgrounds.
- [ ] The dialog fits without clipped controls at 375px width.

---

## Phase 3: Deferred Integration Placeholders

**User stories**: 18-21, 39, 40

### What to build

Add the future integration affordances without making them active. Ollama shows a small inert "Set up Ollama" affordance beside the model label. GitHub repository selection appears as a disabled "Coming in Phase 4" placeholder that does not block submission.

### Acceptance criteria

- [ ] The Ollama setup affordance appears only when Local Ollama is selected.
- [ ] The Ollama setup affordance is visibly unavailable, non-navigating, and marked disabled for assistive technology.
- [ ] The GitHub repository placeholder communicates "Coming in Phase 4".
- [ ] The GitHub placeholder is disabled and non-blocking.
- [ ] No shadcn Command combobox is installed or built in this slice.
- [ ] No GitHub repository value is submitted.

---

## Phase 4: Submit States And Failure Handling

**User stories**: 25-29

### What to build

Complete submit behavior for successful, pending, duplicate, and failed requests. Keep the dialog stable during creation, show clear progress, preserve user input on failure, and navigate after success.

### Acceptance criteria

- [ ] Submit shows a pending spinner and `Forging...` copy while creation is in progress.
- [ ] Duplicate submits are prevented while pending.
- [ ] Dialog close requests are ignored while pending.
- [ ] Failed creation keeps the dialog open and preserves form values.
- [ ] Failed creation shows `Couldn't create project. Try again.`
- [ ] Successful creation closes/resets the dialog and navigates to `/projects/:id`.

---

## Phase 5: Responsive And Accessibility Verification

**User stories**: 3, 4, 23, 24, 32 plus all submit flows

### What to build

Run the frontend QA pass. Verify form ergonomics, keyboard and screen-reader basics, desktop and mobile layout, lint/build checks, and the practical behavior of pending and error states.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Desktop browser check shows the dialog renders coherently.
- [ ] 375px mobile browser check shows no overflow or overlapping controls.
- [ ] Labels, invalid state, focus behavior, and tab order are accounted for.
- [ ] Pending, success, and failure behavior are checked where practical or explicitly documented if the backend is unavailable.
