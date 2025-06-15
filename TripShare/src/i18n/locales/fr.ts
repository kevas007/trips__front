export default {
  auth: {
    login: 'Connexion',
    register: 'Inscription', 
    forgot: 'Récupération',
    email: 'Email',
    username: 'Nom d\'utilisateur',
    firstName: 'Prénom',
    lastName: 'Nom',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    passwordsMatch: 'Les mots de passe correspondent ✓',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    loginCta: '✈️ Se connecter',
    registerCta: '🚀 Commencer l\'aventure',
    forgotCta: '📧 Envoyer le lien',
    forgotLink: '🔑 Mot de passe oublié ?',
    welcome: 'Bienvenue sur TripShare',
    subtitle: 'Voyagez, Partagez, Connectez',
    loginTitle: '🌍 Bon retour !',
    registerTitle: '✨ Rejoignez l\'aventure',
    forgotTitle: '🔑 Récupération de compte',
    loginButton: '✈️ Explorer le monde',
    registerButton: '🚀 Commencer l\'aventure',
    forgotButton: '📧 Envoyer le lien',
    appTagline: 'Transformez vos rêves en souvenirs',

    // Placeholders
    emailPlaceholder: '📧 Adresse email',
    passwordPlaceholder: '🔒 Mot de passe',
    confirmPasswordPlaceholder: '🔑 Confirmer le mot de passe',
    usernamePlaceholder: '👤 Nom d\'utilisateur',
    firstNamePlaceholder: '👤 Prénom',
    lastNamePlaceholder: '👤 Nom',
    phoneNumberPlaceholder: '📱 Téléphone (optionnel)',
    namePlaceholder: '👤 Votre nom complet',

    // Options
    rememberMe: 'Se souvenir de moi',
    acceptTerms: 'J\'accepte les conditions d\'utilisation',
    termsLink: 'conditions d\'utilisation',
    receiveNotifications: 'Recevoir des inspirations voyage',
    enableNotifications: 'Activer les notifications',
    useBiometric: 'Utiliser l\'authentification biométrique',

    // Navigation
    createAccount: '✨ Créer un compte',
    alreadyMember: '🌍 Déjà membre ? Se connecter',
    backToLogin: '← Retour à la connexion',
    alreadyHaveAccount: 'Déjà un compte ? Se connecter',

    // Stats
    stats: {
      adventurers: 'Aventuriers',
      countries: 'Pays',
      rating: 'Note'
    },

    // Biometric
    biometric: {
      title: '🔐 Authentification biométrique',
      suggestion: 'Souhaitez-vous activer l\'authentification biométrique pour une connexion plus rapide ?',
      enable: 'Activer ✨',
      later: 'Plus tard',
      prompt: '✨ Connexion magique avec votre empreinte',
      expressLogin: 'Connexion Express',
      touchFaceId: 'Touch/Face ID'
    },

    // Errors
    errors: {
      emailRequired: 'L\'email est requis',
      invalidEmail: 'Veuillez saisir une adresse email valide',
      passwordRequired: 'Le mot de passe est requis',
      passwordTooShort: 'Minimum 6 caractères requis',
      usernameRequired: 'Le nom d\'utilisateur est requis',
      firstNameRequired: 'Le prénom est requis',
      lastNameRequired: 'Le nom est requis',
      nameRequired: 'Comment devons-nous vous appeler ?',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      invalidPhoneNumber: 'Format de téléphone invalide',
      termsRequired: 'Veuillez accepter nos conditions d\'utilisation',
      generalError: 'Une erreur est survenue',
      biometricFailed: 'Authentification biométrique échouée. Réessayez !',
      loginFailed: 'Échec de la connexion. Vérifiez vos identifiants.',
      registerFailed: 'Échec de l\'inscription. Veuillez réessayer.',
      resetFailed: 'Échec de la réinitialisation du mot de passe.',
      sessionExpired: 'Session expirée. Veuillez vous reconnecter.',
      invalidCredentials: 'Identifiants invalides',
      accountLocked: 'Compte temporairement verrouillé',
      emailInUse: 'Cette adresse email est déjà utilisée',
      weakPassword: 'Le mot de passe est trop faible',
      invalidCode: 'Code de vérification invalide',
      tooManyAttempts: 'Trop de tentatives. Réessayez plus tard'
    },

    // Success
    success: {
      emailSent: 'Email envoyé',
      emailSentDesc: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe',
      loginSuccess: 'Connexion réussie !',
      registerSuccess: 'Inscription réussie !',
      passwordReset: 'Mot de passe réinitialisé',
      accountCreated: 'Compte créé avec succès',
      verificationSent: 'Email de vérification envoyé',
      profileUpdated: 'Profil mis à jour',
      passwordChanged: 'Mot de passe modifié'
    },

    // Validation
    validation: {
      email: 'Format d\'email invalide',
      password: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordMatch: 'Les mots de passe doivent correspondre',
      phone: 'Format de numéro de téléphone invalide',
      required: 'Ce champ est requis',
      minLength: 'Minimum {{count}} caractères requis',
      maxLength: 'Maximum {{count}} caractères autorisés',
      username: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères',
      terms: 'Vous devez accepter les conditions d\'utilisation'
    },
  },
  
  register: {
    title: 'Créer un compte',
    subtitle: 'Rejoignez la communauté TripShare',
    steps: {
      personalInfo: 'Informations personnelles',
      security: 'Sécurité',
      preferences: 'Préférences',
      verification: 'Vérification',
    },
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    phoneHint: '💡 Ex: 6 12 34 56 78 (sans le 0 initial)',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    passwordRequirements: 'Exigences du mot de passe',
    passwordLengthRequirement: 'Au moins 8 caractères',
    passwordComplexityRequirement: 'Lettres majuscules, minuscules et chiffres',
  },

  home: {
    welcome: 'Bonjour ! 👋',
    subtitle: 'Découvrez de nouvelles aventures',
    searchPlaceholder: 'Où souhaitez-vous aller ?',
    featuredTrips: 'Voyages en vedette',
    recentTrips: 'Voyages récents',
    popularDestinations: 'Destinations populaires',
    noFeaturedTrips: 'Aucun voyage en vedette pour le moment',
    noRecentTrips: 'Aucun voyage récent',
    noDestinations: 'Aucune destination populaire',
  },
  
  common: {
    seeAll: 'Voir tout',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès !',
    retry: 'Réessayer',
    cancel: 'Annuler',
    ok: 'OK',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    continue: 'Continuer',
    back: 'Retour',
    next: 'Suivant',
    finish: 'Terminer',
    search: 'Recherche',
    searchDescription: 'Découvrez des milliers d\'itinéraires partagés par la communauté',
    profile: 'Profil',
    profileDescription: 'Gérez vos voyages, paramètres et statistiques',
    delete: 'Supprimer',
    edit: 'Modifier',
  },

  errors: {
    networkError: 'Problème de connexion. Vérifiez votre connexion internet.',
    unauthorized: 'Email ou mot de passe incorrect',
    badRequest: 'Données invalides',
    forbidden: 'Accès refusé',
    conflict: 'Cette adresse email est déjà utilisée',
    validationError: 'Données invalides',
    rateLimited: 'Trop de tentatives. Veuillez réessayer plus tard.',
    serverError: 'Erreur serveur temporaire. Veuillez réessayer.',
    unknownError: 'Une erreur inattendue s\'est produite',
  },

  preferences: {
    notifications: 'Notifications',
    emailNotifications: 'Notifications par email',
    emailNotificationsDesc: 'Recevez des mises à jour importantes par email',
    pushNotifications: 'Notifications push',
    pushNotificationsDesc: 'Soyez alerté des nouvelles activités',
    marketingNotifications: 'Notifications marketing',
    marketingNotificationsDesc: 'Recevez des offres et promotions',
    privacy: 'Confidentialité',
    profileVisibility: 'Visibilité du profil',
    profileVisibilityDesc: 'Choisissez qui peut voir votre profil',
    locationSharing: 'Partage de localisation',
    locationSharingDesc: 'Autoriser le partage de votre position',
  },

  privacy: {
    public: 'Public',
    private: 'Privé',
    friends: 'Amis',
  },

  verification: {
    title: 'Vérifiez votre email',
    subtitle: 'Nous avons envoyé un code de vérification à votre email',
    resend: 'Renvoyer le code',
    verify: 'Vérifier',
  },

  nav: {
    home: 'Accueil',
    search: 'Recherche', 
    profile: 'Profil',
  },

  country: 'Pays',
  
  // Clés exactes utilisées par les composants (compatibilité)
  '📧 Email address': '📧 Adresse email',
  '🔒 Password': '🔒 Mot de passe',
  '🔑 Confirm password': '🔑 Confirmer le mot de passe',
  '👤 Username': '👤 Nom d\'utilisateur',
  '👤 First name': '👤 Prénom',
  '👤 Last name': '👤 Nom',
  '📱 Phone (optional)': '📱 Téléphone (optionnel)',
  'Téléphone': '📱 Téléphone',
  '📧 Adresse email': '📧 Adresse email',
  '🔒 Mot de passe': '🔒 Mot de passe',
  '🔑 Confirmer le mot de passe': '🔑 Confirmer le mot de passe',
  'Nom d\'utilisateur': '👤 Nom d\'utilisateur',
  'Prénom': '👤 Prénom',
  'Nom': '👤 Nom',


}; 