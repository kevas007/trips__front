
// components/ThemeLanguageSettings.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';

export const ThemeLanguageSettings: React.FC = () => {
  const { theme, isDark, toggleTheme, language, toggleLanguage, t } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.glassmorphism.background }]}>
      {/* Theme Toggle */}
      <TouchableOpacity 
        style={[styles.settingItem, { borderColor: theme.colors.glassmorphism.border }]}
        onPress={toggleTheme}
      >
        <View style={styles.settingLeft}>
          <Ionicons 
            name={isDark ? 'moon' : 'sunny'} 
            size={24} 
            color={theme.colors.text.light} 
          />
          <Text style={[styles.settingText, { color: theme.colors.text.light }]}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
        <View style={[
          styles.toggle,
          { backgroundColor: isDark ? theme.colors.accent[0] : theme.colors.glassmorphism.border }
        ]}>
          <View style={[
            styles.toggleIndicator,
            { 
              backgroundColor: theme.colors.text.light,
              transform: [{ translateX: isDark ? 20 : 2 }]
            }
          ]} />
        </View>
      </TouchableOpacity>

      {/* Language Toggle */}
      <TouchableOpacity 
        style={[styles.settingItem, { borderColor: theme.colors.glassmorphism.border }]}
        onPress={toggleLanguage}
      >
        <View style={styles.settingLeft}>
          <Ionicons 
            name="language" 
            size={24} 
            color={theme.colors.text.light} 
          />
          <Text style={[styles.settingText, { color: theme.colors.text.light }]}>
            {language === 'fr' ? 'Français' : 'English'}
          </Text>
        </View>
        <Text style={[styles.languageCode, { color: theme.colors.accent[0] }]}>
          {language.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  languageCode: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
});
