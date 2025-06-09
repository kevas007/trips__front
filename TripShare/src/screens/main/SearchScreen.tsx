import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

const SearchScreen: React.FC = () => {
  const { theme } = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
      <Ionicons name="search-outline" size={64} color={theme.colors.primary[0]} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 20 }}>
        Recherche
      </Text>
      <Text style={{ fontSize: 16, color: theme.colors.text.secondary, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
        Recherchez des destinations, des utilisateurs ou des voyages sur TripShare.
      </Text>
    </View>
  );
};

export default SearchScreen; 