import React, { useState } from 'react';
import type { FC } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface FormInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: string;
  onIconPress?: () => void;
  error?: string;
  style?: any;
}

export const FormInput: FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  onIconPress,
  error,
  style,
}) => {
  const { theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.background.card,
            borderColor: error
              ? theme.colors.semantic.error
              : isFocused
              ? theme.colors.primary[0]
              : theme.colors.glassmorphism.border,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={theme.colors.text.secondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text.primary },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary + '80'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {onIconPress && (
          <TouchableOpacity onPress={onIconPress} style={styles.iconButton}>
            <Ionicons
              name={icon as any}
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: theme.colors.semantic?.error || '#ef4444' }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  iconButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
}); 