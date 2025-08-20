// ========== SYSTÈME DE CARTES UNIFIÉ TRIPSHARE ==========
// Cartes réutilisables avec toutes les variantes et états

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getColorWithOpacity } from '../../design-system/colors';
import { TYPOGRAPHY_STYLES, FONT_WEIGHTS } from '../../design-system/typography';
import { SPACING, CONTEXTUAL_SPACING, TRAVEL_SPACING } from '../../design-system/spacing';
import { SHADOWS } from '../../design-system/shadows';

// ========== TYPES ==========

export type CardVariant = 
  | 'default'           // Carte standard
  | 'elevated'          // Carte surélevée
  | 'outlined'          // Carte avec bordure
  | 'filled'            // Carte avec fond coloré
  | 'glassmorphism'     // Effet verre
  | 'travel'            // Carte voyage
  | 'social'            // Carte sociale
  | 'stat'              // Carte statistique
  | 'feature';          // Carte mise en avant

export type CardSize = 
  | 'sm'                // Petite
  | 'md'                // Moyenne (défaut)
  | 'lg'                // Grande
  | 'xl';               // Très grande

export type CardLayout = 
  | 'vertical'          // Layout vertical (défaut)
  | 'horizontal'        // Layout horizontal
  | 'media'             // Avec média en haut
  | 'avatar'            // Avec avatar
  | 'icon';             // Avec icône

export interface CardProps {
  // Contenu
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  
  // Média
  image?: string | { uri: string };
  imageStyle?: ImageStyle;
  avatar?: string | { uri: string };
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconSize?: number;
  
  // Apparence
  variant?: CardVariant;
  size?: CardSize;
  layout?: CardLayout;
  
  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  
  // Actions
  actions?: CardAction[];
  
  // Badges et indicateurs
  badge?: string;
  badgeColor?: string;
  status?: 'active' | 'inactive' | 'pending' | 'completed';
  
  // Styles
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  
  // Voyage spécifique
  travelType?: 'beach' | 'mountain' | 'city' | 'culture' | 'adventure' | 'romantic' | 'family';
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: number;
  price?: string;
  duration?: string;
  
  // Social spécifique
  likes?: number;
  comments?: number;
  shares?: number;
  verified?: boolean;
  
  // Accessibilité
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export interface CardAction {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

// ========== COMPOSANT PRINCIPAL ==========

export const Card: React.FC<CardProps> = ({
  // Contenu
  title,
  subtitle,
  description,
  children,
  
  // Média
  image,
  imageStyle,
  avatar,
  icon,
  iconColor,
  iconSize,
  
  // Apparence
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  
  // Interaction
  onPress,
  onLongPress,
  disabled = false,
  
  // Actions
  actions,
  
  // Badges et indicateurs
  badge,
  badgeColor,
  status,
  
  // Styles
  style,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  
  // Voyage spécifique
  travelType,
  difficulty,
  rating,
  price,
  duration,
  
  // Social spécifique
  likes,
  comments,
  shares,
  verified,
  
  // Accessibilité
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  // ========== LOGIQUE DES COULEURS ==========
  
  const getColors = () => {
    switch (variant) {
      case 'elevated':
        return {
          background: COLORS.neutral[0],
          border: 'transparent',
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
        };
      case 'outlined':
        return {
          background: 'transparent',
          border: COLORS.neutral[200],
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
        };
      case 'filled':
        return {
          background: COLORS.neutral[50],
          border: 'transparent',
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
        };
      case 'glassmorphism':
        return {
          background: COLORS.glass.background.medium,
          border: COLORS.glass.border.light,
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[700],
        };
      case 'travel':
        const travelColor = travelType ? COLORS.travel[travelType] : COLORS.primary[500];
        return {
          background: COLORS.neutral[0],
          border: getColorWithOpacity(travelColor, 0.2),
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
          accent: travelColor,
        };
      case 'social':
        return {
          background: COLORS.neutral[0],
          border: COLORS.neutral[100],
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
          accent: COLORS.primary[500],
        };
      case 'stat':
        return {
          background: COLORS.neutral[0],
          border: 'transparent',
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
          accent: COLORS.primary[500],
        };
      case 'feature':
        return {
          background: COLORS.primary[50],
          border: COLORS.primary[200],
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
          accent: COLORS.primary[500],
        };
      case 'default':
      default:
        return {
          background: COLORS.neutral[0],
          border: COLORS.neutral[200],
          text: COLORS.neutral[900],
          textSecondary: COLORS.neutral[600],
        };
    }
  };
  
  // ========== LOGIQUE DES TAILLES ==========
  
  const getSizeStyles = () => {
    const baseSpacing = CONTEXTUAL_SPACING.card;
    
    switch (size) {
      case 'sm':
        return {
          padding: baseSpacing.padding * 0.75,
          borderRadius: baseSpacing.borderRadius * 0.75,
          minHeight: 80,
          titleSize: TYPOGRAPHY_STYLES.h6.fontSize,
          subtitleSize: TYPOGRAPHY_STYLES.bodySmall.fontSize,
          descriptionSize: TYPOGRAPHY_STYLES.caption.fontSize,
        };
      case 'lg':
        return {
          padding: baseSpacing.padding * 1.25,
          borderRadius: baseSpacing.borderRadius * 1.25,
          minHeight: 160,
          titleSize: TYPOGRAPHY_STYLES.h4.fontSize,
          subtitleSize: TYPOGRAPHY_STYLES.bodyMedium.fontSize,
          descriptionSize: TYPOGRAPHY_STYLES.bodySmall.fontSize,
        };
      case 'xl':
        return {
          padding: baseSpacing.padding * 1.5,
          borderRadius: baseSpacing.borderRadius * 1.5,
          minHeight: 200,
          titleSize: TYPOGRAPHY_STYLES.h3.fontSize,
          subtitleSize: TYPOGRAPHY_STYLES.bodyLarge.fontSize,
          descriptionSize: TYPOGRAPHY_STYLES.bodyMedium.fontSize,
        };
      case 'md':
      default:
        return {
          padding: baseSpacing.padding,
          borderRadius: baseSpacing.borderRadius,
          minHeight: 120,
          titleSize: TYPOGRAPHY_STYLES.h5.fontSize,
          subtitleSize: TYPOGRAPHY_STYLES.bodyMedium.fontSize,
          descriptionSize: TYPOGRAPHY_STYLES.bodySmall.fontSize,
        };
    }
  };
  
  // ========== LOGIQUE DES VARIANTES ==========
  
  const getVariantStyles = () => {
    const colors = getColors();
    const sizeStyles = getSizeStyles();
    
    const baseStyles = {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: colors.border === 'transparent' ? 0 : 1,
      borderRadius: sizeStyles.borderRadius,
      padding: sizeStyles.padding,
      minHeight: sizeStyles.minHeight,
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          ...SHADOWS.md,
        };
      case 'glassmorphism':
        return {
          ...baseStyles,
          ...SHADOWS.sm,
        };
      case 'travel':
      case 'social':
        return {
          ...baseStyles,
          ...SHADOWS.sm,
        };
      case 'stat':
        return {
          ...baseStyles,
          ...SHADOWS.lg,
        };
      case 'feature':
        return {
          ...baseStyles,
          ...SHADOWS.md,
        };
      default:
        return baseStyles;
    }
  };
  
  // ========== RENDU DU MÉDIA ==========
  
  const renderMedia = () => {
    if (image) {
      return (
        <View style={[
          styles.mediaContainer,
          layout === 'media' && styles.mediaTop,
          layout === 'horizontal' && styles.mediaHorizontal,
        ]}>
          <Image
            source={typeof image === 'string' ? { uri: image } : image}
            style={[
              styles.image,
              layout === 'horizontal' && styles.imageHorizontal,
              imageStyle,
            ]}
            resizeMode="cover"
          />
        </View>
      );
    }
    
    if (avatar) {
      return (
        <View style={styles.avatarContainer}>
          <Image
            source={typeof avatar === 'string' ? { uri: avatar } : avatar}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
      );
    }
    
    if (icon) {
      const colors = getColors();
      return (
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={iconSize || 24}
            color={iconColor || colors.accent || COLORS.primary[500]}
          />
        </View>
      );
    }
    
    return null;
  };
  
  // ========== RENDU DU BADGE ==========
  
  const renderBadge = () => {
    if (!badge) return null;
    
    return (
      <View style={[
        styles.badge,
        { backgroundColor: badgeColor || COLORS.primary[500] },
      ]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    );
  };
  
  // ========== RENDU DU STATUS ==========
  
  const renderStatus = () => {
    if (!status) return null;
    
    const statusColors = {
      active: COLORS.semantic.success,
      inactive: COLORS.neutral[400],
      pending: COLORS.semantic.warning,
      completed: COLORS.semantic.success,
    };
    
    return (
      <View style={[
        styles.statusIndicator,
        { backgroundColor: statusColors[status] },
      ]} />
    );
  };
  
  // ========== RENDU DES MÉTADONNÉES VOYAGE ==========
  
  const renderTravelMeta = () => {
    if (variant !== 'travel') return null;
    
    return (
      <View style={styles.travelMeta}>
        {duration && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.metaText}>{duration}</Text>
          </View>
        )}
        {price && (
          <View style={styles.metaItem}>
            <Ionicons name="wallet-outline" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.metaText}>{price}</Text>
          </View>
        )}
        {difficulty && (
          <View style={styles.metaItem}>
            <Ionicons name="fitness-outline" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.metaText}>{difficulty}</Text>
          </View>
        )}
        {rating && (
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={COLORS.secondary[500]} />
            <Text style={styles.metaText}>{rating}/5</Text>
          </View>
        )}
      </View>
    );
  };
  
  // ========== RENDU DES MÉTADONNÉES SOCIALES ==========
  
  const renderSocialMeta = () => {
    if (variant !== 'social') return null;
    
    return (
      <View style={styles.socialMeta}>
        {likes !== undefined && (
          <View style={styles.metaItem}>
            <Ionicons name="heart-outline" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.metaText}>{likes}</Text>
          </View>
        )}
        {comments !== undefined && (
          <View style={styles.metaItem}>
            <Ionicons name="chatbubble-outline" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.metaText}>{comments}</Text>
          </View>
        )}
        {shares !== undefined && (
          <View style={styles.metaItem}>
            <Ionicons name="share-outline" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.metaText}>{shares}</Text>
          </View>
        )}
      </View>
    );
  };
  
  // ========== RENDU DES ACTIONS ==========
  
  const renderActions = () => {
    if (!actions || actions.length === 0) return null;
    
    return (
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              action.disabled && styles.actionDisabled,
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
          >
            <Ionicons
              name={action.icon}
              size={18}
              color={action.color || COLORS.neutral[600]}
            />
            {action.label && (
              <Text style={[
                styles.actionLabel,
                { color: action.color || COLORS.neutral[600] },
              ]}>
                {action.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // ========== RENDU DU CONTENU ==========
  
  const renderContent = () => {
    const colors = getColors();
    const sizeStyles = getSizeStyles();
    
    return (
      <View style={[
        styles.content,
        layout === 'horizontal' && styles.contentHorizontal,
      ]}>
        <View style={styles.header}>
          {title && (
            <View style={styles.titleContainer}>
              <Text style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: sizeStyles.titleSize,
                },
                titleStyle,
              ]}>
                {title}
              </Text>
              {verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.primary[500]}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
          )}
          
          {subtitle && (
            <Text style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: sizeStyles.subtitleSize,
              },
              subtitleStyle,
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {description && (
          <Text style={[
            styles.description,
            {
              color: colors.textSecondary,
              fontSize: sizeStyles.descriptionSize,
            },
            descriptionStyle,
          ]}>
            {description}
          </Text>
        )}
        
        {children}
        
        {renderTravelMeta()}
        {renderSocialMeta()}
        {renderActions()}
      </View>
    );
  };
  
  // ========== STYLES CALCULÉS ==========
  
  const variantStyles = getVariantStyles();
  const colors = getColors();
  
  const containerStyles: ViewStyle = {
    ...variantStyles,
    ...(disabled && { opacity: 0.6 }),
    ...(layout === 'horizontal' && { flexDirection: 'row' }),
  };
  
  // ========== RENDU PRINCIPAL ==========
  
  const CardContent = (
    <View style={[styles.container, containerStyles, style]}>
      {renderBadge()}
      {renderStatus()}
      
      {layout === 'media' && renderMedia()}
      
      <View style={[
        styles.body,
        layout === 'horizontal' && styles.bodyHorizontal,
      ]}>
        {(layout === 'avatar' || layout === 'icon') && renderMedia()}
        {renderContent()}
      </View>
      
      {layout === 'horizontal' && renderMedia()}
    </View>
  );
  
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        testID={testID}
        style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }
  
  return CardContent;
};

// ========== STYLES ==========

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: SPACING.sm,
  },
  
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  
  badgeText: {
    ...TYPOGRAPHY_STYLES.caption,
    color: COLORS.neutral[0],
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  
  statusIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  
  mediaContainer: {
    overflow: 'hidden',
  },
  
  mediaTop: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  mediaHorizontal: {
    width: 100,
    height: '100%',
  },
  
  image: {
    width: '100%',
    height: 200,
  },
  
  imageHorizontal: {
    width: 100,
    height: 100,
  },
  
  avatarContainer: {
    marginRight: SPACING.md,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  iconContainer: {
    marginRight: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  body: {
    flex: 1,
  },
  
  bodyHorizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  content: {
    flex: 1,
  },
  
  contentHorizontal: {
    flex: 1,
  },
  
  header: {
    marginBottom: SPACING.sm,
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  
  title: {
    ...TYPOGRAPHY_STYLES.h5,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  
  subtitle: {
    ...TYPOGRAPHY_STYLES.bodyMedium,
    fontWeight: FONT_WEIGHTS.medium,
  },
  
  description: {
    ...TYPOGRAPHY_STYLES.bodySmall,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  
  travelMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  
  socialMeta: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  
  metaText: {
    ...TYPOGRAPHY_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.neutral[600],
  },
  
  actionsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[50],
  },
  
  actionDisabled: {
    opacity: 0.5,
  },
  
  actionLabel: {
    ...TYPOGRAPHY_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

// ========== COMPOSANTS PRÉDÉFINIS ==========

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

export const FilledCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="filled" />
);

export const GlassmorphismCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="glassmorphism" />
);

export const TravelCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="travel" />
);

export const SocialCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="social" />
);

export const StatCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="stat" />
);

export const FeatureCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="feature" />
);

// ========== EXPORT PAR DÉFAUT ==========

export default Card; 