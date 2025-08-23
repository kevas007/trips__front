import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
export interface PlaceVisited {
  id: string;
  name: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isVisited: boolean;
  visitDate?: string;
  rating?: number;
  photos?: string[];
  notes?: string;
}

interface PlacesVisitedManagerProps {
  places: PlaceVisited[];
  onPlacesChange: (places: PlaceVisited[]) => void;
  tripId?: string;
}

const PlacesVisitedManager: React.FC<PlacesVisitedManagerProps> = ({
  places,
  onPlacesChange,
  tripId,
}) => {
  const { theme } = useAppTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    address: '',
  });

  const addPlace = () => {
    if (!newPlace.name.trim()) {
      Alert.alert('Erreur', 'Le nom du lieu est requis');
      return;
    }

    const place: PlaceVisited = {
      id: Date.now().toString(),
      name: newPlace.name.trim(),
      description: newPlace.description.trim() || undefined,
      location: newPlace.address ? {
        latitude: 0, // À récupérer via géocodage
        longitude: 0,
        address: newPlace.address,
      } : undefined,
      isVisited: false,
    };

    onPlacesChange([...places, place]);
    setNewPlace({ name: '', description: '', address: '' });
    setShowAddModal(false);
  };

  const toggleVisited = (placeId: string) => {
    const updatedPlaces = places.map(place =>
      place.id === placeId
        ? { ...place, isVisited: !place.isVisited, visitDate: !place.isVisited ? new Date().toISOString() : undefined }
        : place
    );
    onPlacesChange(updatedPlaces);
  };

  const removePlace = (placeId: string) => {
    Alert.alert(
      'Supprimer le lieu',
      'Êtes-vous sûr de vouloir supprimer ce lieu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedPlaces = places.filter(place => place.id !== placeId);
            onPlacesChange(updatedPlaces);
          },
        },
      ]
    );
  };

  const getProgressStats = () => {
    const total = places.length;
    const visited = places.filter(place => place.isVisited).length;
    const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;
    return { total, visited, percentage };
  };

  const stats = getProgressStats();

  return (
    <View style={styles.container}>
      {/* Header avec statistiques */}
      <View style={[styles.header, { backgroundColor: theme.colors.background.card }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={24} color={theme.colors.primary[0]} />
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Lieux à visiter
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Barre de progression */}
      {places.length > 0 && (
        <View style={[styles.progressContainer, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
              Progression: {stats.visited}/{stats.total} lieux visités
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.colors.primary[0] }]}>
              {stats.percentage}%
            </Text>
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
      )}

      {/* Liste des lieux */}
      <ScrollView style={styles.placesList} showsVerticalScrollIndicator={false}>
        {places.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              Aucun lieu ajouté
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text.secondary }]}>
              Ajoutez les lieux que vous souhaitez visiter
            </Text>
          </View>
        ) : (
          places.map((place) => (
            <View
              key={place.id}
              style={[
                styles.placeCard,
                {
                  backgroundColor: theme.colors.background.card,
                  borderColor: place.isVisited ? theme.colors.success : theme.colors.border.primary,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.placeContent}
                onPress={() => toggleVisited(place.id)}
              >
                <View style={styles.placeInfo}>
                  <View style={styles.placeHeader}>
                    <Ionicons
                      name={place.isVisited ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={place.isVisited ? theme.colors.success : theme.colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.placeName,
                        {
                          color: theme.colors.text.primary,
                          textDecorationLine: place.isVisited ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {place.name}
                    </Text>
                  </View>
                  {place.description && (
                    <Text style={[styles.placeDescription, { color: theme.colors.text.secondary }]}>
                      {place.description}
                    </Text>
                  )}
                  {place.location?.address && (
                    <Text style={[styles.placeAddress, { color: theme.colors.text.secondary }]}>
                      📍 {place.location.address}
                    </Text>
                  )}
                  {place.isVisited && place.visitDate && (
                    <Text style={[styles.visitDate, { color: theme.colors.success }]}>
                      ✅ Visité le {new Date(place.visitDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlace(place.id)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal d'ajout de lieu */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border.primary }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Ajouter un lieu
            </Text>
            <TouchableOpacity onPress={addPlace}>
              <Text style={[styles.modalSave, { color: theme.colors.primary[0] }]}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                Nom du lieu *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  },
                ]}
                value={newPlace.name}
                onChangeText={(text) => setNewPlace(prev => ({ ...prev, name: text }))}
                placeholder="Ex: Tour Eiffel, Musée du Louvre..."
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                Description (optionnel)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  },
                ]}
                value={newPlace.description}
                onChangeText={(text) => setNewPlace(prev => ({ ...prev, description: text }))}
                placeholder="Pourquoi visiter ce lieu ?"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                Adresse (optionnel)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  },
                ]}
                value={newPlace.address}
                onChangeText={(text) => setNewPlace(prev => ({ ...prev, address: text }))}
                placeholder="Ex: 1 Avenue des Champs-Élysées, Paris"
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  placesList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  placeContent: {
    flex: 1,
  },
  placeInfo: {
    flex: 1,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  placeDescription: {
    fontSize: 14,
    marginLeft: 32,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 12,
    marginLeft: 32,
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 12,
    marginLeft: 32,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

export default PlacesVisitedManager; 