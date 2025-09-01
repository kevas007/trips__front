/**
 * LoginScreen - Écran de connexion multilingue
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store';
import { LoginCredentials } from '../../types/unified';
import AppLogo from '../../components/ui/AppLogo';

type Language = 'fr' | 'en' | 'es' | 'de';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const navigation = useNavigation<any>();
  const { login, isLoading: authLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [logoAnimation] = useState(new Animated.Value(0));
  const [language, setLanguage] = useState<Language>('fr');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // États pour le carrousel d'images de voyage
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageFadeAnimation] = useState(new Animated.Value(1));
  
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [lastError, setLastError] = useState<string>('');
  
  // Images de voyage pour le carrousel (depuis Unsplash) - Photos inspirantes
  const travelImages = [
    { 
      uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
      title: 'Plages paradisiaques',
      description: 'Sable blanc et eau turquoise'
    },
    { 
      uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
      title: 'Montagnes majestueuses',
      description: 'Vues panoramiques à couper le souffle'
    },
    { 
      uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop',
      title: 'Villes historiques',
      description: 'Découvrez l\'architecture du monde'
    },
    { 
      uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
      title: 'Forêts mystérieuses',
      description: 'Nature sauvage et préservée'
    },
    { 
      uri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=400&fit=crop',
      title: 'Déserts de sable doré',
      description: 'Aventure et dépaysement total'
    },
    { 
      uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
      title: 'Îles tropicales',
      description: 'Évasion et détente absolue'
    },
  ];

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  // Textes multilingues
  const texts = {
    fr: {
      title: 'TripShare',
      subtitle: 'Partagez vos voyages',
      login: 'Connexion',
      email: 'Email',
      password: 'Mot de passe',
      loginButton: 'Se connecter',
      loading: 'Connexion...',
      noAccount: 'Pas encore de compte ? S\'inscrire',
      forgotPassword: 'Mot de passe oublié ?',
    },
    en: {
      title: 'TripShare',
      subtitle: 'Share your travels',
      login: 'Login',
      email: 'Email',
      password: 'Password',
      loginButton: 'Sign In',
      loading: 'Signing in...',
      noAccount: 'No account yet? Sign up',
      forgotPassword: 'Forgot password?',
    },
    es: {
      title: 'TripShare',
      subtitle: 'Comparte tus viajes',
      login: 'Iniciar Sesión',
      email: 'Email',
      password: 'Contraseña',
      loginButton: 'Iniciar Sesión',
      loading: 'Iniciando sesión...',
      noAccount: '¿No tienes cuenta? Regístrate',
      forgotPassword: '¿Olvidaste tu contraseña?',
    },
    de: {
      title: 'TripShare',
      subtitle: 'Teile deine Reisen',
      login: 'Anmelden',
      email: 'E-Mail',
      password: 'Passwort',
      loginButton: 'Anmelden',
      loading: 'Anmeldung...',
      noAccount: 'Noch kein Konto? Registrieren',
      forgotPassword: 'Passwort vergessen?',
    },
  };

  const currentTexts = texts[language];

  // Gestion des erreurs multilingues
  const parseErrorDetails = (details: any): string => {
    if (typeof details === 'string') {
      const errorMessages = {
        fr: {
          passwordMin: "Le mot de passe doit contenir au moins 8 caractères",
          emailInvalid: "L'adresse email n'est pas valide"
        },
        en: {
          passwordMin: "Password must contain at least 8 characters",
          emailInvalid: "Email address is not valid"
        },
        es: {
          passwordMin: "La contraseña debe contener al menos 8 caracteres",
          emailInvalid: "La dirección de email no es válida"
        },
        de: {
          passwordMin: "Das Passwort muss mindestens 8 Zeichen enthalten",
          emailInvalid: "Die E-Mail-Adresse ist nicht gültig"
        }
      };

      const messages = errorMessages[language];
      
      if (details.includes("Password") && details.includes("min")) {
        return messages.passwordMin;
      }
      if (details.includes("Email")) {
        return messages.emailInvalid;
      }
      
      return details;
    }

    if (Array.isArray(details)) {
      return details.map((err: any) => err.Message).join('\n');
    }

    return 'Erreur inconnue';
  };

  // Gestion de la connexion
  const handleLogin = async () => {
    try {
      await login(credentials);
    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';
      let errorDetails = '';

      if (err?.response?.data) {
        errorMessage = err.response.data.error || errorMessage;
        errorDetails = parseErrorDetails(err.response.data.details || err.response.data.errors);
      }

      const fullErrorMessage = errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage;
      setLastError(fullErrorMessage);
      
      const newFieldErrors: {[key: string]: string} = {};
      if (errorDetails) {
        if (errorDetails.includes('email')) {
          newFieldErrors.email = errorDetails;
        }
        if (errorDetails.includes('mot de passe') || errorDetails.includes('Password')) {
          newFieldErrors.password = errorDetails;
        }
      }
      setFieldErrors(newFieldErrors);
    }
  };

  // Gestion du mot de passe oublié
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Gestion des changements d'input
  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) clearError();
  };

  // Animation du logo
  useEffect(() => {
    Animated.timing(logoAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Carrousel automatique des images de voyage
  useEffect(() => {
    const interval = setInterval(() => {
      // Animation de fade-out
      Animated.timing(imageFadeAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        // Changer d'image
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % travelImages.length
        );
        // Animation de fade-in
        Animated.timing(imageFadeAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }, 4000); // Changer d'image toutes les 4 secondes

    return () => clearInterval(interval);
  }, [imageFadeAnimation, travelImages.length]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Sélecteur de langue */}
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
          >
            <Text style={styles.languageButtonText}>
              {language.toUpperCase()} 🌐
            </Text>
          </TouchableOpacity>
          
          {showLanguageSelector && (
            <View style={styles.languageDropdown}>
              {Object.keys(texts).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    language === lang && styles.languageOptionSelected
                  ]}
                  onPress={() => {
                    setLanguage(lang as Language);
                    setShowLanguageSelector(false);
                  }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    language === lang && styles.languageOptionTextSelected
                  ]}>
                    {lang === 'fr' && '🇫🇷 Français'}
                    {lang === 'en' && '🇬🇧 English'}
                    {lang === 'es' && '🇪🇸 Español'}
                    {lang === 'de' && '🇩🇪 Deutsch'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
           
            {/* Header avec logo */}
            <View style={styles.header}>
              <Animated.View style={[
                styles.logoContainer,
                { opacity: logoAnimation, transform: [{ scale: logoAnimation }] }
              ]}>
                <AppLogo size="large" />
              </Animated.View>
              <Text style={styles.subtitle}>{currentTexts.subtitle}</Text>
              
            </View>

            {/* Carrousel d'images de voyage */}
            <Pressable 
              style={styles.carouselContainer}
              onPress={() => {
                const newIndex = (currentImageIndex + 1) % travelImages.length;
                setCurrentImageIndex(newIndex);
              }}
            >
              <Animated.Image
                source={{ uri: travelImages[currentImageIndex].uri }}
                style={[
                  styles.carouselImage,
                  { opacity: imageFadeAnimation }
                ]}
                resizeMode="cover"
              />
              <View style={styles.carouselOverlay} />
              
              {/* Titre et description de l'image */}
              <View style={styles.carouselContent}>
                <Text style={styles.carouselTitle}>
                  {travelImages[currentImageIndex].title}
                </Text>
                <Text style={styles.carouselDescription}>
                  {travelImages[currentImageIndex].description}
                </Text>
              </View>
              
              {/* Indicateur du carrousel - Design amélioré */}
              <View style={styles.carouselIndicator}>
                {travelImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.carouselDot,
                      index === currentImageIndex && styles.carouselDotActive
                    ]}
                  />
                ))}
              </View>
            </Pressable>

            {/* Affichage des erreurs */}
            {lastError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{lastError}</Text>
              </View>
            ) : null}

            {/* Formulaire de connexion */}
            <View>
             
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                placeholder={currentTexts.email}
                value={credentials.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, fieldErrors.password && styles.inputError]}
                  placeholder={currentTexts.password}
                  value={credentials.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}

              <TouchableOpacity
                style={[styles.button, authLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={authLoading}
              >
                <Text style={styles.buttonText}>
                  {authLoading ? currentTexts.loading : currentTexts.loginButton}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={handleForgotPassword}>
                <Text style={styles.linkText}>{currentTexts.forgotPassword}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={onSwitchToRegister}
              >
                <Text style={styles.linkText}>{currentTexts.noAccount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: '#008080',
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
    top: 22,
    right: 25,
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
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
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
    fontSize: 14,
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginBottom: 10,
  },
  linkText: {
    color: '#008080',
    textAlign: 'center',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: 200, // Adjust height as needed
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // Overlay plus léger pour voir les images
  },
  carouselContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
  },
  carouselTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carouselDescription: {
    color: '#fff',
    fontSize: 14,
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  carouselDotActive: {
    backgroundColor: '#fff',
    width: 12,
  },
});

export default LoginScreen;
