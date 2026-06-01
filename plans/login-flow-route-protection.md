# Plan: Login Flow And Route Protection

> Source PRD: `docs/prds/login-flow-route-protection.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/login` is the public auth entry point, `/auth/callback` handles Supabase OAuth returns, and `/dashboard`, `/projects`, and `/settings` are protected app routes.
- **Schema**: No frontend-owned persistence schema is introduced. Supabase owns session persistence through its client and SSR helpers.
- **Key models**: Supabase `Session` and `User` are the auth models exposed through the frontend auth hook. Zustand stores only ephemeral UI state.
- **Auth**: GitHub OAuth through Supabase is the only sign-in method. Middleware refreshes sessions and protects app routes. API requests attach the Supabase access token as a bearer token.
- **External services**: Supabase handles OAuth/session state. The Rails backend continues to receive authenticated requests through `NEXT_PUBLIC_API_URL`.
- **Design system**: Login and protected navigation preserve the existing galaxy background, glassmorphism surfaces, violet primary actions, and compact app UI density.

---

## Phase 1: Supabase Auth Foundation

**User stories**: 16, 17, 26, 27, 28, 29, 30, 31, 32

### What to build

Introduce the Supabase browser/server integration and make Supabase the only auth source of truth. Replace persisted local token auth with a lightweight ephemeral auth UI store, add a session-aware `useAuth` hook, and update the shared API client so app data requests carry the current Supabase access token.

### Acceptance criteria

- [ ] Supabase browser and server helpers are available for client auth, callback handling, and middleware.
- [ ] Missing Supabase public configuration fails with a clear error.
- [ ] Zustand no longer persists user, token, or session data.
- [ ] `useAuth` exposes user, session, sign-out, and loading state from Supabase.
- [ ] API requests attach the current Supabase access token when one exists.
- [ ] Browser-side 401 responses sign out through Supabase and redirect to `/login`.

---

## Phase 2: GitHub Login And Callback

**User stories**: 1-10, 24, 25

### What to build

Build the public login experience and OAuth callback path. The login page presents the TicketForge wordmark, one GitHub OAuth action, the required repository-access small print, loading/error states, and a responsive glassmorphic layout. The callback exchanges the OAuth code for a Supabase session and redirects users into the dashboard.

### Acceptance criteria

- [ ] `/login` renders a centered glassmorphic card above the galaxy background.
- [ ] The login card shows a TicketForge wordmark with a violet star icon.
- [ ] The only sign-in action is a large "Continue with GitHub" button with violet glow.
- [ ] The GitHub OAuth call uses `public_repo read:user` scopes and redirects to the current origin's `/auth/callback`.
- [ ] The login action has disabled/loading and error states.
- [ ] `/auth/callback` exchanges the returned code for a session and redirects to `/dashboard`.
- [ ] Callback failures redirect to `/login` with an error indication.
- [ ] The login layout works at desktop and 375px widths.

---

## Phase 3: Route Protection Middleware

**User stories**: 11-15

### What to build

Add middleware-based session refresh and route protection using the Supabase SSR pattern. Protected routes redirect unauthenticated users to login, authenticated users are redirected away from login to the dashboard, and static/framework assets are left alone.

### Acceptance criteria

- [ ] Middleware refreshes the Supabase session on each matched request.
- [ ] Unauthenticated visits to `/dashboard`, `/projects`, `/projects/*`, `/settings`, and `/settings/*` redirect to `/login`.
- [ ] Authenticated visits to `/login` redirect to `/dashboard`.
- [ ] Static assets and Next.js internals are excluded from auth checks.
- [ ] Redirects preserve stable, loop-free behavior.

---

## Phase 4: Protected App Shell And Sign-Out

**User stories**: 18-23, 24, 25

### What to build

Create the protected app layout with a compact galaxy-styled top navigation. The nav shows the TicketForge wordmark, current user identity, settings navigation, avatar fallback behavior, and sign-out flow. Add minimal protected page placeholders where needed so the shell and middleware can be verified.

### Acceptance criteria

- [ ] Protected app routes render under a shared top navigation.
- [ ] The nav shows the TicketForge wordmark on the left.
- [ ] The user menu shows GitHub avatar metadata when available and a fallback when absent.
- [ ] The user menu shows email or a stable username fallback.
- [ ] Settings navigation points to `/settings`.
- [ ] Sign-out clears the Supabase session and redirects to `/login`.
- [ ] The nav remains keyboard-accessible and usable at 375px width.

---

## Phase 5: Verification And Auth Edge Cases

**User stories**: All, with emphasis on failures and mobile/accessibility

### What to build

Run the frontend QA pass for auth behavior and visual quality. Verify lint/build, environment error behavior, callback failure behavior, 401 sign-out behavior, and responsive rendering for login and protected app layout.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] `/login` visually matches the galaxy/glass/violet design requirements.
- [ ] Protected app layout visually matches the product shell requirements.
- [ ] Desktop and 375px browser checks show no overflow or incoherent overlap.
- [ ] Any verification that cannot run because real Supabase keys are absent is documented.
