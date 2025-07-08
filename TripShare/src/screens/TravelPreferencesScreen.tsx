import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { api as apiService } from '../services/api';
import { authService } from '../services/auth';
import { UserTravelPreferences } from '../types/user';
import { useNavigation } from '@react-navigation/native';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { screenStyles } from './TravelPreferencesStyles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { CommonActions } from '@react-navigation/native';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Type local pour les préférences de l'interface utilisateur
interface LocalUserPreferences {
  budget: string;
  transportModes: string[];
  climatePreference: string;
  tripDuration: string;
  accommodationTypes: string[];
  interests: string[];
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
}

// Options de budget quotidien
const BUDGET_RANGES = [
  { key: 'budget', label: 'Économique', icon: 'wallet' },
  { key: 'moderate', label: 'Modéré', icon: 'card' },
  { key: 'luxury', label: 'Luxe', icon: 'diamond' },
];

// Options de transport
const TRANSPORT_MODES = [
  { key: 'car', label: 'Voiture', icon: 'car' },
  { key: 'train', label: 'Train', icon: 'train' },
  { key: 'plane', label: 'Avion', icon: 'airplane' },
  { key: 'bus', label: 'Bus', icon: 'bus' },
  { key: 'bike', label: 'Vélo', icon: 'bicycle' },
  { key: 'walk', label: 'Marche', icon: 'walk' },
];

// Options de climat
const CLIMATE_PREFERENCES = [
  { key: 'tropical', label: 'Tropical', icon: 'sunny' },
  { key: 'temperate', label: 'Tempéré', icon: 'partly-sunny' },
  { key: 'cold', label: 'Froid', icon: 'snow' },
];

// Options de durée
const TRIP_DURATIONS = [
  { key: 'weekend', label: 'Week-end', icon: 'calendar' },
  { key: 'week', label: '1 semaine', icon: 'calendar' },
  { key: 'twoWeeks', label: '2 semaines', icon: 'calendar' },
  { key: 'month', label: '1 mois+', icon: 'calendar' },
];

// Options d'hébergement
const ACCOMMODATION_TYPES = [
  { key: 'hotel', label: 'Hôtel', icon: 'bed' },
  { key: 'hostel', label: 'Auberge', icon: 'people' },
  { key: 'apartment', label: 'Appartement', icon: 'home' },
  { key: 'camping', label: 'Camping', icon: 'bonfire' },
  { key: 'resort', label: 'Resort', icon: 'umbrella' },
];

// Centres d'intérêt
const INTERESTS = [
  { key: 'culture', label: 'Culture', icon: 'library' },
  { key: 'nature', label: 'Nature', icon: 'leaf' },
  { key: 'adventure', label: 'Aventure', icon: 'compass' },
  { key: 'relax', label: 'Détente', icon: 'sunny' },
  { key: 'food', label: 'Gastronomie', icon: 'restaurant' },
  { key: 'shopping', label: 'Shopping', icon: 'cart' },
  { key: 'nightlife', label: 'Vie nocturne', icon: 'moon' },
  { key: 'sports', label: 'Sports', icon: 'football' },
];

// Restrictions alimentaires
const DIETARY_RESTRICTIONS = [
  { key: 'vegetarian', label: 'Végétarien', icon: 'leaf' },
  { key: 'vegan', label: 'Vegan', icon: 'nutrition' },
  { key: 'glutenFree', label: 'Sans gluten', icon: 'warning' },
  { key: 'lactoseFree', label: 'Sans lactose', icon: 'warning' },
  { key: 'halal', label: 'Halal', icon: 'restaurant' },
  { key: 'kosher', label: 'Casher', icon: 'restaurant' },
];

// Besoins d'accessibilité
const ACCESSIBILITY_NEEDS = [
  { key: 'wheelchair', label: 'Fauteuil roulant', icon: 'accessibility' },
  { key: 'visual', label: 'Déficience visuelle', icon: 'eye' },
  { key: 'hearing', label: 'Déficience auditive', icon: 'ear' },
];

export default function TravelPreferencesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useAppTheme();
  const { logout } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<LocalUserPreferences>({
    budget: '',
    transportModes: [],
    climatePreference: '',
    tripDuration: '',
    accommodationTypes: [],
    interests: [],
    dietaryRestrictions: [],
    accessibilityNeeds: []
  });

  // Vérifier si au moins une préférence est sélectionnée
  const hasSelectedPreferences = () => {
    return preferences.budget !== '' ||
      preferences.transportModes.length > 0 ||
      preferences.climatePreference !== '' ||
      preferences.tripDuration !== '' ||
      preferences.accommodationTypes.length > 0 ||
      preferences.interests.length > 0 ||
      preferences.dietaryRestrictions.length > 0 ||
      preferences.accessibilityNeeds.length > 0;
  };

  const toggleArrayItem = (array: string[], item: string) => {
    const index = array.indexOf(item);
    if (index === -1) {
      return [...array, item];
    }
    return [...array.slice(0, index), ...array.slice(index + 1)];
  };

  const handlePress = (optionKey: string, fieldName: keyof LocalUserPreferences) => {
    console.log('Pressing option:', optionKey, 'for field:', fieldName);
    console.log('Current preferences:', preferences);

    setPreferences(prev => {
      if (fieldName === 'budget' || fieldName === 'climatePreference' || fieldName === 'tripDuration') {
        // Single selection fields
        return {
          ...prev,
          [fieldName]: optionKey
        };
      } else {
        // Multiple selection fields
        const currentArray = prev[fieldName] as string[] || [];
        const newArray = toggleArrayItem(currentArray, optionKey);
        console.log('Updating array:', { currentArray, newArray });
        return {
          ...prev,
          [fieldName]: newArray
        };
      }
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const backendPreferences: UserTravelPreferences = {
        activities: preferences.interests || [],
        accommodation: preferences.accommodationTypes || [],
        transport: preferences.transportModes || [],
        food: preferences.dietaryRestrictions || [],
        budget: preferences.budget ? [preferences.budget] : [],
        climate: preferences.climatePreference ? [preferences.climatePreference] : [],
        culture: []
      };

      const response = await apiService.updatePreferences(backendPreferences);
      
      if (response.success) {
        Alert.alert(
          'Préférences enregistrées',
          'Vos préférences de voyage ont été sauvegardées avec succès.',
          [
            {
              text: 'Continuer',
              onPress: async () => {
                try {
                  // Vérifier le token pour rafraîchir les données utilisateur
                  const user = await authService.verifyToken();
                  if (user) {
                    // Utiliser CommonActions pour réinitialiser la navigation
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          { name: 'Main' }
                        ],
                      })
                    );
                  }
                } catch (error) {
                  console.error('Erreur lors de la vérification du token:', error);
                  Alert.alert(
                    'Erreur',
                    'Impossible de continuer. Veuillez réessayer.'
                  );
                }
              }
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors de la sauvegarde des préférences'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Utiliser le contexte d'authentification pour forcer la redirection
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const renderSection = (title: string, options: any[], selectedValue: string | string[], isSingle: boolean = false) => {
    const getFieldName = (title: string): keyof LocalUserPreferences => {
      const normalizedTitle = title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Enlever les accents
        .replace(/[^a-z]/g, '');          // Garder uniquement les lettres

      console.log('Normalisation du titre:', { original: title, normalized: normalizedTitle });

      switch (normalizedTitle) {
        case 'transport': return 'transportModes';
        case 'climat': return 'climatePreference';
        case 'duree': return 'tripDuration';
        case 'hebergement': return 'accommodationTypes';
        case 'centresdinteret':
        case 'centresinteret':
        case 'centredinteret': return 'interests';
        case 'restrictionsalimentaires': return 'dietaryRestrictions';
        case 'accessibilite': return 'accessibilityNeeds';
        case 'budget': return 'budget';
        default:
          console.warn(`Titre non reconnu: ${title}, normalisé: ${normalizedTitle}`);
          return 'budget';
      }
    };

    const fieldName = getFieldName(title);
    console.log('Field name pour', title, ':', fieldName);

    return (
      <View style={screenStyles.section}>
        <Text style={[screenStyles.sectionTitle, { color: theme.colors.text.primary }]}>
          {title}
          {!isSingle && <Text style={screenStyles.multiSelectHint}> (sélection multiple possible)</Text>}
        </Text>
        <View style={screenStyles.chipContainer}>
          {options.map(option => {
            const isSelected = isSingle
              ? selectedValue === option.key
              : Array.isArray(selectedValue) && selectedValue.includes(option.key);

            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  screenStyles.chip,
                  isSelected && screenStyles.chipSelected,
                  { 
                    backgroundColor: isSelected ? theme.colors.primary[0] : theme.colors.background.card,
                    borderColor: isSelected ? theme.colors.primary[0] : theme.colors.border.primary,
                  }
                ]}
                onPress={() => handlePress(option.key, fieldName)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? '#fff' : theme.colors.text.primary}
                  style={screenStyles.chipIcon}
                />
                <Text style={[
                  screenStyles.chipText,
                  isSelected && screenStyles.chipTextSelected,
                  { color: isSelected ? '#fff' : theme.colors.text.primary }
                ]}>
                  {option.label}
                </Text>
                {!isSingle && (
                  <View style={[
                    screenStyles.checkmark,
                    isSelected && screenStyles.checkmarkSelected,
                    { 
                      borderColor: '#E0E0E0',
                      backgroundColor: isSelected ? theme.colors.primary[0] : 'transparent'
                    }
                  ]}>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#fff"
                      />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ImageBackground
        source={isDark ? require('../../assets/login_bg_dark.png') : require('../../assets/login_bg_light.png')}
        style={screenStyles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          style={screenStyles.gradient}
        >
          <ScrollView contentContainerStyle={screenStyles.container}>
            <View style={screenStyles.header}>
              <Text style={[screenStyles.title, { color: theme.colors.text.primary }]}>
                Vos Préférences de Voyage
              </Text>
              <Text style={[screenStyles.subtitle, { color: theme.colors.text.secondary }]}>
                Personnalisez votre expérience de voyage
              </Text>
            </View>

            <View style={[screenStyles.card, {
              backgroundColor: theme.colors.background.card,
              shadowColor: theme.colors.text.primary
            }]}>
              {renderSection('Budget', BUDGET_RANGES, preferences.budget || '', true)}
              {renderSection('Transport', TRANSPORT_MODES, preferences.transportModes || [])}
              {renderSection('Climat', CLIMATE_PREFERENCES, preferences.climatePreference || '', true)}
              {renderSection('Durée', TRIP_DURATIONS, preferences.tripDuration || '', true)}
              {renderSection('Hébergement', ACCOMMODATION_TYPES, preferences.accommodationTypes || [])}
              {renderSection('Centres d\'Intérêt', INTERESTS, preferences.interests || [])}
              {renderSection('Restrictions Alimentaires', DIETARY_RESTRICTIONS, preferences.dietaryRestrictions || [])}
              {renderSection('Accessibilité', ACCESSIBILITY_NEEDS, preferences.accessibilityNeeds || [])}
            </View>

            <View style={screenStyles.buttonContainer}>
              <TouchableOpacity
                style={[
                  screenStyles.saveButton,
                  {
                    opacity: (loading || !hasSelectedPreferences()) ? 0.7 : 1,
                    backgroundColor: theme.colors.primary[0]
                  }
                ]}
                onPress={handleSave}
                disabled={loading || !hasSelectedPreferences()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={screenStyles.saveButtonText}>
                    Enregistrer
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[screenStyles.skipButton]}
                onPress={handleSkip}
              >
                <Text style={[screenStyles.skipButtonText, { color: theme.colors.text.secondary }]}>
                  Ignorer
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window'); 