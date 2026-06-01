# PRD: Dashboard Project List

## Problem Statement

Authenticated TicketForge users currently land on a protected dashboard placeholder instead of a useful project workspace. They cannot see existing projects, understand generation status, navigate back into project detail, or safely remove stale projects from the frontend. This blocks the core MVP flow because the dashboard is the user's home base after GitHub sign-in and before project creation, ticket generation, and project detail workflows.

The dashboard must become a real client-side project list that respects the existing authenticated app shell, Rails-backed API boundary, TanStack Query server-state model, and galaxy visual system. It also needs to establish reusable frontend contracts for project data so the next project-detail and project-creation tickets do not duplicate types, cache keys, or API normalization logic.

## Solution

Build a responsive `/dashboard` experience for signed-in users. The protected app layout will continue to provide the TicketForge wordmark and user dropdown. The dashboard content will add a header with a top-right "New Project" action, a project grid, loading skeletons, an empty state, an error/retry state, and safe project deletion.

Project data will be fetched through the shared authenticated API client using TanStack Query with the `["projects"]` query key. The frontend will normalize the Rails response into a stable `Project` model that includes identifiers, display fields, provider metadata, status, ticket count, timestamps, GitHub repository name, and LLM model. Deleting a project will use a confirmation dialog followed by an optimistic cache update, rollback on API failure, and toast feedback.

The New Project action will open a scoped placeholder dialog for this ticket. It will not implement project creation fields yet, but it will wire the dashboard integration point that the next ticket can replace with the real creation flow.

## User Stories

1. As a signed-in user, I want the dashboard to show my projects, so that I can resume prior planning work.
2. As a signed-in user, I want project data to load through the authenticated Rails API, so that I only see projects available to my account.
3. As a signed-in user, I want a loading skeleton that matches the project card grid, so that the dashboard does not jump from a blank screen to content.
4. As a signed-in user, I want each project card to show the project name, so that I can recognize the project quickly.
5. As a signed-in user, I want each project card name to use the product heading style, so that the dashboard matches TicketForge's visual identity.
6. As a signed-in user, I want each project card to show a short two-line description, so that I can scan context without oversized cards.
7. As a signed-in user, I want long project descriptions to truncate cleanly, so that the grid remains aligned and readable.
8. As a signed-in user, I want each project card to show the LLM provider, so that I can distinguish Groq-backed projects from local Ollama projects.
9. As a signed-in user, I want Groq provider badges to be violet, so that provider metadata stays on-brand.
10. As a signed-in user, I want Ollama provider badges to be cyan, so that local-provider projects are visually distinct.
11. As a signed-in user, I want each project card to show the generation status, so that I know which projects are drafts, generating, ready, or failed.
12. As a signed-in user, I want generating projects to use a violet in-progress treatment, so that active generation reads as a positive ongoing state.
13. As a signed-in user, I want failed projects to be visually distinct, so that I can notice projects that need attention.
14. As a signed-in user, I want each project card to show the number of tickets, so that I can estimate how much generated work is available.
15. As a signed-in user, I want ticket counts to use singular and plural copy correctly, so that the dashboard feels polished.
16. As a signed-in user, I want to navigate from a project card title to the project detail route, so that I can inspect generated tickets.
17. As a keyboard user, I want the project title link and card actions to be reachable and understandable, so that the dashboard works without a pointer.
18. As a signed-in user, I want card hover styling to indicate interactivity, so that the dashboard feels responsive without relying on invalid nested controls.
19. As a signed-in user, I want a top-right "New Project" button, so that starting new work is always easy to find.
20. As a signed-in user, I want the empty dashboard state to invite me to forge my first project, so that first use has a clear next step.
21. As a signed-in user, I want the empty-state CTA to open the New Project dialog, so that the primary empty-state action and header action behave consistently.
22. As a signed-in user, I want the placeholder New Project dialog to clearly state that project creation is coming next, so that the integration is present without pretending creation already works.
23. As a signed-in user, I want to delete a stale project from the dashboard, so that I can keep my workspace focused.
24. As a signed-in user, I want deletion to require explicit confirmation, so that I do not accidentally remove high-cost project work.
25. As a signed-in user, I want the deleted project to disappear immediately after confirmation, so that the UI feels responsive.
26. As a signed-in user, I want failed deletion to restore the project and show an actionable error toast, so that I do not lose trust in the dashboard state.
27. As a signed-in user, I want successful deletion to show a concise success toast, so that I know the action completed.
28. As a signed-in user, I want dashboard API failures to show an error state with retry, so that I can recover without refreshing the page.
29. As a mobile user, I want the project grid to become one column at small widths, so that cards remain readable at 375px.
30. As a desktop user, I want the project grid to use three columns, so that I can scan many projects efficiently.
31. As a developer, I want dashboard server state to live in TanStack Query, so that project data is not duplicated in Zustand.
32. As a developer, I want the project query key to be `["projects"]`, so that future creation and deletion flows can invalidate or update the same cache.
33. As a developer, I want all project API calls to use the shared API client, so that Supabase bearer-token attachment and 401 handling remain centralized.
34. As a developer, I want a shared project type, so that dashboard and project detail code consume the same frontend contract.
35. As a developer, I want API response normalization to tolerate Rails snake_case while exposing camelCase to components, so that UI code stays idiomatic TypeScript.
36. As a developer, I want generated shadcn UI primitives to stay business-logic-free, so that dashboard behavior remains in feature modules and hooks.

## Implementation Decisions

- `/dashboard` remains a protected App Router route rendered inside the existing authenticated app layout.
- The existing protected top navigation owns the TicketForge wordmark and user dropdown; the dashboard does not duplicate those controls.
- The dashboard page uses a client component for TanStack Query interactions.
- Project list server state is fetched with TanStack Query using `["projects"]`.
- All application data calls use the shared authenticated API client.
- The project fetch endpoint is `GET /projects`.
- The project delete endpoint is `DELETE /projects/:id`.
- The frontend project model includes `id`, `name`, `description`, `llmProvider`, `status`, `ticketCount`, `createdAt`, `updatedAt`, `githubRepoFullName`, and `llmModel`.
- The backend response may use snake_case for fields such as `llm_provider`, `ticket_count`, `created_at`, `updated_at`, and `github_repo_full_name`; frontend consumers receive camelCase.
- Supported provider values for dashboard display are `groq` and `ollama`.
- Supported project status values for dashboard display are `draft`, `generating`, `ready`, and `failed`.
- The project grid uses a strict one-column mobile layout and three-column desktop layout.
- Loading state uses skeleton cards that match the final card layout.
- Empty state uses a centered glassmorphic card, violet star icon, headline "Forge your first project", and CTA that opens the New Project dialog.
- Error state uses a glassmorphic surface with retry behavior.
- Project cards are glassmorphic with a violet hover glow.
- Project card titles are links to `/projects/:id`; the entire card is not wrapped in a link.
- Delete is exposed as a card action separate from the project title link.
- Delete requires an alert-style confirmation dialog before the mutation runs.
- Confirmed delete uses optimistic cache removal, rollback on failure, and toast feedback.
- Success toast copy is "Project deleted".
- Failure toast copy is "Couldn't delete project. Try again."
- The New Project dialog is project-scoped and placeholder-only in this PRD. It opens from the header button and empty-state CTA and does not include fake form fields.
- Zustand is not used for project server data.
- No frontend-owned database schema changes are required.

## Testing Decisions

- Verification should focus on user-visible dashboard behavior and integration contracts rather than component implementation details.
- Project fetching should be verified through the `["projects"]` query and shared API client boundary.
- Project response normalization should be covered because the frontend depends on camelCase while Rails may return snake_case.
- Dashboard rendering should be verified for loading, error, empty, and populated states.
- Project card rendering should be verified for provider badge colors, status badges, ticket count copy, two-line description truncation, and project title navigation.
- Delete flow should be verified for confirmation, optimistic removal, API success toast, API failure rollback, and error toast copy.
- Delete with the backend unavailable should be manually tested to confirm rollback behavior.
- New Project dialog integration should be verified from both the header button and empty-state CTA.
- Responsive verification should include desktop and 375px mobile widths.
- Accessibility verification should include keyboard access for project links, delete actions, confirmation dialog controls, retry controls, and New Project dialog controls.
- Existing repository checks should include lint and production build.
- If the repository still lacks an automated test harness when implementation starts, the implementation plan should call out manual verification and recommend focused tests when a harness is introduced.

## Out of Scope

- Building the real project creation form.
- Posting new project payloads to the backend.
- GitHub repository selection or linking inside the New Project dialog.
- LLM provider selection inside the New Project dialog.
- Ticket generation workflow.
- Project detail implementation beyond linking to the existing `/projects/:id` route.
- Editing generated shadcn UI primitives after installation.
- Persisting project data in Zustand.
- Adding email/password auth, non-GitHub auth providers, or changing Supabase auth behavior.
- Rails backend implementation changes.
- Introducing a new automated test framework unless separately requested.

## Further Notes

- The dashboard depends on the Rails backend exposing authenticated project list and delete endpoints behind `NEXT_PUBLIC_API_URL`.
- The API serializer is expected to return `created_at`, `updated_at`, `github_repo_full_name`, and `llm_model` in addition to core card fields.
- The dashboard can ignore some normalized fields visually in this ticket while still preserving them in the shared type for upcoming project detail work.
- If the API returns unknown provider or status values, implementation should fail visibly enough for developers to catch the contract drift rather than silently inventing display states.
- The placeholder New Project dialog is intentionally temporary and should be replaced by the next project-creation ticket.
