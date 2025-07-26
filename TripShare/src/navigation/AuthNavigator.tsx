import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EnhancedAuthScreen from '@/screens/auth/EnhancedAuthScreen';
import TermsScreen from '@/screens/legal/TermsScreen';
import OnboardingScreen from '@/screens/auth/OnboardingScreen';
import TravelPreferencesScreen from '@/screens/TravelPreferencesScreen';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

export type AuthStackParamList = {
  AuthScreen: undefined;
  TermsScreen: undefined;
  OnboardingScreen: undefined;
  TravelPreferencesScreen: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { isNewUser, isAuthenticated, isLoading } = useSimpleAuth();

  // Debug logs
  console.log('🔍 AuthNavigator - État:', { isNewUser, isAuthenticated, isLoading });

  // Déterminer la route initiale basée sur l'état d'authentification
  const getInitialRouteName = () => {
    if (isLoading) {
      console.log('🔍 AuthNavigator - Chargement en cours, route par défaut: AuthScreen');
      return 'AuthScreen';
    }
    
    if (!isAuthenticated) {
      console.log('🔍 AuthNavigator - Non authentifié, route: AuthScreen');
      return 'AuthScreen';
    }
    
    if (isNewUser) {
      console.log('🔍 AuthNavigator - Nouvel utilisateur, route: OnboardingScreen');
      return 'OnboardingScreen';
    }
    
    console.log('🔍 AuthNavigator - Utilisateur existant, route: AuthScreen');
    return 'AuthScreen';
  };

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRouteName()}
    >
      <Stack.Screen name="AuthScreen" component={EnhancedAuthScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="TravelPreferencesScreen" component={TravelPreferencesScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;