import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface VerificationStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

const VerificationStep: React.FC<VerificationStepProps> = ({ onNext, initialData = {} }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerification = () => {
    if (verificationCode.length !== 6) {
      Alert.alert(t('error.title'), t('verification.invalidCode'));
      return;
    }

    // Simuler la vérification
    onNext({ verificationCode });
  };

  const handleResendCode = () => {
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    // Simuler l'envoi du code
    setTimeout(() => {
      setTimeLeft(60);
      setIsResending(false);
      Alert.alert(t('success.title'), t('verification.codeResent'));
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="mail-outline" size={64} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('verification.title')}
          </Text>
          <Text style={[styles.description, { color: theme.colors.text + '80' }]}>
            {t('verification.description')}
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <TextInput
            style={[styles.codeInput, { color: theme.theme.colors.text.primary }]}
            placeholder="000000"
            placeholderTextColor={theme.theme.colors.text.secondary + '60'}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          <Text style={[styles.codeHint, { color: theme.colors.text + '80' }]}>
            {t('verification.codeHint')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleVerification}
        >
          <Text style={styles.verifyButtonText}>{t('verification.verify')}</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.colors.text + '80' }]}>
            {t('verification.noCode')}
          </Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={timeLeft > 0 || isResending}
          >
            <Text
              style={[
                styles.resendButton,
                {
                  color: timeLeft > 0 || isResending
                    ? theme.colors.text + '40'
                    : theme.colors.primary,
                },
              ]}
            >
              {isResending
                ? t('verification.sending')
                : timeLeft > 0
                ? t('verification.resendIn', { time: timeLeft })
                : t('verification.resend')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  codeInput: {
    fontSize: 32,
    letterSpacing: 8,
    textAlign: 'center',
    width: '80%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 10,
  },
  codeHint: {
    fontSize: 14,
  },
  verifyButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    marginRight: 4,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VerificationStep; 