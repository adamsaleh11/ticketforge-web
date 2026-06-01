# PRD: GitHub Repository Combobox

## Problem Statement

TicketForge users can create projects from a written description, but the GitHub repository field in the New Project dialog is still a disabled placeholder. This blocks an important MVP use case: users who want TicketForge to plan work against an existing codebase cannot attach the repository that should provide implementation context.

Repository context is optional because many users may be planning a new project from scratch. For users building on an existing codebase, however, selecting a repository should let the backend know which GitHub repo to inspect before creating a plan. The current UI communicates that repository linking is coming, but it does not fetch repositories, does not allow searching, and does not submit `github_repo_full_name` with project creation.

## Solution

Replace the disabled GitHub repository placeholder in the New Project dialog with a searchable shadcn Command-based combobox. When the dialog opens, the frontend fetches the signed-in user's GitHub repositories through the existing authenticated API boundary using TanStack Query. The combobox shows each repository's full name, language metadata, and a private badge when applicable.

Selecting a repository stores its `full_name` in the project form state. The field remains optional: users can skip it, clear a previous selection, or create a project when repository loading fails. When selected, the project create payload includes `github_repo_full_name` so the backend can use that repository as context before generating the plan.

If the GitHub repository request returns 401, the dialog should show a destructive toast saying "GitHub access expired, please sign in again" with a Sign out action. This 401 path should be local enough to preserve the required toast UX instead of immediately redirecting before the user can respond.

## User Stories

1. As a signed-in user, I want the New Project dialog to show an active GitHub repository selector, so that I can connect an existing codebase to a new TicketForge project.
2. As a signed-in user building a feature on an existing codebase, I want to choose a GitHub repository, so that TicketForge can use that codebase as context before creating a plan.
3. As a signed-in user planning a greenfield project, I want to skip repository selection, so that I can create a project without GitHub context.
4. As a signed-in user, I want the repository selector to fetch my available repositories only when I am creating a project, so that the dashboard does not do unnecessary GitHub work.
5. As a signed-in user, I want a loading skeleton while repositories are fetched, so that the form does not appear broken or inert.
6. As a signed-in user, I want to search repositories by name, full name, or language, so that I can quickly find the right codebase.
7. As a signed-in user, I want each repository option to show the repository full name, so that I can distinguish repos with similar names across owners.
8. As a signed-in user, I want each repository option to show language metadata when available, so that I can quickly recognize the stack.
9. As a signed-in user, I want private repositories to show a Private badge, so that I understand which selected repos are not public.
10. As a signed-in user, I want selecting a repository to store its `owner/name` full name, so that the backend receives the stable GitHub identifier it needs.
11. As a signed-in user, I want to clear a selected repository, so that I can change my mind and create the project without repo context.
12. As a signed-in user, I want repository selection to remain disabled while project creation is submitting, so that the submitted payload cannot change mid-request.
13. As a signed-in user, I want repository fetch failures other than expired access to show a retry path, so that I can recover without closing the dialog.
14. As a signed-in user, I want repository fetch failures not to block project creation, so that optional GitHub context never prevents project planning.
15. As a signed-in user, I want expired GitHub access to show a clear toast, so that I understand why repositories cannot be loaded.
16. As a signed-in user with expired GitHub access, I want a Sign out action in the toast, so that I can restart authentication deliberately.
17. As a keyboard user, I want to open, search, select, and clear repository choices without a pointer, so that the field is fully keyboard accessible.
18. As a screen reader user, I want the repository selector to have a clear label, button state, and option text, so that I can understand and operate it.
19. As a mobile user, I want the repository selector and command popover to fit at 375px width, so that I can create projects on small screens.
20. As a developer, I want GitHub repository server state handled by TanStack Query with the `["github", "repos"]` query key, so that it follows the app's server-state conventions.
21. As a developer, I want GitHub repository fetching to use the shared authenticated API client, so that Supabase bearer-token handling stays centralized.
22. As a developer, I want the repository response normalized into a stable frontend model, so that the UI is insulated from minor Rails serializer shape differences.
23. As a developer, I want project creation to include `github_repo_full_name` only when a repository is selected, so that empty optional values are not sent as misleading data.
24. As a developer, I want shadcn UI primitives to remain business-logic-free, so that the repository selector's behavior stays in feature-level code.
25. As a developer, I want the selector to preserve the galaxy aesthetic, so that the New Project dialog does not regress into generic default styling.

## Implementation Decisions

- The GitHub repository selector replaces the disabled repository placeholder in the existing New Project dialog.
- Repository selection is optional and must never block project creation when unset.
- Repository data is fetched through TanStack Query with the stable query key `["github", "repos"]`.
- The GitHub repository query calls the Rails API endpoint represented by `GET /api/v1/github/repos` through the shared authenticated API client.
- Because the shared API client already owns the `/api/v1` base path, feature code should call the GitHub repos resource path relative to that base.
- Repository fetching is enabled when the New Project dialog is open, not during passive dashboard viewing.
- Repository data is server state and must not be stored in Zustand.
- A dedicated GitHub repository hook should expose normalized repository data, loading state, error state, and retry behavior.
- The frontend repository model includes at minimum `fullName`, `name`, `language`, and `isPrivate`.
- The normalizer should accept defensive Rails response shapes, including a raw array or an object with a `data` array.
- The normalizer should accept snake_case and camelCase variants for repository fields where practical.
- The combobox uses shadcn Command as the searchable list foundation.
- If the repository combobox requires additional shadcn primitives, they should be installed rather than hand-rolled.
- Business logic for selecting, clearing, loading, and error handling belongs in feature-level components, not generated UI primitives.
- Search is client-side over the fetched repository list.
- Search should match repository full name, repository name, and language metadata.
- Each option displays the repository full name as the primary label.
- Each option displays language metadata as muted secondary text when available.
- Each option displays a Private badge when the repository is private.
- Selection stores the repository `full_name` equivalent in the form state as `github_repo_full_name`.
- The form schema includes optional repository full name state and treats empty selection as absent.
- The create project payload includes `github_repo_full_name` only when the user selected a repository.
- The create project payload omits or nulls the repository field when the user skipped or cleared selection; the preferred frontend behavior is to omit empty optional values.
- The combobox is disabled while the create project mutation is pending.
- The submit button remains enabled while repositories are loading or in a non-401 error state, assuming all required project fields are valid.
- The loading state for repository fetching uses a shadcn Skeleton in the repository field slot.
- Non-401 repository fetch errors show an inline retry state and do not block project creation.
- A 401 from the GitHub repos request shows a destructive toast with title "GitHub access expired, please sign in again".
- The 401 toast includes a Sign out action that signs out through Supabase and redirects through the existing auth flow.
- The GitHub repos 401 flow needs a local handling path so the required toast can be seen before sign-out.
- The global API 401 behavior should remain intact for other backend requests.
- The selector must use glassmorphic styling, dark surfaces, violet focus rings, restrained badges, and mobile-safe spacing.
- No frontend-owned persistence schema changes are required.

## Testing Decisions

- Verification should focus on user-visible behavior and API/form contracts rather than internal component structure.
- The GitHub repos query should be tested or manually verified to use the `["github", "repos"]` query key and the shared authenticated API boundary.
- Repository response normalization should be tested or manually verified against raw-array and `{ data: [...] }` shapes.
- The combobox should be verified for loading, loaded, empty, selected, cleared, non-401 error, retry, and 401 expired-access states.
- Search should be verified by full name, short name, and language.
- Form submission should be verified with no repository selected and with a repository selected.
- The selected repository submission contract should be verified to send `github_repo_full_name` only when selected.
- Non-401 repository fetch failures should be verified to keep project submission available.
- The 401 repository fetch path should be verified to show the required toast and expose a working Sign out action.
- Accessibility verification should include labels, keyboard open/search/select/clear behavior, focus handling, and screen-reader-friendly option text.
- Responsive verification should include the dialog and command popover at desktop and 375px mobile widths.
- Existing repository checks should include lint and production build.
- The repository currently does not expose an automated frontend test harness; this PRD does not require adding a new test framework for this narrow slice.

## Out of Scope

- Backend implementation of `GET /api/v1/github/repos`.
- Backend implementation of repository code ingestion or repository context extraction.
- Backend changes to ticket generation based on repository contents.
- GitHub OAuth scope changes beyond the existing Supabase GitHub OAuth setup.
- Remote repository search, pagination, infinite scroll, or server-side filtering.
- Repository branch selection.
- Repository file browsing or preview inside the New Project dialog.
- Persisting GitHub repository data in Zustand.
- Making repository selection required.
- Changing project detail pages or dashboard cards beyond preserving existing display of linked repository data.
- Introducing a new automated frontend test framework unless separately requested.
- Editing generated shadcn UI primitives after installation.

## Further Notes

- This PRD assumes the Rails backend already exposes or will expose an authenticated GitHub repositories endpoint under the existing API base URL.
- This PRD assumes the backend can use `github_repo_full_name` during project creation to associate repository context with the project.
- This PRD assumes the existing Supabase GitHub OAuth flow grants enough repository access for the backend to list the user's repositories.
- If the backend later supports pagination or remote search, the query hook can evolve without changing the project form contract.
- If the backend returns an empty repository list, the selector should communicate the empty state while keeping project creation available.
