import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useTrips } from '../../hooks/useTripShareApi';
import { authService } from '../../services/auth';
import LocationSearchInput, { LocationSuggestion } from '../../components/places/LocationSearchInput';
import PopularPlacesSuggestions from '../../components/places/PopularPlacesSuggestions';
import { API_CONFIG } from '../../config/api';
import { tripShareApi } from '../../services/tripShareApi';
import { TripCalculationService } from '../../services/tripCalculationService';
import { PopularPlacesService } from '../../services/popularPlacesService';

const { width } = Dimensions.get('window');

interface CreateItineraryScreenProps {
  navigation: any;
}

interface ItineraryStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  order: number;
}

interface ItineraryData {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  photos: string[];
  duration: string;
  budget: number;
  difficulty: string;
  status: 'planned' | 'ongoing' | 'completed';
  visibility: 'public' | 'private';
  tags: string[];
  steps: ItineraryStep[];
}

// === Composant Confetti ===
const Confetti: React.FC<{ visible: boolean }> = ({ visible }) => {
  const confettiAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      confettiAnim.setValue(0);
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;
  const confettiEmojis = ['🎉', '✨', '🎊', '🥳', '🌟', '💫'];
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}>
      {confettiEmojis.map((emoji, idx) => (
        <Animated.Text
          key={idx}
          style={{
            position: 'absolute',
            left: `${10 + idx * 15}%`,
            top: 0,
            fontSize: 36,
            opacity: confettiAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
            transform: [
              { translateY: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 600] }) },
              { rotate: `${idx % 2 === 0 ? '-' : ''}${20 + idx * 10}deg` },
            ],
          }}
        >
          {emoji}
        </Animated.Text>
      ))}
    </View>
  );
};

// === Écran de félicitations amélioré ===
const CongratulationsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  return (
    <Animated.View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'rgba(0,0,0,0.85)', 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 100,
      opacity: fadeAnim
    }}>
      <Animated.View style={{ 
        alignItems: 'center', 
        transform: [{ scale: scaleAnim }],
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      }}>
        <View style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          backgroundColor: '#4CAF50', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: 20
        }}>
          <Ionicons name="checkmark" size={40} color="white" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8, textAlign: 'center' }}>
          🎉 Félicitations !
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center', maxWidth: 280, lineHeight: 22 }}>
          Votre itinéraire a été créé avec succès. Prêt à inspirer d'autres voyageurs ?
        </Text>
        <TouchableOpacity 
          onPress={onClose} 
          style={{ 
            backgroundColor: '#4CAF50', 
            borderRadius: 16, 
            paddingHorizontal: 32, 
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            shadowColor: '#4CAF50',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Ionicons name="home" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const CreateItineraryScreen: React.FC<CreateItineraryScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { user } = useSimpleAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  
  // États pour le calendrier
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // États pour les encouragements
  const [encouragement, setEncouragement] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [stepCompletion, setStepCompletion] = useState<boolean[]>(new Array(4).fill(false));
  
  // Messages d'encouragement par étape
  const encouragements = [
    "🎯 Parfait ! Donnons un nom à votre aventure",
    "⚡ Excellent ! Définissons les détails de votre voyage",
    "🗺️ Génial ! Créons votre itinéraire étape par étape",
    "📸 Fantastique ! Ajoutons les touches finales"
  ];
  
  const completionMessages = [
    "🎉 Étape terminée ! Vous avancez bien !",
    "🚀 Super progression ! Continuez comme ça !",
    "🌟 Excellent travail ! Presque fini !",
    "🏆 Bravo ! Votre itinéraire est prêt !"
  ];
  
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    photos: [],
    duration: '',
    budget: 0,
    difficulty: 'Modéré',
    status: 'planned',
    visibility: 'public',
    tags: [],
    steps: [],
  });

  const steps = [
    {
      title: "Informations de base",
      subtitle: "Titre, destination et description",
      icon: "information-circle-outline"
    },
    {
      title: "Détails du voyage",
      subtitle: "Durée, budget et difficulté",
      icon: "settings-outline"
    },
    {
      title: "Étapes de l'itinéraire",
      subtitle: "Ajoutez vos étapes",
      icon: "map-outline"
    },
    {
      title: "Photos et tags",
      subtitle: "Ajoutez des photos et tags",
      icon: "camera-outline"
    }
  ];

  const difficultyOptions = [
    { label: "Facile", value: "Facile", icon: "trending-up" },
    { label: "Modéré", value: "Modéré", icon: "trending-up" },
    { label: "Difficile", value: "Difficile", icon: "trending-up" }
  ];

  const budgetOptions = [
    { label: "0-500€", value: 250, icon: "wallet-outline" },
    { label: "500-1000€", value: 750, icon: "wallet-outline" },
    { label: "1000-2000€", value: 1500, icon: "wallet-outline" },
    { label: "2000-5000€", value: 3500, icon: "wallet-outline" },
    { label: "> 5000€", value: 7500, icon: "wallet-outline" }
  ];



  const suggestedTags = [
    "Culture", "Nature", "Aventure", "Plage", "Ville", "Gastronomie",
    "Romantique", "Famille", "Budget", "Luxe", "Road Trip", "International"
  ];



  // Effets d'animation
  useEffect(() => {
    // Animation d'entrée pour chaque étape
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Mettre à jour l'encouragement
    setEncouragement(encouragements[currentStep]);
    
    // Animation de la barre de progression
    Animated.timing(progressAnim, {
      toValue: ((currentStep + 1) / steps.length) * 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Fonction pour célébrer la completion d'une étape
  const celebrateStepCompletion = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    
    // Mettre à jour le statut de completion
    const newCompletion = [...stepCompletion];
    newCompletion[currentStep] = true;
    setStepCompletion(newCompletion);
  };

  // Fonction pour animer les boutons
  const animateButton = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Informations de base
        if (!itineraryData.title.trim()) {
          Alert.alert('Champ requis', 'Veuillez saisir le titre de l\'itinéraire.');
          return false;
        }
        if (!itineraryData.destination.trim()) {
          Alert.alert('Champ requis', 'Veuillez saisir la destination.');
          return false;
        }
        if (!itineraryData.startDate.trim()) {
          Alert.alert('Champ requis', 'Veuillez sélectionner une date de début.');
          return false;
        }
        if (!itineraryData.endDate.trim()) {
          Alert.alert('Champ requis', 'Veuillez sélectionner une date de fin.');
          return false;
        }
        // Vérifier que la date de fin est après la date de début
        if (new Date(itineraryData.endDate) <= new Date(itineraryData.startDate)) {
          Alert.alert('Dates invalides', 'La date de fin doit être après la date de début.');
          return false;
        }

        return true;
      
      case 1: // Détails du voyage
        if (!itineraryData.budget || itineraryData.budget === 0) {
          Alert.alert('Champ requis', 'Veuillez sélectionner le budget.');
          return false;
        }
        return true;
      
      case 2: // Étapes de l'itinéraire
        if (itineraryData.steps.length === 0) {
          Alert.alert('Étapes requises', 'Veuillez ajouter au moins une étape à votre itinéraire.');
          return false;
        }
        // Vérifier que chaque étape a au moins un titre
        for (let i = 0; i < itineraryData.steps.length; i++) {
          if (!itineraryData.steps[i].title.trim()) {
            Alert.alert('Étape incomplète', `Veuillez saisir le titre de l'étape ${i + 1}.`);
            return false;
          }
        }
        // Vérifier que tous les lieux correspondent à la destination
        for (let i = 0; i < itineraryData.steps.length; i++) {
          const step = itineraryData.steps[i];
          if (step.location.trim() && !validateLocationInDestination(step.location, itineraryData.destination)) {
            Alert.alert(
              'Lieu hors destination', 
              `L'étape "${step.title}" contient un lieu ("${step.location}") qui ne correspond pas à votre destination "${itineraryData.destination}".\n\nVeuillez corriger le lieu pour qu'il soit dans votre destination.`
            );
            return false;
          }
        }
        return true;
      
      case 3: // Photos et tags
        // Les photos sont obligatoires
        if (itineraryData.photos.length === 0) {
          Alert.alert('Photos requises', 'Veuillez ajouter au moins une photo à votre itinéraire.');
          return false;
        }
        // La visibilité est obligatoire
        if (!itineraryData.visibility || (itineraryData.visibility !== 'public' && itineraryData.visibility !== 'private')) {
          Alert.alert('Visibilité requise', 'Veuillez sélectionner la visibilité de votre itinéraire.');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (validateCurrentStep()) {
        celebrateStepCompletion();
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, 500);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setItineraryData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 10)
      }));
    }
  };

  const removePhoto = (index: number) => {
    setItineraryData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleTag = (tag: string) => {
    setItineraryData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addStep = () => {
    const newStep: ItineraryStep = {
      id: Date.now().toString(),
      title: '',
      description: '',
      duration: '',
      location: '',
      order: itineraryData.steps.length + 1,
    };
    setItineraryData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index: number, field: keyof ItineraryStep, value: string) => {
    setItineraryData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const updateStepCoordinates = (index: number, coordinates: { latitude: number; longitude: number }) => {
    setItineraryData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, coordinates } : step
      )
    }));
  };

  // ✅ SOLUTION AUTOMATIQUE : Validation géographique
  const validateLocationInDestination = async (locationName: string, destination: string): Promise<boolean> => {
    if (!destination.trim() || !locationName.trim()) return true;

    const destinationLower = destination.toLowerCase();
    const locationLower = locationName.toLowerCase();

    // 1. Vérification rapide par mots-clés (pour les cas évidents)
    const destinationParts = destinationLower.split(/[,\\s]+/).filter(word => word.length > 2);
    const mainKeywords = destinationParts.slice(0, 2);
    
    // Si le lieu contient le nom de la destination, c'est valide
    const hasMainKeyword = mainKeywords.some(keyword => locationLower.includes(keyword));
    if (hasMainKeyword) return true;

    // 2. Validation géographique automatique
    try {
      // Obtenir les coordonnées de la destination
      const destinationCoords = await getDestinationCoordinates(destination);
      if (!destinationCoords) {
        console.log('⚠️ Impossible d\'obtenir les coordonnées de la destination, validation par défaut');
        return true; // Par défaut, accepter si on ne peut pas valider
      }

      // Obtenir les coordonnées du lieu
      const locationCoords = await getLocationCoordinatesForValidation(locationName);
      if (!locationCoords) {
        console.log('⚠️ Impossible d\'obtenir les coordonnées du lieu, validation par défaut');
        return true; // Par défaut, accepter si on ne peut pas valider
      }

      // Calculer la distance entre la destination et le lieu
      const distance = calculateDistance(
        destinationCoords.lat, destinationCoords.lon,
        locationCoords.lat, locationCoords.lon
      );

      // Considérer valide si le lieu est à moins de 50km de la destination
      const maxDistance = 50; // 50 kilomètres
      const isValid = distance <= maxDistance;

      console.log(`📍 Validation géographique: ${locationName} → ${destination}`);
      console.log(`📍 Distance: ${distance.toFixed(2)}km (max: ${maxDistance}km)`);
      console.log(`📍 Résultat: ${isValid ? '✅ Valide' : '❌ Trop éloigné'}`);

      return isValid;

    } catch (error) {
      console.log('⚠️ Erreur lors de la validation géographique:', error);
      // En cas d'erreur, utiliser une validation par mots-clés génériques
      return validateByGenericKeywords(locationLower);
    }
  };

  // Fonction pour obtenir les coordonnées d'une destination
  const getDestinationCoordinates = async (destination: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des coordonnées de la destination:', error);
    }
    return null;
  };

  // Fonction pour obtenir les coordonnées d'un lieu
  const getLocationCoordinatesForValidation = async (locationName: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des coordonnées du lieu:', error);
    }
    return null;
  };

  // Fonction pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Validation par mots-clés génériques (fallback)
  const validateByGenericKeywords = (locationLower: string): boolean => {
    const specificPlaceKeywords = [
      'rue', 'avenue', 'boulevard', 'place', 'square', 'plaza',
      'hotel', 'hôtel', 'café', 'restaurant', 'musée', 'musee', 'museum',
      'gare', 'station', 'airport', 'aéroport', 'port', 'harbor',
      'park', 'parc', 'garden', 'jardin', 'center', 'centre',
      'mall', 'shopping', 'market', 'marché', 'store', 'magasin'
    ];
    
    return specificPlaceKeywords.some(keyword => locationLower.includes(keyword));
  };

  const getLocationCoordinates = async (locationName: string, stepIndex: number) => {
    try {
      // Vérifier que le lieu correspond à la destination (validation géographique)
      const isValidLocation = await validateLocationInDestination(locationName, itineraryData.destination);
      if (!isValidLocation) {
        Alert.alert(
          'Lieu hors destination', 
          `Le lieu "${locationName}" ne semble pas correspondre à votre destination "${itineraryData.destination}".\n\nVeuillez saisir un lieu qui se trouve dans votre destination.`
        );
        return;
      }

      // Demander la permission de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre localisation pour récupérer les coordonnées.');
        return;
      }

      // Utiliser le service de géocodage pour obtenir les coordonnées
      const geocodeResult = await Location.geocodeAsync(locationName);
      
      if (geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];
        
        setItineraryData(prev => ({
          ...prev,
          steps: prev.steps.map((step, i) => 
            i === stepIndex ? { 
              ...step, 
              coordinates: { latitude, longitude }
            } : step
          )
        }));

        Alert.alert(
          'Coordonnées récupérées !', 
          `Lieu: ${locationName}\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`
        );
      } else {
        Alert.alert('Lieu non trouvé', 'Impossible de trouver les coordonnées pour ce lieu. Vérifiez le nom du lieu.');
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des coordonnées:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les coordonnées pour le moment.');
    }
  };

  const getCurrentLocation = async (stepIndex: number) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre localisation.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Récupérer l'adresse à partir des coordonnées
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let locationName = 'Position actuelle';
      if (reverseGeocodeResult.length > 0) {
        const address = reverseGeocodeResult[0];
        locationName = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
      }

      setItineraryData(prev => ({
        ...prev,
        steps: prev.steps.map((step, i) => 
          i === stepIndex ? { 
            ...step, 
            location: locationName,
            coordinates: { latitude, longitude }
          } : step
        )
      }));

      Alert.alert(
        'Position actuelle récupérée !', 
        `Lieu: ${locationName}\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`
      );
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la position:', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre position actuelle.');
    }
  };

  const removeStep = (index: number) => {
    const newSteps = itineraryData.steps.filter((_, i) => i !== index);
    setItineraryData(prev => ({ ...prev, steps: newSteps }));
  };

  // Fonction pour gérer la sélection de lieu dans les étapes
  const handleStepLocationSelect = (index: number, location: LocationSuggestion) => {
    console.log('📍 Sélection étape:', location);
    console.log('📍 Coordonnées reçues:', location.lat, location.lon);
    
    updateStep(index, 'location', location.display_name);
    
    // Mettre à jour les coordonnées si disponibles
    if (location.lat && location.lon) {
      updateStepCoordinates(index, {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon)
      });
      console.log('📍 Coordonnées mises à jour pour l\'étape', index);
    }
  };

  const { createTrip } = useTrips();

  // Fonctions pour gérer la sélection des dates
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setItineraryData(prev => ({ 
        ...prev, 
        startDate: selectedDate.toISOString().split('T')[0] 
      }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setItineraryData(prev => ({ 
        ...prev, 
        endDate: selectedDate.toISOString().split('T')[0] 
      }));
    }
  };

  const openStartDatePicker = () => {
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    if (!itineraryData.startDate) {
      Alert.alert('Date de début requise', 'Veuillez d\'abord sélectionner une date de début.');
      return;
    }
    setShowEndDatePicker(true);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour uploader les photos vers le backend
  const uploadTripPhotos = async (tripId: string, photoUris: string[]) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      for (let i = 0; i < photoUris.length; i++) {
        const photoUri = photoUris[i];
        
        // Ignorer les URLs qui ne sont pas des fichiers locaux
        if (!photoUri.startsWith('file://')) continue;

        // Créer le FormData
        const formData = new FormData();
        formData.append('photo', {
          uri: photoUri,
          type: 'image/jpeg',
          name: `photo_${i + 1}.jpg`
        } as any);
        
        formData.append('description', `Photo ${i + 1} du voyage`);

        // Upload vers le backend
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/trips/${tripId}/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        });

        if (!response.ok) {
          console.error(`Erreur upload photo ${i + 1}:`, response.status);
        }
      }
    } catch (error) {
      console.error('Erreur upload photos:', error);
    }
  };

  const createItinerary = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      // Utiliser les photos sélectionnées
      const photoUrls = itineraryData.photos.length > 0 ? itineraryData.photos : [];
      
      // Construction du payload pour l'API
      // ✅ CORRECTION : Convertir les dates au format ISO pour le backend
      if (!itineraryData.startDate || !itineraryData.endDate) {
        Alert.alert('Dates manquantes', 'Veuillez sélectionner les dates de début et de fin du voyage.');
        setIsCreating(false);
        return;
      }
      
      const startDate = new Date(itineraryData.startDate + 'T00:00:00Z').toISOString();
      const endDate = new Date(itineraryData.endDate + 'T00:00:00Z').toISOString();
      
      // Extraire ville et pays de la destination
      const destinationParts = itineraryData.destination.split(',').map(part => part.trim());
      let city = '';
      let country = '';
      
      if (destinationParts.length >= 2) {
        // Format: "Ville, Pays"
        city = destinationParts[0];
        country = destinationParts[1];
      } else if (destinationParts.length === 1) {
        // Format: "Ville" ou "Pays"
        const singlePart = destinationParts[0];
        // Si c'est un pays connu, on le met en country
        const knownCountries = ['france', 'belgique', 'belgium', 'allemagne', 'germany', 'espagne', 'spain', 'italie', 'italy', 'pays-bas', 'netherlands'];
        if (knownCountries.includes(singlePart.toLowerCase())) {
          country = singlePart;
          city = singlePart; // Pour la compatibilité
        } else {
          // Sinon on considère que c'est une ville
          city = singlePart;
          country = singlePart; // Pour la compatibilité
        }
      }
      
      // ✅ CORRECTION : Ne pas envoyer les steps pour éviter l'erreur JSON binding
      // Les steps seront gérés séparément si nécessaire
      
      const payload = {
        title: itineraryData.title,
        description: itineraryData.description || `Voyage à ${city}`,
        start_date: startDate,
        end_date: endDate,
        location: {
          city: city,
          country: country,
          latitude: 0.0, // Valeur par défaut
          longitude: 0.0 // Valeur par défaut
        },
        budget: itineraryData.budget || undefined,
        status: 'planned', // Le statut sera calculé automatiquement par le backend
        visibility: itineraryData.visibility,
        photos: photoUrls, // ✅ Utiliser les photos sélectionnées ou par défaut
        // ✅ NOUVELLES DONNÉES AJOUTÉES
        difficulty: itineraryData.difficulty,
        tags: itineraryData.tags,
        // ✅ CORRECTION : Suppression du champ steps pour éviter l'erreur JSON binding
      };
      // Créer le voyage
      const createdTrip = await tripShareApi.createTrip(payload);
      
      // Upload des photos si des photos locales ont été sélectionnées
      if (itineraryData.photos.length > 0 && itineraryData.photos.some(photo => photo.startsWith('file://'))) {
        await uploadTripPhotos(createdTrip.id, itineraryData.photos);
      }
      
      setIsCreating(false);
      setShowCongrats(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch (error: any) {
      setIsCreating(false);
      let message = "Impossible de créer l'itinéraire. Veuillez réessayer.";
      if (error && error.message) {
        message += `\n\nDétail : ${error.message}`;
      }
      Alert.alert('Erreur', message);
      console.error('Erreur création itinéraire:', error);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: theme.colors.text.primary }]}>
          {steps[currentStep].title}
        </Text>
        <Text style={[styles.progressSubtitle, { color: theme.colors.text.secondary }]}>
          {steps[currentStep].subtitle}
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.background.card }]}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: theme.colors.primary[0]
              }
            ]} 
          />
        </View>
        <View style={styles.progressSteps}>
          {steps.map((step, index) => (
            <View 
              key={index} 
              style={[
                styles.progressStep,
                index <= currentStep && { backgroundColor: theme.colors.primary[0] }
              ]}
            >
              <Ionicons 
                name={step.icon as any} 
                size={16} 
                color={index <= currentStep ? 'white' : theme.colors.text.secondary} 
              />
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.progressInfo}>
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          Étape {currentStep + 1} sur {steps.length}
        </Text>
        <Text style={[styles.progressPercentage, { color: theme.colors.primary[0] }]}>
          {Math.round(((currentStep + 1) / steps.length) * 100)}%
        </Text>
      </View>
    </View>
  );

  const renderBasicInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Informations de base
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Titre de l'itinéraire <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: theme.colors.background.card,
            color: theme.colors.text.primary,
            borderColor: itineraryData.title.trim() ? theme.colors.border.primary : '#ff4757'
          }]}
          placeholder="Ex: Voyage à Bali"
          placeholderTextColor={theme.colors.text.secondary}
          value={itineraryData.title}
          onChangeText={(text) => setItineraryData(prev => ({ ...prev, title: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Destination <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <LocationSearchInput
          value={itineraryData.destination}
          onLocationSelect={(suggestion: LocationSuggestion) => {
            setItineraryData(prev => ({ ...prev, destination: suggestion.display_name }));
          }}
          placeholder="Ex: Bali, Indonésie"
          style={styles.locationInput}
          citiesOnly={true}
        />
      </View>



      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Dates du voyage <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <View style={styles.datesRow}>
          <View style={styles.dateContainer}>
            <Text style={[styles.dateLabel, { color: theme.colors.text.secondary }]}>Début</Text>
            <TouchableOpacity
              style={[styles.dateInput, { 
                backgroundColor: theme.colors.background.card,
                borderColor: itineraryData.startDate ? theme.colors.border.primary : '#ff4757'
              }]}
              onPress={openStartDatePicker}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={[
                styles.dateText,
                { color: itineraryData.startDate ? theme.colors.text.primary : theme.colors.text.secondary }
              ]}>
                {itineraryData.startDate ? formatDate(itineraryData.startDate) : 'Date début'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={[styles.dateLabel, { color: theme.colors.text.secondary }]}>Fin</Text>
            <TouchableOpacity
              style={[styles.dateInput, { 
                backgroundColor: theme.colors.background.card,
                borderColor: itineraryData.endDate ? theme.colors.border.primary : '#ff4757'
              }]}
              onPress={openEndDatePicker}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={[
                styles.dateText,
                { color: itineraryData.endDate ? theme.colors.text.primary : theme.colors.text.secondary }
              ]}>
                {itineraryData.endDate ? formatDate(itineraryData.endDate) : 'Date fin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Calcul automatique du statut - affiché dès que les dates sont saisies */}
      {(itineraryData.startDate && itineraryData.endDate) && (
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
            ✨ Calcul automatique du statut
          </Text>
          <View style={styles.calculationContainer}>
            {(() => {
              const tempTrip = {
                id: 'temp',
                title: itineraryData.title,
                startDate: itineraryData.startDate,
                endDate: itineraryData.endDate,
                location: { city: '', country: '', latitude: 0, longitude: 0 },
                status: 'planned' as any,
                visibility: 'public' as any,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: '',
              };
              
              const stats = TripCalculationService.calculateTripStats(tempTrip);
              const isOverdue = TripCalculationService.isOverdue(tempTrip);
              const isStartingSoon = TripCalculationService.isStartingSoon(tempTrip);
              
              return (
                <>
                  <View style={styles.calculationRow}>
                    <View style={[styles.statusBadge, { backgroundColor: TripCalculationService.getStatusColor(stats.status) }]}>
                      <Ionicons 
                        name={TripCalculationService.getStatusIcon(stats.status) as any} 
                        size={14} 
                        color="white" 
                      />
                      <Text style={styles.statusBadgeText}>{stats.statusDisplay}</Text>
                    </View>
                    <Text style={[styles.calculationInfo, { color: theme.colors.text.secondary }]}>
                      {formatDate(itineraryData.startDate)} → {formatDate(itineraryData.endDate)}
                    </Text>
                  </View>
                  
                  <View style={styles.calculationDetails}>
                    <Text style={[styles.calculationDetail, { color: theme.colors.text.secondary }]}>
                      📅 Durée : {stats.duration}
                    </Text>
                    <Text style={[styles.calculationDetail, { color: theme.colors.text.secondary }]}>
                      📊 Progression : {Math.round(stats.progressPercentage)}%
                    </Text>
                    
                    {stats.daysUntilStart !== undefined && (
                      <Text style={[
                        styles.calculationDetail, 
                        { color: isStartingSoon ? '#FF6B35' : theme.colors.text.secondary }
                      ]}>
                        🚀 {stats.daysUntilStartDisplay}
                      </Text>
                    )}
                    
                    {isOverdue && stats.status !== 'completed' && (
                      <Text style={[styles.calculationDetail, { color: '#FF6B35', fontWeight: '600' }]}>
                        ⚠️ Voyage en retard
                      </Text>
                    )}
                  </View>
                  
                  {/* Barre de progression simple */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${stats.progressPercentage}%`,
                            backgroundColor: TripCalculationService.getStatusColor(stats.status)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      )}



      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: theme.colors.background.card,
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.primary
          }]}
          placeholder="Décrivez votre voyage..."
          placeholderTextColor={theme.colors.text.secondary}
          value={itineraryData.description}
          onChangeText={(text) => setItineraryData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Détails du voyage
      </Text>



      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Budget <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <View style={styles.optionsContainer}>
          {budgetOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: theme.colors.border.primary },
                itineraryData.budget === option.value && { 
                  backgroundColor: theme.colors.primary[0],
                  borderColor: theme.colors.primary[0]
                }
              ]}
              onPress={() => setItineraryData(prev => ({ ...prev, budget: option.value }))}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={itineraryData.budget === option.value ? 'white' : theme.colors.text.secondary} 
              />
              <Text style={[
                styles.optionText,
                { color: itineraryData.budget === option.value ? 'white' : theme.colors.text.secondary }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Difficulté</Text>
        <View style={styles.optionsContainer}>
          {difficultyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: theme.colors.border.primary },
                itineraryData.difficulty === option.value && { 
                  backgroundColor: theme.colors.primary[0],
                  borderColor: theme.colors.primary[0]
                }
              ]}
              onPress={() => setItineraryData(prev => ({ ...prev, difficulty: option.value }))}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={itineraryData.difficulty === option.value ? 'white' : theme.colors.text.secondary} 
              />
              <Text style={[
                styles.optionText,
                { color: itineraryData.difficulty === option.value ? 'white' : theme.colors.text.secondary }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      
    </View>
  );

  const renderStepsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          Étapes de l'itinéraire <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={addStep}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions de lieux populaires si une destination est sélectionnée */}
      {itineraryData.destination && PopularPlacesService.hasPopularPlaces(itineraryData.destination) && (
        <PopularPlacesSuggestions
          destination={itineraryData.destination}
          onPlaceSelect={(place) => {
            // Ajouter automatiquement une nouvelle étape avec le lieu sélectionné
            const newStep: ItineraryStep = {
              id: Date.now().toString(),
              title: place.name,
              description: `Visite de ${place.name}`,
              duration: '2h',
              location: place.name,
              coordinates: {
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon)
              },
              order: itineraryData.steps.length + 1
            };
            setItineraryData(prev => ({
              ...prev,
              steps: [...prev.steps, newStep]
            }));
          }}
          visible={itineraryData.steps.length === 0}
        />
      )}

      {itineraryData.steps.map((step, index) => (
        <View key={step.id} style={[styles.stepCard, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.stepCardHeader}>
            <Text style={[styles.stepNumber, { color: theme.colors.primary[0] }]}>
              Étape {step.order}
            </Text>
            <TouchableOpacity onPress={() => removeStep(index)}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputFieldContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
              Titre de l'étape <Text style={{ color: '#ff4757' }}>*</Text>
            </Text>
            <TextInput
              style={[styles.stepInput, { 
                color: theme.colors.text.primary,
                borderColor: step.title ? theme.colors.primary[0] : theme.colors.border.primary,
                borderWidth: step.title ? 2 : 1,
              }]}
              placeholder="Ex: Visite de la Grand Place"
              placeholderTextColor={theme.colors.text.secondary}
              value={step.title}
              onChangeText={(text) => updateStep(index, 'title', text)}
            />
          </View>
          
                    <View style={styles.inputFieldContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
              Description <Text style={{ color: '#ff4757' }}>*</Text>
            </Text>
            <TextInput
              style={[styles.stepInput, { 
                color: theme.colors.text.primary,
                borderColor: step.description ? theme.colors.primary[0] : theme.colors.border.primary,
                borderWidth: step.description ? 2 : 1,
              }]}
              placeholder="Ex: Découverte de l'histoire et de l'architecture"
              placeholderTextColor={theme.colors.text.secondary}
              value={step.description}
              onChangeText={(text) => updateStep(index, 'description', text)}
            />
          </View>
          
          <View style={styles.inputFieldContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
              Durée <Text style={{ color: '#ff4757' }}>*</Text>
            </Text>
            <TextInput
              style={[styles.stepInputHalf, { 
                backgroundColor: theme.colors.background.card,
                borderColor: step.duration ? theme.colors.primary[0] : theme.colors.border.primary,
                color: theme.colors.text.primary,
                fontSize: 14,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: step.duration ? 2 : 1,
              }]}
              placeholder="Ex: 2h, 30 min, 1h30"
              placeholderTextColor={theme.colors.text.secondary}
              value={step.duration}
              onChangeText={(text) => updateStep(index, 'duration', text)}
            />
          </View>
          
          <View style={styles.inputFieldContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
              Lieu <Text style={{ color: '#ff4757' }}>*</Text>
            </Text>
            <LocationSearchInput
              value={step.location}
              onLocationSelect={(suggestion: LocationSuggestion) => handleStepLocationSelect(index, suggestion)}
              placeholder="Sélectionner un lieu"
              style={[styles.locationInput, {
                borderColor: step.location ? theme.colors.primary[0] : theme.colors.border.primary,
                borderWidth: step.location ? 2 : 1,
              }]}
            />
            {step.coordinates && (
              <View style={styles.coordinatesIndicator}>
                <Ionicons name="location" size={14} color={theme.colors.primary[0]} />
                <Text style={[styles.coordinatesIndicatorText, { color: theme.colors.text.secondary }]}>
                  Coordonnées: {step.coordinates.latitude.toFixed(4)}, {step.coordinates.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Suggestions rapides de lieux populaires pour cette étape */}
          {itineraryData.destination && PopularPlacesService.hasPopularPlaces(itineraryData.destination) && !step.location && (
            <View style={styles.quickSuggestions}>
              <View style={styles.quickSuggestionsHeader}>
                <Ionicons name="star" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.quickSuggestionsTitle, { color: theme.colors.text.primary }]}>
                  Lieux populaires à {itineraryData.destination}
                </Text>
                <Text style={[styles.quickSuggestionsSubtitle, { color: theme.colors.text.secondary }]}>
                  Cliquez pour remplir automatiquement
                </Text>
              </View>
              <View style={styles.quickSuggestionsList}>
                {PopularPlacesService.getPopularPlaces(itineraryData.destination).slice(0, 3).map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={[styles.quickSuggestionChip, { 
                      backgroundColor: theme.colors.primary[0],
                      shadowColor: theme.colors.primary[0],
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }]}
                    onPress={() => {
                      updateStep(index, 'location', place.name);
                      updateStep(index, 'title', place.name);
                      updateStep(index, 'description', `Visite de ${place.name}`);
                      if (place.lat && place.lon) {
                        const newStep = { ...step };
                        newStep.coordinates = {
                          latitude: parseFloat(place.lat),
                          longitude: parseFloat(place.lon)
                        };
                        const updatedSteps = [...itineraryData.steps];
                        updatedSteps[index] = newStep;
                        setItineraryData(prev => ({ ...prev, steps: updatedSteps }));
                      }
                    }}
                  >
                    <Ionicons name="location" size={14} color="white" />
                    <Text style={styles.quickSuggestionText}>{place.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
           

           
        </View>
      ))}

      {itineraryData.steps.length === 0 && (
        <View style={styles.emptySteps}>
          <Ionicons name="map-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={[styles.emptyStepsText, { color: theme.colors.text.secondary }]}>
            Aucune étape ajoutée
          </Text>
          <Text style={[styles.emptyStepsSubtext, { color: theme.colors.text.secondary }]}>
            Ajoutez les étapes de votre voyage
          </Text>
        </View>
      )}
    </View>
  );

  const renderPhotosStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Photos et tags
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Photos <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <TouchableOpacity 
          style={[styles.photoButton, { 
            borderColor: itineraryData.photos.length > 0 ? theme.colors.border.primary : '#ff4757' 
          }]}
          onPress={pickPhotos}
        >
          <Ionicons name="camera-outline" size={24} color={theme.colors.text.secondary} />
          <Text style={[styles.photoButtonText, { color: theme.colors.text.secondary }]}>
            {itineraryData.photos.length > 0 ? `${itineraryData.photos.length} photo(s) ajoutée(s)` : 'Ajouter des photos (obligatoire)'}
          </Text>
        </TouchableOpacity>
        
        {itineraryData.photos.length > 0 && (
          <View style={styles.photosContainer}>
            <Text style={[styles.photosCount, { color: theme.colors.text.secondary }]}>
              {itineraryData.photos.length} photo{itineraryData.photos.length > 1 ? 's' : ''} sélectionnée{itineraryData.photos.length > 1 ? 's' : ''}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScrollView}>
              {itineraryData.photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image 
                    source={{ uri: photo }} 
                    style={styles.photoThumbnail}
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
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Tags</Text>
        <View style={styles.tagsContainer}>
          {suggestedTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                { borderColor: theme.colors.border.primary },
                itineraryData.tags.includes(tag) && { 
                  backgroundColor: theme.colors.primary[0],
                  borderColor: theme.colors.primary[0]
                }
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                { color: itineraryData.tags.includes(tag) ? 'white' : theme.colors.text.secondary }
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Visibilité <Text style={{ color: '#ff4757' }}>*</Text>
        </Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: theme.colors.border.primary },
              itineraryData.visibility === 'public' && { 
                backgroundColor: '#2ecc71',
                borderColor: '#2ecc71'
              }
            ]}
            onPress={() => setItineraryData(prev => ({ ...prev, visibility: 'public' }))}
          >
            <Ionicons 
              name="globe-outline" 
              size={16} 
              color={itineraryData.visibility === 'public' ? 'white' : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.optionText,
              { color: itineraryData.visibility === 'public' ? 'white' : theme.colors.text.secondary }
            ]}>
              Public
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: theme.colors.border.primary },
              itineraryData.visibility === 'private' && { 
                backgroundColor: '#95a5a6',
                borderColor: '#95a5a6'
              }
            ]}
            onPress={() => setItineraryData(prev => ({ ...prev, visibility: 'private' }))}
          >
            <Ionicons 
              name="lock-closed-outline" 
              size={16} 
              color={itineraryData.visibility === 'private' ? 'white' : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.optionText,
              { color: itineraryData.visibility === 'private' ? 'white' : theme.colors.text.secondary }
            ]}>
              Privé
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderDetailsStep();
      case 2:
        return renderStepsStep();
      case 3:
        return renderPhotosStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const getValidationMessage = (locationName: string, destination: string): string => {
    if (!destination.trim() || !locationName.trim()) return '';
    
    const destinationParts = destination.split(',').map(part => part.trim());
    const city = destinationParts[0] || '';
    const country = destinationParts[1] || '';
    
    // Validation synchrone simple pour l'affichage
    const destinationLower = destination.toLowerCase();
    const locationLower = locationName.toLowerCase();
    
    // Vérification rapide par mots-clés
    const destinationParts2 = destinationLower.split(/[,\\s]+/).filter(word => word.length > 2);
    const mainKeywords = destinationParts2.slice(0, 2);
    const hasMainKeyword = mainKeywords.some(keyword => locationLower.includes(keyword));
    
    if (hasMainKeyword) {
      return `✅ Lieu valide dans ${city}`;
    } else {
      return `⚠️ Lieu hors destination. Exemples valides : "Hôtel à ${city}", "Café ${city}", "Rue de la Paix, ${city}", etc.`;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header amélioré avec gradient */}
      <View style={[styles.header, { backgroundColor: theme.colors.background.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            ✨ Créer un itinéraire
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            Partagez votre aventure avec le monde
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {renderProgressBar()}

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={[{ id: 'content' }]}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyExtractor={() => 'content'}
          renderItem={() => renderCurrentStep()}
        />
      </KeyboardAvoidingView>

      {/* Footer avec boutons améliorés */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background.card }]}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={[styles.footerButton, styles.secondaryButton, { borderColor: theme.colors.border.primary }]}
            onPress={prevStep}
          >
            <Ionicons name="arrow-back" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.footerButtonText, { color: theme.colors.text.secondary }]}>
              Précédent
            </Text>
          </TouchableOpacity>
        )}
        
        {currentStep < steps.length - 1 ? (
          <TouchableOpacity 
            style={[styles.footerButton, styles.primaryButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={nextStep}
          >
            <Text style={styles.primaryButtonText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.footerButton, 
              styles.primaryButton, 
              { backgroundColor: isCreating ? theme.colors.text.secondary : theme.colors.primary[0] }
            ]}
            onPress={createItinerary}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Ionicons name="hourglass-outline" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Création...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Créer l'itinéraire</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      <Confetti visible={showConfetti} />
      {showCongrats && <CongratulationsScreen onClose={() => {
        setShowCongrats(false);
        // Retourner à l'écran principal du HomeStack
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeMain' }],
        });
      }} />}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={itineraryData.startDate ? new Date(itineraryData.startDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={itineraryData.endDate ? new Date(itineraryData.endDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={itineraryData.startDate ? new Date(itineraryData.startDate) : new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Styles pour les boutons de durée
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  durationButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  durationPicker: {
    height: 45,
    width: '100%',
    fontSize: 16,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  stepContainer: { flex: 1 },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  stepCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  stepInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepInputHalf: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  stepLocationInput: {
    flex: 1,
    marginTop: 4,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  locationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  locationValidation: {
    marginTop: 8,
  },
  validLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0fff0',
    borderRadius: 6,
  },
  invalidLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff0f0',
    borderRadius: 6,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptySteps: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStepsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStepsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  photosContainer: {
    marginTop: 12,
  },
  photoItem: {
    position: 'relative',
    marginRight: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4757',
    borderRadius: 12,
    padding: 2,
  },
  photosCount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  photosScrollView: {
    marginTop: 8,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainPhotoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  visibilityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  primaryButton: {
    // backgroundColor handled in component
  },
  quickSuggestions: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  quickSuggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  quickSuggestionsSubtitle: {
    fontSize: 11,
    marginLeft: 24,
    marginTop: 2,
  },
  quickSuggestionsList: {
    gap: 8,
  },
  quickSuggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  quickSuggestionText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour le calcul automatique
  calculationContainer: {
    backgroundColor: 'rgba(0, 128, 128, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 128, 128, 0.2)',
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  calculationInfo: {
    fontSize: 12,
    textAlign: 'right',
  },
  calculationDetails: {
    marginBottom: 12,
  },
  calculationDetail: {
    fontSize: 13,
    marginBottom: 4,
  },
  inputFieldContainer: {
    marginBottom: 16,
  },
  coordinatesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 128, 128, 0.05)',
    borderRadius: 8,
    gap: 6,
  },
  coordinatesIndicatorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
});

export default CreateItineraryScreen; 