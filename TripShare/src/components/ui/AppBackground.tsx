import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LOCAL_ASSETS } from '../../constants/assets';

interface AppBackgroundProps {
  children: React.ReactNode;
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
  const { theme, isDark } = useAppTheme();
  return (
    <ImageBackground
      source={isDark ? LOCAL_ASSETS.login_bg_dark : LOCAL_ASSETS.login_bg_light}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={isDark ? ['#1e293bEE', '#0f172aEE'] : ['#e0e7ffEE', '#f1f5f9EE']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  gradient: { flex: 1 },
  safe: { flex: 1 },
});

export default AppBackground; 