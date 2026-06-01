# PRD: Error Handling Polish

## Problem Statement

TicketForge already has the core project and ticket generation workflow, but error and edge-case surfaces are uneven. Unexpected route errors can collapse into framework defaults, unknown routes do not reinforce the product experience, API failures are handled inconsistently, and the project generation failed state does not yet expose the clearest possible recovery path. This affects signed-in users who are trying to generate or inspect tickets, especially when the Rails API is unavailable, generation fails, or a user lands on a stale or incorrect URL.

This matters now because TicketForge depends on long-running generation, authenticated API calls, and route protection. Users need failure states that are explicit, recoverable, and visually consistent with the galaxy aesthetic rather than generic Next.js or shadcn defaults.

## Solution

Add a polished error-handling layer across the App Router experience. Unexpected render/runtime failures should land on a global galaxy-themed error boundary with "Houston, we have a problem" copy, a reset action, and a dashboard escape path. Unknown routes should render a branded "Lost in space" 404 page with a floating astronaut SVG and a clear "Back to dashboard" call to action.

Project generation failures should render a red glassmorphic card on the project detail page, preserve project context, show the best available error message, and let users retry generation without leaving the page. If the API eventually supplies a generation failure reason, the frontend should display it defensively; otherwise it should use stable generic copy.

The shared axios API client should centralize network failure feedback. Unauthorized backend responses should continue to sign out through Supabase and redirect to `/login`. Server-side failures should show a destructive toast that says "Server error, try again". Network failures without a response should show a destructive connection-oriented toast. Loading states across the affected UI should use shadcn `Skeleton` components for page/content loading while keeping small button spinners for in-button pending actions.

## User Stories

1. As a signed-in user, I want unexpected app errors to show a branded recovery page, so that I am not dropped into a generic framework error.
2. As a signed-in user, I want the global error page to say "Houston, we have a problem", so that the error state feels intentional and on-brand.
3. As a signed-in user, I want a reset button on the global error page, so that I can retry the failed route without manually refreshing.
4. As a signed-in user, I want a dashboard link on the global error page, so that I can leave a broken route and continue using the app.
5. As a keyboard user, I want the reset and dashboard actions to be keyboard-accessible, so that I can recover without a pointer.
6. As a mobile user, I want the global error page to fit cleanly at 375px width, so that recovery actions remain usable on a phone.
7. As a visitor or signed-in user, I want unknown routes to show a branded 404 page, so that I understand I am on a missing page.
8. As a visitor or signed-in user, I want the 404 page to say "Lost in space", so that the missing route is clear and consistent with TicketForge's galaxy voice.
9. As a visitor or signed-in user, I want the 404 page to include a floating astronaut SVG, so that the page feels intentionally designed rather than empty.
10. As a visitor or signed-in user, I want a "Back to dashboard" CTA on the 404 page, so that I have a clear next step.
11. As an unauthenticated visitor, I want route protection to remain in charge after clicking dashboard from the 404 page, so that private app routes are still protected.
12. As a signed-in user viewing a failed project, I want a red glassmorphic failure card, so that generation failure is visually distinct from draft and ready states.
13. As a signed-in user viewing a failed project, I want the project header to remain visible, so that I keep context for which project failed.
14. As a signed-in user viewing a failed project, I want the failure card to show the backend-provided generation error when available, so that I can understand the cause.
15. As a signed-in user viewing a failed project, I want generic failure copy when no backend failure reason exists, so that the UI remains useful with the current API contract.
16. As a signed-in user viewing a failed project, I want a Retry button, so that I can restart generation without returning to the dashboard.
17. As a signed-in user viewing a failed project, I want Retry to use the same generation flow as Generate Tickets, so that refined descriptions and pending-state protections remain consistent.
18. As a signed-in user, I want retry actions to be disabled while generation is pending, so that I do not start overlapping requests.
19. As a signed-in user, I want 401 backend responses to sign me out through Supabase and redirect to `/login`, so that expired sessions recover consistently.
20. As a signed-in user, I want API server errors to show a destructive toast saying "Server error, try again", so that transient backend failures are visible.
21. As a signed-in user, I want network errors without a backend response to show a destructive toast about the connection, so that I can distinguish connectivity issues from app bugs.
22. As a signed-in user, I want the interceptor to avoid server-side toast or redirect behavior, so that SSR and build execution remain safe.
23. As a signed-in user, I want repeated API failure feedback to remain unobtrusive, so that toasts do not stack over the workspace.
24. As a developer, I want all app-data API failure behavior to remain centralized in the shared axios client, so that feature modules do not duplicate network handling.
25. As a developer, I want the interceptor to preserve existing `skipAuthRedirectOn401` behavior, so that opt-out flows still work.
26. As a developer, I want project generation error normalization to be defensive, so that either snake_case or camelCase response attributes can be consumed.
27. As a developer, I want the project detail model to expose an optional generation failure message, so that the UI has a stable typed interface.
28. As a developer, I want current project detail normalizer tests extended for failure metadata, so that response contract changes are covered.
29. As a developer, I want loading states in affected route-level and page-level UI to use shadcn Skeleton, so that loading treatment follows the app standard.
30. As a developer, I want small button-level pending states to keep spinner icons, so that buttons do not resize or become visually ambiguous.
31. As a developer, I want the new error pages to use existing shared visual primitives where appropriate, so that the implementation does not fork the design system.
32. As a developer, I want no changes to Supabase auth provider configuration, so that GitHub-only auth remains intact.
33. As a developer, I want no backend API changes required for the initial version, so that the polish can ship independently.
34. As a QA reviewer, I want desktop and 375px mobile checks for the new pages and cards, so that recovery UI does not overflow or overlap.

## Implementation Decisions

- Add a global App Router error boundary for unexpected route errors.
- The global error boundary is a client component because it must call the Next.js `reset()` callback.
- The global error boundary uses "Houston, we have a problem" as the main heading.
- The global error boundary includes a primary reset action and a secondary dashboard navigation action.
- Add an App Router not-found page for unmatched routes.
- The not-found page uses "Lost in space" as the main heading.
- The not-found page includes an inline floating astronaut SVG rather than an external asset.
- The not-found page includes a "Back to dashboard" CTA targeting `/dashboard`.
- Route protection remains unchanged; unauthenticated users who navigate to `/dashboard` are handled by existing middleware.
- The project detail failed generation state remains inside the project page content after the project header.
- Failed generation UI uses a red glassmorphic card with destructive red border/background treatment.
- Retry on failed generation calls the same generation mutation used by the main Generate Tickets action.
- The project detail model gains an optional generation failure message field.
- The project detail normalizer defensively reads both snake_case and camelCase generation failure attributes if present.
- If no generation failure message is present, the failed card uses generic generation failure copy.
- The axios response interceptor remains the centralized place for app-data network error handling.
- 401 responses continue to sign out through Supabase and redirect to `/login`, unless `skipAuthRedirectOn401` is set.
- 5xx responses show a destructive toast with title "Server error, try again".
- Network errors without a response show a destructive toast focused on checking the connection.
- Interceptor toast and redirect side effects only run in the browser.
- Existing toast infrastructure remains in use; no new toast library is introduced.
- Existing shadcn `Skeleton` remains the loading primitive for page and content loading states.
- In-button pending states may continue to use spinner icons when the button label and dimensions should remain stable.
- No server component data fetching is introduced.
- No server data is moved into Zustand.
- No changes are made to shadcn `components/ui` primitive files.
- No backend schema or API endpoint changes are required for this PRD.

## Testing Decisions

- Tests should verify user-visible contracts and typed data boundaries rather than internal component structure.
- Extend the project detail normalizer tests to cover optional generation failure metadata from backend attributes.
- Verify that missing generation failure metadata still produces a usable failed project state with generic copy.
- Add or update focused coverage for axios response behavior where practical: 401 sign-out redirect preservation, 5xx toast behavior, and network-without-response toast behavior.
- Keep interceptor tests isolated from real Supabase and browser navigation by mocking dependencies.
- Verify that `skipAuthRedirectOn401` still suppresses the 401 redirect path.
- Manually verify the global error page because App Router error boundaries are difficult to exercise through the existing unit test setup.
- Manually verify the not-found page because the repo does not currently include route-level browser tests.
- Manually verify desktop and 375px mobile rendering for the global error page, 404 page, and failed generation card.
- Run the existing repository checks: lint, tests, and production build.
- Loading state verification should confirm shadcn Skeleton usage for page/content loading and spinner usage only for button-level pending states.

## Out of Scope

- Backend persistence of generation failure reasons.
- New Rails API endpoints or response envelopes.
- Replacing the existing toast system.
- Adding a new frontend test framework or browser automation stack.
- Changing Supabase auth, OAuth providers, scopes, or middleware behavior.
- Changing dashboard, settings, or project creation business logic beyond loading-state consistency if directly affected.
- Replacing the existing galaxy background implementation.
- Adding monitoring, error reporting SaaS, or analytics instrumentation.
- Building a full offline mode.
- Adding generation cancellation.
- Introducing custom 500 status routes outside the App Router error boundary.

## Further Notes

- Current project status values already include `failed`, and the project detail page already has a baseline failed-state card. This PRD refines that surface rather than inventing a new lifecycle state.
- Current project detail tests already cover JSON:API normalization and empty board handling; they are the best prior art for generation failure metadata coverage.
- Current dashboard and project detail pages already use shadcn Skeleton for main loading states; the implementation should audit for regressions rather than rewrite stable loading UI.
- Toast display is already globally mounted in the root layout.
- Because the toast limit is one, adding a simple centralized 5xx/network toast path should remain unobtrusive without a separate deduplication system.
