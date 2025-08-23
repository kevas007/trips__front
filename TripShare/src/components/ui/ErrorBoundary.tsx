import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Appeler le callback d'erreur si fourni
    this.props.onError?.(error, errorInfo);
    
    // Optionnel : envoyer l'erreur à un service de monitoring
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReportError = () => {
    if (this.state.error) {
      Alert.alert(
        'Signaler l\'erreur',
        'Voulez-vous signaler cette erreur à notre équipe ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Signaler', 
            onPress: () => {
              // Ici vous pourriez envoyer l'erreur à votre service de monitoring
              console.log('Erreur signalée:', this.state.error);
              Alert.alert('Merci', 'L\'erreur a été signalée à notre équipe.');
            }
          }
        ]
      );
    }
  };

  render() {
    if (this.state.hasError) {
      // Rendu personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Rendu par défaut
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Oups !</Text>
            <Text style={styles.errorMessage}>
              Une erreur inattendue s'est produite.
            </Text>
            <Text style={styles.errorDetails}>
              {this.state.error?.message || 'Erreur inconnue'}
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={this.handleRetry}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.reportButton} 
                onPress={this.handleReportError}
              >
                <Text style={styles.reportButtonText}>Signaler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 300,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  errorDetails: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
