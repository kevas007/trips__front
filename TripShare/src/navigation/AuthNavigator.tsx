import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '@/screens/auth/AuthScreen';

type AuthStackParamList = {
  AuthScreen: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;