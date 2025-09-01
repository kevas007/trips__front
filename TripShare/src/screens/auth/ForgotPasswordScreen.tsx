/**
 * ForgotPasswordScreen - Écran de récupération de mot de passe oublié
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppLogo from '../../components/ui/AppLogo';

type Language = 'fr' | 'en' | 'es' | 'de';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_emailSent, setEmailSent] = useState(false);
  const [logoAnimation] = useState(new Animated.Value(0));
  const [language, setLanguage] = useState<Language>('fr');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // Textes multilingues
  const texts = {
    fr: {
      title: 'TripShare',
      subtitle: 'Partagez vos voyages',

      email: 'Email',
      description: 'Entrez votre adresse email pour recevoir un lien de réinitialisation',
      sendButton: 'Envoyer le lien',
      loading: 'Envoi en cours...',

      emailSent: 'Email envoyé !',
      emailSentMessage: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      close: 'Fermer',
    },
    en: {
      title: 'TripShare',
      subtitle: 'Share your travels',

      email: 'Email',
      description: 'Enter your email address to receive a reset link',
      sendButton: 'Send Reset Link',
      loading: 'Sending...',

      emailSent: 'Email sent!',
      emailSentMessage: 'A reset link has been sent to your email address.',
      close: 'Close',
    },
    es: {
      title: 'TripShare',
      subtitle: 'Comparte tus viajes',

      email: 'Email',
      description: 'Ingresa tu dirección de email para recibir un enlace de restablecimiento',
      sendButton: 'Enviar Enlace',
      loading: 'Enviando...',

      emailSent: '¡Email enviado!',
      emailSentMessage: 'Se ha enviado un enlace de restablecimiento a tu dirección de email.',
      close: 'Cerrar',
    },
    de: {
      title: 'TripShare',
      subtitle: 'Teile deine Reisen',

      email: 'E-Mail',
      description: 'Gib deine E-Mail-Adresse ein, um einen Reset-Link zu erhalten',
      sendButton: 'Reset-Link Senden',
      loading: 'Senden...',

      emailSent: 'E-Mail gesendet!',
      emailSentMessage: 'Ein Reset-Link wurde an deine E-Mail-Adresse gesendet.',
      close: 'Schließen',
    },
  };

  const currentTexts = texts[language];

  // Gestion des erreurs multilingues
  const parseErrorDetails = (details: any): string => {
    if (typeof details === 'string') {
      const errorMessages = {
        fr: {
          emailInvalid: "L'adresse email n'est pas valide",
          emailRequired: "L'adresse email est requise"
        },
        en: {
          emailInvalid: "Email address is not valid",
          emailRequired: "Email address is required"
        },
        es: {
          emailInvalid: "La dirección de email no es válida",
          emailRequired: "La dirección de email es requerida"
        },
        de: {
          emailInvalid: "Die E-Mail-Adresse ist nicht gültig",
          emailRequired: "E-Mail-Adresse ist erforderlich"
        }
      };

      const messages = errorMessages[language];
      
      if (details.includes("Email")) {
        return messages.emailInvalid;
      }
      
      return details;
    }

    return 'Erreur inconnue';
  };

  // Gestion de l'envoi du lien de réinitialisation
  const handleSendResetLink = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: currentTexts.emailRequired || 'Email is required' });
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors({ email: currentTexts.emailInvalid || 'Invalid email' });
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      // TODO: Appeler l'API backend pour envoyer le lien de réinitialisation
      // await authService.sendPasswordResetEmail(email);
      
      // Simulation d'un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      Alert.alert(
        currentTexts.emailSent,
        currentTexts.emailSentMessage,
        [{ text: currentTexts.close, style: 'default' }]
      );
    } catch (err: any) {
      let errorMessage = 'Erreur lors de l\'envoi';
      let errorDetails = '';

      if (err?.response?.data) {
        errorMessage = err.response.data.error || errorMessage;
        errorDetails = parseErrorDetails(err.response.data.details || err.response.data.errors);
      }

      const fullErrorMessage = errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage;
      Alert.alert('Erreur', fullErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements d'input
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  // Animation du logo
  useEffect(() => {
    Animated.timing(logoAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
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
            

                         {/* Formulaire de récupération */}
             <View>
               <View style={styles.header}>
                 <Animated.View style={[
                   styles.logoContainer,
                   { opacity: logoAnimation, transform: [{ scale: logoAnimation }] }
                 ]}>
                   <AppLogo size="large" />
                 </Animated.View>
                 <Text style={styles.subtitle}>{currentTexts.subtitle}</Text>
               </View>
               <Text style={styles.formTitle}>Mot de passe oublié</Text>
               <Text style={styles.description}>{currentTexts.description}</Text>
              
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                placeholder={currentTexts.email}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

                             <TouchableOpacity
                 style={[styles.button, isLoading && styles.buttonDisabled]}
                 onPress={handleSendResetLink}
                 disabled={isLoading}
               >
                 <Text style={styles.buttonText}>
                   {isLoading ? currentTexts.loading : currentTexts.sendButton}
                 </Text>
               </TouchableOpacity>

               <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
                 <Text style={styles.linkText}>← Retour</Text>
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
    flex: 1,
    backgroundColor: '#008080',
    paddingTop: 20, // Padding supplémentaire pour éviter la barre de statut
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#008080',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#008080',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default ForgotPasswordScreen;
