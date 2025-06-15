import React from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { responsive, screenDimensions } from '../../utils/responsive';

interface AppLogoProps {
  size?: number;
  animated?: boolean;
  style?: any;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 100, animated = false, style }) => {
  // Taille adaptative selon la plateforme et l'écran
  const adaptiveSize = React.useMemo(() => {
    let baseSize = size;
    
    // Ajuster selon la taille d'écran
    if (screenDimensions.isSmallScreen) {
      baseSize = Math.min(size, 80);
    } else if (screenDimensions.isTablet) {
      baseSize = Math.max(size, 120);
    }
    
    return responsive(baseSize);
  }, [size]);

  // Animation simple (scale) si animated=true
  const [scale] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [animated]);

  const Container = animated ? Animated.View : View;

  return (
    <Container
      style={[
        {
          width: adaptiveSize,
          height: adaptiveSize,
          borderRadius: adaptiveSize / 2,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#667eea',
          shadowOffset: { 
            width: 0, 
            height: Platform.OS === 'web' ? 10 : 6 
          },
          shadowOpacity: Platform.OS === 'web' ? 0.25 : 0.3,
          shadowRadius: Platform.OS === 'web' ? 20 : 15,
          elevation: Platform.OS === 'android' ? 12 : 8,
          transform: animated ? [{ scale }] : undefined,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: adaptiveSize,
          height: adaptiveSize,
          borderRadius: adaptiveSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ 
          fontSize: adaptiveSize * 0.48, 
          textAlign: 'center',
          // Améliorer l'emoji sur Android
          ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
          })
        }}>🌍</Text>
      </LinearGradient>
    </Container>
  );
};

export default AppLogo; 