import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: mocks.toast,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mocks.getSession,
      signOut: mocks.signOut,
    },
  }),
}));

function createAxiosResponse(status: number): AxiosResponse {
  return {
    config: {},
    data: {},
    headers: {},
    status,
    statusText: String(status),
  };
}

function rejectingAdapter(error: AxiosError): AxiosAdapter {
  return async (config) => {
    error.config = config;

    if (error.response) {
      error.response.config = config;
    }

    return Promise.reject(error);
  };
}

function defineBrowserLocation(pathname = "/dashboard") {
  const assign = vi.fn();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        assign,
        pathname,
      },
    },
  });

  return assign;
}

describe("api response interceptor", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.signOut.mockReset();
    mocks.getSession.mockResolvedValue({
      data: {
        session: null,
      },
    });
    mocks.signOut.mockResolvedValue(undefined);
    mocks.toast.mockReset();
    defineBrowserLocation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, "window");
  });

  it("signs out and redirects on 401 responses", async () => {
    const { api } = await import("@/lib/api");
    const assign = defineBrowserLocation("/dashboard");
    api.defaults.adapter = rejectingAdapter(
      new AxiosError(
        "Unauthorized",
        undefined,
        {},
        {},
        createAxiosResponse(401),
      ),
    );

    await expect(api.get("/projects")).rejects.toThrow("Unauthorized");

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(assign).toHaveBeenCalledWith("/login");
  });

  it("honors skipAuthRedirectOn401", async () => {
    const { api } = await import("@/lib/api");
    const assign = defineBrowserLocation("/dashboard");
    api.defaults.adapter = rejectingAdapter(
      new AxiosError(
        "Unauthorized",
        undefined,
        {},
        {},
        createAxiosResponse(401),
      ),
    );

    await expect(
      api.get("/projects", { skipAuthRedirectOn401: true }),
    ).rejects.toThrow("Unauthorized");

    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it("shows a destructive toast for 5xx responses", async () => {
    const { api } = await import("@/lib/api");
    const error = new AxiosError(
      "Server failed",
      undefined,
      {},
      {},
      createAxiosResponse(503),
    );
    api.defaults.adapter = rejectingAdapter(error);

    await expect(api.get("/projects")).rejects.toThrow("Server failed");

    expect(error.apiErrorToastShown).toBe(true);
    expect(mocks.toast).toHaveBeenCalledWith({
      title: "Server error, try again",
      variant: "destructive",
    });
  });

  it("shows a destructive toast for network errors without a response", async () => {
    const { api } = await import("@/lib/api");
    const error = new AxiosError("Network Error");
    api.defaults.adapter = rejectingAdapter(error);

    await expect(api.get("/projects")).rejects.toThrow("Network Error");

    expect(error.apiErrorToastShown).toBe(true);
    expect(mocks.toast).toHaveBeenCalledWith({
      title: "Network error, check your connection",
      variant: "destructive",
    });
  });
});
