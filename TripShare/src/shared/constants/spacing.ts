export const spacing = {
  // Espacements de base (en pixels)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Espacements spécifiques
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  
  // Espacements de navigation
  headerHeight: 56,
  tabBarHeight: 80,
  bottomSheetHandleHeight: 24,
  
  // Espacements de contenu
  contentMargin: 16,
  sectionSpacing: 24,
  itemSpacing: 12,
  
  // Espacements de bordure
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  // Espacements d'ombre
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowRadius: 8,
  elevation: 4,
} as const;

export type SpacingKey = keyof typeof spacing;
