import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
const SearchScreen: React.FC = () => {
  const { theme } = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
      <Ionicons name="search-outline" size={64} color={theme.colors.primary[0]} />
      <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 20 }}>
        Recherche
      </Text>
      <Text style={{ fontSize: 5, color: theme.colors.text.secondary, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
                  Recherchez des destinations, des utilisateurs ou des voyages sur TripShare.
      </Text>
    </View>
  );
};

export default SearchScreen; 