import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store';
import PlacesVisitedManager, { PlaceVisited } from '../../components/PlacesVisitedManager';
import { tripShareApi } from '../../services/tripShareApi';

interface TripPlacesManagerScreenProps {
  navigation: any;
  route: {
    params: {
      tripId: string;
      tripTitle: string;
    };
  };
}

const TripPlacesManagerScreen: React.FC<TripPlacesManagerScreenProps> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const { tripId, tripTitle } = route.params;
  
  const [places, setPlaces] = useState<PlaceVisited[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTripPlaces();
  }, [tripId]);

  const loadTripPlaces = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter l'API pour récupérer les lieux visités
      // Pour l'instant, on utilise des données mockées
      const mockPlaces: PlaceVisited[] = [
        {
          id: '1',
          name: 'Tour Eiffel',
          description: 'Monument emblématique de Paris',
          isVisited: true,
          visitDate: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Musée du Louvre',
          description: 'Plus grand musée d\'art du monde',
          isVisited: false,
        },
        {
          id: '3',
          name: 'Arc de Triomphe',
          description: 'Monument historique sur les Champs-Élysées',
          isVisited: true,
          visitDate: '2024-01-16T14:30:00Z',
        },
      ];
      setPlaces(mockPlaces);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
      Alert.alert('Erreur', 'Impossible de charger les lieux visités');
    } finally {
      setLoading(false);
    }
  };

  const handlePlacesChange = (newPlaces: PlaceVisited[]) => {
    setPlaces(newPlaces);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Implémenter l'API pour sauvegarder les lieux visités
      console.log('Sauvegarde des lieux visités:', places);
      
      // Simulation d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Succès',
        'Les lieux visités ont été sauvegardés',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les lieux visités');
    } finally {
      setSaving(false);
    }
  };

  const getProgressStats = () => {
    const total = places.length;
    const visited = places.filter(place => place.isVisited).length;
    const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;
    return { total, visited, percentage };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[0]} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Chargement des lieux visités...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Lieux visités
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            {tripTitle}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Statistiques globales */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.background.card }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary[0] }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Lieux au total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
              {stats.visited}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Visités
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text.secondary }]}>
              {stats.percentage}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Progression
            </Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border.primary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary[0],
                width: `${stats.percentage}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Gestionnaire de lieux visités */}
      <View style={styles.content}>
        <PlacesVisitedManager
          places={places}
          onPlacesChange={handlePlacesChange}
          tripId={tripId}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
  },
});

export default TripPlacesManagerScreen; 