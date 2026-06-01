import { afterEach, describe, expect, it, vi } from "vitest";
import { syncGitHubToken } from "@/lib/github-token-sync";

describe("syncGitHubToken", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("PATCHes /api/v1/me with the provider token and bearer auth", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await syncGitHubToken({
      access_token: "supabase-access-token",
      provider_token: "gho_github_token",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3001/api/v1/me");
    expect(init?.method).toBe("PATCH");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer supabase-access-token",
    );
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
    expect(JSON.parse(init?.body as string)).toEqual({
      user: { github_access_token: "gho_github_token" },
    });
  });

  it("makes no request when the session carries no provider token", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await syncGitHubToken({ access_token: "supabase-access-token", provider_token: null });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("warns but does not throw when the backend rejects the sync", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      syncGitHubToken({ access_token: "t", provider_token: "gho_x" }),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("does not throw when the backend sync fails, so login is not blocked", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    await expect(
      syncGitHubToken({
        access_token: "supabase-access-token",
        provider_token: "gho_github_token",
      }),
    ).resolves.toBeUndefined();
  });
});
