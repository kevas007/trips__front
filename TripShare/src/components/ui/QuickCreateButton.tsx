import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

interface QuickCreateButtonProps {
  onPress: () => void;
  style?: any;
}

const QuickCreateButton: React.FC<QuickCreateButtonProps> = ({ onPress, style }) => {
  const { theme } = useAppTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.primary[0] }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="add" size={24} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Créer un voyage</Text>
          <Text style={styles.subtitle}>Partagez votre aventure</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});

export default QuickCreateButton; 