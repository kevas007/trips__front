// === AuthScreen.tsx - VERSION CORRIGÉE AVEC REACT-I18NEXT ===

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Variables responsive déclarées globalement
const isWeb = Platform.OS === 'web';
const isTablet = width > 768;
const isDesktop = width > 1024;

interface AuthScreenProps {
  navigation: any;
}

type AuthMode = 'login' | 'register' | 'forgot';

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  
  // 🎨 Theme & Language avec react-i18next
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  
  // 🎨 Animations optimisées
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cloudAnim1 = useRef(new Animated.Value(0)).current;
  const cloudAnim2 = useRef(new Animated.Value(0)).current;
  const planeAnim = useRef(new Animated.Value(-width)).current;
  
  const { login, register } = useAuth();

  // États pour UX améliorée
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [inputFocused, setInputFocused] = useState<string | null>(null);

  // Fonction pour toggle language
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  // Configuration d'animations memoized
  const animationConfig = useMemo(() => ({
    duration: isWeb ? 1200 : 800,
    useNativeDriver: true,
  }), []);

  useEffect(() => {
    checkBiometricAvailability();
    startOptimizedAnimations();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      if (!isWeb) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(hasHardware && isEnrolled);
      }
    } catch (error) {
      console.log('Biometric check error:', error);
    }
  };

  // 🚀 Animations optimisées selon device
  const startOptimizedAnimations = useCallback(() => {
    // Animation d'entrée adaptive
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...animationConfig,
      }),
      Animated.parallel([
        Animated.spring(slideUpAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Démarrer animations secondaires seulement sur web/desktop
      if (isWeb && isDesktop) {
        startBackgroundAnimations();
      }
    });

    // Animation de pulsation pour éléments interactifs
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideUpAnim, scaleAnim, pulseAnim, animationConfig]);

  const startBackgroundAnimations = useCallback(() => {
    // Nuages flottants (desktop uniquement)
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim1, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim2, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Avion qui traverse (desktop uniquement)
    setTimeout(() => {
      Animated.timing(planeAnim, {
        toValue: width + 50,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        planeAnim.setValue(-width);
        setTimeout(startBackgroundAnimations, 10000);
      });
    }, 2000);
  }, [cloudAnim1, cloudAnim2, planeAnim]);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('auth.biometric.prompt'),
        fallbackLabel: t('auth.passwordPlaceholder'),
        cancelLabel: t('common.cancel'),
      });

      if (result.success) {
        await login('biometric@tripshare.com', 'biometric_auth');
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.errors.biometricFailed'));
    }
  };

  const enableBiometric = () => {
    Alert.alert(
      t('auth.biometric.title'),
      'Voulez-vous activer Face ID / Touch ID pour une connexion ultra-rapide ?',
      [
        { text: t('auth.biometric.later'), style: 'cancel' },
        { 
          text: t('auth.biometric.enable'), 
          onPress: () => setShowBiometricOption(true),
          style: 'default'
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      if (authMode === 'register') {
        await register(email, password, name);
        if (biometricAvailable && !showBiometricOption) {
          setTimeout(() => enableBiometric(), 1000);
        }
      } else if (authMode === 'login') {
        await login(email, password);
      } else {
        Alert.alert('📧 Email envoyé !', t('auth.success.emailSent'));
        setAuthMode('login');
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Une erreur est survenue. Réessayez !');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = (): boolean => {
    if (!email.includes('@')) {
      Alert.alert('Email invalide 📧', t('auth.errors.invalidEmail'));
      return false;
    }

    if (authMode !== 'forgot' && password.length < 6) {
      Alert.alert('Mot de passe trop court 🔒', t('auth.errors.passwordTooShort'));
      return false;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        Alert.alert('Nom requis 👤', t('auth.errors.nameRequired'));
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Mots de passe différents 🔑', t('auth.errors.passwordMismatch'));
        return false;
      }
      if (!acceptTerms) {
        Alert.alert('Conditions requises 📜', t('auth.errors.termsRequired'));
        return false;
      }
    }

    return true;
  };

  // Interpolations pour animations
  const cloudTranslateX1 = cloudAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, width + 100],
  });

  const cloudTranslateX2 = cloudAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [width + 50, -150],
  });

  const getTitle = (): string => {
    switch (authMode) {
      case 'register': return t('auth.registerTitle');
      case 'forgot': return t('auth.forgotTitle');
      default: return t('auth.loginTitle');
    }
  };

  const getButtonText = (): string => {
    switch (authMode) {
      case 'register': return t('auth.registerButton');
      case 'forgot': return t('auth.forgotButton');
      default: return t('auth.loginButton');
    }
  };

  const renderFloatingElements = () => {
    // Seulement sur desktop pour performance
    if (!isDesktop) return null;
    
    return (
      <>
        <Animated.View 
          style={[
            styles.cloud,
            styles.cloud1,
            { transform: [{ translateX: cloudTranslateX1 }] }
          ]}
        >
          <Text style={styles.cloudEmoji}>☁️</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.cloud,
            styles.cloud2,
            { transform: [{ translateX: cloudTranslateX2 }] }
          ]}
        >
          <Text style={styles.cloudEmoji}>☁️</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.plane,
            { transform: [{ translateX: planeAnim }] }
          ]}
        >
          <Text style={styles.planeEmoji}>✈️</Text>
        </Animated.View>
      </>
    );
  };

  const renderThemeLanguageToggle = () => (
    <View style={styles.settingsContainer}>
      <TouchableOpacity 
        style={[styles.settingButton, { backgroundColor: theme.colors.glassmorphism.background }]}
        onPress={toggleTheme}
      >
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={20} 
          color={theme.colors.text.light} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.settingButton, { backgroundColor: theme.colors.glassmorphism.background }]}
        onPress={toggleLanguage}
      >
        <Text style={[styles.languageText, { color: theme.colors.text.light }]}>
          {i18n.language.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMagicalHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideUpAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={theme.colors.primary}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoEmoji}>🌍</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={[styles.appName, { color: theme.colors.text.light }]}>TripShare</Text>
      <Text style={[styles.tagline, { color: theme.colors.text.light }]}>{t('auth.appTagline')}</Text>
      
      <View style={[styles.statsContainer, { 
        backgroundColor: theme.colors.glassmorphism.background,
        borderColor: theme.colors.glassmorphism.border,
      }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.text.light }]}>2.1M+</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{t('auth.stats.adventurers')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.text.light }]}>156</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{t('auth.stats.countries')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.text.light }]}>4.9⭐</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{t('auth.stats.appRating')}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderFormField = (
    icon: string,
    placeholderKey: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: any = 'default',
    secureTextEntry = false,
    fieldName: string
  ) => (
    <Animated.View 
      style={[
        styles.inputWrapper,
        {
          backgroundColor: theme.colors.glassmorphism.background,
          borderColor: inputFocused === fieldName ? theme.colors.accent[0] : theme.colors.glassmorphism.border,
        },
        inputFocused === fieldName && {
          shadowColor: theme.colors.accent[0],
          backgroundColor: theme.colors.glassmorphism.background,
        }
      ]}
    >
      <Ionicons 
        name={icon as any} 
        size={isWeb ? 22 : 20} 
        color={inputFocused === fieldName ? theme.colors.accent[0] : theme.colors.text.secondary} 
        style={styles.inputIcon} 
      />
      <TextInput
        style={[styles.input, { color: theme.colors.text.light }]}
        placeholder={t(placeholderKey)}
        placeholderTextColor={theme.colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={fieldName === 'name' ? 'words' : 'none'}
        secureTextEntry={secureTextEntry}
        onFocus={() => setInputFocused(fieldName)}
        onBlur={() => setInputFocused(null)}
      />
      {fieldName === 'password' && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={isWeb ? 22 : 20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderBiometricSection = () => {
    if (!showBiometricOption || authMode !== 'login' || isWeb) return null;

    return (
      <Animated.View style={[styles.biometricSection, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={[styles.biometricTitle, { color: theme.colors.text.light }]}>🔐 Connexion Express</Text>
        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
          <LinearGradient
            colors={theme.colors.accent}
            style={styles.biometricGradient}
          >
            <Ionicons name="finger-print" size={28} color="#FFFFFF" />
            <Text style={styles.biometricText}>Face ID / Touch ID</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={theme.colors.background.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {renderFloatingElements()}
        {renderThemeLanguageToggle()}

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {renderMagicalHeader()}

              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    backgroundColor: theme.colors.glassmorphism.background,
                    borderColor: theme.colors.glassmorphism.border,
                    shadowColor: theme.colors.glassmorphism.shadow,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }],
                  },
                ]}
              >
                <Text style={[styles.formTitle, { color: theme.colors.text.light }]}>{getTitle()}</Text>

                <View style={styles.inputContainer}>
                  {authMode === 'register' && 
                    renderFormField('person-outline', 'auth.namePlaceholder', name, setName, 'default', false, 'name')
                  }

                  {renderFormField('mail-outline', 'auth.emailPlaceholder', email, setEmail, 'email-address', false, 'email')}

                  {authMode !== 'forgot' && 
                    renderFormField('lock-closed-outline', 'auth.passwordPlaceholder', password, setPassword, 'default', !showPassword, 'password')
                  }

                  {authMode === 'register' && 
                    renderFormField('lock-closed-outline', 'auth.confirmPasswordPlaceholder', confirmPassword, setConfirmPassword, 'default', !showPassword, 'confirmPassword')
                  }
                </View>

                {authMode === 'login' && (
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <View style={[
                        styles.checkbox, 
                        { borderColor: theme.colors.glassmorphism.border },
                        rememberMe && { backgroundColor: theme.colors.accent[0], borderColor: theme.colors.accent[0] }
                      ]}>
                        {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.checkboxText, { color: theme.colors.text.light }]}>{t('auth.rememberMe')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {authMode === 'register' && (
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setAcceptTerms(!acceptTerms)}
                    >
                      <View style={[
                        styles.checkbox, 
                        { borderColor: theme.colors.glassmorphism.border },
                        acceptTerms && { backgroundColor: theme.colors.accent[0], borderColor: theme.colors.accent[0] }
                      ]}>
                        {acceptTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.checkboxText, { color: theme.colors.text.light }]}>{t('auth.acceptTerms')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setEnableNotifications(!enableNotifications)}
                    >
                      <View style={[
                        styles.checkbox, 
                        { borderColor: theme.colors.glassmorphism.border },
                        enableNotifications && { backgroundColor: theme.colors.accent[0], borderColor: theme.colors.accent[0] }
                      ]}>
                        {enableNotifications && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.checkboxText, { color: theme.colors.text.light }]}>{t('auth.receiveNotifications')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? [theme.colors.text.secondary, theme.colors.text.secondary] : theme.colors.accent}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>{getButtonText()}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {renderBiometricSection()}

                <View style={styles.navigationContainer}>
                  {authMode === 'login' && (
                    <>
                      <TouchableOpacity onPress={() => setAuthMode('forgot')}>
                        <Text style={[styles.linkText, { color: theme.colors.text.secondary }]}>{t('auth.forgotPassword')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setAuthMode('register')}>
                        <Text style={[styles.linkTextPrimary, { color: theme.colors.text.light }]}>{t('auth.createAccount')}</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {authMode === 'register' && (
                    <TouchableOpacity onPress={() => setAuthMode('login')}>
                      <Text style={[styles.linkTextPrimary, { color: theme.colors.text.light }]}>{t('auth.alreadyMember')}</Text>
                    </TouchableOpacity>
                  )}

                  {authMode === 'forgot' && (
                    <TouchableOpacity onPress={() => setAuthMode('login')}>
                      <Text style={[styles.linkTextPrimary, { color: theme.colors.text.light }]}>{t('auth.backToLogin')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles identiques (pas de changement nécessaire)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: isWeb ? height : 'auto',
  },
  contentWrapper: {
    padding: isWeb ? (isDesktop ? 40 : 30) : 20,
    maxWidth: isWeb ? 900 : '100%',
    alignSelf: 'center',
    width: '100%',
  },

  // Settings Toggle
  settingsContainer: {
    position: 'absolute',
    top: isWeb ? 20 : 50,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  settingButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Éléments flottants (desktop uniquement)
  cloud: {
    position: 'absolute',
    zIndex: 1,
  },
  cloud1: {
    top: height * 0.1,
  },
  cloud2: {
    top: height * 0.15,
  },
  cloudEmoji: {
    fontSize: 30,
    opacity: 0.6,
  },
  plane: {
    position: 'absolute',
    top: height * 0.08,
    zIndex: 2,
  },
  planeEmoji: {
    fontSize: 24,
  },

  // Header responsive
  headerContainer: {
    alignItems: 'center',
    marginBottom: isWeb ? 25 : 30,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logoGradient: {
    width: isWeb ? 80 : 100,
    height: isWeb ? 80 : 100,
    borderRadius: isWeb ? 40 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoEmoji: {
    fontSize: isWeb ? 40 : 50,
  },
  appName: {
    fontSize: isWeb ? 28 : 36,
    fontWeight: '800',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: isWeb ? 14 : 16,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: isWeb ? 400 : '100%',
    borderRadius: 15,
    padding: isWeb ? 12 : 15,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isWeb ? 16 : 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: isWeb ? 11 : 12,
    marginTop: 2,
  },

  // Formulaire responsive
  formContainer: {
    borderRadius: 20,
    padding: isWeb ? 25 : 25,
    maxWidth: isWeb ? 380 : '100%',
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  formTitle: {
    fontSize: isWeb ? 22 : 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: isWeb ? 20 : 25,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: isWeb ? 50 : 55,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: isWeb ? 14 : 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 6,
  },

  // Options et checkboxes
  optionsContainer: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: isWeb ? 13 : 14,
    fontWeight: '500',
    flex: 1,
  },

  // Bouton principal responsive
  submitButton: {
    borderRadius: 12,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: isWeb ? 16 : 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: isWeb ? 16 : 18,
    fontWeight: '700',
  },

  // Section biométrique
  biometricSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  biometricTitle: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  biometricButton: {
    borderRadius: 12,
  },
  biometricGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  biometricText: {
    color: '#FFFFFF',
    fontSize: isWeb ? 16 : 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Navigation responsive
  navigationContainer: {
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: isWeb ? 13 : 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  linkTextPrimary: {
    fontSize: isWeb ? 14 : 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AuthScreen;