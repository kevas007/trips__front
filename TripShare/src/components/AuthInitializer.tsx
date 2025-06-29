import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { isLoading } = useSimpleAuth();
  const { theme, isDark } = useAppTheme();

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1b3a',
      }}>
        <Ionicons 
          name="airplane" 
          size={64} 
          color="#008080"
        />
        <Text style={{
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: 20,
        }}>
          TripShare
        </Text>
        <Text style={{
          color: '#d1d5db',
          fontSize: 16,
          marginTop: 10,
          marginBottom: 30,
        }}>
          Initialisation...
        </Text>
        <ActivityIndicator 
          size="large" 
          color="#008080"
        />
      </View>
    );
  }

  return <>{children}</>;
}; 