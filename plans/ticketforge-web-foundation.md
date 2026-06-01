# Plan: TicketForge Web Foundation

> Source PRD: `docs/prds/ticketforge-web-foundation.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Use Next.js 14 App Router with root-level app structure. The initial route is `/`; future auth and protected app routes will follow the documented route groups.
- **Schema**: No frontend-owned persistence schema is introduced in this foundation. Local auth state is persisted in browser storage.
- **Key models**: Minimal authenticated user model with identifier, email, and optional display name. Future projects, tickets, and GitHub data remain server state.
- **Auth**: JWT token lives in localStorage through the client auth store. API requests attach a bearer token through the shared axios client. Unauthorized responses clear client auth state and redirect to `/login` on the client.
- **External services**: The Rails backend is reached through `NEXT_PUBLIC_API_URL`, using `http://localhost:3001` in local development.
- **Design system**: Tailwind plus individually installed shadcn/ui components. The galaxy palette, global starfield, nebula overlay, glassmorphism utility, Inter body font, and Space Grotesk headings form the visual baseline.

---

## Phase 1: Scaffold And Tooling Baseline

**User stories**: 1, 2, 3, 4, 11, 12, 13, 20, 21, 24

### What to build

Create the Next.js 14 App Router application directly in the repository root with strict TypeScript, Tailwind CSS, default linting, app-root import aliases, environment examples, framework-managed fonts, and the requested shadcn/ui component set.

### Acceptance criteria

- [ ] The app exists at the repository root and uses App Router.
- [ ] TypeScript strict mode and Next.js linting are enabled.
- [ ] Tailwind is configured and ready for the TicketForge palette.
- [ ] The requested shadcn/ui components are installed individually.
- [ ] Environment configuration includes the local API URL and a committed example.
- [ ] The app can run the baseline lint and build scripts.

---

## Phase 2: Galaxy Application Shell

**User stories**: 5, 6, 7, 8, 9, 10, 22, 25

### What to build

Add the global visual foundation: animated starfield, reduced-motion fallback, high-DPI canvas support, radial nebula overlay, glassmorphism utility, shared glass card abstraction, and a minimal responsive home screen that demonstrates the brand system without becoming a product workflow.

### Acceptance criteria

- [ ] The starfield is mounted globally behind all page content.
- [ ] The starfield renders 200 particles with twinkling opacity and slow drift.
- [ ] Reduced-motion users receive a static background.
- [ ] The nebula overlay appears behind content without blocking interaction.
- [ ] Glass styling is reusable through a utility and shared component.
- [ ] The initial screen renders cleanly on desktop and at 375px width.

---

## Phase 3: Client Runtime Providers

**User stories**: 18, 19, 23

### What to build

Add the client provider boundary required for TanStack Query and future client-side features. Ensure the root application structure remains accessible and does not force server-state data into client UI stores.

### Acceptance criteria

- [ ] The application root includes a TanStack Query provider boundary.
- [ ] The query client is created on the client and reused for the app session.
- [ ] The home screen uses semantic structure and keyboard-accessible controls.
- [ ] No server state is stored in Zustand.

---

## Phase 4: Auth State And API Boundary

**User stories**: 14, 15, 16, 17

### What to build

Add the minimal client auth store and shared API client. Persist user and token state locally, attach bearer tokens to API requests, and clear local auth state on unauthorized responses.

### Acceptance criteria

- [ ] Auth state includes user, token, login, set token/user behavior, and logout.
- [ ] Auth state persists to localStorage.
- [ ] The shared API client reads its base URL from the public API environment variable.
- [ ] Requests attach a bearer token when one exists.
- [ ] Unauthorized responses clear local auth state and redirect to `/login` in the browser.

---

## Phase 5: Verification And Handoff Readiness

**User stories**: 22, 24, 25

### What to build

Run the practical verification suite for a greenfield frontend foundation, including static checks, production build, local runtime, and browser inspection at desktop and mobile widths.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] The app runs locally.
- [ ] Browser verification confirms the galaxy background, fonts, glass surfaces, and initial screen render.
- [ ] Mobile verification at 375px confirms there is no horizontal overflow or broken stacking.
- [ ] Any remaining test coverage gaps are documented.
