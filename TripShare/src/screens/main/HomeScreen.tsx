// src/screens/main/HomeScreen.tsx

import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import PersonalizedFeedScreen from './PersonalizedFeedScreen';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme, isDark } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <PersonalizedFeedScreen navigation={navigation} />
    </SafeAreaView>
  );
};

export default HomeScreen;
