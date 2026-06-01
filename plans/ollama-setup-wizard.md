# Plan: Ollama Setup Wizard

> Source PRD: `docs/prds/ollama-setup-wizard.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Settings remains at `/settings`. New Project continues to open from the dashboard and submits projects through the existing project creation route.
- **Schema**: No frontend-owned persistence schema is introduced. The saved Ollama endpoint is owned by the Rails `users.ollama_endpoint` field.
- **Key models**: Ollama settings expose `ollama_endpoint`; connection tests return `connected` plus either `models` or `error`. Project provider values remain `groq` and `ollama`.
- **Auth**: All app-data calls use the existing Supabase-authenticated axios client. The API client handles bearer-token attachment and 401 sign-out behavior.
- **External services**: The frontend saves through `PATCH /settings/ollama` with `{ user: { ollama_endpoint } }`, then tests through `POST /settings/ollama/test` with no body. The shared API client applies `/api/v1`.
- **Server state**: TanStack Query owns the current user/settings server state and settings mutations. Wizard step state, copy feedback, connection result state, and fallback UI state stay local.
- **Design system**: The wizard preserves the galaxy aesthetic with shadcn primitives, glassmorphism, dark command surfaces, violet progress and badges, and mobile-safe layout.

---

## Phase 1: Ollama Settings API Boundary

**User stories**: 18-29, 40-43

### What to build

Add the frontend settings/query boundary for loading the saved endpoint, saving the endpoint, testing the saved endpoint, normalizing validation errors, and exposing typed mutation results. The first usable slice proves the frontend can honor the backend contract before the full wizard UI depends on it.

### Acceptance criteria

- [ ] Current user/settings data can provide the saved `ollama_endpoint`.
- [ ] Endpoint save uses `PATCH /settings/ollama` through the shared API client.
- [ ] Endpoint save sends `{ user: { ollama_endpoint } }`.
- [ ] Connection test uses `POST /settings/ollama/test` through the shared API client with no body.
- [ ] Test results branch on `connected`, not HTTP status.
- [ ] Save validation failures can be mapped to endpoint field feedback.
- [ ] Settings server state is handled through TanStack Query, not Zustand.

---

## Phase 2: Reusable Wizard Shell And Instruction Steps

**User stories**: 3-17, 44-45

### What to build

Build the reusable shadcn Dialog wizard with four steps, violet progress dots, responsive navigation, install/pull/verify instructions, command blocks, copy buttons, and galaxy styling. This slice should be demoable without requiring a successful API connection.

### Acceptance criteria

- [ ] The wizard is controlled by `open` and `onOpenChange`.
- [ ] The wizard has exactly four steps: Install Ollama, Pull a model, Verify Ollama is running, and Connect.
- [ ] Violet progress dots show the current step and support direct step navigation.
- [ ] Step 1 links to `https://ollama.com/download`.
- [ ] Step 1 includes a copyable `curl -fsSL https://ollama.com/install.sh | sh` command.
- [ ] Step 2 includes a copyable `ollama pull llama3.1` command and mentions the roughly 4GB local download.
- [ ] Step 3 includes copyable `ollama serve` and `curl http://localhost:11434/api/tags` commands.
- [ ] Every copy button has an accessible name and visible copied feedback.
- [ ] The dialog remains usable at 375px width without clipped command text or controls.

---

## Phase 3: Connect Step Result States

**User stories**: 18-30, 43

### What to build

Complete the Connect step with endpoint input, endpoint validation, save-then-test behavior, loading state, success with model badges, failure troubleshooting, endpoint-change reset behavior, and Finish rules.

### Acceptance criteria

- [ ] The endpoint input defaults to `http://localhost:11434` or the saved endpoint when available.
- [ ] Endpoint validation requires a valid `http://` or `https://` URL with a host.
- [ ] Test Connection saves the endpoint before testing connectivity.
- [ ] Test Connection shows a loading state and prevents duplicate requests.
- [ ] Save validation errors appear near the endpoint input.
- [ ] Connected with one or more models shows a green success state and violet model badges.
- [ ] Connection failure shows a red failure state, backend error text when available, retry affordance, and troubleshooting tips.
- [ ] Editing the endpoint after a successful test clears detected models and disables Finish.
- [ ] Finish is enabled only after a connected result with at least one detected model.
- [ ] Finish closes the wizard and triggers the caller's completion callback.

---

## Phase 4: Settings Integration

**User stories**: 1, 31-32

### What to build

Replace the placeholder Settings content with a provider settings surface. Show the saved Ollama endpoint, loading/error states, and a setup/update action that opens the wizard. Settings-specific connected-with-no-models guidance should lead the user back toward pulling a model rather than switching providers.

### Acceptance criteria

- [ ] Settings shows a loading skeleton while the saved endpoint is loading.
- [ ] Settings shows a recoverable error state if endpoint loading fails.
- [ ] Settings displays the saved Ollama endpoint when available.
- [ ] Settings opens the reusable wizard.
- [ ] Settings does not claim persistent connected status unless the wizard tested the endpoint in the current session.
- [ ] Connected-with-no-models in Settings explains that Ollama is reachable but no local models are installed.
- [ ] Settings-specific no-model guidance directs the user back to the Pull a model step.

---

## Phase 5: New Project Integration And Model Handoff

**User stories**: 2, 33-39

### What to build

Replace the disabled New Project Ollama setup affordance with the active wizard trigger. Preserve the project draft while setup is open, hand detected models back into the form only when appropriate, and implement the connected-with-no-models Groq fallback selector with Confirm and Cancel.

### Acceptance criteria

- [ ] The New Project setup trigger appears only when Local Ollama is selected.
- [ ] Opening and closing the setup wizard preserves all current project draft fields.
- [ ] Successful local model detection populates the Ollama model when the user has not manually edited it.
- [ ] Successful setup does not overwrite a manually edited Ollama model.
- [ ] Connected-with-no-models offers Groq fallback in the New Project context.
- [ ] Groq fallback includes the approved Groq model options.
- [ ] Confirming Groq fallback switches the project provider to Groq and sets the selected Groq model.
- [ ] Canceling Groq fallback keeps the user in the Ollama wizard.

---

## Phase 6: Verification Pass

**User stories**: 6-8 plus all loading/error/success flows

### What to build

Run the frontend QA and polish pass. Verify user flow coherence, visual consistency, edge states, responsive behavior, accessibility basics, and repository checks.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Desktop browser check shows Settings and New Project wizard flows render coherently.
- [ ] 375px mobile browser check shows no overflow or overlapping controls.
- [ ] Keyboard tab order, labels, status text, and icon button accessible names are accounted for.
- [ ] Copy feedback, loading states, success states, failure states, and no-model fallback states are checked where practical.
- [ ] Any verification that cannot be run is documented with the reason.
