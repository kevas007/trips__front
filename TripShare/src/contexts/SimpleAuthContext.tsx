import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, AuthError, LoginCredentials, RegisterData } from '../services/auth';

// ========== TYPES ==========

export interface SimpleAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ========== CONTEXT ==========

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// ========== PROVIDER ==========

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // ========== INITIALISATION ==========
  
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Initialisation de l\'authentification...');

      // Vérifier si l'utilisateur est authentifié
      if (authService.isAuthenticated()) {
        try {
          // Vérifier auprès du serveur que le token est toujours valide
          const currentUser = await authService.verifyToken();
          console.log('🔍 Utilisateur récupéré:', currentUser);
          console.log('🔍 ID utilisateur:', currentUser?.id);
          setUser(currentUser);
          console.log('✅ Utilisateur validé:', currentUser.email);
        } catch (validationError) {
          console.log('⚠️ Token invalide, déconnexion');
          await authService.logout();
          setUser(null);
        }
      } else {
        console.log('❌ Aucun utilisateur authentifié');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
      setError('Erreur d\'initialisation');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== GESTION D'ERREURS ==========

  const handleError = (error: any, fallbackMessage: string = 'Une erreur est survenue'): string => {
    console.error('❌ Auth Error:', error);
    
    let errorMessage = fallbackMessage;
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setError(errorMessage);
    return errorMessage;
  };

  const clearError = () => {
    setError(null);
  };

  // ========== MÉTHODES D'AUTHENTIFICATION ==========

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      console.log('🔄 Tentative de connexion...');
      const response = await authService.login(credentials);
      setUser(response.user);
      console.log('✅ Connexion réussie:', response.user.email);

    } catch (error) {
      const errorMessage = handleError(error, 'Erreur de connexion');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      console.log('🔄 Tentative d\'inscription...');
      const response = await authService.register(data);
      setUser(response.user);
      setIsNewUser(true);
      console.log('✅ Inscription réussie:', response.user.email);

    } catch (error) {
      const errorMessage = handleError(error, 'Erreur d\'inscription');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      console.log('🔄 Déconnexion...');
      await authService.logout();
      setUser(null);
      setIsNewUser(false);
      console.log('✅ Déconnexion réussie');

    } catch (error) {
      handleError(error, 'Erreur de déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== VALEUR DU CONTEXTE ==========

  const value: SimpleAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    isNewUser,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

// ========== HOOK ==========

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export default SimpleAuthProvider; 