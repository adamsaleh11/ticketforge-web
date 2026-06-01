# PRD: TicketForge Web Foundation

## Problem Statement

TicketForge needs a frontend foundation that can support its MVP workflow: users sign in, describe a project, optionally connect GitHub context, select an LLM provider, and receive phased engineering tickets they can use in coding agents. The current repository does not contain a Next.js application, so there is no shared application shell, design system, API client, auth state boundary, or component baseline for future product work.

This matters now because downstream feature work will be slower and less consistent without a strict foundation. The product also has a specific galaxy aesthetic that should be established from the first scaffold rather than retrofitted later.

## Solution

Create a new TicketForge web application using Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, and shadcn/ui. The first usable experience should establish the application shell, typography, galaxy background system, reusable glass styling, API/auth/query infrastructure, and a minimal styled home screen that proves the foundation works.

The foundation should be intentionally scoped: it should prepare the app for auth, project, GitHub, and ticket-generation workflows without building those full workflows yet. Future product features should inherit the same visual language, routing conventions, state-management boundaries, and API access pattern.

## User Stories

1. As a developer, I want the app scaffolded directly in the TicketForge web repository, so that future work starts from the correct project root.
2. As a developer, I want a Next.js 14 App Router project, so that the frontend follows the agreed routing architecture.
3. As a developer, I want TypeScript strict mode enabled, so that unsafe contracts are caught early.
4. As a developer, I want Tailwind CSS configured with the TicketForge galaxy palette, so that all UI starts from the product design system.
5. As a user, I want the app background to feel like TicketForge rather than generic starter UI, so that the product has a distinctive first impression.
6. As a user, I want an animated starfield background, so that the galaxy aesthetic is visible across the application.
7. As a user with reduced motion preferences, I want the background to avoid unnecessary animation, so that the app respects my accessibility settings.
8. As a user on a high-DPI display, I want the starfield to render sharply, so that the visual foundation feels polished.
9. As a user, I want a subtle nebula gradient behind the interface, so that screens have depth without harming readability.
10. As a developer, I want reusable glassmorphism styling, so that cards, modals, and navigation can share a consistent visual treatment.
11. As a developer, I want Inter used for body text and Space Grotesk used for headings, so that typography matches the product direction.
12. As a developer, I want the requested shadcn/ui components installed individually, so that future screens have the required UI primitives without importing the whole library.
13. As a developer, I want generated UI primitives kept free of business logic, so that feature components can wrap them without making the design system brittle.
14. As a developer, I want an axios API client configured from the public API URL, so that all future backend calls use one consistent boundary.
15. As a signed-in user, I want authenticated API requests to include my bearer token, so that backend-protected resources can be accessed.
16. As a signed-in user with an expired or invalid token, I want the app to clear local auth state and return me to login, so that I do not remain in a broken session.
17. As a developer, I want auth state stored in Zustand, so that user and token state has a small client-side owner.
18. As a developer, I want server state prepared for TanStack Query, so that projects, tickets, and GitHub data do not end up in the auth store.
19. As a developer, I want a provider boundary for TanStack Query, so that future client features can add queries without reworking the root shell.
20. As a developer, I want local development configured with the backend URL, so that the frontend can connect to the Rails API in development.
21. As a developer, I want an example environment file, so that setup expectations survive outside one local machine.
22. As a mobile user, I want the initial screen to fit at 375px width, so that the foundation does not introduce mobile layout debt.
23. As a keyboard user, I want interactive controls to remain keyboard-accessible, so that future screens inherit accessible primitives.
24. As a developer, I want lint and production build checks to pass, so that the scaffold is immediately safe to build on.
25. As a developer, I want the foundation visually verified in a browser, so that visual requirements like starfield, fonts, and responsive layout are not assumed from code alone.

## Implementation Decisions

- Build a fresh Next.js 14 App Router application directly in the repository root.
- Use root-level application, component, library, and store directories rather than a separate source directory.
- Enable strict TypeScript and the default Next.js lint setup.
- Configure import aliases using the app-root alias convention.
- Use Tailwind CSS as the only styling framework.
- Configure Tailwind and global CSS variables to express the galaxy palette: deep navy background, pale foreground, violet primary, light violet accent, muted navy surfaces, and translucent violet borders.
- Initialize shadcn/ui and install only the requested components: button, input, card, dialog, toast, dropdown menu, tabs, badge, skeleton, separator, label, textarea, and select.
- Keep generated shadcn/ui primitives pure; business behavior belongs in shared or feature components.
- Use the shadcn toast implementation because toast was explicitly requested.
- Use framework-managed Google fonts for Inter and Space Grotesk.
- Mount a single global starfield background from the root layout.
- Implement the starfield as a client-side canvas component with exactly 200 particles, random opacity oscillation, slow drift, high-DPI scaling, viewport resize handling, and reduced-motion behavior.
- Add a radial purple-to-transparent nebula overlay behind page content.
- Add a reusable glassmorphism utility and a shared glass card abstraction for future screens.
- Install Zustand and create a small auth store containing user, token, login behavior, and logout behavior.
- Keep the initial user model minimal: identifier, email, and optional display name.
- Persist auth state to localStorage.
- Install axios and create one shared API client configured from the public API URL.
- Attach bearer tokens through an axios request interceptor by reading local auth state from localStorage.
- Handle unauthorized responses in the API client by clearing auth state and redirecting to login on the client.
- Install TanStack Query and add a client provider boundary at the application root.
- Add local and example environment configuration for the backend API URL.
- Create a minimal galaxy-styled home screen that proves the scaffold, fonts, shadcn components, glass styling, and background layers work.
- Do not build login, signup, dashboard, project creation, GitHub integration, provider selection, or ticket-generation workflows in this foundation scope.

## Testing Decisions

- Verify external behavior and contracts rather than implementation details.
- Run lint checks to catch TypeScript, React, accessibility, and Next.js issues exposed by the scaffold.
- Run a production build to verify the App Router project compiles and font, Tailwind, and provider wiring are valid.
- Visually verify the app in a browser at desktop size to confirm the starfield, nebula, fonts, glass surfaces, and initial screen render correctly.
- Visually verify the app at 375px width to confirm the initial screen is responsive and does not overflow.
- Test the auth/API boundary through behavior that matters: bearer token attachment when local auth exists and local auth clearing on unauthorized responses. If no test harness is included in the scaffold, call this out as follow-up test coverage rather than inventing a broad test suite in this foundation task.
- No prior test patterns exist in the repository because the application is greenfield.

## Out of Scope

- Full login and signup screens.
- Route protection and navigation guards beyond the API client unauthorized-response behavior.
- Dashboard, projects, settings, ticket list, ticket detail, or ticket export workflows.
- GitHub repository linking or repository-type badges beyond preserving design rules for future work.
- LLM provider selection and ticket generation.
- Backend API changes.
- Token refresh flows.
- SSR authentication or cookie-based auth.
- A full automated visual regression suite.
- Adding state libraries beyond Zustand and TanStack Query.
- Editing generated shadcn/ui primitives after installation.

## Further Notes

- The backend is expected to be a separate Rails API reachable through the public API URL.
- The development backend URL is assumed to be `http://localhost:3001`.
- Future forms should use react-hook-form and zod, but no product forms are included in this foundation scope.
- Future server state should use TanStack Query with stable keys for projects, individual projects, and GitHub repository data.
- Future screens should preserve the galaxy aesthetic rather than falling back to generic shadcn defaults.
- The foundation should leave the repository ready for later vertical slices: authentication screens, protected app navigation, project creation, GitHub context, provider selection, and ticket output.
