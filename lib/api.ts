import axios from "axios";
import { createClient } from "@/lib/supabase/client";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirectOn401?: boolean;
  }
}

function buildApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
}

export const api = axios.create({
  baseURL: buildApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirectOn401 &&
      typeof window !== "undefined"
    ) {
      const supabase = createClient();
      await supabase.auth.signOut();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);
