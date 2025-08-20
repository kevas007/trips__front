import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ItinerarySuggestionsService, ItineraryStep, CityItinerarySuggestion } from '../../services/itinerarySuggestionsService';

const { width } = Dimensions.get('window');

interface AutoItinerarySuggestionsProps {
  cityName: string;
  tripDuration?: number;
  userInterests?: string[];
  onStepSelect: (step: ItineraryStep) => void;
  onAddAllSteps?: (steps: ItineraryStep[]) => void;
}

const AutoItinerarySuggestions: React.FC<AutoItinerarySuggestionsProps> = ({
  cityName,
  tripDuration = 3,
  userInterests = [],
  onStepSelect,
  onAddAllSteps,
}) => {
  const { theme } = useAppTheme();
  const [suggestions, setSuggestions] = useState<ItineraryStep[]>([]);
  const [cityInfo, setCityInfo] = useState<CityItinerarySuggestion | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [showDayByDay, setShowDayByDay] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [cityName, tripDuration, userInterests]);

  const loadSuggestions = () => {
    if (!cityName) return;

    const cityItinerary = ItinerarySuggestionsService.getItinerarySuggestions(cityName);
    setCityInfo(cityItinerary);

    if (cityItinerary) {
      const smartSuggestions = ItinerarySuggestionsService.getSmartSuggestions(cityName, {
        interests: userInterests,
        duration: tripDuration,
        travelStyle: 'cultural', // Par défaut
      });
      setSuggestions(smartSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleStepToggle = (step: ItineraryStep) => {
    const newSelected = new Set(selectedSteps);
    if (newSelected.has(step.id)) {
      newSelected.delete(step.id);
    } else {
      newSelected.add(step.id);
      onStepSelect(step);
    }
    setSelectedSteps(newSelected);
  };

  const handleAddAllSelected = () => {
    const selectedStepObjects = suggestions.filter(step => selectedSteps.has(step.id));
    if (selectedStepObjects.length === 0) {
      Alert.alert('Aucune étape sélectionnée', 'Veuillez sélectionner au moins une étape à ajouter.');
      return;
    }

    if (onAddAllSteps) {
      onAddAllSteps(selectedStepObjects);
    }
    Alert.alert('Étapes ajoutées', `${selectedStepObjects.length} étapes ont été ajoutées à votre itinéraire.`);
  };

  const getPriorityColor = (priority: ItineraryStep['priority']) => {
    switch (priority) {
      case 'must-see': return '#FF6B6B';
      case 'recommended': return '#4ECDC4';
      case 'optional': return '#95A5A6';
      default: return theme.colors.primary.main;
    }
  };

  const getCategoryIcon = (category: ItineraryStep['category']) => {
    switch (category) {
      case 'monument': return 'business-outline';
      case 'museum': return 'library-outline';
      case 'restaurant': return 'restaurant-outline';
      case 'shopping': return 'bag-outline';
      case 'nature': return 'leaf-outline';
      case 'activity': return 'bicycle-outline';
      case 'accommodation': return 'bed-outline';
      default: return 'location-outline';
    }
  };

  const renderStepCard = (step: ItineraryStep) => {
    const isSelected = selectedSteps.has(step.id);
    
    return (
      <TouchableOpacity
        key={step.id}
        style={[
          styles.stepCard,
          {
            backgroundColor: theme.colors.background.card,
            borderColor: isSelected ? theme.colors.primary.main : theme.colors.border.primary,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleStepToggle(step)}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepInfo}>
            <View style={styles.stepTitleRow}>
              <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
                {step.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(step.priority) }]}>
                <Text style={styles.priorityText}>
                  {step.priority === 'must-see' ? 'Incontournable' : 
                   step.priority === 'recommended' ? 'Recommandé' : 'Optionnel'}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              {step.description}
            </Text>

            <View style={styles.stepMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
                  {step.suggestedDuration}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name={getCategoryIcon(step.category) as any} size={14} color={theme.colors.text.secondary} />
                <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
                  {step.category}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons 
                  name={step.estimatedCost === 'free' ? 'pricetag-outline' : 'card-outline'} 
                  size={14} 
                  color={step.estimatedCost === 'free' ? '#27AE60' : theme.colors.text.secondary} 
                />
                <Text style={[
                  styles.metaText, 
                  { color: step.estimatedCost === 'free' ? '#27AE60' : theme.colors.text.secondary }
                ]}>
                  {step.estimatedCost === 'free' ? 'Gratuit' : 
                   step.estimatedCost === 'low' ? 'Pas cher' :
                   step.estimatedCost === 'medium' ? 'Moyen' : 'Cher'}
                </Text>
              </View>
            </View>

            {step.tips && (
              <Text style={[styles.stepTips, { color: theme.colors.primary.main }]}>
                💡 {step.tips}
              </Text>
            )}
          </View>

          <View style={styles.selectButton}>
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
              size={24}
              color={isSelected ? theme.colors.primary.main : theme.colors.text.secondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayByDayPlan = () => {
    if (!cityInfo) return null;

    return (
      <View style={styles.dayByDayContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📅 Plan jour par jour suggéré
        </Text>
        {cityInfo.dayByDayPlan.map((day, index) => (
          <View key={index} style={[styles.dayCard, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.dayTitle, { color: theme.colors.primary.main }]}>
              Jour {day.day}: {day.title}
            </Text>
            <Text style={[styles.dayDescription, { color: theme.colors.text.secondary }]}>
              {day.description}
            </Text>
            <View style={styles.daySteps}>
              {day.steps.map(stepId => {
                const step = suggestions.find(s => s.id === stepId);
                return step ? (
                  <Text key={stepId} style={[styles.dayStep, { color: theme.colors.text.primary }]}>
                    • {step.title}
                  </Text>
                ) : null;
              })}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (!cityName || suggestions.length === 0) {
    return (
      <View style={styles.noSuggestions}>
        <Ionicons name="map-outline" size={48} color={theme.colors.text.secondary} />
        <Text style={[styles.noSuggestionsTitle, { color: theme.colors.text.primary }]}>
          Aucune suggestion disponible
        </Text>
        <Text style={[styles.noSuggestionsText, { color: theme.colors.text.secondary }]}>
          Nous n'avons pas encore de suggestions pour cette destination. 
          Créez votre itinéraire personnalisé !
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          ✨ Suggestions pour {cityName.split(',')[0]}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          {suggestions.length} étapes suggérées • {cityInfo?.recommendedDuration}
        </Text>
      </View>

      <View style={styles.toggleButtons}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !showDayByDay && { backgroundColor: theme.colors.primary.main },
            { borderColor: theme.colors.primary.main }
          ]}
          onPress={() => setShowDayByDay(false)}
        >
          <Text style={[
            styles.toggleButtonText,
            { color: !showDayByDay ? 'white' : theme.colors.primary.main }
          ]}>
            📍 Par étapes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            showDayByDay && { backgroundColor: theme.colors.primary.main },
            { borderColor: theme.colors.primary.main }
          ]}
          onPress={() => setShowDayByDay(true)}
        >
          <Text style={[
            styles.toggleButtonText,
            { color: showDayByDay ? 'white' : theme.colors.primary.main }
          ]}>
            📅 Par jours
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showDayByDay ? renderDayByDayPlan() : (
          <View style={styles.stepsContainer}>
            {suggestions.map(renderStepCard)}
          </View>
        )}
      </ScrollView>

      {selectedSteps.size > 0 && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary.main }]}
          onPress={handleAddAllSelected}
        >
          <Text style={styles.addButtonText}>
            Ajouter {selectedSteps.size} étape{selectedSteps.size > 1 ? 's' : ''} sélectionnée{selectedSteps.size > 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  toggleButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  stepsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stepCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepInfo: {
    flex: 1,
    marginRight: 10,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  stepMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  stepTips: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  selectButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayByDayContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  dayCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  dayDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  daySteps: {
    gap: 3,
  },
  dayStep: {
    fontSize: 14,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noSuggestions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noSuggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AutoItinerarySuggestions;
