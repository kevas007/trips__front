import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorHandlerProps {
  error?: string;
  fieldErrors?: { [key: string]: string };
  showGeneralError?: boolean;
  showFieldErrors?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  fieldErrors = {},
  showGeneralError = true,
  showFieldErrors = true,
}) => {
  if (!error && Object.keys(fieldErrors).length === 0) {
    return null;
  }

  return (
    <>
      {/* Erreur générale */}
      {showGeneralError && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Erreurs de champ */}
      {showFieldErrors && Object.keys(fieldErrors).length > 0 && (
        <View style={styles.fieldErrorsContainer}>
          {Object.entries(fieldErrors).map(([field, message]) => (
            <View key={field} style={styles.fieldErrorItem}>
              <Text style={styles.fieldErrorText}>❌ {message}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 10,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  fieldErrorsContainer: {
    marginBottom: 15,
    marginHorizontal: 10,
  },
  fieldErrorItem: {
    marginBottom: 8,
    paddingLeft: 5,
  },
  fieldErrorText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ErrorHandler; 