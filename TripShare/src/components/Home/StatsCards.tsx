// src/components/Home/StatsCards.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';

interface UserStats {
  tripsCreated: number;
  countriesVisited: number;
  followers: number;
  totalLikes: number;
  badges: string[];
}

interface StatsCardsProps {
  fadeAnim: Animated.Value;   // pour l’animation d’opacité
  slideAnim: Animated.Value;  // pour l’animation de translation verticale
  userStats: UserStats;       // tripsCreated, countriesVisited, etc.
}

const StatsCards: React.FC<StatsCardsProps> = ({
  fadeAnim,
  slideAnim,
  userStats,
}) => {
  const window = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  // Préparation des données pour itération
  const statsArray = [
    { emoji: '✈️', number: userStats.tripsCreated, label: 'Voyages créés' },
    { emoji: '🌍', number: userStats.countriesVisited, label: 'Pays visités' },
    { emoji: '👥', number: userStats.followers, label: 'Abonnés' },
    { emoji: '❤️', number: userStats.totalLikes, label: 'Likes reçus' },
  ];

  if (isWeb) {
    // === Version Web : grille fixe, pas d’espacement vertical accru ici ===
    return (
      <Animated.View
        style={[
          styles.statsContainer,
          styles.statsContainerWeb,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: window.width,
            paddingHorizontal: 10,
          },
        ]}
      >
        <View style={styles.webRowContainer}>
          {statsArray.map((stat, idx) => (
            <View key={idx} style={styles.statsCardWeb}>
              <AnimatedCard
                emoji={stat.emoji}
                number={stat.number}
                label={stat.label}
              />
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }

  // === Version Mobile (iOS/Android) : ScrollView horizontale avec marginVertical augmenté ===
  return (
    <Animated.View
      style={[
        styles.statsContainer,
        styles.statsContainerMobile,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScrollContent}
      >
        {statsArray.map((stat, idx) => (
          <View key={idx} style={styles.statsCardMobile}>
            <AnimatedCard
              emoji={stat.emoji}
              number={stat.number}
              label={stat.label}
            />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

interface AnimatedCardProps {
  emoji: string;
  number: number;
  label: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ emoji, number, label }) => (
  <View style={styles.statCardGradient}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default StatsCards;

const styles = StyleSheet.create({
  // Conteneur principal (vide, on compose avec les variantes)
  statsContainer: {
    // les marges spécifiques sont définies dans les sous-styles
  },

  // ===== Version Web =====
  statsContainerWeb: {
    marginTop: 0,
    marginBottom: 25,
  },
  webRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
  },
  statsCardWeb: {
    width: '22%',
    marginHorizontal: 5,
  },

  // ===== Version Mobile (iOS/Android) =====
  statsContainerMobile: {
    marginTop: 50,    // on passe de 30 à 50 px en haut
    marginBottom: 50, // on passe de 30 à 50 px en bas
  },
  statsScrollContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsCardMobile: {
    marginRight: 15,
  },

  // ===== Styles communs aux cartes =====
  statCardGradient: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',

    // Ombre Android
    elevation: 8,

    // Ombre iOS (Mobile uniquement)
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {},
      web: {}, // pas d’ombre iOS sur Web
    }),
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1B1F', // Material Design 3 text
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575', // Material Design 3 secondary text
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 10,
  },
});
