"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const AUTH_STORAGE_KEY = "ticketforge-auth";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type LoginPayload = {
  user: AuthUser;
  token: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

export function clearStoredAuth() {
  useAuthStore.getState().logout();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    const parsedAuth = JSON.parse(storedAuth) as {
      state?: {
        token?: unknown;
      };
    };

    return typeof parsedAuth.state?.token === "string"
      ? parsedAuth.state.token
      : null;
  } catch {
    return null;
  }
}
