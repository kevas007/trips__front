import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EnhancedAuthScreen from '@/screens/auth/EnhancedAuthScreen';
import TermsScreen from '@/screens/legal/TermsScreen';
import OnboardingScreen from '@/screens/auth/OnboardingScreen';
import TravelPreferencesScreen from '@/screens/TravelPreferencesScreen';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { useNavigation } from '@react-navigation/native';

export type AuthStackParamList = {
  AuthScreen: undefined;
  TermsScreen: undefined;
  OnboardingScreen: undefined;
  TravelPreferencesScreen: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { isNewUser, isAuthenticated } = useSimpleAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Si non authentifié, rediriger vers l'écran de connexion
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthScreen' as never }],
      });
    } else if (isNewUser) {
      // Si nouvel utilisateur authentifié, rediriger vers l'onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'OnboardingScreen' as never }],
      });
    }
  }, [isNewUser, isAuthenticated]);

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="AuthScreen"
    >
      <Stack.Screen name="AuthScreen" component={EnhancedAuthScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="TravelPreferencesScreen" component={TravelPreferencesScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;