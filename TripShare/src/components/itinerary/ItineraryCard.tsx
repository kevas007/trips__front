import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import * as Clipboard from 'expo-clipboard';

interface TripStep {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  location?: string;
  order: number;
}

interface TripInfo {
  id: string;
  destination: string;
  duration: string;
  budget: string;
  latitude?: number;
  longitude?: number;
  steps?: TripStep[];
  highlights?: string[];
  difficulty?: string;
  bestTime?: string;
}

interface ItineraryCardProps {
  tripInfo: TripInfo;
  userName: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onSaveItinerary?: () => void;
  showMap?: boolean;
  onToggleMap?: () => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({
  tripInfo,
  userName,
  isExpanded = false,
  onToggleExpanded,
  onSaveItinerary,
  showMap = false,
  onToggleMap,
}) => {
  const { theme } = useAppTheme();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const copyItinerary = () => {
    if (!tripInfo.steps) return;
    
    let text = `🌍 ITINÉRAIRE - ${tripInfo.destination}\n`;
    text += `⏱️ Durée : ${tripInfo.duration}\n`;
    text += `💰 Budget : ${tripInfo.budget}\n`;
    text += `🌟 Difficulté : ${tripInfo.difficulty}\n`;
    text += `📅 Meilleure période : ${tripInfo.bestTime}\n\n`;
    
    text += `📍 ÉTAPES :\n`;
    tripInfo.steps.forEach((step, idx) => {
      text += `${idx + 1}. ${step.title}`;
      if (step.location) text += ` (${step.location})`;
      if (step.duration) text += ` - ${step.duration}`;
      if (step.description) text += `\n   ${step.description}`;
      text += '\n';
    });
    
    if (tripInfo.highlights && tripInfo.highlights.length > 0) {
      text += `\n✨ POINTS FORTS :\n`;
      tripInfo.highlights.forEach(highlight => {
        text += `• ${highlight}\n`;
      });
    }
    
    text += `\n💡 Partagé depuis TripShare par ${userName}`;
    
    Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Itinéraire copié ! 📋', ToastAndroid.SHORT);
    } else {
      Alert.alert('Succès', 'Itinéraire copié dans le presse-papiers ! 📋');
    }
  };

  const handleStepPress = (stepId: string) => {
    setSelectedStepId(selectedStepId === stepId ? null : stepId);
  };

  const renderStepDetails = (step: TripStep) => {
    const isSelected = selectedStepId === step.id;
    
    return (
      <TouchableOpacity
        key={step.id}
        style={[
          styles.stepItem,
          isSelected && styles.stepItemSelected,
          { backgroundColor: isSelected ? theme.colors.primary[0] + '10' : 'transparent' }
        ]}
        onPress={() => handleStepPress(step.id)}
        activeOpacity={0.7}
      >
        <View style={styles.stepHeader}>
          <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary[0] }]}>
            <Text style={styles.stepNumberText}>{step.order}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              {step.title}
            </Text>
            {step.location && (
              <View style={styles.stepLocationRow}>
                <Ionicons name="location" size={12} color={theme.colors.text.secondary} />
                <Text style={[styles.stepLocation, { color: theme.colors.text.secondary }]}>
                  {step.location}
                </Text>
              </View>
            )}
            {step.duration && (
              <View style={styles.stepDurationRow}>
                <Ionicons name="time" size={12} color={theme.colors.primary[0]} />
                <Text style={[styles.stepDuration, { color: theme.colors.primary[0] }]}>
                  {step.duration}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.expandStepButton}>
            <Ionicons
              name={isSelected ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        
        {isSelected && step.description && (
          <View style={styles.stepDescription}>
            <Text style={[styles.stepDescriptionText, { color: theme.colors.text.secondary }]}>
              {step.description}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHighlights = () => {
    if (!tripInfo.highlights || tripInfo.highlights.length === 0) return null;
    
    return (
      <View style={styles.highlightsContainer}>
        <Text style={[styles.highlightsTitle, { color: theme.colors.text.primary }]}>
          ✨ Points forts
        </Text>
        <View style={styles.highlightsGrid}>
          {tripInfo.highlights.map((highlight, index) => (
            <View key={index} style={[styles.highlightItem, { backgroundColor: theme.colors.background.card }]}>
              <Text style={[styles.highlightText, { color: theme.colors.text.primary }]}>
                {highlight}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const stepsToShow = isExpanded ? tripInfo.steps : tripInfo.steps?.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Ionicons name="map" size={18} color={theme.colors.primary[0]} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Itinéraire détaillé
            </Text>
          </View>
          {onToggleExpanded && (
            <TouchableOpacity style={styles.expandButton} onPress={onToggleExpanded}>
              <Text style={[styles.expandButtonText, { color: theme.colors.primary[0] }]}>
                {isExpanded ? 'Réduire' : 'Voir tout'}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.colors.primary[0]}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Informations générales */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={14} color="#FF6B6B" />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {tripInfo.destination}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={14} color="#4ECDC4" />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {tripInfo.duration}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="wallet" size={14} color="#45B7D1" />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {tripInfo.budget}
            </Text>
          </View>
          {tripInfo.difficulty && (
            <View style={styles.infoItem}>
              <Ionicons name="speedometer" size={14} color="#96CEB4" />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                {tripInfo.difficulty}
              </Text>
            </View>
          )}
          {tripInfo.bestTime && (
            <View style={styles.infoItem}>
              <Ionicons name="sunny" size={14} color="#FFEAA7" />
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                {tripInfo.bestTime}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Points forts */}
      {renderHighlights()}

      {/* Étapes */}
      {tripInfo.steps && tripInfo.steps.length > 0 && (
        <View style={styles.stepsContainer}>
          <Text style={[styles.stepsTitle, { color: theme.colors.text.primary }]}>
            🗺️ Étapes du voyage
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <View style={styles.stepsList}>
              {stepsToShow?.map(renderStepDetails)}
            </View>
          </ScrollView>
          
          {!isExpanded && tripInfo.steps.length > 3 && (
            <TouchableOpacity style={styles.showMoreSteps} onPress={onToggleExpanded}>
              <Text style={[styles.showMoreText, { color: theme.colors.primary[0] }]}>
                Voir {tripInfo.steps.length - 3} étapes supplémentaires
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.primary[0]} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={copyItinerary}>
          <Ionicons name="copy" size={18} color="#00D2D3" />
          <Text style={[styles.actionButtonText, { color: '#00D2D3' }]}>
            Copier
          </Text>
        </TouchableOpacity>
        
        {onSaveItinerary && (
          <TouchableOpacity style={styles.actionButton} onPress={onSaveItinerary}>
            <Ionicons name="bookmark" size={18} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
              Sauvegarder
            </Text>
          </TouchableOpacity>
        )}
        
        {onToggleMap && (
          <TouchableOpacity style={styles.actionButton} onPress={onToggleMap}>
            <Ionicons name="map" size={18} color="#4ECDC4" />
            <Text style={[styles.actionButtonText, { color: '#4ECDC4' }]}>
              {showMap ? 'Masquer' : 'Carte'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carte */}
      {showMap && tripInfo.latitude && tripInfo.longitude && (
        <View style={styles.mapContainer}>
          {/* OpenStreetMap component removed */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  highlightsContainer: {
    marginBottom: 16,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '500',
  },
  stepsContainer: {
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepsList: {
    gap: 8,
  },
  stepItem: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  stepItemSelected: {
    borderColor: 'rgba(0,151,230,0.3)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  stepLocation: {
    fontSize: 12,
  },
  stepDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDuration: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  expandStepButton: {
    padding: 4,
  },
  stepDescription: {
    marginTop: 12,
    marginLeft: 40,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  stepDescriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  showMoreSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
});

export default ItineraryCard; 