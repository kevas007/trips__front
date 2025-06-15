import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import de la configuration i18n
import './i18n';

// Contexts
import { SimpleAuthProvider, useSimpleAuth } from './contexts/SimpleAuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { useAppTheme } from './hooks/useAppTheme';

// Navigation
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';

// Debug OAuth (temporaire)
import { debugOAuthInfo } from './utils/debugOAuth';

// ========== DEBUG OAUTH (TEMPORAIRE) ==========
// Afficher les informations OAuth dans la console au démarrage
debugOAuthInfo();

// ========== COMPOSANTS DE BASE ==========

const LoadingScreen: React.FC = () => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#667eea' // Couleur fixe pour éviter les erreurs de thème
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
};

// ========== NAVIGATION PRINCIPALE ==========

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useSimpleAuth();
  const { theme, isDark } = useAppTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors.primary[0],
          background: theme.colors.background.primary,
          card: theme.colors.background.card,
          text: theme.colors.text.primary,
          border: theme.colors.glassmorphism.border,
          notification: theme.colors.semantic.info,
        },
      }}
    >
      <View style={{ flex: 1 }}>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    </NavigationContainer>
  );
};

// ========== WRAPPER AVEC CONTEXTS ==========

const AppWithProviders: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SimpleAuthProvider>
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </SimpleAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppWithProviders; 