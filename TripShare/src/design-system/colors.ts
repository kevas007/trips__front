// ========== SYSTÈME DE COULEURS UNIFIÉ TRIPSHARE ==========
// Palette cohérente basée sur Material Design 3 avec extensions voyage

export const COLORS = {
  // ========== COULEURS PRIMAIRES (TEAL) ==========
  primary: {
    50: '#E0F7F7',   // Très clair - backgrounds subtils
    100: '#B2DFDF',  // Clair - états hover
    200: '#80C7C7',  // Moyen clair - bordures actives
    300: '#4FB3B3',  // Moyen - éléments secondaires
    400: '#26A0A0',  // Moyen foncé - textes sur clair
    500: '#008080',  // Principal - boutons primaires, liens
    600: '#007373',  // Foncé - boutons hover
    700: '#005F5F',  // Très foncé - textes sur foncé
    800: '#004F4F',  // Ultra foncé - mode sombre
    900: '#002020',  // Noir teal - textes importants
  },

  // ========== COULEURS SECONDAIRES (VOYAGE) ==========
  secondary: {
    50: '#FFF8E1',   // Crème voyage
    100: '#FFECB3',  // Sable clair
    200: '#FFE082',  // Soleil doux
    300: '#FFD54F',  // Soleil moyen
    400: '#FFCA28',  // Soleil vif
    500: '#FFC107',  // Ambre voyage - accents
    600: '#FFB300',  // Ambre foncé
    700: '#FF8F00',  // Orange voyage
    800: '#FF6F00',  // Orange intense
    900: '#E65100',  // Orange foncé
  },

  // ========== COULEURS TERTIAIRES (AVENTURE) ==========
  tertiary: {
    50: '#E8F5E8',   // Vert nature clair
    100: '#C8E6C8',  // Vert doux
    200: '#A5D6A5',  // Vert moyen
    300: '#81C784',  // Vert aventure
    400: '#66BB6A',  // Vert vif
    500: '#4CAF50',  // Vert succès
    600: '#43A047',  // Vert foncé
    700: '#388E3C',  // Vert forêt
    800: '#2E7D32',  // Vert profond
    900: '#1B5E20',  // Vert sombre
  },

  // ========== COULEURS SÉMANTIQUES ==========
  semantic: {
    success: '#4CAF50',    // Vert confirmation
    warning: '#FF9800',    // Orange attention
    error: '#F44336',      // Rouge erreur
    info: '#2196F3',       // Bleu information
    // Variantes pour différents contextes
    successLight: '#E8F5E8',
    warningLight: '#FFF3E0',
    errorLight: '#FFEBEE',
    infoLight: '#E3F2FD',
  },

  // ========== COULEURS NEUTRES ==========
  neutral: {
    0: '#FFFFFF',     // Blanc pur
    50: '#FAFAFA',    // Blanc cassé - background principal
    100: '#F5F5F5',   // Gris très clair - backgrounds
    200: '#EEEEEE',   // Gris clair - bordures
    300: '#E0E0E0',   // Gris moyen - séparateurs
    400: '#BDBDBD',   // Gris - textes désactivés
    500: '#9E9E9E',   // Gris moyen - textes secondaires
    600: '#757575',   // Gris foncé - textes
    700: '#616161',   // Gris très foncé - textes
    800: '#424242',   // Presque noir - textes importants
    900: '#212121',   // Noir - textes principaux
    1000: '#000000',  // Noir pur
  },

  // ========== COULEURS GLASSMORPHISM ==========
  glass: {
    // Effets de transparence pour les cartes modernes
    background: {
      light: 'rgba(255, 255, 255, 0.85)',
      medium: 'rgba(255, 255, 255, 0.75)',
      strong: 'rgba(255, 255, 255, 0.65)',
      dark: 'rgba(28, 27, 31, 0.85)',
    },
    border: {
      light: 'rgba(0, 128, 128, 0.15)',
      medium: 'rgba(0, 128, 128, 0.25)',
      strong: 'rgba(0, 128, 128, 0.35)',
    },
    shadow: {
      light: 'rgba(0, 128, 128, 0.08)',
      medium: 'rgba(0, 128, 128, 0.12)',
      strong: 'rgba(0, 128, 128, 0.18)',
    },
  },

  // ========== COULEURS VOYAGE SPÉCIFIQUES ==========
  travel: {
    // Couleurs thématiques pour les types de voyage
    beach: '#00BCD4',        // Cyan plage
    mountain: '#795548',     // Brun montagne
    city: '#607D8B',         // Gris bleu urbain
    culture: '#9C27B0',      // Violet culture
    adventure: '#FF5722',    // Rouge orange aventure
    romantic: '#E91E63',     // Rose romantique
    family: '#4CAF50',       // Vert famille
    business: '#37474F',     // Gris business
    luxury: '#FFD700',       // Or luxe
    budget: '#8BC34A',       // Vert clair budget
  },

  // ========== COULEURS DÉGRADÉS ==========
  gradients: {
    primary: ['#008080', '#4FB3B3'],
    secondary: ['#FFC107', '#FF8F00'],
    success: ['#4CAF50', '#81C784'],
    sunset: ['#FF8A65', '#FFB74D'],
    ocean: ['#00BCD4', '#4FC3F7'],
    forest: ['#66BB6A', '#A5D6A5'],
    royal: ['#7B1FA2', '#BA68C8'],
  },

  // ========== COULEURS ACCESSIBILITÉ ==========
  accessibility: {
    // Couleurs avec contraste WCAG AA minimum
    focusRing: '#2196F3',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    textOnDark: '#FFFFFF',
    textOnLight: '#212121',
    linkDefault: '#1976D2',
    linkVisited: '#7B1FA2',
    linkHover: '#0D47A1',
  },

  // ========== COULEURS RÉSEAUX SOCIAUX ==========
  social: {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    google: '#EA4335',
    apple: '#000000',
    whatsapp: '#25D366',
    telegram: '#0088CC',
  },
};

// ========== HELPERS POUR LES COULEURS ==========

export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convertir hex en rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getContrastColor = (backgroundColor: string): string => {
  // Calculer si le texte doit être blanc ou noir selon le background
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? COLORS.neutral[900] : COLORS.neutral[0];
};

// ========== THÈMES PRÉDÉFINIS ==========

export const THEME_COLORS = {
  light: {
    background: COLORS.neutral[50],
    surface: COLORS.neutral[0],
    primary: COLORS.primary[500],
    secondary: COLORS.secondary[500],
    text: COLORS.neutral[900],
    textSecondary: COLORS.neutral[600],
    border: COLORS.neutral[200],
    shadow: COLORS.neutral[900],
  },
  dark: {
    background: COLORS.neutral[900],
    surface: COLORS.neutral[800],
    primary: COLORS.primary[300],
    secondary: COLORS.secondary[300],
    text: COLORS.neutral[50],
    textSecondary: COLORS.neutral[400],
    border: COLORS.neutral[700],
    shadow: COLORS.neutral[1000],
  },
};

// ========== EXPORTS ==========

export default COLORS;

// Export des couleurs legacy pour compatibilité
export const PRIMARY_COLOR = COLORS.primary[500];
export const SECONDARY_COLOR = COLORS.secondary[500];
export const SUCCESS_COLOR = COLORS.semantic.success;
export const WARNING_COLOR = COLORS.semantic.warning;
export const ERROR_COLOR = COLORS.semantic.error;
export const INFO_COLOR = COLORS.semantic.info; 