// src/components/Home/SearchBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types/theme';

export interface SearchBarProps {
  theme: Theme;
}

const SearchBar: React.FC<SearchBarProps> = ({ theme }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.searchBar, 
        { backgroundColor: theme.colors.background.card }
      ]}
    >
      <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
      <Text style={[styles.searchText, { color: theme.colors.text.secondary }]}>
        Où souhaitez-vous aller ?
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default SearchBar;
