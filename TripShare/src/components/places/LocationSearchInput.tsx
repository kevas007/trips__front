import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import OpenStreetMapPicker from './OpenStreetMapPicker';

export interface LocationSuggestion {
  id: string;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    city?: string;
    country?: string;
    state?: string;
  };
}

interface LocationSearchInputProps {
  value: string;
  onLocationSelect: (location: LocationSuggestion) => void;
  placeholder?: string;
  style?: any;
  citiesOnly?: boolean;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  value,
  onLocationSelect,
  placeholder = "Rechercher un lieu...",
  style,
  citiesOnly = false,
}) => {
  const { theme } = useAppTheme();
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setSearchText(value);
    // Si la valeur change de l'extérieur, fermer les suggestions
    if (value !== searchText) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [value]);

  // Fonction pour filtrer les villes uniquement
  const filterCitiesOnly = (suggestions: LocationSuggestion[]): LocationSuggestion[] => {
    if (!citiesOnly) return suggestions;
    
    return suggestions.filter(suggestion => {
      const name = suggestion.name.toLowerCase();
      const displayName = suggestion.display_name.toLowerCase();
      
      // Exclure les rues, routes, avenues, etc.
      const streetKeywords = [
        'rue', 'street', 'avenue', 'boulevard', 'place', 'square', 'lane', 'road', 'drive', 'way',
        'straat', 'gasse', 'via', 'calle', 'callejón', 'strada', 'via', 'ulica', 'ulitsa'
      ];
      const hasStreetKeyword = streetKeywords.some(keyword => 
        name.includes(keyword) || displayName.includes(keyword)
      );
      
      // Exclure les numéros de rue
      const hasStreetNumber = /\d+/.test(name);
      
      // Exclure les préfixes de rue
      const streetPrefixes = [
        /^(rue|street|avenue|boulevard|place)\s+(de|of|du|des|d'|d')/i,
        /^(straat|gasse|via|calle|strada|ulica|ulitsa)\s+(van|von|di|del|della|delle)/i
      ];
      const hasStreetPrefix = streetPrefixes.some(regex => 
        regex.test(name) || regex.test(displayName)
      );
      
      // Si c'est clairement une rue, l'exclure
      if (hasStreetKeyword || hasStreetNumber || hasStreetPrefix) {
        return false;
      }
      
      // Inclure les villes, pays, régions, départements
      const cityKeywords = [
        'ville', 'city', 'town', 'village', 'municipality', 'district', 'region', 'country',
        'stad', 'stadt', 'ciudad', 'città', 'miasto', 'город', '市', '市', 'شهر'
      ];
      const hasCityKeyword = cityKeywords.some(keyword => 
        name.includes(keyword) || displayName.includes(keyword)
      );
      
      // Si c'est explicitement une ville, l'inclure
      if (hasCityKeyword) return true;
      
      // Pour les autres cas, vérifier si c'est probablement une ville
      // (pas de caractères typiques des adresses)
      const hasAddressPattern = /^\d+\s+[a-z]+\s+(rue|street|avenue|boulevard)/i.test(name);
      
      return !hasAddressPattern;
    });
  };

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Recherche pour:', query);
      
      // 1. Essayer d'abord la recherche locale (lieux populaires)
      const localResults = searchLocalPlaces(query);
      if (localResults.length > 0) {
        console.log('✅ Résultats locaux trouvés:', localResults.length);
        const filteredLocalResults = filterCitiesOnly(localResults);
        setSuggestions(filteredLocalResults);
        setLoading(false);
        return;
      }
      
      // 2. Essayer l'API Photon (Komoot) - meilleure pour les adresses
      const photonResults = await searchPhotonAPI(query);
      if (photonResults.length > 0) {
        console.log('✅ Résultats Photon trouvés:', photonResults.length);
        const filteredPhotonResults = filterCitiesOnly(photonResults);
        setSuggestions(filteredPhotonResults);
        setLoading(false);
        return;
      }
      
      // 3. Essayer l'API Nominatim (OpenStreetMap) - meilleure pour les POI
      const nominatimResults = await searchNominatimAPI(query);
      if (nominatimResults.length > 0) {
        console.log('✅ Résultats Nominatim trouvés:', nominatimResults.length);
        const filteredNominatimResults = filterCitiesOnly(nominatimResults);
        setSuggestions(filteredNominatimResults);
        setLoading(false);
        return;
      }
      
      // 4. Fallback vers les résultats de base
      const fallbackResults = generateFallbackResults(query);
      const filteredFallbackResults = filterCitiesOnly(fallbackResults);
      setSuggestions(filteredFallbackResults);
      console.log('⚠️ Utilisation des résultats de fallback:', filteredFallbackResults.length);
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      const fallbackResults = generateFallbackResults(query);
      const filteredFallbackResults = filterCitiesOnly(fallbackResults);
      setSuggestions(filteredFallbackResults);
    } finally {
      setLoading(false);
    }
  };

  // Recherche dans la base locale de lieux populaires
  const searchLocalPlaces = (query: string): LocationSuggestion[] => {
    const queryLower = query.toLowerCase();
    
    // Base de données locale de lieux populaires
    const localPlaces = [
      // Bruxelles
      {
        name: "Maison Dandoy",
        display_name: "Maison Dandoy, Rue Charles Buls 14, 1000 Bruxelles, Belgique",
        lat: 50.8476,
        lon: 4.3522,
        type: "shop",
        city: "Bruxelles",
        country: "Belgique",
        address: "Rue Charles Buls 14, 1000 Bruxelles"
      },
      {
        name: "Grand Place de Bruxelles",
        display_name: "Grand Place, 1000 Bruxelles, Belgique",
        lat: 50.8467,
        lon: 4.3525,
        type: "tourism",
        city: "Bruxelles",
        country: "Belgique",
        address: "Grand Place, 1000 Bruxelles"
      },
      {
        name: "Manneken Pis",
        display_name: "Manneken Pis, Rue de l'Étuve 31, 1000 Bruxelles, Belgique",
        lat: 50.8449,
        lon: 4.3499,
        type: "tourism",
        city: "Bruxelles",
        country: "Belgique",
        address: "Rue de l'Étuve 31, 1000 Bruxelles"
      },
      {
        name: "Atomium",
        display_name: "Atomium, Square de l'Atomium, 1020 Bruxelles, Belgique",
        lat: 50.8949,
        lon: 4.3414,
        type: "tourism",
        city: "Bruxelles",
        country: "Belgique",
        address: "Square de l'Atomium, 1020 Bruxelles"
      },
      
      // Paris
      {
        name: "Tour Eiffel",
        display_name: "Tour Eiffel, Champ de Mars, 75007 Paris, France",
        lat: 48.8584,
        lon: 2.2945,
        type: "tourism",
        city: "Paris",
        country: "France",
        address: "Champ de Mars, 75007 Paris"
      },
      {
        name: "Musée du Louvre",
        display_name: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
        lat: 48.8606,
        lon: 2.3376,
        type: "tourism",
        city: "Paris",
        country: "France",
        address: "Rue de Rivoli, 75001 Paris"
      },
      {
        name: "Arc de Triomphe",
        display_name: "Arc de Triomphe, Place Charles de Gaulle, 75008 Paris, France",
        lat: 48.8738,
        lon: 2.2950,
        type: "tourism",
        city: "Paris",
        country: "France",
        address: "Place Charles de Gaulle, 75008 Paris"
      },
      
      // Barcelone
      {
        name: "Sagrada Familia",
        display_name: "Sagrada Familia, Carrer de Mallorca, 401, 08013 Barcelona, Espagne",
        lat: 41.4036,
        lon: 2.1744,
        type: "tourism",
        city: "Barcelone",
        country: "Espagne",
        address: "Carrer de Mallorca, 401, 08013 Barcelona"
      },
      {
        name: "Parc Güell",
        display_name: "Parc Güell, 08024 Barcelona, Espagne",
        lat: 41.4145,
        lon: 2.1527,
        type: "tourism",
        city: "Barcelone",
        country: "Espagne",
        address: "08024 Barcelona"
      },
      
      // Londres
      {
        name: "Big Ben",
        display_name: "Big Ben, Westminster, London SW1A 0AA, Royaume-Uni",
        lat: 51.4994,
        lon: -0.1245,
        type: "tourism",
        city: "Londres",
        country: "Royaume-Uni",
        address: "Westminster, London SW1A 0AA"
      },
      {
        name: "Tower Bridge",
        display_name: "Tower Bridge, London SE1 2UP, Royaume-Uni",
        lat: 51.5055,
        lon: -0.0754,
        type: "tourism",
        city: "Londres",
        country: "Royaume-Uni",
        address: "London SE1 2UP"
      },
      
      // Rome
      {
        name: "Colisée",
        display_name: "Colisée, Piazza del Colosseo, 1, 00184 Roma RM, Italie",
        lat: 41.8902,
        lon: 12.4922,
        type: "tourism",
        city: "Rome",
        country: "Italie",
        address: "Piazza del Colosseo, 1, 00184 Roma RM"
      },
      {
        name: "Fontaine de Trevi",
        display_name: "Fontaine de Trevi, Piazza di Trevi, 00187 Roma RM, Italie",
        lat: 41.9009,
        lon: 12.4833,
        type: "tourism",
        city: "Rome",
        country: "Italie",
        address: "Piazza di Trevi, 00187 Roma RM"
      },
      
      // Amsterdam
      {
        name: "Maison d'Anne Frank",
        display_name: "Maison d'Anne Frank, Westermarkt 20, 1016 DK Amsterdam, Pays-Bas",
        lat: 52.3752,
        lon: 4.8840,
        type: "tourism",
        city: "Amsterdam",
        country: "Pays-Bas",
        address: "Westermarkt 20, 1016 DK Amsterdam"
      },
      
      // Berlin
      {
        name: "Porte de Brandebourg",
        display_name: "Porte de Brandebourg, Pariser Platz, 10117 Berlin, Allemagne",
        lat: 52.5163,
        lon: 13.3777,
        type: "tourism",
        city: "Berlin",
        country: "Allemagne",
        address: "Pariser Platz, 10117 Berlin"
      },
      
      // Madrid
      {
        name: "Plaza Mayor",
        display_name: "Plaza Mayor, 28012 Madrid, Espagne",
        lat: 40.4155,
        lon: -3.7074,
        type: "tourism",
        city: "Madrid",
        country: "Espagne",
        address: "28012 Madrid"
      },
      
      // Tokyo
      {
        name: "Temple Senso-ji",
        display_name: "Temple Senso-ji, 2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japon",
        lat: 35.7148,
        lon: 139.7967,
        type: "tourism",
        city: "Tokyo",
        country: "Japon",
        address: "2-3-1 Asakusa, Taito City, Tokyo 111-0032"
      },
      
      // New York
      {
        name: "Times Square",
        display_name: "Times Square, Manhattan, NY 10036, États-Unis",
        lat: 40.7580,
        lon: -73.9855,
        type: "tourism",
        city: "New York",
        country: "États-Unis",
        address: "Manhattan, NY 10036"
      },
      {
        name: "Statue de la Liberté",
        display_name: "Statue de la Liberté, Liberty Island, New York, NY 10004, États-Unis",
        lat: 40.6892,
        lon: -74.0445,
        type: "tourism",
        city: "New York",
        country: "États-Unis",
        address: "Liberty Island, New York, NY 10004"
      }
    ];

    return localPlaces
      .filter(place => 
        place.name.toLowerCase().includes(queryLower) ||
        place.display_name.toLowerCase().includes(queryLower) ||
        place.address.toLowerCase().includes(queryLower) ||
        place.city.toLowerCase().includes(queryLower)
      )
      .map((place, index) => ({
        id: `local-${index}`,
        name: place.name,
        display_name: place.display_name,
        lat: String(place.lat),
        lon: String(place.lon),
        type: place.type,
        address: {
          city: place.city,
          country: place.country,
          state: '',
        },
      }))
      .slice(0, 5);
  };

  // Recherche via l'API Photon (Komoot)
  const searchPhotonAPI = async (query: string): Promise<LocationSuggestion[]> => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr&lat=46.2276&lon=2.2137&bbox=-5.0,41.0,10.0,51.0`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          return data.features.map((item: any, index: number) => {
            // Photon utilise [lon, lat] format, on doit inverser
            const coordinates = item.geometry.coordinates;
            const lat = String(coordinates[1]); // Latitude
            const lon = String(coordinates[0]); // Longitude
            
            return {
              id: `photon-${item.properties.osm_id || index}`,
              name: item.properties.name || item.properties.street || item.properties.city,
              display_name: item.properties.display_name || item.properties.name,
              lat: lat,
              lon: lon,
              type: item.properties.type || 'place',
              address: {
                city: item.properties.city || item.properties.town,
                country: item.properties.country,
                state: item.properties.state,
              },
            };
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur API Photon:', error);
    }
    
    return [];
  };

  // Recherche via l'API Nominatim (OpenStreetMap)
  const searchNominatimAPI = async (query: string): Promise<LocationSuggestion[]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=fr`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          return data.map((item: any, index: number) => ({
            id: `nominatim-${item.place_id || index}`,
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
        }
      }
    } catch (error) {
      console.error('❌ Erreur API Nominatim:', error);
    }
    
    return [];
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
    setSearchText(text);
    
    // Ne pas déclencher de recherche si on est en train de sélectionner
    if (isSelecting) {
      return;
    }
    
    // Ne pas afficher les suggestions si le texte est vide
    if (!text.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }
    
    setShowSuggestions(true);
    
    // Debounce pour éviter trop de requêtes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    console.log('📍 Lieu sélectionné:', location);
    console.log('📍 Coordonnées:', location.lat, location.lon);
    
    // Marquer qu'on est en train de sélectionner
    setIsSelecting(true);
    
    // Annuler le timeout de recherche en cours
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setSearchText(location.display_name);
    setShowSuggestions(false);
    setSuggestions([]); // Vider les suggestions
    onLocationSelect(location);
    
    // Réinitialiser l'état de sélection après un court délai
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleMapSearch = () => {
    setShowMapModal(true);
  };

  const getLocationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'tourism':
        return 'camera';
      case 'amenity':
        return 'business';
      case 'historic':
        return 'library';
      case 'leisure':
        return 'leaf';
      case 'shop':
        return 'cart';
      case 'restaurant':
        return 'restaurant';
      default:
        return 'location';
    }
  };

  const renderSuggestion = ({ item }: { item: LocationSuggestion }) => {
    // Déterminer la source de la suggestion
    const getSourceInfo = () => {
      if (item.id.startsWith('local-')) {
        return { name: 'Base locale', color: '#4CAF50', icon: 'star' };
      } else if (item.id.startsWith('photon-')) {
        return { name: 'Photon', color: '#2196F3', icon: 'location' };
      } else if (item.id.startsWith('nominatim-')) {
        return { name: 'OpenStreetMap', color: '#FF9800', icon: 'map' };
      } else {
        return { name: 'Fallback', color: '#9E9E9E', icon: 'help-circle' };
      }
    };

    const sourceInfo = getSourceInfo();

    return (
      <TouchableOpacity
        style={[styles.suggestionItem, { backgroundColor: theme.colors.background.card }]}
        onPress={() => handleLocationSelect(item)}
      >
        <View style={styles.suggestionIcon}>
          <Ionicons 
            name={getLocationIcon(item.type)} 
            size={20} 
            color={theme.colors.primary[0]} 
          />
        </View>
        <View style={styles.suggestionContent}>
          <View style={styles.suggestionHeader}>
            <Text style={[styles.suggestionName, { color: theme.colors.text.primary }]}>
              {item.name}
            </Text>
            <View style={[styles.sourceBadge, { backgroundColor: sourceInfo.color }]}>
              <Ionicons name={sourceInfo.icon as any} size={12} color="white" />
              <Text style={styles.sourceText}>{sourceInfo.name}</Text>
            </View>
          </View>
          <Text style={[styles.suggestionAddress, { color: theme.colors.text.secondary }]}>
            {item.display_name}
          </Text>
          {item.address.city && (
            <Text style={[styles.suggestionCity, { color: theme.colors.text.secondary }]}>
              📍 {item.address.city}{item.address.country ? `, ${item.address.country}` : ''}
            </Text>
          )}
        </View>
        <View style={styles.suggestionCoordinates}>
          <View style={[styles.coordinatesContainer, { backgroundColor: theme.colors.primary[0] + '10' }]}>
            <Ionicons name="location" size={12} color={theme.colors.primary[0]} />
            <Text style={[styles.coordinatesText, { color: theme.colors.primary[0] }]}>
              {parseFloat(item.lat).toFixed(4)}
            </Text>
            <Text style={[styles.coordinatesText, { color: theme.colors.primary[0] }]}>
              {parseFloat(item.lon).toFixed(4)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.card }]}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.background.card,
            },
          ]}
          value={searchText}
          onChangeText={handleSearchChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          onFocus={() => setShowSuggestions(true)}
        />
        
        <View style={styles.inputActions}>
          {loading && (
            <ActivityIndicator size="small" color={theme.colors.primary[0]} />
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={handleMapSearch}
          >
            <Ionicons name="map" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={() => setShowSuggestions(!showSuggestions)}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestions */}
      {(showSuggestions || searchText.length > 0) && (suggestions.length > 0 || loading) && (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.background.card }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[0]} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                Recherche en cours...
              </Text>
            </View>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={renderSuggestion}
              style={[styles.suggestionsList, { maxHeight: 300 }]}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      )}

      {/* Modal pour la recherche sur carte */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapModal(false)}
      >
        <OpenStreetMapPicker
          onLocationSelect={(location: LocationSuggestion) => {
            handleLocationSelect(location);
            setShowMapModal(false);
          }}
          onClose={() => setShowMapModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 52,
    color: '#2c3e50',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#008080',
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 320,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    marginTop: 6,
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 320,
    borderRadius: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  suggestionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
    color: '#2c3e50',
  },
  suggestionAddress: {
    fontSize: 14,
    marginBottom: 2,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  suggestionCity: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
  },
  suggestionCoordinates: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  coordinatesContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  coordinatesText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  sourceText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
});

export default LocationSearchInput; 