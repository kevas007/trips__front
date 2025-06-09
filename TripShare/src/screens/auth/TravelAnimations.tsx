// === TravelAnimations.tsx - Composants d'animation voyage moderne ===

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

// ==================== INTERFACES ====================
interface TravelAnimationProps {
  size?: number;
  color?: string;
  duration?: number;
  autoStart?: boolean;
}

interface FloatingElementProps extends TravelAnimationProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
}

// ==================== COMPOSANTS D'ANIMATION ====================

// Animation d'avion avec trajectoire
export const PlaneAnimation: React.FC<TravelAnimationProps> = ({
  size = 40,
  color = '#667eea',
  duration = 3000,
  autoStart = true
}) => {
  const translateX = useRef(new Animated.Value(-50)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [autoStart]);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: Platform.OS === 'web' ? 500 : 300,
            duration: duration,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: duration / 3,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateX, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { translateX },
          { rotate: rotateInterpolate }
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#764ba2" />
          </LinearGradient>
        </Defs>
        <Path
          d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z"
          fill="url(#planeGradient)"
        />
      </Svg>
    </Animated.View>
  );
};

// Animation de bateau avec vagues
export const BoatAnimation: React.FC<TravelAnimationProps> = ({
  size = 40,
  color = '#4ecdc4',
  duration = 4000,
  autoStart = true
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (autoStart) {
      startWaveAnimation();
      startBobAnimation();
    }
  }, [autoStart]);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.sin,
        useNativeDriver: true,
      })
    ).start();
  };

  const startBobAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const bobTranslate = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY: bobTranslate }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="boatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#44a08d" />
          </LinearGradient>
        </Defs>
        <G>
          {/* Bateau */}
          <Path
            d="M6,14C6.5,14 7,14.16 7.42,14.45L8,15L9,14L11,16L13,14L14,15L14.58,14.45C15,14.16 15.5,14 16,14A4,4 0 0,1 20,18H4A4,4 0 0,1 6,14M7,10V12A1,1 0 0,0 8,13H16A1,1 0 0,0 17,12V10L15.5,6H8.5L7,10M14,11H10V8H14V11Z"
            fill="url(#boatGradient)"
          />
          {/* Vagues animées */}
          <Animated.View
            style={{
              transform: [
                {
                  translateX: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                },
              ],
            }}
          >
            <Path
              d="M2,20 Q6,18 10,20 T18,20 T26,20"
              stroke="#87CEEB"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </Animated.View>
        </G>
      </Svg>
    </Animated.View>
  );
};

// Animation de train
export const TrainAnimation: React.FC<TravelAnimationProps> = ({
  size = 50,
  color = '#f39c12',
  duration = 3500,
  autoStart = true
}) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const wheelRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [autoStart]);

  const startAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(wheelRotate, {
          toValue: 10,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, Platform.OS === 'web' ? 500 : 350],
  });

  const wheelRotation = wheelRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="trainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#e67e22" />
          </LinearGradient>
        </Defs>
        <G>
          {/* Corps du train */}
          <Path
            d="M20,16V10.5A2.5,2.5 0 0,0 17.5,8H16.5L15.5,6H8.5L7.5,8H6.5A2.5,2.5 0 0,0 4,10.5V16A1,1 0 0,0 5,17H6A2,2 0 0,0 8,19A2,2 0 0,0 10,17H14A2,2 0 0,0 16,19A2,2 0 0,0 18,17H19A1,1 0 0,0 20,16Z"
            fill="url(#trainGradient)"
          />
          {/* Roues animées */}
          <Animated.View style={{ transform: [{ rotate: wheelRotation }] }}>
            <Path
              d="M8,17A1,1 0 0,1 9,18A1,1 0 0,1 8,19A1,1 0 0,1 7,18A1,1 0 0,1 8,17M16,17A1,1 0 0,1 17,18A1,1 0 0,1 16,19A1,1 0 0,1 15,18A1,1 0 0,1 16,17Z"
              fill="#2c3e50"
            />
          </Animated.View>
          {/* Fenêtres */}
          <Path
            d="M7,11V14H10V11H7M14,11V14H17V11H14Z"
            fill="#ecf0f1"
            opacity="0.8"
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

// Composant d'élément flottant
export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  direction = 'up',
  duration = 2000,
  autoStart = true
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (autoStart) {
      startFloatingAnimation();
    }
  }, [autoStart]);

  const startFloatingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getTransform = () => {
    const range = 15;
    switch (direction) {
      case 'up':
        return {
          translateY: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -range],
          }),
        };
      case 'down':
        return {
          translateY: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, range],
          }),
        };
      case 'left':
        return {
          translateX: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -range],
          }),
        };
      case 'right':
        return {
          translateX: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, range],
          }),
        };
      default:
        return {};
    }
  };

  return (
    <Animated.View style={{ transform: [getTransform()] }}>
      {children}
    </Animated.View>
  );
};

// Animation de nuages flottants
export const CloudAnimation: React.FC<TravelAnimationProps> = ({
  size = 60,
  color = '#ecf0f1',
  duration = 8000,
  autoStart = true
}) => {
  const cloudAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (autoStart) {
      startCloudAnimation();
    }
  }, [autoStart]);

  const startCloudAnimation = () => {
    Animated.loop(
      Animated.timing(cloudAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const translateX = cloudAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, Platform.OS === 'web' ? 600 : 400],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        opacity: 0.7,
      }}
    >
      <Svg width={size} height={size * 0.6} viewBox="0 0 100 60">
        <Path
          d="M20,40 Q10,30 20,20 Q30,10 40,20 Q50,15 60,20 Q70,10 80,20 Q90,30 80,40 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
};

// Hook personnalisé pour contrôler les animations (sans pause)
export const useTransportAnimation = () => {
  const [currentTransport, setCurrentTransport] = React.useState<'plane' | 'boat' | 'train'>('plane');

  const switchTransport = () => {
    const transports: ('plane' | 'boat' | 'train')[] = ['plane', 'boat', 'train'];
    const currentIndex = transports.indexOf(currentTransport);
    const nextIndex = (currentIndex + 1) % transports.length;
    setCurrentTransport(transports[nextIndex]);
  };

  return {
    currentTransport,
    switchTransport,
  };
};