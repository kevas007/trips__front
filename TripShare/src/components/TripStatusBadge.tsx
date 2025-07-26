import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip, TripStatus } from '../types/trip';
import { TripCalculationService } from '../services/tripCalculationService';
import { COLORS } from '../design-system/colors';
import { SPACING } from '../design-system/spacing';
import { BORDER_RADIUS } from '../design-system/radius';

interface TripStatusBadgeProps {
  trip: Trip;
  showIcon?: boolean;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'pill' | 'minimal';
  onPress?: () => void;
}

export const TripStatusBadge: React.FC<TripStatusBadgeProps> = ({
  trip,
  showIcon = true,
  showText = true,
  size = 'medium',
  variant = 'badge',
  onPress,
}) => {
  // Calculer le statut automatiquement
  const calculatedStatus = TripCalculationService.calculateStatus(trip);
  const statusColor = TripCalculationService.getStatusColor(calculatedStatus);
  const statusIcon = TripCalculationService.getStatusIcon(calculatedStatus);
  const statusText = TripCalculationService.getStatusDisplayName(calculatedStatus);
  const isOverdue = TripCalculationService.isOverdue(trip);

  // Styles dynamiques basés sur la taille et la variante
  const getContainerStyle = () => {
    let containerStyle = { ...styles.container };
    
    switch (size) {
      case 'small':
        containerStyle = { ...containerStyle, ...styles.small };
        break;
      case 'large':
        containerStyle = { ...containerStyle, ...styles.large };
        break;
      default:
        containerStyle = { ...containerStyle, ...styles.medium };
    }
    
    switch (variant) {
      case 'pill':
        containerStyle = { ...containerStyle, ...styles.pill };
        break;
      case 'minimal':
        containerStyle = { ...containerStyle, ...styles.minimal };
        break;
      default:
        containerStyle = { ...containerStyle, ...styles.badge };
    }
    
    return containerStyle;
  };

  const getTextStyle = () => {
    let textStyle = { ...styles.text };
    
    switch (size) {
      case 'small':
        textStyle = { ...textStyle, ...styles.textSmall };
        break;
      case 'large':
        textStyle = { ...textStyle, ...styles.textLarge };
        break;
      default:
        textStyle = { ...textStyle, ...styles.textMedium };
    }
    
    return textStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  return (
    <View style={[getContainerStyle(), { backgroundColor: statusColor }]}>
      {isOverdue && (
        <View style={styles.overdueIndicator}>
          <Ionicons name="warning" size={getIconSize()} color="#FF6B35" />
        </View>
      )}
      
      {showIcon && (
        <Ionicons 
          name={statusIcon as any} 
          size={getIconSize()} 
          color="#FFFFFF" 
          style={styles.icon}
        />
      )}
      
      {showText && (
        <Text style={getTextStyle()}>
          {statusText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  
  // Variantes
  badge: {
    borderRadius: BORDER_RADIUS.sm,
  },
  pill: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
  },
  minimal: {
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  
  // Tailles
  small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  
  // Texte
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  
  // Icône
  icon: {
    marginRight: SPACING.xs,
  },
  
  // Indicateur de retard
  overdueIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
}); 