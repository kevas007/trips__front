// src/utils/errorHandler.ts - Version corrigée multiplateforme
import { Platform } from 'react-native';

export const setupErrorHandling = () => {
  // Sauvegarder la fonction console.error originale
  const originalError = console.error;
  
  console.error = (...args) => {
    const message = args[0];
    
    // Ignorer les erreurs de connexion réseau connues
    if (
      typeof message === 'string' && 
      (
        message.includes('runtime.lastError') ||
        message.includes('net::ERR_CONNECTION_REFUSED') ||
        message.includes('Failed to fetch') ||
        message.includes('The message port closed before a response was received') ||
        message.includes('Network request failed') ||
        message.includes('XMLHttpRequest') ||
        message.includes('fetch')
      )
    ) {
      return; // Ne pas afficher ces erreurs
    }
    
    // Afficher les autres erreurs normalement
    originalError.apply(console, args);
  };

  // Gérer les erreurs non capturées UNIQUEMENT sur web
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      if (
        event.reason?.message?.includes('Failed to fetch') ||
        event.reason?.message?.includes('Network request failed')
      ) {
        event.preventDefault(); // Empêcher l'affichage de l'erreur
      }
    });
  }

  // Pour React Native, on peut capturer les erreurs avec ErrorUtils si disponible
  if (Platform.OS !== 'web' && typeof global !== 'undefined') {
    const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
    
    if (originalHandler && global.ErrorUtils?.setGlobalHandler) {
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        // Ignorer les erreurs réseau non fatales
        if (
          !isFatal && 
          error?.message && 
          (
            error.message.includes('Network request failed') ||
            error.message.includes('fetch')
          )
        ) {
          return; // Ne pas traiter ces erreurs
        }
        
        // Traiter les autres erreurs normalement
        originalHandler(error, isFatal);
      });
    }
  }
};

// Fonction utilitaire pour détecter si on est sur mobile
export const isMobile = () => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

// Fonction utilitaire pour détecter si on est sur web
export const isWeb = () => {
  return Platform.OS === 'web';
};

// Fonction pour log des erreurs de debug (optionnel)
export const debugLog = (message: string, data?: any) => {
  if (__DEV__) {
    console.log(`[TripShare Debug] ${message}`, data || '');
  }
};

// Fonction pour log des erreurs importantes seulement
export const errorLog = (message: string, error?: any) => {
  if (
    !error?.message?.includes('Network request failed') &&
    !error?.message?.includes('fetch') &&
    !error?.message?.includes('runtime.lastError')
  ) {
    console.error(`[TripShare Error] ${message}`, error || '');
  }
};