import React from 'react';
import { ImageBackground, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { LOCAL_ASSETS } from '../../constants/assets';

interface AppBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'home' | 'profile' | 'search' | 'primary' | 'secondary' | 'nature' | 'urban' | 'travel';
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children, variant = 'default' }) => {
  const { theme, isDark } = useAppTheme();
  
  // Sélectionner le background selon la variante
  const getBackgroundSource = () => {
    switch (variant) {
      case 'home':
        return LOCAL_ASSETS.backgrounds.home;
      case 'profile':
        return LOCAL_ASSETS.backgrounds.profile;
      case 'search':
        return LOCAL_ASSETS.backgrounds.search;
      case 'primary':
        return LOCAL_ASSETS.backgrounds.primary;
      case 'secondary':
        return LOCAL_ASSETS.backgrounds.secondary;
      case 'nature':
        return LOCAL_ASSETS.backgrounds.nature;
      case 'urban':
        return LOCAL_ASSETS.backgrounds.urban;
      case 'travel':
        return LOCAL_ASSETS.backgrounds.travel;
      default:
        return isDark ? LOCAL_ASSETS.loginBackgrounds.dark : LOCAL_ASSETS.loginBackgrounds.light;
    }
  };

  // Sélectionner les couleurs de gradient selon la variante
  const getGradientColors = () => {
    switch (variant) {
      case 'home':
        return isDark ? ['#1e293bEE', '#0f172aEE'] : ['#e0e7ffEE', '#f1f5f9EE'];
      case 'profile':
        return isDark ? ['#1e293bDD', '#0f172aDD'] : ['#f8fafcDD', '#e2e8f0DD'];
      case 'search':
        return isDark ? ['#0f172aEE', '#1e293bEE'] : ['#f1f5f9EE', '#e0e7ffEE'];
      case 'primary':
        return isDark ? ['#1e293bCC', '#0f172aCC'] : ['#e0e7ffCC', '#f1f5f9CC'];
      case 'secondary':
        return isDark ? ['#0f172aDD', '#1e293bDD'] : ['#f8fafcDD', '#e2e8f0DD'];
      case 'nature':
        return isDark ? ['#064e3bCC', '#065f46CC'] : ['#ecfdf5CC', '#d1fae5CC'];
      case 'urban':
        return isDark ? ['#1f2937CC', '#374151CC'] : ['#f9fafbCC', '#f3f4f6CC'];
      case 'travel':
        return isDark ? ['#1e40afCC', '#3b82f6CC'] : ['#eff6ffCC', '#dbeafeCC'];
      default:
        return isDark ? ['#1e293bEE', '#0f172aEE'] : ['#e0e7ffEE', '#f1f5f9EE'];
    }
  };

  return (
    <ImageBackground
      source={getBackgroundSource()}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={getGradientColors()}
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
  safe: { flex: 1 }
});

export default AppBackground; 