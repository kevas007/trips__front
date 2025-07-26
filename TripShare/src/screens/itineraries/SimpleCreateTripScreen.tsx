import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { tripShareApi } from '../../services/tripShareApi';
import LocationSearchInput, { LocationSuggestion } from '../../components/places/LocationSearchInput';

const { width } = Dimensions.get('window');

interface SimpleCreateTripScreenProps {
  navigation: any;
}

interface TripData {
  title: string;
  description: string;
  destination: string;
  photos: string[];
  duration: string;
  budget: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  status: string; // ✅ NOUVEAU CHAMP - Statut sélectionné par l'utilisateur
  difficulty: string; // ✅ NOUVEAU CHAMP
  tags: string[];
  places: Place[];
  // ✅ NOUVEAUX CHAMPS POUR LA LOCALISATION
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface Place {
  id: string;
  name: string;
  description?: string;
  address?: string;
  isVisited: boolean;
  visitDate?: string;
  photos: string[];
  notes?: string;
}

const SimpleCreateTripScreen: React.FC<SimpleCreateTripScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const { user } = useSimpleAuth();
  
  // État de l'assistant
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  
  // Données du voyage
  const [tripData, setTripData] = useState<TripData>({
    title: '',
    description: '',
    destination: '',
    photos: [],
    duration: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0], // Date actuelle
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 jours
    isPublic: true,
    status: 'completed', // ✅ Statut par défaut
    difficulty: '', // ✅ NOUVEAU CHAMP
    tags: [],
    places: [],
  });
  
  // Modal pour ajouter un lieu
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    address: '',
  });
  
  // États pour les sélecteurs de dates
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const steps = [
    {
      title: "Parlez-nous de votre voyage",
      subtitle: "Les informations essentielles",
      icon: "airplane-outline",
      color: "#4ECDC4"
    },
    {
      title: "Ajoutez vos souvenirs",
      subtitle: "Photos et lieux visités",
      icon: "camera-outline",
      color: "#FF6B6B"
    },
    {
      title: "Partagez votre aventure",
      subtitle: "Rendez votre voyage visible",
      icon: "share-social-outline",
      color: "#45B7D1"
    }
  ];
  
  const suggestedTags = [
    "🏖️ Plage", "🏔️ Montagne", "🏛️ Culture", "🍽️ Gastronomie", 
    "🎒 Aventure", "💰 Budget", "👨‍👩‍👧‍👦 Famille", "💑 Romantique",
    "🚗 Road Trip", "✈️ International", "🏠 Local", "🎉 Fête"
  ];
  
  const budgetOptions = [
    { label: "💰 Petit budget (< 500€)", value: "budget" },
    { label: "💸 Budget moyen (500-1500€)", value: "medium" },
    { label: "💎 Budget élevé (> 1500€)", value: "luxury" },
    { label: "🤷 Pas de budget fixe", value: "flexible" }
  ];
  
  const durationOptions = [
    "🌅 1 jour", "🏖️ Week-end (2-3 jours)", "📅 Une semaine", 
    "🗓️ Deux semaines", "🌍 Plus d'un mois", "⏰ Autre durée"
  ];

  const difficultyOptions = [
    { label: "😴 Facile", value: "easy", icon: "walk-outline" as const },
    { label: "🚶 Modéré", value: "moderate", icon: "fitness-outline" as const },
    { label: "🏃 Difficile", value: "hard", icon: "flash-outline" as const },
    { label: "🧗 Expert", value: "expert", icon: "trophy-outline" as const }
  ];

  const statusOptions = [
    { label: "📅 Planifié", value: "planned", icon: "calendar-outline" as const },
    { label: "🚀 En cours", value: "ongoing", icon: "play-circle-outline" as const },
    { label: "✅ Terminé", value: "completed", icon: "checkmark-circle-outline" as const }
  ];

  // Navigation entre étapes
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(width);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-width);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  };

  // Gestion des photos
  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos pour créer votre itinéraire.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setTripData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 10)
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
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setTripData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri].slice(0, 10)
      }));
    }
  };

  const removePhoto = (index: number) => {
    setTripData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Géolocalisation automatique
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre position pour vous aider.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const place = address[0];
        const destination = `${place.city || place.region || place.country}`;
        setTripData(prev => ({ ...prev, destination }));
      }
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    }
  };

  // Gestion des tags
  const toggleTag = (tag: string) => {
    setTripData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Fonctions pour gérer les lieux
  const addPlace = () => {
    if (!newPlace.name.trim()) {
      Alert.alert('Erreur', 'Le nom du lieu est requis');
      return;
    }

    const place: Place = {
      id: Date.now().toString(),
      name: newPlace.name.trim(),
      description: newPlace.description.trim() || undefined,
      address: newPlace.address.trim() || undefined,
      isVisited: false,
      photos: [],
    };

    setTripData(prev => ({
      ...prev,
      places: [...prev.places, place]
    }));

    setNewPlace({ name: '', description: '', address: '' });
    setShowAddPlaceModal(false);
  };

  const removePlace = (index: number) => {
    Alert.alert(
      'Supprimer le lieu',
      'Êtes-vous sûr de vouloir supprimer ce lieu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setTripData(prev => ({
              ...prev,
              places: prev.places.filter((_, i) => i !== index)
            }));
          },
        },
      ]
    );
  };

  // Fonction pour gérer la sélection de lieu
  const handleLocationSelect = (location: LocationSuggestion) => {
    setTripData(prev => ({
      ...prev,
      destination: location.display_name,
    }));
  };
  
  // Fonctions pour la sélection de dates
  const handleStartDateChange = (date: string) => {
    setTripData(prev => ({ ...prev, startDate: date }));
    setShowStartDatePicker(false);
  };
  
  const handleEndDateChange = (date: string) => {
    setTripData(prev => ({ ...prev, endDate: date }));
    setShowEndDatePicker(false);
  };
  
  const openDatePicker = (type: 'start' | 'end') => {
    if (type === 'start') {
      setShowStartDatePicker(true);
    } else {
      setShowEndDatePicker(true);
    }
  };

  // Validation et création
  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!tripData.title.trim()) {
          Alert.alert('Titre requis', 'Donnez un titre à votre voyage !');
          return false;
        }
        if (!tripData.destination.trim()) {
          Alert.alert('Destination requise', 'Où êtes-vous allé ?');
          return false;
        }
        if (!tripData.startDate || !tripData.endDate) {
          Alert.alert('Dates requises', 'Sélectionnez les dates de début et de fin de votre voyage !');
          return false;
        }
        if (new Date(tripData.endDate) <= new Date(tripData.startDate)) {
          Alert.alert('Dates invalides', 'La date de fin doit être après la date de début !');
          return false;
        }
        return true;
      case 1:
        if (tripData.photos.length === 0) {
          Alert.alert('Photos requises', 'Ajoutez au moins une photo de votre voyage !');
          return false;
        }
        return true;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        createTrip();
      } else {
        nextStep();
      }
    }
  };

  const createTrip = async () => {
    try {
      setIsCreating(true);
      
      // Valider les données
      if (!tripData.title.trim()) {
        Alert.alert('Erreur', 'Le titre du voyage est requis');
        return;
      }
      
      if (!tripData.destination.trim()) {
        Alert.alert('Erreur', 'La destination est requise');
        return;
      }

      if (tripData.photos.length === 0) {
        Alert.alert('Erreur', 'Au moins une photo est requise');
        return;
      }
      
      // Préparer les lieux visités
      const placesPayload = tripData.places.map(place => ({
        name: place.name,
        description: place.description || '',
        address: place.address || '',
        is_visited: place.isVisited,
        visit_date: place.visitDate || undefined,
        photos: place.photos || [],
        notes: place.notes || '',
      }));

      // Préparer les données pour l'API
      const tripRequest = {
        title: tripData.title,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        location: {
          city: tripData.destination,
          country: tripData.country || 'France', // Utiliser la vraie valeur si disponible
          latitude: tripData.latitude || 48.8566, // Utiliser la vraie valeur si disponible
          longitude: tripData.longitude || 2.3522, // Utiliser la vraie valeur si disponible
        },
        budget: tripData.budget ? parseFloat(tripData.budget) : undefined,
        status: tripData.status, // ✅ Utiliser le statut sélectionné par l'utilisateur
        visibility: tripData.isPublic ? 'public' : 'private', // ✅ Visibilité correcte
        photos: tripData.photos,
        duration: tripData.duration,
        difficulty: tripData.difficulty,
        tags: tripData.tags,
        places_visited: placesPayload,
      };
      
      console.log('🚀 Création du voyage avec les données:', JSON.stringify(tripRequest, null, 2));
      console.log('📊 Statut sélectionné par l\'utilisateur:', tripData.status);
      
      // Créer le voyage via l'API
      const result = await tripShareApi.createTrip(tripRequest);
      
      console.log('✅ Voyage créé avec succès:', result);
      
      Alert.alert(
        'Succès',
        'Votre voyage a été créé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création du voyage:', error);
      Alert.alert('Erreur', 'Impossible de créer le voyage. Veuillez réessayer.');
    } finally {
      setIsCreating(false);
    }
  };

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderPhotosStep();
      case 2:
        return renderSharingStep();
      default:
        return null;
    }
  };

  const renderBasicInfoStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          ✈️ Titre de votre voyage *
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Ex: Week-end à Paris, Road trip en Italie..."
          placeholderTextColor={theme.colors.text.secondary}
          value={tripData.title}
          onChangeText={(text) => setTripData(prev => ({ ...prev, title: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          📍 Destination
        </Text>
        <LocationSearchInput
          value={tripData.destination}
          onLocationSelect={handleLocationSelect}
          placeholder="Rechercher une destination..."
          style={styles.locationInput}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          📅 Date de début *
        </Text>
        <TouchableOpacity
          style={[styles.dateInput, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
          }]}
          onPress={() => openDatePicker('start')}
        >
          <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>
            {tripData.startDate ? new Date(tripData.startDate).toLocaleDateString('fr-FR') : 'Sélectionner une date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          📅 Date de fin *
        </Text>
        <TouchableOpacity
          style={[styles.dateInput, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
          }]}
          onPress={() => openDatePicker('end')}
        >
          <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>
            {tripData.endDate ? new Date(tripData.endDate).toLocaleDateString('fr-FR') : 'Sélectionner une date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          ⏰ Durée
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Durée (ex: 2h, 3 jours, 1 semaine)"
          placeholderTextColor={theme.colors.text.secondary}
          value={tripData.duration}
          onChangeText={(text) => setTripData(prev => ({ ...prev, duration: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          📝 Décrivez votre voyage
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.primary 
          }]}
          placeholder="Racontez-nous votre aventure ! Qu'avez-vous aimé ? Quels sont vos conseils ?"
          placeholderTextColor={theme.colors.text.secondary}
          value={tripData.description}
          onChangeText={(text) => setTripData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.quickSelectionContainer}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          ⏰ Durée du voyage
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsRow}>
            {durationOptions.map((duration, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionChip,
                  { 
                    backgroundColor: tripData.duration === duration 
                      ? theme.colors.primary[0] 
                      : theme.colors.background.card,
                    borderColor: theme.colors.border.primary
                  }
                ]}
                onPress={() => setTripData(prev => ({ ...prev, duration }))}
              >
                <Text style={[
                  styles.optionText,
                  { 
                    color: tripData.duration === duration 
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

      <View style={styles.quickSelectionContainer}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          🏔️ Niveau de difficulté
        </Text>
        <View style={styles.difficultyGrid}>
          {difficultyOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.difficultyOption,
                { 
                  backgroundColor: tripData.difficulty === option.value 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary
                }
              ]}
              onPress={() => setTripData(prev => ({ ...prev, difficulty: option.value }))}
            >
              <Ionicons 
                name={option.icon as any} 
                size={20} 
                color={tripData.difficulty === option.value ? 'white' : theme.colors.text.secondary} 
              />
              <Text style={[
                styles.difficultyText,
                { 
                  color: tripData.difficulty === option.value 
                    ? 'white' 
                    : theme.colors.text.primary 
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.quickSelectionContainer}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          💰 Budget approximatif
        </Text>
        <View style={styles.budgetGrid}>
          {budgetOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.budgetOption,
                { 
                  backgroundColor: tripData.budget === option.value 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary
                }
              ]}
              onPress={() => setTripData(prev => ({ ...prev, budget: option.value }))}
            >
              <Text style={[
                styles.budgetText,
                { 
                  color: tripData.budget === option.value 
                    ? 'white' 
                    : theme.colors.text.primary 
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Statut du voyage */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          📊 Statut de votre voyage
        </Text>
        <Text style={[styles.tagDescription, { color: theme.colors.text.secondary }]}>
          Indiquez où vous en êtes dans votre voyage
        </Text>
        <View style={styles.optionsRow}>
          {statusOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionChip,
                { 
                  backgroundColor: tripData.status === option.value 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary
                }
              ]}
              onPress={() => setTripData(prev => ({ ...prev, status: option.value }))}
            >
              <Ionicons name={option.icon} size={20} color={tripData.status === option.value ? 'white' : theme.colors.text.secondary} />
              <Text style={[
                styles.optionText,
                { 
                  color: tripData.status === option.value 
                    ? 'white' 
                    : theme.colors.text.primary 
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Difficulté */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          🏔️ Niveau de difficulté
        </Text>
        <Text style={[styles.tagDescription, { color: theme.colors.text.secondary }]}>
          Quel est le niveau de difficulté de votre voyage ?
        </Text>
        <View style={styles.optionsRow}>
          {difficultyOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionChip,
                { 
                  backgroundColor: tripData.difficulty === option.value 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary
                }
              ]}
              onPress={() => setTripData(prev => ({ ...prev, difficulty: option.value }))}
            >
              <Ionicons name={option.icon} size={20} color={tripData.difficulty === option.value ? 'white' : theme.colors.text.secondary} />
              <Text style={[
                styles.optionText,
                { 
                  color: tripData.difficulty === option.value 
                    ? 'white' 
                    : theme.colors.text.primary 
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPhotosStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
        📸 Ajoutez vos plus belles photos pour faire rêver les autres voyageurs !
      </Text>

      {tripData.photos.length === 0 ? (
        <View style={styles.emptyPhotosContainer}>
          <Ionicons name="images-outline" size={64} color={theme.colors.text.secondary} />
          <Text style={[styles.emptyPhotosText, { color: theme.colors.text.secondary }]}>
            Aucune photo ajoutée
          </Text>
          <Text style={[styles.emptyPhotosSubtext, { color: theme.colors.text.secondary }]}>
            Ajoutez des photos pour partager vos souvenirs
          </Text>
        </View>
      ) : (
        <View style={styles.photosGrid}>
          {tripData.photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image 
                source={{ uri: photo }} 
                style={styles.photo}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.mainPhotoBadge}>
                  <Text style={styles.mainPhotoText}>Principal</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.photoActions}>
        <TouchableOpacity
          style={[styles.photoActionButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={pickPhotos}
        >
          <Ionicons name="images" size={24} color="white" />
          <Text style={styles.photoActionText}>Galerie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.photoActionButton, { backgroundColor: '#4CAF50' }]}
          onPress={takePhoto}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.photoActionText}>Appareil photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          🏷️ Tags de votre voyage
        </Text>
        <Text style={[styles.tagDescription, { color: theme.colors.text.secondary }]}>
          Choisissez jusqu'à 5 tags pour aider les autres à découvrir votre voyage
        </Text>
        <View style={styles.tagsContainer}>
          {suggestedTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tagChip,
                { 
                  backgroundColor: tripData.tags.includes(tag) 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary
                }
              ]}
              onPress={() => toggleTag(tag)}
              disabled={!tripData.tags.includes(tag) && tripData.tags.length >= 5}
            >
              <Text style={[
                styles.tagText,
                { 
                  color: tripData.tags.includes(tag) 
                    ? 'white' 
                    : theme.colors.text.primary 
                }
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.tagCounter, { color: theme.colors.text.secondary }]}>
          {tripData.tags.length}/5 tags sélectionnés
        </Text>
      </View>

      {/* Section Lieux à visiter */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          📍 Lieux à visiter
        </Text>
        <Text style={[styles.tagDescription, { color: theme.colors.text.secondary }]}>
          Ajoutez les lieux que vous souhaitez visiter pendant votre voyage
        </Text>
        
        {tripData.places.length === 0 ? (
          <View style={styles.emptyPlacesContainer}>
            <Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={[styles.emptyPlacesText, { color: theme.colors.text.secondary }]}>
              Aucun lieu ajouté
            </Text>
            <Text style={[styles.emptyPlacesSubtext, { color: theme.colors.text.secondary }]}>
              Ajoutez les lieux que vous souhaitez visiter
            </Text>
          </View>
        ) : (
          <View style={styles.placesList}>
            {tripData.places.map((place, index) => (
              <View key={place.id} style={[styles.placeCard, { backgroundColor: theme.colors.background.card }]}>
                <View style={styles.placeInfo}>
                  <Text style={[styles.placeName, { color: theme.colors.text.primary }]}>
                    {place.name}
                  </Text>
                  {place.description && (
                    <Text style={[styles.placeDescription, { color: theme.colors.text.secondary }]}>
                      {place.description}
                    </Text>
                  )}
                  {place.address && (
                    <Text style={[styles.placeAddress, { color: theme.colors.text.secondary }]}>
                      📍 {place.address}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removePlaceButton}
                  onPress={() => removePlace(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.addPlaceButton, { borderColor: theme.colors.primary[0] }]}
          onPress={() => setShowAddPlaceModal(true)}
        >
          <Ionicons name="add" size={20} color={theme.colors.primary[0]} />
          <Text style={[styles.addPlaceText, { color: theme.colors.primary[0] }]}>
            Ajouter un lieu
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSharingStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.previewContainer}>
        <Text style={[styles.previewTitle, { color: theme.colors.text.primary }]}>
          👀 Aperçu de votre voyage
        </Text>
        
        <View style={[styles.previewCard, { backgroundColor: theme.colors.background.card }]}>
          {tripData.photos.length > 0 && (
            <Image source={{ uri: tripData.photos[0] }} style={styles.previewImage} />
          )}
          
          <View style={styles.previewContent}>
            <Text style={[styles.previewCardTitle, { color: theme.colors.text.primary }]}>
              {tripData.title}
            </Text>
            <Text style={[styles.previewDestination, { color: theme.colors.text.secondary }]}>
              📍 {tripData.destination}
            </Text>
            {tripData.duration && (
              <Text style={[styles.previewDuration, { color: theme.colors.text.secondary }]}>
                ⏰ {tripData.duration}
              </Text>
            )}
            
            {/* Affichage du statut sélectionné */}
            <Text style={[styles.previewStatus, { color: theme.colors.text.secondary }]}>
              📊 {statusOptions.find(opt => opt.value === tripData.status)?.label || 'Statut non défini'}
            </Text>
            
            <View style={styles.previewTags}>
              {tripData.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.previewTag, { backgroundColor: theme.colors.primary[0] }]}>
                  <Text style={styles.previewTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sharingOptions}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          🏷️ Tags pour votre voyage
        </Text>
        <Text style={[styles.labelDescription, { color: theme.colors.text.secondary }]}>
          Ajoutez des tags pour aider les autres à découvrir votre voyage
        </Text>
        
        <View style={styles.tagsContainer}>
          {suggestedTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tagChip,
                { 
                  backgroundColor: tripData.tags.includes(tag) 
                    ? theme.colors.primary[0] 
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary
                }
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                { 
                  color: tripData.tags.includes(tag) 
                    ? 'white' 
                    : theme.colors.text.primary 
                }
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sharingOptions}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          🌍 Partage de votre voyage
        </Text>
        
        <TouchableOpacity
          style={[styles.sharingOption, { backgroundColor: theme.colors.background.card }]}
          onPress={() => setTripData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
        >
          <View style={styles.sharingOptionContent}>
            <Ionicons 
              name={tripData.isPublic ? "globe-outline" : "lock-closed-outline"} 
              size={24} 
              color={tripData.isPublic ? "#4CAF50" : "#FF9800"} 
            />
            <View style={styles.sharingOptionText}>
              <Text style={[styles.sharingOptionTitle, { color: theme.colors.text.primary }]}>
                {tripData.isPublic ? "Voyage public" : "Voyage privé"}
              </Text>
              <Text style={[styles.sharingOptionDescription, { color: theme.colors.text.secondary }]}>
                {tripData.isPublic 
                  ? "Visible par tous les utilisateurs de TripShare"
                  : "Visible uniquement par vous"
                }
              </Text>
            </View>
          </View>
          <Ionicons 
            name={tripData.isPublic ? "toggle" : "toggle-outline"} 
            size={32} 
            color={tripData.isPublic ? theme.colors.primary[0] : theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.finalMessage}>
        <Text style={[styles.finalMessageText, { color: theme.colors.text.primary }]}>
          🎉 Votre voyage est prêt à être partagé !
        </Text>
        <Text style={[styles.finalMessageSubtext, { color: theme.colors.text.secondary }]}>
          Inspirez d'autres voyageurs avec votre expérience
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Créer un voyage
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            Étape {currentStep + 1} sur {steps.length}
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border.primary }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: theme.colors.primary[0],
                width: `${((currentStep + 1) / steps.length) * 100}%`
              }
            ]} 
          />
        </View>
      </View>

      {/* Step Header */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepIcon, { backgroundColor: steps[currentStep].color }]}>
          <Ionicons name={steps[currentStep].icon as any} size={24} color="white" />
        </View>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          {steps[currentStep].title}
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
          {steps[currentStep].subtitle}
        </Text>
      </View>

      {/* Step Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.stepContent,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {renderStep()}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, { backgroundColor: theme.colors.background.card }]}
            onPress={prevStep}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text.primary} />
            <Text style={[styles.navButtonText, { color: theme.colors.text.primary }]}>
              Précédent
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton, 
            { backgroundColor: theme.colors.primary[0] }
          ]}
          onPress={handleNext}
          disabled={isCreating}
        >
          {isCreating ? (
            <Text style={styles.navButtonText}>Création...</Text>
          ) : (
            <>
              <Text style={styles.navButtonText}>
                {currentStep === steps.length - 1 ? 'Créer mon voyage' : 'Suivant'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal pour ajouter un lieu */}
      <Modal
        visible={showAddPlaceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddPlaceModal(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
            <TouchableOpacity onPress={() => setShowAddPlaceModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              Ajouter un lieu
            </Text>
            <TouchableOpacity onPress={addPlace}>
              <Text style={[styles.headerTitle, { color: theme.colors.primary[0] }]}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.stepContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Nom du lieu *
              </Text>
              <TextInput
                style={[
                  styles.input,
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
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Description (optionnel)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
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
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Adresse (optionnel)
              </Text>
              <TextInput
                style={[
                  styles.input,
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
        </SafeAreaView>
      </Modal>

      {/* Modal pour sélectionner la date de début */}
      <Modal
        visible={showStartDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStartDatePicker(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
            <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              Date de début
            </Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
              <Text style={[styles.headerTitle, { color: theme.colors.primary[0] }]}>OK</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.stepContainer}>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              📅 Sélectionnez la date de début de votre voyage
            </Text>
            
            {/* Options de dates rapides */}
            <View style={styles.quickSelectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Options rapides
              </Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionChip, { 
                    backgroundColor: theme.colors.primary[0],
                    borderColor: theme.colors.primary[0]
                  }]}
                  onPress={() => handleStartDateChange(new Date().toISOString().split('T')[0])}
                >
                  <Text style={[styles.optionText, { color: 'white' }]}>
                    Aujourd'hui
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionChip, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary
                  }]}
                  onPress={() => handleStartDateChange(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text.primary }]}>
                    Demain
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionChip, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary
                  }]}
                  onPress={() => handleStartDateChange(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text.primary }]}>
                    Dans 1 semaine
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input manuel */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Ou saisissez une date
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary 
                }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.text.secondary}
                value={tripData.startDate}
                onChangeText={(text) => setTripData(prev => ({ ...prev, startDate: text }))}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal pour sélectionner la date de fin */}
      <Modal
        visible={showEndDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
            <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              Date de fin
            </Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
              <Text style={[styles.headerTitle, { color: theme.colors.primary[0] }]}>OK</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.stepContainer}>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              📅 Sélectionnez la date de fin de votre voyage
            </Text>
            
            {/* Options de dates rapides */}
            <View style={styles.quickSelectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Options rapides
              </Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionChip, { 
                    backgroundColor: theme.colors.primary[0],
                    borderColor: theme.colors.primary[0]
                  }]}
                  onPress={() => handleEndDateChange(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                >
                  <Text style={[styles.optionText, { color: 'white' }]}>
                    Dans 1 semaine
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionChip, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary
                  }]}
                  onPress={() => handleEndDateChange(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text.primary }]}>
                    Dans 2 semaines
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionChip, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary
                  }]}
                  onPress={() => handleEndDateChange(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text.primary }]}>
                    Dans 1 mois
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input manuel */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Ou saisissez une date
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary 
                }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.text.secondary}
                value={tripData.endDate}
                onChangeText={(text) => setTripData(prev => ({ ...prev, endDate: text }))}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    width: 24,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationInput: {
    flex: 1,
    marginRight: 12,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSelectionContainer: {
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  budgetOption: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPhotosText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyPhotosSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  photoContainer: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mainPhotoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  photoActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tagDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagCounter: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  previewContainer: {
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewContent: {
    padding: 16,
  },
  previewCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewDestination: {
    fontSize: 14,
    marginBottom: 4,
  },
  previewDuration: {
    fontSize: 14,
    marginBottom: 12,
  },
  previewStatus: {
    fontSize: 14,
    marginBottom: 12,
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  previewTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  sharingOptions: {
    marginBottom: 32,
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  sharingOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharingOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  sharingOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sharingOptionDescription: {
    fontSize: 14,
  },
  finalMessage: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  finalMessageText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  finalMessageSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  prevButton: {
    marginRight: 8,
  },
  nextButton: {
    marginLeft: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  // New styles for places
  emptyPlacesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPlacesText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyPlacesSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  placesList: {
    marginTop: 16,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 13,
  },
  removePlaceButton: {
    padding: 8,
  },
  addPlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addPlaceText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationInput: {
    marginTop: 8,
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // ✅ NOUVEAUX STYLES POUR LA DIFFICULTÉ
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  difficultyOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // ✅ NOUVEAUX STYLES POUR LES TAGS
  labelDescription: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
});

export default SimpleCreateTripScreen; 