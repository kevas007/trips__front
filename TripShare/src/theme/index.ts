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
    primary: '#667eea',
    secondary: '#764ba2',
    accent: ['#667eea', '#764ba2'],
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      disabled: '#999999',
    },
    border: '#E1E1E1',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    info: '#007AFF',
    card: '#FFFFFF',
    notification: '#FF3B30',
  },
  spacing,
  typography,
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#667eea',
    secondary: '#764ba2',
    accent: ['#667eea', '#764ba2'],
    background: '#1A1A1A',
    surface: '#2C2C2C',
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      disabled: '#666666',
    },
    border: '#404040',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FFD60A',
    info: '#0A84FF',
    card: '#2C2C2C',
    notification: '#FF453A',
  },
  spacing,
  typography,
};

export type AppTheme = typeof lightTheme; 