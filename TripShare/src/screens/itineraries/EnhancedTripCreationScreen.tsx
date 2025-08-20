import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store';
import { useTrips } from '../../hooks/useTripShareApi';
import EnhancedLocationSearch from '../../components/places/EnhancedLocationSearch';
import SmartDestinationSuggestions from '../../components/places/SmartDestinationSuggestions';
import AutoItinerarySuggestions from '../../components/itinerary/AutoItinerarySuggestions';
import IntelligentPlacesList from '../../components/places/IntelligentPlacesList';
import ItineraryEditor from '../../components/itinerary/ItineraryEditor';
import CustomTagInput from '../../components/tags/CustomTagInput';
import { PopularDestination } from '../../services/enhancedLocationService';
import { ItineraryStep, ItinerarySuggestionsService } from '../../services/itinerarySuggestionsService';
import { PlaceDetails, IntelligentPlacesService } from '../../services/intelligentPlacesService';
import { LocationSuggestion } from '../../components/places/LocationSearchInput';
import { AIGeneratedDestination } from '../../services/smartSuggestionsService';
// Pas besoin d'importer Tag pour l'instant, utilisons des strings

interface EnhancedTripCreationScreenProps {
  navigation: any;
}

interface TripFormData {
  title: string;
  description: string;
  destination: string;
  destinationCoords: { latitude: number; longitude: number } | null;
  startDate: Date;
  endDate: Date;
  budget?: number;
  tags: string[];
  difficulty: 'Facile' | 'Modéré' | 'Difficile';
  tripType: 'cultural' | 'beach' | 'adventure' | 'city' | 'nature';
  steps: ItineraryStep[];
}

const EnhancedTripCreationScreen: React.FC<EnhancedTripCreationScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const { createTrip } = useTrips();

  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  
  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    description: '',
    destination: '',
    destinationCoords: null,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
    budget: undefined,
    tags: [],
    difficulty: 'Modéré',
    tripType: 'city',
    steps: [],
  });

  const steps = [
    { title: 'Destination', icon: 'location-outline' },
    { title: 'Détails', icon: 'information-circle-outline' },
    { title: 'Itinéraire', icon: 'map-outline' },
    { title: 'Finalisation', icon: 'checkmark-circle-outline' },
  ];

  const handleLocationSelect = (location: LocationSuggestion | PopularDestination) => {
    let name = '';
    let coords = null;

    if ('lat' in location && 'lon' in location) {
      // LocationSuggestion
      name = location.display_name;
      coords = {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
      };
    } else if ('lat' in location && 'lng' in location) {
      // PopularDestination
      name = location.name || location.display_name;
      coords = {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    setFormData(prev => ({
      ...prev,
      destination: name,
      destinationCoords: coords,
    }));

    // Passer automatiquement à l'étape suivante si une destination populaire est sélectionnée
    if ('lng' in location) {
      setCurrentStep(1);
    }
  };

  const handleSmartDestinationSelect = (destination: AIGeneratedDestination) => {
    setFormData(prev => ({
      ...prev,
      destination: destination.name,
      destinationCoords: {
        latitude: destination.coordinates.latitude,
        longitude: destination.coordinates.longitude,
      },
    }));
  };

  const handleItineraryStepAdd = (step: ItineraryStep) => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, step],
    }));
  };

  const handlePlaceSelect = (place: PlaceDetails) => {
    // Convertir PlaceDetails en ItineraryStep
    const itineraryStep: ItineraryStep = {
      id: place.place_id,
      title: place.name,
      description: place.recommendation_reason,
      city: place.formatted_address,
      coordinates: {
        latitude: place.lat,
        longitude: place.lng,
      },
      suggestedDuration: place.estimated_duration,
      category: place.category as any,
      priority: place.popularity_score > 80 ? 'must-see' : place.popularity_score > 60 ? 'recommended' : 'optional',
      bestTimeToVisit: place.best_time_to_visit,
      estimatedCost: place.price_level ? 
        (place.price_level === 0 ? 'free' : 
         place.price_level <= 1 ? 'low' : 
         place.price_level <= 2 ? 'medium' : 'high') : 'medium',
      tips: place.local_insights.insider_tip,
      photoUrl: place.photos[0]?.url,
    };

    handleItineraryStepAdd(itineraryStep);
  };

  const handleAddAllSteps = (steps: ItineraryStep[]) => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, ...steps],
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (showDatePicker === 'start') {
        setFormData(prev => ({ ...prev, startDate: selectedDate }));
      } else if (showDatePicker === 'end') {
        setFormData(prev => ({ ...prev, endDate: selectedDate }));
      }
    }
    setShowDatePicker(null);
  };

  const handleCreateTrip = async () => {
    if (!formData.title || !formData.destination || !formData.destinationCoords || formData.steps.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires, y compris au moins une étape d\'itinéraire.');
      return;
    }

    setIsCreating(true);
    try {
      const tripData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.startDate.toISOString(),
        end_date: formData.endDate.toISOString(),
        location: {
          city: formData.destination.split(',')[0],
          country: formData.destination.split(',').pop() || '',
          latitude: formData.destinationCoords.latitude,
          longitude: formData.destinationCoords.longitude,
        },
        budget: formData.budget,
        status: 'planned',
        visibility: 'public',
        photos: ['http://localhost:8085/storage/defaults/default-trip-image.jpg'], // Photo par défaut obligatoire
        difficulty: formData.difficulty,
        tags: formData.tags,
        places_visited: formData.steps.map(step => ({
          name: step.title,
          description: step.description,
          address: step.city,
          is_visited: false,
          photos: [],
          notes: step.tips,
        })),
      };

      await createTrip.execute(tripData);
      Alert.alert('Succès', 'Votre voyage a été créé avec succès !');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur création voyage:', error);
      Alert.alert('Erreur', 'Impossible de créer le voyage. Veuillez réessayer.');
    } finally {
      setIsCreating(false);
    }
  };

  const getTripDuration = () => {
    const diffTime = Math.abs(formData.endDate.getTime() - formData.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return formData.destination !== '';
      case 1: return formData.title !== '';
      case 2: return formData.steps.length > 0; // Itinéraires obligatoires
      case 3: return true;
      default: return false;
    }
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
              size={20}
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              🌍 Où souhaitez-vous voyager ?
            </Text>
            
            <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
              Saisissez librement votre destination ou choisissez parmi nos suggestions
            </Text>
            
            <EnhancedLocationSearch
              value={formData.destination}
              onLocationSelect={handleLocationSelect}
              placeholder="Saisissez votre destination ou choisissez une suggestion..."
              showPopularDestinations={true}
              tripType={formData.tripType}
            />

            {!formData.destination && (
              <>
                <SmartDestinationSuggestions
                  onDestinationSelect={handleSmartDestinationSelect}
                  tripType={formData.tripType}
                  maxSuggestions={6}
                />
                
                {/* Option pour créer un voyage personnalisé */}
                <View style={styles.customTripSection}>
                  <View style={styles.separator}>
                    <View style={[styles.separatorLine, { backgroundColor: theme.colors.border.primary }]} />
                    <Text style={[styles.separatorText, { color: theme.colors.text.secondary }]}>
                      OU
                    </Text>
                    <View style={[styles.separatorLine, { backgroundColor: theme.colors.border.primary }]} />
                  </View>
                  
                                                        <TouchableOpacity
                     style={[styles.customTripButton, { 
                       backgroundColor: theme.colors.background.card,
                       borderColor: theme.colors.border.primary 
                     }]}
                     onPress={() => {
                       // Permettre la saisie libre en passant à l'étape suivante
                       setCurrentStep(1);
                     }}
                   >
                     <View style={styles.customTripButtonContent}>
                       <View style={styles.customTripButtonIconContainer}>
                         <Ionicons 
                           name="add-circle-outline" 
                           size={28} 
                           color={theme.colors.primary[0]} 
                         />
                       </View>
                       <Text style={[styles.customTripButtonText, { color: theme.colors.text.primary }]}>
                         Créer un voyage personnalisé
                       </Text>
                       <Text style={[styles.customTripButtonSubtext, { color: theme.colors.text.secondary }]}>
                         Saisissez librement votre destination
                       </Text>
                     </View>
                   </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        );

      case 1:
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              ✏️ Détails de votre voyage
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Titre du voyage *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary 
                }]}
                placeholder="Ex: Week-end à Paris"
                placeholderTextColor={theme.colors.text.secondary}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Description
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary 
                }]}
                placeholder="Décrivez votre voyage..."
                placeholderTextColor={theme.colors.text.secondary}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Date de début
                </Text>
                <TouchableOpacity
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                  }]}
                  onPress={() => setShowDatePicker('start')}
                >
                  <Text style={{ color: theme.colors.text.primary }}>
                    {formData.startDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Date de fin
                </Text>
                <TouchableOpacity
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                  }]}
                  onPress={() => setShowDatePicker('end')}
                >
                  <Text style={{ color: theme.colors.text.primary }}>
                    {formData.endDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Budget (optionnel)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary 
                }]}
                placeholder="Budget en €"
                placeholderTextColor={theme.colors.text.secondary}
                value={formData.budget?.toString() || ''}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  budget: text ? parseInt(text) : undefined 
                }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                Tags
              </Text>
              <View style={[styles.input, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.primary }]}>
                <TextInput
                  style={{ color: theme.colors.text.primary, fontSize: 16 }}
                  placeholder="Tapez vos tags séparés par des virgules..."
                  placeholderTextColor={theme.colors.text.secondary}
                  value={formData.tags.join(', ')}
                  onChangeText={(text) => {
                    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                    setFormData(prev => ({ ...prev, tags }));
                  }}
                />
              </View>
            </View>
          </ScrollView>
        );

             case 2:
         return (
           <ScrollView 
             style={styles.stepContent} 
             showsVerticalScrollIndicator={false}
             contentContainerStyle={{ paddingBottom: 100 }}
           >
             <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
               🗺️ Créer votre itinéraire *
             </Text>
             <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
               Durée: {getTripDuration()} jours • {formData.destination}
             </Text>

             {/* Éditeur d'itinéraire complet */}
             <View style={styles.itinerarySection}>
               <ItineraryEditor
                 steps={formData.steps}
                 onStepsChange={(newSteps) => {
                   console.log('Nouvelles étapes:', newSteps);
                   setFormData(prev => ({ ...prev, steps: newSteps }));
                 }}
                 destination={formData.destination}
               />
             </View>

             {/* Suggestions automatiques si disponibles */}
             {formData.steps.length === 0 && (
               <View style={styles.suggestionsSection}>
                 <Text style={[styles.suggestionsTitle, { color: theme.colors.text.primary }]}>
                   💡 Suggestions automatiques
                 </Text>
                 
                 {IntelligentPlacesService.hasSuggestions(formData.destination) ? (
                   <IntelligentPlacesList
                     cityName={formData.destination}
                     onPlaceSelect={handlePlaceSelect}
                     userProfile={{
                       interests: formData.tags,
                       travel_style: 'cultural',
                       budget: 'medium',
                     }}
                     maxPlaces={6}
                     showCategories={true}
                     allowSearch={true}
                   />
                 ) : ItinerarySuggestionsService.hasSuggestions(formData.destination) ? (
                   <AutoItinerarySuggestions
                     cityName={formData.destination}
                     tripDuration={getTripDuration()}
                     userInterests={formData.tags}
                     onStepSelect={handleItineraryStepAdd}
                     onAddAllSteps={handleAddAllSteps}
                   />
                 ) : (
                   <View style={styles.noSuggestions}>
                     <Ionicons name="bulb-outline" size={32} color={theme.colors.text.secondary} />
                     <Text style={[styles.noSuggestionsText, { color: theme.colors.text.secondary }]}>
                       Aucune suggestion automatique disponible
                     </Text>
                     <Text style={[styles.noSuggestionsSubtext, { color: theme.colors.text.secondary }]}>
                       Créez votre itinéraire personnalisé en ajoutant des étapes manuellement
                     </Text>
                   </View>
                 )}
               </View>
             )}
           </ScrollView>
         );

      case 3:
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              🎯 Récapitulatif
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.background.card }]}>
              <Text style={[styles.summaryTitle, { color: theme.colors.primary[0] }]}>
                {formData.title}
              </Text>
              <Text style={[styles.summaryDestination, { color: theme.colors.text.primary }]}>
                📍 {formData.destination}
              </Text>
              <Text style={[styles.summaryDates, { color: theme.colors.text.secondary }]}>
                📅 {formData.startDate.toLocaleDateString()} - {formData.endDate.toLocaleDateString()} 
                ({getTripDuration()} jours)
              </Text>
              
              {formData.budget && (
                <Text style={[styles.summaryBudget, { color: theme.colors.text.secondary }]}>
                  💰 Budget: {formData.budget}€
                </Text>
              )}

              {formData.description && (
                <Text style={[styles.summaryDescription, { color: theme.colors.text.secondary }]}>
                  {formData.description}
                </Text>
              )}

              {formData.tags.length > 0 && (
                <View style={styles.summaryTags}>
                  {formData.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: `${theme.colors.primary[0]}20` }]}>
                      <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {formData.steps.length > 0 && (
                <View style={styles.summarySteps}>
                  <Text style={[styles.summaryStepsTitle, { color: theme.colors.text.primary }]}>
                    📋 Étapes prévues ({formData.steps.length})
                  </Text>
                  {formData.steps.slice(0, 3).map((step, index) => (
                    <Text key={index} style={[styles.summaryStep, { color: theme.colors.text.secondary }]}>
                      • {step.title}
                    </Text>
                  ))}
                  {formData.steps.length > 3 && (
                    <Text style={[styles.summaryMore, { color: theme.colors.primary[0] }]}>
                      +{formData.steps.length - 3} autres étapes
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close-outline" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Créer un voyage
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <View style={styles.content}>
          {renderStepContent()}
        </View>

        {/* Navigation Buttons */}
        <View style={[styles.navigationButtons, { backgroundColor: theme.colors.background.primary }]}>
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
                handleCreateTrip();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceedToNext() || isCreating}
          >
            <Text style={styles.nextButtonText}>
              {isCreating ? 'Création...' : currentStep === steps.length - 1 ? 'Créer le voyage' : 'Suivant'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={showDatePicker === 'start' ? formData.startDate : formData.endDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
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
  dateRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
  },
  noSuggestions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noSuggestionsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSuggestionsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  summaryDestination: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  summaryDates: {
    fontSize: 14,
    marginBottom: 5,
  },
  summaryBudget: {
    fontSize: 14,
    marginBottom: 10,
  },
  summaryDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  summaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summarySteps: {
    marginTop: 10,
  },
  summaryStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryStep: {
    fontSize: 14,
    marginBottom: 3,
    marginLeft: 10,
  },
  summaryMore: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    marginTop: 5,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
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
  // Styles pour l'option de voyage personnalisé
  customTripSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  customTripButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 15,
  },
  customTripButtonContent: {
    alignItems: 'center',
  },
  customTripButtonIconContainer: {
    marginBottom: 12,
  },
  customTripButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  customTripButtonSubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  suggestionsSection: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  itinerarySection: {
    marginBottom: 20,
  },
});

export default EnhancedTripCreationScreen;
