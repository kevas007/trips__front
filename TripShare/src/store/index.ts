// ========== STORE PRINCIPAL ZUSTAND ==========
// Équivalent Pinia pour React Native

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { authSlice, AuthSlice } from './slices/authSlice';

// Types combinés pour le store
export type StoreState = AuthSlice;

// Store principal avec architecture par slices
export const useStore = create<StoreState>()(
  immer((set, get, api) => ({
    // Auth slice
    ...authSlice(set, get, api),
  }))
);

// Hooks spécifiques par domaine pour une meilleure organisation
export const useAuthStore = () => useStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  login: state.login,
  logout: state.logout,
  register: state.register,
  refreshToken: state.refreshToken,
  clearError: state.clearError,
  setUser: state.setUser,
}));
