import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { IntelligentPlacesService, PlaceDetails, IntelligentSuggestion } from '../../services/intelligentPlacesService';
import IntelligentPlaceCard from './IntelligentPlaceCard';
import CustomPlaceCreator from './CustomPlaceCreator';

interface IntelligentPlacesListProps {
  cityName: string;
  onPlaceSelect: (place: PlaceDetails) => void;
  userProfile?: {
    interests?: string[];
    budget?: 'low' | 'medium' | 'high';
    travel_style?: 'relaxed' | 'active' | 'cultural';
    accessibility_needs?: boolean;
  };
  maxPlaces?: number;
  showCategories?: boolean;
  allowSearch?: boolean;
}

const IntelligentPlacesList: React.FC<IntelligentPlacesListProps> = ({
  cityName,
  onPlaceSelect,
  userProfile,
  maxPlaces = 10,
  showCategories = true,
  allowSearch = true,
}) => {
  const { theme } = useAppTheme();
  const [suggestions, setSuggestions] = useState<IntelligentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceDetails[]>([]);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customPlaces, setCustomPlaces] = useState<PlaceDetails[]>([]);

  useEffect(() => {
    loadSuggestions();
  }, [cityName]);

  useEffect(() => {
    filterPlaces();
  }, [suggestions, selectedCategory, searchQuery, userProfile]);

  const loadSuggestions = () => {
    setLoading(true);
    
    try {
      const cityData = IntelligentPlacesService.getIntelligentSuggestions(cityName);
      setSuggestions(cityData);
    } catch (error) {
      console.error('Erreur chargement suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlaces = () => {
    if (!suggestions) return;

    // Combiner lieux suggérés et lieux personnalisés
    let places = [...suggestions.places, ...customPlaces];

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      places = places.filter(place => place.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      places = IntelligentPlacesService.searchPlaces(cityName, searchQuery);
    }

    // Appliquer les recommandations personnalisées
    if (userProfile && Object.keys(userProfile).length > 0) {
      const personalizedPlaces = IntelligentPlacesService.getPersonalizedRecommendations(
        cityName,
        userProfile
      );
      // Combiner avec respect des filtres existants
      places = places.filter(place => 
        personalizedPlaces.some(p => p.place_id === place.place_id)
      );
    }

    // Limiter le nombre de résultats
    places = places.slice(0, maxPlaces);

    setFilteredPlaces(places);
  };

  const handleCustomPlaceCreated = (place: PlaceDetails) => {
    setCustomPlaces(prev => [...prev, place]);
    onPlaceSelect(place);
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      'all': 'Tous',
      'attraction': 'Attractions',
      'restaurant': 'Restaurants',
      'hotel': 'Hôtels',
      'shopping': 'Shopping',
      'nature': 'Nature',
      'culture': 'Culture',
      'nightlife': 'Vie nocturne',
      'transport': 'Transport',
    };
    return names[category as keyof typeof names] || category;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'all': return 'grid-outline';
      case 'attraction': return 'camera-outline';
      case 'restaurant': return 'restaurant-outline';
      case 'hotel': return 'bed-outline';
      case 'shopping': return 'bag-outline';
      case 'nature': return 'leaf-outline';
      case 'culture': return 'library-outline';
      case 'nightlife': return 'wine-outline';
      case 'transport': return 'car-outline';
      default: return 'location-outline';
    }
  };

  const renderSearchBar = () => {
    if (!allowSearch) return null;

    return (
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.card }]}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={theme.colors.text.secondary} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Rechercher un lieu..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={theme.colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCategoryFilters = () => {
    if (!showCategories || !suggestions) return null;

    const categories = ['all', ...Object.keys(suggestions.categories)];

    return (
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: selectedCategory === category 
                    ? theme.colors.primary[0] 
                    : theme.colors.border.primary,
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={16}
                color={selectedCategory === category ? 'white' : theme.colors.text.secondary}
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryText,
                {
                  color: selectedCategory === category 
                    ? 'white' 
                    : theme.colors.text.primary
                }
              ]}>
                {getCategoryDisplayName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCreateButton = () => (
    <TouchableOpacity
      style={[styles.createButton, { backgroundColor: theme.colors.primary[0] }]}
      onPress={() => setShowCustomCreator(true)}
    >
      <Ionicons name="add-circle-outline" size={20} color="white" />
      <Text style={styles.createButtonText}>Créer un lieu</Text>
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!suggestions) return null;

    const customCount = customPlaces.length;
    const suggestedCount = filteredPlaces.length - customCount;

    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: theme.colors.text.secondary }]}>
          {filteredPlaces.length} lieu{filteredPlaces.length > 1 ? 'x' : ''} trouvé{filteredPlaces.length > 1 ? 's' : ''}
          {selectedCategory !== 'all' && ` dans ${getCategoryDisplayName(selectedCategory)}`}
          {customCount > 0 && ` (${customCount} personnalisé${customCount > 1 ? 's' : ''})`}
        </Text>
        {userProfile && (
          <Text style={[styles.personalizedText, { color: theme.colors.primary[0] }]}>
            ✨ Personnalisé pour vous
          </Text>
        )}
      </View>
    );
  };

  const renderPlaces = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[0]} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Chargement des suggestions...
          </Text>
        </View>
      );
    }

    if (!suggestions) {
      return (
        <View style={styles.noSuggestionsContainer}>
          <Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={[styles.noSuggestionsTitle, { color: theme.colors.text.primary }]}>
            Aucune suggestion disponible
          </Text>
          <Text style={[styles.noSuggestionsText, { color: theme.colors.text.secondary }]}>
            Nous n'avons pas encore de données pour {cityName}
          </Text>
        </View>
      );
    }

    if (filteredPlaces.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={[styles.noResultsTitle, { color: theme.colors.text.primary }]}>
            Aucun résultat
          </Text>
          <Text style={[styles.noResultsText, { color: theme.colors.text.secondary }]}>
            Essayez de modifier vos filtres ou votre recherche
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.placesContainer}>
        {filteredPlaces.map(place => (
          <IntelligentPlaceCard
            key={place.place_id}
            place={place}
            onSelect={onPlaceSelect}
            showFullDetails={true}
          />
        ))}
      </View>
    );
  };

      return (
      <View style={styles.container}>
        {renderSearchBar()}
        {renderCategoryFilters()}
        {renderCreateButton()}
        {renderStats()}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderPlaces()}
        </ScrollView>
        
        <CustomPlaceCreator
          visible={showCustomCreator}
          onClose={() => setShowCustomCreator(false)}
          onPlaceCreated={handleCustomPlaceCreated}
        />
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
  },
  personalizedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  placesContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  noSuggestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noSuggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default IntelligentPlacesList;
