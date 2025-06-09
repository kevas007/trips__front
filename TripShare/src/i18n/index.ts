// === src/i18n/index.ts - CONFIGURATION REACT-I18NEXT CORRIGÉE ===

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

// ========== DÉTECTION LANGUE DU DEVICE ==========

const getDeviceLanguage = (): string => {
  let deviceLanguage = 'en';
  
  if (Platform.OS === 'ios') {
    deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                    'en';
  } else if (Platform.OS === 'android') {
    deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
  } else if (Platform.OS === 'web') {
    deviceLanguage = navigator.language || 'en';
  }

  return deviceLanguage.substring(0, 2).toLowerCase();
};

// ========== TRADUCTIONS COMPLÈTES ==========

const resources = {
  en: {
    translation: {
      // ========== COMMON ==========
      "common.loading": "Loading...",
      "common.error": "Oops! 😅",
      "common.success": "Success",
      "common.retry": "Retry",
      "common.cancel": "Cancel",
      "common.ok": "OK",
      "common.confirm": "Confirm",
      "common.save": "Save",
      "common.continue": "Continue",
      "common.back": "Back",
      "common.next": "Next",
      "common.finish": "Finish",
      "common.search": "Search",
      "common.searchDescription": "Discover thousands of itineraries shared by the community",
      "common.profile": "Profile",
      "common.profileDescription": "Manage your trips, settings and statistics",

      // ========== AUTH ==========
      "auth.loginTitle": "🌍 Welcome back!",
      "auth.registerTitle": "✨ Join the adventure",
      "auth.forgotTitle": "🔑 Account recovery",
      "auth.loginButton": "✈️ Explore the world",
      "auth.registerButton": "🚀 Start the adventure",
      "auth.forgotButton": "📧 Send link",
      "auth.appTagline": "Transform your dreams into memories",

      // Placeholders
      "auth.emailPlaceholder": "📧 Email address",
      "auth.passwordPlaceholder": "🔒 Password",
      "auth.confirmPasswordPlaceholder": "🔑 Confirm password",
      "auth.usernamePlaceholder": "👤 Username",
      "auth.firstNamePlaceholder": "👤 First name",
      "auth.lastNamePlaceholder": "👤 Last name",
      "auth.phoneNumberPlaceholder": "📱 Phone (optional)",
      "auth.namePlaceholder": "👤 Your full name",

      // Options
      "auth.rememberMe": "Remember me",
      "auth.acceptTerms": "I accept the terms of use",
      "auth.receiveNotifications": "Receive travel inspirations",

      // Navigation
      "auth.forgotPassword": "🔑 Forgot password?",
      "auth.createAccount": "✨ Create account",
      "auth.alreadyMember": "🌍 Already a member? Sign in",
      "auth.backToLogin": "← Back to login",

      // Stats
      "auth.stats.adventurers": "Adventurers",
      "auth.stats.countries": "Countries",
      "auth.stats.rating": "Rating",

      // Biometric
      "auth.biometric.title": "🔐 Biometric authentication",
      "auth.biometric.suggestion": "Would you like to enable biometric authentication for faster login?",
      "auth.biometric.enable": "Enable ✨",
      "auth.biometric.later": "Later",
      "auth.biometric.prompt": "✨ Magic login with your fingerprint",
      "auth.biometric.expressLogin": "Express Login",
      "auth.biometric.touchFaceId": "Touch/Face ID",

      // Errors
      "auth.errors.emailRequired": "Email is required",
      "auth.errors.invalidEmail": "Please enter a valid email address",
      "auth.errors.passwordRequired": "Password is required",
      "auth.errors.passwordTooShort": "Minimum 6 characters required",
      "auth.errors.usernameRequired": "Username is required",
      "auth.errors.firstNameRequired": "First name is required",
      "auth.errors.lastNameRequired": "Last name is required",
      "auth.errors.nameRequired": "How should we call you?",
      "auth.errors.passwordMismatch": "Passwords do not match",
      "auth.errors.invalidPhoneNumber": "Invalid phone number format",
      "auth.errors.termsRequired": "Please accept our terms of use",
      "auth.errors.generalError": "An error occurred",
      "auth.errors.biometricFailed": "Biometric authentication failed. Try again!",

      // Success
      "auth.success.emailSent": "Email sent",
      "auth.success.emailSentDesc": "Check your mailbox to reset your password",

      // ========== NAVIGATION ==========
      "nav.home": "Home",
      "nav.search": "Search",
      "nav.profile": "Profile",

      // ========== ACCESSIBILITY ==========
      "accessibility.toggleTheme": "Toggle dark/light theme",
      "accessibility.toggleLanguage": "Change language",
    }
  },
  fr: {
    translation: {
      // ========== COMMON ==========
      "common.loading": "Chargement...",
      "common.error": "Oops! 😅",
      "common.success": "Succès",
      "common.retry": "Réessayer",
      "common.cancel": "Annuler",
      "common.ok": "OK",
      "common.confirm": "Confirmer",
      "common.save": "Enregistrer",
      "common.continue": "Continuer",
      "common.back": "Retour",
      "common.next": "Suivant",
      "common.finish": "Terminer",
      "common.search": "Recherche",
      "common.searchDescription": "Découvrez des milliers d'itinéraires partagés par la communauté",
      "common.profile": "Profil",
      "common.profileDescription": "Gérez vos voyages, paramètres et statistiques",

      // ========== AUTH ==========
      "auth.loginTitle": "🌍 Bon retour !",
      "auth.registerTitle": "✨ Rejoignez l'aventure",
      "auth.forgotTitle": "🔑 Récupération de compte",
      "auth.loginButton": "✈️ Explorer le monde",
      "auth.registerButton": "🚀 Commencer l'aventure",
      "auth.forgotButton": "📧 Envoyer le lien",
      "auth.appTagline": "Transformez vos rêves en souvenirs",

      // Placeholders
      "auth.emailPlaceholder": "📧 Adresse email",
      "auth.passwordPlaceholder": "🔒 Mot de passe",
      "auth.confirmPasswordPlaceholder": "🔑 Confirmer le mot de passe",
      "auth.usernamePlaceholder": "👤 Nom d'utilisateur",
      "auth.firstNamePlaceholder": "👤 Prénom",
      "auth.lastNamePlaceholder": "👤 Nom",
      "auth.phoneNumberPlaceholder": "📱 Téléphone (optionnel)",
      "auth.namePlaceholder": "👤 Votre nom complet",

      // Options
      "auth.rememberMe": "Se souvenir de moi",
      "auth.acceptTerms": "J'accepte les conditions d'utilisation",
      "auth.receiveNotifications": "Recevoir des inspirations voyage",

      // Navigation
      "auth.forgotPassword": "🔑 Mot de passe oublié ?",
      "auth.createAccount": "✨ Créer un compte",
      "auth.alreadyMember": "🌍 Déjà membre ? Se connecter",
      "auth.backToLogin": "← Retour à la connexion",

      // Stats
      "auth.stats.adventurers": "Aventuriers",
      "auth.stats.countries": "Pays",
      "auth.stats.rating": "Note",

      // Biometric
      "auth.biometric.title": "🔐 Authentification biométrique",
      "auth.biometric.suggestion": "Souhaitez-vous activer l'authentification biométrique pour une connexion plus rapide ?",
      "auth.biometric.enable": "Activer ✨",
      "auth.biometric.later": "Plus tard",
      "auth.biometric.prompt": "✨ Connexion magique avec votre empreinte",
      "auth.biometric.expressLogin": "Connexion Express",
      "auth.biometric.touchFaceId": "Touch/Face ID",

      // Errors
      "auth.errors.emailRequired": "L'email est requis",
      "auth.errors.invalidEmail": "Veuillez saisir une adresse email valide",
      "auth.errors.passwordRequired": "Le mot de passe est requis",
      "auth.errors.passwordTooShort": "Minimum 6 caractères requis",
      "auth.errors.usernameRequired": "Le nom d'utilisateur est requis",
      "auth.errors.firstNameRequired": "Le prénom est requis",
      "auth.errors.lastNameRequired": "Le nom est requis",
      "auth.errors.nameRequired": "Comment devons-nous vous appeler ?",
      "auth.errors.passwordMismatch": "Les mots de passe ne correspondent pas",
      "auth.errors.invalidPhoneNumber": "Format de téléphone invalide",
      "auth.errors.termsRequired": "Veuillez accepter nos conditions d'utilisation",
      "auth.errors.generalError": "Une erreur est survenue",
      "auth.errors.biometricFailed": "Authentification biométrique échouée. Réessayez !",

      // Success
      "auth.success.emailSent": "Email envoyé",
      "auth.success.emailSentDesc": "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",

      // ========== NAVIGATION ==========
      "nav.home": "Accueil",
      "nav.search": "Recherche",
      "nav.profile": "Profil",

      // ========== ACCESSIBILITY ==========
      "accessibility.toggleTheme": "Basculer le thème sombre/clair",
      "accessibility.toggleLanguage": "Changer la langue",
    }
  }
};

// ========== CONFIGURATION I18NEXT ==========

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage() === 'fr' ? 'fr' : 'en', // Langue détectée
    fallbackLng: 'en',
    debug: __DEV__, // Debug en développement seulement
    
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },

    // Configuration pour React Native
    compatibilityJSON: 'v3',

    // Gestion des clés manquantes en développement
    saveMissing: __DEV__,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (__DEV__) {
        console.warn(`🔑 [i18n] Clé manquante: ${lng}.${key}`);
        // Optionnel: Log dans un service pour tracker les clés manquantes
      }
    },

    // Retour gracieux pour les clés manquantes
    parseMissingKeyHandler: (key) => {
      if (__DEV__) {
        return `[MISSING: ${key}]`;
      }
      return key; // En production, retourner la clé elle-même
    },
  });

// ========== DEBUG HELPER ==========

if (__DEV__) {
  // Helper pour debug les traductions
  const logCurrentLanguage = () => {
    console.log(`🌐 [i18n] Langue active: ${i18n.language}`);
    console.log(`🌐 [i18n] Langues disponibles:`, Object.keys(resources));
  };

  // Log au démarrage
  logCurrentLanguage();

  // Écouter les changements de langue
  i18n.on('languageChanged', (lng) => {
    console.log(`🌐 [i18n] Langue changée vers: ${lng}`);
  });
}

export default i18n;

// ========== UTILITAIRES OPTIONNELS ==========

// Helper pour changer de langue dynamiquement
export const changeLanguage = (lang: 'en' | 'fr') => {
  i18n.changeLanguage(lang);
};

// Helper pour obtenir la langue actuelle
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Helper pour vérifier si une clé existe
export const hasTranslation = (key: string): boolean => {
  return i18n.exists(key);
};

// Helper pour obtenir toutes les langues disponibles
export const getAvailableLanguages = (): string[] => {
  return Object.keys(resources);
};