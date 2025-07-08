// src/types/navigation.ts

import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  AuthScreen: { forceRedirect?: boolean } | undefined;
  TermsScreen: undefined;
  OnboardingScreen: undefined;
  TravelPreferencesScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Social: undefined;
  Search: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CategoryTrips: {
    category: string;
    categoryName: string;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
};

export type SocialStackParamList = {
  SocialFeed: undefined;
  Comments: {
    postId: string;
  };
  CreatePost: undefined;
  SelectTrip: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
