import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PlaceDetails } from '../../services/intelligentPlacesService';

const { width } = Dimensions.get('window');

interface CustomPlaceCreatorProps {
  visible: boolean;
  onClose: () => void;
  onPlaceCreated: (place: PlaceDetails) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

interface CustomPlaceData {
  name: string;
  description: string;
  address: string;
  category: string;
  subcategory: string;
  estimated_duration: string;
  notes: string;
  tags: string[];
  photos: string[];
  opening_hours: string;
  phone: string;
  website: string;
  price_level: number;
  personal_rating: number;
}

const CustomPlaceCreator: React.FC<CustomPlaceCreatorProps> = ({
  visible,
  onClose,
  onPlaceCreated,
  initialLocation,
}) => {
  const { theme } = useAppTheme();
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tagInput, setTagInput] = useState('');

  const [placeData, setPlaceData] = useState<CustomPlaceData>({
    name: '',
    description: '',
    address: initialLocation?.address || '',
    category: 'attraction',
    subcategory: '',
    estimated_duration: '1-2 heures',
    notes: '',
    tags: [],
    photos: [],
    opening_hours: '',
    phone: '',
    website: '',
    price_level: 1,
    personal_rating: 5,
  });

  const categories = [
    { id: 'attraction', name: 'Attraction', icon: 'camera-outline' },
    { id: 'restaurant', name: 'Restaurant', icon: 'restaurant-outline' },
    { id: 'hotel', name: 'Hébergement', icon: 'bed-outline' },
    { id: 'shopping', name: 'Shopping', icon: 'bag-outline' },
    { id: 'nature', name: 'Nature', icon: 'leaf-outline' },
    { id: 'culture', name: 'Culture', icon: 'library-outline' },
    { id: 'nightlife', name: 'Vie nocturne', icon: 'wine-outline' },
    { id: 'transport', name: 'Transport', icon: 'car-outline' },
  ];

  const durations = [
    '30 minutes',
    '1 heure',
    '1-2 heures',
    '2-3 heures',
    'Demi-journée',
    'Journée complète',
    'Plusieurs jours',
  ];

  const steps = [
    { title: 'Informations de base', icon: 'information-circle-outline' },
    { title: 'Photos', icon: 'camera-outline' },
    { title: 'Détails pratiques', icon: 'settings-outline' },
    { title: 'Finalisation', icon: 'checkmark-circle-outline' },
  ];

  const handlePhotoSelection = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos pour ajouter des images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        setUploading(true);
        const newPhotos = [...placeData.photos];
        
        for (const asset of result.assets) {
          // Simuler l'upload - en production, vous uploaderiez vers votre serveur
          await new Promise(resolve => setTimeout(resolve, 1000));
          newPhotos.push(asset.uri);
        }

        setPlaceData(prev => ({ ...prev, photos: newPhotos }));
        setUploading(false);
      }
    } catch (error) {
      console.error('Erreur sélection photo:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner les photos');
      setUploading(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre appareil photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUploading(true);
        // Simuler l'upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPlaceData(prev => ({
          ...prev,
          photos: [...prev.photos, result.assets![0].uri]
        }));
        setUploading(false);
      }
    } catch (error) {
      console.error('Erreur capture photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPlaceData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !placeData.tags.includes(tag.trim())) {
      setPlaceData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (index: number) => {
    setPlaceData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return placeData.name.trim() !== '' && placeData.description.trim() !== '';
      case 1:
        return true; // Photos optionnelles
      case 2:
        return true; // Détails optionnels
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleCreate = () => {
    if (!placeData.name.trim()) {
      Alert.alert('Erreur', 'Le nom du lieu est obligatoire');
      return;
    }

    const customPlace: PlaceDetails = {
      place_id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: placeData.name,
      display_name: `${placeData.name}, ${placeData.address}`,
      lat: initialLocation?.lat || 0,
      lng: initialLocation?.lng || 0,
      formatted_address: placeData.address,
      types: [placeData.category],
      rating: placeData.personal_rating,
      user_ratings_total: 1,
      price_level: placeData.price_level,
      photos: placeData.photos.map((uri, index) => ({
        url: uri,
        width: 800,
        height: 600,
        attribution: 'Photo personnelle'
      })),
      reviews: [],
      opening_hours: placeData.opening_hours ? {
        open_now: true,
        weekday_text: [placeData.opening_hours]
      } : undefined,
      phone: placeData.phone,
      website: placeData.website,
      category: placeData.category as any,
      subcategory: placeData.subcategory || placeData.category,
      popularity_score: 50, // Score par défaut pour les lieux personnalisés
      recommendation_reason: placeData.description,
      best_time_to_visit: ['anytime'],
      estimated_duration: placeData.estimated_duration,
      accessibility: {
        wheelchair_accessible: true,
        public_transport_nearby: true,
      },
      custom_tags: placeData.tags,
      local_insights: {
        crowd_level: 'low' as const,
        best_for: ['personal_recommendation'],
        insider_tip: placeData.notes,
      },
    };

    onPlaceCreated(customPlace);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setPlaceData({
      name: '',
      description: '',
      address: initialLocation?.address || '',
      category: 'attraction',
      subcategory: '',
      estimated_duration: '1-2 heures',
      notes: '',
      tags: [],
      photos: [],
      opening_hours: '',
      phone: '',
      website: '',
      price_level: 1,
      personal_rating: 5,
    });
    setCurrentStep(0);
    setTagInput('');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: index <= currentStep ? theme.colors.primary[0] : '#E5E5E5',
            }
          ]}>
            <Ionicons
              name={step.icon as any}
              size={16}
              color={index <= currentStep ? 'white' : theme.colors.text.secondary}
            />
          </View>
          <Text style={[
            styles.stepLabel,
            { color: index <= currentStep ? theme.colors.primary[0] : theme.colors.text.secondary }
          ]}>
            {step.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        📝 Informations de base
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Nom du lieu *
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Ex: Mon restaurant favori"
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.name}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, name: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Description *
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Décrivez ce lieu..."
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.description}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Adresse
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Adresse du lieu"
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.address}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, address: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Catégorie
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                {
                  backgroundColor: placeData.category === category.id 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: placeData.category === category.id 
                    ? theme.colors.primary[0] 
                    : theme.colors.border.primary,
                }
              ]}
              onPress={() => setPlaceData(prev => ({ ...prev, category: category.id }))}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={placeData.category === category.id ? 'white' : theme.colors.text.secondary}
              />
              <Text style={[
                styles.categoryOptionText,
                {
                  color: placeData.category === category.id 
                    ? 'white' 
                    : theme.colors.text.primary
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Durée de visite estimée
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.durationOptions}>
            {durations.map(duration => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  {
                    backgroundColor: placeData.estimated_duration === duration 
                      ? theme.colors.primary[0] 
                      : theme.colors.background.card,
                    borderColor: placeData.estimated_duration === duration 
                      ? theme.colors.primary[0] 
                      : theme.colors.border.primary,
                  }
                ]}
                onPress={() => setPlaceData(prev => ({ ...prev, estimated_duration: duration }))}
              >
                <Text style={[
                  styles.durationOptionText,
                  {
                    color: placeData.estimated_duration === duration 
                      ? 'white' 
                      : theme.colors.text.primary
                  }
                ]}>
                  {duration}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );

  const renderPhotos = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        📸 Photos du lieu
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
        Ajoutez des photos pour rendre votre lieu plus attractif (optionnel)
      </Text>

      <View style={styles.photoActions}>
        <TouchableOpacity
          style={[styles.photoActionButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleCameraCapture}
          disabled={uploading}
        >
          <Ionicons name="camera-outline" size={20} color="white" />
          <Text style={styles.photoActionText}>Prendre une photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.photoActionButton, { backgroundColor: theme.colors.background.card, borderWidth: 1, borderColor: theme.colors.border.primary }]}
          onPress={handlePhotoSelection}
          disabled={uploading}
        >
          <Ionicons name="images-outline" size={20} color={theme.colors.text.primary} />
          <Text style={[styles.photoActionText, { color: theme.colors.text.primary }]}>
            Galerie
          </Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary[0]} />
          <Text style={[styles.uploadingText, { color: theme.colors.text.secondary }]}>
            Upload en cours...
          </Text>
        </View>
      )}

      {placeData.photos.length > 0 && (
        <View style={styles.photosGrid}>
          {placeData.photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoThumbnail} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {placeData.photos.length === 0 && !uploading && (
        <View style={styles.emptyPhotos}>
          <Ionicons name="camera-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={[styles.emptyPhotosText, { color: theme.colors.text.secondary }]}>
            Aucune photo ajoutée
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderPracticalDetails = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        ⚙️ Détails pratiques
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
        Informations complémentaires (optionnelles)
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Horaires d'ouverture
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Ex: Lun-Ven: 9h-18h"
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.opening_hours}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, opening_hours: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Téléphone
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Numéro de téléphone"
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.phone}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Site web
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="https://..."
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.website}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, website: text }))}
          keyboardType="url"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Notes personnelles
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Vos conseils, astuces, impressions..."
          placeholderTextColor={theme.colors.text.secondary}
          value={placeData.notes}
          onChangeText={(text) => setPlaceData(prev => ({ ...prev, notes: text }))}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          Tags personnalisés
        </Text>
        <View style={styles.tagsContainer}>
          {placeData.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: `${theme.colors.primary[0]}20` }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
                {tag}
              </Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <Ionicons name="close" size={14} color={theme.colors.primary[0]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Ajouter un tag (appuyez sur Entrée)"
          placeholderTextColor={theme.colors.text.secondary}
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={() => {
            if (tagInput.trim()) {
              addTag(tagInput.trim());
              setTagInput('');
            }
          }}
        />
      </View>
    </ScrollView>
  );

  const renderFinalStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        ✅ Récapitulatif
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: theme.colors.background.card }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.primary[0] }]}>
          {placeData.name}
        </Text>
        
        <View style={styles.summaryRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
            {placeData.address || 'Adresse non renseignée'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
            {placeData.estimated_duration}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Ionicons name="pricetag-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
            {categories.find(c => c.id === placeData.category)?.name}
          </Text>
        </View>

        {placeData.photos.length > 0 && (
          <View style={styles.summaryRow}>
            <Ionicons name="camera-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
              {placeData.photos.length} photo{placeData.photos.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Text style={[styles.summaryDescription, { color: theme.colors.text.primary }]}>
          {placeData.description}
        </Text>

        {placeData.tags.length > 0 && (
          <View style={styles.summaryTags}>
            {placeData.tags.map((tag, index) => (
              <View key={index} style={[styles.summaryTag, { backgroundColor: `${theme.colors.primary[0]}20` }]}>
                <Text style={[styles.summaryTagText, { color: theme.colors.primary[0] }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderPhotos();
      case 2: return renderPracticalDetails();
      case 3: return renderFinalStep();
      default: return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Créer un lieu
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <View style={styles.content}>
          {renderStepContent()}
        </View>

        {/* Navigation */}
        <View style={[styles.navigation, { backgroundColor: theme.colors.background.primary }]}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton, { borderColor: theme.colors.border.primary }]}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>
                Précédent
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              { 
                backgroundColor: canProceedToNext() ? theme.colors.primary[0] : '#E5E5E5',
                opacity: canProceedToNext() ? 1 : 0.5,
              }
            ]}
            onPress={() => {
              if (currentStep === steps.length - 1) {
                handleCreate();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceedToNext()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Créer le lieu' : 'Suivant'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: '45%',
    gap: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  durationOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  photoActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  uploadingText: {
    fontSize: 14,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
    width: (width - 56) / 3,
    height: (width - 56) / 3,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyPhotos: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPhotosText: {
    fontSize: 14,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
  },
  summaryDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  summaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  summaryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomPlaceCreator;
