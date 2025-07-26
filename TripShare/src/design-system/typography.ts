// ========== SYSTÈME TYPOGRAPHIQUE UNIFIÉ TRIPSHARE ==========
// Hiérarchie typographique cohérente pour toutes les plateformes

import { Platform } from 'react-native';

// ========== FAMILLES DE POLICES ==========
export const FONT_FAMILIES = {
  // Polices principales par plateforme
  heading: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    web: 'SF Pro Display, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    default: 'System',
  }),
  body: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    web: 'SF Pro Text, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    web: 'SF Mono, "Fira Code", "JetBrains Mono", Monaco, Consolas, monospace',
    default: 'monospace',
  }),
};

// ========== POIDS DES POLICES ==========
export const FONT_WEIGHTS = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

// ========== ÉCHELLE TYPOGRAPHIQUE ==========
// Basée sur une échelle modulaire (ratio 1.25 - Major Third)
export const FONT_SIZES = {
  // Titres principaux
  h1: Platform.select({ ios: 32, android: 34, web: 36, default: 32 }),
  h2: Platform.select({ ios: 26, android: 28, web: 30, default: 26 }),
  h3: Platform.select({ ios: 22, android: 24, web: 26, default: 22 }),
  h4: Platform.select({ ios: 18, android: 20, web: 22, default: 18 }),
  h5: Platform.select({ ios: 16, android: 18, web: 20, default: 16 }),
  h6: Platform.select({ ios: 14, android: 16, web: 18, default: 14 }),
  
  // Textes de contenu
  bodyLarge: Platform.select({ ios: 17, android: 18, web: 18, default: 17 }),
  bodyMedium: Platform.select({ ios: 15, android: 16, web: 16, default: 15 }),
  bodySmall: Platform.select({ ios: 13, android: 14, web: 14, default: 13 }),
  
  // Textes utilitaires
  caption: Platform.select({ ios: 12, android: 13, web: 13, default: 12 }),
  overline: Platform.select({ ios: 11, android: 12, web: 12, default: 11 }),
  
  // Textes spéciaux
  button: Platform.select({ ios: 15, android: 16, web: 16, default: 15 }),
  label: Platform.select({ ios: 14, android: 15, web: 15, default: 14 }),
  input: Platform.select({ ios: 16, android: 16, web: 16, default: 16 }),
  
  // Textes navigation
  tabBar: Platform.select({ ios: 11, android: 12, web: 12, default: 11 }),
  navigationTitle: Platform.select({ ios: 17, android: 18, web: 18, default: 17 }),
};

// ========== HAUTEURS DE LIGNE ==========
export const LINE_HEIGHTS = {
  // Calcul automatique basé sur les tailles
  h1: FONT_SIZES.h1 * 1.2,
  h2: FONT_SIZES.h2 * 1.25,
  h3: FONT_SIZES.h3 * 1.3,
  h4: FONT_SIZES.h4 * 1.35,
  h5: FONT_SIZES.h5 * 1.4,
  h6: FONT_SIZES.h6 * 1.45,
  
  bodyLarge: FONT_SIZES.bodyLarge * 1.5,
  bodyMedium: FONT_SIZES.bodyMedium * 1.5,
  bodySmall: FONT_SIZES.bodySmall * 1.5,
  
  caption: FONT_SIZES.caption * 1.4,
  overline: FONT_SIZES.overline * 1.4,
  
  button: FONT_SIZES.button * 1.2,
  label: FONT_SIZES.label * 1.3,
  input: FONT_SIZES.input * 1.2,
  
  tabBar: FONT_SIZES.tabBar * 1.2,
  navigationTitle: FONT_SIZES.navigationTitle * 1.2,
};

// ========== STYLES TYPOGRAPHIQUES PRÉDÉFINIS ==========
export const TYPOGRAPHY_STYLES = {
  // ========== TITRES ==========
  h1: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.h1,
    lineHeight: LINE_HEIGHTS.h1,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: Platform.select({ ios: -0.5, android: -0.25, web: -0.5, default: 0 }),
  },
  h2: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.h2,
    lineHeight: LINE_HEIGHTS.h2,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: Platform.select({ ios: -0.25, android: -0.125, web: -0.25, default: 0 }),
  },
  h3: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.h3,
    lineHeight: LINE_HEIGHTS.h3,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: Platform.select({ ios: -0.125, android: 0, web: -0.125, default: 0 }),
  },
  h4: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.h4,
    lineHeight: LINE_HEIGHTS.h4,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0,
  },
  h5: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.h5,
    lineHeight: LINE_HEIGHTS.h5,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0,
  },
  h6: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.h6,
    lineHeight: LINE_HEIGHTS.h6,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.125,
  },

  // ========== TEXTES DE CONTENU ==========
  bodyLarge: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.bodyLarge,
    lineHeight: LINE_HEIGHTS.bodyLarge,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.bodyMedium,
    lineHeight: LINE_HEIGHTS.bodyMedium,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.bodySmall,
    lineHeight: LINE_HEIGHTS.bodySmall,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  },

  // ========== TEXTES UTILITAIRES ==========
  caption: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.25,
  },
  overline: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.overline,
    lineHeight: LINE_HEIGHTS.overline,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },

  // ========== TEXTES INTERACTIFS ==========
  button: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.button,
    lineHeight: LINE_HEIGHTS.button,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0.125,
  },
  buttonLarge: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.button + 2,
    lineHeight: LINE_HEIGHTS.button + 2,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0.125,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.button - 2,
    lineHeight: LINE_HEIGHTS.button - 2,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.25,
  },

  // ========== TEXTES DE FORMULAIRE ==========
  input: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.input,
    lineHeight: LINE_HEIGHTS.input,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  },
  label: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.label,
    lineHeight: LINE_HEIGHTS.label,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.125,
  },
  placeholder: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.input,
    lineHeight: LINE_HEIGHTS.input,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  },

  // ========== TEXTES DE NAVIGATION ==========
  tabBar: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.tabBar,
    lineHeight: LINE_HEIGHTS.tabBar,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.25,
  },
  navigationTitle: {
    fontFamily: FONT_FAMILIES.heading,
    fontSize: FONT_SIZES.navigationTitle,
    lineHeight: LINE_HEIGHTS.navigationTitle,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0,
  },

  // ========== TEXTES SPÉCIAUX VOYAGE ==========
  price: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.bodyMedium,
    lineHeight: LINE_HEIGHTS.bodyMedium,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0,
  },
  badge: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0.25,
  },
  stat: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.h4,
    lineHeight: LINE_HEIGHTS.h4,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.125,
  },
  statLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.25,
  },
};

// ========== HELPERS TYPOGRAPHIQUES ==========

export const getResponsiveFontSize = (baseSize: number, scale: number = 1): number => {
  return Math.round(baseSize * scale);
};

export const getLineHeight = (fontSize: number, ratio: number = 1.4): number => {
  return Math.round(fontSize * ratio);
};

export const getLetterSpacing = (fontSize: number, percentage: number = 0): number => {
  return fontSize * (percentage / 100);
};

// ========== VARIANTES CONTEXTUELLES ==========

export const TYPOGRAPHY_VARIANTS = {
  // Variantes pour différents contextes
  card: {
    title: {
      ...TYPOGRAPHY_STYLES.h5,
      fontWeight: FONT_WEIGHTS.semiBold,
    },
    subtitle: {
      ...TYPOGRAPHY_STYLES.bodySmall,
      fontWeight: FONT_WEIGHTS.regular,
    },
    content: {
      ...TYPOGRAPHY_STYLES.bodyMedium,
      fontWeight: FONT_WEIGHTS.regular,
    },
  },
  
  list: {
    title: {
      ...TYPOGRAPHY_STYLES.bodyMedium,
      fontWeight: FONT_WEIGHTS.medium,
    },
    subtitle: {
      ...TYPOGRAPHY_STYLES.bodySmall,
      fontWeight: FONT_WEIGHTS.regular,
    },
  },
  
  modal: {
    title: {
      ...TYPOGRAPHY_STYLES.h4,
      fontWeight: FONT_WEIGHTS.semiBold,
    },
    content: {
      ...TYPOGRAPHY_STYLES.bodyMedium,
      fontWeight: FONT_WEIGHTS.regular,
    },
  },
  
  toast: {
    title: {
      ...TYPOGRAPHY_STYLES.bodyMedium,
      fontWeight: FONT_WEIGHTS.semiBold,
    },
    message: {
      ...TYPOGRAPHY_STYLES.bodySmall,
      fontWeight: FONT_WEIGHTS.regular,
    },
  },
};

// ========== EXPORTS ==========

export const TYPOGRAPHY = {
  fonts: FONT_FAMILIES,
  weights: FONT_WEIGHTS,
  sizes: FONT_SIZES,
  lineHeights: LINE_HEIGHTS,
  styles: TYPOGRAPHY_STYLES,
  variants: TYPOGRAPHY_VARIANTS,
  helpers: {
    getResponsiveFontSize,
    getLineHeight,
    getLetterSpacing,
  },
};

export default TYPOGRAPHY; 