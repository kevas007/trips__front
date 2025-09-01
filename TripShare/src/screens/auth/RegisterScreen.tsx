/**
 * RegisterScreen - Écran d'inscription multilingue
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store';
import { RegisterData } from '../../types/unified';
import { useNavigation } from '@react-navigation/native';
import { AvailabilityIndicator } from '../../components/ui';
import { buildUsernameCheckUrl, buildEmailCheckUrl } from '../../config/api.config';
import AppLogo from '../../components/ui/AppLogo';

type Language = 'fr' | 'en' | 'es' | 'de';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const navigation = useNavigation<any>();
  const { register, isLoading: authLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [logoAnimation] = useState(new Animated.Value(0));
  const [language, setLanguage] = useState<Language>('fr');
  
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [lastError, setLastError] = useState<string>('');
  const [usernameAvailability, setUsernameAvailability] = useState<{isChecking: boolean, isAvailable: boolean | null}>({isChecking: false, isAvailable: null});
  const [emailAvailability, setEmailAvailability] = useState<{isChecking: boolean, isAvailable: boolean | null}>({isChecking: false, isAvailable: null});
  
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
  });

  // Textes multilingues
  const texts = {
    fr: {
      register: 'Inscription',
      subtitle: 'Partagez vos voyages',
      email: 'Email',
      password: 'Mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      username: 'Nom d\'utilisateur',
      confirmPassword: 'Confirmation du mot de passe',
      registerButton: 'S\'inscrire',
      loadingRegister: 'Inscription...',
      hasAccount: 'Déjà un compte ? Se connecter',
      termsText: 'J\'accepte les termes d\'utilisation',
      termsButton: 'Conditions',
      privacyButton: 'RGPD',
      close: 'Fermer',
      // Messages d'erreur
      usernameRequired: 'Le nom d\'utilisateur est obligatoire',
      usernameMin: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
      firstNameRequired: 'Le prénom est obligatoire',
      lastNameRequired: 'Le nom est obligatoire',
      emailRequired: 'L\'email est obligatoire',
      emailInvalid: 'L\'adresse email n\'est pas valide',
      passwordRequired: 'Le mot de passe est obligatoire',
      passwordMin: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordUppercase: 'Le mot de passe doit contenir au moins une lettre majuscule',
      passwordLowercase: 'Le mot de passe doit contenir au moins une lettre minuscule',
      passwordNumber: 'Le mot de passe doit contenir au moins un chiffre',
      passwordSpecial: 'Le mot de passe doit contenir au moins un caractère spécial',
      usernameAlreadyExists: 'Ce nom d\'utilisateur est déjà pris',
      emailAlreadyExists: 'Cette adresse email est déjà utilisée',
    },
    en: {
      register: 'Register',
      subtitle: 'Share your travels',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      username: 'Username',
      confirmPassword: 'Confirm Password',
      registerButton: 'Sign Up',
      loadingRegister: 'Signing up...',
      hasAccount: 'Already have an account? Sign in',
      termsText: 'I accept the terms of use',
      termsButton: 'Terms',
      privacyButton: 'GDPR',
      close: 'Close',
      // Messages d'erreur
      usernameRequired: 'Username is required',
      usernameMin: 'Username must contain at least 3 characters',
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Email address is not valid',
      passwordRequired: 'Password is required',
      passwordMin: 'Password must contain at least 8 characters',
      passwordUppercase: 'Password must contain at least one uppercase letter',
      passwordLowercase: 'Password must contain at least one lowercase letter',
      passwordNumber: 'Password must contain at least one number',
      passwordSpecial: 'Password must contain at least one special character',
      usernameAlreadyExists: 'This username is already taken',
      emailAlreadyExists: 'This email address is already in use',
    },
    es: {
      register: 'Registrarse',
      subtitle: 'Comparte tus viajes',
      email: 'Email',
      password: 'Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      username: 'Nombre de Usuario',
      confirmPassword: 'Confirmar Contraseña',
      registerButton: 'Registrarse',
      loadingRegister: 'Registrándose...',
      hasAccount: '¿Ya tienes cuenta? Inicia sesión',
      termsText: 'Acepto los términos de uso',
      termsButton: 'Términos',
      privacyButton: 'RGPD',
      close: 'Cerrar',
      // Messages d'erreur
      usernameRequired: 'El nombre de usuario es obligatorio',
      usernameMin: 'El nombre de usuario debe contener al menos 3 caracteres',
      firstNameRequired: 'El nombre es obligatorio',
      lastNameRequired: 'El apellido es obligatorio',
      emailRequired: 'El email es obligatorio',
      emailInvalid: 'La dirección de email no es válida',
      passwordRequired: 'La contraseña es obligatoria',
      passwordMin: 'La contraseña debe contener al menos 8 caracteres',
      passwordUppercase: 'La contraseña debe contener al menos una letra mayúscula',
      passwordLowercase: 'La contraseña debe contener al menos una letra minúscula',
      passwordNumber: 'La contraseña debe contener al menos un número',
      passwordSpecial: 'La contraseña debe contener al menos un carácter especial',
      usernameAlreadyExists: 'Este nombre de usuario ya está tomado',
      emailAlreadyExists: 'Esta dirección de email ya está en uso',
    },
    de: {
      register: 'Registrieren',
      subtitle: 'Teile deine Reisen',
      email: 'E-Mail',
      password: 'Passwort',
      firstName: 'Vorname',
      lastName: 'Nachname',
      username: 'Benutzername',
      confirmPassword: 'Passwort bestätigen',
      registerButton: 'Registrieren',
      loadingRegister: 'Registrierung...',
      hasAccount: 'Bereits ein Konto? Anmelden',
      termsText: 'Ich akzeptiere die Nutzungsbedingungen',
      termsButton: 'Bedingungen',
      privacyButton: 'DSGVO',
      close: 'Schließen',
      // Messages d'erreur
      usernameRequired: 'Benutzername ist erforderlich',
      usernameMin: 'Der Benutzername muss mindestens 3 Zeichen enthalten',
      firstNameRequired: 'Vorname ist erforderlich',
      lastNameRequired: 'Nachname ist erforderlich',
      emailRequired: 'E-Mail ist erforderlich',
      emailInvalid: 'Die E-Mail-Adresse ist nicht gültig',
      passwordRequired: 'Passwort ist erforderlich',
      passwordMin: 'Das Passwort muss mindestens 8 Zeichen enthalten',
      passwordUppercase: 'Das Passwort muss mindestens einen Großbuchstaben enthalten',
      passwordLowercase: 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten',
      passwordNumber: 'Das Passwort muss mindestens eine Zahl enthalten',
      passwordSpecial: 'Das Passwort muss mindestens ein Sonderzeichen enthalten',
      usernameAlreadyExists: 'Dieser Benutzername ist bereits vergeben',
      emailAlreadyExists: 'Diese E-Mail-Adresse wird bereits verwendet',
    },
  };

  const currentTexts = texts[language];

  // Gestion des erreurs multilingues
  const parseErrorDetails = (details: any): string => {
    if (typeof details === 'string') {
      const errorMessages = {
        fr: {
          usernameMin: "Le nom d'utilisateur doit contenir au moins 3 caractères",
          passwordMin: "Le mot de passe doit contenir au moins 8 caractères",
          passwordUppercase: "Le mot de passe doit contenir au moins une lettre majuscule",
          passwordLowercase: "Le mot de passe doit contenir au moins une lettre minuscule",
          passwordNumber: "Le mot de passe doit contenir au moins un chiffre",
          passwordSpecial: "Le mot de passe doit contenir au moins un caractère spécial",
          emailInvalid: "L'adresse email n'est pas valide",
          usernameRequired: "Le nom d'utilisateur est obligatoire",
          passwordRequired: "Le mot de passe est obligatoire",
          emailRequired: "L'email est obligatoire",
          firstNameRequired: "Le prénom est obligatoire",
          lastNameRequired: "Le nom est obligatoire",
          emailAlreadyExists: "Cette adresse email est déjà utilisée",
          usernameAlreadyExists: "Ce nom d'utilisateur est déjà pris"
        },
        en: {
          usernameMin: "Username must contain at least 3 characters",
          passwordMin: "Password must contain at least 8 characters",
          passwordUppercase: "Password must contain at least one uppercase letter",
          passwordLowercase: "Password must contain at least one lowercase letter",
          passwordNumber: "Password must contain at least one number",
          passwordSpecial: "Password must contain at least one special character",
          emailInvalid: "Email address is not valid",
          usernameRequired: "Username is required",
          passwordRequired: "Password is required",
          emailRequired: "Email is required",
          firstNameRequired: "First name is required",
          lastNameRequired: "Last name is required",
          emailAlreadyExists: "This email address is already in use",
          usernameAlreadyExists: "This username is already taken"
        },
        es: {
          usernameMin: "El nombre de usuario debe contener al menos 3 caracteres",
          passwordMin: "La contraseña debe contener al menos 8 caracteres",
          passwordUppercase: "La contraseña debe contener al menos una letra mayúscula",
          passwordLowercase: "La contraseña debe contener al menos una letra minúscula",
          passwordNumber: "La contraseña debe contener al menos un número",
          passwordSpecial: "La contraseña debe contener al menos un carácter especial",
          emailInvalid: "La dirección de email no es válida",
          usernameRequired: "El nombre de usuario es obligatorio",
          passwordRequired: "La contraseña es obligatoria",
          emailRequired: "El email es obligatorio",
          firstNameRequired: "El nombre es obligatorio",
          lastNameRequired: "El apellido es obligatorio",
          emailAlreadyExists: "Esta dirección de email ya está en uso",
          usernameAlreadyExists: "Este nombre de usuario ya está tomado"
        },
        de: {
          usernameMin: "Der Benutzername muss mindestens 3 Zeichen enthalten",
          passwordMin: "Das Passwort muss mindestens 8 Zeichen enthalten",
          passwordUppercase: "Das Passwort muss mindestens einen Großbuchstaben enthalten",
          passwordLowercase: "Das Passwort muss mindestens einen Kleinbuchstaben enthalten",
          passwordNumber: "Das Passwort muss mindestens eine Zahl enthalten",
          passwordSpecial: "Das Passwort muss mindestens ein Sonderzeichen enthalten",
          emailInvalid: "Die E-Mail-Adresse ist nicht gültig",
          usernameRequired: "Benutzername ist erforderlich",
          passwordRequired: "Passwort ist erforderlich",
          emailRequired: "E-Mail ist erforderlich",
          firstNameRequired: "Vorname ist erforderlich",
          lastNameRequired: "Nachname ist erforderlich",
          emailAlreadyExists: "Diese E-Mail-Adresse wird bereits verwendet",
          usernameAlreadyExists: "Dieser Benutzername ist bereits vergeben"
        }
      };

      const messages = errorMessages[language];
      
      // Analyse des messages d'erreur pour des réponses plus claires
      if (details.includes("Username") && details.includes("min")) {
        return messages.usernameMin;
      }
      if (details.includes("Password") && details.includes("min")) {
        return messages.passwordMin;
      }
      if (details.includes("Password") && details.includes("uppercase")) {
        return messages.passwordUppercase;
      }
      if (details.includes("Password") && details.includes("lowercase")) {
        return messages.passwordLowercase;
      }
      if (details.includes("Password") && details.includes("number")) {
        return messages.passwordNumber;
      }
      if (details.includes("Password") && details.includes("special")) {
        return messages.passwordSpecial;
      }
      if (details.includes("Email") && details.includes("invalid")) {
        return messages.emailInvalid;
      }
      if (details.includes("Username") && details.includes("required")) {
        return messages.usernameRequired;
      }
      if (details.includes("Password") && details.includes("required")) {
        return messages.passwordRequired;
      }
      if (details.includes("Email") && details.includes("required")) {
        return messages.emailRequired;
      }
      if (details.includes("FirstName") && details.includes("required")) {
        return messages.firstNameRequired;
      }
      if (details.includes("LastName") && details.includes("required")) {
        return messages.lastNameRequired;
      }
      if (details.includes("already exists") || details.includes("déjà")) {
        if (details.includes("email") || details.includes("Email")) {
          return messages.emailAlreadyExists;
        }
        if (details.includes("username") || details.includes("Username")) {
          return messages.usernameAlreadyExists;
        }
      }
      
      return details;
    }

    if (Array.isArray(details)) {
      return details.map((err: any) => err.Message).join('\n');
    }

    return 'Erreur inconnue';
  };

  // Gestion de l'inscription
  const handleRegister = async () => {
    // Validation locale avant envoi
    const localErrors: {[key: string]: string} = {};
    
    if (!registerData.username.trim()) {
      localErrors.username = currentTexts.usernameRequired || 'Le nom d\'utilisateur est obligatoire';
    } else if (registerData.username.trim().length < 3) {
      localErrors.username = currentTexts.usernameMin || 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    
    if (!registerData.firstName.trim()) {
      localErrors.firstName = currentTexts.firstNameRequired || 'Le prénom est obligatoire';
    }
    
    if (!registerData.lastName.trim()) {
      localErrors.lastName = currentTexts.lastNameRequired || 'Le nom est obligatoire';
    }
    
    if (!registerData.email.trim()) {
      localErrors.email = currentTexts.emailRequired || 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      localErrors.email = currentTexts.emailInvalid || 'L\'adresse email n\'est pas valide';
    }
    
    if (!registerData.password) {
      localErrors.password = currentTexts.passwordRequired || 'Le mot de passe est obligatoire';
    } else if (registerData.password.length < 8) {
      localErrors.password = currentTexts.passwordMin || 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/[A-Z]/.test(registerData.password)) {
      localErrors.password = currentTexts.passwordUppercase || 'Le mot de passe doit contenir au moins une lettre majuscule';
    } else if (!/[a-z]/.test(registerData.password)) {
      localErrors.password = currentTexts.passwordLowercase || 'Le mot de passe doit contenir au moins une lettre minuscule';
    } else if (!/\d/.test(registerData.password)) {
      localErrors.password = currentTexts.passwordNumber || 'Le mot de passe doit contenir au moins un chiffre';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      localErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!acceptedTerms) {
      setLastError('Veuillez accepter les termes d\'utilisation');
      return;
    }
    
    // Vérifier la disponibilité des champs avant l'envoi
    if (usernameAvailability.isAvailable === false) {
      localErrors.username = currentTexts.usernameAlreadyExists || 'Ce nom d\'utilisateur est déjà pris';
    }
    
    if (emailAvailability.isAvailable === false) {
      localErrors.email = currentTexts.emailAlreadyExists || 'Cette adresse email est déjà utilisée';
    }
    
    // S'il y a des erreurs locales, les afficher et arrêter
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setLastError('Veuillez corriger les erreurs ci-dessous');
      return;
    }

    try {
      await register(registerData);
    } catch (err: any) {
      console.log('❌ Erreur lors de l\'inscription:', err);
      
      let errorMessage = 'Erreur d\'inscription';
      let errorDetails = '';

      // Traitement des erreurs du serveur
      if (err?.response?.data) {
        console.log('📡 Données d\'erreur du serveur:', err.response.data);
        
        errorMessage = err.response.data.error || errorMessage;
        errorDetails = parseErrorDetails(err.response.data.details || err.response.data.errors);
        
        // Traitement des erreurs de validation du serveur
        const newFieldErrors: {[key: string]: string} = {};
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach((error: any) => {
            if (error.Field && error.Message) {
              const field = error.Field.toLowerCase();
              newFieldErrors[field] = error.Message;
            }
          });
        }
        
        // Traitement des erreurs de validation simples
        if (err.response.data.details) {
          const details = err.response.data.details;
          if (typeof details === 'string') {
            // Erreur simple comme "password must contain at least one uppercase letter"
            if (details.includes('password') && details.includes('uppercase')) {
              newFieldErrors.password = currentTexts.passwordUppercase || 'Le mot de passe doit contenir au moins une lettre majuscule';
            } else if (details.includes('password') && details.includes('lowercase')) {
              newFieldErrors.password = currentTexts.passwordLowercase || 'Le mot de passe doit contenir au moins une lettre minuscule';
            } else if (details.includes('password') && details.includes('number')) {
              newFieldErrors.password = currentTexts.passwordNumber || 'Le mot de passe doit contenir au moins un chiffre';
            } else if (details.includes('password') && details.includes('min')) {
              newFieldErrors.password = currentTexts.passwordMin || 'Le mot de passe doit contenir au moins 8 caractères';
            } else if (details.includes('username') && details.includes('already exists')) {
              newFieldErrors.username = currentTexts.usernameAlreadyExists || 'Ce nom d\'utilisateur est déjà pris';
            } else if (details.includes('email') && details.includes('already exists')) {
              newFieldErrors.email = currentTexts.emailAlreadyExists || 'Cette adresse email est déjà utilisée';
            } else {
              // Erreur générique pour le mot de passe
              newFieldErrors.password = details;
            }
          }
        }
        
        // Fusion des erreurs locales et serveur
        setFieldErrors({ ...localErrors, ...newFieldErrors });
      } else if (err?.message) {
        // Erreur locale ou réseau
        errorDetails = err.message;
      }

      const fullErrorMessage = errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage;
      setLastError(fullErrorMessage);
      
      console.log('🚨 Erreur finale affichée:', fullErrorMessage);
      console.log('🚨 Erreurs de champs:', fieldErrors);
    }
  };

  // Gestion des changements d'input
  const handleRegisterInputChange = (field: keyof RegisterData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    
    // Effacer les erreurs du champ modifié
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Effacer l'erreur générale si elle existe
    if (error) clearError();
    if (lastError) setLastError('');
    
    // Validation en temps réel pour username et email
    if (field === 'username' && value.trim().length >= 3) {
      validateUsernameAvailability(value.trim());
    }
    
    if (field === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      validateEmailAvailability(value.trim());
    }
  };

  // Validation de la disponibilité du nom d'utilisateur
  const validateUsernameAvailability = async (username: string) => {
    try {
      setUsernameAvailability({ isChecking: true, isAvailable: null });
      
      // Appel à l'API backend pour vérifier la disponibilité
      const response = await fetch(buildUsernameCheckUrl(username));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const isAvailable = data.isAvailable;
      
      setUsernameAvailability({ isChecking: false, isAvailable });
      
      if (!isAvailable) {
        setFieldErrors(prev => ({
          ...prev,
          username: currentTexts.usernameAlreadyExists || 'Ce nom d\'utilisateur est déjà pris'
        }));
      } else {
        // Effacer l'erreur si le nom d'utilisateur est maintenant disponible
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.username;
          return newErrors;
        });
      }
    } catch (error) {
      console.log('Erreur lors de la validation du nom d\'utilisateur:', error);
      // Fallback vers la simulation en cas d'erreur
      const isAvailable = !['admin', 'user', 'test', 'demo', 'admin123', 'user123'].includes(username.toLowerCase());
      setUsernameAvailability({ isChecking: false, isAvailable });
      
      if (!isAvailable) {
        setFieldErrors(prev => ({
          ...prev,
          username: currentTexts.usernameAlreadyExists || 'Ce nom d\'utilisateur est déjà pris'
        }));
      }
    }
  };

  // Validation de la disponibilité de l'email
  const validateEmailAvailability = async (email: string) => {
    try {
      setEmailAvailability({ isChecking: true, isAvailable: null });
      
      // Appel à l'API backend pour vérifier la disponibilité
      const response = await fetch(buildEmailCheckUrl(email));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const isAvailable = data.isAvailable;
      
      setEmailAvailability({ isChecking: false, isAvailable });
      
      if (!isAvailable) {
        setFieldErrors(prev => ({
          ...prev,
          email: currentTexts.emailAlreadyExists || 'Cette adresse email est déjà utilisée'
        }));
      } else {
        // Effacer l'erreur si l'email est maintenant disponible
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      console.log('Erreur lors de la validation de l\'email:', error);
      // Fallback vers la simulation en cas d'erreur
      const isAvailable = !['admin@test.com', 'user@test.com', 'test@test.com', 'admin@tripshare.app', 'user@tripshare.app'].includes(email.toLowerCase());
      setEmailAvailability({ isChecking: false, isAvailable });
      
      if (!isAvailable) {
        setFieldErrors(prev => ({
          ...prev,
          email: currentTexts.emailAlreadyExists || 'Cette adresse email est déjà utilisée'
        }));
      }
    }
  };

  // Affichage des termes et conditions unifiés
  const showTermsAndConditions = () => {
    Alert.alert(
      'Conditions & RGPD', 
      'Conditions Générales d\'Utilisation (CGU) de TripShare\n\n' +
      '1. Objet\n' +
      'Les présentes CGU définissent les modalités d\'utilisation de l\'application TripShare.\n\n' +
      '2. Inscription et Compte Utilisateur\n' +
      'L\'inscription est gratuite et réservée aux personnes majeures. L\'utilisateur s\'engage à fournir des informations exactes.\n\n' +
      '3. Protection des Données Personnelles (RGPD)\n' +
      'TripShare collecte et traite vos données conformément au RGPD européen :\n' +
      '• Consentement explicite avant toute collecte\n' +
      '• Données collectées : identification, géolocalisation, photos, préférences\n' +
      '• Vos droits : accès, rectification, suppression, portabilité\n' +
      '• Conservation limitée et sécurisée\n\n' +
      '4. Modération de Contenu\n' +
      '• Modération automatique intelligente des images\n' +
      '• Contenu interdit : violence, pornographie, discrimination\n' +
      '• Respect de la vie privée et des droits d\'auteur\n\n' +
      '5. Responsabilité\n' +
      'L\'utilisateur reste responsable du contenu publié. TripShare agit en tant qu\'hébergeur.\n\n' +
      'En utilisant TripShare, vous acceptez l\'ensemble de ces conditions.\n\n' +
      'Pour les conditions complètes : contact@tripshare.app', 
      [
        { text: 'Voir les conditions complètes', onPress: () => {
          navigation.navigate('TermsScreen');
        }},
        { text: currentTexts.close, style: 'cancel' }
      ]
    );
  };

  // Animation du logo
  useEffect(() => {
    Animated.timing(logoAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

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

            {/* Affichage des erreurs générales */}
            {lastError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{lastError}</Text>
              </View>
            ) : null}

            {/* Formulaire d'inscription */}
            <View>
              <Text style={styles.title}>{currentTexts.register}</Text>
              
              <TextInput
                style={[styles.input, fieldErrors.username && styles.inputError]}
                placeholder={currentTexts.username}
                value={registerData.username}
                onChangeText={(value) => handleRegisterInputChange('username', value)}
                autoCapitalize="none"
              />
              {fieldErrors.username && <Text style={styles.errorText}>{fieldErrors.username}</Text>}
              <AvailabilityIndicator
                isChecking={usernameAvailability.isChecking}
                isAvailable={usernameAvailability.isAvailable}
                fieldName="Nom d'utilisateur"
              />

              <TextInput
                style={[styles.input, fieldErrors.firstName && styles.inputError]}
                placeholder={currentTexts.firstName}
                value={registerData.firstName}
                onChangeText={(value) => handleRegisterInputChange('firstName', value)}
                autoCapitalize="words"
              />
              {fieldErrors.firstName && <Text style={styles.errorText}>{fieldErrors.firstName}</Text>}

              <TextInput
                style={[styles.input, fieldErrors.lastName && styles.inputError]}
                placeholder={currentTexts.lastName}
                value={registerData.lastName}
                onChangeText={(value) => handleRegisterInputChange('lastName', value)}
                autoCapitalize="words"
              />
              {fieldErrors.lastName && <Text style={styles.errorText}>{fieldErrors.lastName}</Text>}

              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                placeholder={currentTexts.email}
                value={registerData.email}
                onChangeText={(value) => handleRegisterInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}
              
              <AvailabilityIndicator
                isChecking={emailAvailability.isChecking}
                isAvailable={emailAvailability.isAvailable}
                fieldName="Email"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, fieldErrors.password && styles.inputError]}
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
                  <Text style={styles.eyeButtonText}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
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
                  <Text style={styles.eyeButtonText}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword && <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>}

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.termsText}>{currentTexts.termsText}</Text>
              </View>

              {/* Bouton unifié pour les conditions et RGPD */}
              <TouchableOpacity style={styles.unifiedLegalButton} onPress={showTermsAndConditions}>
                <Text style={styles.unifiedLegalButtonText}>📋 Lire les Conditions & RGPD</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, authLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={authLoading}
              >
                <Text style={styles.buttonText}>
                  {authLoading ? currentTexts.loadingRegister : currentTexts.registerButton}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={onSwitchToLogin}>
                <Text style={styles.linkText}>{currentTexts.hasAccount}</Text>
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
      backgroundColor: '#008080', // Même fond teal que LoginScreen
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    keyboardAvoidingView: {
      flex: 1,
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
    content: {
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 30,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#008080',
      borderRadius: 3,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#008080',
    },
    checkmark: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    termsText: {
      flex: 1,
      fontSize: 12,
      color: '#666',
      lineHeight: 18,
    },
    unifiedLegalButton: {
      backgroundColor: '#008080',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    unifiedLegalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  export default RegisterScreen;
