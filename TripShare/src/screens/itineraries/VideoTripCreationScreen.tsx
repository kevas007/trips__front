import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { unifiedTripService } from '../../services/unifiedTripService';
import { useGlobalRefresh } from '../../hooks/useGlobalRefresh';
import LocationSearchInput, { LocationSuggestion } from '../../components/places/LocationSearchInput';

const { width } = Dimensions.get('window');

interface VideoTripCreationScreenProps {
  navigation: any;
}

interface TripData {
  title: string;
  description: string;
  destination: string;
  photos: string[];
  budget: string;
  isPublic: boolean;
}

const VideoTripCreationScreen: React.FC<VideoTripCreationScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { triggerGlobalRefresh } = useGlobalRefresh();
  
  const [isCreating, setIsCreating] = useState(false);
  const [tripData, setTripData] = useState<TripData>({
    title: '',
    description: '',
    destination: '',
    photos: [],
    budget: '',
    isPublic: true,
  });

  // Gestion des photos
  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setTripData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 5)
      }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setTripData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri].slice(0, 5)
      }));
    }
  };

  const removePhoto = (index: number) => {
    setTripData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setTripData(prev => ({
      ...prev,
      destination: suggestion.display_name || suggestion.name || ''
    }));
  };

  const createTrip = async () => {
    try {
      setIsCreating(true);
      
      // Validation des champs obligatoires
      if (!tripData.title.trim()) {
        Alert.alert('Erreur', 'Le titre du voyage est requis');
        return;
      }
      
      if (!tripData.destination.trim()) {
        Alert.alert('Erreur', 'La destination est requise');
        return;
      }

      if (!tripData.budget || tripData.budget.trim() === '') {
        Alert.alert('Erreur', 'Le budget est requis');
        return;
      }

      const budgetValue = parseFloat(tripData.budget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        Alert.alert('Erreur', 'Veuillez entrer un montant valide pour le budget');
        return;
      }

      // Préparer les données pour la création
      const tripPayload = {
        title: tripData.title,
        description: tripData.description || `Voyage à ${tripData.destination}`,
        destination: tripData.destination,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
        duration: '7 jours',
        budget: budgetValue.toString(),
        status: 'completed' as const,
        isPublic: tripData.isPublic,
        photos: tripData.photos.length > 0 ? tripData.photos : ['http://localhost:8085/storage/tripshare-uploads/defaults/default-trip-image.jpg'],
        difficulty: 'easy',
        tags: ['🎥 Vidéo Demo'],
        places: [],
      };

      console.log('🚀 Création du voyage pour la vidéo:', tripPayload);
      
      const result = await unifiedTripService.createTrip(tripPayload);
      
      console.log('✅ Voyage créé avec succès:', result);
      
      // Vérifier que le voyage a été créé avec succès
      if (!result || typeof result !== 'object' || Array.isArray(result) || result.status === 'error' || !result.id) {
        console.error('❌ Réponse invalide du service:', result);
        throw new Error(result?.message || 'Erreur lors de la création du voyage');
      }
      
      Alert.alert(
        '🎉 Voyage créé !', 
        'Votre voyage a été créé avec succès pour la démonstration vidéo !',
        [
          {
            text: 'Voir le voyage',
            onPress: () => {
              triggerGlobalRefresh();
              navigation.navigate('TripDetails', { id: result.id });
            }
          },
          {
            text: 'Créer un autre',
            onPress: () => {
              setTripData({
                title: '',
                description: '',
                destination: '',
                photos: [],
                budget: '',
                isPublic: true,
              });
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      
      // Vérifier si c'est une erreur de modération d'image
      if (error?.message && error.message.includes('🚫 Image refusée')) {
        Alert.alert(
          '🚫 Image inappropriée détectée',
          'Une ou plusieurs images ont été refusées par notre système de modération. Veuillez choisir d\'autres images et réessayer.',
          [
            {
              text: 'Changer les images',
              onPress: () => {
                // Garder les données dans les inputs mais vider les photos
                setTripData(prev => ({
                  ...prev,
                  photos: []
                }));
              }
            },
            {
              text: 'Annuler',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de créer le voyage. Veuillez réessayer.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              🎥 Création Vidéo
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Contenu principal */}
          <View style={styles.content}>
            {/* Titre */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Titre du voyage
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.primary
                }]}
                placeholder="Ex: Week-end à Paris"
                placeholderTextColor={theme.colors.text.secondary}
                value={tripData.title}
                onChangeText={(text) => setTripData(prev => ({ ...prev, title: text }))}
              />
            </View>

            {/* Destination */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Destination
              </Text>
                          <LocationSearchInput
              placeholder="Rechercher une destination..."
              onLocationSelect={handleLocationSelect}
              value={tripData.destination}
            />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Description (optionnel)
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.primary
                }]}
                placeholder="Décrivez votre voyage..."
                placeholderTextColor={theme.colors.text.secondary}
                value={tripData.description}
                onChangeText={(text) => setTripData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Budget */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Budget (€)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.primary
                }]}
                placeholder="Ex: 500"
                placeholderTextColor={theme.colors.text.secondary}
                value={tripData.budget}
                onChangeText={(text) => setTripData(prev => ({ ...prev, budget: text }))}
                keyboardType="numeric"
              />
            </View>

            {/* Photos */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Photos (optionnel)
              </Text>
              
              {/* Boutons d'ajout de photos */}
              <View style={styles.photoButtons}>
                <TouchableOpacity 
                  style={[styles.photoButton, { backgroundColor: theme.colors.primary[0] }]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.photoButton, { backgroundColor: theme.colors.primary[1] }]}
                  onPress={pickPhotos}
                >
                  <Ionicons name="images" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Galerie</Text>
                </TouchableOpacity>
              </View>

              {/* Aperçu des photos */}
              {tripData.photos.length > 0 && (
                <View style={styles.photoGrid}>
                  {tripData.photos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo }} style={styles.photoPreview} />
                      <TouchableOpacity 
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Visibilité */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Visibilité
              </Text>
              <View style={styles.visibilityButtons}>
                <TouchableOpacity 
                  style={[
                    styles.visibilityButton,
                    tripData.isPublic && { backgroundColor: theme.colors.primary[0] }
                  ]}
                  onPress={() => setTripData(prev => ({ ...prev, isPublic: true }))}
                >
                  <Ionicons 
                    name="globe" 
                    size={16} 
                    color={tripData.isPublic ? "white" : theme.colors.text.secondary} 
                  />
                  <Text style={[
                    styles.visibilityButtonText,
                    tripData.isPublic && { color: "white" }
                  ]}>
                    Public
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.visibilityButton,
                    !tripData.isPublic && { backgroundColor: theme.colors.primary[0] }
                  ]}
                  onPress={() => setTripData(prev => ({ ...prev, isPublic: false }))}
                >
                  <Ionicons 
                    name="lock-closed" 
                    size={16} 
                    color={!tripData.isPublic ? "white" : theme.colors.text.secondary} 
                  />
                  <Text style={[
                    styles.visibilityButtonText,
                    !tripData.isPublic && { color: "white" }
                  ]}>
                    Privé
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton de création */}
            <TouchableOpacity 
              style={[
                styles.createButton,
                { backgroundColor: theme.colors.primary[0] },
                isCreating && { opacity: 0.7 }
              ]}
              onPress={createTrip}
              disabled={isCreating}
            >
              {isCreating ? (
                <Text style={styles.createButtonText}>Création en cours...</Text>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.createButtonText}>Créer le voyage</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    position: 'relative',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoTripCreationScreen;
