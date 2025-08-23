import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useAuthStore } from '../../store';
import { LoginCredentials, RegisterData } from '../../types/unified';
import AppLogo from '../../components/ui/AppLogo';

type AuthMode = 'login' | 'register' | 'forgot';
type Language = 'fr' | 'en' | 'es' | 'de';

const SimpleAuthScreen: React.FC = () => {
  const { login, register, isLoading: authLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [logoAnimation] = useState(new Animated.Value(0));
  const [language, setLanguage] = useState<Language>('fr');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [currentTransportIndex, setCurrentTransportIndex] = useState(0);
  
  // Animations
  const transportAnimation = new Animated.Value(0);
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
  });

  // Moyens de transport pour l'animation
  const transports = ['✈️', '🚗', '🚂', '🚢', '🚁', '🚲', '🏍️', '🚅'];

  // Textes selon la langue
  const texts = {
    fr: {
      title: 'TripShare',
      subtitle: 'Partagez vos voyages',
      login: 'Connexion',
      register: 'Inscription',
      forgot: 'Mot de passe oublié',
      email: 'Email',
      password: 'Mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      username: 'Nom d\'utilisateur',
      loginButton: 'Se connecter',
      registerButton: 'S\'inscrire',
      forgotButton: 'Envoyer le lien',
      loading: 'Connexion...',
      loadingRegister: 'Inscription...',
      loadingForgot: 'Envoi...',
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: 'Pas encore de compte ? S\'inscrire',
      hasAccount: 'Déjà un compte ? Se connecter',
      backToLogin: 'Retour à la connexion',
      forgotText: 'Entrez votre adresse email pour recevoir un lien de récupération de mot de passe.',
      termsText: 'J\'accepte les termes d\'utilisation et la politique de confidentialité',
      termsTitle: 'Termes d\'utilisation',
      termsContent: 'En utilisant TripShare, vous acceptez de :\n\n• Partager uniquement du contenu approprié\n• Respecter la vie privée des autres utilisateurs\n• Ne pas utiliser l\'application à des fins commerciales\n• Respecter les lois locales lors de vos voyages\n\nTripShare se réserve le droit de suspendre votre compte en cas de non-respect de ces conditions.',
      errorFillFields: 'Veuillez remplir tous les champs',
      errorAcceptTerms: 'Veuillez accepter les termes d\'utilisation',
      successLogin: 'Connexion réussie !',
      successRegister: 'Inscription réussie !',
      recoverySent: 'Un email de récupération sera envoyé à votre adresse email.',
      close: 'Fermer',
      language: 'Langue',
      confirmPassword: 'Confirmation du mot de passe',
    },
    en: {
      title: 'TripShare',
      subtitle: 'Share your travels',
      login: 'Login',
      register: 'Register',
      forgot: 'Forgot Password',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      username: 'Username',
      loginButton: 'Login',
      registerButton: 'Register',
      forgotButton: 'Send Link',
      loading: 'Logging in...',
      loadingRegister: 'Registering...',
      loadingForgot: 'Sending...',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account? Register',
      hasAccount: 'Have an account? Login',
      backToLogin: 'Back to login',
      forgotText: 'Enter your email address to receive a password recovery link.',
      termsText: 'I accept the terms of use and privacy policy',
      termsTitle: 'Terms of Use',
      termsContent: 'By using TripShare, you agree to:\n\n• Share only appropriate content\n• Respect other users\' privacy\n• Not use the app for commercial purposes\n• Respect local laws during your travels\n\nTripShare reserves the right to suspend your account for non-compliance with these conditions.',
      errorFillFields: 'Please fill in all fields',
      errorAcceptTerms: 'Please accept the terms of use',
      successLogin: 'Login successful!',
      successRegister: 'Registration successful!',
      recoverySent: 'A recovery email will be sent to your email address.',
      close: 'Close',
      language: 'Language',
      confirmPassword: 'Confirm Password',
    },
    es: {
      title: 'TripShare',
      subtitle: 'Comparte tus viajes',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      forgot: 'Olvidé mi contraseña',
      email: 'Correo electrónico',
      password: 'Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      username: 'Nombre de usuario',
      loginButton: 'Iniciar sesión',
      registerButton: 'Registrarse',
      forgotButton: 'Enviar enlace',
      loading: 'Iniciando sesión...',
      loadingRegister: 'Registrando...',
      loadingForgot: 'Enviando...',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta? Regístrate',
      hasAccount: '¿Tienes cuenta? Inicia sesión',
      backToLogin: 'Volver al inicio de sesión',
      forgotText: 'Ingresa tu correo electrónico para recibir un enlace de recuperación de contraseña.',
      termsText: 'Acepto los términos de uso y la política de privacidad',
      termsTitle: 'Términos de Uso',
      termsContent: 'Al usar TripShare, aceptas:\n\n• Compartir solo contenido apropiado\n• Respetar la privacidad de otros usuarios\n• No usar la app con fines comerciales\n• Respetar las leyes locales durante tus viajes\n\nTripShare se reserva el derecho de suspender tu cuenta por incumplimiento de estas condiciones.',
      errorFillFields: 'Por favor completa todos los campos',
      errorAcceptTerms: 'Por favor acepta los términos de uso',
      successLogin: '¡Inicio de sesión exitoso!',
      successRegister: '¡Registro exitoso!',
      recoverySent: 'Se enviará un correo de recuperación a tu dirección de email.',
      close: 'Cerrar',
      language: 'Idioma',
      confirmPassword: 'Confirmar contraseña',
    },
    de: {
      title: 'TripShare',
      subtitle: 'Teile deine Reisen',
      login: 'Anmelden',
      register: 'Registrieren',
      forgot: 'Passwort vergessen',
      email: 'E-Mail',
      password: 'Passwort',
      firstName: 'Vorname',
      lastName: 'Nachname',
      username: 'Benutzername',
      loginButton: 'Anmelden',
      registerButton: 'Registrieren',
      forgotButton: 'Link senden',
      loading: 'Anmeldung läuft...',
      loadingRegister: 'Registrierung läuft...',
      loadingForgot: 'Senden...',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Kein Konto? Registrieren',
      hasAccount: 'Hast du ein Konto? Anmelden',
      backToLogin: 'Zurück zur Anmeldung',
      forgotText: 'Gib deine E-Mail-Adresse ein, um einen Passwort-Wiederherstellungslink zu erhalten.',
      termsText: 'Ich akzeptiere die Nutzungsbedingungen und Datenschutzrichtlinie',
      termsTitle: 'Nutzungsbedingungen',
      termsContent: 'Durch die Nutzung von TripShare stimmst du zu:\n\n• Nur angemessene Inhalte zu teilen\n• Die Privatsphäre anderer Benutzer zu respektieren\n• Die App nicht für kommerzielle Zwecke zu nutzen\n• Lokale Gesetze während deiner Reisen zu respektieren\n\nTripShare behält sich das Recht vor, dein Konto bei Nichteinhaltung dieser Bedingungen zu sperren.',
      errorFillFields: 'Bitte fülle alle Felder aus',
      errorAcceptTerms: 'Bitte akzeptiere die Nutzungsbedingungen',
      successLogin: 'Anmeldung erfolgreich!',
      successRegister: 'Registrierung erfolgreich!',
      recoverySent: 'Eine Wiederherstellungs-E-Mail wird an deine E-Mail-Adresse gesendet.',
      close: 'Schließen',
      language: 'Sprache',
      confirmPassword: 'Passwort bestätigen',
    },
  };

  const currentTexts = texts[language];

  // Animation du logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animation des moyens de transport
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(transportAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentTransportIndex((currentTransportIndex + 1) % transports.length);
        transportAnimation.setValue(0);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentTransportIndex]); // Added currentTransportIndex to dependency array

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Erreur', currentTexts.errorFillFields);
      return;
    }

    try {
      await login(credentials);
      Alert.alert('Succès', currentTexts.successLogin);
    } catch (err) {
      // Afficher l'erreur du store si elle existe
      if (error) {
        Alert.alert('Erreur de connexion', error);
      } else {
        Alert.alert('Erreur de connexion', 'Impossible de se connecter. Vérifiez vos identifiants.');
      }
    }
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password || !registerData.username || !registerData.firstName || !registerData.lastName) {
      Alert.alert('Erreur', currentTexts.errorFillFields);
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Erreur', currentTexts.errorAcceptTerms);
      return;
    }

    try {
      await register(registerData);
      Alert.alert('Succès', currentTexts.successRegister);
      setMode('login');
    } catch (err) {
      // Afficher l'erreur du store si elle existe
      if (error) {
        Alert.alert('Erreur d\'inscription', error);
      } else {
        Alert.alert('Erreur d\'inscription', 'Impossible de créer le compte. Vérifiez vos informations.');
      }
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Récupération', currentTexts.recoverySent);
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleRegisterInputChange = (field: keyof RegisterData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const renderLanguageSelector = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity 
        style={styles.languageButton}
        onPress={() => setShowLanguageSelector(!showLanguageSelector)}
      >
        <Text style={styles.languageButtonText}>
          {currentTexts.language}: {language.toUpperCase()}
        </Text>
      </TouchableOpacity>
      
      {showLanguageSelector && (
        <View style={styles.languageDropdown}>
          <TouchableOpacity 
            style={[styles.languageOption, language === 'fr' && styles.languageOptionSelected]}
            onPress={() => { setLanguage('fr'); setShowLanguageSelector(false); }}
          >
            <Text style={[styles.languageOptionText, language === 'fr' && styles.languageOptionTextSelected]}>
              🇫🇷 Français
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}
            onPress={() => { setLanguage('en'); setShowLanguageSelector(false); }}
          >
            <Text style={[styles.languageOptionText, language === 'en' && styles.languageOptionTextSelected]}>
              🇺🇸 English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.languageOption, language === 'es' && styles.languageOptionSelected]}
            onPress={() => { setLanguage('es'); setShowLanguageSelector(false); }}
          >
            <Text style={[styles.languageOptionText, language === 'es' && styles.languageOptionTextSelected]}>
              🇪🇸 Español
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.languageOption, language === 'de' && styles.languageOptionSelected]}
            onPress={() => { setLanguage('de'); setShowLanguageSelector(false); }}
          >
            <Text style={[styles.languageOptionText, language === 'de' && styles.languageOptionTextSelected]}>
              🇩🇪 Deutsch
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTransportAnimation = () => {
    const currentTransport = transports[currentTransportIndex];
    
    return (
      <View style={styles.transportContainer}>
        <Animated.Text 
          style={[
            styles.transportIcon,
            {
              transform: [
                {
                  scale: transportAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
                {
                  rotate: transportAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: transportAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1, 0.5],
              }),
            },
          ]}
        >
          {currentTransport}
        </Animated.Text>
      </View>
    );
  };

  const renderLoginForm = () => (
    <>
      <TextInput
        style={styles.inputSimple}
        placeholder={currentTexts.email}
        value={credentials.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={currentTexts.password}
          value={credentials.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeButtonText}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, authLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={authLoading}
      >
        <Text style={styles.buttonText}>
          {authLoading ? currentTexts.loading : currentTexts.loginButton}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('forgot')} style={styles.linkButton}>
        <Text style={styles.linkText}>
          {currentTexts.forgotPassword}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('register')} style={styles.linkButton}>
        <Text style={styles.linkText}>
          {currentTexts.noAccount}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <TextInput
        style={styles.inputSimple}
        placeholder={currentTexts.username}
        value={registerData.username}
        onChangeText={(value) => handleRegisterInputChange('username', value)}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.inputSimple}
        placeholder={currentTexts.firstName}
        value={registerData.firstName}
        onChangeText={(value) => handleRegisterInputChange('firstName', value)}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.inputSimple}
        placeholder={currentTexts.lastName}
        value={registerData.lastName}
        onChangeText={(value) => handleRegisterInputChange('lastName', value)}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.inputSimple}
        placeholder={currentTexts.email}
        value={registerData.email}
        onChangeText={(value) => handleRegisterInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={currentTexts.password}
          value={registerData.password}
          onChangeText={(value) => handleRegisterInputChange('password', value)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeButtonText}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={currentTexts.confirmPassword}
          value={registerData.confirmPassword}
          onChangeText={(value) => handleRegisterInputChange('confirmPassword', value)}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.eyeButtonText}>
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>

             {/* Case à cocher pour les termes d'utilisation */}
       <View style={styles.termsContainer}>
         <TouchableOpacity 
           style={styles.checkboxContainer}
           onPress={() => setAcceptedTerms(!acceptedTerms)}
         >
           <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
             {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
           </View>
           <Text style={styles.termsText}>
             {currentTexts.termsText}
           </Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.termsLink}
           onPress={() => {
             // Navigation vers les termes d'utilisation
             Alert.alert(
               currentTexts.termsTitle,
               currentTexts.termsContent,
               [{ text: currentTexts.close, style: 'default' }]
             );
           }}
         >
           <Text style={[styles.linkText, styles.termsLinkText]}>
             Lire les termes d'utilisation
           </Text>
         </TouchableOpacity>
       </View>

       <TouchableOpacity
         style={[styles.button, styles.registerButton]}
         onPress={handleRegister}
         disabled={authLoading}
       >
         <Text style={styles.buttonText}>
           {authLoading ? currentTexts.loadingRegister : currentTexts.registerButton}
         </Text>
       </TouchableOpacity>

       <TouchableOpacity onPress={() => setMode('login')} style={styles.linkButton}>
         <Text style={styles.linkText}>
           {currentTexts.hasAccount}
         </Text>
       </TouchableOpacity>
     </>
   );

  const renderForgotPasswordForm = () => {
    return (
      <>
        <Text style={styles.forgotText}>
          {currentTexts.forgotText}
        </Text>

        <TextInput
          style={styles.inputSimple}
          placeholder={currentTexts.email}
          value={forgotEmail}
          onChangeText={setForgotEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, authLoading && styles.buttonDisabled]}
          onPress={handleForgotPassword}
          disabled={authLoading}
        >
          <Text style={styles.buttonText}>
            {authLoading ? currentTexts.loadingForgot : currentTexts.forgotButton}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => setMode('login')}
        >
          <Text style={styles.linkText}>
            {currentTexts.backToLogin}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return currentTexts.login;
      case 'register': return currentTexts.register;
      case 'forgot': return currentTexts.forgot;
      default: return currentTexts.login;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Sélecteur de langue */}
            {renderLanguageSelector()}

            {/* Logo et titre */}
            <View style={styles.header}>
              <Animated.View 
                style={[
                  styles.logoContainer,
                  {
                    transform: [
                      {
                        scale: logoAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <AppLogo size="large" showText={true} />
              </Animated.View>
              <Text style={styles.subtitle}>{currentTexts.subtitle}</Text>
              
              {/* Animation des moyens de transport */}
              {renderTransportAnimation()}
            </View>
            
            {/* Titre du mode */}
            <Text style={styles.modeTitle}>{getTitle()}</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Formulaire selon le mode */}
            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && renderRegisterForm()}
            {mode === 'forgot' && renderForgotPasswordForm()}

            {/* Test du thème */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008080', // Couleur principale TripShare
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  languageButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  languageDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  languageOptionSelected: {
    backgroundColor: '#008080',
  },
  languageOptionText: {
    fontSize: 12,
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  transportContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  transportIcon: {
    fontSize: 30,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  forgotText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 20,
  },

  button: {
    backgroundColor: '#008080',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF0000',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
  },

  registerButton: {
    marginTop: 10,
    marginBottom: 15,
  },



  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    height: 50, // Hauteur fixe exacte
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 0, // Supprimer le padding interne
    height: '100%', // Prendre toute la hauteur du conteneur
  },
  inputSimple: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 50, // Hauteur fixe exacte identique aux conteneurs
  },
  eyeButton: {
    padding: 5,
    position: 'absolute',
    right: 10,
    zIndex: 1,
  },
  eyeButtonText: {
    fontSize: 20,
  },

  termsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#008080',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#008080',
    borderColor: '#008080',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    marginTop: 5,
  },
  termsLinkText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '500',
  },

});

export default SimpleAuthScreen;
