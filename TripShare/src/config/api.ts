// ========== CONFIGURATION API - DÉVELOPPEMENT LOCAL UNIQUEMENT ==========

import { Platform } from 'react-native';

// ⚠️ CONFIGURATION DÉVELOPPEMENT LOCAL UNIQUEMENT
// Backend AWS PostgreSQL + Redis local

// Configuration des environnements locaux
const LOCAL_ENVIRONMENTS = {
  // Backend local Docker connecté à AWS PostgreSQL - PORT 8005
  docker: {
    baseUrl: 'http://localhost:8005/api/v1', // TOUS LES PLATEFORMES : localhost
    name: 'Local Docker + AWS PostgreSQL'
  },
  
  // Backend avec IP réseau (pour tests sur vrais devices) - PORT 8005
  network: {
    baseUrl: 'http://192.168.0.220:8005/api/v1', // Votre IP locale + API v1
    name: 'Local Network + AWS PostgreSQL'
  }
};

// ========== CONFIGURATION ACTIVE ==========

// Changez ici pour basculer entre Docker et Network
const CURRENT_ENV: keyof typeof LOCAL_ENVIRONMENTS = 'docker'; // 'docker' | 'network'

export const API_CONFIG = {
  BASE_URL: LOCAL_ENVIRONMENTS[CURRENT_ENV].baseUrl,
  ENVIRONMENT: CURRENT_ENV,
  ENV_NAME: LOCAL_ENVIRONMENTS[CURRENT_ENV].name,
  
  // Timeouts optimisés pour le développement local
  REQUEST_TIMEOUT: 10000, // 10 secondes (suffisant en local)
  
  // Debug toujours activé en développement
  ENABLE_LOGGING: true,
  
  // Helper pour l'IP locale
  NETWORK_IP: '192.168.0.220', // Changez selon votre IP
};

// ========== HELPERS POUR DÉVELOPPEMENT ==========

// Fonction pour changer d'environnement facilement
export const switchToDocker = () => {
  console.log('🐳 Basculement vers Docker localhost:8005/api/v1');
  return LOCAL_ENVIRONMENTS.docker.baseUrl;
};

export const switchToNetwork = () => {
  console.log('🌐 Basculement vers IP réseau pour device physique');
  return LOCAL_ENVIRONMENTS.network.baseUrl;
};

// Guide rapide pour les développeurs
export const getDeviceSetupGuide = () => {
  return {
    web: 'Utilisez http://localhost:8005/api/v1 (Docker + AWS)',
    androidEmulator: 'Utilisez http://10.0.2.2:8005/api/v1 (Docker + AWS)',
    iosSimulator: 'Utilisez http://localhost:8005/api/v1 (Docker + AWS)',
    physicalDevice: `Utilisez http://${API_CONFIG.NETWORK_IP}:8005/api/v1 (changez CURRENT_ENV vers 'network')`,
    
    quickSwitch: {
      docker: "Changez CURRENT_ENV vers 'docker'",
      network: "Changez CURRENT_ENV vers 'network'"
    }
  };
};

// Log de démarrage en développement
console.log('🚀 === CONFIGURATION DÉVELOPPEMENT LOCAL + AWS ===');
console.log(`📱 Plateforme: ${Platform.OS}`);
console.log(`🌐 Backend: ${API_CONFIG.ENV_NAME}`);
console.log(`🔗 URL: ${API_CONFIG.BASE_URL}`);
console.log(`🗄️ Base de données: AWS PostgreSQL`);
console.log(`📦 Cache: Redis local`);
console.log('💡 Tip: Changez CURRENT_ENV dans src/config/api.ts pour basculer');

export default API_CONFIG; 