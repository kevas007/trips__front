// ========== COMPOSANT BUTTON UNIFIÉ TRIPSHARE ==========
// Bouton standardisé avec toutes les variantes et états

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getColorWithOpacity, getContrastColor } from '../../design-system/colors';
import { TYPOGRAPHY_STYLES, FONT_WEIGHTS } from '../../design-system/typography';
import { SPACING, CONTEXTUAL_SPACING } from '../../design-system/spacing';
import { SHADOWS } from '../../design-system/shadows';

// ========== TYPES ==========

export type ButtonVariant = 
  | 'primary'           // Bouton principal (teal)
  | 'secondary'         // Bouton secondaire (outline)
  | 'tertiary'          // Bouton tertiaire (ghost)
  | 'success'           // Bouton succès (vert)
  | 'warning'           // Bouton attention (orange)
  | 'error'             // Bouton erreur (rouge)
  | 'info'              // Bouton information (bleu)
  | 'travel'            // Bouton voyage (dégradé)
  | 'social'            // Bouton social (couleurs réseaux)
  | 'glassmorphism';    // Bouton glassmorphism

export type ButtonSize = 
  | 'xs'                // Très petit
  | 'sm'                // Petit
  | 'md'                // Moyen (défaut)
  | 'lg'                // Grand
  | 'xl';               // Très grand

export type ButtonShape = 
  | 'rounded'           // Coins arrondis (défaut)
  | 'pill'              // Pilule (très arrondi)
  | 'square'            // Carré
  | 'circle';           // Cercle (pour icônes)

export interface ButtonProps {
  // Contenu
  children?: React.ReactNode;
  title?: string;
  
  // Comportement
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Apparence
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  
  // Icônes
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconOnly?: boolean;
  
  // Couleurs personnalisées
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  
  // Styles
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Accessibilité
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Spécifique voyage
  travelType?: 'beach' | 'mountain' | 'city' | 'culture' | 'adventure' | 'romantic' | 'family';
  socialPlatform?: 'facebook' | 'google' | 'apple' | 'twitter' | 'instagram';
}

// ========== COMPOSANT PRINCIPAL ==========

export const Button: React.FC<ButtonProps> = ({
  children,
  title,
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  backgroundColor,
  textColor,
  borderColor,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  travelType,
  socialPlatform,
}) => {
  // ========== LOGIQUE DES COULEURS ==========
  
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    if (disabled) return COLORS.neutral[300];
    
    switch (variant) {
      case 'primary':
        return COLORS.primary[500];
      case 'secondary':
        return 'transparent';
      case 'tertiary':
        return 'transparent';
      case 'success':
        return COLORS.semantic.success;
      case 'warning':
        return COLORS.semantic.warning;
      case 'error':
        return COLORS.semantic.error;
      case 'info':
        return COLORS.semantic.info;
      case 'travel':
        return travelType ? COLORS.travel[travelType] : COLORS.primary[500];
      case 'social':
        return socialPlatform ? COLORS.social[socialPlatform] : COLORS.primary[500];
      case 'glassmorphism':
        return COLORS.glass.background.medium;
      default:
        return COLORS.primary[500];
    }
  };
  
  const getTextColor = (): string => {
    if (textColor) return textColor;
    if (disabled) return COLORS.neutral[500];
    
    const bgColor = getBackgroundColor();
    
    switch (variant) {
      case 'secondary':
        return COLORS.primary[500];
      case 'tertiary':
        return COLORS.neutral[700];
      case 'glassmorphism':
        return COLORS.neutral[900];
      default:
        return getContrastColor(bgColor);
    }
  };
  
  const getBorderColor = (): string => {
    if (borderColor) return borderColor;
    if (disabled) return COLORS.neutral[300];
    
    switch (variant) {
      case 'secondary':
        return COLORS.primary[500];
      case 'tertiary':
        return 'transparent';
      case 'glassmorphism':
        return COLORS.glass.border.medium;
      default:
        return 'transparent';
    }
  };
  
  // ========== LOGIQUE DES TAILLES ==========
  
  const getSizeStyles = () => {
    const baseSpacing = CONTEXTUAL_SPACING.button;
    
    switch (size) {
      case 'xs':
        return {
          paddingVertical: baseSpacing.paddingVertical * 0.5,
          paddingHorizontal: baseSpacing.paddingHorizontal * 0.6,
          minHeight: 32,
          iconSize: 14,
          fontSize: TYPOGRAPHY_STYLES.buttonSmall.fontSize,
        };
      case 'sm':
        return {
          paddingVertical: baseSpacing.paddingVertical * 0.75,
          paddingHorizontal: baseSpacing.paddingHorizontal * 0.8,
          minHeight: 36,
          iconSize: 16,
          fontSize: TYPOGRAPHY_STYLES.buttonSmall.fontSize,
        };
      case 'md':
        return {
          paddingVertical: baseSpacing.paddingVertical,
          paddingHorizontal: baseSpacing.paddingHorizontal,
          minHeight: 44,
          iconSize: 18,
          fontSize: TYPOGRAPHY_STYLES.button.fontSize,
        };
      case 'lg':
        return {
          paddingVertical: baseSpacing.paddingVertical * 1.25,
          paddingHorizontal: baseSpacing.paddingHorizontal * 1.2,
          minHeight: 52,
          iconSize: 20,
          fontSize: TYPOGRAPHY_STYLES.buttonLarge.fontSize,
        };
      case 'xl':
        return {
          paddingVertical: baseSpacing.paddingVertical * 1.5,
          paddingHorizontal: baseSpacing.paddingHorizontal * 1.4,
          minHeight: 60,
          iconSize: 24,
          fontSize: TYPOGRAPHY_STYLES.buttonLarge.fontSize + 2,
        };
      default:
        return {
          paddingVertical: baseSpacing.paddingVertical,
          paddingHorizontal: baseSpacing.paddingHorizontal,
          minHeight: 44,
          iconSize: 18,
          fontSize: TYPOGRAPHY_STYLES.button.fontSize,
        };
    }
  };
  
  // ========== LOGIQUE DES FORMES ==========
  
  const getShapeStyles = () => {
    const sizeStyles = getSizeStyles();
    
    switch (shape) {
      case 'pill':
        return {
          borderRadius: sizeStyles.minHeight / 2,
        };
      case 'square':
        return {
          borderRadius: 4,
        };
      case 'circle':
        return {
          borderRadius: sizeStyles.minHeight / 2,
          width: sizeStyles.minHeight,
          height: sizeStyles.minHeight,
          paddingHorizontal: 0,
        };
      case 'rounded':
      default:
        return {
          borderRadius: 12,
        };
    }
  };
  
  // ========== LOGIQUE DES OMBRES ==========
  
  const getShadowStyles = () => {
    if (disabled || variant === 'tertiary' || variant === 'secondary') {
      return {};
    }
    
    return variant === 'glassmorphism' ? SHADOWS.sm : SHADOWS.md;
  };
  
  // ========== STYLES CALCULÉS ==========
  
  const sizeStyles = getSizeStyles();
  const shapeStyles = getShapeStyles();
  const shadowStyles = getShadowStyles();
  
  const buttonStyles: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'secondary' ? 2 : variant === 'glassmorphism' ? 1 : 0,
    paddingVertical: iconOnly ? 0 : sizeStyles.paddingVertical,
    paddingHorizontal: iconOnly ? 0 : sizeStyles.paddingHorizontal,
    minHeight: sizeStyles.minHeight,
    ...shapeStyles,
    ...shadowStyles,
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.6 }),
  };
  
  const textStyles: TextStyle = {
    color: getTextColor(),
    fontSize: sizeStyles.fontSize,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: TYPOGRAPHY_STYLES.button.fontFamily,
    ...(iconOnly && { display: 'none' }),
  };
  
  // ========== RENDU DES ICÔNES ==========
  
  const renderIcon = (iconName: keyof typeof Ionicons.glyphMap, position: 'left' | 'right') => {
    if (!iconName) return null;
    
    return (
      <Ionicons
        name={iconName}
        size={sizeStyles.iconSize}
        color={getTextColor()}
        style={[
          position === 'left' && !iconOnly && { marginRight: SPACING.sm },
          position === 'right' && !iconOnly && { marginLeft: SPACING.sm },
        ]}
      />
    );
  };
  
  // ========== RENDU DU CONTENU ==========
  
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'xs' || size === 'sm' ? 'small' : 'small'}
          color={getTextColor()}
        />
      );
    }
    
    return (
      <>
        {leftIcon && renderIcon(leftIcon, 'left')}
        {(title || children) && (
          <Text style={[styles.text, textStyles, textStyle]}>
            {title || children}
          </Text>
        )}
        {rightIcon && renderIcon(rightIcon, 'right')}
      </>
    );
  };
  
  // ========== RENDU PRINCIPAL ==========
  
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyles, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// ========== STYLES DE BASE ==========

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
    
    // Styles web spécifiques
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s ease',
      
      // Pseudo-classes CSS
      ':hover': {
        transform: 'translateY(-1px)',
        opacity: 0.9,
      },
      
      ':active': {
        transform: 'translateY(0px)',
      },
      
      ':focus': {
        outline: `2px solid ${COLORS.primary[300]}`,
        outlineOffset: '2px',
      },
    }),
  },
  
  text: {
    textAlign: 'center',
    ...TYPOGRAPHY_STYLES.button,
  },
});

// ========== COMPOSANTS PRÉDÉFINIS ==========

export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const TertiaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="tertiary" />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="success" />
);

export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="warning" />
);

export const ErrorButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="error" />
);

export const InfoButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="info" />
);

export const TravelButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="travel" />
);

export const SocialButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="social" />
);

export const GlassmorphismButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="glassmorphism" />
);

// ========== BOUTONS SPÉCIALISÉS ==========

export const FloatingActionButton: React.FC<Omit<ButtonProps, 'shape' | 'size'>> = (props) => (
  <Button {...props} shape="circle" size="lg" />
);

export const IconButton: React.FC<Omit<ButtonProps, 'iconOnly'>> = (props) => (
  <Button {...props} iconOnly />
);

export const PillButton: React.FC<Omit<ButtonProps, 'shape'>> = (props) => (
  <Button {...props} shape="pill" />
);

// ========== EXPORT PAR DÉFAUT ==========

export default Button; 