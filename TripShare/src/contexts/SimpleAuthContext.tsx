import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, User, AuthError, LoginCredentials, RegisterData } from '../services/auth';
import { resetToAuth } from '../navigation/RootNavigation';

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
  completeOnboarding: () => void;
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

  // Debug: Logger les changements d'état
  useEffect(() => {
    console.log('🔍 SimpleAuthContext - État mis à jour:', {
      user: !!user,
      userEmail: user?.email,
      isAuthenticated: !!user,
      isLoading,
      error
    });
  }, [user, isLoading, error]);

  const initializeAuth = useCallback(async () => {
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
          
          // Vérifier si l'utilisateur a des préférences de voyage
          // Si pas de préférences, c'est probablement un nouvel utilisateur
          if (currentUser && (!currentUser.preferences || Object.keys(currentUser.preferences).length === 0)) {
            console.log('🔍 Nouvel utilisateur détecté (pas de préférences)');
            setIsNewUser(true);
          } else {
            console.log('🔍 Utilisateur existant avec préférences');
            setIsNewUser(false);
          }
          
          console.log('✅ Utilisateur validé:', currentUser.email);
        } catch (validationError: any) {
          console.log('⚠️ Token invalide, déconnexion');
          console.log('⚠️ Erreur de validation:', validationError.message);
          await authService.logout();
          setUser(null);
          setIsNewUser(false);
          
          // Si c'est une erreur de réseau, on l'indique
          if (validationError.code === 'NETWORK_ERROR') {
            setError('Problème de connexion. Vérifiez votre connexion internet.');
          }
        }
      } else {
        console.log('❌ Aucun utilisateur authentifié');
        setUser(null); // S'assurer que user est null
        setIsNewUser(false);
      }
    } catch (error: any) {
      console.error('❌ Erreur initialisation auth:', error);
      setError('Erreur d\'initialisation de l\'authentification');
      setUser(null); // S'assurer que user est null en cas d'erreur
      setIsNewUser(false);
    } finally {
      setIsLoading(false);
      // Log sera fait dans un useEffect pour avoir la valeur mise à jour
    }
  }, []);

  // ========== GESTION D'ERREURS ==========

  const handleError = useCallback((error: any, fallbackMessage: string = 'Une erreur est survenue'): string => {
    console.error('❌ Auth Error:', error);
    
    let errorMessage = fallbackMessage;
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.code) {
      errorMessage = `Erreur ${error.code}: ${error.message || 'Erreur inconnue'}`;
    }

    setError(errorMessage);
    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========== MÉTHODES D'AUTHENTIFICATION ==========

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      console.log('🔄 Connexion...');
      const response = await authService.login(credentials);
      setUser(response.user);
      console.log('✅ Connexion réussie:', response.user.email);
    } catch (error) {
      handleError(error, 'Erreur de connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      console.log('🔄 Inscription...');
      const response = await authService.register(data);
      
      // Vérifier que le token est valide après l'inscription
      try {
        console.log('🔍 Vérification du token après inscription...');
        const verifiedUser = await authService.verifyToken();
        console.log('✅ Token vérifié après inscription:', verifiedUser.email);
        setUser(verifiedUser);
        setIsNewUser(true);
        console.log('✅ Inscription réussie:', verifiedUser.email);
      } catch (verifyError: any) {
        console.error('❌ Erreur lors de la vérification du token après inscription:', verifyError);
        // Si la vérification échoue, nettoyer et relancer l'erreur
        await authService.logout();
        setUser(null);
        setIsNewUser(false);
        throw new Error('Erreur lors de la validation de la session après inscription');
      }
    } catch (error) {
      handleError(error, 'Erreur d\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      console.log('🔄 Déconnexion...');
      await authService.logout();
      setUser(null);
      setIsNewUser(false);
      console.log('✅ Déconnexion réussie');

      // Forcer la navigation vers l'écran d'auth après déconnexion
      try {
        resetToAuth();
      } catch (navError) {
        console.warn('⚠️ Erreur navigation après logout:', navError);
      }

    } catch (error) {
      handleError(error, 'Erreur de déconnexion');
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const completeOnboarding = useCallback(() => {
    console.log('✅ SimpleAuthContext - Onboarding terminé, isNewUser mis à false');
    setIsNewUser(false);
  }, []);

  // ========== VALEURS CALCULÉES ==========

  const isAuthenticated = !!user;

  // ========== PROVIDER VALUE ==========

  const value: SimpleAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    isNewUser,
    login,
    register,
    logout,
    clearError,
    completeOnboarding,
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