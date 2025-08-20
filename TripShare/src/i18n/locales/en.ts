export default {
  auth: {
    login: 'Login',
    register: 'Sign up', 
    forgot: 'Forgot password',
    email: 'Email',
    username: 'Username',
    firstName: 'First Name',
    lastName: 'Last Name',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    passwordsMatch: 'Passwords match ✓',
    passwordsDontMatch: 'Passwords do not match',
    welcome: 'Welcome to TripShare',
    subtitle: 'Travel, Share, Connect',
    loginTitle: '🌍 Welcome back!',
    registerTitle: '✨ Join the adventure',
    forgotTitle: '🔑 Account recovery',
    loginButton: '✈️ Explore the world',
    registerButton: '🚀 Start the adventure',
    forgotButton: '📧 Send link',
    forgotCta: '📧 Send recovery link',
    loginCta: ' Sign in',
    registerCta: '🚀 Start the adventure',
    appTagline: 'Transform your dreams into memories',

    // Placeholders
    emailPlaceholder: '📧 Email address',
    passwordPlaceholder: '🔒 Password',
    confirmPasswordPlaceholder: '🔑 Confirm password',
    usernamePlaceholder: '👤 Username',
    firstNamePlaceholder: '👤 First name',
    lastNamePlaceholder: '👤 Last name',
    phoneNumberPlaceholder: '📱 Phone (optional)',
    namePlaceholder: '👤 Your full name',

    // Options
    rememberMe: 'Remember me',
    acceptTerms: 'I accept the terms of use',
    termsLink: 'terms of service',
    receiveNotifications: 'Receive travel inspirations',
    enableNotifications: 'Enable notifications',
    useBiometric: 'Use biometric authentication',

    // Navigation
    forgotPassword: '🔑 Forgot password?',
    forgotLink: '🔑 Forgot password?',
    createAccount: '✨ Create account',
    alreadyMember: '🌍 Already a member? Sign in',
    backToLogin: '← Back to login',
    alreadyHaveAccount: 'Already have an account? Sign in',

    // Stats
    stats: {
      adventurers: 'Adventurers',
      countries: 'Countries',
      rating: 'Rating'
    },

    // Biometric
    biometric: {
      title: '🔐 Biometric authentication',
      suggestion: 'Would you like to enable biometric authentication for faster login?',
      enable: 'Enable ✨',
      later: 'Later',
      prompt: '✨ Magic login with your fingerprint',
      expressLogin: 'Express Login',
      touchFaceId: 'Touch/Face ID'
    },

    // Errors
    errors: {
      emailRequired: 'Email is required',
      invalidEmail: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Minimum 6 characters required',
      usernameRequired: 'Username is required',
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      nameRequired: 'How should we call you?',
      passwordMismatch: 'Passwords do not match',
      invalidPhoneNumber: 'Invalid phone number format',
      termsRequired: 'Please accept our terms of use',
      generalError: 'An error occurred',
      biometricFailed: 'Biometric authentication failed. Try again!',
      loginFailed: 'Login failed. Check your credentials.',
      registerFailed: 'Registration failed. Please try again.',
      resetFailed: 'Password reset failed.',
      sessionExpired: 'Session expired. Please log in again.',
      invalidCredentials: 'Invalid credentials',
      accountLocked: 'Account temporarily locked',
      emailInUse: 'This email address is already in use',
      weakPassword: 'Password is too weak',
      invalidCode: 'Invalid verification code',
      tooManyAttempts: 'Too many attempts. Try again later'
    },

    // Success
    success: {
      emailSent: 'Email sent',
      emailSentDesc: 'Check your mailbox to reset your password',
      loginSuccess: 'Login successful!',
      registerSuccess: 'Registration successful!',
      passwordReset: 'Password reset',
      accountCreated: 'Account created successfully',
      verificationSent: 'Verification email sent',
      profileUpdated: 'Profile updated',
      passwordChanged: 'Password changed'
    },

    // Validation
    validation: {
      email: 'Invalid email format',
      password: 'Password must contain at least 8 characters',
      passwordMatch: 'Passwords must match',
      phone: 'Invalid phone number format',
      required: 'This field is required',
      minLength: 'Minimum {{count}} characters required',
      maxLength: 'Maximum {{count}} characters allowed',
      username: 'Username must be between 3 and 20 characters',
      terms: 'You must accept the terms of use'
    },
  },

  register: {
    username: 'Username',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    phoneHint: 'Format: +1 234 567 890',
  },

  home: {
    welcome: 'Hello! 👋',
    subtitle: 'Discover new adventures',
    searchPlaceholder: 'Where do you want to go?',
    featuredTrips: 'Featured trips',
    recentTrips: 'Recent trips',
    popularDestinations: 'Popular destinations',
    noFeaturedTrips: 'No featured trips at the moment',
    noRecentTrips: 'No recent trips',
    noDestinations: 'No popular destinations',
  },

  common: {
    seeAll: 'See all',
    loading: 'Loading...',
    error: 'Oops! 😅',
    success: 'Success',
    retry: 'Retry',
    cancel: 'Cancel',
    ok: 'OK',
    confirm: 'Confirm',
    save: 'Save',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    search: 'Search',
    searchDescription: 'Discover thousands of itineraries shared by the community',
    profile: 'Profile',
    profileDescription: 'Manage your trips, settings and statistics',
    delete: 'Delete',
    edit: 'Edit',
  },

  errors: {
    networkError: 'Connection problem. Check your internet connection.',
    unauthorized: 'Incorrect email or password',
    badRequest: 'Invalid data',
    forbidden: 'Access denied',
    conflict: 'This email address is already in use',
    validationError: 'Invalid data',
    rateLimited: 'Too many attempts. Please try again later.',
    serverError: 'Temporary server error. Please try again.',
    unknownError: 'An unexpected error occurred',
  },

  preferences: {
    notifications: 'Notifications',
    emailNotifications: 'Email notifications',
    emailNotificationsDesc: 'Receive important updates by email',
    pushNotifications: 'Push notifications',
    pushNotificationsDesc: 'Get alerted of new activities',
    marketingNotifications: 'Marketing notifications',
    marketingNotificationsDesc: 'Receive offers and promotions',
    privacy: 'Privacy',
    profileVisibility: 'Profile visibility',
    profileVisibilityDesc: 'Choose who can see your profile',
    locationSharing: 'Location sharing',
    locationSharingDesc: 'Allow sharing your location',
  },

  privacy: {
    public: 'Public',
    private: 'Private',
    friends: 'Friends',
  },

  verification: {
    title: 'Verify your email',
    subtitle: 'We sent a verification code to your email',
    resend: 'Resend code',
    verify: 'Verify',
  },

  nav: {
    home: 'Home',
    search: 'Search', 
    profile: 'Profile',
  },

  country: 'Country',
}; 