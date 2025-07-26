import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { LocationSuggestion } from './LocationSearchInput';
import { PopularPlacesService, PopularPlace } from '../../services/popularPlacesService';

interface PopularPlacesSuggestionsProps {
  destination: string;
  onPlaceSelect: (place: LocationSuggestion) => void;
  visible?: boolean;
}

const PopularPlacesSuggestions: React.FC<PopularPlacesSuggestionsProps> = ({
  destination,
  onPlaceSelect,
  visible = true,
}) => {
  const { theme } = useAppTheme();

  if (!visible || !destination.trim()) {
    return null;
  }

  const popularPlaces = PopularPlacesService.getPopularPlacesWithDetails(destination);
  const categories = PopularPlacesService.getPlaceCategories(destination);

  if (popularPlaces.length === 0) {
    return null;
  }

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category.toLowerCase()) {
      case 'monument':
      case 'monument historique':
      case 'monument antique':
        return 'business';
      case 'musée':
      case 'musée d\'art':
      case 'musée national':
      case 'musée historique':
        return 'library';
      case 'parc':
        return 'leaf';
      case 'église':
        return 'business';
      case 'fontaine':
        return 'water';
      case 'avenue':
        return 'map';
      case 'place':
        return 'location';
      case 'activité':
        return 'boat';
      case 'état':
        return 'flag';
      case 'site archéologique':
        return 'construct';
      case 'temple antique':
        return 'business';
      default:
        return 'location';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'monument':
      case 'monument historique':
      case 'monument antique':
        return '#FF6B6B';
      case 'musée':
      case 'musée d\'art':
      case 'musée national':
      case 'musée historique':
        return '#4ECDC4';
      case 'parc':
        return '#45B7D1';
      case 'église':
        return '#96CEB4';
      case 'fontaine':
        return '#FFEAA7';
      case 'avenue':
        return '#DDA0DD';
      case 'place':
        return '#98D8C8';
      case 'activité':
        return '#F7DC6F';
      case 'état':
        return '#BB8FCE';
      case 'site archéologique':
        return '#E67E22';
      case 'temple antique':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const renderPlace = (place: PopularPlace) => (
    <TouchableOpacity
      key={place.id}
      style={[styles.placeCard, { backgroundColor: theme.colors.background.card }]}
      onPress={() => onPlaceSelect({
        id: place.id,
        name: place.name,
        display_name: place.display_name,
        lat: place.lat.toString(),
        lon: place.lon.toString(),
        type: place.type,
        address: {
          city: place.city,
          country: place.country,
          state: undefined
        }
      })}
    >
      <View style={[styles.placeIcon, { backgroundColor: getCategoryColor(place.category) }]}>
        <Ionicons 
          name={getCategoryIcon(place.category)} 
          size={20} 
          color="white" 
        />
      </View>
      
      <View style={styles.placeContent}>
        <View style={styles.placeHeader}>
          <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
            {place.name}
          </Text>
          {place.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: theme.colors.text.secondary }]}>
                {place.rating}
              </Text>
            </View>
          )}
        </View>
        
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(place.category) }]}>
          <Text style={styles.categoryText}>{place.category}</Text>
        </View>
        
        <Text style={[styles.placeAddress, { color: theme.colors.text.secondary }]}>
          {place.address}
        </Text>
        <View style={styles.coordinatesInfo}>
          <Ionicons name="location" size={12} color={theme.colors.primary[0]} />
          <Text style={[styles.coordinatesText, { color: theme.colors.text.secondary }]}>
            {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
          </Text>
        </View>
        
        {place.description && (
          <Text style={[styles.placeDescription, { color: theme.colors.text.secondary }]}>
            {place.description}
          </Text>
        )}
      </View>
      
      <View style={styles.placeArrow}>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={20} color={theme.colors.primary[0]} />
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Lieux populaires à {destination}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          {popularPlaces.length} lieux recommandés
        </Text>
      </View>
      
      <View style={styles.placesList}>
        {popularPlaces.slice(0, 3).map((place) => renderPlace(place))}
      </View>
      
      <View style={styles.categoriesContainer}>
        <Text style={[styles.categoriesTitle, { color: theme.colors.text.primary }]}>
          Catégories disponibles :
        </Text>
        <View style={styles.categoriesList}>
          {categories.map(category => (
            <View 
              key={category} 
              style={[styles.categoryChip, { backgroundColor: getCategoryColor(category) }]}
            >
              <Ionicons 
                name={getCategoryIcon(category)} 
                size={12} 
                color="white" 
              />
              <Text style={styles.categoryChipText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    marginLeft: 8,
  },
  placesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeContent: {
    flex: 1,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  placeAddress: {
    fontSize: 12,
    marginBottom: 2,
  },
  placeDescription: {
    fontSize: 11,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  coordinatesText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  placeArrow: {
    marginLeft: 8,
  },
  categoriesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryChipText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
});

export default PopularPlacesSuggestions; 