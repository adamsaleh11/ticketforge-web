# PRD: New Project Dialog

## Problem Statement

Authenticated TicketForge users can view their project dashboard, but the "New Project" entry point is still a placeholder. This blocks the core MVP workflow because users cannot submit a project idea, choose an LLM provider, select a model, or create a project that can later produce phased engineering tickets.

The current placeholder also leaves upcoming integrations ambiguous. Project creation needs a concrete frontend contract that respects the existing authenticated API boundary, TanStack Query server-state model, Supabase auth flow, App Router structure, and galaxy design system. The feature should create a real project without prematurely building Phase 3 Ollama setup or Phase 4 GitHub repository selection.

## Solution

Replace the placeholder New Project dialog with a shadcn Dialog containing a validated project-creation form. A signed-in user opens the dialog from the dashboard, enters a name and detailed project description, chooses Groq Cloud or Local Ollama, selects or enters the corresponding LLM model, sees the future GitHub repository field as a disabled Phase 4 placeholder, and submits the project.

Submission posts the validated payload to the Rails backend through the shared authenticated API client. While the request is pending, the form shows an explicit loading state and prevents duplicate submission. On success, the project list cache is invalidated and the user is navigated to the new project detail route. On failure, the dialog stays open and shows a concise destructive toast.

The dialog preserves the TicketForge galaxy aesthetic with glassmorphic surfaces, violet focus rings, dark form controls, and responsive layout. Groq is the default provider with the strongest provided Groq model selected by default. Ollama uses a text model field with helper text and a disabled "Set up Ollama" affordance that can be wired to the Phase 3 wizard later.

## User Stories

1. As a signed-in user, I want to open a New Project dialog from the dashboard, so that I can start a new planning workflow without leaving my workspace.
2. As a signed-in user, I want the New Project dialog to use the same galaxy visual system as the dashboard, so that project creation feels integrated with TicketForge.
3. As a keyboard user, I want the dialog controls to be reachable in a predictable tab order, so that I can create projects without a pointer.
4. As a screen reader user, I want each field to have an accessible label and validation message, so that I understand what is required.
5. As a signed-in user, I want to enter a project name, so that I can identify the project later.
6. As a signed-in user, I want the project name to require at least 3 characters, so that accidental or empty project names are rejected.
7. As a signed-in user, I want to enter a detailed project description, so that TicketForge has enough context to generate useful engineering tickets.
8. As a signed-in user, I want the description to require at least 20 characters, so that the LLM input is not too vague.
9. As a signed-in user, I want to choose between Groq Cloud and Local Ollama, so that I can decide whether generation runs through the cloud or my local machine.
10. As a signed-in user, I want Groq Cloud to be selected by default, so that the simplest cloud-backed path is ready immediately.
11. As a signed-in user, I want the Groq model field to be a dropdown, so that I only select supported cloud models.
12. As a signed-in user, I want Groq model options to include `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, and `mixtral-8x7b-32768`, so that I can pick from the supported backend options.
13. As a signed-in user, I want `llama-3.3-70b-versatile` selected by default for Groq, so that the highest-capability provided option is used unless I change it.
14. As a signed-in user, I want switching to Groq to restore a valid Groq model, so that the form cannot submit an Ollama model under the Groq provider.
15. As a local-model user, I want selecting Local Ollama to change the model field into text input, so that I can enter a locally pulled model name.
16. As a local-model user, I want the Ollama model input to default to `llama3.1`, so that there is a sensible editable starting point.
17. As a local-model user, I want helper text saying the model must be pulled locally on my machine, so that I understand why creation may later fail if the model is missing.
18. As a local-model user, I want to see a small "Set up Ollama" affordance beside the model field, so that the future setup path is discoverable.
19. As a local-model user, I want the "Set up Ollama" affordance to be inert until the wizard exists, so that the UI does not navigate to a broken route.
20. As a signed-in user, I want the GitHub repository field to communicate "Coming in Phase 4", so that I know repository linking is planned but unavailable in this slice.
21. As a signed-in user, I want the unavailable GitHub repository field not to block project creation, so that I can create projects without a linked repository.
22. As a signed-in user, I want required-field errors to appear inline, so that I can fix validation issues without guessing.
23. As a signed-in user, I want invalid fields to receive accessible invalid state, so that assistive technology can identify form errors.
24. As a signed-in user, I want all form controls to use dark glassmorphic backgrounds and violet focus rings, so that the UI remains on-brand and visibly interactive.
25. As a signed-in user, I want the submit button to show a loading state while creating a project, so that I know the request is in progress.
26. As a signed-in user, I want duplicate submissions prevented while the create request is pending, so that I do not accidentally create multiple projects.
27. As a signed-in user, I want the dialog to stay open during submission, so that I can see progress and errors.
28. As a signed-in user, I want a failed create request to show a clear error toast, so that I know the project was not created.
29. As a signed-in user, I want the form values to remain available after a failed request, so that I do not need to retype my project description.
30. As a signed-in user, I want successful creation to navigate me to the new project detail page, so that I can continue the workflow immediately.
31. As a signed-in user, I want successful creation to refresh the dashboard project cache, so that returning to the dashboard shows the new project.
32. As a mobile user, I want the dialog to fit at 375px width without clipped controls, so that I can create projects on small screens.
33. As a developer, I want project creation server state handled through TanStack Query, so that it follows the same pattern as project list and delete.
34. As a developer, I want the create mutation to use the shared authenticated API client, so that Supabase bearer-token handling and 401 sign-out remain centralized.
35. As a developer, I want provider payload values to be `groq` and `ollama`, so that the request matches the existing frontend project provider model.
36. As a developer, I want the form schema to be the source of client validation, so that validation rules are explicit and reusable.
37. As a developer, I want server data kept out of Zustand, so that project creation does not violate the app's state-management boundary.
38. As a developer, I want direct dependencies for the form and validation libraries declared, so that the app does not rely on transitive packages.
39. As a developer, I want the disabled GitHub field designed so Phase 4 can replace it with a shadcn Command combobox, so that the future integration has a clear slot.
40. As a developer, I want the Ollama setup affordance designed so Phase 3 can attach the setup wizard, so that follow-up work does not need to redesign the form.

## Implementation Decisions

- The New Project entry point remains a dashboard-owned dialog opened from the existing dashboard actions.
- The dialog is a client-side feature component because it manages form state, validation state, mutation state, and navigation.
- The form uses `react-hook-form` with a `zod` schema resolver.
- Direct app dependencies must include `react-hook-form`, `@hookform/resolvers`, and `zod`.
- The required form fields are project name, description, LLM provider, and LLM model.
- Project name validation requires at least 3 characters after normal form handling.
- Description validation requires at least 20 characters and represents the primary LLM input.
- Provider values submitted to the API are `groq` and `ollama`.
- Provider labels shown to users are "Groq Cloud" and "Local Ollama".
- Groq is the default provider.
- Groq model selection is a dropdown with `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, and `mixtral-8x7b-32768`.
- The default Groq model is `llama-3.3-70b-versatile`.
- Ollama model selection is a text input.
- The default Ollama model value is `llama3.1`.
- The Ollama model field shows helper text: "Must be pulled locally on your machine".
- Selecting Ollama shows a small "Set up Ollama" affordance beside the model field.
- The "Set up Ollama" affordance is inert and marked unavailable until the Phase 3 wizard exists.
- Switching providers resets the model to a valid default for the selected provider.
- GitHub repository selection is represented as a disabled "Coming in Phase 4" placeholder in this slice.
- The GitHub placeholder does not submit a repository value.
- No shadcn Command combobox is installed or built in this slice because repository search is deferred to Phase 4.
- Project creation uses `POST /projects` through the shared authenticated API client.
- The create payload includes `name`, `description`, `llm_provider`, and `llm_model`.
- The create payload omits `github_repo_full_name` until GitHub repository linking is implemented.
- The create mutation lives in the existing project server-state boundary and invalidates the project list query on success.
- On successful creation, the user is navigated to `/projects/:id` using the id returned by the backend.
- The frontend should tolerate a full project object response and may reuse the existing project normalization contract where practical.
- If the backend returns only an id, navigation can still proceed, but the projects query must be invalidated.
- Project creation is not optimistic.
- While creation is pending, the submit button is disabled, duplicate submits are prevented, and dialog close requests are ignored.
- On create failure, the dialog remains open and form values are preserved.
- Create failure toast copy is "Couldn't create project. Try again."
- All app-data calls continue to use the shared API client; no bare fetch is introduced for project creation.
- Zustand is not used for project server data or form submission data.
- shadcn UI primitives remain business-logic-free; feature logic stays in the project feature component and project hooks.
- Inputs, textarea, and selects use dark glassmorphic styling, violet focus rings, and accessible invalid states.
- The dialog must remain responsive at 375px width.
- No frontend-owned database schema changes are required.

## Testing Decisions

- Verification should focus on user-visible behavior and public contracts rather than internal component details.
- The form validation contract should be tested or manually verified for required name, minimum name length, required description, minimum description length, required provider, and required model.
- Provider switching should be verified for both directions, including model defaults and field type changes.
- Groq model selection should be verified to submit one of the supported Groq model values.
- Ollama model entry should be verified to submit the typed model value and show helper text.
- The disabled GitHub repository placeholder should be verified as non-interactive and non-blocking.
- The disabled Ollama setup affordance should be verified as visible only for Ollama and not navigable until the wizard exists.
- Successful submit should be verified to call the create endpoint through the shared API boundary, invalidate the projects cache, reset or close the dialog, and navigate to the new project route.
- Failed submit should be verified to preserve form values and show the destructive error toast.
- Pending submit should be verified to show a loading state, prevent duplicate submits, and prevent closing the dialog.
- Accessibility verification should include labels, invalid state, keyboard tab order, dialog focus behavior, and icon/button accessible names where applicable.
- Responsive verification should include the dialog at desktop and 375px mobile widths.
- Existing repository checks should include lint and production build.
- The repository currently does not expose an automated frontend test harness; if that remains true during implementation, the plan should call out focused manual verification and avoid introducing a full test stack unless separately requested.

## Out of Scope

- Building the Ollama setup wizard.
- Opening or wiring the Ollama setup wizard.
- Fetching GitHub repositories.
- Installing or building the shadcn Command combobox for GitHub repository search.
- Submitting `github_repo_full_name`.
- Implementing backend project creation.
- Implementing ticket generation after project creation.
- Implementing the project detail page beyond navigating to the existing route.
- Adding email/password auth or changing Supabase OAuth behavior.
- Persisting server data in Zustand.
- Introducing a new automated test framework unless separately requested.
- Editing generated shadcn UI primitives after installation.

## Further Notes

- This PRD assumes the Rails backend exposes authenticated `POST /projects` behind the existing API base URL.
- This PRD assumes the backend accepts `name`, `description`, `llm_provider`, and `llm_model`.
- This PRD assumes the backend returns either a full project representation with an `id` or a minimal response containing `id`.
- Phase 3 should replace the inert Ollama setup affordance with the real setup wizard.
- Phase 4 should replace the disabled GitHub placeholder with a searchable repository combobox populated from `GET /api/v1/github/repos`.
- If the backend later introduces structured validation errors, the frontend can map them to field-level errors in a follow-up slice.
