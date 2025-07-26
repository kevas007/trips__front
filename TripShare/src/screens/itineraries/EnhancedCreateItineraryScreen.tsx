import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import LocationSearchInput from '../../components/places/LocationSearchInput';
// import DateTimePicker from '@react-native-community/datetimepicker';

interface TripStep {
  id: string;
  title: string;
  description: string;
  location: any; // Change Location to any
  startTime: string;
  endTime: string;
  duration: number; // minutes
  stepType: 'transport' | 'activity' | 'accommodation' | 'meal' | 'other';
  estimatedCost: number;
  currency: string;
  notes: string;
  order: number;
}

interface CreateItineraryScreenProps {
  navigation: any;
  route?: any;
}

const EnhancedCreateItineraryScreen: React.FC<CreateItineraryScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useSimpleAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState<any | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [isPublic, setIsPublic] = useState(true);
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [steps, setSteps] = useState<TripStep[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<TripStep | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step creation state
  const [stepTitle, setStepTitle] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [stepLocation, setStepLocation] = useState<any | null>(null);
  const [stepStartTime, setStepStartTime] = useState('09:00');
  const [stepEndTime, setStepEndTime] = useState('18:00');
  const [stepType, setStepType] = useState<TripStep['stepType']>('activity');
  const [stepCost, setStepCost] = useState('');
  const [stepNotes, setStepNotes] = useState('');
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [stepDuration, setStepDuration] = useState(0);
  const [tempHours, setTempHours] = useState(0);
  const [tempMinutes, setTempMinutes] = useState(0);

  const stepTypes = [
    { key: 'transport', label: 'Transport', icon: 'car-outline', color: '#3498db' },
    { key: 'activity', label: 'Activité', icon: 'compass-outline', color: '#e74c3c' },
    { key: 'accommodation', label: 'Hébergement', icon: 'bed-outline', color: '#2ecc71' },
    { key: 'meal', label: 'Repas', icon: 'restaurant-outline', color: '#f39c12' },
    { key: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline', color: '#95a5a6' },
  ];

  const travelStyles = [
    'Culture', 'Aventure', 'Détente', 'Gastronomie', 'Nature', 'Ville', 
    'Plage', 'Montagne', 'Budget', 'Luxe', 'Famille', 'Solo'
  ];

  useEffect(() => {
    // Initialize from route params if editing existing trip
    if (route?.params?.trip) {
      const trip = route.params.trip;
      setTitle(trip.title);
      setDescription(trip.description || '');
      setDestination(trip.destination);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setBudget(trip.budget?.toString() || '');
      setIsPublic(trip.isPublic);
      setSteps(trip.steps || []);
    }
  }, [route?.params]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!destination) {
      newErrors.destination = 'La destination est requise';
    }

    if (!startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    if (!endDate) {
      newErrors.endDate = 'La date de fin est requise';
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateItinerary = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);
    try {
      const itineraryData = {
        title: title.trim(),
        description: description.trim(),
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: budget ? parseFloat(budget) : null,
        currency,
        is_public: isPublic,
        travel_categories: travelStyle,
        steps: steps.map(step => ({
          title: step.title,
          description: step.description,
          location: step.location,
          start_time: step.startTime,
          end_time: step.endTime,
          duration: step.duration,
          step_type: step.stepType,
          estimated_cost: step.estimatedCost,
          currency: step.currency,
          notes: step.notes,
          order: step.order,
        })),
      };

      // Here you would call the API to create the trip
      console.log('Creating itinerary:', itineraryData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Succès !',
        'Votre itinéraire a été créé avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating itinerary:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'itinéraire. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const openStepModal = (step?: TripStep) => {
    if (step) {
      setEditingStep(step);
      setStepTitle(step.title);
      setStepDescription(step.description);
      setStepLocation(step.location);
      setStepStartTime(step.startTime);
      setStepEndTime(step.endTime);
      setStepType(step.stepType);
      setStepCost(step.estimatedCost.toString());
      setStepNotes(step.notes);
      setStepDuration(step.duration || 0);
      setTempHours(Math.floor((step.duration || 0) / 60));
      setTempMinutes((step.duration || 0) % 60);
    } else {
      setEditingStep(null);
      setStepTitle('');
      setStepDescription('');
      setStepLocation(null);
      setStepStartTime('09:00');
      setStepEndTime('18:00');
      setStepType('activity');
      setStepCost('');
      setStepNotes('');
      setStepDuration(0);
      setTempHours(0);
      setTempMinutes(0);
    }
    setShowStepModal(true);
  };

  const resetStepForm = () => {
    setStepTitle('');
    setStepDescription('');
    setStepLocation(null);
    setStepStartTime('09:00');
    setStepEndTime('18:00');
    setStepType('activity');
    setStepCost('');
    setStepNotes('');
  };

  const handleSaveStep = () => {
    if (!stepTitle.trim()) {
      Alert.alert('Erreur', 'Le titre de l\'étape est requis');
      return;
    }

    const newStep: TripStep = {
      id: editingStep?.id || Math.random().toString(36).substr(2, 9),
      title: stepTitle.trim(),
      description: stepDescription.trim(),
      location: stepLocation,
      startTime: stepStartTime,
      endTime: stepEndTime,
      duration: stepDuration, // Stocke la durée en minutes
      stepType,
      estimatedCost: parseFloat(stepCost) || 0,
      currency,
      notes: stepNotes.trim(),
      order: editingStep?.order || steps.length + 1,
    };

    if (editingStep) {
      setSteps(prev => prev.map(step => step.id === editingStep.id ? newStep : step));
    } else {
      setSteps(prev => [...prev, newStep]);
    }

    setShowStepModal(false);
    resetStepForm();
  };

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, endMinutes - startMinutes);
  };

  const removeStep = (stepId: string) => {
    Alert.alert(
      'Supprimer l\'étape',
      'Êtes-vous sûr de vouloir supprimer cette étape ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setSteps(prev => prev.filter(step => step.id !== stepId)),
        },
      ]
    );
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // Update order
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    setSteps(newSteps);
  };

  const renderStepItem = ({ item, index }: { item: TripStep; index: number }) => {
    const stepTypeInfo = stepTypes.find(type => type.key === item.stepType);
    
    return (
      <View style={[styles.stepItem, { backgroundColor: theme.colors.background.card }]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepTypeIndicator}>
            <Ionicons 
              name={stepTypeInfo?.icon as any} 
              size={20} 
              color={stepTypeInfo?.color || theme.colors.primary[0]} 
            />
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              {item.title}
            </Text>
            <Text style={[styles.stepTime, { color: theme.colors.text.secondary }]}>
              {item.startTime} - {item.endTime} ({Math.floor(item.duration / 60)}h{item.duration % 60 > 0 ? `${item.duration % 60}m` : ''})
            </Text>
            {item.location && (
              <Text style={[styles.stepLocation, { color: theme.colors.text.secondary }]}>
                📍 {item.location.formatted_address || item.location.address}
              </Text>
            )}
            {item.estimatedCost > 0 && (
              <Text style={[styles.stepCost, { color: theme.colors.text.secondary }]}>
                💰 {item.estimatedCost}€
              </Text>
            )}
          </View>
          <View style={styles.stepActions}>
            <TouchableOpacity onPress={() => moveStep(item.id, 'up')} disabled={index === 0}>
              <Ionicons 
                name="chevron-up" 
                size={20} 
                color={index === 0 ? theme.colors.text.secondary : theme.colors.primary[0]} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveStep(item.id, 'down')} disabled={index === steps.length - 1}>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={index === steps.length - 1 ? theme.colors.text.secondary : theme.colors.primary[0]} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openStepModal(item)}>
              <Ionicons name="pencil" size={20} color={theme.colors.primary[0]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeStep(item.id)}>
              <Ionicons name="trash" size={20} color={theme.colors.semantic.error} />
            </TouchableOpacity>
          </View>
        </View>
        {item.description && (
          <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
            {item.description}
          </Text>
        )}
      </View>
    );
  };

  const renderStepModal = () => (
    <Modal
      visible={showStepModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowStepModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border.primary }]}>
          <TouchableOpacity onPress={() => setShowStepModal(false)}>
            <Text style={[styles.modalCancel, { color: theme.colors.text.secondary }]}>
              Annuler
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
            {editingStep ? 'Modifier l\'étape' : 'Nouvelle étape'}
          </Text>
          <TouchableOpacity onPress={handleSaveStep}>
            <Text style={[styles.modalSave, { color: theme.colors.primary[0] }]}>
              Sauvegarder
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Step Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Type d'étape</Text>
            <View style={styles.stepTypeGrid}>
              {stepTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.stepTypeButton,
                    {
                      backgroundColor: stepType === type.key ? type.color : theme.colors.background.card,
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() => setStepType(type.key as any)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={24} 
                    color={stepType === type.key ? 'white' : type.color} 
                  />
                  <Text 
                    style={[
                      styles.stepTypeLabel,
                      { color: stepType === type.key ? 'white' : type.color }
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Step Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Titre *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.primary,
                color: theme.colors.text.primary,
              }]}
              placeholder="Ex: Visite de la Tour Eiffel"
              placeholderTextColor={theme.colors.text.secondary}
              value={stepTitle}
              onChangeText={setStepTitle}
            />
          </View>

          {/* Step Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.primary,
                color: theme.colors.text.primary,
              }]}
              placeholder="Décrivez cette étape de votre voyage..."
              placeholderTextColor={theme.colors.text.secondary}
              value={stepDescription}
              onChangeText={setStepDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Lieu</Text>
            <LocationSearchInput
              value={stepLocation}
              onLocationSelect={setStepLocation}
              placeholder="Rechercher un lieu..."
            />
          </View>

          {/* Time Range */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Horaires</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeInputContainer}>
                <Text style={[styles.timeLabel, { color: theme.colors.text.secondary }]}>De</Text>
                <TextInput
                  style={[styles.timeInput, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  }]}
                  placeholder="09:00"
                  value={stepStartTime}
                  onChangeText={setStepStartTime}
                />
              </View>
              <View style={styles.timeInputContainer}>
                <Text style={[styles.timeLabel, { color: theme.colors.text.secondary }]}>À</Text>
                <TextInput
                  style={[styles.timeInput, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  }]}
                  placeholder="18:00"
                  value={stepEndTime}
                  onChangeText={setStepEndTime}
                />
              </View>
              <View style={styles.durationContainer}>
                <Text style={[styles.durationText, { color: theme.colors.text.secondary }]}>Durée : {Math.floor(stepDuration / 60)}h {stepDuration % 60}min</Text>
                <TouchableOpacity onPress={() => setShowDurationPicker(true)}>
                  <Text style={{ color: theme.colors.primary[0], marginTop: 4 }}>Choisir la durée</Text>
                </TouchableOpacity>
                {showDurationPicker && (
                  <View style={styles.durationPickerContainer}>
                    <View style={styles.durationPickerRow}>
                      <Text style={[styles.durationLabel, { color: theme.colors.text.primary }]}>Heures:</Text>
                      <View style={styles.durationButtons}>
                        <TouchableOpacity 
                          style={[styles.durationButton, { backgroundColor: theme.colors.background.card }]}
                          onPress={() => setTempHours(Math.max(0, tempHours - 1))}
                        >
                          <Text style={{ color: theme.colors.text.primary }}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.durationValue, { color: theme.colors.text.primary }]}>{tempHours}</Text>
                        <TouchableOpacity 
                          style={[styles.durationButton, { backgroundColor: theme.colors.background.card }]}
                          onPress={() => setTempHours(tempHours + 1)}
                        >
                          <Text style={{ color: theme.colors.text.primary }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.durationPickerRow}>
                      <Text style={[styles.durationLabel, { color: theme.colors.text.primary }]}>Minutes:</Text>
                      <View style={styles.durationButtons}>
                        <TouchableOpacity 
                          style={[styles.durationButton, { backgroundColor: theme.colors.background.card }]}
                          onPress={() => setTempMinutes(Math.max(0, tempMinutes - 15))}
                        >
                          <Text style={{ color: theme.colors.text.primary }}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.durationValue, { color: theme.colors.text.primary }]}>{tempMinutes}</Text>
                        <TouchableOpacity 
                          style={[styles.durationButton, { backgroundColor: theme.colors.background.card }]}
                          onPress={() => setTempMinutes(Math.min(59, tempMinutes + 15))}
                        >
                          <Text style={{ color: theme.colors.text.primary }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.durationPickerActions}>
                      <TouchableOpacity 
                        style={[styles.durationActionButton, { backgroundColor: theme.colors.background.card }]}
                        onPress={() => setShowDurationPicker(false)}
                      >
                        <Text style={{ color: theme.colors.text.secondary }}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.durationActionButton, { backgroundColor: theme.colors.primary[0] }]}
                        onPress={() => {
                          setStepDuration(tempHours * 60 + tempMinutes);
                          setShowDurationPicker(false);
                        }}
                      >
                        <Text style={{ color: 'white' }}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Cost */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Coût estimé</Text>
            <View style={styles.costRow}>
              <TextInput
                style={[styles.costInput, { 
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary,
                }]}
                placeholder="0"
                value={stepCost}
                onChangeText={setStepCost}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyText, { color: theme.colors.text.secondary }]}>€</Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Notes</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.primary,
                color: theme.colors.text.primary,
              }]}
              placeholder="Notes personnelles, conseils, réservations..."
              placeholderTextColor={theme.colors.text.secondary}
              value={stepNotes}
              onChangeText={setStepNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Créer un itinéraire
        </Text>
        <TouchableOpacity 
          onPress={handleCreateItinerary}
          disabled={isLoading || !title.trim() || !destination}
        >
          <Text style={[
            styles.saveButton, 
            { 
              color: (!title.trim() || !destination) 
                ? theme.colors.text.secondary 
                : theme.colors.primary[0] 
            }
          ]}>
            {isLoading ? 'Création...' : 'Créer'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Informations générales
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Titre du voyage *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background.card,
                  borderColor: errors.title ? theme.colors.semantic.error : theme.colors.border.primary,
                  color: theme.colors.text.primary,
                },
              ]}
              placeholder="Ex: Road trip en Toscane"
              placeholderTextColor={theme.colors.text.secondary}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && (
              <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>
                {errors.title}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Description</Text>
            <TextInput
              style={[styles.textArea, {
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.primary,
                color: theme.colors.text.primary,
              }]}
              placeholder="Décrivez votre voyage, vos objectifs, votre style..."
              placeholderTextColor={theme.colors.text.secondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Destination principale *</Text>
            <LocationSearchInput
              value={destination}
              onLocationSelect={setDestination}
              placeholder="Rechercher une destination..."
            />
          </View>

          {/* Date Range */}
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Date de début *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background.card,
                    borderColor: errors.startDate ? theme.colors.semantic.error : theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
              />
              {errors.startDate && (
                <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>
                  {errors.startDate}
                </Text>
              )}
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Date de fin *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background.card,
                    borderColor: errors.endDate ? theme.colors.semantic.error : theme.colors.border.primary,
                    color: theme.colors.text.primary,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
              />
              {errors.endDate && (
                <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>
                  {errors.endDate}
                </Text>
              )}
            </View>
          </View>

          {/* Budget */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>Budget total</Text>
            <View style={styles.budgetRow}>
              <TextInput
                style={[styles.budgetInput, {
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary,
                }]}
                placeholder="1500"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyText, { color: theme.colors.text.secondary }]}>€</Text>
            </View>
          </View>

          {/* Privacy */}
          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Rendre public</Text>
              <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
                Les autres utilisateurs pourront voir votre itinéraire
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: theme.colors.border.primary, true: theme.colors.primary[0] }}
            />
          </View>
        </View>

        {/* Steps Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Étapes du voyage ({steps.length})
            </Text>
            <TouchableOpacity 
              style={[styles.addStepButton, { backgroundColor: theme.colors.primary[0] }]}
              onPress={() => openStepModal()}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addStepText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {steps.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.background.card }]}>
              <Ionicons name="map-outline" size={48} color={theme.colors.text.secondary} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                Aucune étape ajoutée
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.secondary }]}>
                Commencez par ajouter votre première étape
              </Text>
            </View>
          ) : (
            <FlatList
              data={steps}
              renderItem={renderStepItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>
      </ScrollView>

      {renderStepModal()}
    </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpText: {
    fontSize: 14,
    marginTop: 2,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addStepText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  stepItem: {
    borderRadius: 12,
    padding: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  stepLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  stepCost: {
    fontSize: 14,
  },
  stepDescription: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 52,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  stepTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stepTypeButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  stepTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  durationContainer: {
    flex: 1,
  },
  durationText: {
    fontSize: 14,
    textAlign: 'center',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  durationPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  durationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  durationButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  durationPickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  durationActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default EnhancedCreateItineraryScreen; 