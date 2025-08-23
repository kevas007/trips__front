import { useCallback } from 'react';
import { useAuthStore } from '../../../store';
import { LoginCredentials, RegisterData  } from '../features/auth/types';export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    refreshToken,
    clearError,
    setUser,
  } = useAuthStore();

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [login]);

  const handleRegister = useCallback(async (data: RegisterData) => {
    try {
      await register(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [register]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleRefreshToken = useCallback(async () => {
    try {
      await refreshToken();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [refreshToken]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    clearError,
    setUser,
  };
};
