// === App.tsx - VERSION CORRIGÉE AVEC REACT-I18NEXT ===

import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import HomeScreen from './src/screens/main/HomeScreen';
import MainNavigator from './src/navigation/MainNavigator';

// Types
import type { RootStackParamList, MainTabParamList } from './src/types/navigation';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ========== ÉCRANS TEMPORAIRES THÉMATISÉS ===

const SearchScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary
    }}>
      <Ionicons 
        name="search-outline" 
        size={64} 
        color={theme.colors.primary[0]} 
      />
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: theme.colors.text.primary,
        marginTop: 20
      }}>
        {t('common.search')}
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: theme.colors.text.secondary,
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 40
      }}>
        {t('common.searchDescription')}
      </Text>
    </View>
  );
};

// ========== NAVIGATION PRINCIPALE THÉMATISÉE ==========

const MainTabs: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];
          const color = focused ? theme.colors.primary[0] : theme.colors.text.secondary;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[0],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: theme.colors.glassmorphism.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: t('nav.home'),
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          tabBarLabel: t('nav.search'),
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={MainNavigator} 
        options={{ 
          tabBarLabel: t('nav.profile'),
        }} 
      />
    </Tab.Navigator>
  );
};

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
      {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
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
