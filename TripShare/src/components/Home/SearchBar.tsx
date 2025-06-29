// src/components/Home/SearchBar.tsx
import React from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  fadeAnim,
  slideAnim,
}) => {
  const { theme, isDark } = useAppTheme();

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={[styles.searchBox, { backgroundColor: theme.colors.background.card, shadowColor: theme.colors.glassmorphism.shadow }]}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'} 
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Rechercher des voyages, lieux..."
          placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
});

export default SearchBar;
