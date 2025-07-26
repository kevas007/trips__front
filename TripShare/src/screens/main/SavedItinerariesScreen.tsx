import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { 
  savedItinerariesService, 
  SavedItinerary, 
  formatSavedDate 
} from '../../services/savedItinerariesService';
import ItineraryCard from '../../components/itinerary/ItineraryCard';

interface SavedItinerariesScreenProps {
  navigation: any;
}

const SavedItinerariesScreen: React.FC<SavedItinerariesScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItineraries, setFilteredItineraries] = useState<SavedItinerary[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'alphabetical'>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const loadSavedItineraries = async () => {
    try {
      const itineraries = await savedItinerariesService.getSavedItineraries();
      setSavedItineraries(itineraries);
      setFilteredItineraries(itineraries);
    } catch (error) {
      console.error('Erreur lors du chargement des itinéraires:', error);
      Alert.alert('Erreur', 'Impossible de charger vos itinéraires sauvegardés');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedItineraries();
    setRefreshing(false);
  };

  const handleRemoveItinerary = async (tripId: string, destination: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir retirer "${destination}" de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await savedItinerariesService.removeSavedItinerary(tripId);
              await loadSavedItineraries();
              Alert.alert('Succès', 'Itinéraire retiré de vos favoris');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer cet itinéraire');
            }
          },
        },
      ]
    );
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItineraries(savedItineraries);
    } else {
      const filtered = savedItineraries.filter(item =>
        item.destination.toLowerCase().includes(query.toLowerCase()) ||
        item.authorName.toLowerCase().includes(query.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItineraries(filtered);
    }
  }, [savedItineraries]);

  const handleFilterChange = (filter: 'all' | 'recent' | 'alphabetical') => {
    setSelectedFilter(filter);
    let sorted = [...filteredItineraries];
    
    switch (filter) {
      case 'recent':
        sorted = sorted.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        break;
      case 'alphabetical':
        sorted = sorted.sort((a, b) => a.destination.localeCompare(b.destination));
        break;
      default:
        // Pas de tri spécifique
        break;
    }
    
    setFilteredItineraries(sorted);
  };

  const handleShareItinerary = async (itinerary: SavedItinerary) => {
    // Implémentation du partage
    Alert.alert('Partage', `Partager l'itinéraire "${itinerary.destination}"`);
  };

  // Charger les itinéraires au focus de l'écran
  useFocusEffect(
    useCallback(() => {
      loadSavedItineraries();
    }, [])
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Mes Itinéraires
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            {savedItineraries.length} itinéraire{savedItineraries.length > 1 ? 's' : ''} sauvegardé{savedItineraries.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Rechercher par destination, auteur ou tags..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[styles.filterText, { color: theme.colors.text.primary }]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'recent' && styles.activeFilter]}
          onPress={() => handleFilterChange('recent')}
        >
          <Text style={[styles.filterText, { color: theme.colors.text.primary }]}>
            Récents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'alphabetical' && styles.activeFilter]}
          onPress={() => handleFilterChange('alphabetical')}
        >
          <Text style={[styles.filterText, { color: theme.colors.text.primary }]}>
            A-Z
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItineraryItem = ({ item }: { item: SavedItinerary }) => (
    <View style={[styles.itineraryItem, { backgroundColor: theme.colors.background.card }]}>
      {/* Header de l'item */}
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <Image source={{ uri: item.coverImage || item.authorAvatar }} style={styles.coverImage} />
          <View style={styles.itemInfo}>
            <Text style={[styles.destinationText, { color: theme.colors.text.primary }]}>
              {item.destination}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={[styles.authorText, { color: theme.colors.text.secondary }]}>
                Par {item.authorName}
              </Text>
              <Text style={[styles.savedDateText, { color: theme.colors.text.secondary }]}>
                • {formatSavedDate(item.savedAt)}
              </Text>
            </View>
            <View style={styles.itemStats}>
              <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                {item.duration} • {item.budget}
              </Text>
              {item.difficulty && (
                <Text style={[styles.difficultyText, { color: theme.colors.primary[0] }]}>
                  • {item.difficulty}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItinerary(item.tripId, item.destination)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary[0] + '20' }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
                #{tag}
              </Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={[styles.moreTagsText, { color: theme.colors.text.secondary }]}>
              +{item.tags.length - 3} autres
            </Text>
          )}
        </View>
      )}

      {/* Itinéraire détaillé */}
      <ItineraryCard
        tripInfo={{
          id: item.id,
          destination: item.destination,
          duration: item.duration,
          budget: item.budget,
          difficulty: item.difficulty,
          bestTime: item.bestTime,
          highlights: item.highlights,
          steps: item.steps,
        }}
        userName={item.authorName}
        isExpanded={expandedItemId === item.id}
        onToggleExpanded={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
        onSaveItinerary={() => handleShareItinerary(item)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={theme.colors.text.secondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Aucun itinéraire sauvegardé
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Parcourez les posts de voyage et sauvegardez les itinéraires qui vous intéressent
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: theme.colors.primary[0] }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>
          Explorer les voyages
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          Chargement de vos itinéraires...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={filteredItineraries}
        keyExtractor={(item) => item.id}
        renderItem={renderItineraryItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[0]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  activeFilter: {
    backgroundColor: 'rgba(0,151,230,0.2)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itineraryItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  destinationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorText: {
    fontSize: 12,
  },
  savedDateText: {
    fontSize: 12,
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 10,
    paddingVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SavedItinerariesScreen; 