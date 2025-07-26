import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import SimpleMapView from '../places/SimpleMapView';

const { width, height } = Dimensions.get('window');

interface Location {
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formatted_address?: string;
}

interface TripStep {
  id: string;
  title: string;
  description: string;
  location?: Location;
  startTime?: string;
  endTime?: string;
  duration?: number;
  stepType: 'transport' | 'activity' | 'accommodation' | 'meal' | 'other';
  estimatedCost?: number;
  currency?: string;
  notes?: string;
  order: number;
  photos?: string[];
}

interface Itinerary {
  id: string;
  title: string;
  description?: string;
  destination: Location;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
  steps: TripStep[];
  isPublic: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    likes: number;
    views: number;
    saves: number;
  };
}

interface ItineraryViewerProps {
  itinerary: Itinerary;
  onSave?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onDuplicate?: () => void;
  showActions?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
}

const ItineraryViewer: React.FC<ItineraryViewerProps> = ({
  itinerary,
  onSave,
  onLike,
  onShare,
  onDuplicate,
  showActions = true,
  isLiked = false,
  isSaved = false,
}) => {
  const { theme } = useAppTheme();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState(itinerary.destination.coordinates);
  const scrollViewRef = useRef<ScrollView>(null);

  const stepTypes = {
    transport: { icon: 'car-outline', color: '#3498db', label: 'Transport' },
    activity: { icon: 'compass-outline', color: '#e74c3c', label: 'Activité' },
    accommodation: { icon: 'bed-outline', color: '#2ecc71', label: 'Hébergement' },
    meal: { icon: 'restaurant-outline', color: '#f39c12', label: 'Repas' },
    other: { icon: 'ellipsis-horizontal-outline', color: '#95a5a6', label: 'Autre' },
  };

  const calculateTotalCost = () => {
    return itinerary.steps.reduce((total, step) => total + (step.estimatedCost || 0), 0);
  };

  const calculateTotalDuration = () => {
    const totalMinutes = itinerary.steps.reduce((total, step) => total + (step.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  const getStepsByDay = () => {
    const startDate = new Date(itinerary.startDate);
    const endDate = new Date(itinerary.endDate);
    const days = [];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push({
        date: new Date(date),
        dateString: date.toISOString().split('T')[0],
        steps: itinerary.steps.filter(step => {
          // Simple logic - distribute steps evenly across days
          // In a real app, you'd use actual dates from the steps
          const stepIndex = itinerary.steps.indexOf(step);
          const dayIndex = Math.floor(stepIndex / Math.ceil(itinerary.steps.length / days.length));
          return dayIndex === days.length;
        }),
      });
    }
    
    return days;
  };

  const handleStepPress = (step: TripStep) => {
    setActiveStep(activeStep === step.id ? null : step.id);
    
    if (step.location && step.location.coordinates) {
      setMapCenter(step.location.coordinates);
      if (!showMap) {
        setShowMap(true);
      }
    }
  };

  const handleShareItinerary = async () => {
    try {
      const totalCost = calculateTotalCost();
      const duration = calculateTotalDuration();
      
      const shareText = `Découvrez cet itinéraire : ${itinerary.title}\n\n` +
        `📍 Destination : ${itinerary.destination.formatted_address || itinerary.destination.city}\n` +
        `📅 Durée : ${Math.ceil((new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours\n` +
        `💰 Budget estimé : ${totalCost}€\n` +
        `⏰ Temps total : ${duration.hours}h${duration.minutes > 0 ? `${duration.minutes}m` : ''}\n\n` +
        `Créé par ${itinerary.author.name} sur TripShare`;

      await Share.share({
        message: shareText,
        title: itinerary.title,
      });

      onShare?.();
    } catch (error) {
      console.error('Error sharing itinerary:', error);
    }
  };

  const renderStepItem = (step: TripStep, isActive: boolean) => {
    const stepType = stepTypes[step.stepType];
    
    return (
      <TouchableOpacity
        key={step.id}
        style={[
          styles.stepItem,
          {
            backgroundColor: isActive ? theme.colors.primary[0] + '20' : theme.colors.background.card,
            borderColor: isActive ? theme.colors.primary[0] : 'transparent',
          },
        ]}
        onPress={() => handleStepPress(step)}
        activeOpacity={0.7}
      >
        <View style={styles.stepHeader}>
          <View style={[styles.stepTypeIcon, { backgroundColor: stepType.color }]}>
            <Ionicons name={stepType.icon as any} size={20} color="white" />
          </View>
          
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              {step.title}
            </Text>
            
            {step.startTime && step.endTime && (
              <View style={styles.stepTimeContainer}>
                <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                <Text style={[styles.stepTime, { color: theme.colors.text.secondary }]}>
                  {step.startTime} - {step.endTime}
                </Text>
                {step.duration && (
                  <Text style={[styles.stepDuration, { color: theme.colors.text.secondary }]}>
                    ({Math.floor(step.duration / 60)}h{step.duration % 60 > 0 ? `${step.duration % 60}m` : ''})
                  </Text>
                )}
              </View>
            )}
            
            {step.location && (
              <View style={styles.stepLocationContainer}>
                <Ionicons name="location-outline" size={14} color={theme.colors.text.secondary} />
                <Text style={[styles.stepLocation, { color: theme.colors.text.secondary }]}>
                  {step.location.formatted_address || step.location.address}
                </Text>
              </View>
            )}
            
            {step.estimatedCost && step.estimatedCost > 0 && (
              <View style={styles.stepCostContainer}>
                <Ionicons name="card-outline" size={14} color={theme.colors.text.secondary} />
                <Text style={[styles.stepCost, { color: theme.colors.text.secondary }]}>
                  {step.estimatedCost} {step.currency || 'EUR'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.stepActions}>
            <Ionicons 
              name={isActive ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.text.secondary} 
            />
          </View>
        </View>
        
        {isActive && (
          <View style={styles.stepDetails}>
            {step.description && (
              <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
                {step.description}
              </Text>
            )}
            
            {step.notes && (
              <View style={styles.stepNotes}>
                <Text style={[styles.stepNotesTitle, { color: theme.colors.text.primary }]}>
                  Notes :
                </Text>
                <Text style={[styles.stepNotesText, { color: theme.colors.text.secondary }]}>
                  {step.notes}
                </Text>
              </View>
            )}
            
            {step.location && (
              <TouchableOpacity 
                style={[styles.viewOnMapButton, { borderColor: theme.colors.primary[0] }]}
                onPress={() => {
                  if (step.location?.coordinates) {
                    setMapCenter(step.location.coordinates);
                    setShowMap(true);
                  }
                }}
              >
                <Ionicons name="map-outline" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.viewOnMapText, { color: theme.colors.primary[0] }]}>
                  Voir sur la carte
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMapModal = () => (
    <Modal
      visible={showMap}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowMap(false)}
    >
      <View style={[styles.mapModalContainer, { backgroundColor: theme.colors.background.primary }]}>
        <View style={[styles.mapModalHeader, { borderBottomColor: theme.colors.border.primary }]}>
          <TouchableOpacity onPress={() => setShowMap(false)}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.mapModalTitle, { color: theme.colors.text.primary }]}>
            Carte de l'itinéraire
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.mapContainer}>
          <SimpleMapView
            latitude={mapCenter.latitude}
            longitude={mapCenter.longitude}
            zoom={13}
            title={itinerary.title}
            description={itinerary.description}
          />
          
          {/* Map overlay with step markers */}
          <View style={styles.mapOverlay}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.mapStepsScroll}
            >
              {itinerary.steps
                .filter(step => step.location?.coordinates)
                .map((step, index) => {
                  const stepType = stepTypes[step.stepType];
                  return (
                    <TouchableOpacity
                      key={step.id}
                      style={[
                        styles.mapStepCard,
                        { backgroundColor: theme.colors.background.card }
                      ]}
                      onPress={() => {
                        if (step.location?.coordinates) {
                          setMapCenter(step.location.coordinates);
                        }
                      }}
                    >
                      <View style={[styles.mapStepIcon, { backgroundColor: stepType.color }]}>
                        <Ionicons name={stepType.icon as any} size={16} color="white" />
                      </View>
                      <Text style={[styles.mapStepTitle, { color: theme.colors.text.primary }]}>
                        {step.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              }
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {itinerary.title}
          </Text>
          <Text style={[styles.destination, { color: theme.colors.text.secondary }]}>
            📍 {itinerary.destination.formatted_address || itinerary.destination.city}
          </Text>
          <Text style={[styles.dates, { color: theme.colors.text.secondary }]}>
            📅 {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
          </Text>
        </View>
        
        {showActions && (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background.card }]}
              onPress={() => setShowMap(true)}
            >
              <Ionicons name="map-outline" size={20} color={theme.colors.primary[0]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background.card }]}
              onPress={handleShareItinerary}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.primary[0]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background.card }]}
              onPress={onSave}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isSaved ? theme.colors.semantic.warning : theme.colors.primary[0]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background.card }]}
              onPress={onLike}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? theme.colors.semantic.error : theme.colors.primary[0]} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.background.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {Math.ceil((new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) / (1000 * 60 * 60 * 24))}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>jours</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {itinerary.steps.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>étapes</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {calculateTotalCost()}€
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>budget</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {(() => {
              const { hours, minutes } = calculateTotalDuration();
              return hours > 0 ? `${hours}h` : `${minutes}m`;
            })()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>durée</Text>
        </View>
      </View>

      {/* Description */}
      {itinerary.description && (
        <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.descriptionText, { color: theme.colors.text.secondary }]}>
            {itinerary.description}
          </Text>
        </View>
      )}

      {/* Steps */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.stepsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepsHeader}>
          <Text style={[styles.stepsTitle, { color: theme.colors.text.primary }]}>
            Étapes du voyage
          </Text>
          {onDuplicate && (
            <TouchableOpacity 
              style={[styles.duplicateButton, { backgroundColor: theme.colors.primary[0] }]}
              onPress={onDuplicate}
            >
              <Ionicons name="copy-outline" size={16} color="white" />
              <Text style={styles.duplicateButtonText}>Dupliquer</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.timeline}>
          {itinerary.steps.map((step, index) => (
            <View key={step.id}>
              {renderStepItem(step, activeStep === step.id)}
              {index < itinerary.steps.length - 1 && (
                <View style={[styles.timelineConnector, { backgroundColor: theme.colors.border.primary }]} />
              )}
            </View>
          ))}
        </View>
        
        {/* Author */}
        <View style={[styles.authorContainer, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.authorLabel, { color: theme.colors.text.secondary }]}>
            Créé par
          </Text>
          <Text style={[styles.authorName, { color: theme.colors.text.primary }]}>
            {itinerary.author.name}
          </Text>
        </View>
      </ScrollView>

      {renderMapModal()}
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  destination: {
    fontSize: 16,
    marginBottom: 2,
  },
  dates: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  descriptionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  duplicateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  duplicateButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  timeline: {
    paddingBottom: 20,
  },
  stepItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  stepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepTime: {
    fontSize: 14,
    marginLeft: 4,
  },
  stepDuration: {
    fontSize: 14,
    marginLeft: 4,
  },
  stepLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepLocation: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  stepCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCost: {
    fontSize: 14,
    marginLeft: 4,
  },
  stepActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  stepNotes: {
    marginBottom: 8,
  },
  stepNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepNotesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewOnMapText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  timelineConnector: {
    width: 2,
    height: 16,
    marginLeft: 34,
    marginVertical: 4,
  },
  authorContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  authorLabel: {
    fontSize: 14,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  mapModalContainer: {
    flex: 1,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  mapStepsScroll: {
    paddingHorizontal: 16,
  },
  mapStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 120,
  },
  mapStepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mapStepTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default ItineraryViewer; 