import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trip } from '../types/trip';
import { TripCalculationService } from '../services/tripCalculationService';

interface TripStatusDemoProps {
  trips: Trip[];
}

export const TripStatusDemo: React.FC<TripStatusDemoProps> = ({ trips }) => {
  const renderTripStatus = (trip: Trip) => {
    const stats = TripCalculationService.calculateTripStats(trip);
    const statusColor = TripCalculationService.getStatusColor(stats.status);
    const statusIcon = TripCalculationService.getStatusIcon(stats.status);
    const isOverdue = TripCalculationService.isOverdue(trip);
    const isStartingSoon = TripCalculationService.isStartingSoon(trip);
    const isEndingSoon = TripCalculationService.isEndingSoon(trip);

    return (
      <View key={trip.id} style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{stats.statusDisplay}</Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <Text style={styles.detailText}>
            📅 Durée: {stats.duration} ({stats.durationDays} jours)
          </Text>
          <Text style={styles.detailText}>
            📊 Progression: {Math.round(stats.progressPercentage)}%
          </Text>
          
          {stats.daysUntilStart !== undefined && (
            <Text style={[styles.detailText, isStartingSoon && styles.warningText]}>
              🚀 Commence: {stats.daysUntilStartDisplay}
            </Text>
          )}
          
          {stats.daysUntilEnd !== undefined && (
            <Text style={[styles.detailText, isEndingSoon && styles.warningText]}>
              🏁 Se termine: {stats.daysUntilEndDisplay}
            </Text>
          )}

          {trip.budget && (
            <Text style={styles.detailText}>
              💰 Budget: {trip.budget.toLocaleString()}€
            </Text>
          )}

          {trip.location && (
            <Text style={styles.detailText}>
              📍 {trip.location.city}, {trip.location.country}
            </Text>
          )}

          {isOverdue && (
            <Text style={styles.overdueText}>
              ⚠️ VOYAGE EN RETARD
            </Text>
          )}
        </View>

        {/* Barre de progression simple */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${stats.progressPercentage}%`,
                  backgroundColor: statusColor 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(stats.progressPercentage)}% terminé
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Démonstration du Calcul Automatique des Statuts</Text>
      <Text style={styles.subtitle}>
        Les statuts sont calculés automatiquement basé sur les dates de début et de fin
      </Text>
      
      {trips.map(renderTripStatus)}
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Comment ça fonctionne :</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Planifié</Text> : Date de début dans le futur
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>En cours</Text> : Date de début passée mais date de fin dans le futur
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Terminé</Text> : Date de fin passée
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>En retard</Text> : Date de fin passée mais statut pas "terminé"
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  tripDetails: {
    marginBottom: 16,
  },
  
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  
  warningText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  
  overdueText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  
  progressContainer: {
    marginTop: 8,
  },
  
  progressBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 12,
  },
  
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  
  bold: {
    fontWeight: '600',
  },
}); 