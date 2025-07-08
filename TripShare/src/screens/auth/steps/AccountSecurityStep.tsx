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
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface AccountSecurityStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const AccountSecurityStep: React.FC<AccountSecurityStepProps> = ({ onNext, initialData = {} }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    username: initialData.username || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = t('validation.required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('validation.usernameLength');
    }

    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordLength');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('validation.passwordComplexity');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMatch');
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
    secureTextEntry,
    showPassword,
    setShowPassword,
  }: any) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Ionicons
          name={icon}
          size={20}
          color={error ? theme.theme.colors.semantic.error : theme.theme.colors.text.secondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.theme.colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.theme.colors.text.secondary + '80'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: '#1B1818FF' }]}>{error}</Text>}
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
          placeholder={t('register.username')}
          value={formData.username}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, username: text }))}
          error={errors.username}
        />

        <InputField
          icon="lock-closed-outline"
          placeholder={t('register.password')}
          value={formData.password}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, password: text }))}
          error={errors.password}
          secureTextEntry={!showPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <InputField
          icon="lock-closed-outline"
          placeholder={t('register.confirmPassword')}
          value={formData.confirmPassword}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
          error={errors.confirmPassword}
          secureTextEntry={!showConfirmPassword}
          showPassword={showConfirmPassword}
          setShowPassword={setShowConfirmPassword}
        />

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>{t('register.passwordRequirements')}</Text>
          <Text style={styles.requirement}>• {t('register.passwordLengthRequirement')}</Text>
          <Text style={styles.requirement}>• {t('register.passwordComplexityRequirement')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: '#008080' }]}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
    fontWeight: '500',
  },
  passwordRequirements: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requirementsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirement: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
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

export default AccountSecurityStep; 