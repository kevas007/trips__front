import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '@/screens/auth/AuthScreen';
import TermsScreen from '@/screens/legal/TermsScreen';

type AuthStackParamList = {
  AuthScreen: undefined;
  TermsScreen: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;