"use client";

import { create } from "zustand";

type AuthUiState = {
  isUserMenuOpen: boolean;
  setUserMenuOpen: (isOpen: boolean) => void;
};

export const useAuthStore = create<AuthUiState>((set) => ({
  isUserMenuOpen: false,
  setUserMenuOpen: (isUserMenuOpen) => set({ isUserMenuOpen }),
}));
