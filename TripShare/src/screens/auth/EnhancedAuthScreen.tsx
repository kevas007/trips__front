import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/ui/Button';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../design-system';
import AppLogo from '../../components/ui/AppLogo';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getFontSize, getSpacing, getBorderRadius, getInputHeight, screenDimensions } from '../../utils/responsive';
import { countryService, CountryOption } from '../../services/countryService';
import CountryPickerModal from '../../components/ui/CountryPickerModal';
import { AppTheme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { ErrorHandler } from '../../components/ui/ErrorHandler';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import { SocialAuthResult, SocialAuthError } from '../../services/socialAuth';

const { width } = Dimensions.get('window');

const MODES = [
  { key: 'login', label: '👋 Connexion' },
  { key: 'register', label: '🚀 Inscription' },
  { key: 'forgot', label: '🔐 Récupération' },
];

const EnhancedAuthScreen = () => {
  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Store d'authentification
  const { 
    login, 
    register, 
    isLoading, 
    error, 
    clearError 
  } = useSimpleAuth();

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
    countryCode: '+33',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    rememberMe: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [formAnim] = React.useState(new Animated.Value(0));
  const [headerAnim] = React.useState(new Animated.Value(0));
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
  }, []);

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
      if (!form.username) newErrors.username = 'Champ requis';
      if (!form.firstName) newErrors.firstName = 'Champ requis';
      if (!form.lastName) newErrors.lastName = 'Champ requis';
      if (!form.phone) newErrors.phone = 'Champ requis';
      if (!form.email) newErrors.email = 'Champ requis';
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
          username: form.username,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          countryCode: form.countryCode,
          phone: form.phone,
          acceptTerms: form.acceptTerms,
        });
      } else if (mode === 'forgot') {
        // Fonctionnalité de mot de passe oublié à implémenter
        console.log('Mot de passe oublié pour:', form.email);
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
    i18n.changeLanguage(newLang);
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

  // Création des styles avec le thème actuel
  const styles = createStyles(isDark);

  return (
    <LinearGradient
      colors={
        isDark 
          ? ['#1a1b3a', '#2d1b69', '#8b5a9a'] 
          : ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b']
      }
      locations={
        isDark 
          ? [0, 0.5, 1] 
          : [0, 0.3, 0.7, 1]
      }
      start={[0, 0]}
      end={[1, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === 'web' && {
              minHeight: screenDimensions.height,
              paddingBottom: 40,
              paddingTop: 20,
            }
          ]} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={Platform.OS === 'web' ? { height: screenDimensions.height } : { flex: 1 }}
        >
      {/* Fond animé (simplifié) */}
      <View style={styles.background} pointerEvents="none">
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />
      </View>

      {/* Settings Panel */}
      <View style={styles.settingsPanel}>
        <TouchableOpacity 
          style={[
            styles.settingBtn,
            { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
              borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
            }
          ]}
          onPress={toggleTheme}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' && { className: 'setting-btn' })}
        >
          <Text style={{ fontSize: 20 }}>
            {isDark ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.settingBtn,
            { 
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderColor: 'rgba(255,255,255,0.2)',
            }
          ]}
          onPress={toggleLanguage}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' && { className: 'setting-btn' })}
        >
          <Text style={{ 
            fontSize: getFontSize(12), 
            fontWeight: '700', 
            color: '#fff',
            letterSpacing: 0.5 
          }}>
            {getCurrentLanguageCode()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appContainer}>
        {/* Header */}
        <Animated.View style={{
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <View style={styles.header}>
            <AppLogo size={100} animated />
            <Text style={styles.appName}>TripShare</Text>
            <Text style={styles.tagline}>Transformez vos rêves en souvenirs • Voyagez, Partagez, Connectez</Text>
          </View>
        </Animated.View>

        {/* Form Container */}
        <Animated.View style={[
          styles.formContainer,
          {
            opacity: formAnim,
            transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            ...(Platform.OS === 'web' ? {
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            } : {}),
          },
        ]}>
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            {MODES.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
                onPress={() => setMode(m.key as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeBtnText, mode === m.key && styles.modeBtnTextActive]}>{t(`auth.${m.key}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form Title */}
          <Text style={styles.formTitle}>
            {mode === 'register' && t('auth.registerTitle')}
            {mode === 'login' && t('auth.loginTitle')}
            {mode === 'forgot' && t('auth.forgotTitle')}
          </Text>

          {/* Champs du formulaire */}
          {isRegister && (
            <>
              <AuthInput
                icon="person-outline"
                placeholder={t('register.username')}
                value={form.username}
                onChangeText={(v: string) => handleChange('username', v)}
                error={errors.username}
                isValid={form.username.length > 0 && !errors.username}
                style={styles.inputWrapper}
                success={form.username.length > 0 && !errors.username}
              />
              <View style={[styles.inputRow, { flexDirection: screenDimensions.isSmallScreen ? 'column' : 'row' }]}>
                <AuthInput
                  icon="person-outline"
                  placeholder={t('register.firstName')}
                  value={form.firstName}
                  onChangeText={(v: string) => handleChange('firstName', v)}
                  error={errors.firstName}
                  isValid={form.firstName.length > 0 && !errors.firstName}
                  autoCapitalize="words"
                  style={[styles.inputWrapper, { flex: screenDimensions.isSmallScreen ? undefined : 1 }]}
                  success={form.firstName.length > 0 && !errors.firstName}
                />
                <AuthInput
                  icon="person-outline"
                  placeholder={t('register.lastName')}
                  value={form.lastName}
                  onChangeText={(v: string) => handleChange('lastName', v)}
                  error={errors.lastName}
                  isValid={form.lastName.length > 0 && !errors.lastName}
                  autoCapitalize="words"
                  style={[styles.inputWrapper, { flex: screenDimensions.isSmallScreen ? undefined : 1 }]}
                  success={form.lastName.length > 0 && !errors.lastName}
                />
              </View>
              <View style={[styles.phoneContainer, { flexDirection: screenDimensions.isSmallScreen ? 'column' : 'row' }]}>
                <View style={[
                  styles.countrySelectWrapper, 
                  { 
                    width: screenDimensions.isSmallScreen ? '100%' : (Platform.OS === 'web' ? 140 : 120),
                    marginRight: Platform.OS !== 'web' && !screenDimensions.isSmallScreen ? 8 : 12
                  }
                ]}>
                  {countriesLoading ? (
                    <View style={[{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: getInputHeight() - 8, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }]}>
                      <ActivityIndicator size="small" color="#667eea" />
                      <Text style={{ marginLeft: 8, color: COLORS.secondary[600], fontSize: getFontSize(12) }}>
                        {t('common.loading')}
                      </Text>
                    </View>
                  ) : (
                    <CountryPickerModal
                      selectedValue={form.countryCode}
                      onValueChange={(v: string) => handleChange('countryCode', v)}
                      countries={countries}
                      loading={countriesLoading}
                    />
                  )}
                </View>
                <AuthInput
                  icon="call-outline"
                  placeholder={t('register.phone')}
                  value={form.phone}
                  onChangeText={(v: string) => handleChange('phone', v)}
                  error={errors.phone}
                  isValid={form.phone.length > 0 && !errors.phone}
                  keyboardType="phone-pad"
                  style={[styles.inputWrapper, { flex: screenDimensions.isSmallScreen ? undefined : 1 }]}
                  success={form.phone.length > 0 && !errors.phone}
                />
              </View>
              
              {/* Message d'aide pour le téléphone */}
              {isRegister && (
                <Text style={styles.phoneHint}>
                  {t('register.phoneHint')}
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
              style={styles.inputWrapper}
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
              style={styles.inputWrapper}
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
                style={styles.inputWrapper}
                success={form.confirmPassword.length > 0 && !errors.confirmPassword && form.password === form.confirmPassword}
              />
              
              {/* Indicateur de correspondance des mots de passe */}
              {form.password.length > 0 && form.confirmPassword.length > 0 && (
                <View style={styles.passwordMatchIndicator}>
                  <Ionicons 
                    name={form.password === form.confirmPassword ? "checkmark-circle" : "close-circle"} 
                    size={getFontSize(16)} 
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
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                {t('auth.acceptTerms')}
                <Text style={styles.termsLink}>{t('auth.termsLink')}</Text> <Text style={{ color: COLORS.error }}>*</Text>
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
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>{t('auth.rememberMe')}</Text>
            </View>
          )}

          {/* Affichage des erreurs */}
          {error && (
            <ErrorHandler
              error={error}
              onRetry={handleSubmitWithSuccess}
              onClear={clearError}
              compact
            />
          )}

          {/* Bouton de soumission */}
          <TouchableOpacity
            onPress={handleSubmitWithSuccess}
            disabled={isLoading}
            style={[
              {
                borderRadius: getBorderRadius(18),
                height: getInputHeight() + 8,
                marginBottom: getSpacing(18),
                marginTop: getSpacing(8),
                shadowColor: '#764ba2',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 6,
                overflow: 'hidden',
              },
              isLoading && { opacity: 0.6 },
              success && { backgroundColor: '#10b981' },
            ]}
            activeOpacity={0.92}
          >
            <View style={{
              backgroundColor: success ? '#10b981' : '#667eea',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              paddingHorizontal: getSpacing(20),
            }}>
              {isLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={styles.loadingSpinner} />
                  <Text style={styles.buttonText}>{t('common.loading')}</Text>
                </View>
              ) : success ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark-circle" size={getFontSize(24)} color="#fff" style={{ marginRight: getSpacing(8) }} />
                  <Text style={styles.buttonText}>{t('common.success')}</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {mode === 'register' && <Ionicons name="rocket-outline" size={getFontSize(22)} color="#fff" style={{ marginRight: getSpacing(8) }} />}
                  {mode === 'login' && <Ionicons name="airplane-outline" size={getFontSize(22)} color="#fff" style={{ marginRight: getSpacing(8) }} />}
                  {mode === 'forgot' && <Ionicons name="mail-outline" size={getFontSize(22)} color="#fff" style={{ marginRight: getSpacing(8) }} />}
                  <Text style={styles.buttonText}>
                    {mode === 'register' && t('auth.registerCta')}
                    {mode === 'login' && t('auth.loginCta')}
                    {mode === 'forgot' && t('auth.forgotCta')}
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
                <Text style={styles.link}>{t('auth.alreadyMember')}</Text>
              </TouchableOpacity>
            )}
            {mode === 'login' && (
              <>
                <TouchableOpacity onPress={() => setMode('forgot')}>
                  <Text style={styles.link}>{t('auth.forgotLink')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('register')}>
                  <Text style={styles.link}>{t('auth.createAccount')}</Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'forgot' && (
              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.link}>{t('auth.backToLogin')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
    minHeight: Platform.OS === 'web' ? screenDimensions.height - 40 : 700,
    paddingVertical: Platform.OS === 'web' ? getSpacing(20) : getSpacing(24),
    paddingHorizontal: Platform.OS === 'web' ? getSpacing(20) : 0,
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: isDark
      ? 'linear-gradient(135deg, #4c63d2 0%, #6853a0 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  appName: {
    fontSize: getFontSize(36),
    fontWeight: '800',
    color: '#fff',
    marginBottom: getSpacing(8),
    textShadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: getFontSize(16),
    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.95)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.13,
    shadowRadius: 40,
    marginBottom: getSpacing(18),
    marginTop: Platform.OS === 'web' ? getSpacing(20) : 0,
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
    color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: getFontSize(12),
    letterSpacing: 0.1,
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  formTitle: {
    fontSize: getFontSize(26),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: getSpacing(24),
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: getSpacing(8),
  },
  inputRow: {
    flexDirection: 'row',
    gap: getSpacing(12),
    marginBottom: getSpacing(16),
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: getSpacing(12),
    marginBottom: getSpacing(16),
  },
  countrySelectWrapper: {
    width: Platform.OS === 'web' ? 140 : 120,
    marginBottom: 0,
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
    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
                backgroundColor: "#667eea",
            borderColor: "#667eea",
  },
  checkboxLabel: {
    color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.98)',
    fontSize: getFontSize(15),
    fontWeight: '500',
    marginLeft: getSpacing(8),
    flex: 1,
    flexWrap: 'wrap',
  },
  termsLink: {
    color: COLORS.accent.yellow,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  formNavigation: {
    marginTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: getBorderRadius(18),
    height: getInputHeight() + 8,
    marginBottom: getSpacing(18),
    marginTop: getSpacing(8),
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: getSpacing(20),
    borderWidth: 0,
  },
  buttonText: {
    fontSize: getFontSize(16),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  link: {
    color: COLORS.accent.yellow,
    fontWeight: '700',
    fontSize: 15,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
    textDecorationLine: 'underline',
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
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
    textAlign: 'center',
  },
  phoneHint: {
    fontSize: getFontSize(12),
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.7)',
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
    fontSize: getFontSize(12),
    fontWeight: '600',
    marginLeft: getSpacing(6),
  },
});

// Injection des styles CSS pour les boutons sur web
if (Platform.OS === 'web') {
  if (typeof window !== 'undefined' && !document.querySelector('#settings-btn-styles')) {
    const style = document.createElement('style');
    style.id = 'settings-btn-styles';
    style.textContent = `
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