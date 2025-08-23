import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
interface FeedFilter {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface FeedFiltersProps {
  onFiltersChange: (filters: FeedFilter[]) => void;
  initialFilters?: FeedFilter[];
}

const FeedFilters: React.FC<FeedFiltersProps> = ({ onFiltersChange, initialFilters = [] }) => {
  const { theme } = useAppTheme();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<FeedFilter[]>(initialFilters.length > 0 ? initialFilters : [
    { id: 'all', label: 'Tous', icon: 'list-outline', active: true },
    { id: 'recent', label: 'Récents', icon: 'time-outline', active: false },
    { id: 'trending', label: 'Tendances', icon: 'trending-up-outline', active: false },
    { id: 'following', label: 'Mes abonnements', icon: 'people-outline', active: false },
    { id: 'destinations', label: 'Destinations', icon: 'location-outline', active: false },
    { id: 'adventures', label: 'Aventures', icon: 'mountain-outline', active: false },
    { id: 'culture', label: 'Culture', icon: 'library-outline', active: false },
    { id: 'food', label: 'Gastronomie', icon: 'restaurant-outline', active: false },
    { id: 'budget', label: 'Budget', icon: 'wallet-outline', active: false },
    { id: 'luxury', label: 'Luxe', icon: 'diamond-outline', active: false },
  ]);

  const [preferences, setPreferences] = useState({
    showOnlyWithItinerary: false,
    hideSeenPosts: false,
    prioritizeNearbyDestinations: false,
    showOnlyVerifiedUsers: false,
  });

  const handleFilterToggle = (filterId: string) => {
    const updatedFilters = filters.map(filter => {
      if (filter.id === filterId) {
        return { ...filter, active: !filter.active };
      }
      // Si on active "Tous", on désactive les autres
      if (filterId === 'all' && !filter.active) {
        return { ...filter, active: false };
      }
      // Si on active un autre filtre, on désactive "Tous"
      if (filter.id === 'all' && filterId !== 'all') {
        return { ...filter, active: false };
      }
      return filter;
    });
    
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetFilters = () => {
    const resetFilters = filters.map(filter => ({
      ...filter,
      active: filter.id === 'all',
    }));
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    setShowModal(false);
  };

  const activeFilters = filters.filter(f => f.active);
  const hasActiveFilters = activeFilters.length > 0 && !activeFilters.every(f => f.id === 'all');

  const renderQuickFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickFiltersContainer}
    >
      {filters.slice(0, 6).map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.quickFilterButton,
            {
                          backgroundColor: filter.active 
              ? theme.colors.primary[0] 
              : theme.colors.background.card,
            },
          ]}
          onPress={() => handleFilterToggle(filter.id)}
        >
          <Ionicons
            name={filter.icon as any}
            size={16}
            color={filter.active ? 'white' : theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.quickFilterText,
              {
                color: filter.active ? 'white' : theme.colors.text.secondary,
              },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[styles.moreFiltersButton, { backgroundColor: theme.colors.background.card }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="options-outline" size={16} color={theme.colors.text.secondary} />
        <Text style={[styles.moreFiltersText, { color: theme.colors.text.secondary }]}>
          Plus
        </Text>
        {hasActiveFilters && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={[styles.modalCancelButton, { color: theme.colors.text.secondary }]}>
              Annuler
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
            Filtres du feed
          </Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={[styles.modalResetButton, { color: theme.colors.primary[0] }]}>
              Réinitialiser
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Filtres par catégorie */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Catégories
            </Text>
            <View style={styles.filtersGrid}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterCard,
                    {
                                          backgroundColor: filter.active 
                      ? theme.colors.primary[0] + '20' 
                      : theme.colors.background.card,
                      borderColor: filter.active 
                        ? theme.colors.primary[0] 
                        : 'transparent',
                    },
                  ]}
                  onPress={() => handleFilterToggle(filter.id)}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={24}
                    color={filter.active ? theme.colors.primary[0] : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterCardText,
                      {
                        color: filter.active ? theme.colors.primary[0] : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Préférences avancées */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Préférences avancées
            </Text>
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text.primary }]}>
                  Afficher uniquement les posts avec itinéraire
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text.secondary }]}>
                  Masquer les posts sans itinéraire détaillé
                </Text>
              </View>
              <Switch
                value={preferences.showOnlyWithItinerary}
                onValueChange={() => handlePreferenceToggle('showOnlyWithItinerary')}
                trackColor={{ false: '#767577', true: theme.colors.primary[0] }}
                thumbColor={preferences.showOnlyWithItinerary ? 'white' : '#f4f3f4'}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text.primary }]}>
                  Masquer les posts déjà vus
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text.secondary }]}>
                  Ne plus afficher les posts que vous avez déjà consultés
                </Text>
              </View>
              <Switch
                value={preferences.hideSeenPosts}
                onValueChange={() => handlePreferenceToggle('hideSeenPosts')}
                trackColor={{ false: '#767577', true: theme.colors.primary[0] }}
                thumbColor={preferences.hideSeenPosts ? 'white' : '#f4f3f4'}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text.primary }]}>
                  Prioriser les destinations proches
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text.secondary }]}>
                  Afficher en premier les voyages vers des destinations proches
                </Text>
              </View>
              <Switch
                value={preferences.prioritizeNearbyDestinations}
                onValueChange={() => handlePreferenceToggle('prioritizeNearbyDestinations')}
                trackColor={{ false: '#767577', true: theme.colors.primary[0] }}
                thumbColor={preferences.prioritizeNearbyDestinations ? 'white' : '#f4f3f4'}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text.primary }]}>
                  Utilisateurs vérifiés uniquement
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text.secondary }]}>
                  Afficher uniquement les posts d'utilisateurs vérifiés
                </Text>
              </View>
              <Switch
                value={preferences.showOnlyVerifiedUsers}
                onValueChange={() => handlePreferenceToggle('showOnlyVerifiedUsers')}
                trackColor={{ false: '#767577', true: theme.colors.primary[0] }}
                thumbColor={preferences.showOnlyVerifiedUsers ? 'white' : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.applyButtonText}>
              Appliquer les filtres
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderQuickFilters()}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  quickFiltersContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    position: 'relative',
  },
  moreFiltersText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4757',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancelButton: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalResetButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
  },
  filterCardText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedFilters; 