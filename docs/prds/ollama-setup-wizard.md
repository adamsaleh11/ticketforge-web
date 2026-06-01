# PRD: Ollama Setup Wizard

## Problem Statement

TicketForge supports Local Ollama as an LLM provider, but users currently have no guided way to install Ollama, pull a model, verify that the local server is running, or connect their saved Ollama endpoint to the product. The New Project dialog already exposes Local Ollama and an inert setup affordance, while Settings is still a placeholder surface for provider configuration.

This creates a broken local-model path: users can select Ollama and type a model name, but they do not know whether their local service is installed, reachable, or populated with models. The backend now exposes authenticated endpoints for saving a user's Ollama endpoint and testing the saved endpoint, so the frontend can complete the setup experience without inventing a separate integration contract.

The feature matters now because local model setup is a core TicketForge provider choice. It should feel like a first-class galaxy-themed workflow rather than a generic settings form or a dead-end helper link.

## Solution

Build a reusable Ollama setup wizard as a shadcn Dialog with four steps and violet progress dots: Install Ollama, Pull a model, Verify Ollama is running, and Connect. The wizard is accessible from Settings and from New Project when the user selects Local Ollama.

The first three steps provide concise instructions and copyable commands. The Connect step lets the user enter an endpoint, defaults to `http://localhost:11434`, saves that endpoint through the authenticated API, then tests the saved endpoint. On success with detected models, the wizard shows a green success state, displays detected models as violet badges, and enables Finish. On failure, it shows a red failure state with troubleshooting tips.

When Ollama connects but reports no installed models, the wizard treats the endpoint as reachable but not ready for local generation. In Settings, it should explain that no local models are available and guide the user back to pulling a model. In New Project, it should also offer a Groq fallback path with Confirm and Cancel controls and a Groq model selector. Confirm switches the project form to Groq and sets the selected Groq model; Cancel keeps the user in the Ollama setup flow.

The implementation preserves the galaxy aesthetic with glassmorphic surfaces, violet accents, dark code blocks, accessible controls, loading states, and mobile-safe layout.

## User Stories

1. As a signed-in user, I want to open Ollama setup from Settings, so that I can configure my local provider before creating a project.
2. As a signed-in user creating a project, I want to open Ollama setup when Local Ollama is selected, so that I can resolve setup issues without leaving the project flow.
3. As a local-model user, I want a multi-step setup dialog, so that installation, model download, server verification, and connection are presented in a manageable sequence.
4. As a local-model user, I want violet progress dots at the top of the wizard, so that I can understand where I am in setup.
5. As a returning Ollama user, I want to jump between setup steps, so that I do not need to repeat instructions I already completed.
6. As a keyboard user, I want all wizard navigation, copy buttons, form fields, and fallback controls to be keyboard accessible, so that I can complete setup without a pointer.
7. As a screen reader user, I want the wizard steps and results to have clear labels and status text, so that I understand progress and outcomes.
8. As a mobile user, I want the wizard to fit at 375px width, so that setup remains usable on small screens.
9. As a signed-in user, I want Step 1 to explain installing Ollama and link to `https://ollama.com/download`, so that I can install the required local service.
10. As a terminal-oriented user, I want Step 1 to show `curl -fsSL https://ollama.com/install.sh | sh` in a copyable code block, so that I can quickly run the install command where appropriate.
11. As a user who needs clarity, I want Step 1 to briefly explain what Ollama is being installed for, so that I understand why it is required.
12. As a local-model user, I want Step 2 to show `ollama pull llama3.1` in a copyable code block, so that I can download the default local model.
13. As a local-model user, I want Step 2 to explain that the model download is about 4GB, so that I can anticipate time and disk usage.
14. As a local-model user, I want Step 3 to show `ollama serve`, so that I know how to start the Ollama server.
15. As a local-model user, I want Step 3 to show `curl http://localhost:11434/api/tags`, so that I can verify the local API manually.
16. As a user copying commands, I want copy buttons on every command block, so that I do not mistype setup commands.
17. As a user copying commands, I want visible copy feedback, so that I know the command was copied.
18. As a signed-in user, I want Step 4 to prefill `http://localhost:11434`, so that the default local endpoint is ready without extra typing.
19. As a signed-in user, I want to edit the Ollama endpoint, so that I can use a custom host, port, or HTTPS endpoint.
20. As a signed-in user, I want endpoint validation before saving, so that invalid URLs are caught before the backend rejects them.
21. As a signed-in user, I want Test Connection to show a loading state, so that I know the save and connectivity check are in progress.
22. As a signed-in user, I want Test Connection to save the endpoint before testing, so that the frontend matches the backend's saved-endpoint-only test contract.
23. As a signed-in user, I want 422 validation errors from saving the endpoint to appear near the endpoint input, so that I can fix bad URL values.
24. As a signed-in user, I want a successful connection to show a green check, so that I know TicketForge reached Ollama.
25. As a signed-in user, I want detected Ollama models to appear as violet badges, so that I can see which local models are available.
26. As a signed-in user, I want Finish enabled only after a successful connection test with at least one available local model, so that I do not accidentally finish an incomplete local setup.
27. As a signed-in user, I want failed connection tests to show a red X and troubleshooting tips, so that I can diagnose whether Ollama is running, blocked by firewall/network settings, or unreachable from TicketForge.
28. As a signed-in user, I want failed connection tests to keep the dialog open and preserve the endpoint value, so that I can adjust and retry without restarting.
29. As a signed-in user, I want editing the endpoint after a successful test to clear the prior success state, so that the UI does not certify an untested endpoint.
30. As a signed-in user, I want Finish to close the wizard after a verified setup, so that I can return to Settings or project creation.
31. As a Settings user, I want to see the saved Ollama endpoint and an action to set up or update Ollama, so that provider configuration is discoverable.
32. As a Settings user, I want the page not to claim persistent connection status unless a test was run in the current session, so that stale connectivity is not presented as current truth.
33. As a New Project user, I want closing the setup wizard to preserve my project draft, so that setup does not erase the work I already typed.
34. As a New Project user, I want successful detection of local models to help populate the Ollama model field when I have not manually chosen a model, so that I can continue with a valid local model.
35. As a New Project user, I want my manually typed Ollama model to remain unchanged after setup, so that the wizard does not overwrite an intentional choice.
36. As a New Project user, I want an Ollama-connected-but-no-models state to offer Groq fallback, so that I can continue project creation without pulling a local model immediately.
37. As a New Project user, I want the Groq fallback state to include a Groq model selector, so that I can choose which cloud model will be used.
38. As a New Project user, I want confirming Groq fallback to switch the provider to Groq and set the selected model, so that project creation can continue with a valid provider/model pair.
39. As a New Project user, I want canceling Groq fallback to keep me in the Ollama flow, so that I can go back and pull a local model instead.
40. As a developer, I want Ollama settings server state handled through TanStack Query, so that saved endpoint data follows the app's existing server-state boundary.
41. As a developer, I want all app-data calls to use the shared authenticated API client, so that Supabase bearer-token handling and 401 sign-out remain centralized.
42. As a developer, I want wizard step state and copy feedback to remain local UI state, so that Zustand is not used for transient component state.
43. As a developer, I want the frontend to branch on the backend `connected` field for test results, so that unreachable Ollama is handled according to the finalized always-200 contract.
44. As a developer, I want the wizard reusable across Settings and New Project, so that the setup flow has one source of behavior with context-specific completion callbacks.
45. As a developer, I want shadcn UI primitives to remain business-logic-free, so that feature behavior stays in feature components and hooks.

## Implementation Decisions

- The wizard is a client-side feature component because it owns step navigation, endpoint form state, copy feedback, mutation state, connection result state, and context-specific completion actions.
- The wizard is reusable and controlled by `open` and `onOpenChange` props.
- Settings owns its own wizard open state and displays a saved endpoint configuration surface.
- New Project owns its own wizard open state and opens the wizard from the Local Ollama setup affordance.
- New Project must preserve the existing project draft while the wizard is open or after the wizard closes.
- The wizard has exactly four steps: Install Ollama, Pull a model, Verify Ollama is running, and Connect.
- Progress dots appear at the top of the wizard and use violet styling. They may be clickable so users can jump to a relevant step.
- The wizard uses shadcn Dialog and existing shadcn primitives. Generated shadcn UI files are not edited.
- Code commands are rendered as non-editable code blocks with copy buttons.
- Copy buttons use browser clipboard APIs and provide visible copied feedback.
- Step 1 links to `https://ollama.com/download` and shows `curl -fsSL https://ollama.com/install.sh | sh`.
- Step 2 shows `ollama pull llama3.1` and explains that the download is about 4GB locally.
- Step 3 shows `ollama serve` and `curl http://localhost:11434/api/tags`.
- Step 4 uses a validated endpoint input with default `http://localhost:11434`.
- Endpoint input validation requires an `http://` or `https://` URL with a host.
- The frontend calls `PATCH /settings/ollama` with `{ user: { ollama_endpoint } }` before testing.
- The frontend calls `POST /settings/ollama/test` with no body after a successful save.
- The frontend must not call `/api/v1` directly because the shared API client already applies the versioned base URL.
- The frontend consumes the test response as plain JSON and branches on `connected`.
- A connected response with one or more models is a successful local setup.
- A connected response with an empty model list is reachable-but-not-ready for local generation.
- A failed connection response shows backend error text when available plus troubleshooting tips.
- Finish is enabled only after a successful local setup with at least one detected model.
- If the endpoint changes after a successful test, the success state and detected models are cleared.
- Settings displays the saved endpoint and setup/update action, but does not claim persistent connected status unless a current-session test has succeeded.
- In New Project, if detected models include `llama3.1`, the wizard may keep or choose `llama3.1`; otherwise it may use the first detected model when the user has not manually edited the model.
- In New Project, if the user has manually edited the Ollama model field, successful setup does not overwrite that field.
- In New Project, connected-with-no-models shows a Groq fallback confirmation UI with Confirm and Cancel controls plus a Groq model selector.
- Confirming Groq fallback switches the New Project provider to `groq` and sets the selected Groq model.
- Canceling Groq fallback keeps the user in the Ollama wizard.
- In Settings, connected-with-no-models shows guidance to pull a model rather than provider-switching controls.
- The Groq fallback model options are the existing approved Groq models: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, and `mixtral-8x7b-32768`.
- The default Groq fallback model is `llama-3.3-70b-versatile`.
- All app-data calls use the shared authenticated API client.
- TanStack Query owns current user/settings server state and settings mutations.
- Zustand is not used for settings server state, wizard state, or form data.
- The galaxy aesthetic is required throughout: glassmorphic dialog, violet accents, dark command surfaces, and on-brand success/failure states.
- No frontend-owned database schema changes are required.

## Testing Decisions

- Verification should focus on user-visible behavior and integration contracts rather than internal component implementation details.
- Endpoint save should be verified against the finalized request shape `{ user: { ollama_endpoint } }`.
- Connection test should be verified against the finalized no-body POST shape and always-200 `{ connected, models | error }` contract.
- The frontend should be verified to branch on `connected`, not HTTP status, for test results.
- Step navigation should be verified for sequential Next/Back behavior and direct progress-dot navigation.
- Copy buttons should be verified for every command block, including accessible names and visible copied feedback.
- Endpoint validation should be verified for required value, invalid URL, unsupported scheme, and valid custom http/https endpoints.
- Save validation failure should be verified to keep the wizard open and show field-level feedback.
- Connection success with models should be verified for green success state, violet model badges, and enabled Finish.
- Connection failure should be verified for red failure state, preserved endpoint value, retry availability, backend error text where available, and troubleshooting tips.
- Connected-with-no-models should be verified separately for Settings and New Project contexts.
- New Project context should be verified for draft preservation while opening and closing the wizard.
- New Project context should be verified for model field population when the user has not manually edited the Ollama model.
- New Project context should be verified to avoid overwriting a manually edited Ollama model.
- Groq fallback should be verified for model selection, Confirm provider/model switching, and Cancel staying in the Ollama flow.
- Loading states should be verified for save/test and Finish actions where applicable.
- Accessibility verification should include dialog focus behavior, keyboard tab order, labels, status text, icon button accessible names, and visible focus states.
- Responsive verification should include desktop and 375px mobile widths, especially code block overflow and dialog scrolling.
- Existing repository checks should include lint and production build.
- The repository currently does not expose an automated frontend test harness; if that remains true during implementation, the plan should call out focused manual verification and avoid introducing a full test stack unless separately requested.

## Out of Scope

- Implementing Rails backend endpoints for Ollama settings; these already exist in `ticketforge-api`.
- Changing the backend test endpoint to accept a candidate unsaved endpoint.
- Adding model pull/install automation inside TicketForge.
- Pulling Ollama models from the frontend.
- Adding rich model metadata such as size, digest, or modified date.
- Adding per-project Ollama endpoints.
- Adding persistent global connection status or background connection monitoring.
- Adding SSRF hardening to the backend endpoint.
- Adding new LLM providers beyond Groq and Ollama.
- Changing project creation backend contracts.
- Changing Supabase authentication behavior.
- Introducing a new frontend automated test framework unless separately requested.
- Editing generated shadcn UI primitive files after installation.

## Further Notes

- The backend handoff contract is the source of truth for the Ollama settings API. The test endpoint reads only the saved endpoint, so frontend Test Connection must save first and then test.
- `POST /settings/ollama/test` returns HTTP 200 for both connected and not-connected outcomes. The frontend must branch on the `connected` boolean.
- Empty `models: []` means Ollama is reachable but no models are installed. In Settings, this should push the user back toward the Pull a model step. In New Project, this should offer Groq fallback with explicit user confirmation.
- Localhost in the endpoint is interpreted from the backend server's perspective, not necessarily the browser's. This is acceptable for the current local development workflow but may need product review before production local-agent workflows.
- The current Settings page is a placeholder and can be expanded into a provider settings surface for this slice.
- The current New Project dialog already has an Ollama setup affordance that can be replaced with the active wizard trigger.
