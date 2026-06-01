type SyncableSession = {
  access_token: string;
  provider_token?: string | null;
};

function buildApiBaseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
}

/**
 * Syncs the GitHub OAuth token to the Rails backend.
 *
 * Supabase returns `provider_token` only in the client-side session at sign-in
 * (never in the JWT), so the backend cannot extract it on its own. Right after
 * the OAuth exchange we forward it to `PATCH /api/v1/me`, where it is stored
 * encrypted on the user and used by the GitHub endpoints.
 */
export async function syncGitHubToken(session: SyncableSession): Promise<void> {
  if (!session.provider_token) {
    return;
  }

  // Best-effort: a failed sync must never block sign-in. The user can re-auth
  // to retry, and the backend returns an actionable 401 if the token is absent.
  try {
    const response = await fetch(`${buildApiBaseUrl()}/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user: { github_access_token: session.provider_token },
      }),
    });

    if (!response.ok) {
      console.warn(`GitHub token sync failed: backend returned ${response.status}`);
    }
  } catch (error) {
    // Swallow: sign-in proceeds regardless of sync success.
    console.warn("GitHub token sync failed:", error);
  }
}
