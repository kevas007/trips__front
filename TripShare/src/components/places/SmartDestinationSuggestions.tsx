import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store';
import { SmartSuggestionsService, SmartSuggestionResult, AIGeneratedDestination } from '../../services/smartSuggestionsService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface SmartDestinationSuggestionsProps {
  onDestinationSelect: (destination: AIGeneratedDestination) => void;
  tripType?: 'cultural' | 'beach' | 'adventure' | 'city' | 'nature';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  maxSuggestions?: number;
  showFilters?: boolean;
}

const SmartDestinationSuggestions: React.FC<SmartDestinationSuggestionsProps> = ({
  onDestinationSelect,
  tripType,
  season,
  maxSuggestions = 6,
  showFilters = true,
}) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<SmartSuggestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('smart');
  const [filters, setFilters] = useState({
    tripType,
    budget: undefined as 'low' | 'medium' | 'high' | undefined,
    continent: undefined as string | undefined,
  });

  useEffect(() => {
    loadSmartSuggestions();
  }, [user?.id, filters, selectedFilter]);

  const loadSmartSuggestions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const smartSuggestions = await SmartSuggestionsService.getSmartSuggestions(
        user.id,
        {
          ...filters,
          maxResults: maxSuggestions,
        }
      );
      
      setSuggestions(smartSuggestions);
    } catch (error) {
      console.error('Erreur chargement suggestions intelligentes:', error);
      Alert.alert('Erreur', 'Impossible de charger les suggestions intelligentes');
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationLike = async (destinationId: string) => {
    if (!user?.id) return;
    
    try {
      await SmartSuggestionsService.likeDestination(user.id, destinationId);
      // Recharger les suggestions pour mettre à jour les scores
      await loadSmartSuggestions();
    } catch (error) {
      console.error('Erreur like destination:', error);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getTrendingIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const renderDestinationCard = (suggestion: SmartSuggestionResult) => {
    const { destination, relevance_score, match_reasons, user_similarity, trending_bonus } = suggestion;
    
    return (
      <TouchableOpacity
        key={destination.id}
        style={[styles.card, { backgroundColor: theme.colors.background.card }]}
        onPress={() => onDestinationSelect(destination)}
      >
        <Image
          source={{ uri: destination.photo_urls[0] || 'http://localhost:8085/storage/defaults/default-trip-image.jpg' }}
          style={styles.cardImage}
          resizeMode="cover"
          defaultSource={{ uri: 'http://localhost:8085/storage/defaults/default-trip-image.jpg' }}
          onError={() => console.log('Erreur chargement image pour:', destination.name)}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.destinationName, { color: theme.colors.text.primary }]}>
              {destination.name}
            </Text>
            <View style={styles.scoreContainer}>
              <View style={[styles.relevanceScore, { backgroundColor: getRelevanceColor(relevance_score) }]}>
                <Text style={styles.scoreText}>
                  {Math.round(relevance_score * 100)}%
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.country, { color: theme.colors.text.secondary }]}>
            {destination.country} • {destination.continent}
          </Text>

          <Text style={[styles.duration, { color: theme.colors.text.secondary }]}>
            📅 {destination.suggested_duration}
          </Text>

          <View style={styles.aiInfo}>
            <View style={styles.aiScore}>
              <Ionicons name="sparkles" size={12} color="#FFD700" />
              <Text style={[styles.aiScoreText, { color: theme.colors.text.secondary }]}>
                IA: {destination.ai_score}/100
              </Text>
            </View>
            
            {destination.popularity_trend !== 'stable' && (
              <View style={styles.trending}>
                <Ionicons 
                  name={getTrendingIcon(destination.popularity_trend) as any} 
                  size={12} 
                  color={destination.popularity_trend === 'rising' ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[styles.trendingText, { color: theme.colors.text.secondary }]}>
                  {destination.popularity_trend === 'rising' ? 'En vogue' : 'Déclinant'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.highlights}>
            {destination.ai_highlights.slice(0, 2).map((highlight, index) => (
              <View
                key={index}
                style={[styles.highlightTag, { backgroundColor: theme.colors.background.card }]}
              >
                <Text style={[styles.highlightText, { color: theme.colors.text.secondary }]}>
                  {highlight}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.matchReasons}>
            {match_reasons.slice(0, 2).map((reason, index) => (
              <Text key={index} style={[styles.matchReason, { color: theme.colors.primary[0] }]}>
                ✓ {reason}
              </Text>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="heart" size={12} color="#FF6B6B" />
                <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                  {destination.total_likes}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                  {destination.average_rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleDestinationLike(destination.id)}
            >
              <Ionicons name="heart-outline" size={16} color={theme.colors.primary[0]} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => {
    if (!showFilters) return null;

    const filterOptions = [
      { key: 'smart', label: '🤖 IA Intelligente', icon: 'sparkles' },
      { key: 'popular', label: '🔥 Populaires', icon: 'flame' },
      { key: 'trending', label: '📈 Tendances', icon: 'trending-up' },
      { key: 'personal', label: '👤 Pour vous', icon: 'person' },
    ];

    return (
      <View style={styles.filterTabs}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              selectedFilter === option.key && { backgroundColor: theme.colors.primary[0] },
              { borderColor: theme.colors.border.primary }
            ]}
            onPress={() => setSelectedFilter(option.key)}
          >
            <Ionicons
              name={option.icon as any}
              size={14}
              color={selectedFilter === option.key ? 'white' : theme.colors.text.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.filterTabText,
              { color: selectedFilter === option.key ? 'white' : theme.colors.text.primary }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderBudgetFilter = () => {
    if (!showFilters) return null;

    const budgetOptions = [
      { key: 'low', label: '€€', description: 'Économique' },
      { key: 'medium', label: '€€€', description: 'Moyen' },
      { key: 'high', label: '€€€€', description: 'Premium' },
    ];

    return (
      <View style={styles.budgetFilter}>
        <Text style={[styles.filterLabel, { color: theme.colors.text.primary }]}>
          Budget:
        </Text>
        <View style={styles.budgetOptions}>
          {budgetOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.budgetOption,
                filters.budget === option.key && { backgroundColor: theme.colors.primary[0] },
                { borderColor: theme.colors.border.primary }
              ]}
              onPress={() => setFilters(prev => ({ ...prev, budget: option.key as any }))}
            >
              <Text style={[
                styles.budgetLabel,
                { color: filters.budget === option.key ? 'white' : theme.colors.text.primary }
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.budgetDescription,
                { color: filters.budget === option.key ? 'white' : theme.colors.text.secondary }
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          Analyse de vos préférences...
        </Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={theme.colors.text.secondary} />
        <Text style={[styles.emptyText, { color: theme.colors.text.primary }]}>
          Aucune suggestion trouvée
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.text.secondary }]}>
          Essayez de modifier vos filtres ou créez votre premier voyage
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        🧠 Suggestions intelligentes
      </Text>

      {renderFilterTabs()}
      {renderBudgetFilter()}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scroll}
      >
        {suggestions.map(renderDestinationCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  budgetFilter: {
    marginBottom: 15,
  },
  budgetOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  budgetOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetDescription: {
    fontSize: 10,
    marginTop: 2,
  },
  scroll: {
    marginLeft: 20,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  relevanceScore: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  country: {
    fontSize: 12,
    marginBottom: 6,
  },
  duration: {
    fontSize: 12,
    marginBottom: 8,
  },
  aiInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiScoreText: {
    fontSize: 10,
    marginLeft: 4,
  },
  trending: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingText: {
    fontSize: 10,
    marginLeft: 4,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  highlightTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highlightText: {
    fontSize: 9,
  },
  matchReasons: {
    marginBottom: 8,
  },
  matchReason: {
    fontSize: 10,
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 10,
    marginLeft: 2,
  },
  likeButton: {
    padding: 4,
  },
});

export default SmartDestinationSuggestions;
