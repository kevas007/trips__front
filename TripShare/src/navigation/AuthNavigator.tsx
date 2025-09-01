import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store';
import SimpleAuthScreen from '../screens/auth/SimpleAuthScreen';
import TermsScreen from '../screens/legal/TermsScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import TravelPreferencesScreen from '../screens/TravelPreferencesScreen';

export type AuthStackParamList = {
  AuthScreen: undefined;
  TermsScreen: undefined;
  OnboardingScreen: undefined;
  TravelPreferencesScreen: undefined;
  ResetPasswordScreen: undefined;
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  console.log('🎯 AuthNavigator - État:', { isAuthenticated });

  return (
    <Stack.Navigator
      initialRouteName="AuthScreen"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* Écran principal d'authentification avec toggle */}
      <Stack.Screen 
        name="AuthScreen" 
        component={SimpleAuthScreen}
        options={{
          title: 'Authentification',
        }}
      />

      

      {/* Écran de mot de passe oublié */}
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Mot de passe oublié',
          headerShown: true,
          headerLeft: () => null, // Pas de bouton de retour automatique
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#008080',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      {/* Écrans légaux et onboarding */}
      <Stack.Screen 
        name="TermsScreen" 
        component={TermsScreen}
        options={{
          title: 'Conditions d\'utilisation',
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#008080',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <Stack.Screen 
        name="OnboardingScreen" 
        component={OnboardingScreen}
        options={{
          title: 'Bienvenue',
          headerShown: false,
        }}
      />

      <Stack.Screen 
        name="TravelPreferencesScreen" 
        component={TravelPreferencesScreen}
        options={{
          title: 'Préférences de voyage',
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#008080',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <Stack.Screen 
        name="ResetPasswordScreen" 
        component={ResetPasswordScreen}
        options={{
          title: 'Réinitialiser le mot de passe',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;