// src/components/Home/FeaturedTrips.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types/theme';
import TripCard from './TripCard';

export interface FeaturedTripsProps {
  theme: Theme;
}

const FeaturedTrips: React.FC<FeaturedTripsProps> = ({ theme }) => {
  const featuredTrips = [
    {
      id: '1',
      user: {
        username: 'emma_voyage',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        level: 'Globe-trotter',
        trips: 25,
      },
      location: 'Bali, Indonésie',
      images: ['http://localhost:8085/storage/defaults/default-trip-image.jpg'],
      description: 'Circuit de 7 jours à la découverte des plus beaux temples et rizières de Bali',
      likes: 1234,
      comments: 89,
      duration: '7 jours',
      budget: '€800',
      tags: ['Nature', 'Culture', 'Photo'],
      createdAt: '2h',
      difficulty: 'Modéré',
      transport: ['🚗 Voiture', '🛵 Scooter'],
      highlights: ['Temple de Tanah Lot', 'Rizières de Tegalalang', 'Mont Batur'],
      steps: [
        {
          id: 's1',
          title: 'Arrivée et installation',
          description: 'Check-in à l\'hôtel près des Champs-Élysées',
          duration: '2h',
          type: 'accommodation',
          order: 1,
          activities: [
            {
              id: 'a1',
              title: 'Check-in Hôtel',
              type: 'accommodation',
              priority: 'high',
              status: 'planned',
              photos: [],
              createdBy: 'system',
              createdAt: '2024-03-15',
              updatedAt: '2024-03-15'
            }
          ]
        },
        {
          id: 's2',
          title: 'Découverte de la Tour Eiffel',
          description: 'Visite de la Tour Eiffel et déjeuner au restaurant 58 Tour Eiffel',
          duration: '4h',
          type: 'sightseeing',
          order: 2,
          activities: [
            {
              id: 'a2',
              title: 'Montée Tour Eiffel',
              type: 'sightseeing',
              priority: 'high',
              status: 'planned',
              photos: [],
              createdBy: 'system',
              createdAt: '2024-03-15',
              updatedAt: '2024-03-15'
            },
            {
              id: 'a3',
              title: 'Déjeuner 58 Tour Eiffel',
              type: 'restaurant',
              priority: 'medium',
              status: 'planned',
              photos: [],
              createdBy: 'system',
              createdAt: '2024-03-15',
              updatedAt: '2024-03-15'
            }
          ]
        },
        {
          id: 's3',
          title: 'Balade sur les Champs-Élysées',
          description: 'Shopping et dîner sur la plus belle avenue du monde',
          duration: '3h',
          type: 'shopping',
          order: 3,
          activities: [
            {
              id: 'a4',
              title: 'Shopping',
              type: 'shopping',
              priority: 'low',
              status: 'planned',
              photos: [],
              createdBy: 'system',
              createdAt: '2024-03-15',
              updatedAt: '2024-03-15'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      user: {
        username: 'world_alex',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        level: 'Aventurier',
        trips: 15,
      },
      location: 'Alpes Suisses',
      images: ['http://localhost:8085/storage/defaults/default-trip-image.jpg'],
      description: 'Trek de 4 jours dans les Alpes Suisses, des paysages à couper le souffle !',
      likes: 892,
      comments: 67,
      duration: '4 jours',
      budget: '€600',
      tags: ['Montagne', 'Trek', 'Nature'],
      createdAt: '5h',
      difficulty: 'Difficile',
      transport: ['🚶‍♂️ Marche', '🚡 Téléphérique'],
      highlights: ['Lac de Lucerne', 'Mont Pilatus', 'Grindelwald'],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Voyages à la Une
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {featuredTrips.map((trip) => (
          <View key={trip.id} style={styles.tripContainer}>
            <TripCard trip={trip} theme={theme} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scrollContent: {
    paddingRight: 15,
  },
  tripContainer: {
    width: 300,
    marginRight: 15,
  },
});

export default FeaturedTrips;
