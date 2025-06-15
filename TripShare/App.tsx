// === App.tsx - VERSION CORRIGÉE AVEC REACT-I18NEXT ===

import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Import de la configuration i18n
import './src/i18n/index';

// Contexts et Store
import { SimpleAuthProvider, useSimpleAuth } from './src/contexts/SimpleAuthContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useAppTheme } from './src/hooks/useAppTheme';

// Navigation
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

// ========== NAVIGATION PRINCIPALE AVEC THÈME ==========

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useSimpleAuth();
  const { theme, isDark } = useAppTheme();

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

  // Écran de chargement
  if (isLoading) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background.primary 
      }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons 
          name="airplane" 
          size={60} 
          color={theme.colors.primary[0]} 
          style={{ marginBottom: 20 }}
        />
        <Text style={{ 
          color: theme.colors.text.primary, 
          fontSize: 18,
          fontWeight: '600'
        }}>
          TripShare
        </Text>
        <Text style={{ 
          color: theme.colors.text.secondary, 
          fontSize: 14,
          marginTop: 8
        }}>
          Chargement...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={Platform.OS === 'android' ? theme.colors.background.primary : undefined}
      />
      <NavigationContainer theme={navigationTheme}>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
};

// ========== WRAPPER AVEC CONTEXTS ==========

const AppWithProviders: React.FC = () => {
  return (
    <SafeAreaProvider>
      <SimpleAuthProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SimpleAuthProvider>
    </SafeAreaProvider>
  );
};

// ========== COMPOSANT RACINE ==========

const App: React.FC = () => {
  return <AppWithProviders />;
};

export default App;
