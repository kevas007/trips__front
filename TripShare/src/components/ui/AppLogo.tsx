import React from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { responsive, screenDimensions } from '../../utils/responsive';

interface AppLogoProps {
  size?: number;
  animated?: boolean;
  style?: any;
  variant?: 'emoji' | 'svg' | 'text';
  showText?: boolean;
}

// Logo SVG optimisé (version simplifiée pour éviter les erreurs de gradient)
const logoSvg = `
<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="90" fill="#008080"/>
  <path d="M140 80L160 100L140 120L120 100L140 80Z" fill="white" opacity="0.9"/>
  <path d="M100 60L120 100L100 140L80 100L100 60Z" fill="white" opacity="0.8"/>
  <path d="M60 80L80 100L60 120L40 100L60 80Z" fill="white" opacity="0.9"/>
  <circle cx="100" cy="100" r="20" fill="white" opacity="0.3"/>
</svg>
`;

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 100, 
  animated = false, 
  style,
  variant = 'emoji',
  showText = false
}) => {
  // Taille adaptative selon la plateforme et l'écran
  const adaptiveSize = React.useMemo(() => {
    let baseSize = size;
    
    // Ajuster selon la taille d'écran
    if (screenDimensions.isSmallScreen) {
      baseSize = Math.min(size, 80);
    } else if (screenDimensions.isLargeScreen) {
      baseSize = Math.max(size, 120);
    }
    
    return responsive(baseSize);
  }, [size]);

  // Animation simple (scale) si animated=true
  const [scale] = React.useState(new Animated.Value(1));
  const [rotate] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (animated) {
      // Animation de pulsation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      // Animation de rotation subtile pour le SVG (seulement sur web et iOS)
      if (variant === 'svg' && Platform.OS !== 'android') {
        Animated.loop(
          Animated.timing(rotate, { 
            toValue: 1, 
            duration: 20000, 
            useNativeDriver: true 
          })
        ).start();
      }
    }
  }, [animated, variant]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const Container = animated ? Animated.View : View;

  const renderLogo = () => {
    switch (variant) {
      case 'svg':
        return (
          <Animated.View 
            style={[
              { width: adaptiveSize, height: adaptiveSize },
              animated && Platform.OS !== 'android' ? { transform: [{ rotate: rotateInterpolate }] } : undefined
            ]}
          >
            <SvgXml 
              xml={logoSvg} 
              width={adaptiveSize} 
              height={adaptiveSize}
            />
          </Animated.View>
        );
      
      case 'text':
        return (
          <Text style={[styles.textLogo, { fontSize: adaptiveSize * 0.3 }]}>
            Trivenile
          </Text>
        );
      
      case 'emoji':
      default:
        return (
          <LinearGradient
            colors={["#008080", "#4FB3B3", "#B2DFDF"]}
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
              fontSize: adaptiveSize * 0.45, 
              textAlign: 'center',
              // Améliorer l'emoji sur Android
              ...(Platform.OS === 'android' && {
                includeFontPadding: false,
                textAlignVertical: 'center',
              })
            }}>🌍</Text>
          </LinearGradient>
        );
    }
  };

  return (
    <View style={styles.logoContainer}>
      <Container
        style={[
          styles.logoWrapper,
          {
            width: adaptiveSize,
            height: adaptiveSize,
            borderRadius: variant === 'emoji' ? adaptiveSize / 2 : 12,
            transform: animated && variant !== 'svg' ? [{ scale }] : undefined,
          },
          style,
        ]}
      >
        {renderLogo()}
      </Container>
      
      {showText && (
        <Text style={[styles.logoText, { fontSize: adaptiveSize * 0.15 }]}>
          Trivenile
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#008080',
    shadowOffset: { 
      width: 0, 
      height: Platform.OS === 'web' ? 10 : 6 
    },
    shadowOpacity: Platform.OS === 'web' ? 0.25 : 0.3,
    shadowRadius: Platform.OS === 'web' ? 20 : 15,
    elevation: Platform.OS === 'android' ? 12 : 8,
  },
  textLogo: {
    fontWeight: '800',
    color: '#008080',
    textAlign: 'center',
  },
  logoText: {
    fontWeight: '700',
    color: '#008080',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AppLogo; 