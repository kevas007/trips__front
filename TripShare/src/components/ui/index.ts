// ========== INDEX DES COMPOSANTS UI TRIPSHARE ==========
// Export centralisé de tous les composants d'interface utilisateur harmonisés

// ========== SYSTÈME DE DESIGN ==========
export * from '../../design-system/colors';
export * from '../../design-system/typography';
export * from '../../design-system/spacing';
export * from '../../design-system/shadows';

// ========== COMPOSANTS PRINCIPAUX ==========

// Boutons
export { default as Button } from './Button';
export {
  Button as UnifiedButton,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  SuccessButton,
  WarningButton,
  ErrorButton,
  InfoButton,
  TravelButton,
  SocialButton,
  GlassmorphismButton,
  FloatingActionButton,
  IconButton,
  PillButton,
} from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape } from './Button';

// Champs de saisie
export { default as Input } from './Input';
export {
  Input as UnifiedInput,
  FilledInput,
  OutlinedInput,
  UnderlinedInput,
  SearchInput,
  AuthInput,
  GlassmorphismInput,
  PasswordInput,
} from './Input';
export type { InputProps, InputVariant, InputSize, InputState, InputRef } from './Input';

// Cartes
export { default as Card } from './Card';
export {
  Card as UnifiedCard,
  ElevatedCard,
  OutlinedCard,
  FilledCard,
  GlassmorphismCard,
  TravelCard,
  SocialCard,
  StatCard,
  FeatureCard,
} from './Card';
export type { CardProps, CardVariant, CardSize, CardLayout, CardAction } from './Card';

// ========== COMPOSANTS EXISTANTS (COMPATIBILITÉ) ==========

// Réexport des composants existants pour compatibilité
export { default as AppLogo } from './AppLogo';
export { default as CountryPickerModal } from './CountryPickerModal';
export { default as ErrorHandler } from './ErrorHandler';
export { default as FloatingActionButton as FAB } from './FloatingActionButton';
export { default as OptimizedImage } from './OptimizedImage';
export { default as QuickCreateButton } from './QuickCreateButton';

// ========== TYPES UTILITAIRES ==========

// Types pour les variantes communes
export type CommonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type CommonSize = 'sm' | 'md' | 'lg';
export type CommonState = 'default' | 'focused' | 'disabled' | 'loading';

// Types pour les couleurs
export type ColorVariant = 'primary' | 'secondary' | 'tertiary' | 'semantic' | 'neutral' | 'travel' | 'social';
export type TravelType = 'beach' | 'mountain' | 'city' | 'culture' | 'adventure' | 'romantic' | 'family';
export type SocialPlatform = 'facebook' | 'google' | 'apple' | 'twitter' | 'instagram';

// ========== CONSTANTES UTILES ==========

// Constantes pour les développeurs
export const UI_CONSTANTS = {
  // Tailles communes
  SIZES: {
    SMALL: 'sm' as const,
    MEDIUM: 'md' as const,
    LARGE: 'lg' as const,
  },
  
  // Variantes communes
  VARIANTS: {
    PRIMARY: 'primary' as const,
    SECONDARY: 'secondary' as const,
    SUCCESS: 'success' as const,
    WARNING: 'warning' as const,
    ERROR: 'error' as const,
    INFO: 'info' as const,
  },
  
  // Types de voyage
  TRAVEL_TYPES: {
    BEACH: 'beach' as const,
    MOUNTAIN: 'mountain' as const,
    CITY: 'city' as const,
    CULTURE: 'culture' as const,
    ADVENTURE: 'adventure' as const,
    ROMANTIC: 'romantic' as const,
    FAMILY: 'family' as const,
  },
  
  // Plateformes sociales
  SOCIAL_PLATFORMS: {
    FACEBOOK: 'facebook' as const,
    GOOGLE: 'google' as const,
    APPLE: 'apple' as const,
    TWITTER: 'twitter' as const,
    INSTAGRAM: 'instagram' as const,
  },
} as const;

// ========== HELPERS POUR DÉVELOPPEURS ==========

// Helper pour créer des styles cohérents
export const createComponentStyles = (theme: 'light' | 'dark' = 'light') => {
  const colors = theme === 'light' ? 
    {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      primary: '#008080',
      text: '#212121',
      textSecondary: '#757575',
    } : 
    {
      background: '#1C1B1F',
      surface: '#1C1B1F',
      primary: '#4FB3B3',
      text: '#E6E1E5',
      textSecondary: '#9E9E9E',
    };
  
  return colors;
};

// Helper pour valider les props
export const validateUIProps = (componentName: string, props: Record<string, any>) => {
  const warnings: string[] = [];
  
  // Vérifications communes
  if (props.variant && !Object.values(UI_CONSTANTS.VARIANTS).includes(props.variant)) {
    warnings.push(`${componentName}: variant "${props.variant}" is not recognized`);
  }
  
  if (props.size && !Object.values(UI_CONSTANTS.SIZES).includes(props.size)) {
    warnings.push(`${componentName}: size "${props.size}" is not recognized`);
  }
  
  // Afficher les warnings en développement
  if (__DEV__ && warnings.length > 0) {
    console.warn(`UI Component Warnings:\n${warnings.join('\n')}`);
  }
  
  return warnings.length === 0;
};

// ========== DOCUMENTATION ==========

/**
 * Guide d'utilisation des composants UI TripShare
 * 
 * @example
 * // Import des composants
 * import { Button, Input, Card, COLORS } from '../components/ui';
 * 
 * // Utilisation basique
 * <Button variant="primary" onPress={() => {}}>
 *   Cliquez-moi
 * </Button>
 * 
 * <Input
 *   label="Email"
 *   variant="outlined"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 * 
 * <Card
 *   variant="travel"
 *   title="Paris"
 *   description="Ville lumière"
 *   onPress={() => {}}
 * />
 * 
 * @see COMPONENT_LIBRARY_GUIDE.md pour la documentation complète
 */

// ========== EXPORT PAR DÉFAUT ==========

// Export d'un objet contenant tous les composants pour usage avancé
export default {
  // Composants
  Button,
  Input,
  Card,
  
  // Variantes
  PrimaryButton,
  SecondaryButton,
  AuthInput,
  SearchInput,
  TravelCard,
  SocialCard,
  
  // Constantes
  UI_CONSTANTS,
  
  // Helpers
  createComponentStyles,
    validateUIProps,
}; 