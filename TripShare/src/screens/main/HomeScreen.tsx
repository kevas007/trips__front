// === HomeScreen.tsx - DESIGN 2025 INSPIRANT POUR VOYAGEURS ===

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Alert,
  FlatList,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

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

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  gradient: string[];
  action: () => void;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  image: string;
  trending: boolean;
}

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'trending' | 'nearby' | 'saved'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Animations magiques
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Données inspirantes basées sur les tendances 2025
  const [featuredTrips, setFeaturedTrips] = useState<TripCard[]>([
    {
      id: '1',
      title: 'Tokyo Néon & Sakura',
      destination: 'Tokyo, Japon',
      days: 7,
      likes: 2847,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
      author: 'Yuki M.',
      tags: ['Culture', 'Tech', 'Food'],
      emoji: '🌸',
      price: '€1,200'
    },
    {
      id: '2',
      title: 'Aurora Boréale Magique',
      destination: 'Islande',
      days: 5,
      likes: 3156,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      author: 'Emma L.',
      tags: ['Nature', 'Photo', 'Adventure'],
      emoji: '🌌',
      price: '€950'
    },
    {
      id: '3',
      title: 'Bali Digital Nomad Life',
      destination: 'Bali, Indonésie',
      days: 21,
      likes: 4231,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
      author: 'Alex K.',
      tags: ['Remote', 'Wellness', 'Tropical'],
      emoji: '🏝️',
      price: '€800'
    },
    {
      id: '4',
      title: 'Safari Luxury Kenya',
      destination: 'Nairobi, Kenya',
      days: 10,
      likes: 1876,
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400',
      author: 'James W.',
      tags: ['Wildlife', 'Luxury', 'Adventure'],
      emoji: '🦁',
      price: '€2,400'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'AI Trip Planner',
      subtitle: 'Créé par IA',
      icon: 'sparkles-outline',
      emoji: '✨',
      gradient: ['#FF6B9D', '#4ECDC4'],
      action: () => handleAIPlanner()
    },
    {
      id: '2',
      title: 'Groupes Voyage',
      subtitle: 'Trouvez des compagnons',
      icon: 'people-outline',
      emoji: '👥',
      gradient: ['#667eea', '#764ba2'],
      action: () => handleGroups()
    },
    {
      id: '3',
      title: 'Destinations Tendance',
      subtitle: '2025 hotspots',
      icon: 'trending-up-outline',
      emoji: '🔥',
      gradient: ['#f093fb', '#f5576c'],
      action: () => handleTrending()
    },
    {
      id: '4',
      title: 'Scan & Discover',
      subtitle: 'AR voyage',
      icon: 'camera-outline',
      emoji: '📱',
      gradient: ['#4facfe', '#00f2fe'],
      action: () => handleARScan()
    }
  ];

  const trendingDestinations: Destination[] = [
    { id: '1', name: 'Lisbonne', country: 'Portugal', emoji: '🇵🇹', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=300', trending: true },
    { id: '2', name: 'Séoul', country: 'Corée du Sud', emoji: '🇰🇷', image: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=300', trending: true },
    { id: '3', name: 'Medellín', country: 'Colombie', emoji: '🇨🇴', image: 'https://images.unsplash.com/photo-1564759224907-65b0e3e1a0fc?w=300', trending: true },
    { id: '4', name: 'Dubaï', country: 'Émirats Arabes Unis', emoji: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300', trending: true },
  ];

  const userStats = {
    tripsCreated: 7,
    countriesVisited: 12,
    followers: 89,
    totalLikes: 456,
    badges: ['🌍', '✈️', '📸', '🗺️']
  };

  useEffect(() => {
    initializeAnimations();
    loadUserData();
  }, []);

  const initializeAnimations = () => {
    // Animation d'entrée fluide
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

    // Animation flottante continue
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

    // Animation de pulsation
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

    // Animation de scintillement
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

  const loadUserData = async () => {
    console.log('Loading travel data for:', user?.email);
  };

  // Actions modernes 2025
  const handleAIPlanner = () => {
    Alert.alert(
      '✨ AI Trip Planner',
      'Notre IA va créer votre itinéraire parfait en analysant vos préférences, budget et les tendances actuelles !',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: '🚀 Créer maintenant', onPress: () => console.log('AI Planner launched') }
      ]
    );
  };

  const handleGroups = () => {
    Alert.alert(
      '👥 Groupes de Voyage',
      'Trouvez des compagnons de voyage ou rejoignez des groupes existants pour des aventures partagées !',
      [
        { text: 'Découvrir', onPress: () => console.log('Groups opened') }
      ]
    );
  };

  const handleTrending = () => {
    Alert.alert(
      '🔥 Destinations Tendance 2025',
      'Portugal, Corée du Sud, Colombie... Découvrez les destinations qui buzz cette année !',
      [
        { text: 'Explorer', onPress: () => console.log('Trending opened') }
      ]
    );
  };

  const handleARScan = () => {
    Alert.alert(
      '📱 AR Travel Scanner',
      'Scannez des monuments, restaurants ou lieux pour obtenir des infos instantanées et des recommandations !',
      [
        { text: 'Ouvrir caméra', onPress: () => console.log('AR Scanner launched') }
      ]
    );
  };

  const renderFloatingElements = () => (
    <>
      <Animated.View 
        style={[
          styles.floatingElement,
          styles.star1,
          { 
            opacity: sparkleAnim,
            transform: [
              { 
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                })
              }
            ]
          }
        ]}
      >
        <Text style={styles.starEmoji}>⭐</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.floatingElement,
          styles.star2,
          { 
            opacity: sparkleAnim,
            transform: [
              { 
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                })
              }
            ]
          }
        ]}
      >
        <Text style={styles.starEmoji}>✨</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.floatingElement,
          styles.plane,
          { 
            transform: [
              { 
                translateX: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                })
              }
            ]
          }
        ]}
      >
        <Text style={styles.planeEmoji}>✈️</Text>
      </Animated.View>
    </>
  );

  const renderMagicalHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.1)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={['#FF6B9D', '#4ECDC4']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || '🌍'}
                </Text>
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </Animated.View>
            
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0] || 'Explorateur'} !</Text>
              <Text style={styles.inspirationText}>Prêt pour votre prochaine aventure ? 🌟</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('🔔 Notifications', '• Nouveau compagnon de voyage trouvé !\n• Votre itinéraire Tokyo est populaire\n• Offre spéciale vol Paris-Bali')}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="notifications-outline" size={24} color="#667eea" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStatsCards = () => (
    <Animated.View 
      style={[
        styles.statsContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScrollContent}
      >
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(255, 107, 157, 0.15)', 'rgba(78, 205, 196, 0.15)']}
            style={styles.statCardGradient}
          >
            <Text style={styles.statEmoji}>✈️</Text>
            <Text style={styles.statNumber}>{userStats.tripsCreated}</Text>
            <Text style={styles.statLabel}>Voyages créés</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.15)', 'rgba(118, 75, 162, 0.15)']}
            style={styles.statCardGradient}
          >
            <Text style={styles.statEmoji}>🌍</Text>
            <Text style={styles.statNumber}>{userStats.countriesVisited}</Text>
            <Text style={styles.statLabel}>Pays visités</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(240, 147, 251, 0.15)', 'rgba(245, 87, 108, 0.15)']}
            style={styles.statCardGradient}
          >
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statNumber}>{userStats.followers}</Text>
            <Text style={styles.statLabel}>Abonnés</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(79, 172, 254, 0.15)', 'rgba(0, 242, 254, 0.15)']}
            style={styles.statCardGradient}
          >
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statNumber}>{userStats.totalLikes}</Text>
            <Text style={styles.statLabel}>Likes reçus</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View 
      style={[
        styles.quickActionsContainer,
        { opacity: fadeAnim }
      ]}
    >
      <Text style={styles.sectionTitle}>🚀 Actions Rapides</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
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
                    })
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={action.action}
            >
              <LinearGradient
                colors={action.gradient}
                style={styles.quickActionGradient}
              >
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

  const renderTrendingDestinations = () => (
    <View style={styles.destinationsContainer}>
      <Text style={styles.sectionTitle}>🔥 Destinations Tendance 2025</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.destinationsScroll}
      >
        {trendingDestinations.map((destination, index) => (
          <TouchableOpacity key={destination.id} style={styles.destinationCard}>
            <ImageBackground
              source={{ uri: destination.image }}
              style={styles.destinationImage}
              imageStyle={styles.destinationImageStyle}
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
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedTrips = () => {
    const renderTripCard = ({ item, index }: { item: TripCard; index: number }) => (
      <TouchableOpacity 
        style={styles.tripCard}
        onPress={() => Alert.alert(`${item.emoji} ${item.title}`, `Découvrir ce voyage de ${item.days} jours à ${item.destination} créé par ${item.author}`)}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.tripCardImage}
          imageStyle={styles.tripCardImageStyle}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.tripCardOverlay}
          >
            <View style={styles.tripCardHeader}>
              <View style={styles.tripCardTags}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <View key={idx} style={styles.tripCardTag}>
                    <Text style={styles.tripCardTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tripCardFooter}>
              <Text style={styles.tripCardEmoji}>{item.emoji}</Text>
              <Text style={styles.tripCardTitle}>{item.title}</Text>
              <Text style={styles.tripCardDestination}>{item.destination}</Text>
              <View style={styles.tripCardMeta}>
                <Text style={styles.tripCardDays}>{item.days} jours</Text>
                <Text style={styles.tripCardPrice}>{item.price}</Text>
              </View>
              <View style={styles.tripCardStats}>
                <Ionicons name="heart" size={14} color="#FF6B9D" />
                <Text style={styles.tripCardLikes}>{item.likes}</Text>
                <Text style={styles.tripCardAuthor}>• {item.author}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );

    return (
      <View style={styles.tripsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✨ Voyages Inspirants</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={featuredTrips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tripsList}
          snapToInterval={width * 0.85 + 15}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Éléments flottants magiques */}
      {renderFloatingElements()}
      
      <SafeAreaView style={styles.safeArea}>
        {renderMagicalHeader()}
        
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStatsCards()}
          {renderQuickActions()}
          {renderTrendingDestinations()}
          {renderFeaturedTrips()}
          
          {/* Footer inspirant */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ✨ "La vie est courte et le monde est vaste" ✨
            </Text>
            <Text style={styles.footerSubtext}>
              Créez des souvenirs inoubliables avec TripShare
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  
  // Éléments flottants
  floatingElement: {
    position: 'absolute',
    zIndex: 1,
  },
  star1: {
    top: height * 0.15,
    right: 30,
  },
  star2: {
    top: height * 0.25,
    left: 20,
  },
  plane: {
    top: height * 0.12,
    right: 60,
  },
  starEmoji: {
    fontSize: 20,
  },
  planeEmoji: {
    fontSize: 16,
  },

  // Header
  headerContainer: {
    paddingBottom: 15,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarGradient: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ADE80',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  inspirationText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Stats Cards
  statsContainer: {
    marginBottom: 25,
  },
  statsScrollContent: {
    paddingHorizontal: 20,
  },
  statsCard: {
    marginRight: 15,
  },
  statCardGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Quick Actions
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
    width: (width - 60) / 2,
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
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Destinations Tendance
  destinationsContainer: {
    marginBottom: 30,
  },
  destinationsScroll: {
    paddingHorizontal: 20,
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

  // Featured Trips
  tripsContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  tripsList: {
    paddingHorizontal: 20,
  },
  tripCard: {
    width: width * 0.85,
    height: 280,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  tripCardImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tripCardImageStyle: {
    borderRadius: 20,
  },
  tripCardOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripCardTags: {
    flexDirection: 'row',
  },
  tripCardTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
    backdropFilter: 'blur(10px)',
  },
  tripCardTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  likeButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 8,
    backdropFilter: 'blur(10px)',
  },
  tripCardFooter: {
    alignSelf: 'flex-start',
  },
  tripCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tripCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  tripCardDestination: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 8,
  },
  tripCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripCardDays: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  tripCardPrice: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tripCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripCardLikes: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  tripCardAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;