# PRD: Project Detail Ticket Board

## Problem Statement

Authenticated TicketForge users can create projects and see project summaries on the dashboard, but opening a project still lands on a placeholder page. This blocks the core MVP workflow: users cannot refine a project brief before generation, trigger ticket generation, monitor generation progress, inspect phased tickets, copy agent-ready ticket bodies, or track ticket execution status.

The backend now exposes the missing project-board API contract: project detail returns a full board with phases and tickets, generation returns the same board shape, and ticket status updates are persisted through a status-only endpoint. The frontend needs to turn that contract into the primary TicketForge workspace while preserving the existing Supabase auth boundary, TanStack Query server-state model, App Router structure, shadcn component conventions, and galaxy visual system.

## Solution

Build the authenticated `/projects/:id` page as a client-side project workspace. The page loads the project through the shared authenticated API client, renders a project header with provider and repository metadata, and adapts its main body to the project lifecycle.

For draft projects or projects with no phases, the page shows a large centered "Generate Tickets" call to action with a violet glow and an editable description textarea prefilled from the project description. Users may refine the description before generating. If the refined description differs from the stored project description, the frontend saves it through the project update endpoint before calling the project generation endpoint.

When generation is requested or the project is already generating, the page shows a full-screen loading overlay with an animated starfield and cycling status messages. While the project status is `generating`, the page polls the project detail endpoint every 3 seconds until the project becomes `ready` or `failed`.

When the project is ready, the page renders phases in a shadcn Accordion with Phase 1 expanded by default. Each phase header shows the phase number, title, and ticket count. Inside each phase, tickets render as vertical TicketCard components with repo badges, title, collapsible body preview, copy-to-clipboard behavior, and a persisted status dropdown. Done tickets are visually de-emphasized with 50% opacity and a strikethrough title.

When generation fails or the project is in a failed lifecycle state, the page shows a red glassmorphic error card with a retry action. Missing projects, unauthorized requests, mutation failures, and loading states must be handled explicitly without leaking server data into Zustand or bypassing the shared API client.

## User Stories

1. As a signed-in user, I want to open a project detail page from the dashboard, so that I can continue work on a specific project.
2. As a signed-in user, I want the project detail page to load through the authenticated API client, so that my Supabase session protects project data.
3. As a signed-in user, I want project data to remain scoped to my account, so that other users cannot view my projects.
4. As a signed-in user, I want to see the project name as the page header, so that I know which project I am viewing.
5. As a signed-in user, I want to see the project description under the title, so that I can understand the project brief at a glance.
6. As a signed-in user, I want to see the LLM provider badge, so that I know whether the project uses Groq or Ollama.
7. As a signed-in user, I want to see the GitHub repository link when a project has one, so that I can inspect the linked repo.
8. As a signed-in user, I want projects without a GitHub repository not to show a broken or empty repo link, so that the header remains clean.
9. As a signed-in user, I want a Regenerate button in the header, so that I can replace existing tickets when the project brief changes.
10. As a signed-in user, I want draft projects to show a prominent Generate Tickets call to action, so that I know the next step.
11. As a signed-in user, I want projects with no phases to show the Generate Tickets call to action, so that empty boards can recover even if status metadata is stale.
12. As a signed-in user, I want the Generate Tickets button to use the violet glow visual treatment, so that the primary action is visually clear.
13. As a signed-in user, I want an editable textarea prefilled with the project description, so that I can refine the prompt before generating tickets.
14. As a signed-in user, I want refined description text to be saved before generation, so that the generated tickets reflect my latest brief.
15. As a signed-in user, I want generation to call the project generation endpoint, so that the backend owns LLM orchestration and ticket persistence.
16. As a signed-in user, I want duplicate generation clicks prevented while a request is pending, so that I do not start overlapping generations.
17. As a signed-in user, I want a full-screen loading overlay during generation, so that it is clear the app is working on a long-running operation.
18. As a signed-in user, I want the loading overlay to include the animated starfield, so that the experience remains consistent with TicketForge's galaxy aesthetic.
19. As a signed-in user, I want generation status messages to cycle through "Analyzing your project...", "Designing phases...", "Drafting tickets...", and "Almost there...", so that progress feels active during a wait.
20. As a signed-in user, I want the page to poll every 3 seconds while the project is generating, so that the board appears when generation finishes.
21. As a signed-in user, I want polling to stop when the project is ready, so that the app does not keep making unnecessary requests.
22. As a signed-in user, I want polling to stop when generation fails, so that the page can show a retry path.
23. As a signed-in user, I want ready projects to show phases as an accordion, so that the ticket board is organized and scannable.
24. As a signed-in user, I want Phase 1 expanded by default, so that I can immediately start at the beginning of the plan.
25. As a signed-in user, I want later phases collapsed by default, so that the page does not become overwhelming.
26. As a signed-in user, I want each phase header to show the phase number, title, and ticket count, so that I can understand the scope of each phase before opening it.
27. As a signed-in user, I want tickets to render in phase order, so that the generated implementation sequence is preserved.
28. As a signed-in user, I want each ticket to show a repo badge, so that I know which codebase or operational area the work belongs to.
29. As a signed-in user, I want repo badges to use the established colors for frontend, backend, fullstack, and devops, so that tickets can be classified quickly.
30. As a signed-in user, I want each ticket title to use bold Space Grotesk styling, so that ticket cards feel on-brand and readable.
31. As a signed-in user, I want each ticket body to show only the first 3 lines by default, so that long generated prompts do not dominate the board.
32. As a signed-in user, I want a Show more button on long ticket bodies, so that I can inspect the full prompt when needed.
33. As a signed-in user, I want a Show less button after expanding a ticket body, so that I can return to a compact board.
34. As a signed-in user, I want a Copy button on each ticket, so that I can paste the full ticket body into Claude Code or Codex.
35. As a signed-in user, I want copying to use the full body even when the card is collapsed, so that I never copy a truncated prompt.
36. As a signed-in user, I want a "Copied to clipboard" toast after copying, so that I know the action succeeded.
37. As a signed-in user, I want a ticket status dropdown with Pending, In Progress, and Done, so that I can track execution state.
38. As a signed-in user, I want ticket status changes to persist through the backend, so that the board state survives refreshes and return visits.
39. As a signed-in user, I want ticket status changes to feel immediate, so that the board is pleasant to use.
40. As a signed-in user, I want failed ticket status updates to recover and show feedback, so that I do not trust an unsaved state.
41. As a signed-in user, I want done tickets to appear at 50% opacity with strikethrough titles, so that completed work is visible but de-emphasized.
42. As a signed-in user, I want failed projects to show a red glassmorphic error card, so that generation failure is clearly differentiated from empty state.
43. As a signed-in user, I want failed projects to expose a Retry button, so that I can attempt generation again without leaving the page.
44. As a signed-in user, I want project load failures to show a retry path, so that transient API problems do not strand me.
45. As a signed-in user, I want missing or inaccessible projects to show a clear project-level error state, so that I understand the page cannot load.
46. As a keyboard user, I want accordion triggers, copy buttons, generation buttons, retry buttons, and status dropdowns to be keyboard-accessible, so that I can operate the board without a pointer.
47. As a screen reader user, I want icon-only actions to have accessible names, so that their purpose is clear.
48. As a mobile user, I want the project page to work at 375px width, so that I can inspect and copy tickets from a phone.
49. As a mobile user, I want header actions and ticket controls to wrap cleanly, so that controls do not overlap or clip.
50. As a developer, I want project board server state handled through TanStack Query, so that the feature follows existing app data patterns.
51. As a developer, I want all app-data calls to use the shared API client, so that auth and 401 handling remain centralized.
52. As a developer, I want one project-board normalizer to handle both show and generate responses, so that JSON:API graph parsing is not duplicated.
53. As a developer, I want server data kept out of Zustand, so that the project detail page respects the state-management boundary.
54. As a developer, I want generated shadcn primitives to stay business-logic-free, so that feature behavior remains in feature modules and hooks.
55. As a developer, I want the implementation to tolerate an empty `included` array, so that draft or empty boards do not crash.
56. As a developer, I want frontend ticket status values to match the backend enum exactly, so that persisted updates do not fail validation.

## Implementation Decisions

- The `/projects/:id` route remains an authenticated App Router page inside the existing protected app shell.
- The route delegates the interactive workspace to a client-side feature component because it needs query state, mutation state, clipboard access, polling, local UI expansion state, and textarea state.
- Project board data is fetched from `GET /projects/:id` through the shared authenticated API client.
- `GET /projects/:id` is the canonical source for first load, refresh, and return visits.
- Project generation uses `POST /projects/:id/generate` through the shared authenticated API client.
- The user-facing requirement "POST /generate" maps to the finalized backend route `POST /projects/:id/generate`.
- Refined description text is persisted before generation by calling the existing project update route when the textarea differs from the loaded project description.
- The generate endpoint is not assumed to accept an ad hoc description payload.
- The frontend uses one JSON:API board normalizer for both project show responses and generation responses.
- The normalizer produces a project detail model with project metadata, ordered phases, and ordered tickets.
- The project lifecycle statuses are `draft`, `generating`, `ready`, and `failed`.
- The ticket status values are `pending`, `in_progress`, and `done`.
- The ticket repo values are `frontend`, `backend`, `fullstack`, and `devops`.
- A project with `status === "draft"` shows the Generate Tickets experience.
- A project with no phases shows the Generate Tickets experience, even if the status is not `draft`.
- A project with `status === "generating"` enables polling every 3 seconds and shows the generation overlay.
- Polling stops when the project status becomes `ready` or `failed`.
- The loading overlay is shown while the generate mutation is pending and while the currently loaded project status is `generating`.
- Overlay messages cycle through the exact strings: "Analyzing your project...", "Designing phases...", "Drafting tickets...", and "Almost there...".
- Ready-state phases render through a shadcn Accordion.
- Phase 1 is expanded by default; all other phases are collapsed by default.
- The phase header displays phase number, phase title, and ticket count.
- Ticket cards are a feature-level component, not a shadcn primitive.
- Ticket cards show repo badge, title, collapsible body preview, copy action, and status dropdown.
- Repo badge styling follows the established mapping: frontend violet, backend blue, fullstack violet-to-blue gradient, devops orange.
- Ticket body preview is visually clamped to 3 lines before expansion.
- Copy action copies the full body regardless of collapsed state.
- Successful copy toast title is "Copied to clipboard".
- Ticket status changes use `PATCH /tickets/:id` with `{ ticket: { status } }`.
- Ticket status transitions are unconstrained in the UI because the backend contract allows any status-to-status transition.
- Ticket status updates should feel immediate through optimistic cache updates, with rollback and/or invalidation on failure.
- Failed status updates show an error toast and reconcile with the server.
- Done tickets use 50% opacity and a strikethrough title.
- Failed project state uses a red glassmorphic card and Retry button.
- Retry on a failed project calls the same generation flow as Generate Tickets.
- Missing or inaccessible projects show a project-level error state rather than redirecting blindly.
- A 401 remains handled by the existing API interceptor and Supabase sign-out redirect behavior.
- TanStack Query owns project board data and mutations.
- Zustand is not used for project board server data.
- Local component state may be used for the editable description, expanded ticket body ids, accordion value, and overlay message index.
- The implementation must preserve the galaxy aesthetic with glassmorphism, violet glow on primary CTAs, Space Grotesk headings, dark controls, and responsive spacing.
- The page must remain usable at 375px width.
- No frontend-owned database schema changes are required.

## Testing Decisions

- Verification should focus on user-visible behavior and API contracts rather than implementation details.
- The project board normalizer should be covered or manually verified against JSON:API project show/generate payloads with included phases and tickets.
- Empty-board handling should be verified with `included: []` and no phases.
- Draft/no-phase projects should be verified to show the Generate Tickets CTA and editable textarea.
- Description refinement should be verified to save the description before generation when changed.
- Generation should be verified for pending state, disabled duplicate action, full-screen overlay, cycling messages, and transition into the ready board.
- Polling should be verified to run every 3 seconds while `status === "generating"` and stop on `ready` or `failed`.
- Ready-state rendering should be verified for default accordion expansion, phase header metadata, ticket order, and ticket count copy.
- TicketCard behavior should be verified for repo badge styling, body clamping, expand/collapse, copy-to-clipboard toast, status dropdown values, and done styling.
- Ticket status mutation should be verified for optimistic UI behavior, persisted `PATCH /tickets/:id` payload, failure feedback, and cache reconciliation.
- Failed project rendering should be verified for red glassmorphic styling and working Retry action.
- Loading and error states should be verified for initial project load and retry behavior.
- Accessibility verification should include keyboard operation for accordion triggers, generation/retry buttons, copy buttons, and status dropdowns.
- Accessibility verification should include accessible names for icon-only controls and labels for status controls.
- Responsive verification should include desktop and 375px mobile widths, checking for clipped text, overlapping controls, and awkward wrapping.
- Existing repository checks should include lint and production build.
- If an automated frontend browser test harness is unavailable, implementation should document focused manual verification rather than introducing a new test stack without separate approval.

## Out of Scope

- Backend changes to generation, project show, or ticket status endpoints.
- Editing generated ticket title, body, repo, phase, or position.
- Reordering phases or tickets.
- Bulk ticket status updates.
- Progress percentages or project-level completion aggregates.
- Server-side rendering of project data.
- WebSockets, server-sent events, or background job subscriptions for generation status.
- Advanced generation cancellation.
- Rich markdown rendering for ticket bodies.
- Exporting tickets to external tools.
- Creating GitHub issues from tickets.
- Additional LLM provider selection or model editing on the project detail page.
- Changing Supabase auth behavior or adding non-GitHub auth providers.
- Persisting project board server state in Zustand.
- Editing generated shadcn UI primitive files after installation.

## Further Notes

- The backend handoff contract is the source of truth for project board and ticket status endpoints.
- The show payload is expected to match the generate payload shape, so the frontend should avoid separate parsing paths.
- Non-owned projects and tickets return 404, not 403.
- `included: []` is a valid empty-board response and must not be treated as malformed.
- `PATCH /tickets/:id` silently ignores fields other than `status`; the frontend should only send status.
- Updating a ticket does not update project `ticket_count`, project `status`, or `last_generated_at`.
- The backend generation endpoint may complete synchronously, but the frontend must still support the persisted `generating` lifecycle and polling behavior.
- Failed project detail responses do not expose a persisted failure reason in the current contract; use generic failed-state copy unless a mutation error is available.
