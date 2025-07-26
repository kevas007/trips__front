import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../types/trip';
import { TripCalculationService } from '../services/tripCalculationService';
import { TripProgressBar } from './TripProgressBar';
import { TripStatusBadge } from './TripStatusBadge';
import { COLORS } from '../design-system/colors';
import { SPACING } from '../design-system/spacing';
import { BORDER_RADIUS } from '../design-system/radius';

interface TripStatsCardProps {
  trip: Trip;
  showProgressBar?: boolean;
  showDetailedStats?: boolean;
  onPress?: () => void;
  style?: any;
}

export const TripStatsCard: React.FC<TripStatsCardProps> = ({
  trip,
  showProgressBar = true,
  showDetailedStats = true,
  onPress,
  style,
}) => {
  const stats = TripCalculationService.calculateTripStats(trip);
  const isOverdue = TripCalculationService.isOverdue(trip);
  const isStartingSoon = TripCalculationService.isStartingSoon(trip);
  const isEndingSoon = TripCalculationService.isEndingSoon(trip);

  const StatItem = ({ icon, label, value, color = COLORS.neutral[600] }: {
    icon: string;
    label: string;
    value: string;
    color?: string;
  }) => (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={16} color={color} style={styles.statIcon} />
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.container, style]} onPress={onPress}>
      {/* En-tête avec statut */}
      <View style={styles.header}>
        <TripStatusBadge 
          trip={trip} 
          size="medium" 
          variant="pill"
        />
        {isOverdue && (
          <View style={styles.overdueWarning}>
            <Ionicons name="warning" size={16} color="#FF6B35" />
            <Text style={styles.overdueText}>En retard</Text>
          </View>
        )}
      </View>

      {/* Barre de progression */}
      {showProgressBar && (
        <View style={styles.progressSection}>
          <TripProgressBar trip={trip} height={6} />
        </View>
      )}

      {/* Statistiques détaillées */}
      {showDetailedStats && (
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
                         <StatItem
               icon="calendar-outline"
               label="Durée"
               value={stats.duration}
               color={COLORS.primary[500]}
             />
             <StatItem
               icon="time-outline"
               label="Progression"
               value={`${Math.round(stats.progressPercentage)}%`}
               color={COLORS.semantic.success}
             />
          </View>

          {/* Informations temporelles */}
          {stats.daysUntilStart !== undefined && (
            <View style={styles.statsRow}>
              <StatItem
                icon="play-outline"
                label="Commence"
                value={stats.daysUntilStartDisplay || 'Non défini'}
                color={isStartingSoon ? COLORS.warning : COLORS.gray[600]}
              />
              {stats.daysUntilEnd !== undefined && (
                <StatItem
                  icon="stop-outline"
                  label="Se termine"
                  value={stats.daysUntilEndDisplay || 'Non défini'}
                  color={isEndingSoon ? COLORS.warning : COLORS.gray[600]}
                />
              )}
            </View>
          )}

          {/* Informations supplémentaires */}
          <View style={styles.additionalInfo}>
            {trip.budget && (
              <View style={styles.budgetInfo}>
                <Ionicons name="wallet-outline" size={14} color={COLORS.gray[500]} />
                <Text style={styles.budgetText}>
                  Budget: {trip.budget.toLocaleString()}€
                </Text>
              </View>
            )}
            
            {trip.location && (
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={14} color={COLORS.gray[500]} />
                <Text style={styles.locationText}>
                  {trip.location.city}, {trip.location.country}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },

  overdueText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },

  progressSection: {
    marginBottom: SPACING.md,
  },

  statsSection: {
    gap: SPACING.sm,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  statIcon: {
    marginRight: SPACING.xs,
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.gray[500],
    fontWeight: '500',
  },

  statValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },

  additionalInfo: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: SPACING.xs,
  },

  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  budgetText: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
  },

  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
  },
}); 