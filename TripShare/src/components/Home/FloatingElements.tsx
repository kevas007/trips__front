// src/components/Home/FloatingElements.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,     // <-- Ajouté car Animated.View est utilisé
  Dimensions,   // <-- Ajouté car Dimensions.get('window') est utilisé
} from 'react-native';

interface FloatingElementsProps {
  floatAnim: Animated.Value;
  sparkleAnim: Animated.Value;
}

const { width, height } = Dimensions.get('window');

const FloatingElements: React.FC<FloatingElementsProps> = ({ floatAnim, sparkleAnim }) => {
  return (
    <>
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: height * 0.15,
            right: 30,
            opacity: sparkleAnim,
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.starEmoji}>⭐</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: height * 0.25,
            left: 20,
            opacity: sparkleAnim,
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.starEmoji}>✨</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: height * 0.12,
            right: 60,
            transform: [
              {
                translateX: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.planeEmoji}>✈️</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  floatingElement: {
    position: 'absolute',
    zIndex: 1,
  },
  starEmoji: {
    fontSize: 20,
  },
  planeEmoji: {
    fontSize: 16,
  },
});

export default FloatingElements;
