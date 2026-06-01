import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirectOn401?: boolean;
  }

  export interface AxiosError {
    apiErrorToastShown?: boolean;
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
    if (!axios.isAxiosError(error) || typeof window === "undefined") {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirectOn401
    ) {
      const supabase = createClient();
      await supabase.auth.signOut();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }

      return Promise.reject(error);
    }

    if (error.response && error.response.status >= 500) {
      error.apiErrorToastShown = true;
      toast({
        title: "Server error, try again",
        variant: "destructive",
      });
    } else if (!error.response) {
      error.apiErrorToastShown = true;
      toast({
        title: "Network error, check your connection",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  },
);
