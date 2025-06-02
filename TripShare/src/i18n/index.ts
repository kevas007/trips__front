// === src/i18n/index.ts - CONFIGURATION REACT-I18NEXT ===

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

// Détection langue du device
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

// Traductions TripShare
const resources = {
  en: {
    translation: {
      // Auth
      "auth.loginTitle": "🌍 Welcome back!",
      "auth.registerTitle": "✨ Join the adventure",
      "auth.forgotTitle": "🔑 Account recovery",
      "auth.loginButton": "✈️ Explore the world",
      "auth.registerButton": "🚀 Start the adventure",
      "auth.forgotButton": "📧 Send link",
      "auth.emailPlaceholder": "📧 Email address",
      "auth.passwordPlaceholder": "🔒 Password",
      "auth.confirmPasswordPlaceholder": "🔑 Confirm password",
      "auth.namePlaceholder": "👤 Your full name",
      "auth.rememberMe": "Remember me",
      "auth.acceptTerms": "I accept the terms of use",
      "auth.receiveNotifications": "Receive travel inspirations",
      "auth.forgotPassword": "🔑 Forgot password?",
      "auth.createAccount": "✨ Create account",
      "auth.alreadyMember": "🌍 Already a member? Sign in",
      "auth.backToLogin": "← Back to login",
      "auth.appTagline": "Transform your dreams into memories",
      
      // Stats
      "auth.stats.adventurers": "Adventurers",
      "auth.stats.countries": "Countries",
      "auth.stats.appRating": "App Rating",
      
      // Biometric
      "auth.biometric.title": "🔐 Biometric authentication",
      "auth.biometric.enable": "Enable ✨",
      "auth.biometric.later": "Later",
      "auth.biometric.prompt": "✨ Magic login with your fingerprint",
      
      // Errors
      "auth.errors.invalidEmail": "Please enter a valid email address",
      "auth.errors.passwordTooShort": "Minimum 6 characters required",
      "auth.errors.nameRequired": "How should we call you?",
      "auth.errors.passwordMismatch": "Passwords do not match",
      "auth.errors.termsRequired": "Please accept our terms of use",
      "auth.errors.biometricFailed": "Biometric authentication failed. Try again!",
      
      // Success
      "auth.success.emailSent": "Check your mailbox to reset your password",
      
      // Navigation
      "nav.home": "Home",
      "nav.search": "Search",
      "nav.profile": "Profile",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Oops! 😅",
      "common.retry": "Retry",
      "common.cancel": "Cancel",
      "common.ok": "OK",
      "common.search": "Search",
      "common.searchDescription": "Discover thousands of itineraries shared by the community",
      "common.profile": "Profile",
      "common.profileDescription": "Manage your trips, settings and statistics",
    }
  },
  fr: {
    translation: {
      // Auth
      "auth.loginTitle": "🌍 Bon retour !",
      "auth.registerTitle": "✨ Rejoignez l'aventure",
      "auth.forgotTitle": "🔑 Récupération de compte",
      "auth.loginButton": "✈️ Explorer le monde",
      "auth.registerButton": "🚀 Commencer l'aventure",
      "auth.forgotButton": "📧 Envoyer le lien",
      "auth.emailPlaceholder": "📧 Adresse email",
      "auth.passwordPlaceholder": "🔒 Mot de passe",
      "auth.confirmPasswordPlaceholder": "🔑 Confirmer le mot de passe",
      "auth.namePlaceholder": "👤 Votre nom complet",
      "auth.rememberMe": "Se souvenir de moi",
      "auth.acceptTerms": "J'accepte les conditions d'utilisation",
      "auth.receiveNotifications": "Recevoir des inspirations voyage",
      "auth.forgotPassword": "🔑 Mot de passe oublié ?",
      "auth.createAccount": "✨ Créer un compte",
      "auth.alreadyMember": "🌍 Déjà membre ? Se connecter",
      "auth.backToLogin": "← Retour à la connexion",
      "auth.appTagline": "Transformez vos rêves en souvenirs",
      
      // Stats
      "auth.stats.adventurers": "Aventuriers",
      "auth.stats.countries": "Pays",
      "auth.stats.appRating": "Note App",
      
      // Biometric
      "auth.biometric.title": "🔐 Authentification biométrique",
      "auth.biometric.enable": "Activer ✨",
      "auth.biometric.later": "Plus tard",
      "auth.biometric.prompt": "✨ Connexion magique avec votre empreinte",
      
      // Errors
      "auth.errors.invalidEmail": "Veuillez saisir une adresse email valide",
      "auth.errors.passwordTooShort": "Minimum 6 caractères requis",
      "auth.errors.nameRequired": "Comment devons-nous vous appeler ?",
      "auth.errors.passwordMismatch": "Les mots de passe ne correspondent pas",
      "auth.errors.termsRequired": "Veuillez accepter nos conditions d'utilisation",
      "auth.errors.biometricFailed": "Authentification biométrique échouée. Réessayez !",
      
      // Success
      "auth.success.emailSent": "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      
      // Navigation
      "nav.home": "Accueil",
      "nav.search": "Recherche",
      "nav.profile": "Profil",
      
      // Common
      "common.loading": "Chargement...",
      "common.error": "Oops! 😅",
      "common.retry": "Réessayer",
      "common.cancel": "Annuler",
      "common.ok": "OK",
      "common.search": "Recherche",
      "common.searchDescription": "Découvrez des milliers d'itinéraires partagés par la communauté",
      "common.profile": "Profil",
      "common.profileDescription": "Gérez vos voyages, paramètres et statistiques",
    }
  }
};

// Configuration i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage() === 'fr' ? 'fr' : 'en', // Langue détectée
    fallbackLng: 'en',
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false, // React échappe déjà
    },
  });

export default i18n;