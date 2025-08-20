import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { EnhancedLocationService, PopularDestination } from '../../services/enhancedLocationService';
import { LocationSuggestion } from './LocationSearchInput';

const { width } = Dimensions.get('window');

interface EnhancedLocationSearchProps {
  value: string;
  onLocationSelect: (location: LocationSuggestion | PopularDestination) => void;
  placeholder?: string;
  style?: any;
  showPopularDestinations?: boolean;
  tripType?: 'cultural' | 'beach' | 'adventure' | 'city' | 'nature';
}

const EnhancedLocationSearch: React.FC<EnhancedLocationSearchProps> = ({
  value,
  onLocationSelect,
  placeholder = "Où souhaitez-vous voyager ?",
  style,
  showPopularDestinations = true,
  tripType,
}) => {
  const { theme } = useAppTheme();
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'search' | 'popular'>('popular');
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  useEffect(() => {
    if (showPopularDestinations) {
      loadPopularDestinations();
    }
  }, [tripType, showPopularDestinations]);

  const loadPopularDestinations = () => {
    let destinations: PopularDestination[] = [];
    
    if (tripType) {
      destinations = EnhancedLocationService.getSuggestionsByTripType(tripType);
    } else {
      destinations = EnhancedLocationService.getPopularDestinations();
    }
    
    setPopularDestinations(destinations.slice(0, 6));
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    
    if (text.length >= 2) {
      setSearchMode('search');
      setShowSuggestions(true);
      setLoading(true);

      // Debounce search - optimisé pour une meilleure réactivité
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(async () => {
        try {
          console.log('🔍 Recherche en temps réel:', text);
          const results = await EnhancedLocationService.searchLocations(text);
          console.log('✅ Résultats trouvés:', results.length);
          setSuggestions(results);
        } catch (error) {
          console.error('❌ Erreur recherche lieux:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 250); // Réduit à 250ms pour plus de réactivité
    } else if (text.length === 1) {
      // Afficher un message d'aide pour encourager la saisie
      setSearchMode('popular');
      setShowSuggestions(true);
      setSuggestions([]);
    } else {
      setSearchMode('popular');
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion | PopularDestination) => {
    if ('display_name' in location) {
      // LocationSuggestion
      setSearchText(location.display_name);
    } else {
      // PopularDestination
      setSearchText(location.display_name);
    }
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const handleFocus = () => {
    if (searchText.length < 2) {
      setSearchMode('popular');
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchMode('popular');
  };

  const renderSearchSuggestion = ({ item }: { item: LocationSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: theme.colors.background.card }]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={[styles.suggestionIcon, { backgroundColor: `${theme.colors.primary[0]}20` }]}>
        <Ionicons name="location-outline" size={16} color={theme.colors.primary[0]} />
      </View>
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <Text style={[styles.suggestionAddress, { color: theme.colors.text.secondary }]}>
          {item.display_name}
        </Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  const renderPopularDestination = ({ item }: { item: PopularDestination }) => (
    <TouchableOpacity
      style={[styles.popularItem, { backgroundColor: theme.colors.background.card }]}
      onPress={() => handleLocationSelect(item)}
    >
      <Image
        source={{ uri: item.photo_url }}
        style={styles.popularImage}
        defaultSource={{ uri: 'http://localhost:8085/storage/defaults/default-trip-image.jpg' }}
      />
      <View style={styles.popularContent}>
        <View style={styles.popularHeader}>
          <Text style={[styles.popularName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <View style={styles.popularRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.colors.text.secondary }]}>
              {item.popularity_score}
            </Text>
          </View>
        </View>
        <Text style={[styles.popularCountry, { color: theme.colors.text.secondary }]}>
          {item.country} • {item.suggested_duration}
        </Text>
        <View style={styles.popularHighlights}>
          {item.highlights.slice(0, 2).map((highlight, index) => (
            <Text key={index} style={[styles.highlight, { color: theme.colors.primary[0] }]}>
              {highlight}
            </Text>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchInput, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.primary }]}>
        <Ionicons name="search-outline" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary[0]} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Recherche...
            </Text>
          </View>
        )}
        {searchText.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.background.primary }]}>
          {searchMode === 'search' && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              renderItem={renderSearchSuggestion}
              keyExtractor={(item) => item.id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {searchMode === 'popular' && popularDestinations.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                🌟 Destinations populaires
              </Text>
              <FlatList
                data={popularDestinations}
                renderItem={renderPopularDestination}
                keyExtractor={(item) => item.id}
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
              />
            </>
          )}

          {searchMode === 'search' && !loading && suggestions.length === 0 && searchText.length >= 2 && (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: theme.colors.text.secondary }]}>
                Aucun résultat trouvé pour "{searchText}"
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 300,
    zIndex: 1001,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 15,
    paddingBottom: 10,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  popularImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  popularContent: {
    flex: 1,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  popularName: {
    fontSize: 16,
    fontWeight: '600',
  },
  popularRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  popularCountry: {
    fontSize: 14,
    marginBottom: 4,
  },
  popularHighlights: {
    flexDirection: 'row',
    gap: 8,
  },
  highlight: {
    fontSize: 12,
    fontWeight: '500',
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default EnhancedLocationSearch;
