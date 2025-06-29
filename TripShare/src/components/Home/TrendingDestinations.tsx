// src/components/Home/TrendingDestinations.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,    // <-- Ajouté si <Animated.View> est utilisé
  Dimensions,  // <-- Ajouté car Dimensions.get('window') est utilisé
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OptimizedImage from '../ui/OptimizedImage';
import { DESTINATION_PLACEHOLDERS } from '../../constants/assets';

interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  image: string;
  trending: boolean;
}

interface TrendingDestinationsProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  searchQuery: string;
}

const { width, height } = Dimensions.get('window');

const TrendingDestinations: React.FC<TrendingDestinationsProps> = ({
  fadeAnim,
  slideAnim,
  searchQuery,
}) => {
  const trendingDestinations: Destination[] = [
    {
      id: '1',
      name: 'Lisbonne',
      country: 'Portugal',
      emoji: '🇵🇹',
      image: DESTINATION_PLACEHOLDERS.paris,
      trending: true,
    },
    {
      id: '2',
      name: 'Séoul',
      country: 'Corée du Sud',
      emoji: '🇰🇷',
      image: DESTINATION_PLACEHOLDERS.tokyo,
      trending: true,
    },
    {
      id: '3',
      name: 'Medellín',
      country: 'Colombie',
      emoji: '🇨🇴',
      image: DESTINATION_PLACEHOLDERS.bali,
      trending: true,
    },
    {
      id: '4',
      name: 'Dubaï',
      country: 'Émirats Arabes Unis',
      emoji: '🇦🇪',
      image: DESTINATION_PLACEHOLDERS.iceland,
      trending: true,
    },
  ];

  const filtered = trendingDestinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Animated.View
      style={[
        styles.destinationsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>🔥 Destinations Tendance 2025</Text>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>Aucune destination trouvée.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destinationsScroll}
        >
          {filtered.map((destination) => (
            <TouchableOpacity key={destination.id} style={styles.destinationCard}>
              <OptimizedImage
                source={destination.image}
                style={styles.destinationImage}
                containerStyle={styles.destinationImageStyle}
                placeholder="🌎"
                isBackground={true}
                borderRadius={16}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.destinationOverlay}
                >
                  <View style={styles.destinationBadge}>
                    <Text style={styles.destinationEmoji}>{destination.emoji}</Text>
                    <Text style={styles.trendingBadge}>🔥 TENDANCE</Text>
                  </View>
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{destination.name}</Text>
                    <Text style={styles.destinationCountry}>{destination.country}</Text>
                  </View>
                </LinearGradient>
              </OptimizedImage>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
};

export default TrendingDestinations;

const styles = StyleSheet.create({
  destinationsContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1B1F', // Material Design 3 text
    marginBottom: 16,
  },
  destinationsScroll: {
    paddingVertical: 10,
  },
  destinationCard: {
    width: 160,
    height: 120,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  destinationImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  destinationImageStyle: {
    borderRadius: 16,
  },
  destinationOverlay: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  destinationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  trendingBadge: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  destinationInfo: {
    alignSelf: 'flex-start',
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  destinationCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 10,
  },
});
