import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Text } from 'react-native';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SettingsStack = createStackNavigator();

// Stack pour le profil
const ProfileStack = () => {
  const { theme } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Modifier le profil',
          headerBackTitle: 'Retour',
        }}
      />
    </Stack.Navigator>
  );
};

const SettingsStackScreen = () => {
  const { theme } = useAppTheme();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <SettingsStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Changer le mot de passe' }} />
    </SettingsStack.Navigator>
  );
};

const MainNavigator = () => {
  const { theme, isDark } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={focused ? 28 : 24} color={color} style={{ marginBottom: -2 }} />;
        },
        tabBarActiveTintColor: theme.colors.primary[0],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: isDark ? '#1a2233' : '#FFFFFF',
          borderTopColor: isDark ? '#232b3b' : '#E2E8F0',
          height: 64,
          paddingBottom: 6,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={{
            fontSize: 14,
            fontWeight: focused ? 'bold' : 'normal',
            color,
            marginBottom: 2,
          }}>
            {route.name === 'Home' ? 'Accueil' : route.name === 'Profile' ? 'Profil' : route.name === 'Settings' ? 'Paramètres' : route.name}
          </Text>
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} options={{ title: 'Paramètres' }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;