import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../store';
import { authService } from '../services/auth';
import { resetToAuth } from '../navigation/RootNavigation';

const AuthDebugger: React.FC = () => {
  const { user, isLoading, isAuthenticated, error, logout } = useAuthStore();

  useEffect(() => {
    // Vérification automatique au montage
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    console.log('🔧 AuthDebugger - Vérification état auth...');
    
    const serviceIsAuth = authService.isAuthenticated();
    const token = authService.getToken();
    
    console.log('🔧 AuthDebugger - État détaillé:', {
      'Context user': !!user,
      'Context isAuthenticated': isAuthenticated,
      'Context isLoading': isLoading,
      'Service isAuthenticated': serviceIsAuth,
      'Token présent': !!token,
      'Error': error
    });

    // Si pas d'utilisateur mais token présent, il y a un problème
    if (!user && !isLoading && token) {
      console.log('⚠️ AuthDebugger - Incohérence détectée! Token présent mais pas d\'utilisateur');
      await logout();
    }
    
    // Si pas d'utilisateur et pas de token, rediriger vers auth
    if (!user && !isLoading && !token) {
      console.log('🔧 AuthDebugger - Redirection vers auth nécessaire');
      await logout();
    }
  };

  const forceLogout = async () => {
    console.log('🔧 AuthDebugger - Forcer la déconnexion...');
    await logout();
  };

  const forceAuthRedirect = async () => {
    console.log('🔧 AuthDebugger - Forcer la redirection vers auth...');
    try {
      // Préférer l'utilisation du logout qui gère correctement l'état
      await logout();
    } catch (error) {
      console.warn('⚠️ Erreur lors du logout forcé:', error);
      // En dernier recours, essayer resetToAuth
      try {
        resetToAuth();
      } catch (navError) {
        console.warn('⚠️ Erreur resetToAuth aussi:', navError);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chargement de l'authentification...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Authentification</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Utilisateur: {user ? '✅' : '❌'}</Text>
        <Text style={styles.infoText}>Email: {user?.email || 'N/A'}</Text>
        <Text style={styles.infoText}>Authentifié: {isAuthenticated ? '✅' : '❌'}</Text>
        <Text style={styles.infoText}>Token: {authService.getToken() ? '✅' : '❌'}</Text>
        <Text style={styles.infoText}>Erreur: {error || 'Aucune'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkAuthState}>
          <Text style={styles.buttonText}>Vérifier État</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={forceLogout}>
          <Text style={styles.buttonText}>Forcer Déconnexion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.redirectButton]} onPress={forceAuthRedirect}>
          <Text style={styles.buttonText}>Rediriger vers Auth</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    minWidth: 200,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 3,
  },
  text: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  redirectButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AuthDebugger; 