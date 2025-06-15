import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ['#2563EB', '#667eea', '#764ba2', '#f093fb'],
    accent: ['#FF6B9D', '#4ECDC4'],
    secondary: ['#4facfe', '#00f2fe'],
    background: {
      primary: '#FFFFFF',
      card: '#F1F5F9',
      overlay: 'rgba(0, 0, 0, 0.8)',
      gradient: ['#2563EB', '#667eea', '#764ba2', '#f093fb'],
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      light: 'rgba(30, 41, 59, 0.7)',
      disabled: '#999999',
    },
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#E11D48',
      info: '#2563EB',
    },
    glassmorphism: {
      background: 'rgba(241, 245, 249, 0.7)',
      border: 'rgba(100, 116, 139, 0.15)',
      shadow: 'rgba(100, 116, 139, 0.10)',
    },
    border: {
      primary: '#e0e0e0',
    },
    // Compatibilité avec les anciennes structures
    surface: '#F8F9FA',
    card: '#F1F5F9',
    error: '#E11D48',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#2563EB',
    notification: '#E11D48',
    inputBorder: '#e0e0e0',
  },
  spacing,
  typography,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
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
      disabled: '#666666',
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
    border: {
      primary: '#334155',
    },
    // Compatibilité avec les anciennes structures
    surface: '#2C2C2C',
    card: 'rgba(15, 23, 42, 0.8)',
    error: '#DC2626',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#2563EB',
    notification: '#DC2626',
    inputBorder: '#334155',
  },
  spacing,
  typography,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export type AppTheme = typeof lightTheme; 