import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { authService } from '../../services/auth';
import { tripShareApi } from '../../services/tripShareApi';
import { unifiedApi } from '../../services/unifiedApi';
import { useAppTheme } from '../../hooks/useAppTheme';

const EnhancedAuthTestComponent = () => {
  const { theme } = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Statut d'authentification
  const testAuthStatus = async () => {
    setIsLoading(true);
    addResult('🔍 Test du statut d\'authentification...');
    
    try {
      const isAuth = authService.isAuthenticated();
      const token = authService.getToken();
      
      addResult(`✅ Authentifié: ${isAuth}`);
      addResult(`🔑 Token présent: ${!!token}`);
      addResult(`🔑 Token (début): ${token ? token.substring(0, 20) + '...' : 'Aucun'}`);
      
      if (token) {
        // Vérifier l'expiration du token (JWT)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const isExpired = now > exp;
          
          addResult(`⏰ Token expire le: ${new Date(exp).toLocaleString()}`);
          addResult(`⏰ Token expiré: ${isExpired}`);
          addResult(`⏰ Temps restant: ${Math.round((exp - now) / 1000 / 60)} minutes`);
        } catch (parseError) {
          addResult(`⚠️ Impossible de parser le token JWT`);
        }
      }
      
    } catch (error) {
      addResult(`❌ Erreur: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Vérification du token
  const testVerifyToken = async () => {
    setIsLoading(true);
    addResult('🔍 Test de verifyToken()...');
    
         try {
       const user = await authService.verifyToken();
       addResult(`✅ Utilisateur récupéré: ${user.email}`);
       addResult(`👤 Nom: ${user.name || 'Non défini'}`);
       addResult(`🆔 ID: ${user.id}`);
       addResult(`📱 Username: ${user.username}`);
     } catch (error: any) {
      addResult(`❌ Erreur verifyToken: ${error.message}`);
      if (error?.response?.status) {
        addResult(`📡 Status HTTP: ${error.response.status}`);
      }
      if (error?.response?.data) {
        addResult(`📄 Données erreur: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Test de refresh token
  const testRefreshToken = async () => {
    setIsLoading(true);
    addResult('🔄 Test de refreshAccessToken()...');
    
    try {
      const newToken = await authService.refreshAccessToken();
      addResult(`✅ Nouveau token obtenu: ${newToken.substring(0, 20)}...`);
      addResult(`🔑 Token mis à jour dans le service`);
    } catch (error: any) {
      addResult(`❌ Erreur refresh: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Test des APIs
  const testApiCalls = async () => {
    setIsLoading(true);
    addResult('🌐 Test des appels API...');
    
         // Test TripShareApi
     try {
       const profile = await tripShareApi.getProfile();
       addResult(`✅ TripShareApi.getProfile() réussi`);
       addResult(`👤 Profil: ${JSON.stringify(profile).substring(0, 100)}...`);
     } catch (error: any) {
       addResult(`❌ TripShareApi.getProfile() échoué: ${error.message}`);
     }

     // Test UnifiedApi
     try {
       const trips = await unifiedApi.get('/trips');
       addResult(`✅ UnifiedApi.get('/trips') réussi`);
       addResult(`🚗 Données reçues: ${JSON.stringify(trips).substring(0, 50)}...`);
     } catch (error: any) {
       addResult(`❌ UnifiedApi.get('/trips') échoué: ${error.message}`);
     }

    setIsLoading(false);
  };

  // Test 5: Test de déconnexion/reconnexion
  const testLogoutLogin = async () => {
    setIsLoading(true);
    addResult('🔄 Test déconnexion/reconnexion...');
    
    try {
      // Sauvegarder les credentials pour test
      const testCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Déconnexion
      await authService.logout();
      addResult(`✅ Déconnexion réussie`);
      
      // Vérifier l'état après déconnexion
      const isAuthAfterLogout = authService.isAuthenticated();
      addResult(`🔍 Authentifié après logout: ${isAuthAfterLogout}`);
      
      // Tentative de reconnexion (avec des credentials de test)
      try {
        await authService.login(testCredentials);
        addResult(`✅ Reconnexion réussie`);
      } catch (loginError: any) {
        addResult(`⚠️ Reconnexion échouée (normal si pas de compte test): ${loginError.message}`);
      }
      
    } catch (error: any) {
      addResult(`❌ Erreur test logout/login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 6: Test de connectivité réseau
  const testNetworkConnectivity = async () => {
    setIsLoading(true);
    addResult('🌐 Test de connectivité réseau...');
    
    try {
      // Test simple de ping vers le backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.220:8085'}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Backend accessible: ${response.status}`);
        addResult(`📊 Santé: ${JSON.stringify(data)}`);
      } else {
        addResult(`⚠️ Backend répond mais erreur: ${response.status}`);
      }
    } catch (error: any) {
      addResult(`❌ Backend inaccessible: ${error.message}`);
      addResult(`🔧 Vérifiez que le backend est démarré sur le bon port`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test complet
  const runAllTests = async () => {
    clearResults();
    addResult('🚀 === DÉBUT DES TESTS COMPLETS ===');
    
    await testAuthStatus();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testNetworkConnectivity();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testVerifyToken();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testApiCalls();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addResult('🏁 === TESTS TERMINÉS ===');
  };

     const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 20,
       backgroundColor: '#f5f5f5',
     },
     title: {
       fontSize: 24,
       fontWeight: 'bold',
       color: '#333',
       marginBottom: 20,
       textAlign: 'center',
     },
     buttonContainer: {
       flexDirection: 'row',
       flexWrap: 'wrap',
       justifyContent: 'space-around',
       marginBottom: 20,
     },
     button: {
       backgroundColor: '#007AFF',
       paddingHorizontal: 15,
       paddingVertical: 10,
       borderRadius: 8,
       margin: 5,
       minWidth: 100,
     },
     buttonText: {
       color: 'white',
       fontSize: 12,
       textAlign: 'center',
       fontWeight: '600',
     },
     clearButton: {
       backgroundColor: '#FF3B30',
     },
     allTestsButton: {
       backgroundColor: '#34C759',
       width: '100%',
     },
     resultsContainer: {
       flex: 1,
       backgroundColor: 'white',
       borderRadius: 8,
       padding: 15,
       maxHeight: 400,
     },
     resultText: {
       fontSize: 11,
       color: '#333',
       marginBottom: 5,
       fontFamily: 'monospace',
     },
     loadingText: {
       fontSize: 16,
       color: '#007AFF',
       textAlign: 'center',
       marginVertical: 10,
     },
   });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Diagnostic d'Authentification</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.allTestsButton]} 
          onPress={runAllTests}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🚀 Tous les Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAuthStatus} disabled={isLoading}>
          <Text style={styles.buttonText}>🔍 Statut Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testVerifyToken} disabled={isLoading}>
          <Text style={styles.buttonText}>✅ Vérifier Token</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testRefreshToken} disabled={isLoading}>
          <Text style={styles.buttonText}>🔄 Refresh Token</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testApiCalls} disabled={isLoading}>
          <Text style={styles.buttonText}>🌐 Test APIs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testNetworkConnectivity} disabled={isLoading}>
          <Text style={styles.buttonText}>📡 Réseau</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>🗑️ Effacer</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <Text style={styles.loadingText}>⏳ Test en cours...</Text>}

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default EnhancedAuthTestComponent; 