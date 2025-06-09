// === App.tsx - VERSION CORRIGÉE AVEC REACT-I18NEXT ===

import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Import de la configuration i18n
import './src/i18n';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useAppTheme } from './src/hooks/useAppTheme';

// Navigation
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

// ========== NAVIGATION PRINCIPALE AVEC THÈME ==========

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, isDark } = useAppTheme();

  // Écran de chargement thématisé
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.primary[0]
      }}>
        <Ionicons 
          name="airplane" 
          size={64} 
          color="#FFFFFF" 
        />
        <Text style={{ 
          color: '#FFFFFF', 
          fontSize: 24, 
          fontWeight: 'bold',
          marginTop: 20
        }}>
          TripShare
        </Text>
        <Text style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: 16,
          marginTop: 10
        }}>
          Chargement...
        </Text>
      </View>
    );
  }

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: theme.colors.primary[0],
      background: theme.colors.background.primary,
      card: theme.colors.background.card,
      text: theme.colors.text.primary,
      border: theme.colors.glassmorphism.border,
      notification: theme.colors.semantic.info,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
};

// ========== WRAPPER AVEC CONTEXTS ==========

const AppWithProviders: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
};

// ========== COMPOSANT RACINE ==========

const App: React.FC = () => {
  return <AppWithProviders />;
};

export default App;
