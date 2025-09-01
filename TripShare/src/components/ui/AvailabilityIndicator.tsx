import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface AvailabilityIndicatorProps {
  isChecking: boolean;
  isAvailable: boolean | null;
  fieldName: string;
  containerStyle?: any;
}

const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  isChecking,
  isAvailable,
  fieldName,
  containerStyle,
}) => {
  if (isChecking) {
    return (
      <View style={[styles.container, styles.checking, containerStyle]}>
        <ActivityIndicator size="small" color="#008080" />
        <Text style={styles.checkingText}>Vérification de la disponibilité...</Text>
      </View>
    );
  }

  if (isAvailable === null) {
    return null;
  }

  if (isAvailable) {
    return (
      <View style={[styles.container, styles.available, containerStyle]}>
        <Text style={styles.availableText}>✅ {fieldName} disponible</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.unavailable, containerStyle]}>
      <Text style={styles.unavailableText}>❌ {fieldName} déjà utilisé</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  checking: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  checkingText: {
    color: '#1976d2',
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  available: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  availableText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
  unavailable: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  unavailableText: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AvailabilityIndicator;
