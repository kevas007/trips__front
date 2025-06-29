// src/components/Home/QuickActions.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,  // <-- Ajouté
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  gradient: string[];
  action: () => void;
}

interface QuickActionsProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

const quickActionsData: QuickAction[] = [
  {
    id: '1',
    title: 'AI Trip Planner',
    subtitle: 'Créé par IA',
    icon: 'sparkles-outline',
    emoji: '✨',
    gradient: ['#FF6B9D', '#4ECDC4'],
    action: () => console.log('AI Planner lancé'),
  },
  {
    id: '2',
    title: 'Groupes Voyage',
    subtitle: 'Trouvez des compagnons',
    icon: 'people-outline',
    emoji: '👥',
            gradient: ['#008080', '#4FB3B3'], // Material Design 3 Teal
    action: () => console.log('Groupes ouverts'),
  },
  {
    id: '3',
    title: 'Dest. Tendance',
    subtitle: '2025 hotspots',
    icon: 'trending-up-outline',
    emoji: '🔥',
    gradient: ['#4FB3B3', '#008080'], // Material Design 3 Teal gradient
    action: () => console.log('Tendance ouverte'),
  },
  {
    id: '4',
    title: 'Scan & Discover',
    subtitle: 'AR voyage',
    icon: 'camera-outline',
    emoji: '📱',
    gradient: ['#4facfe', '#00f2fe'],
    action: () => console.log('AR Scanner lancé'),
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({ fadeAnim, slideAnim }) => {
  return (
    <Animated.View
      style={[
        styles.quickActionsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>🚀 Actions Rapides</Text>
      <View style={styles.quickActionsGrid}>
        {quickActionsData.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.quickActionCard,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 50 + index * 10],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={styles.quickActionButton} onPress={action.action}>
              <LinearGradient colors={action.gradient} style={styles.quickActionGradient}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Ionicons name={action.icon} size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (Dimensions.get('window').width - 60) / 2,  // <- fonctionne désormais
    marginBottom: 15,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionEmoji: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#757575', // Material Design 3 secondary text
    textAlign: 'center',
    fontWeight: '500',
  },
});
