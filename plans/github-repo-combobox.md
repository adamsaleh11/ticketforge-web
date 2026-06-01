# Plan: GitHub Repository Combobox

> Source PRD: `docs/prds/github-repo-combobox.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: The feature lives inside the existing New Project dialog opened from the dashboard. Successful project creation continues to navigate to `/projects/:id`.
- **Schema**: No frontend-owned persistence schema is introduced. The optional repository association is submitted to the Rails backend as `github_repo_full_name`.
- **Key models**: GitHub repositories are normalized to a frontend model with `fullName`, `name`, `language`, and `isPrivate`. Project creation accepts optional `github_repo_full_name`.
- **Auth**: Supabase remains the auth source. GitHub repository data is fetched through the shared authenticated API client, with local handling for the GitHub repos 401 UX.
- **External services**: `GET /api/v1/github/repos` returns repositories. `POST /api/v1/projects` creates projects and receives `github_repo_full_name` only when selected.
- **Server state**: TanStack Query owns repository fetching with query key `["github", "repos"]`; Zustand is not used for repository or project server data.
- **UI system**: The selector uses shadcn Command-based combobox primitives styled to match the existing galaxy aesthetic.

---

## Phase 1: GitHub Repos Query Contract

**User stories**: 4, 20, 21, 22

### What to build

Add the repository query boundary for fetching GitHub repositories only while the New Project dialog is open. Normalize supported Rails response shapes into a stable frontend repository model and expose loading, error, retry, and data states through TanStack Query.

### Acceptance criteria

- [ ] The repository query uses query key `["github", "repos"]`.
- [ ] Repository data is fetched through the shared authenticated API client.
- [ ] Feature code calls the GitHub repos resource relative to the existing `/api/v1` base URL.
- [ ] Fetching is enabled when the New Project dialog is open.
- [ ] Raw array and `{ data: [...] }` response shapes are accepted.
- [ ] Snake_case and camelCase repository fields are normalized where practical.
- [ ] Repository data is not stored in Zustand.

---

## Phase 2: Optional Repo Field In Project Creation

**User stories**: 3, 10, 11, 12, 23

### What to build

Add optional repository full-name state to the New Project form and creation payload. Users can skip or clear repository selection, and selected repositories are submitted as `github_repo_full_name` without sending empty optional values.

### Acceptance criteria

- [ ] The form includes optional `github_repo_full_name` state.
- [ ] Selecting a repository stores its `owner/name` full name in form state.
- [ ] Clearing selection returns the form to no repository value.
- [ ] The create payload includes `github_repo_full_name` only when selected.
- [ ] The create payload omits the repository field when skipped or cleared.
- [ ] Repository selection is disabled while project creation is pending.
- [ ] Project submission remains available while repositories are loading or unavailable.

---

## Phase 3: Searchable Command Combobox

**User stories**: 1, 2, 5, 6, 7, 8, 9, 17, 18, 19, 24, 25

### What to build

Replace the disabled placeholder with a shadcn Command-based combobox. The selector shows a skeleton while loading, supports client-side search, displays repository full name, language, and private status, and fits the existing dialog styling across desktop and mobile.

### Acceptance criteria

- [ ] The disabled "Coming in Phase 4" placeholder is removed.
- [ ] A skeleton appears in the GitHub repository field slot while repositories load.
- [ ] The combobox can search by full name, short name, and language.
- [ ] Each option displays repository full name as the primary label.
- [ ] Language metadata appears when available.
- [ ] Private repositories show a Private badge.
- [ ] Selected state displays the chosen repository full name.
- [ ] A selected repository can be cleared with a keyboard-accessible control.
- [ ] The combobox is operable by keyboard.
- [ ] Labels, button state, option text, and clear action are accessible.
- [ ] The selector and popover fit at 375px width.
- [ ] Styling preserves glassmorphism, dark surfaces, violet focus treatment, and restrained metadata.

---

## Phase 4: Repo Fetch Error And Expired Access UX

**User stories**: 13, 14, 15, 16

### What to build

Handle repository fetch failures without blocking project creation. Non-401 errors show an inline retry path. GitHub repos 401 errors show the required destructive toast with a Sign out action while preserving the global 401 behavior for other backend requests.

### Acceptance criteria

- [ ] Non-401 repository fetch errors show an inline retry control.
- [ ] Non-401 repository fetch errors do not block project creation.
- [ ] GitHub repos 401 errors show `GitHub access expired, please sign in again`.
- [ ] The 401 toast includes a Sign out action.
- [ ] The Sign out action signs out through Supabase and redirects through the existing auth flow.
- [ ] The special 401 behavior is scoped to the GitHub repos query.
- [ ] Other backend 401 handling remains globally centralized.

---

## Phase 5: Verification Pass

**User stories**: all

### What to build

Run the frontend QA pass for behavior, accessibility basics, responsive layout, visual consistency, and repository checks. Document any verification that cannot be completed because the backend endpoint or auth state is unavailable locally.

### Acceptance criteria

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Desktop browser check shows the dialog and combobox render coherently.
- [ ] 375px mobile browser check shows no overflow, clipping, or overlapping controls.
- [ ] Keyboard open, search, select, and clear behavior is checked.
- [ ] Loading, empty, selected, cleared, retry, non-401 error, and 401 expired-access states are checked where practical.
- [ ] Selected and unselected submit payload behavior is verified where practical.
