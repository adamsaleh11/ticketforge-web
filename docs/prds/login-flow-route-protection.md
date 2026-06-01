# PRD: Login Flow And Route Protection

## Problem Statement

TicketForge needs a real authentication boundary before users can access dashboard, project, and settings workflows. The current frontend foundation includes a placeholder client auth store and API token interceptor, but it does not provide GitHub OAuth login, Supabase session refresh, protected routes, OAuth callback handling, or an authenticated app navigation shell.

This affects every MVP user because TicketForge depends on GitHub identity and repository access. Users must be able to sign in with GitHub, grant the correct read-only repository scopes, land in the protected dashboard, and have the frontend send a Supabase session token to the Rails backend. Developers also need a single auth model so future project, GitHub, and ticket features do not build on a stale localStorage token flow.

## Solution

Build a Supabase-backed GitHub OAuth login flow and protected app shell. Unauthenticated users will see a galaxy-styled `/login` page with one GitHub OAuth action. Supabase will handle the OAuth exchange and session storage. The app will exchange the OAuth callback code for a session, redirect authenticated users to `/dashboard`, and protect `/dashboard`, `/projects`, and `/settings` through middleware-based session refresh.

Once signed in, users will see a protected app layout with a TicketForge wordmark and a user dropdown containing their GitHub avatar, email, a settings link, and a sign-out action. API requests will use the current Supabase session access token as the bearer token. Zustand will remain lightweight and ephemeral; Supabase will be the source of truth for auth state.

## User Stories

1. As an unauthenticated visitor, I want to see a dedicated login page, so that I know I must authenticate before using TicketForge.
2. As an unauthenticated visitor, I want the login page to preserve the galaxy aesthetic, so that authentication feels like part of the product rather than a generic provider screen.
3. As an unauthenticated visitor, I want to see the TicketForge wordmark with a violet star icon, so that I understand which product I am signing into.
4. As an unauthenticated visitor, I want a single prominent "Continue with GitHub" button, so that the authentication path is obvious.
5. As an unauthenticated visitor, I want to see that TicketForge requests read-only access to public repositories, so that I understand the requested GitHub access before continuing.
6. As an unauthenticated visitor, I want the login action to start GitHub OAuth through Supabase, so that I can sign in with my GitHub identity.
7. As a GitHub OAuth user, I want the login request to include `public_repo` and `read:user` scopes, so that TicketForge can read the public repository metadata needed for planning.
8. As a GitHub OAuth user, I want the OAuth redirect to return to the current app origin, so that local and deployed environments both complete the same flow.
9. As a GitHub OAuth user, I want OAuth callback handling to exchange the returned code for a Supabase session, so that I become authenticated in the frontend.
10. As a newly authenticated user, I want to be redirected to `/dashboard`, so that I land in the app instead of remaining on an auth callback route.
11. As an authenticated user who visits `/login`, I want to be redirected to `/dashboard`, so that I do not see a login screen when I already have a valid session.
12. As an unauthenticated user who visits `/dashboard`, I want to be redirected to `/login`, so that protected app data is not exposed without a session.
13. As an unauthenticated user who visits a project route, I want to be redirected to `/login`, so that project screens remain protected.
14. As an unauthenticated user who visits `/settings`, I want to be redirected to `/login`, so that account settings remain protected.
15. As a signed-in user, I want Supabase middleware to refresh my session on requests, so that my session remains valid across protected navigation.
16. As a signed-in user, I want API calls to include my Supabase access token as a bearer token, so that the Rails backend can verify my Supabase session.
17. As a signed-in user whose backend request receives a 401, I want the frontend to sign me out through Supabase and return me to login, so that I do not stay in a broken auth state.
18. As a signed-in user, I want the top navigation to show the TicketForge wordmark, so that I always know where I am in the app.
19. As a signed-in user, I want the top navigation to show my GitHub avatar when available, so that I can recognize my authenticated identity.
20. As a signed-in user, I want the user menu to show my email, so that I can confirm which account is active.
21. As a signed-in user, I want a settings menu item, so that I can navigate to account settings.
22. As a signed-in user, I want a sign-out menu item, so that I can end my session intentionally.
23. As a signed-in user, I want sign-out to clear the Supabase session and redirect to `/login`, so that the next user cannot access my protected pages.
24. As a mobile user, I want the login page and app navigation to fit at 375px width, so that auth and navigation work on small screens.
25. As a keyboard user, I want login, dropdown, settings navigation, and sign-out controls to be keyboard-accessible, so that I can use the auth flow without a pointer.
26. As a developer, I want Supabase client and server helpers, so that browser auth, callback handling, and middleware use one consistent integration pattern.
27. As a developer, I want auth state to come directly from Supabase rather than persisted Zustand tokens, so that the frontend has one source of truth.
28. As a developer, I want a `useAuth` hook that exposes user, session, sign-out, and loading state, so that protected client components can consume auth consistently.
29. As a developer, I want environment templates to include Supabase URL and anon key, so that local setup is explicit.
30. As a developer, I want missing Supabase configuration to fail clearly, so that auth setup issues are diagnosed quickly.
31. As a developer, I want no email/password or non-GitHub providers, so that the frontend matches the product's GitHub-only auth model.
32. As a developer, I want generated UI primitives to stay business-logic-free, so that auth behavior lives in feature/shared modules rather than shadcn internals.

## Implementation Decisions

- Supabase is the source of truth for authentication state.
- GitHub OAuth is the only supported sign-in method.
- The GitHub OAuth request uses `public_repo read:user` scopes.
- The login redirect target is the current app origin plus `/auth/callback`.
- The OAuth callback exchanges the returned code for a Supabase session and redirects to `/dashboard`.
- Middleware uses the `@supabase/ssr` session refresh pattern.
- Middleware protects `/dashboard`, `/projects`, and `/settings`, including descendants.
- Middleware redirects authenticated users from `/login` to `/dashboard`.
- Middleware excludes static assets and framework internals from auth checks.
- The protected app shell uses a top navigation with TicketForge branding and a user dropdown.
- The user dropdown displays GitHub avatar metadata when available and falls back gracefully when it is absent.
- Sign-out calls Supabase sign-out and redirects to `/login`.
- The `useAuth` hook reads the initial Supabase session, subscribes to auth state changes, exposes user/session/loading state, and provides sign-out behavior.
- Zustand is retained only for lightweight ephemeral auth UI state; it does not persist Supabase user, token, or session data.
- The API client attaches the current Supabase session access token to application API requests.
- On backend 401 responses in the browser, the API client signs out through Supabase and redirects to `/login`.
- App data still flows through the shared API client; auth-specific operations flow through Supabase.
- Environment configuration includes public API URL, Supabase project URL, and Supabase anon key.
- Supabase project URL and anon key are public frontend configuration values, but service-role keys are never introduced to the frontend.
- Missing Supabase environment values should produce a clear runtime error rather than failing silently.
- No frontend-owned database schema changes are required.
- No Rails API contract changes are required beyond continuing to accept a bearer token that Rails verifies as a Supabase session token.
- Placeholder protected pages may be introduced where needed to make route protection and layout behavior verifiable.
- The galaxy aesthetic remains mandatory for login and protected navigation: glass surfaces, violet glow, and existing background treatment should be preserved.

## Testing Decisions

- Tests and verification should focus on externally visible auth behavior: redirects, session handling, sign-out, protected route access, and bearer token attachment.
- Middleware behavior should be covered by route-level verification: unauthenticated protected routes redirect to `/login`, authenticated `/login` redirects to `/dashboard`, and static assets are not blocked.
- The OAuth callback should be verified for successful code exchange and dashboard redirect, plus graceful handling of missing or failed callback code.
- The login action should be verified to call GitHub OAuth through Supabase with the expected scopes and redirect target.
- The `useAuth` hook should be verified by behavior where practical: initial loading state, session resolution, auth-state subscription updates, and sign-out redirect.
- The API client should be verified to attach the current Supabase access token and to sign out/redirect on 401 responses.
- The top navigation should be verified for avatar fallback, email display, settings navigation, sign-out behavior, keyboard access, and mobile layout.
- Visual verification should include `/login` and protected app layout at desktop width and 375px width.
- Existing repository verification uses lint and production build checks; this work should preserve those checks.
- If the repo still has no automated test harness when implementation starts, the plan should call out practical build/lint/browser verification and recommend focused tests once a harness is introduced.

## Out of Scope

- Email/password sign-in.
- Additional OAuth providers.
- Supabase service-role keys in the frontend.
- Supabase RLS policy design.
- Backend Rails token verification changes.
- GitHub repository listing, importing, or linking.
- Project creation, ticket generation, provider selection, or Ollama setup.
- Full dashboard product functionality beyond placeholders needed to verify auth routing.
- A full account settings implementation beyond navigation target support.
- A marketing landing page.
- Storing Supabase sessions manually in localStorage.
- Persisting server data in Zustand.
- Editing generated shadcn/ui primitives.

## Further Notes

- Local OAuth testing requires Supabase project configuration and GitHub OAuth redirect settings that allow the local callback URL.
- The frontend environment must provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before the real auth flow can run.
- The anon key is acceptable in `NEXT_PUBLIC_` frontend configuration; the service-role key is not.
- The existing foundation PRD's localStorage token auth model is superseded by this PRD for auth work.
- Future project and GitHub features should consume authenticated API access through the updated API client rather than reading auth state directly.
