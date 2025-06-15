import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Largeurs d'écran de référence
const DESIGN_WIDTH = 375; // iPhone X/11/12 Pro
const DESIGN_HEIGHT = 812;

// Fonction pour calculer une taille responsive
export const responsive = (size: number): number => {
  const scale = screenWidth / DESIGN_WIDTH;
  const newSize = size * scale;
  
  // Limiter la mise à l'échelle pour éviter des tailles trop extrêmes
  if (Platform.OS === 'web') {
    return Math.min(newSize, size * 1.2); // Max 120% sur web
  }
  
  return Math.max(newSize, size * 0.85); // Min 85% sur mobile
};

// Fonction pour les tailles de police selon la plateforme
export const getFontSize = (size: number): number => {
  if (Platform.OS === 'web') {
    return size; // Taille normale sur web
  }
  
  // Sur mobile, ajuster selon la taille d'écran
  const scale = Math.min(screenWidth / DESIGN_WIDTH, 1.1);
  return Math.round(size * scale);
};

// Fonction pour les hauteurs d'inputs selon la plateforme
export const getInputHeight = (): number => {
  if (Platform.OS === 'web') {
    return 48; // Hauteur standard web
  }
  
  // Sur mobile, adapter à la taille d'écran
  const baseHeight = 52;
  const scale = screenWidth / DESIGN_WIDTH;
  return Math.max(Math.round(baseHeight * scale), 44); // Minimum 44px pour l'accessibilité iOS
};

// Fonction pour les espacements selon la plateforme
export const getSpacing = (spacing: number): number => {
  if (Platform.OS === 'web') {
    return spacing;
  }
  
  // Sur mobile, ajuster légèrement
  const scale = screenWidth / DESIGN_WIDTH;
  return Math.round(spacing * Math.min(scale, 1.15));
};

// Fonction pour les rayons de bordure selon la plateforme
export const getBorderRadius = (radius: number): number => {
  if (Platform.OS === 'web') {
    return radius;
  }
  
  // Sur mobile, légèrement plus arrondi
  return Math.round(radius * 1.1);
};

// Dimensions utiles
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallScreen: screenWidth < 350,
  isMediumScreen: screenWidth >= 350 && screenWidth < 414,
  isLargeScreen: screenWidth >= 414,
  isTablet: screenWidth >= 768,
};

// Tailles de police adaptatives
export const fontSizes = {
  xs: getFontSize(10),
  sm: getFontSize(12),
  base: getFontSize(14),
  md: getFontSize(16),
  lg: getFontSize(18),
  xl: getFontSize(20),
  '2xl': getFontSize(24),
  '3xl': getFontSize(30),
  '4xl': getFontSize(36),
};

// Espacements adaptatifs
export const spacing = {
  xs: getSpacing(4),
  sm: getSpacing(8),
  md: getSpacing(12),
  lg: getSpacing(16),
  xl: getSpacing(20),
  '2xl': getSpacing(24),
  '3xl': getSpacing(32),
  '4xl': getSpacing(40),
};

export default {
  responsive,
  getFontSize,
  getInputHeight,
  getSpacing,
  getBorderRadius,
  screenDimensions,
  fontSizes,
  spacing,
}; 