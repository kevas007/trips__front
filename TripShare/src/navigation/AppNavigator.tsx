import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  // Debug logs pour comprendre l'état
  console.log('🔍 AppNavigator - État auth:', {
    user: !!user,
    isLoading,
    isAuthenticated,
    userEmail: user?.email,
  });

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#FFFFFF'
      }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Si utilisateur authentifié, montrer Main, sinon Auth
  const shouldShowAuth = !isAuthenticated || !user;
  
  console.log('🔍 AppNavigator - Navigation vers:', shouldShowAuth ? 'Auth' : 'Main');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {shouldShowAuth ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 