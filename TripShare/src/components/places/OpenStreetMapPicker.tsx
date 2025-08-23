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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { LocationSuggestion } from './LocationSearchInput';

const { width, height } = Dimensions.get('window');

interface OpenStreetMapPickerProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  onClose: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const OpenStreetMapPicker: React.FC<OpenStreetMapPickerProps> = ({
  onLocationSelect,
  onClose,
  initialLocation,
}) => {
  const { theme } = useAppTheme();
  const webViewRef = useRef<WebView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: initialLocation?.latitude || 48.8566,
    longitude: initialLocation?.longitude || 2.3522,
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
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setCurrentLocation(newLocation);
      setSelectedLocation(newLocation);
      
      // Centrer la carte sur la position actuelle
      centerMapOnLocation(newLocation.latitude, newLocation.longitude);
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Recherche pour:', query);
      
      // Essayer d'abord l'API alternative (Photon)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr&lat=46.2276&lon=2.2137&bbox=-5.0,41.0,10.0,51.0`
      );
      
      console.log('Réponse status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data.features?.length || 0, 'résultats');
        
        if (data.features && data.features.length > 0) {
          const formattedResults: LocationSuggestion[] = data.features.map((item: any, index: number) => ({
            id: `${item.properties.osm_id || index}`,
            name: item.properties.name || item.properties.street || item.properties.city,
            display_name: item.properties.display_name || item.properties.name,
            lat: String(item.geometry.coordinates[1]),
            lon: String(item.geometry.coordinates[0]),
            type: item.properties.type,
            address: {
              city: item.properties.city || item.properties.town,
              country: item.properties.country,
              state: item.properties.state,
            },
          }));
          
          setSearchResults(formattedResults);
          console.log('Suggestions mises à jour:', formattedResults.length);
        } else {
          // Fallback vers une recherche locale simple
          const fallbackResults = generateFallbackResults(query);
          setSearchResults(fallbackResults);
          console.log('Utilisation des résultats de fallback:', fallbackResults.length);
        }
      } else {
        console.error('Erreur API:', response.status, response.statusText);
        // Fallback vers une recherche locale simple
        const fallbackResults = generateFallbackResults(query);
        setSearchResults(fallbackResults);
        console.log('Utilisation des résultats de fallback après erreur:', fallbackResults.length);
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      // Fallback vers une recherche locale simple
      const fallbackResults = generateFallbackResults(query);
      setSearchResults(fallbackResults);
      console.log('Utilisation des résultats de fallback après exception:', fallbackResults.length);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de fallback avec des résultats locaux
  const generateFallbackResults = (query: string): LocationSuggestion[] => {
    const queryLower = query.toLowerCase();
    const fallbackData = [
      { name: 'Paris, France', lat: 48.8566, lon: 2.3522, country: 'France' },
      { name: 'Lyon, France', lat: 45.7578, lon: 4.8320, country: 'France' },
      { name: 'Marseille, France', lat: 43.2965, lon: 5.3698, country: 'France' },
      { name: 'Bruxelles, Belgique', lat: 50.8503, lon: 4.3517, country: 'Belgique' },
      { name: 'Amsterdam, Pays-Bas', lat: 52.3676, lon: 4.9041, country: 'Pays-Bas' },
      { name: 'Berlin, Allemagne', lat: 52.5200, lon: 13.4050, country: 'Allemagne' },
      { name: 'Rome, Italie', lat: 41.9028, lon: 12.4964, country: 'Italie' },
      { name: 'Madrid, Espagne', lat: 40.4168, lon: -3.7038, country: 'Espagne' },
      { name: 'Londres, Royaume-Uni', lat: 51.5074, lon: -0.1278, country: 'Royaume-Uni' },
      { name: 'Barcelone, Espagne', lat: 41.3851, lon: 2.1734, country: 'Espagne' },
    ];

    return fallbackData
      .filter(item => 
        item.name.toLowerCase().includes(queryLower) ||
        item.country.toLowerCase().includes(queryLower)
      )
      .map((item, index) => ({
        id: `fallback-${index}`,
        name: item.name?.split(',')[0] || item.name || 'Lieu inconnu',
        display_name: item.name || 'Lieu inconnu',
        lat: String(item.lat),
        lon: String(item.lon),
        type: 'city',
        address: {
          city: item.name?.split(',')[0] || item.name || 'Ville inconnue',
          country: item.country || 'Pays inconnu',
          state: '',
        },
      }))
      .slice(0, 5);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Debounce pour éviter trop de requêtes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(text);
    }, 300);
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

    setLocationName(locationName);
    setSearchQuery('');
    setSearchResults([]);
    
    // Centrer la carte sur le lieu sélectionné
    centerMapOnLocation(parseFloat(location.lat), parseFloat(location.lon));
  };

  const centerMapOnLocation = (lat: number, lng: number) => {
    const script = `
      if (typeof window.centerMap === 'function') {
        window.centerMap(${lat}, ${lng});
      } else {
        map.setView([${lat}, ${lng}], 15);
        if (marker) {
          marker.setLatLng([${lat}, ${lng}]);
        } else {
          marker = L.marker([${lat}, ${lng}]).addTo(map);
        }
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ latitude: lat, longitude: lng });
    reverseGeocode(lat, lng);
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
      Alert.alert('Erreur', 'Aucun lieu sélectionné');
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

  // HTML pour la carte OpenStreetMap
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${currentLocation.latitude}, ${currentLocation.longitude}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        var marker = L.marker([${currentLocation.latitude}, ${currentLocation.longitude}]).addTo(map);
        
        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng([lat, lng]);
          
          // Envoyer les coordonnées à React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            latitude: lat,
            longitude: lng
          }));
        });
        
        // Fonction pour centrer la carte
        window.centerMap = function(lat, lng) {
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
        };
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        handleMapClick(data.latitude, data.longitude);
      }
    } catch (error) {
      console.error('Erreur parsing message:', error);
    }
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
        {(searchResults.length > 0 || loading) && (
          <ScrollView style={[styles.searchResults, { backgroundColor: theme.colors.background.card }]}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary[0]} />
                <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                  Recherche en cours...
                </Text>
              </View>
            ) : (
              searchResults.map((result, index) => (
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
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[0]} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                Chargement de la carte...
              </Text>
            </View>
          )}
        />
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
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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

export default OpenStreetMapPicker; 