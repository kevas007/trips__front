// === src/screens/AuthScreenEnhanced.tsx ===

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
  StatusBar,
  Keyboard,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  PlaneAnimation,
  BoatAnimation,
  TrainAnimation,
  FloatingElement,
  CloudAnimation,
  useTransportAnimation,
} from './TravelAnimations';

// ==================== INTERFACES ====================
interface ValidationError {
  field: string;
  message: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface AuthScreenProps {
  navigation: any;
}

type AuthMode = 'login' | 'register' | 'forgot';

// ==================== CONSTANTES ====================
const ANIMATION_DURATION = {
  FAST: 250,
  MEDIUM: 500,
  SLOW: 800,
  ULTRA_SMOOTH: 1200,
};

const INPUT_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
};

const GLASSMORPHISM_STYLES = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.3)', // Augmenté l'opacité pour être plus visible
  blur: 20,
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = width > 768;
const isDesktop = width > 1024;
const isSmallScreen = height < 700;

// ==================== COMPOSANT PRINCIPAL ====================
const AuthScreenEnhanced: React.FC<AuthScreenProps> = ({ navigation }) => {
  // -------- États principaux --------
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  // -------- États UI --------
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [inputFocused, setInputFocused] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // -------- États fonctionnalités --------
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [countryCodes, setCountryCodes] = useState<{ code: string, name: string }[]>([]);
  const [countryCode, setCountryCode] = useState('+33'); // Par défaut France
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  // -------- Hooks --------
  const { theme, isDark, toggleTheme } = useAppTheme();
  const { t, i18n } = useTranslation();
  const { login, register, forgotPassword, isLoading, error, clearError } = useAuth();
  const { currentTransport, switchTransport } = useTransportAnimation();

  // -------- Animations --------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const formContainerAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const animationConfig = useMemo(
    () => ({
      duration: isWeb ? ANIMATION_DURATION.MEDIUM : ANIMATION_DURATION.FAST,
      useNativeDriver: true,
    }),
    []
  );

  const startEntranceAnimations = useCallback(() => {
    Animated.stagger(150, [
      // 1) Background fade-in
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.ULTRA_SMOOTH,
        useNativeDriver: true,
      }),
      // 2) Header bounce
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      // 3) Form appear + slide up + scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // 4) Container form fade-in
      Animated.timing(formContainerAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse en boucle sur logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [
    backgroundAnim,
    headerAnim,
    fadeAnim,
    slideUpAnim,
    scaleAnim,
    formContainerAnim,
    pulseAnim,
  ]);

  const animateFormTransition = useCallback(
    (newMode: AuthMode) => {
      Animated.sequence([
        Animated.timing(formContainerAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.timing(formContainerAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAuthMode(newMode);
      });
    },
    [formContainerAnim]
  );

  // -------- Effets --------
  useEffect(() => {
    startEntranceAnimations();
    checkBiometricAvailability();
  }, [startEntranceAnimations]);

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    const errors = validateForm();
    setValidationErrors(errors);
    setIsFormValid(errors.length === 0);
  }, [formData, authMode, acceptTerms]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (countryCodes.length > 0) {
      setItems(countryCodes.map(c => ({
        label: `${c.name} (${c.code})`,
        value: c.code
      })));
    }
  }, [countryCodes]);

  const checkBiometricAvailability = async () => {
    if (!isWeb) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(hasHardware && isEnrolled);
      } catch (err) {
        console.log('Biometric check error:', err);
      }
    }
  };

  // -------- Validation formulaire --------
  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Email
    if (!formData.email) {
      errors.push({ field: 'email', message: t('auth.errors.emailRequired') });
    } else if (!INPUT_VALIDATION.EMAIL_REGEX.test(formData.email)) {
      errors.push({ field: 'email', message: t('auth.errors.invalidEmail') });
    }

    // Mot de passe (login/forgot)
    if (authMode !== 'forgot') {
      if (!formData.password) {
        errors.push({ field: 'password', message: t('auth.errors.passwordRequired') });
      } else if (formData.password.length < INPUT_VALIDATION.PASSWORD_MIN_LENGTH) {
        errors.push({
          field: 'password',
          message: `Le mot de passe doit contenir au moins ${INPUT_VALIDATION.PASSWORD_MIN_LENGTH} caractères`,
        });
      }
      if (
        authMode === 'register' &&
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
      ) {
        errors.push({
          field: 'password',
          message:
            'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
        });
      }
    }

    // Cas "register" (username / firstName / lastName / confirmPassword / acceptTerms)
    if (authMode === 'register') {
      if (!formData.username || formData.username.trim().length < INPUT_VALIDATION.NAME_MIN_LENGTH) {
        errors.push({ field: 'username', message: t('auth.errors.usernameRequired') });
      }
      if (
        !formData.firstName ||
        formData.firstName.trim().length < INPUT_VALIDATION.NAME_MIN_LENGTH
      ) {
        errors.push({ field: 'firstName', message: t('auth.errors.firstNameRequired') });
      }
      if (
        !formData.lastName ||
        formData.lastName.trim().length < INPUT_VALIDATION.NAME_MIN_LENGTH
      ) {
        errors.push({ field: 'lastName', message: t('auth.errors.lastNameRequired') });
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push({ field: 'confirmPassword', message: t('auth.errors.passwordMismatch') });
      }
      if (!acceptTerms) {
        errors.push({ field: 'terms', message: t('auth.errors.termsRequired') });
      }
      if (!countryCode) {
        errors.push({ field: 'countryCode', message: "Sélectionnez l'indicatif du pays." });
      }
      if (formData.phoneNumber && formData.phoneNumber.startsWith('0')) {
        errors.push({ field: 'phoneNumber', message: "Veuillez saisir le numéro sans le 0 initial." });
      } else if (!formData.phoneNumber || !INPUT_VALIDATION.PHONE_REGEX.test(countryCode + formData.phoneNumber)) {
        errors.push({ field: 'phoneNumber', message: "Le numéro de téléphone est requis et doit être valide." });
      }
    }

    return errors;
  }, [formData, authMode, acceptTerms, t, countryCode]);

  // -------- Mise à jour du formulaire --------
  const updateFormData = useCallback(
    (field: keyof FormData, value: string) => {
      // Debug temporaire pour vérifier le mapping

      
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Nettoyer les erreurs existantes pour ce champ
      setValidationErrors(prev => prev.filter(err => err.field !== field));
      
      if (validationErrors.some(err => err.field === field)) {
        // Petite animation quand un champ a une erreur existante
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 150,
            friction: 8,
            useNativeDriver: true,
          }).start();
        });
      }
    },
    [validationErrors, scaleAnim]
  );

  // -------- Soumission formulaire --------
  const handleSubmit = async () => {
    if (!isFormValid) {
      const firstError = validationErrors[0];
      Alert.alert('Validation', firstError.message);
      return;
    }

    try {
      if (authMode === 'register') {
        const fullPhoneNumber = `${countryCode}${(formData.phoneNumber || '').replace(/^0+/, '')}`;
        await register(
          formData.email,
          formData.username || '',
          formData.firstName || '',
          formData.lastName || '',
          fullPhoneNumber,
          formData.password
        );
      } else if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else /* forgot */ {
        await forgotPassword(formData.email);
        animateFormTransition('login');
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('auth.errors.generalError'));
    }
  };

  // ==================== RENDER ====================
  const renderAnimatedHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <View style={[styles.transportAnimationContainer, isWeb && styles.transportAnimationWeb]}>
        <View style={styles.cloudContainer}>
          <CloudAnimation size={isWeb ? 120 : 80} duration={12000} />
          <CloudAnimation size={isWeb ? 100 : 60} duration={15000} />
        </View>
        <View style={styles.transportContainer}>
          {currentTransport === 'plane' && <PlaneAnimation size={isWeb ? 65 : 45} duration={3000} />}
          {currentTransport === 'boat' && <BoatAnimation size={isWeb ? 65 : 45} duration={4000} />}
          {currentTransport === 'train' && <TrainAnimation size={isWeb ? 75 : 55} duration={3500} />}
        </View>
      </View>

      <FloatingElement direction="up" duration={3000}>
        <View style={[styles.logoContainer, { boxShadow: '0 8px 24px rgba(102,126,234,0.10)' }]}>
          <LinearGradient
            colors={theme.colors.primary || ['#667eea', '#764ba2'] as const}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoEmoji}>🌍</Text>
          </LinearGradient>
        </View>
      </FloatingElement>

      <Text style={[styles.appName, { color: theme.colors.text.light }]}>TripShare</Text>
      <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
        {t('auth.appTagline')} • Voyagez, Partagez, Connectez
      </Text>

      <TouchableOpacity
        style={styles.transportSwitchButton}
        onPress={switchTransport}
        activeOpacity={0.7}
      >
        <Text style={styles.transportSwitchText}>
          {currentTransport === 'plane' && '✈️'}
          {currentTransport === 'boat' && '🚢'}
          {currentTransport === 'train' && '🚂'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCountrySelector = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={{ flex: 1.2, marginBottom: 16 }}>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            style={{
              backgroundColor: inputBg,
              borderColor: '#e0e0e0',
              borderRadius: 12,
              height: 48,
              width: '100%',
              padding: 8,
              color: '#222',
              fontSize: 16,
              fontFamily: 'Inter, Roboto, Arial, sans-serif',
              border: '1px solid #e0e0e0',
              outline: 'none',
            }}
          >
            <option value="">Sélectionner un pays</option>
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </View>
      );
    }

    return (
      <View style={{ flex: 1.2, marginBottom: 16, zIndex: 1000 }}>
        <DropDownPicker
          open={open}
          value={countryCode}
          items={items}
          setOpen={setOpen}
          setValue={setCountryCode}
          setItems={setItems}
          placeholder="Sélectionner un pays"
          style={{
            backgroundColor: inputBg,
            borderColor: '#e0e0e0',
            borderRadius: 12,
            height: 48,
          }}
          textStyle={{
            color: '#222',
            fontSize: 16,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
          }}
          dropDownContainerStyle={{
            backgroundColor: '#fff',
            borderColor: '#e0e0e0',
            borderRadius: 12,
          }}
          listItemLabelStyle={{
            color: '#222',
            fontSize: 16,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
          }}
          searchable={true}
          searchPlaceholder="Rechercher un pays..."
          searchContainerStyle={{
            borderBottomColor: '#e0e0e0',
          }}
          searchTextInputStyle={{
            color: '#222',
            fontSize: 16,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
          }}
        />
      </View>
    );
  };

  const renderEnhancedFormField = (
    icon: string,
    placeholderKey: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldName: keyof FormData,
    keyboardType: any = 'default',
    secureTextEntry = false,
    showPasswordToggle = false
  ) => {
    const isFocused = inputFocused === fieldName;
    const hasError = validationErrors.some(err => err.field === fieldName);
    const isValid = value.length > 0 && !hasError;

    return (
      <Animated.View
        key={`field-${fieldName}`}  // Clé unique pour chaque conteneur de champ
        style={[
          styles.inputWrapper,
          {
            backgroundColor: GLASSMORPHISM_STYLES.background,
            borderWidth: 0, // Suppression complète des bordures
            ...GLASSMORPHISM_STYLES.shadow,
          },
          // Suppression de l'effet de scale au focus
          Platform.OS === 'web' && {
            borderWidth: 0,
            backgroundColor: 'transparent',
          }
        ]}
      >
        <TextInput
          key={`input-${fieldName}`}  // Clé unique pour chaque champ
          style={[
            styles.input, 
            { color: theme.colors.text.light },
            // Styles spécifiques Web pour supprimer les bordures natives
            Platform.OS === 'web' && {
              // @ts-ignore
              outline: 'none',
              borderWidth: 0,
              // @ts-ignore
              boxShadow: 'none',
              // @ts-ignore
              WebkitAppearance: 'none',
              // @ts-ignore
              MozAppearance: 'none',
            }
          ]}
          placeholder={t(placeholderKey)}
          placeholderTextColor={theme.colors.text.secondary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={
            fieldName === 'firstName' || fieldName === 'lastName' ? 'words' : 'none'
          }
          secureTextEntry={secureTextEntry}
          onFocus={() => setInputFocused(fieldName)}
          onBlur={() => setInputFocused(null)}
          editable={!isLoading}
          autoCorrect={false}
       
          textContentType="none"
          spellCheck={false}
          // Propriétés spécifiques pour désactiver l'autocomplétion
          {...(Platform.OS === 'web' && {
            'data-lpignore': 'true',
            'data-form-type': 'other',
          })}
        />

        {isValid && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#4ecdc4"
            style={styles.validationIcon}
          />
        )}

        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() =>
              fieldName === 'password'
                ? setShowPassword(!showPassword)
                : setShowConfirmPassword(!showConfirmPassword)
            }
            disabled={isLoading}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderEnhancedSubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
      onPress={handleSubmit}
      disabled={isLoading || !isFormValid}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          !isFormValid
            ? ['#bdc3c7', '#95a5a6'] as const
            : isLoading
            ? [theme.colors.text.secondary, theme.colors.text.secondary]
            : theme.colors.accent || ['#667eea', '#764ba2'] as const
        }
        style={styles.submitGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>
              {authMode === 'register'
                ? '🚀 Rejoindre TripShare'
                : authMode === 'forgot'
                ? '📧 Envoyer le lien'
                : '✈️ Se connecter'}
            </Text>
            {isFormValid && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEnhancedToggle = (
    checked: boolean,
    onPress: () => void,
    labelKey: string,
    required = false,
    icon?: string
  ) => (
    <TouchableOpacity
      style={styles.toggleContainer}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: checked
              ? theme.colors.accent?.[0] || '#667eea'
              : GLASSMORPHISM_STYLES.background,
            borderColor: checked
              ? theme.colors.accent?.[0] || '#667eea'
              : GLASSMORPHISM_STYLES.border,
          },
          checked && GLASSMORPHISM_STYLES.shadow,
        ]}
      >
        {checked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
      </View>
      <View style={styles.toggleTextContainer}>
        {icon && (
          <Ionicons name={icon as any} size={16} color={theme.colors.text.secondary} style={{ marginRight: 4 }} />
        )}
        <Text style={[styles.toggleText, { color: theme.colors.text.light, flexDirection: 'row', flexWrap: 'wrap' }]}>
          J'accepte les <Text style={{color: '#667eea', textDecorationLine: 'underline'}} onPress={() => navigation.navigate('TermsScreen')}>conditions d'utilisation</Text>{required && <Text style={{ color: '#ff6b6b' }}> *</Text>}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderModernSettings = () => (
    <View style={styles.settingsContainer}>
      <TouchableOpacity
        style={[styles.settingButton, { backgroundColor: GLASSMORPHISM_STYLES.background }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={theme.colors.text.light} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingButton, { backgroundColor: GLASSMORPHISM_STYLES.background }]}
        onPress={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
        activeOpacity={0.7}
      >
        <Text style={[styles.languageText, { color: theme.colors.text.light }]}>
          {i18n.language.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    fetch('https://restcountries.com/v2/all?fields=name,callingCodes,translations')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Réponse inattendue de l'API:", data);
          return;
        }
        const codes = data
          .filter((c: any) => c.callingCodes && c.callingCodes.length > 0)
          .map((c: any) => ({
            code: `+${c.callingCodes[0]}`,
            name: c.translations?.fr || c.name,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountryCodes(codes);
      });
  }, []);

  // Définition du fond uniforme pour tous les inputs (comme le login)
  const inputBg = 'rgba(102, 126, 234, 0.15)';

  // Définition des styles uniformes pour le formulaire register
  const uniformInputStyle = {
    backgroundColor: inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    marginBottom: 16,
  };
  const uniformPlaceholderColor = '#a18cd1';
  const uniformButtonStyle = {
    borderRadius: 12,
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
    boxShadow: '0 8px 24px rgba(102,126,234,0.10)',
  };
  const uniformButtonTextStyle = {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundAnim }]}>
        <LinearGradient
          colors={theme.colors.background?.gradient || ['#667eea', '#764ba2', '#f093fb'] as const}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Boutons paramètres (mode jour/nuit + langue) */}
      {renderModernSettings()}

      {/* KeyboardAvoiding + ScrollView */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            authMode === 'register'
              ? {
                  flexGrow: 1,
                  paddingHorizontal: Platform.OS === 'web' ? (isDesktop ? 40 : 30) : 20,
                  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
                  paddingBottom: 40,
                }
              : styles.scrollContent,
            keyboardVisible && styles.scrollContentKeyboard,
          ]}
        >
          <View style={[
            styles.contentWrapper,
            // Largeur dynamique pour le mode register sur web
            isWeb && authMode === 'register' && { maxWidth: 700 }
          ]}>
            {/* Header animé (logo + transports + titres) */}
            {renderAnimatedHeader()}

            {/* Form Container */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  backgroundColor: GLASSMORPHISM_STYLES.background,
                  borderColor: GLASSMORPHISM_STYLES.border,
                  opacity: formContainerAnim,
                  transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
                  ...GLASSMORPHISM_STYLES.shadow,
                },
                // Largeur adaptée pour register sur web
                isWeb && authMode === 'register' && { maxWidth: 600 }
              ]}
              {...(Platform.OS === 'web' && {
                'data-lpignore': 'true',
                'data-form-type': 'other',
              })}
            >
              {/* Titre du formulaire selon le mode */}
              <Text style={[styles.formTitle, { color: theme.colors.text.light }]}>
                {authMode === 'register'
                  ? "🚀 Rejoignez l'aventure"
                  : authMode === 'forgot'
                  ? '🔐 Récupération'
                  : '👋 Bon retour !'}
              </Text>

              {/* Champs de saisie */}
              <View 
                style={styles.inputContainer}
                {...(Platform.OS === 'web' && {
                  'data-lpignore': 'true',
                  'data-form-type': 'other',
                })}
              >
                {authMode === 'register' && (
                  <>
                    {renderEnhancedFormField(
                      'person-outline',
                      'auth.usernamePlaceholder',
                      formData.username || '',
                      text => updateFormData('username', text),
                      'username'  // Correct fieldName
                    )}

                    <View style={styles.nameRow}>
                      <View style={styles.nameField}>
                        {renderEnhancedFormField(
                          'person-outline',
                          'auth.firstNamePlaceholder',
                          formData.firstName || '',
                          text => updateFormData('firstName', text),
                          'firstName'  // Correct fieldName
                        )}
                      </View>
                      <View style={styles.nameField}>
                        {renderEnhancedFormField(
                          'person-outline',
                          'auth.lastNamePlaceholder',
                          formData.lastName || '',
                          text => updateFormData('lastName', text),
                          'lastName'  // Correct fieldName
                        )}
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                      {renderCountrySelector()}
                      <TextInput
                        style={{
                          backgroundColor: inputBg,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#e0e0e0',
                          height: 48,
                          paddingHorizontal: 14,
                          fontSize: 16,
                          color: '#222',
                          fontFamily: 'Inter, Roboto, Arial, sans-serif',
                          marginBottom: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          lineHeight: 48,
                          flex: 1,
                        }}
                        placeholder="Numéro de téléphone"
                        placeholderTextColor={uniformPlaceholderColor}
                        value={formData.phoneNumber}
                        onChangeText={text => updateFormData('phoneNumber', text)}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </>
                )}

                {/* Affichage de l'erreur pour le numéro de téléphone */}
                {validationErrors.find(e => e.field === 'phoneNumber') && formData.phoneNumber ? (
                  <Text style={styles.registerError}>
                    {String(validationErrors.find(e => e.field === 'phoneNumber')?.message || '')}
                  </Text>
                ) : null}

                {renderEnhancedFormField(
                  'mail-outline',
                  'auth.emailPlaceholder',
                  formData.email,
                  text => updateFormData('email', text.toLowerCase().trim()),
                  'email',
                  'email-address'
                )}

                {authMode !== 'forgot' && (
                  <>
                    {renderEnhancedFormField(
                      'lock-closed-outline',
                      'auth.passwordPlaceholder',
                      formData.password,
                      text => updateFormData('password', text),
                      'password',
                      'default',
                      !showPassword,
                      true
                    )}
                    {authMode === 'register' &&
                      renderEnhancedFormField(
                        'lock-closed-outline',
                        'auth.confirmPasswordPlaceholder',
                        formData.confirmPassword || '',
                        text => updateFormData('confirmPassword', text),
                        'confirmPassword',
                        'default',
                        !showConfirmPassword,
                        true
                      )}
                  </>
                )}
              </View>

              {/* Options complémentaires */}
              {authMode === 'login' && (
                <View style={styles.optionsContainer}>
                  {renderEnhancedToggle(
                    rememberMe,
                    () => setRememberMe(!rememberMe),
                    'auth.rememberMe',
                    false,
                    'heart-outline'
                  )}
                </View>
              )}

              {authMode === 'register' && (
                <View style={[
                  styles.optionsContainer,
                  // Layout web amélioré pour les options
                  isWeb && authMode === 'register' && styles.webOptionsContainer
                ]}>
                  {renderEnhancedToggle(
                    acceptTerms,
                    () => setAcceptTerms(!acceptTerms),
                    'auth.acceptTerms',
                    true,
                    'document-text-outline'
                  )}
                  {renderEnhancedToggle(
                    enableNotifications,
                    () => setEnableNotifications(!enableNotifications),
                    'auth.receiveNotifications',
                    false,
                    'notifications-outline'
                  )}
                </View>
              )}

              {/* Affichage de toutes les erreurs de validation sous le bouton (register uniquement et si au moins un champ est rempli) */}
              {authMode === 'register' && (
                Object.values(formData).some(v => v && v.toString().trim() !== '') || acceptTerms
              ) && validationErrors.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  {validationErrors.map(err => (
                    <Text key={err.field} style={styles.registerError}>
                      {err.message}
                    </Text>
                  ))}
                </View>
              )}

              {/* Bouton principal */}
              {renderEnhancedSubmitButton()}

              {/* Liens de navigation entre modes */}
              <View style={styles.navigationContainer}>
                {authMode === 'login' && (
                  <>
                    <TouchableOpacity onPress={() => animateFormTransition('forgot')} disabled={isLoading}>
                      <Text style={[styles.linkText, { color: theme.colors.text.secondary }]}>
                        🔒 Mot de passe oublié ?
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => animateFormTransition('register')} disabled={isLoading}>
                      <Text style={[styles.linkTextPrimary, { color: theme.colors.text.light }]}>
                        ✨ Créer un compte
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {authMode === 'register' && (
                  <TouchableOpacity onPress={() => animateFormTransition('login')} disabled={isLoading}>
                    <Text style={[styles.linkTextPrimary, { color: theme.colors.text.light }]}>
                      👋 Déjà membre ?
                    </Text>
                  </TouchableOpacity>
                )}
                {authMode === 'forgot' && (
                  <TouchableOpacity onPress={() => animateFormTransition('login')} disabled={isLoading}>
                    <Text style={[styles.linkTextPrimary, { color: theme.colors.text.light }]}>
                      ← Retour à la connexion
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: isWeb ? height : 'auto',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  scrollContentKeyboard: {
    paddingVertical: 20,
  },

  contentWrapper: {
    padding: isWeb ? (isDesktop ? 40 : 30) : 20,
    maxWidth: isWeb ? 500 : '100%',
    alignSelf: 'center',
    width: '100%',
  },

  settingsContainer: {
    position: 'absolute',
    top: isWeb ? 20 : Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  settingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASSMORPHISM_STYLES.border,
    ...GLASSMORPHISM_STYLES.shadow,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '700',
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 25 : 35,
    position: 'relative',
    width: '100%',
  },
  transportAnimationContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  transportAnimationWeb: {
    left: -100,
    right: -100,
    height: 120,
  },
  cloudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  transportContainer: {    
    position: 'absolute',    
    top: 30,    
    left: 0,    
    right: 0,    
    height: 50,  
  },  
  logoContainer: {    
    marginBottom: 15,    
    zIndex: 2,  
  },  
  logoGradient: {    
    width: isWeb ? 80 : isSmallScreen ? 90 : 100,    
    height: isWeb ? 80 : isSmallScreen ? 90 : 100,    
    borderRadius: isWeb ? 40 : isSmallScreen ? 45 : 50,    
    justifyContent: 'center',    
    alignItems: 'center',  
  },  
  logoEmoji: {    
    fontSize: isWeb ? 40 : isSmallScreen ? 45 : 50,  
  },  
  appName: {    
    fontSize: isWeb ? 28 : isSmallScreen ? 32 : 36,    
    fontWeight: '800',    
    marginBottom: 8,    
    textShadowColor: 'rgba(0,0,0,0.3)',    
    textShadowOffset: { width: 0, height: 2 },    
    textShadowRadius: 4,  
  },  
  tagline: {    
    fontSize: isWeb ? 14 : isSmallScreen ? 15 : 16,    
    textAlign: 'center',    
    marginBottom: 20,    
    fontWeight: '500',    
    opacity: 0.9,  
  },  
  transportSwitchButton: {    
    position: 'absolute',    
    top: 20,    
    right: 20,    
    width: 40,    
    height: 40,    
    borderRadius: 20,    
    backgroundColor: GLASSMORPHISM_STYLES.background,    
    justifyContent: 'center',    
    alignItems: 'center',    
    borderWidth: 1,    
    borderColor: GLASSMORPHISM_STYLES.border,  
  },  
  transportSwitchText: {    
    fontSize: 20,  
  },  

  formContainer: {
    borderRadius: 20,
    padding: isWeb ? 12 : isSmallScreen ? 22 : 28,
    maxWidth: isWeb ? 360 : '100%',
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
  },
  formTitle: {
    fontSize: isWeb ? 22 : isSmallScreen ? 22 : 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: isWeb ? 1 : 22,
  },
  inputContainer: {
    marginBottom: 18,
  },
  
  // Styles Web optimisés pour le formulaire register
  webFieldContainer: {
    marginBottom: 12,
  },
  webRowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  webFieldHalf: {
    flex: 1,
  },
  
  // Styles mobile existants
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: isWeb ? 52 : isSmallScreen ? 54 : 56,
  },
  inputWrapperFocused: {
    transform: [{ scale: 1.02 }],
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: isWeb ? 15 : isSmallScreen ? 16 : 17,
    fontWeight: '500',
  },
  validationIcon: {
    marginLeft: 8,
  },
  eyeIcon: {
    padding: 8,
  },

  optionsContainer: {
    marginBottom: 18,
  },
  webOptionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggle: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    fontSize: isWeb ? 13 : isSmallScreen ? 14 : 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },

  submitButton: {
    borderRadius: 12,
    marginBottom: 18,
    ...GLASSMORPHISM_STYLES.shadow,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    paddingVertical: isWeb ? 16 : isSmallScreen ? 17 : 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: isWeb ? 16 : isSmallScreen ? 17 : 18,
    fontWeight: '700',
  },

  navigationContainer: {
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: isWeb ? 13 : isSmallScreen ? 14 : 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  linkTextPrimary: {
    fontSize: isWeb ? 14 : isSmallScreen ? 15 : 16,
    fontWeight: '700',
    textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
  },
  registerError: {
    color: '#ff6b6b',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

export default AuthScreenEnhanced;