import { Theme } from '../types/theme.types';

export const lightTheme: Theme = {
  colors: {
    primary: ['#007AFF', '#0055FF', '#0033FF'],
    accent: ['#FF3B30', '#FF2D55', '#FF9500'],
    secondary: ['#5856D6', '#FF2D55', '#FF9500'],
    background: {
      primary: '#FFFFFF',
      card: '#F5F5F5',
      overlay: 'rgba(0, 0, 0, 0.5)',
      gradient: ['#FFFFFF', '#F5F5F5'],
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      light: '#FFFFFF',
    },
    semantic: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
    },
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
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
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
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
    primary: ['#0A84FF', '#007AFF', '#0055FF'],
    accent: ['#FF453A', '#FF375F', '#FF9F0A'],
    secondary: ['#5E5CE6', '#FF375F', '#FF9F0A'],
    background: {
      primary: '#000000',
      card: '#1C1C1E',
      overlay: 'rgba(0, 0, 0, 0.7)',
      gradient: ['#000000', '#1C1C1E'],
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      light: '#FFFFFF',
    },
    semantic: {
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#0A84FF',
    },
    glassmorphism: {
      background: 'rgba(28, 28, 30, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    border: '#2C2C2E',
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
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
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

export const theme = {
  colors: {
    primary: ['#007AFF', '#0055FF', '#0033FF'],
    accent: ['#FF3B30', '#FF2D55', '#FF9500'],
    secondary: ['#5856D6', '#FF2D55', '#FF9500'],
    background: {
      primary: '#FFFFFF',
      card: '#F5F5F5',
      overlay: 'rgba(0, 0, 0, 0.5)',
      gradient: ['#FFFFFF', '#F5F5F5'],
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      light: '#FFFFFF',
    },
    semantic: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
    },
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
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
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
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