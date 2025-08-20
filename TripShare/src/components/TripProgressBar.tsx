import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Trip } from '../types/trip';
import { TripCalculationService } from '../services/tripCalculationService';
import { COLORS } from '../design-system/colors';
import { SPACING } from '../design-system/spacing';
import { BORDER_RADIUS } from '../design-system/radius';

interface TripProgressBarProps {
  trip: Trip;
  showPercentage?: boolean;
  showText?: boolean;
  height?: number;
  animated?: boolean;
  style?: any;
}

export const TripProgressBar: React.FC<TripProgressBarProps> = ({
  trip,
  showPercentage = true,
  showText = true,
  height = 8,
  animated = true,
  style,
}) => {
  const progressPercentage = TripCalculationService.getProgressPercentage(trip);
  const progressAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(progressAnimation, {
        toValue: progressPercentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnimation.setValue(progressPercentage);
    }
  }, [progressPercentage, animated]);

  const getProgressColor = () => {
    if (progressPercentage >= 100) {
      return COLORS.semantic.success;
    } else if (progressPercentage >= 75) {
      return COLORS.primary[500];
    } else if (progressPercentage >= 50) {
      return COLORS.semantic.warning;
    } else {
      return COLORS.semantic.info;
    }
  };

  const getProgressText = () => {
    const stats = TripCalculationService.calculateTripStats(trip);
    
    if (stats.status === 'planned') {
      return stats.daysUntilStartDisplay || 'Voyage planifié';
    } else if (stats.status === 'ongoing') {
      return `${Math.round(progressPercentage)}% terminé`;
    } else if (stats.status === 'completed') {
      return 'Voyage terminé';
    } else {
      return 'Statut inconnu';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progressContainer, { height }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getProgressColor(),
              height,
            },
          ]}
        />
      </View>
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.progressText}>{getProgressText()}</Text>
          {showPercentage && (
            <Text style={styles.percentageText}>
              {Math.round(progressPercentage)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  progressContainer: {
    width: '100%',
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  
  progressBar: {
    borderRadius: BORDER_RADIUS.full,
  },
  
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  
    progressText: {
    fontSize: 12,
    color: COLORS.neutral[600],
    fontWeight: '500',
  },

  percentageText: {
    fontSize: 12,
    color: COLORS.neutral[700],
    fontWeight: '600',
  },
}); 