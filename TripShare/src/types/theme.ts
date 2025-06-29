// === 1. TYPES ET INTERFACES ===

// types/theme.ts
export interface Theme {
  colors: {
    primary: string[];
    accent: string[];
    secondary: string[];
    background: {
      primary: string;
      card: string;
      overlay: string;
      gradient: string[];
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    glassmorphism: {
      background: string;
      border: string;
      shadow: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// types/language.ts
export type Language = 'fr' | 'en';

export interface Translations {
  auth: {
    loginTitle: string;
    registerTitle: string;
    forgotTitle: string;
    loginButton: string;
    registerButton: string;
    forgotButton: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    namePlaceholder: string;
    rememberMe: string;
    acceptTerms: string;
    receiveNotifications: string;
    forgotPassword: string;
    createAccount: string;
    alreadyMember: string;
    backToLogin: string;
    appTagline: string;
    stats: {
      adventurers: string;
      countries: string;
      appRating: string;
    };
    biometric: {
      title: string;
      enable: string;
      later: string;
      prompt: string;
    };
    errors: {
      invalidEmail: string;
      passwordTooShort: string;
      nameRequired: string;
      passwordMismatch: string;
      termsRequired: string;
      biometricFailed: string;
    };
    success: {
      emailSent: string;
    };
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    ok: string;
  };
}

// === 2. THÈMES LIGHT/DARK ===

// constants/themes.ts
export const lightTheme: Theme = {
  colors: {
    primary: ['#008080', '#B2DFDF', '#FFFFFF'], // md_theme_light_primary, primaryContainer, onPrimary
    accent: ['#FF9500', '#34C759'], // Orange et vert compatibles
    secondary: ['#4FB3B3', '#D1F0EF', '#00B8A9'], // md_theme_light_secondary, secondaryContainer, tertiary
    background: {
      primary: '#FAFAFA', // md_theme_light_background
      card: '#FFFFFF', // md_theme_light_surface
      overlay: 'rgba(28, 27, 31, 0.8)', // md_theme_light_onBackground avec transparence
      gradient: ['#FAFAFA', '#FFFFFF'], // Background vers surface
    },
    text: {
      primary: '#1C1B1F', // md_theme_light_onBackground
      secondary: '#757575', // Gris moyen pour texte secondaire
      light: '#FFFFFF', // md_theme_light_onPrimary
    },
    semantic: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#008080', // md_theme_light_primary
    },
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(0, 128, 128, 0.15)', // Bordure teal subtile
      shadow: 'rgba(0, 128, 128, 0.10)', // Ombre teal
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: ['#4FB3B3', '#005F5F', '#002020'], // md_theme_dark_primary, primaryContainer, onPrimary
    accent: ['#FF9F0A', '#32D74B'], // Orange et vert sombres
    secondary: ['#70D6C9', '#004F4C', '#4EA3A3'], // md_theme_dark_secondary, secondaryContainer, tertiary
    background: {
      primary: '#1C1B1F', // md_theme_dark_background
      card: '#1C1B1F', // md_theme_dark_surface
      overlay: 'rgba(230, 225, 229, 0.7)', // md_theme_dark_onBackground avec transparence
      gradient: ['#1C1B1F', '#1C1B1F'], // Background vers surface
    },
    text: {
      primary: '#E6E1E5', // md_theme_dark_onBackground
      secondary: '#9E9E9E', // Gris moyen pour mode sombre
      light: '#E6E1E5', // md_theme_dark_onSurface
    },
    semantic: {
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#4FB3B3', // md_theme_dark_primary
    },
    glassmorphism: {
      background: 'rgba(28, 27, 31, 0.6)',
      border: 'rgba(79, 179, 179, 0.1)', // Bordure teal sombre
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};
