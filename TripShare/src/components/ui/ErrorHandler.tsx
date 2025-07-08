import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthError } from '../../services/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getFontSize, getSpacing, getBorderRadius } from '../../utils/responsive';

interface ErrorHandlerProps {
  error: AuthError | null;
  onRetry?: () => void;
  onClear?: () => void;
  style?: any;
  compact?: boolean;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onClear,
  style,
  compact = false,
}) => {
  const { theme, isDark } = useAppTheme();

  if (!error) return null;

  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'wifi-outline';
      case 'UNAUTHORIZED':
        return 'lock-closed-outline';
      case 'VALIDATION_ERROR':
        return 'alert-circle-outline';
      case 'RATE_LIMITED':
        return 'time-outline';
      case 'SERVER_ERROR':
        return 'server-outline';
      default:
        return 'warning-outline';
    }
  };

  const getErrorColor = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return '#f59e0b';
      case 'UNAUTHORIZED':
        return '#ef4444';
      case 'VALIDATION_ERROR':
        return '#f59e0b';
      case 'RATE_LIMITED':
        return '#8b5cf6';
      case 'SERVER_ERROR':
        return '#ef4444';
      default:
        return '#ef4444';
    }
  };

  const handleShowDetails = () => {
    if (error.details) {
      const details = typeof error.details === 'object' 
        ? Object.entries(error.details).map(([key, value]) => `${key}: ${value}`).join('\n')
        : error.details;
      
      Alert.alert(
        'Détails de l\'erreur',
        details,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const errorColor = getErrorColor(error.code);

  if (compact) {
    return (
      <View style={[
        styles.compactContainer, 
        { 
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
          borderWidth: 1,
        }, 
        style
      ]}>
        <Ionicons 
          name={getErrorIcon(error.code)} 
          size={16} 
          color={errorColor} 
          style={styles.compactIcon}
        />
        <Text style={[
          styles.compactText, 
          { 
            color: isDark ? '#fff' : '#1f2937' // Couleur adaptée au thème
          }
        ]}>
          {error.message}
        </Text>
        {onClear && (
          <TouchableOpacity onPress={onClear} style={styles.compactClose}>
            <Ionicons name="close" size={16} color={errorColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
      },
      style
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getErrorIcon(error.code)} 
            size={24} 
            color={errorColor}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            { color: isDark ? '#fff' : '#1f2937' }
          ]}>
            Erreur
          </Text>
          <Text style={[
            styles.message,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            {error.message}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {error.details && (
          <TouchableOpacity 
            onPress={handleShowDetails}
            style={[styles.actionButton, styles.detailsButton]}
          >
            <Text style={styles.detailsButtonText}>Détails</Text>
          </TouchableOpacity>
        )}
        
        {onRetry && (
          <TouchableOpacity 
            onPress={onRetry}
            style={[styles.actionButton, { backgroundColor: errorColor }]}
          >
            <Ionicons name="refresh" size={16} color="#fff" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Réessayer</Text>
          </TouchableOpacity>
        )}
        
        {onClear && (
          <TouchableOpacity 
            onPress={onClear}
            style={[styles.actionButton, styles.clearButton]}
          >
            <Text style={[styles.clearButtonText, { color: errorColor }]}>
              Fermer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: getBorderRadius(12),
    borderWidth: 1,
    padding: getSpacing(16),
    marginVertical: getSpacing(8),
  },
  
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing(12),
    borderRadius: getBorderRadius(8),
    marginVertical: getSpacing(4),
  },
  
  compactIcon: {
    marginRight: getSpacing(8),
  },
  
  compactText: {
    flex: 1,
    fontSize: getFontSize(14),
    fontWeight: '500',
  },
  
  compactClose: {
    marginLeft: getSpacing(8),
    padding: getSpacing(4),
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(12),
  },
  
  iconContainer: {
    marginRight: getSpacing(12),
    paddingTop: getSpacing(2),
  },
  
  textContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    marginBottom: getSpacing(4),
  },
  
  message: {
    fontSize: getFontSize(14),
    lineHeight: 20,
  },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: getSpacing(8),
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(8),
  },
  
  actionIcon: {
    marginRight: getSpacing(4),
  },
  
  actionButtonText: {
    color: '#fff',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  
  detailsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  
  detailsButtonText: {
    color: '#6b7280',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  
  clearButton: {
    backgroundColor: 'transparent',
  },
  
  clearButtonText: {
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
}); 