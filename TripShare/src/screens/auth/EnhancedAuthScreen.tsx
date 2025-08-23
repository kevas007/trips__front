import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Dimensions, Animated, ActivityIndicator, ImageBackground, Alert, Easing, KeyboardAvoidingView } from 'react-native';
import { SmartFormWrapper } from '../../components/ui/IntelligentKeyboardSystem';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/ui/Button';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../design-system';
import AppLogo from '../../components/ui/AppLogo';
import { LOCAL_ASSETS } from '../../constants/assets';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getFontSize, getSpacing, getBorderRadius, getInputHeight, screenDimensions } from '../../utils/responsive';
import { countryService, CountryOption } from '../../services/countryService';
import CountryPickerModal from '../../components/ui/CountryPickerModal';
import { Theme } from '../../types/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store';
import { ErrorHandler } from '../../components/ui/ErrorHandler';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import { SocialAuthResult, SocialAuthError } from '../../services/socialAuth';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { tripShareApi } from '../../services';


type AuthStackParamList = {
  AuthScreen: undefined;
  TermsScreen: undefined;
  OnboardingScreen: undefined;
  TravelPreferencesScreen: undefined;
};

type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;

const { width } = Dimensions.get('window');

const MODES = [
  { key: 'login', label: 'Connexion' },
  { key: 'register', label: 'Inscription' },
  { key: 'forgot', label: 'Récupération' },
];

const EnhancedAuthScreen = () => {
  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp>();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Store d'authentification
  const { 
    login, 
    register, 
    isLoading, 
    error, 
    clearError 
  } = useAuthStore();

  // Injecter des styles CSS globaux pour la liste déroulante sur web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        select option {
          background-color: rgba(30, 41, 59, 0.95) !important;
          color: #fff !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        select option:hover {
          background-color: rgba(51, 65, 85, 0.95) !important;
        }
        select option:checked, select option:selected {
          background-color: rgba(102, 126, 234, 0.8) !important;
          color: #fff !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    countryCode: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    rememberMe: false,
  });

  // Debug désactivé en production
  // console.log('Form values:', form);


  const [errors, setErrors] = useState<any>({});


  const [formAnim] = React.useState(new Animated.Value(0));
  const [headerAnim] = React.useState(new Animated.Value(0));
  const [themeTransition] = React.useState(new Animated.Value(isDark ? 1 : 0));
  
  // Animations pour les éléments de voyage flottants
  const [planeAnim] = React.useState(new Animated.Value(0));
  const [boatAnim] = React.useState(new Animated.Value(0));
  const [trainAnim] = React.useState(new Animated.Value(0));
  const [carAnim] = React.useState(new Animated.Value(0));
  const [balloonAnim] = React.useState(new Animated.Value(0));

  const [success, setSuccess] = useState(false);
  
  // États pour les pays
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Animations des éléments de voyage flottants
    const startTravelAnimations = () => {
      // Avion - traverse l'écran de gauche à droite
      Animated.loop(
        Animated.timing(planeAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Bateau - mouvement ondulant
      Animated.loop(
        Animated.timing(boatAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ).start();

      // Train - mouvement horizontal régulier
      Animated.loop(
        Animated.timing(trainAnim, {
          toValue: 1,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Voiture - zigzag
      Animated.loop(
        Animated.timing(carAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.bezier(0.65, 0, 0.35, 1),
          useNativeDriver: true,
        })
      ).start();

      // Montgolfière - mouvement vertical lent
      Animated.loop(
        Animated.timing(balloonAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ).start();
    };

    // Délai pour démarrer les animations après l'animation principale
    setTimeout(startTravelAnimations, 1000);
  }, []);

  // Animation de transition pour le changement de thème
  useEffect(() => {
    Animated.timing(themeTransition, {
      toValue: isDark ? 1 : 0,
      duration: 600, // Transition fluide de 600ms
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false, // false car on anime opacity
    }).start();
  }, [isDark]);

  // Charger les pays au montage du composant
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setCountriesLoading(true);
        const countryList = await countryService.getCountries();
        setCountries(countryList);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      } finally {
        setCountriesLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Gestion du changement de champ
  const handleChange = (field: string, value: any) => {
    // Formater automatiquement le numéro de téléphone
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }

    setForm((prev: typeof form) => ({ ...prev, [field]: value }));
  };

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Nettoyer le numéro (enlever espaces, tirets, parenthèses)
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si le numéro commence par 0, l'enlever
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Ajouter des espaces pour la lisibilité (français: XX XX XX XX XX)
    if (cleaned.length >= 2) {
      cleaned = cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
    }
    
    return cleaned.trim();
  };

  // Validation simple (à adapter selon besoins)
  const validate = () => {
    const newErrors: any = {};
    if (mode === 'register') {
      if (!form.email) newErrors.email = 'Champ requis';
      if (!form.username) newErrors.username = 'Champ requis';
      else if (form.username.length < 3) newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      if (!form.firstName) newErrors.firstName = 'Champ requis';
      if (!form.lastName) newErrors.lastName = 'Champ requis';
      if (!form.phone) newErrors.phone = 'Champ requis';
      if (!form.password) newErrors.password = 'Champ requis';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      if (!form.acceptTerms) newErrors.acceptTerms = 'Obligatoire';
    } else if (mode === 'login') {
      if (!form.email) newErrors.email = 'Champ requis';
      if (!form.password) newErrors.password = 'Champ requis';
    } else if (mode === 'forgot') {
      if (!form.email) newErrors.email = 'Champ requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitWithSuccess = async () => {
    if (!validate()) return;
    
    try {
      clearError(); // Effacer les erreurs précédentes
      
      if (mode === 'login') {
        await login({
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe,
        });
      } else if (mode === 'register') {
        await register({
          email: form.email,
          username: form.username,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: `${form.countryCode}${form.phone}`,
          password: form.password,
        });
        // L'onboarding sera affiché automatiquement grâce à isNewUser dans AuthNavigator
        return;
      } else if (mode === 'forgot') {
        try {
          await tripShareApi.forgotPassword({ email: form.email });
          Alert.alert(t('auth.forgotTitle'), t('auth.forgotButton') + ' ✓');
          // Rediriger vers l'écran de réinitialisation UNIQUEMENT si l'email existe
          // @ts-ignore - route ajoutée dans AuthNavigator
          navigation.navigate('ResetPasswordScreen');
        } catch (e: any) {
          const msg = e?.message || '';
          if (msg.toLowerCase().includes("n'existe pas") || msg.toLowerCase().includes('introuvable')) {
            Alert.alert('Email introuvable', 'Cet email n\'existe pas. Vérifiez et réessayez.');
          } else {
            Alert.alert('Erreur', 'Impossible d\'envoyer le lien pour le moment. Réessayez plus tard.');
          }
          return;
        }
      }
      
      // Succès - afficher l'animation
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1800);
    } catch (error) {
      // Les erreurs sont gérées par le store
      console.error('Erreur d\'authentification:', error);
    }
  };

  // Gestion du changement de langue
  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    changeLanguage(newLang);
  };

  // Fonction pour obtenir le code de langue actuel
  const getCurrentLanguageCode = () => {
    return i18n.language === 'fr' ? 'FR' : 'EN';
  };

  // Handlers pour l'authentification sociale
  const handleSocialAuthSuccess = async (result: SocialAuthResult) => {
    try {
      // Connexion avec les données sociales
      await login({
        email: result.email,
        password: '', // Mot de passe vide pour l'auth sociale
        socialAuth: {
          provider: result.provider,
          id: result.id,
          idToken: result.idToken,
          name: result.name,
          photoURL: result.photoURL,
        },
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1800);
    } catch (error) {
      console.error('Erreur auth sociale:', error);
    }
  };

  const handleSocialAuthError = (error: SocialAuthError) => {
    console.error('Erreur auth sociale:', error);
    // Vous pouvez afficher un toast ou une notification d'erreur ici
  };

  // Affichage conditionnel des champs
  const isRegister = mode === 'register';
  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';

  // Détection des valeurs de démonstration pour bloquer la soumission
  const demoEmail = 'john.doe@example.com';
  const demoUsername = 'john_doe';
  const demoPassword = 'password123';

  const emailIsDemo = (form.email || '').trim().toLowerCase() === demoEmail;
  const usernameIsDemo = (form.username || '').trim().toLowerCase() === demoUsername;
  const passwordIsDemo = (form.password || '') === demoPassword;

  const isSubmitDisabled = (
    isLoading ||
    (isLogin && (!form.email || !form.password || emailIsDemo || passwordIsDemo)) ||
    (isRegister && (
      !form.email || !form.username || !form.firstName || !form.lastName || !form.phone || !form.password ||
      form.password !== form.confirmPassword || !form.acceptTerms ||
      emailIsDemo || usernameIsDemo || passwordIsDemo
    )) ||
    (isForgot && (!form.email || emailIsDemo))
  );

  // Création des styles avec le thème actuel
  const styles = StyleSheet.create({
    // Styles pour l'input téléphone unifié
    embeddedCountrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: getSpacing(8),
    },
    embeddedCountryPicker: {
      minWidth: Platform.OS === 'android' ? 60 : 70,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
    },
    separatorLine: {
      width: 1,
      height: '70%',
      backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
      marginLeft: getSpacing(4),
    },
    loadingCountryIndicator: {
      width: Platform.OS === 'android' ? 60 : 70,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: getSpacing(4),
    },
    phoneFormatContainer: {
      alignItems: 'center',
      marginBottom: Platform.OS === 'android' ? getSpacing(8) : getSpacing(12),
    },
    phoneFormatExample: {
      fontSize: getFontSize(12),
      color: Platform.OS === 'android' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
      fontFamily: Platform.OS === 'web' ? 'Inter, sans-serif' : undefined,
      fontWeight: '500',
      textAlign: 'center',
      backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
      paddingHorizontal: getSpacing(8),
      paddingVertical: getSpacing(4),
      borderRadius: getBorderRadius(6),
      borderWidth: 1,
      borderColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
    },
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: Platform.OS === 'ios'
        ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)')
        : (isDark ? '#2A2A2A' : '#FFFFFF'),
      borderRadius: 14,
      padding: 4,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: Platform.OS === 'ios'
        ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.32)')
        : (isDark ? '#404040' : '#E0E0E0'),
      gap: 6,
      width: '100%',
      maxWidth: 400,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: Platform.OS === 'ios' ? 0.20 : 0,
      shadowRadius: 20,
      elevation: Platform.OS === 'android' ? 0 : undefined,
    },
    modeBtn: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeBtnActive: {
      backgroundColor: Platform.OS === 'ios'
        ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.32)')
        : (isDark ? '#404040' : '#F5F5F5'),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: Platform.OS === 'ios' ? (isDark ? 0.25 : 0.20) : 0,
      shadowRadius: 16,
      elevation: Platform.OS === 'android' ? 0 : undefined,
    },
    modeBtnText: {
      color: isDark ? 'rgba(255,255,255,0.75)' : '#49454F',
      fontWeight: '600',
      fontSize: getFontSize(14),
      letterSpacing: 0.1,
    },
    modeBtnTextActive: {
      color: isDark ? '#fff' : '#1C1B1F',
    },
    appContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formContainer: {
      width: '100%',
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: getSpacing(Platform.OS === 'android' ? 8 : (screenDimensions.isSmallScreen ? 12 : 20)),
      maxWidth: 450,
    },
    scrollContent: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      // Supprimer flexGrow qui force l'expansion
      // flexGrow: 1,
    },
    background: {
      ...StyleSheet.absoluteFillObject,
      zIndex: -1,
    },
    floatingShape: {
      position: 'absolute',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
      borderRadius: 999,
    },
    shape1: { width: 80, height: 80, top: '20%', left: '10%' },
    shape2: { width: 120, height: 120, top: '60%', right: '15%' },
    shape3: { width: 60, height: 60, bottom: '30%', left: '20%' },
    settingsPanel: {
      position: 'absolute',
      top: 20,
      right: 20,
      flexDirection: 'row',
      gap: 12,
      zIndex: 100,
    },
    settingBtn: {
      width: 48,
      height: 48,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      ...(Platform.OS === 'web' && {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }),
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Platform.OS === 'android' ? 24 : 32,
      zIndex: 10,
    },
    appName: {
      fontSize: getFontSize(36),
      fontWeight: '800',
      color: isDark ? '#fff' : '#1C1B1F', // Material Design 3 - blanc en dark, noir en light
      marginBottom: getSpacing(8),
      textShadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
      textShadowOffset: { width: 0, height: 4 },
      textShadowRadius: 20,
    },
    tagline: {
      fontSize: getFontSize(13),
      color: isDark ? 'rgba(255,255,255,0.8)' : '#49454F', // Material Design 3 - texte secondaire
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: getSpacing(12),
    },
    formTitle: {
      fontSize: getFontSize(28),
      fontWeight: '700',
      color: isDark ? '#fff' : '#1C1B1F',
      textAlign: 'center',
      marginBottom: getSpacing(Platform.OS === 'android' ? 20 : 24),
      textShadowColor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
      paddingHorizontal: getSpacing(8),
      width: '100%',
    },
    inputRow: {
      flexDirection: 'row',
      gap: getSpacing(Platform.OS === 'android' ? 4 : 8),
      marginBottom: getSpacing(Platform.OS === 'android' ? 16 : 20),
      justifyContent: 'space-between',
      width: '100%',
      flexWrap: screenDimensions.isSmallScreen ? 'wrap' : 'nowrap',
    },
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start', // Aligner les éléments en haut
      gap: 0,
      marginBottom: getSpacing(Platform.OS === 'android' ? 16 : 20),
      justifyContent: 'space-between',
      flexWrap: screenDimensions.isSmallScreen ? 'wrap' : 'nowrap',
    },
    countrySelectWrapper: {
      width: screenDimensions.isSmallScreen ? 70 : (Platform.OS === 'web' ? 120 : 100),
      marginBottom: 0,
      height: getInputHeight(),
      borderRadius: 16,
      backgroundColor: Platform.OS === 'ios'
        ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.20)')
        : (isDark ? '#2A2A2A' : '#FFFFFF'),
      borderWidth: 1,
      borderColor: Platform.OS === 'ios'
        ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.30)')
        : (isDark ? '#404040' : '#E0E0E0'),
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Platform.OS === 'ios' ? (isDark ? 0.10 : 0.06) : 0,
      shadowRadius: 4,
      elevation: Platform.OS === 'android' ? 0 : undefined,
    },
    checkboxGroup: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: getSpacing(16),
      gap: getSpacing(8),
      width: '100%',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#79747E',
      borderRadius: 4,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: "#008080",
      borderColor: "#008080",
    },
    checkboxLabel: {
      color: isDark ? 'rgba(255,255,255,0.88)' : '#49454F',
      fontSize: getFontSize(14),
      fontWeight: '500',
      marginLeft: getSpacing(8),
      flex: 1,
      flexWrap: 'wrap',
    },
    termsLink: {
      color: isDark ? COLORS.accent.yellow : '#008080',
      fontWeight: '600',
    },
    formNavigation: {
      marginTop: getSpacing(16),
      alignItems: 'center',
      gap: getSpacing(12),
      width: '100%',
    },
    inputWrapper: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: getSpacing(Platform.OS === 'android' ? 12 : 16),
      backgroundColor: Platform.OS === 'ios' 
        ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.20)')
        : (isDark ? '#2A2A2A' : '#FFFFFF'),
      borderWidth: 1,
      borderColor: Platform.OS === 'ios'
        ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.30)')
        : (isDark ? '#404040' : '#E0E0E0'),
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing(16),
      width: '100%',
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Platform.OS === 'ios' ? (isDark ? 0.10 : 0.06) : 0,
      shadowRadius: 4,
      elevation: Platform.OS === 'android' ? 0 : undefined,
    },
    inputWrapperFilled: {
      borderColor: '#008080',
      borderWidth: 2,
      backgroundColor: isDark ? 'rgba(0,128,128,0.06)' : 'rgba(0,128,128,0.03)',
    },
    button: {
      backgroundColor: '#008080',
      borderRadius: getBorderRadius(16),
      height: 56,
      marginBottom: getSpacing(18),
      marginTop: getSpacing(8),
      shadowColor: '#008080',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 6,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: getSpacing(20),
      borderWidth: 0,
      width: '100%',
    },
    buttonText: {
      fontSize: getFontSize(16),
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    link: {
      color: isDark ? COLORS.accent.yellow : '#008080',
      fontWeight: '600',
      fontSize: getFontSize(14),
      marginTop: getSpacing(4),
      marginBottom: getSpacing(4),
      textAlign: 'center',
    },
    formContainerWeb: {},
    loadingSpinner: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: 10,
      marginRight: 8,
    },
    buttonWeb: {
      ...(Platform.OS === 'web' && {
        transition: 'all 0.3s',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
      }),
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      shadowColor: '#10b981',
      shadowOpacity: 0.25,
      shadowRadius: 18,
      borderColor: '#10b981',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      paddingHorizontal: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)',
    },
    dividerText: {
      color: isDark ? 'rgba(255,255,255,0.6)' : '#49454F', // Material Design 3 - texte adaptatif
      fontSize: 13,
      fontWeight: '600',
      marginHorizontal: 15,
      textAlign: 'center',
    },
    phoneHint: {
      fontSize: getFontSize(11),
      color: isDark ? 'rgba(255,255,255,0.6)' : '#79747E', // Material Design 3 - texte hint
      marginTop: -getSpacing(12),
      marginBottom: getSpacing(8),
      paddingLeft: getSpacing(8),
      fontStyle: 'italic',
    },
    passwordMatchIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: -getSpacing(8),
      marginBottom: getSpacing(12),
      paddingLeft: getSpacing(8),
    },
    passwordMatchText: {
      fontSize: getFontSize(11),
      fontWeight: '600',
      marginLeft: getSpacing(6),
      color: isDark ? 'rgba(255,255,255,0.8)' : '#49454F', // Material Design 3 - texte adaptatif
    },
    
    // Styles pour les éléments de voyage animés
    travelElementsContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
      pointerEvents: 'none',
    },
    travelElement: {
      position: 'absolute',
      zIndex: 1,
    },
    travelIcon: {
      textAlign: 'center',
      opacity: 0.6,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
  });

  const fixedStyle = {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative' as const,
    minHeight: '100%',
    maxHeight: '100%',
    overflow: 'hidden'
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
        enabled={true}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top + getSpacing(20),
            paddingBottom: insets.bottom + getSpacing(20),
            paddingHorizontal: insets.left + insets.right > 0 ? getSpacing(20) : 0,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        <View 
          style={[styles.formContainer, { 
            backgroundColor: 'transparent',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            paddingBottom: getSpacing(20),
            marginBottom: 0,
            marginTop: 0,
            minHeight: 0,
            maxHeight: undefined
          }]}
          importantForAccessibility="no-hide-descendants"
        >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <AppLogo size={80} />
                <Text style={styles.appName}>TripShare</Text>
                <Text style={styles.tagline}>{t('auth.tagline')}</Text>
              </View>

              {/* Mode Toggle */}
              <View style={styles.modeToggle}>
                {MODES.map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
                    onPress={() => setMode(m.key as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modeBtnText, mode === m.key && styles.modeBtnTextActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Form Title */}
              <Text style={styles.formTitle}>
                {mode === 'register' && '✨ Rejoignez l\'aventure'}
                {mode === 'login' && 'Bon retour !'}
                {mode === 'forgot' && 'Récupération de compte'}
              </Text>

              {/* Champs du formulaire */}

              {(isRegister || Platform.OS === 'web') && (
                <>
                  <AuthInput
                    icon="person-outline"
                                          placeholder={t('auth.usernamePlaceholder')}
                    value={form.username}
                    onChangeText={(v: string) => handleChange('username', v)}
                    error={errors.username}
                    isValid={form.username.length > 0 && !errors.username}
                    style={[styles.inputWrapper, form.username.length > 0 && styles.inputWrapperFilled]}
                    success={form.username.length > 0 && !errors.username}
                  />
                  {/* Prénom */}
                  <AuthInput
                    icon="person-outline"
                    placeholder="👤 Prénom"
                    value={form.firstName}
                    onChangeText={(v: string) => handleChange('firstName', v)}
                    error={errors.firstName}
                    isValid={form.firstName.length > 0 && !errors.firstName}
                    autoCapitalize="words"
                    style={[styles.inputWrapper, form.firstName.length > 0 && styles.inputWrapperFilled]}
                    success={form.firstName.length > 0 && !errors.firstName}
                  />
                  
                  {/* Nom */}
                  <AuthInput
                    icon="person-outline"
                    placeholder="👤 Nom"
                    value={form.lastName}
                    onChangeText={(v: string) => handleChange('lastName', v)}
                    error={errors.lastName}
                    isValid={form.lastName.length > 0 && !errors.lastName}
                    autoCapitalize="words"
                    style={[styles.inputWrapper, form.lastName.length > 0 && styles.inputWrapperFilled]}
                    success={form.lastName.length > 0 && !errors.lastName}
                  />
                  {/* Input téléphone unifié avec indicatif intégré */}
                  <AuthInput
                    placeholder="📱 Téléphone"
                    value={form.phone}
                    onChangeText={(v: string) => handleChange('phone', v)}
                    error={errors.phone}
                    isValid={form.phone.length > 0 && !errors.phone}
                    keyboardType="phone-pad"
                    leftComponent={
                      <View style={styles.embeddedCountrySelector}>
                        {countriesLoading ? (
                          <View style={styles.loadingCountryIndicator}>
                            <ActivityIndicator size="small" color="#008080" />
                          </View>
                        ) : (
                          <>
                            <CountryPickerModal
                              selectedValue={form.countryCode}
                              onValueChange={(v: string) => handleChange('countryCode', v)}
                              countries={countries}
                              loading={countriesLoading}
                            />
                            <View style={styles.separatorLine} />
                          </>
                        )}
                      </View>
                    }
                    style={[
                      styles.inputWrapper,
                      form.phone.length > 0 && styles.inputWrapperFilled,
                      {
                        marginBottom: Platform.OS === 'android' ? getSpacing(4) : 0,
                      }
                    ]}
                    success={form.phone.length > 0 && !errors.phone}
                  />
                  
                  {/* Message d'aide pour le téléphone avec format unique */}
                  {isRegister && (
                    <Text style={[styles.phoneHint, {
                      marginTop: Platform.OS === 'android' ? getSpacing(4) : getSpacing(8),
                      marginBottom: Platform.OS === 'android' ? getSpacing(8) : getSpacing(12),
                    }]}>
                      Format: {form.countryCode} 123 456 789
                    </Text>
                  )}
                </>
              )}

              {/* Email et mot de passe */}
              {(isRegister || isLogin || isForgot) && (
                <AuthInput
                  icon="mail-outline"
                  placeholder={t('auth.emailPlaceholder')}
                  value={form.email}
                  onChangeText={(v: string) => handleChange('email', v)}
                  error={errors.email}
                  isValid={form.email.length > 0 && !errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.inputWrapper, form.email.length > 0 && styles.inputWrapperFilled]}
                  success={form.email.length > 0 && !errors.email}
                />
              )}
              {(isRegister || isLogin) && (
                <AuthInput
                  icon="lock-closed-outline"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={form.password}
                  onChangeText={(v: string) => handleChange('password', v)}
                  error={errors.password}
                  isValid={form.password.length > 0 && !errors.password}
                  secureTextEntry
                  showPasswordToggle
                  style={[styles.inputWrapper, form.password.length > 0 && styles.inputWrapperFilled]}
                  success={form.password.length > 0 && !errors.password}
                />
              )}
              {isRegister && (
                <>
                  <AuthInput
                    icon="lock-closed-outline"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={form.confirmPassword}
                    onChangeText={(v: string) => handleChange('confirmPassword', v)}
                    error={errors.confirmPassword}
                    isValid={form.confirmPassword.length > 0 && !errors.confirmPassword && form.password === form.confirmPassword}
                    secureTextEntry
                    showPasswordToggle
                    style={[styles.inputWrapper, form.confirmPassword.length > 0 && styles.inputWrapperFilled]}
                    success={form.confirmPassword.length > 0 && !errors.confirmPassword && form.password === form.confirmPassword}
                  />
                  
                  {/* Indicateur de correspondance des mots de passe */}
                  {form.password.length > 0 && form.confirmPassword.length > 0 && (
                    <View style={styles.passwordMatchIndicator}>
                      <Ionicons 
                        name={form.password === form.confirmPassword ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={form.password === form.confirmPassword ? "#4ecdc4" : "#ef4444"} 
                      />
                      <Text style={[
                        styles.passwordMatchText, 
                        { color: form.password === form.confirmPassword ? "#4ecdc4" : "#ef4444" }
                      ]}>
                        {form.password === form.confirmPassword 
                          ? t('auth.passwordsMatch') 
                          : t('auth.passwordsDontMatch')
                        }
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* Checkbox conditions d'utilisation */}
              {isRegister && (
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={[styles.checkbox, form.acceptTerms && styles.checkboxChecked]}
                    onPress={() => handleChange('acceptTerms', !form.acceptTerms)}
                    activeOpacity={0.8}
                  >
                    {form.acceptTerms && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>
                    {t('auth.acceptTerms')}
                    <TouchableOpacity onPress={() => navigation.navigate('TermsScreen')}>
                      <Text style={styles.termsLink}>{t('auth.termsLink')}</Text>
                    </TouchableOpacity> <Text style={{ color: COLORS.semantic.error }}>*</Text>
                  </Text>
                </View>
              )}

              {/* Checkbox se rappeler de moi */}
              {isLogin && (
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={[styles.checkbox, form.rememberMe && styles.checkboxChecked]}
                    onPress={() => handleChange('rememberMe', !form.rememberMe)}
                    activeOpacity={0.8}
                  >
                    {form.rememberMe && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>{t('auth.rememberMe')}</Text>
                </View>
              )}

              {/* Affichage des erreurs */}
              {error && (
                <ErrorHandler
                  error={{
                    code: 'NETWORK_ERROR',
                    message: error,
                    details: null
                  }}
                  onRetry={handleSubmitWithSuccess}
                  onClear={clearError}
                  compact
                />
              )}

              {/* Affichage des erreurs spécifiques d'inscription */}
              {mode === 'register' && error && (
                <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 8 }}>
                  {error.includes('déjà utilisé') || error.includes('duplicate') || error.includes('existe déjà')
                    ? "Cet email ou nom d'utilisateur est déjà utilisé."
                    : error}
                </Text>
              )}

              {/* Bouton de soumission */}
              <TouchableOpacity
                onPress={handleSubmitWithSuccess}
                disabled={isSubmitDisabled}
                style={[
                  {
                    borderRadius: getBorderRadius(18),
                    height: getInputHeight() + 8,
                    marginBottom: getSpacing(18),
                    marginTop: getSpacing(8),
                    shadowColor: '#008080',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 6,
                    overflow: 'hidden',
                  },
                  isSubmitDisabled && { opacity: 0.6 },
                  success && { backgroundColor: '#10b981' },
                ]}
                activeOpacity={0.92}
              >
                <View style={{
                  backgroundColor: success ? '#34C759' : '#008080',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  paddingHorizontal: getSpacing(20),
                }}>
                  {isLoading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <View style={styles.loadingSpinner} />
                      <Text style={styles.buttonText}>{t('common.loading')}</Text>
                    </View>
                  ) : success ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <Ionicons name="checkmark-circle" size={getFontSize(24)} color="#fff" style={{ marginRight: getSpacing(8) }} />
                      <Text style={styles.buttonText}>{t('common.success')}</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      {mode === 'register' && <Ionicons name="rocket" size={getFontSize(22)} color="#fff" style={{ marginRight: getSpacing(8) }} />}
                      {mode === 'login' && <Ionicons name="airplane" size={getFontSize(22)} color="#fff" style={{ marginRight: getSpacing(8) }} />}
                      {mode === 'forgot' && <Ionicons name="mail" size={getFontSize(22)} color="#fff" style={{ marginRight: getSpacing(8) }} />}
                      <Text style={styles.buttonText}>
                        {mode === 'register' && 'Commencer l\'aventure'}
                        {mode === 'login' && 'Se connecter'}
                        {mode === 'forgot' && 'Envoyer le lien'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Séparateur "OU" CACHÉ */}
              {/* {(mode === 'login' || mode === 'register') && (
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OU</Text>
                  <View style={styles.divider} />
                </View>
              )} */}

              {/* Boutons d'authentification sociale */}
              {(mode === 'login' || mode === 'register') && (
                <SocialAuthButtons
                  onSuccess={handleSocialAuthSuccess}
                  onError={handleSocialAuthError}
                  disabled={isLoading}
                  fullWidth
                />
              )}

              {/* Navigation */}
              <View style={styles.formNavigation}>
                {mode === 'register' && (
                  <TouchableOpacity onPress={() => setMode('login')}>
                    <Text style={styles.link}>🌍 Déjà membre ? Se connecter</Text>
                  </TouchableOpacity>
                )}
                {mode === 'login' && (
                  <>
                    <TouchableOpacity onPress={() => setMode('forgot')}>
                      <Text style={styles.link}>🔑 Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode('register')}>
                      <Text style={styles.link}>✨ Créer un compte</Text>
                    </TouchableOpacity>
                  </>
                )}
                {mode === 'forgot' && (
                  <TouchableOpacity onPress={() => setMode('login')}>
                    <Text style={styles.link}>← Retour à la connexion</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

const createStyles = (isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center', // Centrer le contenu sans forcer la hauteur
    // Supprimer les paddings qui créent l'espace blanc
    // paddingVertical: Platform.OS === 'web' ? getSpacing(20) : getSpacing(24),
    // paddingHorizontal: Platform.OS === 'web' ? getSpacing(20) : 0,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  floatingShape: {
    position: 'absolute',
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
    borderRadius: 999,
  },
  shape1: { width: 80, height: 80, top: '20%', left: '10%' },
  shape2: { width: 120, height: 120, top: '60%', right: '15%' },
  shape3: { width: 60, height: 60, bottom: '30%', left: '20%' },
  settingsPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 100,
  },
  settingBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  appContainer: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    fontSize: getFontSize(36),
    fontWeight: '800',
    color: isDark ? '#fff' : '#1C1B1F', // Material Design 3 - blanc en dark, noir en light
    marginBottom: getSpacing(8),
    textShadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: getFontSize(13),
    color: isDark ? 'rgba(255,255,255,0.8)' : '#49454F', // Material Design 3 - texte secondaire
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: getSpacing(12),
  },
  formContainer: {
    backgroundColor: isDark 
      ? 'rgba(255,255,255,0.12)' 
      : 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: isDark 
      ? 'rgba(255,255,255,0.25)' 
      : 'rgba(255,255,255,0.45)',
    borderRadius: getBorderRadius(20),
    padding: getSpacing(16),
    width: Platform.OS === 'web' ? '100%' : '90%',
    maxWidth: Platform.OS === 'web' ? 450 : 400,
    ...Platform.select({
      ios: {
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isDark ? 0.25 : 0.15,
        shadowRadius: 16,
        backgroundColor: isDark 
          ? 'rgba(255,255,255,0.15)' 
          : 'rgba(255,255,255,0.35)',
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: isDark 
          ? '0 12px 24px rgba(0,0,0,0.25)' 
          : '0 12px 24px rgba(0,0,0,0.15)'
      }
    }),
    // Supprimer les marges qui créent l'espace blanc
    // marginBottom: getSpacing(18),
    // marginTop: Platform.OS === 'web' ? getSpacing(20) : 0,
    alignSelf: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)',
    gap: 6,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.15 : 0.10,
    shadowRadius: 12,
  },
  modeBtnText: {
    color: isDark ? 'rgba(255,255,255,0.75)' : '#49454F', // Material Design 3 - texte adaptatif
    fontWeight: '700',
    fontSize: getFontSize(11),
    letterSpacing: 0.1,
  },
  modeBtnTextActive: {
    color: isDark ? '#fff' : '#1C1B1F', // Material Design 3 - texte actif adaptatif
  },
  formTitle: {
    fontSize: getFontSize(26),
    fontWeight: '700',
    color: isDark ? '#fff' : '#1C1B1F', // Material Design 3 - adaptatif selon le thème
    textAlign: 'center',
    marginBottom: getSpacing(24),
    textShadowColor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: getSpacing(8),
  },
  inputRow: {
    flexDirection: 'row',
    gap: Platform.OS === 'android' ? getSpacing(8) : getSpacing(12),
    marginBottom: Platform.OS === 'android' ? getSpacing(10) : getSpacing(16),
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Aligner les éléments en haut
    gap: Platform.OS === 'android' ? getSpacing(2) : getSpacing(6), // Très rapprochés sur Android
    marginBottom: Platform.OS === 'android' ? getSpacing(8) : getSpacing(16), // Réduire margin bottom sur Android
  },

  countrySelectWrapper: {
    width: Platform.OS === 'web' ? 120 : Platform.OS === 'android' ? 70 : 95, // Encore plus compact sur Android pour laisser place au téléphone
    marginBottom: 0,
    // Assurer la même hauteur que l'AuthInput
    height: getInputHeight(),
    marginRight: Platform.OS === 'android' ? 0 : getSpacing(2), // Supprimer margin sur Android
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#79747E',
    borderRadius: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: "#008080",
    borderColor: "#008080",
  },
  checkboxLabel: {
    color: isDark ? 'rgba(255,255,255,0.88)' : '#49454F', // Material Design 3 - texte lisible
    fontSize: getFontSize(13),
    fontWeight: '500',
    marginLeft: getSpacing(8),
    flex: 1,
    flexWrap: 'wrap',
  },
  termsLink: {
    color: isDark ? COLORS.accent.yellow : '#008080', // Material Design 3 - teal en mode clair
    fontWeight: '700',
  },
  formNavigation: {
    marginTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        backgroundColor: isDark 
          ? 'rgba(255,255,255,0.15)' 
          : 'rgba(255,255,255,0.35)',
        borderWidth: 1,
        borderColor: isDark 
          ? 'rgba(255,255,255,0.25)' 
          : 'rgba(255,255,255,0.45)',
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.15 : 0.1,
        shadowRadius: 8,
      },
      android: {
        backgroundColor: isDark 
          ? 'rgba(255,255,255,0.13)' 
          : 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        borderColor: isDark 
          ? 'rgba(255,255,255,0.22)' 
          : 'rgba(255,255,255,0.35)',
        elevation: 2,
      },
      web: {
        backgroundColor: isDark 
          ? 'rgba(255,255,255,0.13)' 
          : 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        borderColor: isDark 
          ? 'rgba(255,255,255,0.22)' 
          : 'rgba(255,255,255,0.35)',
        boxShadow: isDark 
          ? '0 4px 8px rgba(0,0,0,0.15)' 
          : '0 4px 8px rgba(0,0,0,0.1)'
      }
    }),
  },
  button: {
    borderRadius: getBorderRadius(18),
    height: getInputHeight() + 8,
    marginBottom: getSpacing(18),
    marginTop: getSpacing(8),
    ...Platform.select({
      ios: {
        backgroundColor: '#008080',
        shadowColor: '#008080',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        backgroundColor: '#008080',
        elevation: 6,
      },
      web: {
        backgroundColor: '#008080',
        boxShadow: '0 8px 16px rgba(0,128,128,0.35)',
        transition: 'all 0.3s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 20px rgba(0,128,128,0.4)',
        }
      }
    }),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: getSpacing(20),
    borderWidth: 0,
  },
  buttonText: {
    fontSize: getFontSize(13),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  link: {
    color: isDark ? COLORS.accent.yellow : '#008080', // Material Design 3 - teal en mode clair, jaune en mode sombre
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  formContainerWeb: {},
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: 10,
    marginRight: 8,
  },
  buttonWeb: {
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
    }),
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    borderColor: '#10b981',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: isDark ? 'rgba(255,255,255,0.6)' : '#49454F', // Material Design 3 - texte adaptatif
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 15,
    textAlign: 'center',
  },
  phoneHint: {
    fontSize: getFontSize(11),
    
    color: isDark ? 'rgba(255,255,255,0.6)' : '#79747E', // Material Design 3 - texte hint
    marginTop: Platform.OS === 'android' ? -getSpacing(8) : -getSpacing(12),
    marginBottom: Platform.OS === 'android' ? getSpacing(4) : getSpacing(8),
    paddingLeft: getSpacing(8),
    fontStyle: 'italic',
  },
  passwordMatchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -getSpacing(8),
    marginBottom: getSpacing(12),
    paddingLeft: getSpacing(8),
  },
  passwordMatchText: {
    fontSize: getFontSize(11),
    fontWeight: '600',
    marginLeft: getSpacing(6),
    color: isDark ? 'rgba(255,255,255,0.8)' : '#49454F', // Material Design 3 - texte adaptatif
  },
  
  // Styles pour les éléments de voyage animés
  travelElementsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
  travelElement: {
    position: 'absolute',
    zIndex: 1,
  },
  travelIcon: {
    textAlign: 'center',
    opacity: 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  phoneFormatContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? getSpacing(8) : getSpacing(12),
  },
  phoneFormatExample: {
    fontSize: getFontSize(12),
    color: Platform.OS === 'android' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
    fontFamily: Platform.OS === 'web' ? 'Inter, sans-serif' : undefined,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
    paddingHorizontal: getSpacing(8),
    paddingVertical: getSpacing(4),
    borderRadius: getBorderRadius(6),
    borderWidth: 1,
    borderColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
  },
});

// Injection des styles CSS pour les boutons et animation globe sur web
if (Platform.OS === 'web') {
  if (typeof window !== 'undefined' && !document.querySelector('#auth-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
      @keyframes rotateGlobe {
        0% { 
          transform: rotate(0deg);
          background-position: 0% 50%;
        }
        25% { 
          background-position: 25% 50%;
        }
        50% { 
          background-position: 50% 50%;
        }
        75% { 
          background-position: 75% 50%;
        }
        100% { 
          transform: rotate(360deg);
          background-position: 100% 50%;
        }
      }
      
      .setting-btn {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        cursor: pointer !important;
      }
      
      .setting-btn:hover {
        transform: translateY(-2px) scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
        background-color: rgba(255, 255, 255, 0.25) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
      }
      
      .setting-btn:active {
        transform: translateY(0px) scale(0.98) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default EnhancedAuthScreen; 