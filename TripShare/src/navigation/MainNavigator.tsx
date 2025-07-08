import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Text, Platform } from 'react-native';
import { HomeStackParamList, ProfileStackParamList, SocialStackParamList } from '../types/navigation';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CategoryTripsScreen from '../screens/main/CategoryTripsScreen';
import SocialFeedScreen from '../screens/main/SocialFeedScreen';
import CommentsScreen from '../screens/main/CommentsScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import MapsScreen from '../screens/main/MapsScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SocialStack = createStackNavigator<SocialStackParamList>();

// Stack pour le profil
const ProfileStackNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { 
          fontWeight: 'bold',
          fontSize: Platform.OS === 'ios' ? 15 : 17,
        },
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Modifier le profil'
        }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Changer le mot de passe' }}
      />
    </ProfileStack.Navigator>
  );
};

// Stack pour l'accueil (inclut les écrans de voyages)
const HomeStackNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { 
          fontWeight: 'bold',
          fontSize: Platform.OS === 'ios' ? 15 : 17,
        },
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CategoryTrips"
        component={CategoryTripsScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

// Stack pour le feed social
const SocialStackNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <SocialStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: { 
          fontWeight: 'bold',
          fontSize: Platform.OS === 'ios' ? 15 : 17,
        },
      }}
    >
      <SocialStack.Screen
        name="SocialFeed"
        component={SocialFeedScreen}
        options={{ headerShown: false }}
      />
      <SocialStack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ headerShown: false }}
      />
      <SocialStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ headerShown: false }}
      />
    </SocialStack.Navigator>
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
          else if (route.name === 'Social') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          
          const iconSize = Platform.OS === 'ios' ? (focused ? 24 : 20) : (focused ? 28 : 24);
          return <Ionicons name={iconName} size={iconSize} color={color} style={{ marginBottom: -2 }} />;
        },
        tabBarActiveTintColor: theme.colors.primary[0],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.card,
          borderTopColor: theme.colors.glassmorphism.border,
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
            fontSize: Platform.OS === 'ios' ? 11 : 13,
            fontWeight: focused ? 'bold' : 'normal',
            color,
            marginBottom: 2,
          }}>
            {route.name === 'Home' ? 'Accueil' : route.name === 'Social' ? 'Découvertes' : route.name === 'Search' ? 'Recherche' : route.name === 'Profile' ? 'Profil' : route.name === 'Settings' ? 'Paramètres' : route.name}
          </Text>
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Maps" component={MapsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: Platform.OS === 'ios' ? 11 : 13, fontWeight: focused ? 'bold' : 'normal', color, marginBottom: 2 }}>
              Carte
            </Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen name="Social" component={SocialStackNavigator} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;