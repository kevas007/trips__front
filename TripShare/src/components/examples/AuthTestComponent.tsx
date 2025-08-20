import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authService } from '../../services/auth';
import { tripShareApi } from '../../services/tripShareApi';
import { unifiedApi } from '../../services/unifiedApi';

const AuthTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testAuthStatus = async () => {
    setIsLoading(true);
    addResult('🔍 Test du statut d\'authentification...');
    
    try {
      const isAuth = authService.isAuthenticated();
      const token = authService.getToken();
      
      addResult(`✅ Authentifié: ${isAuth}`);
      addResult(`🔑 Token présent: ${!!token}`);
      addResult(`🔑 Token (début): ${token ? token.substring(0, 20) + '...' : 'Aucun'}`);
      
    } catch (error) {
      addResult(`❌ Erreur: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVerifyToken = async () => {
    setIsLoading(true);
    addResult('🔍 Test de verifyToken()...');
    
    try {
      const user = await authService.verifyToken();
      addResult(`✅ Utilisateur récupéré: ${user.email}`);
      addResult(`👤 Nom: ${user.first_name} ${user.last_name}`);
    } catch (error: any) {
      addResult(`❌ Erreur verifyToken: ${error.message}`);
      if (error?.response?.status) {
        addResult(`📡 Status HTTP: ${error.response.status}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testTripShareApi = async () => {
    setIsLoading(true);
    addResult('🔍 Test de tripShareApi.getProfile()...');
    
    try {
      const profile = await tripShareApi.getProfile();
      addResult(`✅ Profil récupéré via tripShareApi`);
      addResult(`👤 Email: ${profile.email}`);
    } catch (error: any) {
      addResult(`❌ Erreur tripShareApi: ${error.message}`);
      if (error?.response?.status) {
        addResult(`📡 Status HTTP: ${error.response.status}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testUnifiedApi = async () => {
    setIsLoading(true);
    addResult('🔍 Test de unifiedApi.get("/users/me")...');
    
    try {
      const response = await unifiedApi.get('/users/me');
      addResult(`✅ Réponse unifiedApi: ${JSON.stringify(response).substring(0, 100)}...`);
    } catch (error: any) {
      addResult(`❌ Erreur unifiedApi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    addResult('🔍 Test de fetch direct...');
    
    try {
      const token = authService.getToken();
      const response = await fetch('http://192.168.0.220:8085/api/v1/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      addResult(`📡 Status: ${response.status}`);
      addResult(`📡 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      const text = await response.text();
      addResult(`📡 Body: ${text.substring(0, 200)}...`);
      
    } catch (error: any) {
      addResult(`❌ Erreur fetch: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loginTestUser = async () => {
    setIsLoading(true);
    addResult('🔐 Test de connexion...');
    
    try {
      // Utiliser un utilisateur de test du seed
      const response = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      
      addResult(`✅ Connexion réussie: ${response.user.email}`);
      addResult(`🔑 Token reçu: ${!!response.token}`);
      
    } catch (error: any) {
      addResult(`❌ Erreur connexion: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Test d'Authentification</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testAuthStatus} disabled={isLoading}>
          <Text style={styles.buttonText}>Test Statut Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testVerifyToken} disabled={isLoading}>
          <Text style={styles.buttonText}>Test VerifyToken</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testTripShareApi} disabled={isLoading}>
          <Text style={styles.buttonText}>Test TripShareApi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUnifiedApi} disabled={isLoading}>
          <Text style={styles.buttonText}>Test UnifiedApi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testDirectFetch} disabled={isLoading}>
          <Text style={styles.buttonText}>Test Fetch Direct</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={loginTestUser} disabled={isLoading}>
          <Text style={styles.buttonText}>🔐 Connexion Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults} disabled={isLoading}>
          <Text style={styles.buttonText}>🗑️ Effacer</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Résultats:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
        {testResults.length === 0 && (
          <Text style={styles.noResults}>Aucun test effectué</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
    color: '#666',
  },
  noResults: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AuthTestComponent; 