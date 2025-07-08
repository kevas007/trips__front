// === src/utils/networkDebug.ts - DIAGNOSTIQUE RÉSEAU ===

import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';

// ========== CONFIGURATION DEBUG ==========

export const NETWORK_CONFIG = {
  // URL du backend (utilise la configuration centralisée)
  BACKEND_URL: API_CONFIG.BASE_URL,
  
  // URLs de test alternatives (port 8000 pour le backend Go)
  LOCALHOST_URLS: {
    web: 'http://localhsot:8000',
    android_emulator: 'http://localhsot:8000',
    ios_simulator: 'http://localhsot:8000',
    physical_device: 'http://localhsot:8000', // IP locale configurée
  },
  
  // Timeouts
  TIMEOUTS: {
    quick: 3000,   // 3 secondes
    normal: 10000, // 10 secondes
    long: 30000,   // 30 secondes
  }
};

// ========== FONCTIONS DE DIAGNOSTIC ==========

export class NetworkDiagnostic {
  
  // Test de connectivité basique
  static async testBasicConnectivity(): Promise<boolean> {
    try {
      // Test avec un service externe fiable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.TIMEOUTS.quick);
      
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('❌ Pas de connectivité internet basique');
      return false;
    }
  }

  // Test du backend principal
  static async testBackendConnectivity(url: string = NETWORK_CONFIG.BACKEND_URL): Promise<{
    success: boolean;
    status?: number;
    message: string;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Test connexion: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.TIMEOUTS.normal);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          status: response.status,
          message: `✅ Connexion réussie - ${data.message || 'TripShare API'} (${responseTime}ms)`,
          responseTime,
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: `❌ Erreur HTTP ${response.status} (${responseTime}ms)`,
          responseTime,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      let message = '❌ ';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message += 'Impossible de joindre le serveur';
      } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
        message += 'Timeout de connexion';
      } else {
        message += `Erreur: ${error.message}`;
      }
      
      return {
        success: false,
        message: `${message} (${responseTime}ms)`,
        responseTime,
      };
    }
  }

  // Test de toutes les URLs possibles
  static async testAllPossibleUrls(): Promise<Array<{
    url: string;
    platform: string;
    result: Awaited<ReturnType<typeof NetworkDiagnostic.testBackendConnectivity>>;
  }>> {
    const urlsToTest = [
      { url: NETWORK_CONFIG.BACKEND_URL, platform: 'production' },
      { url: NETWORK_CONFIG.LOCALHOST_URLS.web, platform: 'web-localhost' },
      { url: NETWORK_CONFIG.LOCALHOST_URLS.android_emulator, platform: 'android-emulator' },
      { url: NETWORK_CONFIG.LOCALHOST_URLS.ios_simulator, platform: 'ios-simulator' },
    ];

    const results = [];
    
    for (const { url, platform } of urlsToTest) {
      console.log(`🧪 Test ${platform}: ${url}`);
      const result = await this.testBackendConnectivity(url);
      results.push({ url, platform, result });
      
      // Délai entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  // Diagnostic complet
  static async runFullDiagnostic(): Promise<{
    hasInternet: boolean;
    backendResults: Awaited<ReturnType<typeof NetworkDiagnostic.testAllPossibleUrls>>;
    recommendations: string[];
  }> {
    console.log('🔍 === DIAGNOSTIC RÉSEAU COMPLET ===');
    
    // 1. Test connectivité internet
    const hasInternet = await this.testBasicConnectivity();
    console.log(`📶 Internet: ${hasInternet ? '✅ OK' : '❌ KO'}`);
    
    // 2. Test backend
    const backendResults = await this.testAllPossibleUrls();
    
    // 3. Recommandations
    const recommendations = this.generateRecommendations(hasInternet, backendResults);
    
    console.log('📋 === RECOMMANDATIONS ===');
    recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
    
    return {
      hasInternet,
      backendResults,
      recommendations,
    };
  }

  // Génération de recommandations
  static generateRecommendations(
    hasInternet: boolean, 
    backendResults: Awaited<ReturnType<typeof NetworkDiagnostic.testAllPossibleUrls>>
  ): string[] {
    const recommendations: string[] = [];
    
    if (!hasInternet) {
      recommendations.push('Vérifiez votre connexion internet');
      recommendations.push('Essayez de vous connecter à un autre réseau WiFi');
      return recommendations;
    }
    
    const workingUrl = backendResults.find(r => r.result.success);
    
    if (workingUrl) {
      recommendations.push(`✅ Utiliser cette URL: ${workingUrl.url}`);
      recommendations.push(`Configuration trouvée pour: ${workingUrl.platform}`);
    } else {
      recommendations.push('❌ Aucune URL backend accessible');
      
      // Recommandations spécifiques par plateforme
      if (Platform.OS === 'android') {
        recommendations.push('Android Emulator: Utilisez localhsot (IP réseau)');
        recommendations.push('Android Physical: Utilisez l\'IP de votre machine (localhsot)');
      } else if (Platform.OS === 'ios') {
        recommendations.push('iOS Simulator: Utilisez localhsot (IP réseau)');
        recommendations.push('iOS Physical: Utilisez l\'IP de votre machine (localhsot)');
      } else if (Platform.OS === 'web') {
        recommendations.push('Web: Vérifiez que le serveur autorise CORS');
        recommendations.push('Web: Utilisez localhsot au lieu de localhost');
      }
      
      recommendations.push('Vérifiez que votre serveur backend est démarré');
      recommendations.push('Vérifiez les règles de firewall/antivirus');
      recommendations.push(`Testez manuellement: curl ${NETWORK_CONFIG.BACKEND_URL}/`);
    }
    
    return recommendations;
  }

  // Utilitaire pour log de configuration
  static logCurrentConfig(): void {
    console.log('🔧 Configuration réseau actuelle:');
    console.log(`  • Environnement: ${API_CONFIG.ENV_NAME}`);
    console.log(`  • URL Backend: ${API_CONFIG.BASE_URL}`);
    console.log(`  • Timeout: ${API_CONFIG.REQUEST_TIMEOUT}ms`);
    console.log(`  • Logs activés: ${API_CONFIG.ENABLE_LOGGING}`);
  }
}

// ========== HOOK REACT ==========

import { useState, useEffect } from 'react';

export const useNetworkDiagnostic = (autoRun: boolean = false) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof NetworkDiagnostic.runFullDiagnostic>> | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await NetworkDiagnostic.runFullDiagnostic();
      setResults(diagnosticResults);
      return diagnosticResults;
    } catch (error) {
      console.error('Erreur pendant le diagnostic:', error);
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (autoRun) {
      runDiagnostic();
    }
  }, [autoRun]);

  return {
    runDiagnostic,
    isRunning,
    results,
    // Raccourcis
    isBackendReachable: results ? results.backendResults.some(r => r.result.success) : null,
    hasInternet: results?.hasInternet ?? null,
    recommendations: results?.recommendations ?? [],
  };
};

// Auto-log de la config au démarrage en développement
if (API_CONFIG.ENABLE_LOGGING) {
  NetworkDiagnostic.logCurrentConfig();
}