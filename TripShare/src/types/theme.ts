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
    primary: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    accent: ['#FF6B9D', '#4ECDC4'],
    secondary: ['#4facfe', '#00f2fe'],
    background: {
      primary: '#F8FAFC',
      card: 'rgba(255, 255, 255, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.8)',
      gradient: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      light: 'rgba(255, 255, 255, 0.9)',
    },
    semantic: {
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#EF4444',
      info: '#3B82F6',
    },
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
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
    primary: ['#1a1b3a', '#2d1b69', '#8b5a9a', '#4facfe'],
    accent: ['#FF6B9D', '#4ECDC4'],
    secondary: ['#4facfe', '#00f2fe'],
    background: {
      primary: '#0F172A',
      card: 'rgba(15, 23, 42, 0.8)',
      overlay: 'rgba(0, 0, 0, 0.9)',
      gradient: ['#1a1b3a', '#2d1b69', '#8b5a9a', '#4facfe'],
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      light: 'rgba(241, 245, 249, 0.9)',
    },
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#2563EB',
    },
    glassmorphism: {
      background: 'rgba(15, 23, 42, 0.6)',
      border: 'rgba(241, 245, 249, 0.1)',
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
