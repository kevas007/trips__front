import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Text, Platform, View } from 'react-native';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import PublicProfileScreen from '../screens/main/PublicProfileScreen';
import CategoryTripsScreen from '../screens/main/CategoryTripsScreen';
import EnhancedTripCreationScreen from '../screens/itineraries/EnhancedTripCreationScreen';
import SimpleCreateTripScreen from '../screens/itineraries/SimpleCreateTripScreen';
import SocialFeedScreen from '../screens/main/SocialFeedScreen';
import CommentsScreen from '../screens/main/CommentsScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import MapsScreen from '../screens/main/MapsScreen';
import UnifiedHomeScreen from '../screens/main/UnifiedHomeScreen';
import UserTripsScreen from '../screens/main/UserTripsScreen';
import TripPlacesManagerScreen from '../screens/main/TripPlacesManagerScreen';
import ChatScreen from '../screens/main/ChatScreen';
import { useProfileData } from '../hooks/useProfileData';
import { useNavigation } from '@react-navigation/native';

const DummyScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>DummyScreen</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const HomeStack = createStackNavigator();
const SocialStack = createStackNavigator();

// Wrapper pour UserTripsScreen avec les props nécessaires
const UserTripsWrapper = () => {
  const navigation = useNavigation();
  const {
    userTrips,
    loading,
    error,
    refreshing,
    onRefresh,
  } = useProfileData();

  console.log('🎯 UserTripsWrapper - Données:');
  console.log('  - userTrips:', userTrips);
  console.log('  - userTrips length:', userTrips?.length);
  console.log('  - loading:', loading);
  console.log('  - error:', error);

  return (
    <UserTripsScreen
      userTrips={userTrips}
      loading={loading}
      error={error}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onGoBack={() => navigation.navigate('Home')}
      onTripPress={(trip) => {
        console.log('Voyage sélectionné:', trip);
        // Ici on pourrait naviguer vers le détail du voyage
      }}
    />
  );
};

// Wrapper spécifique pour l'onglet Voyage (sans bouton retour)
const VoyageTabWrapper = () => {
  const {
    userTrips,
    loading,
    error,
    refreshing,
    onRefresh,
  } = useProfileData();

  console.log('🎯 VoyageTabWrapper - Données:');
  console.log('  - userTrips:', userTrips);
  console.log('  - userTrips length:', userTrips?.length);
  console.log('  - loading:', loading);
  console.log('  - error:', error);

  return (
    <UserTripsScreen
      userTrips={userTrips}
      loading={loading}
      error={error}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onGoBack={() => {}} // Pas de navigation de retour pour l'onglet
      onTripPress={(trip) => {
        console.log('Voyage sélectionné:', trip);
        // Ici on pourrait naviguer vers le détail du voyage
      }}
    />
  );
};

const ProfileStackNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <ProfileStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.background.primary }, headerTintColor: theme.colors.text.primary }}>
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Modifier le profil' }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Paramètres' }}
      />
      <ProfileStack.Screen 
        name="PublicProfile" 
        component={PublicProfileScreen} 
        options={{ title: 'Profil public' }}
      />
      <ProfileStack.Screen 
        name="UserTrips" 
        component={UserTripsWrapper} 
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
};

const HomeStackNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.background.primary }, headerTintColor: theme.colors.text.primary }}>
      <HomeStack.Screen name="HomeMain" component={UnifiedHomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="CategoryTrips" component={CategoryTripsScreen} />
      <HomeStack.Screen name="SimpleCreateTrip" component={EnhancedTripCreationScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="TripPlacesManager" component={TripPlacesManagerScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Comments" component={CommentsScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
};

const SocialStackNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <SocialStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.background.primary }, headerTintColor: theme.colors.text.primary }}>
      <SocialStack.Screen name="SocialFeed" component={SocialFeedScreen} />
      <SocialStack.Screen name="Comments" component={CommentsScreen} />
      <SocialStack.Screen name="CreatePost" component={CreatePostScreen} />
    </SocialStack.Navigator>
  );
};

const MainNavigator = () => {
  const { theme } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.colors.background.primary },
        headerTintColor: theme.colors.text.primary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Voyage') iconName = focused ? 'airplane' : 'airplane-outline';
          else if (route.name === 'Découverte') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Chat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[0],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: { backgroundColor: theme.colors.background.card },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Voyage" component={VoyageTabWrapper} />
      <Tab.Screen name="Découverte" component={SocialStackNavigator} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;