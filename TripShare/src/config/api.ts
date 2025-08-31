// ========== CONFIGURATION API - DÉVELOPPEMENT LOCAL UNIQUEMENT ==========

import { Platform } from 'react-native';

// ⚠️ CONFIGURATION DÉVELOPPEMENT LOCAL UNIQUEMENT
// Backend Go + PostgreSQL local + Redis local

// Configuration des environnements locaux
const LOCAL_ENVIRONMENTS = {
  // Backend localhost (même machine) - PORT 8085 (Docker)
  localhost: {
    baseUrl: 'http://localhost:8085', // LOCALHOST : même machine
    name: 'Localhost + Docker Backend'
  },
  
  // Backend avec IP réseau (pour tests sur vrais devices) - PORT 8085
  network: {
    baseUrl: 'http://192.168.0.220:8085', // IP locale pour appareils physiques
    name: 'Physical Devices + Docker Backend'
  },
  
  // Configuration pour émulateur Android - PORT 8085
  emulator: {
    baseUrl: 'http://10.0.2.2:8085', // IP spéciale pour émulateur Android
    name: 'Android Emulator + Docker Backend'
  }
};

// ========== CONFIGURATION ACTIVE ==========

// Détection automatique de la plateforme
const getCurrentEnvironment = (): keyof typeof LOCAL_ENVIRONMENTS => {
  console.log('🔍 Plateforme détectée:', Platform.OS);
  
  if (Platform.OS === 'android') {
    console.log('📱 Android détecté - Utilisation de 192.168.0.220:8085');
    return 'network';
  } else if (Platform.OS === 'ios') {
    console.log('🍎 iOS détecté - Utilisation de 192.168.0.220:8085 (backend local)');
    return 'network';
  } else {
    console.log('🌐 Web détecté - Utilisation de localhost:8085');
    return 'localhost';
  }
};

// Détection automatique de la plateforme pour choisir la bonne URL
// Utiliser network pour une meilleure compatibilité avec les appareils physiques
const CURRENT_ENV: keyof typeof LOCAL_ENVIRONMENTS = 'network';

export const API_CONFIG = {
  // Configuration de base
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || LOCAL_ENVIRONMENTS[CURRENT_ENV].baseUrl,
  API_PREFIX: '/api/v1',
  
  // Log de la configuration utilisée
  get CONFIG_INFO() {
    return {
      platform: Platform.OS,
      environment: CURRENT_ENV,
      baseUrl: this.BASE_URL,
      fullUrl: `${this.BASE_URL}${this.API_PREFIX}`
    };
  },
  
  // Timeouts et retry
  REQUEST_TIMEOUT: 10000, // 10 secondes (suffisant en local)
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  
  // Environnement
  ENVIRONMENT: CURRENT_ENV,
  ENV_NAME: LOCAL_ENVIRONMENTS[CURRENT_ENV].name,
  
  // Debug toujours activé en développement
  ENABLE_LOGGING: true,
  
  // Helper pour l'IP locale
  NETWORK_IP: '192.168.0.220', // IP locale pour appareils physiques
};

export const getFullApiUrl = (endpoint: string, skipApiPrefix?: boolean): string => {
  // Nettoyer l'URL de base
  const cleanBaseUrl = API_CONFIG.BASE_URL.replace(/\/+$/g, '');
  
  // Nettoyer l'endpoint
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Nettoyer le préfixe API
  const cleanPrefix = API_CONFIG.API_PREFIX.replace(/^\/+|\/+$/g, '');
  
  // Construire l'URL complète
  const url = skipApiPrefix
    ? `${cleanBaseUrl}/${cleanEndpoint}`
    : `${cleanBaseUrl}/${cleanPrefix}/${cleanEndpoint}`;
  
  // Log pour debug
  console.log('🔍 Construction URL:', {
    base: cleanBaseUrl,
    prefix: skipApiPrefix ? '(public)' : cleanPrefix,
    endpoint: cleanEndpoint,
    url: url
  });
  
  return url;
};

// ========== HELPERS POUR DÉVELOPPEMENT ==========

// Fonction pour changer d'environnement facilement
export const switchToLocalhost = () => {
  console.log('🏠 Basculement vers Localhost:8085/api/v1');
  return LOCAL_ENVIRONMENTS.localhost.baseUrl;
};

export const switchToNetwork = () => {
  console.log('🌐 Basculement vers IP réseau pour device physique');
  return LOCAL_ENVIRONMENTS.network.baseUrl;
};

// Guide rapide pour les développeurs
export const getDeviceSetupGuide = () => {
  return {
    web: 'Utilisez http://localhost:8085/api/v1 (Localhost + PostgreSQL)',
    androidEmulator: 'Utilisez http://10.0.2.2:8085/api/v1 (Localhost + PostgreSQL)',
    iosSimulator: 'Utilisez http://localhost:8085/api/v1 (Localhost + PostgreSQL)',
    physicalDevice: `Utilisez http://${API_CONFIG.NETWORK_IP}:8085/api/v1 (changez CURRENT_ENV vers 'network')`,
    
    quickSwitch: {
      localhost: "Changez CURRENT_ENV vers 'localhost'",
      network: "Changez CURRENT_ENV vers 'network'"
    }
  };
};

// Log de démarrage en développement
console.log('🚀 === CONFIGURATION DÉVELOPPEMENT LOCAL ===');
console.log(`📱 Plateforme: ${Platform.OS}`);
console.log(`🌐 Backend: ${API_CONFIG.ENV_NAME}`);
console.log(`🔗 URL: ${API_CONFIG.BASE_URL}`);
console.log(`🗄️ Base de données: PostgreSQL local`);
console.log(`📦 Cache: Redis local`);
console.log('💡 Tip: Changez CURRENT_ENV vers localhost/network dans src/config/api.ts');

export default API_CONFIG; 