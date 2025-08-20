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
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OptimizedImage from '../ui/OptimizedImage';
import { DESTINATION_PLACEHOLDERS } from '../../constants/assets';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types/theme';

interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  image: string;
  trending: boolean;
  travelers: number;
}

export interface TrendingDestinationsProps {
  theme: Theme;
}

const { width, height } = Dimensions.get('window');

const TrendingDestinations: React.FC<TrendingDestinationsProps> = ({ theme }) => {
  const destinations: Destination[] = [
    {
      id: 'd1',
      name: 'Santorini',
      country: 'Grèce',
      image: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      travelers: 1234,
      trending: true,
      emoji: '🇬🇷',
    },
    {
      id: 'd2',
      name: 'Kyoto',
      country: 'Japon',
      image: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      travelers: 987,
      trending: true,
      emoji: '🇯🇵',
    },
    {
      id: 'd3',
      name: 'Machu Picchu',
      country: 'Pérou',
      image: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      travelers: 2156,
      trending: true,
      emoji: '🇵🇪',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Destinations Tendances
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {destinations.map((destination) => (
          <TouchableOpacity key={destination.id} style={styles.card}>
            <ImageBackground
              source={{ uri: destination.image }}
              style={styles.image}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              >
                <View style={styles.content}>
                  <Text style={styles.name}>{destination.name}</Text>
                  <Text style={styles.country}>{destination.country}</Text>
                  <View style={styles.stats}>
                    <Ionicons name="people" size={16} color="#fff" />
                    <Text style={styles.travelers}>
                      {destination.travelers.toLocaleString()} voyageurs
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
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
  card: {
    width: 280,
    height: 200,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: 15,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  content: {
    
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  country: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 5,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelers: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default TrendingDestinations;
