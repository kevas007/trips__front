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
import { authService } from '../services/auth';
import { UserTravelPreferences } from '../types/user';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store';
import { screenStyles } from './TravelPreferencesStyles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { SPACING } from '../design-system';

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
  const { logout, setNewUser, updatePreferences } = useAuthStore();
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

  // Debug logs
  console.log('🎯 TravelPreferencesScreen - Rendu du composant');
  console.log('🎯 TravelPreferencesScreen - Préférences actuelles:', preferences);

  // Vérifier si au moins une préférence est sélectionnée
  const hasSelectedPreferences = () => {
    const hasPrefs = preferences.budget !== '' ||
      preferences.transportModes.length > 0 ||
      preferences.climatePreference !== '' ||
      preferences.tripDuration !== '' ||
      preferences.accommodationTypes.length > 0 ||
      preferences.interests.length > 0 ||
      preferences.dietaryRestrictions.length > 0 ||
      preferences.accessibilityNeeds.length > 0;
    
    console.log('🎯 TravelPreferencesScreen - Préférences sélectionnées:', hasPrefs);
    return hasPrefs;
  };

  const toggleArrayItem = (array: string[], item: string) => {
    const index = array.indexOf(item);
    if (index === -1) {
      return [...array, item];
    }
    return [...array.slice(0, index), ...array.slice(index + 1)];
  };

  const handlePress = (optionKey: string, fieldName: keyof LocalUserPreferences) => {
    console.log('🎯 TravelPreferencesScreen - Sélection:', { optionKey, fieldName });
    console.log('🎯 TravelPreferencesScreen - Préférences avant:', preferences);

    setPreferences(prev => {
      if (fieldName === 'budget' || fieldName === 'climatePreference' || fieldName === 'tripDuration') {
        // Single selection fields
        const newPrefs = {
          ...prev,
          [fieldName]: optionKey
        };
        console.log('🎯 TravelPreferencesScreen - Nouvelle préférence (single):', newPrefs);
        return newPrefs;
      } else {
        // Multiple selection fields
        const currentArray = prev[fieldName] as string[] || [];
        const newArray = toggleArrayItem(currentArray, optionKey);
        const newPrefs = {
          ...prev,
          [fieldName]: newArray
        };
        console.log('🎯 TravelPreferencesScreen - Nouvelle préférence (multiple):', newPrefs);
        return newPrefs;
      }
    });
  };

  const handleSave = async () => {
    try {
      console.log('🎯 TravelPreferencesScreen - Début de la sauvegarde');
      setLoading(true);

      const backendPreferences = {
        activities: preferences.interests || [],
        accommodation: preferences.accommodationTypes || [],
        transportation: preferences.transportModes || [],
        food: preferences.dietaryRestrictions || [],
        budget: preferences.budget ? [preferences.budget] : [],
        climate: preferences.climatePreference ? [preferences.climatePreference] : []
      };

      console.log('🎯 TravelPreferencesScreen - Préférences à sauvegarder:', backendPreferences);

      const response = await updatePreferences(backendPreferences);
      
      if (response.success) {
        console.log('🎯 TravelPreferencesScreen - Sauvegarde réussie');
        Alert.alert(
          'Préférences enregistrées',
          'Vos préférences de voyage ont été sauvegardées avec succès.',
          [
            {
              text: 'Continuer',
              onPress: async () => {
                try {
                  console.log('🎯 TravelPreferencesScreen - Vérification du token après sauvegarde');
                  // Vérifier le token pour rafraîchir les données utilisateur
                  const user = await authService.verifyToken();
                  if (user) {
                    console.log('🎯 TravelPreferencesScreen - Token vérifié, fin de l\'onboarding');
                    // Marquer l'onboarding comme terminé
                    setNewUser(false);
                    // L'AppNavigator basculera automatiquement vers Main car isNewUser sera false
                  }
                } catch (error) {
                  console.error('🎯 TravelPreferencesScreen - Erreur lors de la vérification du token:', error);
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
      console.error('🎯 TravelPreferencesScreen - Erreur de sauvegarde:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors de la sauvegarde des préférences'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('🎯 TravelPreferencesScreen - Onboarding ignoré');
    // Marquer l'onboarding comme terminé sans sauvegarder les préférences
    setNewUser(false);
    // L'AppNavigator basculera automatiquement vers Main car isNewUser sera false
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

    const getSectionIcon = (title: string) => {
      switch (title.toLowerCase()) {
        case 'budget': return 'wallet';
        case 'transport': return 'car';
        case 'climat': return 'sunny';
        case 'durée': return 'calendar';
        case 'hébergement': return 'bed';
        case 'centres d\'intérêt': return 'heart';
        case 'restrictions alimentaires': return 'restaurant';
        case 'accessibilité': return 'accessibility';
        default: return 'options';
      }
    };

    const getSectionColor = (title: string) => {
      switch (title.toLowerCase()) {
        case 'budget': return '#FF6B6B';
        case 'transport': return '#4ECDC4';
        case 'climat': return '#45B7D1';
        case 'durée': return '#96CEB4';
        case 'hébergement': return '#FFEAA7';
        case 'centres d\'intérêt': return '#DDA0DD';
        case 'restrictions alimentaires': return '#98D8C8';
        case 'accessibilité': return '#F7DC6F';
        default: return '#007AFF';
      }
    };

    const fieldName = getFieldName(title);
    const sectionIcon = getSectionIcon(title);
    const sectionColor = getSectionColor(title);
    
    console.log('Field name pour', title, ':', fieldName);

    return (
      <View style={screenStyles.section}>
        <View style={screenStyles.sectionHeader}>
          <View style={[screenStyles.sectionIcon, { backgroundColor: sectionColor }]}>
            <Ionicons name={sectionIcon as any} size={18} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[screenStyles.sectionTitle, { 
              color: '#1A1A1A',
              fontWeight: '700',
              textShadowColor: 'rgba(255, 255, 255, 0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
              marginBottom: title.toLowerCase().includes('restrictions') ? 4 : 0,
            }]}>
              {title}
            </Text>
            {!isSingle && (
              <Text style={[screenStyles.multiSelectHint, { 
                color: '#666666',
                fontWeight: '400',
                fontSize: 13,
                marginTop: title.toLowerCase().includes('restrictions') ? 0 : 2,
                lineHeight: 16,
              }]}>
                (sélection multiple possible)
              </Text>
            )}
          </View>
        </View>
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
                    backgroundColor: isSelected ? sectionColor : '#FFFFFF',
                    borderColor: isSelected ? sectionColor : '#E0E0E0',
                    borderWidth: isSelected ? 0 : 2,
                  }
                ]}
                onPress={() => handlePress(option.key, fieldName)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={isSelected ? '#FFFFFF' : '#333333'}
                  style={screenStyles.chipIcon}
                />
                <Text style={[
                  screenStyles.chipText,
                  isSelected && screenStyles.chipTextSelected,
                  { 
                    color: isSelected ? '#FFFFFF' : '#333333',
                    fontWeight: isSelected ? '700' : '600',
                  }
                ]}>
                  {option.label}
                </Text>
                {!isSingle && (
                  <View style={[
                    screenStyles.checkmark,
                    isSelected && screenStyles.checkmarkSelected,
                    { 
                      borderColor: isSelected ? 'rgba(255, 255, 255, 0.5)' : '#CCCCCC',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'transparent'
                    }
                  ]}>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#FFFFFF"
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
          <ScrollView 
            contentContainerStyle={screenStyles.container}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={screenStyles.header}>
              <View style={[screenStyles.sectionIcon, { 
                backgroundColor: theme.colors.primary[0], 
                width: 60, 
                height: 60, 
                borderRadius: 30,
                marginBottom: SPACING.md,
                alignSelf: 'center'
              }]}>
                <Ionicons name="compass" size={28} color="#fff" />
              </View>
              <Text style={[screenStyles.title, { 
                color: '#FFFFFF',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }]}>
                Vos Préférences de Voyage
              </Text>
              <Text style={[screenStyles.subtitle, { 
                color: '#FFFFFF',
                opacity: 0.95,
                textShadowColor: 'rgba(0, 0, 0, 0.4)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                fontWeight: '500',
              }]}>
                Personnalisez votre expérience de voyage pour des recommandations adaptées à vos goûts
              </Text>
            </View>

            <View style={[screenStyles.card, {
              backgroundColor: theme.colors.background.card,
              shadowColor: theme.colors.text.primary,
              marginBottom: SPACING.xl
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
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={screenStyles.saveButtonText}>
                      Enregistrer mes préférences
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[screenStyles.skipButton]}
                onPress={handleSkip}
              >
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={[screenStyles.skipButtonText, { 
                  color: '#FFFFFF',
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Ignorer pour l'instant
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