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
  Voyage: undefined;
  Découverte: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  CategoryTrips: {
    category: string;
    categoryName: string;
  };
  SimpleCreateTrip: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PublicProfile: {
    userId: string;
  };
};

export type SocialStackParamList = {
  SocialFeed: undefined;
  Comments: {
    postId: string;
  };
  CreatePost: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
