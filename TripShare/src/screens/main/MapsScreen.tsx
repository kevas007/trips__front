import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleMapView from '../../components/places/SimpleMapView';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../store';
import AppBackground from '../../components/ui/AppBackground';

const MOCK_ITINERARIES = [
  {
    id: '1',
    title: 'Roadtrip Alpes',
    location: {
      coordinates: {
        latitude: 45.9237,
        longitude: 6.8694,
      }
    },
    status: 'fait',
  },
  {
    id: '2',
    title: 'Séjour à Rome',
    location: {
      coordinates: {
        latitude: 41.9028,
        longitude: 12.4964,
      }
    },
    status: 'a_faire',
  },
  {
    id: '3',
    title: 'Surf au Portugal',
    location: {
      coordinates: {
        latitude: 39.3999,
        longitude: -8.2245,
      }
    },
    status: 'favori',
  },
];

type FilterIcon = 'list-outline' | 'time-outline' | 'checkmark-done-outline' | 'star-outline';

const FILTERS: { key: string; label: string; icon: FilterIcon }[] = [
  { key: 'tous', label: 'Tous', icon: 'list-outline' },
  { key: 'a_faire', label: 'À faire', icon: 'time-outline' },
  { key: 'fait', label: 'Déjà fait', icon: 'checkmark-done-outline' },
  { key: 'favori', label: 'Favoris', icon: 'star-outline' },
];

const MapsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('tous');
  const { trips, loading, loadTrips } = useTripStore();
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        console.log('🗺️ Tentative de récupération des voyages publics depuis l\'API...');
        await loadTrips(true);
        console.log('✅ Voyages publics récupérés:', trips.length);
        setUseMockData(false);
      } catch (error) {
        console.log('❌ Erreur API, utilisation des données mockées:', error);
        setUseMockData(true);
        
        // Afficher un message informatif
        if (error instanceof Error) {
          if (error.message.includes('500')) {
            Alert.alert(
              'Service temporairement indisponible',
              'Affichage des exemples de voyages.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    };
    fetchTrips();
  }, []);

  // Filtrage par statut si disponible (à adapter selon le modèle Trip)
  const filteredTrips = selectedFilter === 'tous'
    ? trips
    : trips.filter(t => t.status === selectedFilter);

  // Extraction coordonnées (à adapter selon le modèle Trip/location)
  const firstTrip = filteredTrips.find(t => t.location && t.location.coordinates);
  const latitude = firstTrip?.location?.coordinates?.latitude || 46.2276; // France par défaut
  const longitude = firstTrip?.location?.coordinates?.longitude || 2.2137;
  const title = firstTrip?.title || 'Carte des voyages';

  return (
    <AppBackground>
      {/* Filtres en haut */}
      <View style={styles.filtersBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, selectedFilter === f.key && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f.key)}
          >
            <Ionicons name={f.icon} size={16} color={selectedFilter === f.key ? 'white' : '#008080'} />
            <Text style={selectedFilter === f.key ? styles.filterChipTextActive : styles.filterChipText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Indicateur de données mockées */}
      {useMockData && (
        <View style={styles.mockIndicator}>
          <Ionicons name="information-circle-outline" size={16} color="#FF9800" />
          <Text style={styles.mockText}>Exemples de voyages</Text>
        </View>
      )}
      
      {/* Carte OpenStreetMap occupe tout l'espace restant */}
      <View style={styles.mapContainer}>
        <SimpleMapView
          latitude={latitude}
          longitude={longitude}
          title={title}
        />
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  filtersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 48,
    backgroundColor: '#FAFAFA',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#008080',
  },
  filterChipText: {
    color: '#008080',
    fontWeight: '600',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  mockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  mockText: {
    marginLeft: 8,
    color: '#E65100',
    fontSize: 12,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Supprimer le fond blanc
  },
});

export default MapsScreen; 