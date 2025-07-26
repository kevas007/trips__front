// ========== SYSTÈME D'ESPACEMENT UNIFIÉ TRIPSHARE ==========
// Espacement cohérent basé sur une grille de 4px avec variantes responsives

import { Platform, Dimensions } from 'react-native';

// ========== UNITÉ DE BASE ==========
const BASE_UNIT = 4; // 4px comme unité de base (standard Material Design)

// ========== DÉTECTION DE LA TAILLE D'ÉCRAN ==========
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SCREEN_SIZES = {
  small: screenWidth < 375,      // iPhone SE, petits Android
  medium: screenWidth < 768,     // iPhone standard, Android standard
  large: screenWidth < 1024,     // iPad, tablettes
  extraLarge: screenWidth >= 1024, // iPad Pro, desktop
};

// ========== ESPACEMENT DE BASE ==========
export const SPACING = {
  // Espacement minimal (multiples de 4px)
  none: 0,
  xs: BASE_UNIT,          // 4px
  sm: BASE_UNIT * 2,      // 8px
  md: BASE_UNIT * 3,      // 12px
  lg: BASE_UNIT * 4,      // 16px
  xl: BASE_UNIT * 5,      // 20px
  '2xl': BASE_UNIT * 6,   // 24px
  '3xl': BASE_UNIT * 8,   // 32px
  '4xl': BASE_UNIT * 10,  // 40px
  '5xl': BASE_UNIT * 12,  // 48px
  '6xl': BASE_UNIT * 16,  // 64px
  '7xl': BASE_UNIT * 20,  // 80px
  '8xl': BASE_UNIT * 24,  // 96px
  '9xl': BASE_UNIT * 32,  // 128px
};

// ========== ESPACEMENT RESPONSIF ==========
export const RESPONSIVE_SPACING = {
  // Espacement qui s'adapte à la taille d'écran
  xs: SCREEN_SIZES.small ? SPACING.xs : SPACING.sm,
  sm: SCREEN_SIZES.small ? SPACING.sm : SPACING.md,
  md: SCREEN_SIZES.small ? SPACING.md : SPACING.lg,
  lg: SCREEN_SIZES.small ? SPACING.lg : SPACING.xl,
  xl: SCREEN_SIZES.small ? SPACING.xl : SPACING['2xl'],
  '2xl': SCREEN_SIZES.small ? SPACING['2xl'] : SPACING['3xl'],
  '3xl': SCREEN_SIZES.small ? SPACING['3xl'] : SPACING['4xl'],
  '4xl': SCREEN_SIZES.small ? SPACING['4xl'] : SPACING['5xl'],
  '5xl': SCREEN_SIZES.small ? SPACING['5xl'] : SPACING['6xl'],
};

// ========== ESPACEMENT CONTEXTUEL ==========
export const CONTEXTUAL_SPACING = {
  // Espacement pour les composants spécifiques
  
  // Conteneurs
  container: {
    padding: SCREEN_SIZES.small ? SPACING.lg : SPACING.xl,
    margin: SCREEN_SIZES.small ? SPACING.md : SPACING.lg,
  },
  
  // Cartes
  card: {
    padding: SPACING.lg,
    margin: SPACING.md,
    gap: SPACING.md,
    borderRadius: SPACING.md,
  },
  
  // Boutons
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  
  // Champs de saisie
  input: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: SPACING.md,
  },
  
  // Listes
  list: {
    itemPadding: SPACING.lg,
    itemMargin: SPACING.sm,
    sectionPadding: SPACING.xl,
    headerPadding: SPACING.lg,
  },
  
  // Navigation
  navigation: {
    tabBarHeight: Platform.select({ ios: 58, android: 64, web: 60, default: 60 }),
    headerHeight: Platform.select({ ios: 44, android: 56, web: 48, default: 48 }),
    padding: SPACING.lg,
    margin: SPACING.md,
  },
  
  // Modales
  modal: {
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: SPACING.lg,
  },
  
  // Sections
  section: {
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  
  // Grilles
  grid: {
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  
  // Formulaires
  form: {
    fieldSpacing: SPACING.lg,
    sectionSpacing: SPACING['2xl'],
    padding: SPACING.xl,
  },
};

// ========== ESPACEMENT VOYAGE SPÉCIFIQUE ==========
export const TRAVEL_SPACING = {
  // Espacement pour les composants voyage
  
  // Cartes de voyage
  tripCard: {
    padding: SPACING.lg,
    margin: SPACING.md,
    imageHeight: 200,
    headerHeight: 60,
    contentPadding: SPACING.lg,
  },
  
  // Itinéraires
  itinerary: {
    stepPadding: SPACING.lg,
    stepMargin: SPACING.md,
    timelinePadding: SPACING.xl,
    daySpacing: SPACING['2xl'],
  },
  
  // Galeries
  gallery: {
    imageSpacing: SPACING.sm,
    gridPadding: SPACING.md,
    thumbnailSize: 80,
  },
  
  // Statistiques
  stats: {
    cardPadding: SPACING.lg,
    cardMargin: SPACING.md,
    iconSize: 24,
    spacing: SPACING.md,
  },
  
  // Feed social
  socialFeed: {
    postPadding: SPACING.lg,
    postMargin: SPACING.md,
    avatarSize: 40,
    actionSpacing: SPACING.lg,
  },
  
  // Profil
  profile: {
    headerHeight: 200,
    avatarSize: 80,
    badgeSize: 32,
    sectionSpacing: SPACING['2xl'],
    contentPadding: SPACING.lg,
  },
};

// ========== HELPERS D'ESPACEMENT ==========

export const getSpacing = (multiplier: number): number => {
  return BASE_UNIT * multiplier;
};

export const getResponsiveSpacing = (baseSpacing: number, scale: number = 1): number => {
  let responsiveScale = 1;
  
  if (SCREEN_SIZES.small) {
    responsiveScale = 0.8;
  } else if (SCREEN_SIZES.large) {
    responsiveScale = 1.2;
  } else if (SCREEN_SIZES.extraLarge) {
    responsiveScale = 1.4;
  }
  
  return Math.round(baseSpacing * responsiveScale * scale);
};

export const getVerticalSpacing = (spacing: number): { marginTop: number; marginBottom: number } => {
  return {
    marginTop: spacing,
    marginBottom: spacing,
  };
};

export const getHorizontalSpacing = (spacing: number): { marginLeft: number; marginRight: number } => {
  return {
    marginLeft: spacing,
    marginRight: spacing,
  };
};

export const getPadding = (vertical: number, horizontal?: number): {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
} => {
  const h = horizontal ?? vertical;
  return {
    paddingTop: vertical,
    paddingBottom: vertical,
    paddingLeft: h,
    paddingRight: h,
  };
};

export const getMargin = (vertical: number, horizontal?: number): {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
} => {
  const h = horizontal ?? vertical;
  return {
    marginTop: vertical,
    marginBottom: vertical,
    marginLeft: h,
    marginRight: h,
  };
};

// ========== ESPACEMENT POUR DIFFÉRENTS CONTEXTES ==========

export const LAYOUT_SPACING = {
  // Espacement pour les layouts principaux
  screen: {
    padding: getResponsiveSpacing(SPACING.lg),
    margin: getResponsiveSpacing(SPACING.md),
  },
  
  content: {
    maxWidth: SCREEN_SIZES.extraLarge ? 1200 : '100%',
    padding: getResponsiveSpacing(SPACING.lg),
  },
  
  sidebar: {
    width: SCREEN_SIZES.large ? 280 : 240,
    padding: SPACING.lg,
  },
  
  header: {
    height: CONTEXTUAL_SPACING.navigation.headerHeight,
    padding: SPACING.lg,
  },
  
  footer: {
    padding: SPACING.xl,
    margin: SPACING.lg,
  },
};

// ========== ESPACEMENT POUR ANIMATIONS ==========

export const ANIMATION_SPACING = {
  // Distances pour les animations
  slideDistance: getResponsiveSpacing(SPACING['4xl']),
  fadeDistance: getResponsiveSpacing(SPACING.lg),
  scaleDistance: 0.95, // Facteur de scale
  
  // Offsets pour les gestes
  swipeThreshold: getResponsiveSpacing(SPACING['3xl']),
  panThreshold: getResponsiveSpacing(SPACING.lg),
};

// ========== ESPACEMENT POUR L'ACCESSIBILITÉ ==========

export const ACCESSIBILITY_SPACING = {
  // Espacement minimum pour les zones tactiles
  minTouchTarget: 44, // Recommandation Apple/Google
  touchTargetPadding: SPACING.md,
  
  // Espacement pour la lisibilité
  readingSpacing: SPACING.lg,
  focusOutline: SPACING.xs,
  
  // Espacement pour les lecteurs d'écran
  semanticSpacing: SPACING.md,
};

// ========== EXPORTS ==========

export const SPACING_SYSTEM = {
  base: SPACING,
  responsive: RESPONSIVE_SPACING,
  contextual: CONTEXTUAL_SPACING,
  travel: TRAVEL_SPACING,
  layout: LAYOUT_SPACING,
  animation: ANIMATION_SPACING,
  accessibility: ACCESSIBILITY_SPACING,
  helpers: {
    getSpacing,
    getResponsiveSpacing,
    getVerticalSpacing,
    getHorizontalSpacing,
    getPadding,
    getMargin,
  },
};

export default SPACING_SYSTEM;

// ========== EXPORTS LEGACY ==========
// Pour compatibilité avec l'ancien système
export const SPACING_LEGACY = {
  0: SPACING.none,
  1: SPACING.xs,
  2: SPACING.sm,
  3: SPACING.md,
  4: SPACING.lg,
  5: SPACING.xl,
  6: SPACING['2xl'],
  8: SPACING['3xl'],
  10: SPACING['4xl'],
  12: SPACING['5xl'],
  16: SPACING['6xl'],
  20: SPACING['7xl'],
  24: SPACING['8xl'],
  32: SPACING['9xl'],
}; 