import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TripStep, ActivityType } from '../../types/trip';
import { Theme } from '../../types/theme';

interface TripStepsProps {
  steps: TripStep[];
  theme: Theme;
  onStepPress?: (step: TripStep) => void;
}

const getIconName = (type: ActivityType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'transport':
      return 'airplane-outline';
    case 'accommodation':
      return 'bed-outline';
    case 'restaurant':
      return 'restaurant-outline';
    case 'activity':
      return 'flag-outline';
    case 'sightseeing':
      return 'camera-outline';
    case 'shopping':
      return 'cart-outline';
    case 'entertainment':
      return 'musical-notes-outline';
    case 'meeting':
      return 'people-outline';
    case 'break':
      return 'cafe-outline';
    default:
      return 'ellipsis-horizontal-outline';
  }
};

const TripSteps: React.FC<TripStepsProps> = ({ steps, theme, onStepPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map-outline" size={20} color={theme.colors.primary[0]} />
        <Text style={[styles.headerText, { color: theme.colors.text.primary }]}>
          Étapes de l'itinéraire
        </Text>
      </View>

      <View style={styles.timeline}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            style={styles.stepContainer}
            onPress={() => onStepPress?.(step)}
          >
            {/* Ligne de connexion */}
            {index > 0 && (
              <View
                style={[
                  styles.connectionLine,
                  { backgroundColor: theme.colors.border.primary }
                ]}
              />
            )}

            {/* Point et icône */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme.colors.primary[0] }
                ]}
              >
                <Ionicons
                  name={(step.icon as keyof typeof Ionicons.glyphMap) || getIconName(step.type)}
                  size={16}
                  color="#fff"
                />
              </View>
            </View>

            {/* Contenu de l'étape */}
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
                {step.title}
              </Text>
              {step.description && (
                <Text
                  style={[styles.stepDescription, { color: theme.colors.text.secondary }]}
                  numberOfLines={2}
                >
                  {step.description}
                </Text>
              )}
              <View style={styles.stepInfo}>
                <View style={styles.durationContainer}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                  <Text style={[styles.duration, { color: theme.colors.text.secondary }]}>
                    {step.duration}
                  </Text>
                </View>
                <Text style={[styles.activitiesCount, { color: theme.colors.text.secondary }]}>
                  {step.activities.length} activités
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeline: {
    paddingLeft: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    left: 19,
    top: -10,
    width: 2,
    height: 40,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    marginLeft: 4,
  },
  activitiesCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default TripSteps; 