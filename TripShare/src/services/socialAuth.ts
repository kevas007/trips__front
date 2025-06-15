import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { SOCIAL_AUTH_CONFIG, logConfigurationStatus } from '../config/socialAuth.config';

// Configuration WebBrowser pour AuthSession
WebBrowser.maybeCompleteAuthSession();

// Types pour l'authentification sociale
export interface SocialAuthResult {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  provider: 'google' | 'apple';
  idToken: string;
}

export interface SocialAuthError {
  code: 'USER_CANCELLED' | 'SIGN_IN_CANCELLED' | 'SIGN_IN_REQUIRED' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
}

class SocialAuthService {
  constructor() {
    // Logger le statut de configuration au démarrage
    logConfigurationStatus();
  }

  // Connexion Apple (iOS uniquement)
  async signInWithApple(): Promise<SocialAuthResult> {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In disponible uniquement sur iOS');
    }

    try {
      // Vérifier la disponibilité
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In non disponible sur cet appareil');
      }

      // Demander l'authentification
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Extraire les informations
      const { identityToken, email, fullName, user } = credential;
      
      if (!identityToken) {
        throw new Error('Token d\'identité Apple manquant');
      }

      const name = fullName 
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : 'Utilisateur Apple';

      return {
        id: user,
        email: email || '',
        name: name || 'Utilisateur Apple',
        provider: 'apple',
        idToken: identityToken,
      };

    } catch (error: any) {
      console.error('❌ Erreur Apple Sign-In:', error);
      
      if (error.code === 'ERR_CANCELED') {
        throw { code: 'USER_CANCELLED', message: 'Connexion Apple annulée' } as SocialAuthError;
      }
      
      throw { 
        code: 'UNKNOWN_ERROR', 
        message: error.message || 'Erreur lors de la connexion Apple' 
      } as SocialAuthError;
    }
  }

  // Connexion Google avec expo-auth-session
  async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      // Sélectionner le bon client ID selon la plateforme
      const clientId = Platform.OS === 'ios' 
        ? SOCIAL_AUTH_CONFIG.google.iosClientId
        : SOCIAL_AUTH_CONFIG.google.androidClientId;

      // Configuration de la demande d'autorisation
      const request = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: AuthSession.makeRedirectUri(),
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      // Demander l'autorisation
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type !== 'success') {
        if (result.type === 'cancel') {
          throw { code: 'USER_CANCELLED', message: 'Connexion Google annulée' } as SocialAuthError;
        }
        throw new Error('Échec de l\'autorisation Google');
      }

      // Échanger le code d'autorisation contre des tokens
      const tokenResult = await AuthSession.exchangeCodeAsync({
        clientId: clientId,
        code: result.params.code,
        extraParams: {
          code_verifier: request.codeVerifier!,
        },
        redirectUri: AuthSession.makeRedirectUri(),
      }, {
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      });

      if (!tokenResult.idToken) {
        throw new Error('Token d\'identité Google manquant');
      }

      // Récupérer les informations utilisateur
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name || 'Utilisateur Google',
        photoURL: userInfo.picture || undefined,
        provider: 'google',
        idToken: tokenResult.idToken,
      };

    } catch (error: any) {
      console.error('❌ Erreur Google Sign-In:', error);
      
      if (error.code === 'USER_CANCELLED') {
        throw error;
      }
      
      throw { 
        code: 'UNKNOWN_ERROR', 
        message: error.message || 'Erreur lors de la connexion Google' 
      } as SocialAuthError;
    }
  }

  // Déconnexion (pas nécessaire pour AuthSession/Apple)
  async signOut() {
    try {
      console.log('✅ Déconnexion sociale réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion sociale:', error);
    }
  }

  // Méthode principale selon la plateforme
  async signInWithPlatformDefault(): Promise<SocialAuthResult> {
    if (Platform.OS === 'ios') {
      return this.signInWithApple();
    } else {
      return this.signInWithGoogle();
    }
  }

  // Nouvelles méthodes pour choisir spécifiquement le provider
  async signInWithAppleIfAvailable(): Promise<SocialAuthResult> {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In disponible uniquement sur iOS');
    }
    return this.signInWithApple();
  }

  async signInWithGoogleIfAvailable(): Promise<SocialAuthResult> {
    return this.signInWithGoogle();
  }

  // Vérifier la disponibilité d'Apple
  async isAppleAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AppleAuthentication.isAvailableAsync();
      }
      return false;
    } catch {
      return false;
    }
  }

  // Vérifier la disponibilité de Google
  async isGoogleAvailable(): Promise<boolean> {
    try {
      // Google OAuth avec expo-auth-session est disponible sur toutes les plateformes
      return true;
    } catch {
      return false;
    }
  }

  // Vérifier la disponibilité selon la plateforme
  async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AppleAuthentication.isAvailableAsync();
      } else {
        // Google OAuth avec expo-auth-session est toujours disponible
        return true;
      }
    } catch {
      return false;
    }
  }

  // Obtenir le nom du provider selon la plateforme
  getPlatformProviderName(): string {
    return Platform.OS === 'ios' ? 'Apple' : 'Google';
  }

  // Obtenir l'icône selon la plateforme
  getPlatformIcon(): string {
    return Platform.OS === 'ios' ? 'logo-apple' : 'logo-google';
  }
}

export const socialAuthService = new SocialAuthService(); 