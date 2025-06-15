import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Text, Platform } from 'react-native';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import SearchScreen from '../screens/main/SearchScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour le profil
const ProfileStack = () => {
  const { theme } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { 
          fontWeight: 'bold',
          fontSize: Platform.OS === 'ios' ? 16 : 18,
        },
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
          title: 'Modifier le profil'
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Changer le mot de passe' }}
      />
    </Stack.Navigator>
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
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          
          const iconSize = Platform.OS === 'ios' ? (focused ? 24 : 20) : (focused ? 28 : 24);
          return <Ionicons name={iconName} size={iconSize} color={color} style={{ marginBottom: -2 }} />;
        },
        tabBarActiveTintColor: theme.colors.primary[0],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: isDark ? '#1a2233' : '#FFFFFF',
          borderTopColor: isDark ? '#232b3b' : '#E2E8F0',
          height: Platform.OS === 'ios' ? 58 : 64,
          paddingBottom: Platform.OS === 'ios' ? 4 : 6,
          paddingTop: Platform.OS === 'ios' ? 2 : 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={{
            fontSize: Platform.OS === 'ios' ? 12 : 14,
            fontWeight: focused ? 'bold' : 'normal',
            color,
            marginBottom: 2,
          }}>
            {route.name === 'Home' ? 'Accueil' : route.name === 'Search' ? 'Recherche' : route.name === 'Profile' ? 'Profil' : route.name === 'Settings' ? 'Paramètres' : route.name}
          </Text>
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;