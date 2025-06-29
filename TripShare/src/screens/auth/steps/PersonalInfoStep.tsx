import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';

interface PersonalInfoStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ onNext, initialData = {} }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const InputField = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    error,
    keyboardType = 'default',
  }: any) => (
    <View style={styles.inputContainer}>
      <View style={[
        styles.inputWrapper, 
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
          borderColor: error 
            ? theme.colors.semantic.error 
            : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)'),
        },
        error && styles.inputError
      ]}>
        <Ionicons
          name={icon}
          size={20}
          color={error ? theme.colors.semantic.error : theme.colors.text.secondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <InputField
          icon="person-outline"
          placeholder={t('register.firstName')}
          value={formData.firstName}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, firstName: text }))}
          error={errors.firstName}
        />

        <InputField
          icon="person-outline"
          placeholder={t('register.lastName')}
          value={formData.lastName}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, lastName: text }))}
          error={errors.lastName}
        />

        <InputField
          icon="mail-outline"
          placeholder={t('register.email')}
          value={formData.email}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, email: text }))}
          error={errors.email}
          keyboardType="email-address"
        />

        <InputField
          icon="call-outline"
          placeholder={t('register.phone')}
          value={formData.phone}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, phone: text }))}
          error={errors.phone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
  },
  inputError: {
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default PersonalInfoStep; 