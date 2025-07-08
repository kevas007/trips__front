// src/components/Home/QuickActions.tsx

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types/theme';

export interface QuickActionsProps {
  theme: Theme;
}

interface Action {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ theme }) => {
  const actions: Action[] = [
    { icon: 'map-outline', label: 'Explorer' },
    { icon: 'heart-outline', label: 'Favoris' },
    { icon: 'people-outline', label: 'Groupes' },
    { icon: 'compass-outline', label: 'Découvrir' },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.background.card }
          ]}
        >
          <View style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary[0] }
          ]}>
            <Ionicons name={action.icon} size={20} color="#fff" />
          </View>
          <Text style={[
            styles.actionLabel,
            { color: theme.colors.text.primary }
          ]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QuickActions;
