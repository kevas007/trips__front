import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { api } from '../../services/api';
import { Trip, UserTravelPreferences } from '../../types';
import TripCard from './TripCard';
import { useAuthStore } from '../../store';

const { width } = Dimensions.get('window');

interface PersonalizedFeedProps {
  theme: any;
  navigation: any;
}

interface FeedItem {
  id: string;
  type: 'trip' | 'recommendation' | 'category';
  title: string;
  subtitle: string;
  data: any;
  score?: number;
  reason?: string;
}

interface TripRecommendation {
  trip: Trip;
  score: number;
}

const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({ theme, navigation }) => {
  const { user } = useAuthStore();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserTravelPreferences | null>(null);
  const [hasPreferences, setHasPreferences] = useState(false);

  // Catégories disponibles pour le feed
  const categories = [
    { id: 'culture', label: 'Culture', icon: 'library', emoji: '🏛️' },
    { id: 'nature', label: 'Nature', icon: 'leaf', emoji: '🌿' },
    { id: 'adventure', label: 'Aventure', icon: 'compass', emoji: '🏔️' },
    { id: 'food', label: 'Gastronomie', icon: 'restaurant', emoji: '🍽️' },
    { id: 'beach', label: 'Plage', icon: 'umbrella', emoji: '🏖️' },
    { id: 'city', label: 'Ville', icon: 'business', emoji: '🏙️' },
    { id: 'mountain', label: 'Montagne', icon: 'triangle', emoji: '⛰️' },
    { id: 'history', label: 'Histoire', icon: 'book', emoji: '📚' },
  ];

  // Charger les préférences utilisateur
  const loadUserPreferences = async () => {
    try {
      if (!user) return;
      
      const response = await api.getUserTravelPreferences();
      if (response.success && response.data) {
        setUserPreferences(response.data);
        setHasPreferences(true);
      } else {
        setHasPreferences(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      setHasPreferences(false);
    }
  };

  // Charger les recommandations personnalisées
  const loadPersonalizedRecommendations = async () => {
    try {
      if (!user) return;

      const response = await api.getRecommendedTrips();
      if (response.success && response.data) {
        const recommendations = response.data as TripRecommendation[];
        
        const feedItems: FeedItem[] = [];

        // Ajouter un header personnalisé
        if (hasPreferences) {
          feedItems.push({
            id: 'header',
            type: 'recommendation',
            title: '🎯 Recommandations pour vous',
            subtitle: 'Basé sur vos préférences de voyage',
            data: null,
          });
        } else {
          feedItems.push({
            id: 'header',
            type: 'recommendation',
            title: '🌟 Découvrez de nouveaux voyages',
            subtitle: 'Voici quelques suggestions pour vous inspirer',
            data: null,
          });
        }

        // Ajouter les voyages recommandés
        recommendations.forEach((rec, index) => {
          feedItems.push({
            id: `trip-${rec.trip.id}`,
            type: 'trip',
            title: rec.trip.title,
            subtitle: `${rec.trip.location?.city || 'Destination'}`,
            data: rec.trip,
            score: rec.score,
            reason: getRecommendationReason(rec.score, hasPreferences),
          });
        });

        // Ajouter des catégories suggérées
        const suggestedCategories = getSuggestedCategories(userPreferences);
        suggestedCategories.forEach(category => {
          feedItems.push({
            id: `category-${category.id}`,
            type: 'category',
            title: `Explorer ${category.label}`,
            subtitle: 'Découvrez des voyages dans cette catégorie',
            data: category,
          });
        });

        setFeedItems(feedItems);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      // En cas d'erreur, afficher du contenu par défaut
      loadDefaultContent();
    }
  };

  // Charger du contenu par défaut (aléatoire)
  const loadDefaultContent = async () => {
    try {
      const response = await api.getTrips({ limit: 10 });
      if (response.success && response.data) {
        const trips = response.data as Trip[];
        
        const feedItems: FeedItem[] = [
          {
            id: 'header',
            type: 'recommendation',
            title: '🌟 Découvrez de nouveaux voyages',
            subtitle: 'Voici quelques suggestions pour vous inspirer',
            data: null,
          },
        ];

        // Ajouter des voyages aléatoires
        trips.forEach(trip => {
          feedItems.push({
            id: `trip-${trip.id}`,
            type: 'trip',
            title: trip.title,
            subtitle: `${trip.location?.city || 'Destination'}`,
            data: trip,
            score: Math.random() * 0.5 + 0.1, // Score aléatoire entre 0.1 et 0.6
            reason: 'Voyage populaire',
          });
        });

        // Ajouter des catégories populaires
        const popularCategories = categories.slice(0, 4);
        popularCategories.forEach(category => {
          feedItems.push({
            id: `category-${category.id}`,
            type: 'category',
            title: `Explorer ${category.label}`,
            subtitle: 'Découvrez des voyages dans cette catégorie',
            data: category,
          });
        });

        setFeedItems(feedItems);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu par défaut:', error);
    }
  };

  // Obtenir la raison de recommandation
  const getRecommendationReason = (score: number, hasPrefs: boolean): string => {
    if (!hasPrefs) return 'Voyage populaire';
    
    if (score >= 0.8) return 'Parfaitement adapté à vos goûts';
    if (score >= 0.6) return 'Très bien adapté à vos préférences';
    if (score >= 0.4) return 'Correspond à vos intérêts';
    return 'Suggestion basée sur vos préférences';
  };

  // Obtenir les catégories suggérées basées sur les préférences
  const getSuggestedCategories = (prefs: UserTravelPreferences | null): any[] => {
    if (!prefs) return categories.slice(0, 4);

    const suggested: any[] = [];
    
    // Mapper les préférences aux catégories
    if (prefs.activities?.includes('culture')) {
      suggested.push(categories.find(c => c.id === 'culture'));
    }
    if (prefs.activities?.includes('nature')) {
      suggested.push(categories.find(c => c.id === 'nature'));
    }
    if (prefs.activities?.includes('adventure')) {
      suggested.push(categories.find(c => c.id === 'adventure'));
    }
    if (prefs.activities?.includes('food')) {
      suggested.push(categories.find(c => c.id === 'food'));
    }

    // Si pas assez de suggestions, ajouter des catégories populaires
    while (suggested.length < 4) {
      const remaining = categories.filter(c => !suggested.find(s => s?.id === c.id));
      if (remaining.length > 0) {
        suggested.push(remaining[0]);
      } else {
        break;
      }
    }

    return suggested.slice(0, 4);
  };

  // Charger le feed
  const loadFeed = async () => {
    setLoading(true);
    await loadUserPreferences();
    if (hasPreferences) {
      await loadPersonalizedRecommendations();
    } else {
      await loadDefaultContent();
    }
    setLoading(false);
  };

  // Rafraîchir le feed
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  // Gérer le clic sur un élément du feed
  const handleFeedItemPress = (item: FeedItem) => {
    switch (item.type) {
      case 'trip':
        navigation.navigate('TripDetails', { tripId: item.data.id });
        break;
      case 'category':
        navigation.navigate('CategoryTrips', { 
          category: item.data.id,
          categoryName: item.data.label 
        });
        break;
    }
  };

  // Rendu d'un élément du feed
  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'recommendation':
        if (item.id === 'header') {
          return (
            <View style={[styles.headerCard, { backgroundColor: theme.colors.background.card }]}>
              <LinearGradient
                colors={[theme.colors.primary[0] + '20', 'transparent']}
                style={styles.headerGradient}
              >
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
                  {item.subtitle}
                </Text>
              </LinearGradient>
            </View>
          );
        }
        return null;

      case 'trip':
        return (
          <View style={styles.tripContainer}>
            <TripCard
              trip={item.data}
              theme={theme}
              navigation={navigation}
              showRecommendationScore={hasPreferences}
              recommendationScore={item.score}
              recommendationReason={item.reason}
            />
          </View>
        );

      case 'category':
        return (
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: theme.colors.background.card }]}
            onPress={() => handleFeedItemPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.categoryContent}>
              <Text style={styles.categoryEmoji}>{item.data.emoji}</Text>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryTitle, { color: theme.colors.text.primary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.categorySubtitle, { color: theme.colors.text.secondary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text.secondary}
              />
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    loadFeed();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          Chargement de votre feed personnalisé...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={feedItems}
      renderItem={renderFeedItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary[0]]}
          tintColor={theme.colors.primary[0]}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  tripContainer: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 14,
  },
});

export default PersonalizedFeed; 