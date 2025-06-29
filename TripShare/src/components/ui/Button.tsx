import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, SPACING } from '../../design-system';
import { getFontSize, getSpacing, getBorderRadius, getInputHeight } from '../../utils/responsive';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
}) => {
  const getBgColor = () => {
    if (variant === 'primary') return "#008080"; // Material 3 Teal
    if (variant === 'secondary') return COLORS.secondary[500];
    if (variant === 'destructive') return COLORS.error;
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    return "#008080"; // Material 3 Teal
  };
  const getTextColor = () => {
    if (variant === 'primary' || variant === 'secondary' || variant === 'destructive') return '#fff';
    if (variant === 'outline') return "#008080"; // Material 3 Teal
    if (variant === 'ghost') return COLORS.secondary[500];
    return '#fff';
  };
  const getBorder = () => {
    if (variant === 'outline') return { borderWidth: 2, borderColor: "#008080" }; // Material 3 Teal
    if (variant === 'ghost') return { borderWidth: 0 };
    return { borderWidth: 0 };
  };
  const getPadding = () => {
    if (size === 'sm') return { paddingVertical: getSpacing(8), paddingHorizontal: getSpacing(16) };
    if (size === 'lg') return { paddingVertical: getSpacing(16), paddingHorizontal: getSpacing(32) };
    return { paddingVertical: getSpacing(12), paddingHorizontal: getSpacing(24) };
  };
  
  const getButtonHeight = () => {
    if (size === 'sm') return Platform.OS === 'web' ? 36 : getInputHeight() - 8;
    if (size === 'lg') return Platform.OS === 'web' ? 56 : getInputHeight() + 8;
    return Platform.OS === 'web' ? 44 : getInputHeight();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBgColor(), 
          borderRadius: getBorderRadius(BORDER_RADIUS.lg),
          minHeight: getButtonHeight(),
        },
        getBorder(),
        getPadding(),
        fullWidth && { width: '100%' },
        disabled && { opacity: 0.6 },
        (variant === 'primary' || variant === 'secondary') && SHADOWS.md,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize(15), fontWeight: '600' as const }]}> {children} </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 6,
  },
  text: {
    textAlign: 'center',
  },
});

export default Button; 