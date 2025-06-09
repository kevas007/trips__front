// === src/utils/networkDebug.ts - DIAGNOSTIQUE RÉSEAU ===

import { Platform } from 'react-native';

// ========== CONFIGURATION DEBUG ==========

export const NETWORK_CONFIG = {
  // URL du backend
  BACKEND_URL: 'http://34.246.200.184:8000',
  
  // URLs de test alternatives
  LOCALHOST_URLS: {
    web: 'http://localhost:8000',
    android_emulator: 'http://10.0.2.2:8000',
    ios_simulator: 'http://localhost:8000',
    physical_device: 'http://192.168.1.XXX:8000', // Remplacer par votre IP locale
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
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        timeout: NETWORK_CONFIG.TIMEOUTS.quick,
      });
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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: NETWORK_CONFIG.TIMEOUTS.normal,
      });
      
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
        recommendations.push('Android Emulator: Utilisez 10.0.2.2 au lieu de localhost');
        recommendations.push('Android Physical: Utilisez l\'IP de votre machine (192.168.x.x)');
      } else if (Platform.OS === 'ios') {
        recommendations.push('iOS Simulator: localhost devrait fonctionner');
        recommendations.push('iOS Physical: Utilisez l\'IP de votre machine (192.168.x.x)');
      } else if (Platform.OS === 'web') {
        recommendations.push('Web: Vérifiez que le serveur autorise CORS');
        recommendations.push('Web: localhost devrait fonctionner en développement');
      }
      
      recommendations.push('Vérifiez que votre serveur backend est démarré');
      recommendations.push('Vérifiez les règles de firewall/antivirus');
      recommendations.push('Testez manuellement: curl http://34.246.200.184:8000/');
    }
    
    return recommendations;
  }
}

// ========== HOOK POUR DIAGNOSTIC AUTOMATIQUE ==========

import { useState, useEffect } from 'react';

export const useNetworkDiagnostic = (autoRun: boolean = false) => {
  const [diagnostic, setDiagnostic] = useState<{
    isRunning: boolean;
    results: Awaited<ReturnType<typeof NetworkDiagnostic.runFullDiagnostic>> | null;
  }>({
    isRunning: false,
    results: null,
  });

  const runDiagnostic = async () => {
    setDiagnostic({ isRunning: true, results: null });
    
    try {
      const results = await NetworkDiagnostic.runFullDiagnostic();
      setDiagnostic({ isRunning: false, results });
      return results;
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      setDiagnostic({ isRunning: false, results: null });
      throw error;
    }
  };

  useEffect(() => {
    if (autoRun) {
      runDiagnostic();
    }
  }, [autoRun]);

  return {
    ...diagnostic,
    runDiagnostic,
  };
};

// ========== COMPOSANT DE DEBUG RÉSEAU ==========

export const NetworkDebugInfo: React.FC = () => {
  const { isRunning, results, runDiagnostic } = useNetworkDiagnostic();

  return (
    <View style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        🔍 Debug Réseau
      </Text>
      
      <TouchableOpacity
        onPress={runDiagnostic}
        disabled={isRunning}
        style={{
          backgroundColor: isRunning ? '#ccc' : '#007AFF',
          padding: 12,
          borderRadius: 8,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {isRunning ? 'Test en cours...' : 'Lancer le diagnostic'}
        </Text>
      </TouchableOpacity>

      {results && (
        <ScrollView style={{ maxHeight: 300 }}>
          <Text style={{ fontWeight: 'bold' }}>
            📶 Internet: {results.hasInternet ? '✅' : '❌'}
          </Text>
          
          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
            🔗 Tests Backend:
          </Text>
          {results.backendResults.map((test, i) => (
            <Text key={i} style={{ fontSize: 12, marginLeft: 10 }}>
              {test.result.success ? '✅' : '❌'} {test.platform}: {test.result.message}
            </Text>
          ))}
          
          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
            💡 Recommandations:
          </Text>
          {results.recommendations.map((rec, i) => (
            <Text key={i} style={{ fontSize: 12, marginLeft: 10 }}>
              {i + 1}. {rec}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
};