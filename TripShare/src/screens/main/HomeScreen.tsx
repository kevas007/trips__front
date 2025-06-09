// src/screens/main/HomeScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Platform,
  StyleSheet,
  SafeAreaView,
  Text,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import AnimatedHeader from '../../components/Home/AnimatedHeader';
import FloatingElements from '../../components/Home/FloatingElements';
import SearchBar from '../../components/Home/SearchBar';
import Tabs from '../../components/Home/Tabs';
import StatsCards from '../../components/Home/StatsCards';
import QuickActions from '../../components/Home/QuickActions';
import TrendingDestinations from '../../components/Home/TrendingDestinations';
import FeaturedTrips from '../../components/Home/FeaturedTrips';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width, height } = Dimensions.get('window');

interface TripCard {
  id: string;
  title: string;
  destination: string;
  days: number;
  likes: number;
  image: string;
  author: string;
  tags: string[];
  emoji: string;
  price: string;
}

interface UserStats {
  tripsCreated: number;
  countriesVisited: number;
  followers: number;
  totalLikes: number;
  badges: string[];
}

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme, isDark, toggleTheme } = useAppTheme();

  // Onglet actif & texte de recherche
  const [activeTab, setActiveTab] = useState<'trending' | 'nearby' | 'saved'>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Exemple de userStats (remplacez par un fetch réel si besoin)
  const userStats: UserStats = {
    tripsCreated: 7,
    countriesVisited: 12,
    followers: 89,
    totalLikes: 456,
    badges: ['🌍', '✈️', '📸', '🗺️'],
  };

  // Exemple de données pour FeaturedTrips
  // Dans HomeScreen.tsx (ou le composant où vous déclarez featuredTrips) :

const [featuredTrips, setFeaturedTrips] = useState<TripCard[]>([
  {
    id: '1',
    title: 'Tokyo Néon & Sakura',
    destination: 'Tokyo, Japon',
    days: 7,
    likes: 2847,
    // +++ On passe à w=800 pour plus de résolution +++
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    author: 'Yuki M.',
    tags: ['Culture', 'Tech', 'Food'],
    emoji: '🌸',
    price: '€1 200',
  },
  {
    id: '2',
    title: 'Aurora Boréale Magique',
    destination: 'Islande',
    days: 5,
    likes: 3156,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    author: 'Emma L.',
    tags: ['Nature', 'Photo', 'Adventure'],
    emoji: '🌌',
    price: '€950',
  },
  {
    id: '3',
    title: 'Bali Digital Nomad Life',
    destination: 'Bali, Indonésie',
    days: 21,
    likes: 4231,
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
    author: 'Alex K.',
    tags: ['Remote', 'Wellness', 'Tropical'],
    emoji: '🏝️',
    price: '€800',
  },
  {
    id: '4',
    title: 'Safari Luxury Kenya',
    destination: 'Nairobi, Kenya',
    days: 10,
    likes: 1876,
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    author: 'James W.',
    tags: ['Wildlife', 'Luxury', 'Adventure'],
    emoji: '🦁',
    price: '€2 400',
  },
]);


  // Valeurs animées partagées
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeAnimations();
    // Si vous souhaitez récupérer userStats ou featuredTrips depuis une API :
    // fetchUserStats().then(stats => setUserStats(stats));
    // fetchFeaturedTrips().then(trips => setFeaturedTrips(trips));
  }, []);

  const initializeAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Éléments flottants (étoiles, avion…) */}
      <FloatingElements floatAnim={floatAnim} sparkleAnim={sparkleAnim} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header animé (avatar + notifications + greeting) */}
        <AnimatedHeader fadeAnim={fadeAnim} slideAnim={slideAnim} pulseAnim={pulseAnim} />

        {/* Barre de recherche */}
        <SearchBar
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Onglets (Tendance / Proche de moi / Enregistrés) */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cartes de statistiques (on passe userStats, fadeAnim et slideAnim) */}
          <StatsCards
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            userStats={userStats}
          />
          

          {/* Actions rapides */}
          <QuickActions fadeAnim={fadeAnim} slideAnim={slideAnim} />

          {/* Sections selon onglet actif */}
          {activeTab === 'trending' && (
            <TrendingDestinations
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === 'nearby' && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                📍 Fonctionnalité « Proche de moi » en cours de développement !
              </Text>
            </View>
          )}
          {activeTab === 'saved' && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                💾 Vous n'avez pas encore enregistré de voyages ! Explorez la tendance pour commencer.
              </Text>
            </View>
          )}

          {/* Voyages inspirants */}
          <FeaturedTrips featuredTrips={featuredTrips} searchQuery={searchQuery} />

          {/* Footer inspirant */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.primary }]}>
              ✨ "La vie est courte et le monde est vaste" ✨
            </Text>
            <Text style={[styles.footerSubtext, { color: theme.colors.text.secondary }]}>
              Créez des souvenirs inoubliables avec TripShare
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  placeholderContainer: {
    marginVertical: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
