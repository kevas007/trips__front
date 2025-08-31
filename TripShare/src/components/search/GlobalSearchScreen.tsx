import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { globalSearchService, SearchResult, SearchFilters } from '../../services/globalSearchService';
import OptimizedImage from '../ui/OptimizedImage';
import AppBackground from '../ui/AppBackground';

const { width: screenWidth } = Dimensions.get('window');

interface GlobalSearchScreenProps {
  navigation: any;
}

const GlobalSearchScreen: React.FC<GlobalSearchScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Charger les recherches populaires et récentes
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [popular, recent] = await Promise.all([
        globalSearchService.getPopularSearches(10),
        globalSearchService.getRecentSearches()
      ]);
      setPopularSearches(popular);
      setRecentSearches(recent);
    } catch (error) {
      console.error('Erreur chargement données initiales:', error);
    }
  };

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else if (query.trim().length === 0) {
        setResults([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const performSearch = async (isLoadMore = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const currentPage = isLoadMore ? page + 1 : 1;
      
      const response = await globalSearchService.search(
        query.trim(),
        filters,
        currentPage,
        20
      );

      if (isLoadMore) {
        setResults(prev => [...prev, ...response.results]);
        setPage(currentPage);
      } else {
        setResults(response.results);
        setPage(1);
      }
      
      setHasMore(response.has_more);
      setShowSuggestions(false);

      // Sauvegarder la recherche
      if (!isLoadMore && query.trim()) {
        await globalSearchService.saveSearch(query.trim());
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      Alert.alert('Erreur', 'Impossible d\'effectuer la recherche');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await globalSearchService.getSuggestions(searchQuery, 5);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur suggestions:', error);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchPress = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowSuggestions(false);
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        navigation.navigate('PublicProfile', { userId: result.id });
        break;
      case 'trip':
        navigation.navigate('TripDetails', { tripId: result.id });
        break;
      case 'tag':
        // Naviguer vers une page de voyages avec ce tag
        navigation.navigate('UnifiedHome', { tag: result.title });
        break;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    if (query.trim()) {
      await performSearch();
    }
    setRefreshing(false);
  }, [query]);

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.colors.background.secondary }]}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultContent}>
        {item.image && (
          <OptimizedImage
            source={item.image}
            style={styles.resultImage}
            resizeMode="cover"
            optimized
            maxWidth={60}
          />
        )}
        <View style={styles.resultText}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, { color: theme.colors.text.primary }]}>
              {item.title}
            </Text>
            <View style={[styles.resultType, { backgroundColor: getTypeColor(item.type) }]}>
              <Text style={styles.resultTypeText}>
                {getTypeLabel(item.type)}
              </Text>
            </View>
          </View>
          {item.subtitle && (
            <Text style={[styles.resultSubtitle, { color: theme.colors.text.secondary }]}>
              {item.subtitle}
            </Text>
          )}
          {item.description && (
            <Text style={[styles.resultDescription, { color: theme.colors.text.secondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.text.secondary} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: theme.colors.background.secondary }]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={16} color={theme.colors.text.secondary} />
      <Text style={[styles.suggestionText, { color: theme.colors.text.primary }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchHistory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.colors.background.secondary }]}
      onPress={() => handleSearchPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
      <Text style={[styles.historyText, { color: theme.colors.text.primary }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderPopularSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.popularItem, { backgroundColor: theme.colors.primary[100] }]}
      onPress={() => handleSearchPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="trending-up" size={16} color={theme.colors.primary[500]} />
      <Text style={[styles.popularText, { color: theme.colors.primary[500] }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return '#3b82f6';
      case 'trip': return '#10b981';
      case 'tag': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user': return 'Utilisateur';
      case 'trip': return 'Voyage';
      case 'tag': return 'Tag';
      default: return type;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={64} color={theme.colors.text.secondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Recherchez des utilisateurs, voyages et tags
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Commencez à taper pour découvrir du contenu
      </Text>
    </View>
  );

  return (
    <AppBackground variant="search">
      <SafeAreaView style={styles.container}>
        {/* Header avec barre de recherche */}
        <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder="Rechercher utilisateurs, voyages, tags..."
              placeholderTextColor={theme.colors.text.secondary}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                loadSuggestions(text);
              }}
              onFocus={() => {
                if (query.length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              returnKeyType="search"
              onSubmitEditing={() => performSearch()}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenu principal */}
        {query.trim().length === 0 ? (
          // État initial avec suggestions
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <View style={styles.initialContent}>
                {popularSearches.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                      Recherches populaires
                    </Text>
                    <View style={styles.tagsContainer}>
                      {popularSearches.map((search, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.popularItem, { backgroundColor: theme.colors.primary[100] }]}
                          onPress={() => handleSearchPress(search)}
                        >
                          <Ionicons name="trending-up" size={16} color={theme.colors.primary[500]} />
                          <Text style={[styles.popularText, { color: theme.colors.primary[500] }]}>
                            {search}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {recentSearches.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                      Recherches récentes
                    </Text>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.historyItem, { backgroundColor: theme.colors.background.secondary }]}
                        onPress={() => handleSearchPress(search)}
                      >
                        <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
                        <Text style={[styles.historyText, { color: theme.colors.text.primary }]}>
                          {search}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : showSuggestions && suggestions.length > 0 ? (
          // Suggestions de recherche
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item}
            style={styles.suggestionsList}
          />
        ) : (
          // Résultats de recherche
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            style={styles.resultsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              if (hasMore && !loading) {
                performSearch(true);
              }
            }}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              !loading && query.trim().length > 0 ? renderEmptyState() : null
            }
            ListFooterComponent={
              loading && results.length > 0 ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                </View>
              ) : null
            }
          />
        )}

        {/* Indicateur de chargement principal */}
        {loading && results.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Recherche en cours...
            </Text>
          </View>
        )}
      </SafeAreaView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
  initialContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  popularText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
  },
  suggestionsList: {
    flex: 1,
  },
  resultsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  suggestionText: {
    fontSize: 16,
  },
  resultItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  resultType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  resultTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  resultSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default GlobalSearchScreen;
