import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationSuggestion } from './LocationSearchInput';

const { width, height } = Dimensions.get('window');

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  onClose: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  onClose,
  initialLocation,
}) => {
  const { theme } = useAppTheme();
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 48.8566,
    longitude: initialLocation?.longitude || 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
    display_name?: string;
    address?: {
      city?: string;
      country?: string;
      state?: string;
    };
  } | null>(initialLocation || null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Impossible d\'accéder à votre localisation');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      // Animer la carte vers la position actuelle
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=fr`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions: LocationSuggestion[] = data.map((item: any, index: number) => ({
          id: `${item.place_id || index}`,
          name: item.name || item.display_name?.split(',')[0] || 'Lieu inconnu',
          display_name: item.display_name || item.name || 'Lieu inconnu',
          lat: item.lat,
          lon: item.lon,
          type: item.type,
          address: {
            city: item.address?.city || item.address?.town || item.address?.village,
            country: item.address?.country,
            state: item.address?.state,
          },
        }));
        
        setSearchResults(formattedSuggestions);
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    searchLocations(text);
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    const locationName = location.display_name || location.name || 'Lieu sélectionné';
    
    setSelectedLocation({
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      name: locationName?.split(',')[0] || 'Lieu sélectionné',
      display_name: locationName,
      address: {
        city: locationName?.split(',').slice(-2, -1)[0]?.trim() || location.address?.city || 'Ville inconnue',
        country: locationName?.split(',').slice(-1)[0]?.trim() || location.address?.country || 'Pays inconnu',
        state: location.address?.state || '',
      },
    });

    const newRegion = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    setLocationName(locationName);
    setSearchQuery('');
    setSearchResults([]);
    
    // Animer la carte vers le lieu sélectionné
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    
    // Récupérer le nom du lieu via reverse geocoding
    reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationName(data.display_name);
      }
    } catch (error) {
      console.error('Erreur de reverse geocoding:', error);
    }
  };

  const confirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Erreur', 'Veuillez sélectionner un lieu sur la carte');
      return;
    }

    const location: LocationSuggestion = {
      id: Date.now().toString(),
      name: selectedLocation.name || 'Lieu sélectionné',
      display_name: selectedLocation.display_name || `${selectedLocation.latitude}, ${selectedLocation.longitude}`,
      lat: selectedLocation.latitude.toString(),
      lon: selectedLocation.longitude.toString(),
      type: 'selected',
      address: {
        city: selectedLocation.address?.city || 'Ville inconnue',
        country: selectedLocation.address?.country || 'Pays inconnu',
        state: selectedLocation.address?.state || '',
      },
    };

    onLocationSelect(location);
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Sélectionner un lieu
        </Text>
        <TouchableOpacity onPress={getCurrentLocation} style={styles.headerButton}>
          <Ionicons name="location" size={24} color={theme.colors.primary[0]} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.card }]}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Rechercher un lieu..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {loading && <ActivityIndicator size="small" color={theme.colors.primary[0]} />}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={[styles.searchResults, { backgroundColor: theme.colors.background.card }]}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={`${result.id}-${index}`}
                style={[styles.searchResultItem, { borderBottomColor: theme.colors.border.primary }]}
                onPress={() => handleLocationSelect(result)}
              >
                <Ionicons name="location" size={16} color={theme.colors.primary[0]} />
                <View style={styles.searchResultContent}>
                  <Text style={[styles.searchResultName, { color: theme.colors.text.primary }]}>
                    {result.name}
                  </Text>
                  <Text style={[styles.searchResultAddress, { color: theme.colors.text.secondary }]}>
                    {result.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Lieu sélectionné"
              description={locationName}
            />
          )}
        </MapView>
      </View>

      {/* Selected Location Info */}
      {selectedLocation && (
        <View style={[styles.locationInfo, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.locationInfoContent}>
            <Ionicons name="location" size={20} color={theme.colors.primary[0]} />
            <View style={styles.locationInfoText}>
              <Text style={[styles.locationInfoName, { color: theme.colors.text.primary }]}>
                {locationName || 'Lieu sélectionné'}
              </Text>
              <Text style={[styles.locationInfoCoords, { color: theme.colors.text.secondary }]}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={confirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  locationInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  locationInfoName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationInfoCoords: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  confirmButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapLocationPicker; 