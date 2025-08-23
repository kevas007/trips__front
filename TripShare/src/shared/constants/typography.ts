export const typography = {
  // Tailles de police
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  
  // Poids de police
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Hauteurs de ligne
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Styles de texte prédéfinis
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 1.2,
    },
  },
} as const;

export type TypographyKey = keyof typeof typography;
