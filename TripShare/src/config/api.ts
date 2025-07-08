// ========== CONFIGURATION API - DÉVELOPPEMENT LOCAL UNIQUEMENT ==========

import { Platform } from 'react-native';

// ⚠️ CONFIGURATION DÉVELOPPEMENT LOCAL UNIQUEMENT
// Backend Go + PostgreSQL local + Redis local

// Configuration des environnements locaux
const LOCAL_ENVIRONMENTS = {
  // Backend localhost (même machine) - PORT 8085
  localhost: {
    baseUrl: 'http://localhost:8085', // LOCALHOST : même machine
    name: 'Localhost + PostgreSQL'
  },
  
  // Backend avec IP réseau (pour tests sur vrais devices) - PORT 8085
  network: {
    baseUrl: 'http://192.168.0.220:8085', // IP locale détectée
    name: 'Network IP + PostgreSQL'
  }
};

// ========== CONFIGURATION ACTIVE ==========

// Changez ici pour basculer entre Localhost et Network
const CURRENT_ENV: keyof typeof LOCAL_ENVIRONMENTS = 'network'; // 'localhost' | 'network'

export const API_CONFIG = {
  // Configuration de base
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || LOCAL_ENVIRONMENTS[CURRENT_ENV].baseUrl,
  API_PREFIX: '/api/v1',
  
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
  NETWORK_IP: '192.168.0.220', // IP locale détectée
};

export const getFullApiUrl = (endpoint: string): string => {
  // Nettoyer l'URL de base
  const cleanBaseUrl = API_CONFIG.BASE_URL.replace(/\/+$/g, '');
  
  // Nettoyer le préfixe API
  const cleanPrefix = API_CONFIG.API_PREFIX.replace(/^\/+|\/+$/g, '');
  
  // Nettoyer l'endpoint
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Construire l'URL complète
  const url = `${cleanBaseUrl}/${cleanPrefix}/${cleanEndpoint}`;
  
  // Log pour debug
  console.log('🔍 Construction URL:', {
    base: cleanBaseUrl,
    prefix: cleanPrefix,
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