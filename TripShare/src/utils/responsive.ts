import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Largeur de référence pour le design (iPhone 14 Pro)
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

// Fonction responsive pour les composants
export const responsive = (value: number, dimension: 'width' | 'height' = 'width'): number => {
  const referenceValue = dimension === 'width' ? DESIGN_WIDTH : DESIGN_HEIGHT;
  const currentValue = dimension === 'width' ? screenWidth : screenHeight;
  return Math.round((currentValue / referenceValue) * value);
};

export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallScreen: screenWidth < 375,
  isLargeScreen: screenWidth > 414,
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

// Fonction pour la hauteur des inputs
export const getInputHeight = (): number => {
  if (Platform.OS === 'ios') return 50;
  if (Platform.OS === 'android') return 48; // Plus compact sur Android
  return 52;
};

// Fonction pour l'espacement adaptatif
export const getSpacing = (spacing: number): number => {
  if (Platform.OS === 'web') {
    return spacing;
  }
  
  const scale = Math.min(screenWidth / DESIGN_WIDTH, 1.1);
  return Math.round(spacing * scale);
};

// Fonction pour les border radius adaptatifs
export const getBorderRadius = (radius: number): number => {
  if (Platform.OS === 'web') {
    return radius;
  }
  
  const scale = Math.min(screenWidth / DESIGN_WIDTH, 1.05);
  return Math.round(radius * scale);
};

// Espacement adaptatif
export const spacing = {
  xs: getSpacing(4),
  sm: getSpacing(8),
  md: getSpacing(16),
  lg: getSpacing(24),
  xl: getSpacing(32),
  xxl: getSpacing(48),
};

// Tailles de police adaptatives
export const fontSizes = {
  xs: getFontSize(9),
  sm: getFontSize(11),
  base: getFontSize(13),
  md: getFontSize(15),
  lg: getFontSize(17),
  xl: getFontSize(19),
  '2xl': getFontSize(21),
  '3xl': getFontSize(27),
  '4xl': getFontSize(33),
};

// Fonction helper pour définir les breakpoints
export const isTablet = screenWidth >= 768;
export const isDesktop = screenWidth >= 1024;

// Marges et paddings responsive
export const responsivePadding = {
  horizontal: isTablet ? 32 : 16,
  vertical: isTablet ? 24 : 16,
};

// Tailles d'icônes responsive
export const iconSizes = {
  small: responsive(16),
  medium: responsive(24),
  large: responsive(32),
  xlarge: responsive(48),
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
  isTablet,
  isDesktop,
  responsivePadding,
  iconSizes,
}; 