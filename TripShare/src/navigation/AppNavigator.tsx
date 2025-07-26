import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated, isNewUser } = useSimpleAuth();
  const { theme } = useTheme();

  // Debug logs pour comprendre l'état
  console.log('🔍 AppNavigator - État auth:', {
    user: !!user,
    isLoading,
    isAuthenticated,
    isNewUser,
    userEmail: user?.email,
    userPreferences: user?.preferences
  });

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background.primary 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
      </View>
    );
  }

  // Si nouvel utilisateur, toujours montrer Auth (qui contient l'onboarding)
  // Si utilisateur existant et authentifié, montrer Main
  const shouldShowAuth = !isAuthenticated || !user || isNewUser;
  
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