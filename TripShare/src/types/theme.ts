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
    border: {
      primary: string;
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
    primary: ['#008080', '#B2DFDF', '#FFFFFF'],
    accent: ['#FF6B6B', '#FFE2E2', '#FFFFFF'],
    secondary: ['#6C757D', '#E9ECEF', '#FFFFFF'],
    background: {
      primary: '#FAFAFA',
      card: '#FFFFFF',
      overlay: 'rgba(28, 27, 31, 0.8)',
      gradient: ['#FAFAFA', '#FFFFFF'],
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#757575',
      light: '#FFFFFF',
    },
    semantic: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#008080',
    },
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(0, 128, 128, 0.15)',
      shadow: 'rgba(0, 128, 128, 0.10)',
    },
    border: {
      primary: '#E0E0E0',
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
    primary: ['#00B3B3', '#004D4D', '#000000'],
    accent: ['#FF8585', '#802D2D', '#000000'],
    secondary: ['#ADB5BD', '#343A40', '#000000'],
    background: {
      primary: '#121212',
      card: '#1E1E1E',
      overlay: 'rgba(0, 0, 0, 0.8)',
      gradient: ['#121212', '#1E1E1E'],
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD',
      light: '#000000',
    },
    semantic: {
      success: '#32D74B',
      warning: '#FFD60A',
      error: '#FF453A',
      info: '#00B3B3',
    },
    glassmorphism: {
      background: 'rgba(0, 0, 0, 0.7)',
      border: 'rgba(0, 179, 179, 0.15)',
      shadow: 'rgba(0, 179, 179, 0.10)',
    },
    border: {
      primary: '#333333',
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
