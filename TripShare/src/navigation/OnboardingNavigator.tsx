import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import TravelPreferencesScreen from '../screens/TravelPreferencesScreen';

export type OnboardingStackParamList = {
  OnboardingScreen: undefined;
  TravelPreferencesScreen: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingScreen"
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
      <Stack.Screen 
        name="OnboardingScreen" 
        component={OnboardingScreen}
        options={{
          title: 'Bienvenue',
        }}
      />
      
      <Stack.Screen 
        name="TravelPreferencesScreen" 
        component={TravelPreferencesScreen}
        options={{
          title: 'Préférences de Voyage',
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
