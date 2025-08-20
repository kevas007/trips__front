import { Theme } from '../types/theme.types';

export const lightTheme: Theme = {
  colors: {
    primary: ['#008080', '#B2DFDF', '#FFFFFF'],
    accent: ['#FF9500', '#FF3B30', '#34C759'],
    secondary: ['#4FB3B3', '#D1F0EF', '#00B8A9'],
    background: {
      primary: 'transparent', // Supprimer le fond blanc
      card: 'transparent', // Supprimer le fond blanc
      overlay: 'rgba(28, 27, 31, 0.5)',
      gradient: ['transparent', 'transparent'], // Supprimer le gradient blanc
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
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(0, 128, 128, 0.2)',
      shadow: 'rgba(0, 128, 128, 0.1)',
    },
    border: '#E0E0E0',
    error: '#FF3B30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 29,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 21,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 13,
    },
    caption: {
      fontSize: 11,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: ['#4FB3B3', '#005F5F', '#002020'],
    accent: ['#FF9F0A', '#FF453A', '#32D74B'],
    secondary: ['#70D6C9', '#004F4C', '#4EA3A3'],
    background: {
      primary: 'transparent', // Supprimer le fond sombre
      card: 'transparent', // Supprimer le fond sombre
      overlay: 'rgba(230, 225, 229, 0.7)',
      gradient: ['transparent', 'transparent'], // Supprimer le gradient sombre
    },
    text: {
      primary: '#E6E1E5',
      secondary: '#9E9E9E',
      light: '#E6E1E5',
    },
    semantic: {
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#4FB3B3',
    },
    glassmorphism: {
      background: 'rgba(28, 27, 31, 0.8)',
      border: 'rgba(79, 179, 179, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    border: '#424242',
    error: '#FF453A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 29,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 21,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 13,
    },
    caption: {
      fontSize: 11,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

// Export par défaut pour compatibilité
export const theme = lightTheme;

// Export du type AppTheme pour compatibilité avec ThemeContext
export type AppTheme = Theme; 