# TicketForge Web — Agent Instructions

## What this repo is
Next.js 14 (App Router) frontend for TicketForge. Users sign in, describe a project, optionally link a GitHub repo, pick an LLM provider, and get back phased engineering tickets they can copy-paste into Claude Code or Codex.

Backend lives in a separate repo: `ticketforge-api` (Rails). All data comes from `NEXT_PUBLIC_API_URL`.

## Stack
- Next.js 14 App Router, TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (component library — install per-component, don't pull all of it)
- Zustand for client state, TanStack Query for server state
- axios with auth interceptor (Bearer token from localStorage)
- react-hook-form + zod for forms
- Deployed on Vercel free tier

## Design system — galaxy aesthetic
This is the soul of the product. Don't water it down.

**Palette (Tailwind config):**
- `background`: `#0a0e27` (deep space navy)
- `foreground`: `#e4e6f1`
- `primary`: `#8b5cf6` (violet)
- `accent`: `#c084fc` (light violet)
- `muted`: `#1a1f3a`
- `border`: `rgba(139, 92, 246, 0.2)`

**Typography:**
- Headings: Space Grotesk
- Body: Inter

**Recurring visual elements:**
- `<Starfield />` canvas component, fixed at `z-index: -10` in root layout. 200 particles, twinkling, slow drift.
- Radial nebula gradient overlay (purple → transparent) on root layout.
- Glassmorphism utility: `bg-white/5 backdrop-blur-md border border-white/10`. Use for cards, modals, navbars.
- Violet glow on primary CTAs: `shadow-[0_0_30px_rgba(139,92,246,0.5)]`.
- Repo badges: frontend = violet, backend = blue, fullstack = violet→blue gradient, devops = orange.

## Project structure conventions

```
app/
  (auth)/login, /signup         # Public, full-screen galaxy bg
  (app)/dashboard, /projects, /settings   # Protected, with nav
  layout.tsx                     # Mounts <Starfield />
components/
  ui/                            # shadcn components, do not edit directly
  shared/                        # Starfield, GlassCard, RepoBadge, etc.
  features/                      # Feature-specific (NewProjectDialog, TicketCard, etc.)
lib/
  api.ts                         # axios instance + interceptors
  auth.ts                        # JWT helpers
  hooks/                         # useAuth, useProjects, etc.
stores/                          # Zustand stores
```

## Hard rules
1. **TypeScript strict mode.** No `any` unless explicitly justified in a comment.
2. **Server state goes in TanStack Query, never Zustand.** Zustand is for auth, UI state, draft form data only.
3. **All API calls go through `lib/api.ts`.** No bare `fetch` calls scattered around.
4. **Auth token storage:** localStorage. JWT attached via axios interceptor. On 401, clear token + redirect to `/login`.
5. **Forms:** `react-hook-form` + `zod` resolver. No uncontrolled inputs, no manual `useState` for form fields.
6. **Loading states everywhere.** Every async UI element gets a shadcn `Skeleton` or spinner. No blank flashes.
7. **Mobile responsive.** Test at 375px width. Cards stack, nav collapses to hamburger.
8. **Accessibility:** all interactive elements keyboard-navigable, all icons have aria-labels, color contrast meets WCAG AA.

## shadcn rules
- Install components as needed via `npx shadcn@latest add <component>`. Don't pre-install everything.
- Don't edit files in `components/ui/` after install except to apply the galaxy palette via CSS vars in `globals.css`.
- Wrap shadcn components in feature components when adding business logic — keep `ui/` pure.

## State management rules
- **Auth:** Zustand store `useAuthStore` with `user`, `token`, `login()`, `logout()`.
- **Projects, tickets, GitHub data:** TanStack Query. Query keys: `['projects']`, `['project', id]`, `['github', 'repos']`.
- **Ephemeral UI:** local `useState`. Don't reach for Zustand for a modal open/close.

## Env vars
`NEXT_PUBLIC_API_URL` — backend URL. `http://localhost:3001` in dev, Render URL in prod.

## What NOT to do
- Don't use the Next.js Pages Router. App Router only.
- Don't add Redux, Jotai, Recoil, or any state library beyond Zustand + TanStack Query.
- Don't add a CSS-in-JS library. Tailwind only.
- Don't ship without loading skeletons.
- Don't break the galaxy aesthetic. If a component looks generic shadcn-default, it's wrong — add the violet, the glassmorphism, the glow.
- Don't store JWT in cookies (we're not doing SSR auth for MVP).
- Don't fetch in server components for this MVP — keep everything client-side via TanStack Query for simplicity.

## When stuck
Ask before guessing. Especially around: auth token refresh flows, query invalidation patterns, navigation guards.
