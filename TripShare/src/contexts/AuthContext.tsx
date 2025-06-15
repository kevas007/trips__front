// === src/contexts/AuthContext.tsx - VERSION FINALE AVEC SERVICE API ===

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { authService, User, AuthError } from '../services/auth';

// ========== TYPES ==========

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, firstName: string, lastName: string, phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// ========== CONTEXT ==========

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========== PROVIDER ==========

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== INITIALISATION ==========
  
  useEffect(() => {
    initializeAuth();
  }, []);

const initializeAuth = async () => {
  try {
    setIsLoading(true);
    setError(null);

    // Vérifier si l'utilisateur est authentifié
    if (authService.isAuthenticated()) {
      try {
        // Vérifier auprès du serveur que le token est toujours valide
        const currentUser = await authService.verifyToken();
        setUser(currentUser);
        console.log('🔑 Utilisateur validé:', currentUser.email);
      } catch (validationError) {
        console.log('⚠️ Token invalide, déconnexion');
        await authService.logout();
        setUser(null);
      }
    }
    // Si pas authentifié, on ne fait rien, on restera sur l'écran Login/Register
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
    
    if (error instanceof AuthError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    return errorMessage;
  };

  const clearError = () => {
    setError(null);
  };

  // ========== MÉTHODES D'AUTHENTIFICATION ==========

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      // Validation côté client
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email et mot de passe requis');
      }

      if (!email.includes('@')) {
        throw new Error('Format d\'email invalide');
      }

      if (password.length < 6) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      // Appel API
      const response = await api.login({
        email: email.toLowerCase().trim(),
        password: password,
      });

      setUser(response.user);
      console.log('✅ Connexion réussie:', response.user.email);

    } catch (error) {
      const errorMessage = handleError(error, 'Erreur de connexion');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string, 
    firstName: string, 
    lastName: string, 
    phoneNumber: string, 
    password: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      // Validation côté client
      const validationErrors: string[] = [];

      if (!email?.trim()) validationErrors.push('Email requis');
      else if (!email.includes('@')) validationErrors.push('Format d\'email invalide');

      if (!username?.trim()) validationErrors.push('Nom d\'utilisateur requis');
      else if (username.length < 3) validationErrors.push('Nom d\'utilisateur trop court (min. 3 caractères)');

      if (!firstName?.trim()) validationErrors.push('Prénom requis');
      else if (firstName.length < 2) validationErrors.push('Prénom trop court (min. 2 caractères)');

      if (!lastName?.trim()) validationErrors.push('Nom requis');
      else if (lastName.length < 2) validationErrors.push('Nom trop court (min. 2 caractères)');

      if (!password?.trim()) validationErrors.push('Mot de passe requis');
      else if (password.length < 6) validationErrors.push('Mot de passe trop court (min. 6 caractères)');

      // Validation optionnelle du téléphone
      if (phoneNumber?.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
          validationErrors.push('Format de téléphone invalide');
        }
      }

      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      // Appel API
      const response = await api.register({
        email: email.toLowerCase().trim(),
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber?.trim() || undefined,
        password: password,
      });

      setUser(response.user);
      console.log('✅ Inscription réussie:', response.user.email);

      // Notification de succès
      Alert.alert(
        '🎉 Inscription réussie !',
        `Bienvenue ${response.user.first_name} ! Votre compte TripShare est prêt.`,
        [{ text: 'Commencer l\'aventure', style: 'default' }]
      );

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

      await api.logout();
      setUser(null);

      console.log('✅ Déconnexion réussie');

    } catch (error) {
      // Forcer la déconnexion locale même en cas d'erreur serveur
      console.warn('⚠️ Erreur logout serveur (déconnexion locale forcée):', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();

      if (!email?.trim()) {
        throw new Error('Email requis');
      }

      if (!email.includes('@')) {
        throw new Error('Format d\'email invalide');
      }

      await api.forgotPassword({
        email: email.toLowerCase().trim(),
      });

      console.log('✅ Email de réinitialisation envoyé à:', email);

      Alert.alert(
        '📧 Email envoyé',
        `Un lien de réinitialisation a été envoyé à ${email}. Vérifiez votre boîte mail (et vos spams).`,
        [{ text: 'Compris', style: 'default' }]
      );

    } catch (error) {
      const errorMessage = handleError(error, 'Erreur d\'envoi d\'email');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!user) return;
      
      const updatedUser = await api.getCurrentUser();
      setUser(updatedUser);
      console.log('✅ Profil utilisateur actualisé');
    } catch (error) {
      console.warn('⚠️ Impossible d\'actualiser le profil:', error);
      // Ne pas lever d'erreur, garder l'utilisateur actuel
    }
  };

  // ========== MÉTHODES UTILITAIRES ==========

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const updatedUser = await api.updateProfile(userData);
      setUser(updatedUser);
      console.log('✅ Profil mis à jour');
    } catch (error) {
      const errorMessage = handleError(error, 'Erreur de mise à jour du profil');
      throw new Error(errorMessage);
    }
  };

  const uploadAvatar = async (imageUri: string): Promise<void> => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const updatedUser = await api.uploadAvatar(imageUri);
      setUser(updatedUser);
      console.log('✅ Avatar mis à jour');
    } catch (error) {
      const errorMessage = handleError(error, 'Erreur de téléchargement d\'avatar');
      throw new Error(errorMessage);
    }
  };

  // ========== VALEURS DU CONTEXTE ==========

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ========== HOOK ==========

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  
  return context;
};

// ========== HOOKS UTILITAIRES ==========

// Hook pour gérer les erreurs d'authentification avec toast
export const useAuthError = () => {
  // Désactivé temporairement - utiliser useSimpleAuth à la place
  const error = null;
  const clearError = () => {};
  
  React.useEffect(() => {
    if (error) {
      // Auto-clear après 5 secondes
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const showError = (message: string) => {
    Alert.alert('Erreur', message);
  };

  return { error, clearError, showError };
};

// Hook pour les actions avec gestion automatique des erreurs
export const useAuthAction = () => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { showError } = useAuthError();

  const executeAction = async (action: () => Promise<void>, errorMessage?: string) => {
    try {
      setIsActionLoading(true);
      await action();
    } catch (error: any) {
      showError(error.message || errorMessage || 'Une erreur est survenue');
    } finally {
      setIsActionLoading(false);
    }
  };

  return { isActionLoading, executeAction };
};

export default AuthContext;