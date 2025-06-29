import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordScreenProps {
  navigation: NavigationProp<any>;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  // const { resetPassword } = useSimpleAuth(); // Fonctionnalité à implémenter
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation du logo
  const logoAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.1, { duration: 2000 }),
              withTiming(1, { duration: 2000 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implémenter la logique de réinitialisation du mot de passe
      Alert.alert(
        'Email envoyé',
        'Un lien de réinitialisation a été envoyé à votre adresse email.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer, logoAnimation]}>
              <LinearGradient
                colors={['#008080', '#4FB3B3']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoEmoji}>🌍</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Mot de passe oublié
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
              borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
            }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder="Email"
                placeholderTextColor={theme.colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: theme.colors.primary[0] }]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Réinitialiser le mot de passe</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.text.secondary }]}>
                Retour à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
      logoEmoji: {
      fontSize: 42,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 8,
      textAlign: 'center',
    },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
      input: {
      flex: 1,
      fontSize: 8,
    },
  resetButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
      resetButtonText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: 'bold',
    },
  backButton: {
    alignItems: 'center',
    padding: 8,
  },
      backButtonText: {
      fontSize: 6,
    },
});

export default ForgotPasswordScreen; 