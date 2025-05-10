// state/auth.ts
import { create } from "zustand";
import api from "../lib/api";

interface AuthState {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/login", { email, password });
      set({ token: res.data.token });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ token: null });
  },
}));
