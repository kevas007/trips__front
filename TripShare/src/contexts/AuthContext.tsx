// === src/contexts/AuthContext.tsx - VERSION CORRIGÉE ===

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// ========== TYPES ==========

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

// ========== CONTEXT ==========

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========== MOCK DATA ==========

const mockUser: User = {
  id: '1',
  email: 'demo@tripshare.com',
  name: 'Demo User',
  avatar: undefined,
  verified: true,
  createdAt: new Date().toISOString(),
};

// ========== PROVIDER ==========

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========== EFFET D'INITIALISATION ==========
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si un token existe dans le stockage sécurisé
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedUser = await SecureStore.getItemAsync('user_data');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // En production, valider le token avec l'API
          console.log('🔑 Utilisateur connecté automatiquement:', userData.email);
        } catch (error) {
          console.error('❌ Erreur parsing user data:', error);
          await clearStoredAuth();
        }
      }
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== MÉTHODES D'AUTHENTIFICATION ==========

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      // Validation basique
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      if (!email.includes('@')) {
        throw new Error('Email invalide');
      }

      if (password.length < 6) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      // Simulation d'une requête API (remplacer par apiService.login)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: accepter n'importe quel email/password valide
      const loginUser: User = {
        ...mockUser,
        email: email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      };

      // Stocker les données de manière sécurisée
      await SecureStore.setItemAsync('auth_token', 'mock_jwt_token_' + Date.now());
      await SecureStore.setItemAsync('user_data', JSON.stringify(loginUser));

      setUser(loginUser);
      
      console.log('✅ Connexion réussie:', loginUser.email);

    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      throw new Error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);

      // Validation
      if (!email || !password || !name) {
        throw new Error('Tous les champs sont requis');
      }

      if (!email.includes('@')) {
        throw new Error('Email invalide');
      }

      if (password.length < 6) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      if (name.trim().length < 2) {
        throw new Error('Nom trop court (minimum 2 caractères)');
      }

      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1200));

      const newUser: User = {
        id: 'user_' + Date.now(),
        email: email.toLowerCase(),
        name: name.trim(),
        avatar: undefined,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      // Stocker les données
      await SecureStore.setItemAsync('auth_token', 'mock_jwt_token_' + Date.now());
      await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));

      setUser(newUser);
      
      console.log('✅ Inscription réussie:', newUser.email);

      // Notification d'inscription
      Alert.alert(
        'Inscription réussie !',
        'Bienvenue sur TripShare ! Vous pouvez maintenant créer et partager vos itinéraires.',
        [{ text: 'Commencer', style: 'default' }]
      );

    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      throw new Error(error.message || 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Nettoyer le stockage sécurisé
      await clearStoredAuth();

      // Réinitialiser l'état
      setUser(null);

      console.log('✅ Déconnexion réussie');

      // En production, notifier le serveur
      // await apiService.logout();

    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);

      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }

      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('✅ Email de réinitialisation envoyé à:', email);

      Alert.alert(
        'Email envoyé',
        `Un lien de réinitialisation a été envoyé à ${email}. Vérifiez votre boîte mail.`,
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error: any) {
      console.error('❌ Erreur mot de passe oublié:', error);
      throw new Error(error.message || 'Erreur d\'envoi d\'email');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== MÉTHODES UTILITAIRES ==========

  const clearStoredAuth = async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('auth_token'),
        SecureStore.deleteItemAsync('user_data'),
      ]);
    } catch (error) {
      console.warn('⚠️ Erreur nettoyage stockage:', error);
    }
  };

  // ========== VALEURS DU CONTEXTE ==========

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
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

export default AuthContext;