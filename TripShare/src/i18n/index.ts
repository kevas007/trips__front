// === src/i18n/index.ts - CONFIGURATION REACT-I18NEXT COMPATIBLE HERMES ===

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

// Import des traductions locales
import fr from './locales/fr';
import en from './locales/en';

// ========== DÉTECTION LANGUE DU DEVICE (COMPATIBLE HERMES) ==========

const getDeviceLanguage = (): string => {
  let deviceLanguage = 'fr'; // Default to French
  
  try {
    if (Platform.OS === 'ios') {
      // Accès sécurisé aux NativeModules pour éviter l'erreur Hermes
      const settingsManager = NativeModules.SettingsManager;
      if (settingsManager && settingsManager.settings) {
        deviceLanguage = settingsManager.settings.AppleLocale ||
                        (settingsManager.settings.AppleLanguages && settingsManager.settings.AppleLanguages[0]) ||
                        'fr';
      }
    } else if (Platform.OS === 'android') {
      // Accès sécurisé pour Android
      const i18nManager = NativeModules.I18nManager;
      if (i18nManager && i18nManager.localeIdentifier) {
        deviceLanguage = i18nManager.localeIdentifier;
      }
    } else if (Platform.OS === 'web') {
      // Accès sécurisé pour le web
      if (typeof navigator !== 'undefined' && navigator.language) {
        deviceLanguage = navigator.language;
      }
    }
    
    // Extract language code (e.g., 'fr' from 'fr-FR')
    const langCode = deviceLanguage.substring(0, 2).toLowerCase();
    
    // Return 'fr' if it's French, otherwise 'en'
    return langCode === 'fr' ? 'fr' : 'en';
  } catch (error) {
    console.warn('🌍 Error detecting device language:', error);
    return 'fr'; // Fallback to French
  }
};

// ========== CONFIGURATION I18N ==========

const resources = {
  fr: {
    translation: fr
  },
  en: {
    translation: en
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'fr',
    debug: __DEV__,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    // Configuration de détection de clés manquantes
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (__DEV__) {
        console.warn(`🚨 Clé de traduction manquante: ${key} (${lng})`);
      }
    },
    
    // Handler pour parser les clés manquantes
    parseMissingKeyHandler: (key, defaultValue) => {
      // Si c'est une clé avec emoji qui n'est pas trouvée, retourner la clé elle-même
      if (key && (key.includes('📧') || key.includes('🔒') || key.includes('👤') || key.includes('📱') || key.includes('🔑'))) {
        return key;
      }
      return defaultValue || key;
    },

    // Retourner la clé si pas de traduction trouvée
    returnEmptyString: false,
    returnNull: false,
    returnObjects: true,
  });

// ========== LOGGING POUR DEBUG ==========
if (__DEV__) {
  console.log('🌍 i18n initialisé avec:', {
    langue: i18n.language,
    langueDetectee: getDeviceLanguage(),
    clésDisponibles: Object.keys(resources),
  });
}

// ========== FONCTIONS UTILITAIRES ==========

// Fonction pour logger la langue actuelle
const logCurrentLanguage = () => {
  console.log('🌍 Langue actuelle:', i18n.language);
};

// Fonction pour changer la langue
export const changeLanguage = (lang: 'en' | 'fr') => {
  i18n.changeLanguage(lang);
  console.log('🌍 Langue changée vers:', lang);
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Fonction pour vérifier si une traduction existe
export const hasTranslation = (key: string): boolean => {
  return i18n.exists(key);
};

// Fonction pour obtenir les langues disponibles
export const getAvailableLanguages = (): string[] => {
  return Object.keys(resources);
};

export default i18n;