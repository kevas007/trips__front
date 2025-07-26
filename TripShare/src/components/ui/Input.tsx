// ========== COMPOSANT INPUT UNIFIÉ TRIPSHARE ==========
// Champ de saisie standardisé avec toutes les variantes et états

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getColorWithOpacity } from '../../design-system/colors';
import { TYPOGRAPHY_STYLES, FONT_WEIGHTS } from '../../design-system/typography';
import { SPACING, CONTEXTUAL_SPACING } from '../../design-system/spacing';
import { SHADOWS } from '../../design-system/shadows';

// ========== TYPES ==========

export type InputVariant = 
  | 'default'           // Standard
  | 'filled'            // Fond coloré
  | 'outlined'          // Bordure
  | 'underlined'        // Ligne en bas
  | 'glassmorphism'     // Effet verre
  | 'search'            // Recherche
  | 'auth';             // Authentification

export type InputSize = 
  | 'sm'                // Petit
  | 'md'                // Moyen (défaut)
  | 'lg';               // Grand

export type InputState = 
  | 'default'           // Normal
  | 'focused'           // Focus
  | 'error'             // Erreur
  | 'success'           // Succès
  | 'disabled';         // Désactivé

export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Contenu
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  
  // Apparence
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  
  // Icônes
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  
  // États
  error?: boolean;
  success?: boolean;
  loading?: boolean;
  
  // Fonctionnalités spéciales
  showPasswordToggle?: boolean;
  clearable?: boolean;
  
  // Styles
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Validation
  required?: boolean;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean | string;
  };
  
  // Callbacks
  onValidation?: (isValid: boolean, message?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Accessibilité
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  validate: () => boolean;
}

// ========== COMPOSANT PRINCIPAL ==========

export const Input = forwardRef<InputRef, InputProps>(({
  // Contenu
  label,
  placeholder,
  helperText,
  errorText,
  successText,
  
  // Apparence
  variant = 'default',
  size = 'md',
  fullWidth = true,
  
  // Icônes
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  
  // États
  error = false,
  success = false,
  loading = false,
  disabled = false,
  
  // Fonctionnalités spéciales
  showPasswordToggle = false,
  clearable = false,
  
  // Styles
  style,
  inputStyle,
  labelStyle,
  
  // Validation
  required = false,
  validationRules,
  
  // Callbacks
  onValidation,
  onFocus,
  onBlur,
  onChangeText,
  
  // Props TextInput
  value,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  multiline,
  numberOfLines,
  maxLength,
  
  // Accessibilité
  accessibilityLabel,
  accessibilityHint,
  testID,
  
  ...textInputProps
}, ref) => {
  // ========== ÉTAT LOCAL ==========
  
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState(true);
  
  // Refs
  const inputRef = useRef<TextInput>(null);
  const focusAnimation = useRef(new Animated.Value(0)).current;
  
  // ========== LOGIQUE DE VALIDATION ==========
  
  const validateInput = (inputValue: string): { isValid: boolean; message: string } => {
    if (required && !inputValue.trim()) {
      return { isValid: false, message: 'Ce champ est requis' };
    }
    
    if (validationRules?.minLength && inputValue.length < validationRules.minLength) {
      return { isValid: false, message: `Minimum ${validationRules.minLength} caractères` };
    }
    
    if (validationRules?.maxLength && inputValue.length > validationRules.maxLength) {
      return { isValid: false, message: `Maximum ${validationRules.maxLength} caractères` };
    }
    
    if (validationRules?.pattern && !validationRules.pattern.test(inputValue)) {
      return { isValid: false, message: 'Format invalide' };
    }
    
    if (validationRules?.custom) {
      const customResult = validationRules.custom(inputValue);
      if (typeof customResult === 'string') {
        return { isValid: false, message: customResult };
      }
      if (!customResult) {
        return { isValid: false, message: 'Valeur invalide' };
      }
    }
    
    return { isValid: true, message: '' };
  };
  
  // ========== EFFETS ==========
  
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  useEffect(() => {
    const validation = validateInput(internalValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
    onValidation?.(validation.isValid, validation.message);
  }, [internalValue, validationRules, required]);
  
  // ========== LOGIQUE DES COULEURS ==========
  
  const getInputState = (): InputState => {
    if (disabled) return 'disabled';
    if (error || (!isValid && internalValue)) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  };
  
  const getColors = () => {
    const state = getInputState();
    
    switch (state) {
      case 'focused':
        return {
          border: COLORS.primary[500],
          background: variant === 'filled' ? COLORS.primary[50] : COLORS.neutral[0],
          text: COLORS.neutral[900],
          placeholder: COLORS.neutral[400],
          icon: COLORS.primary[500],
        };
      case 'error':
        return {
          border: COLORS.semantic.error,
          background: variant === 'filled' ? COLORS.semantic.errorLight : COLORS.neutral[0],
          text: COLORS.neutral[900],
          placeholder: COLORS.neutral[400],
          icon: COLORS.semantic.error,
        };
      case 'success':
        return {
          border: COLORS.semantic.success,
          background: variant === 'filled' ? COLORS.semantic.successLight : COLORS.neutral[0],
          text: COLORS.neutral[900],
          placeholder: COLORS.neutral[400],
          icon: COLORS.semantic.success,
        };
      case 'disabled':
        return {
          border: COLORS.neutral[200],
          background: COLORS.neutral[100],
          text: COLORS.neutral[400],
          placeholder: COLORS.neutral[300],
          icon: COLORS.neutral[300],
        };
      default:
        return {
          border: COLORS.neutral[300],
          background: variant === 'filled' ? COLORS.neutral[50] : COLORS.neutral[0],
          text: COLORS.neutral[900],
          placeholder: COLORS.neutral[500],
          icon: COLORS.neutral[600],
        };
    }
  };
  
  // ========== LOGIQUE DES TAILLES ==========
  
  const getSizeStyles = () => {
    const baseSpacing = CONTEXTUAL_SPACING.input;
    
    switch (size) {
      case 'sm':
        return {
          height: 40,
          paddingVertical: baseSpacing.paddingVertical * 0.75,
          paddingHorizontal: baseSpacing.paddingHorizontal * 0.8,
          fontSize: TYPOGRAPHY_STYLES.bodySmall.fontSize,
          iconSize: 16,
        };
      case 'lg':
        return {
          height: 56,
          paddingVertical: baseSpacing.paddingVertical * 1.25,
          paddingHorizontal: baseSpacing.paddingHorizontal * 1.2,
          fontSize: TYPOGRAPHY_STYLES.bodyLarge.fontSize,
          iconSize: 24,
        };
      case 'md':
      default:
        return {
          height: 48,
          paddingVertical: baseSpacing.paddingVertical,
          paddingHorizontal: baseSpacing.paddingHorizontal,
          fontSize: TYPOGRAPHY_STYLES.bodyMedium.fontSize,
          iconSize: 20,
        };
    }
  };
  
  // ========== LOGIQUE DES VARIANTES ==========
  
  const getVariantStyles = () => {
    const colors = getColors();
    const sizeStyles = getSizeStyles();
    
    const baseStyles = {
      height: multiline ? undefined : sizeStyles.height,
      minHeight: multiline ? sizeStyles.height : undefined,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      backgroundColor: colors.background,
    };
    
    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          borderRadius: 12,
          borderWidth: 0,
          ...SHADOWS.sm,
        };
      case 'outlined':
        return {
          ...baseStyles,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
        };
      case 'underlined':
        return {
          ...baseStyles,
          borderRadius: 0,
          borderWidth: 0,
          borderBottomWidth: 2,
          borderBottomColor: colors.border,
          backgroundColor: 'transparent',
        };
      case 'glassmorphism':
        return {
          ...baseStyles,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: COLORS.glass.border.light,
          backgroundColor: COLORS.glass.background.light,
          ...SHADOWS.sm,
        };
      case 'search':
        return {
          ...baseStyles,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        };
      case 'auth':
        return {
          ...baseStyles,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          ...SHADOWS.sm,
        };
      case 'default':
      default:
        return {
          ...baseStyles,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };
  
  // ========== HANDLERS ==========
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.();
  };
  
  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  };
  
  const handleClear = () => {
    setInternalValue('');
    onChangeText?.('');
    inputRef.current?.focus();
  };
  
  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  // ========== IMPERATIVE HANDLE ==========
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: handleClear,
    getValue: () => internalValue,
    setValue: (newValue: string) => {
      setInternalValue(newValue);
      onChangeText?.(newValue);
    },
    validate: () => {
      const validation = validateInput(internalValue);
      setIsValid(validation.isValid);
      setValidationMessage(validation.message);
      return validation.isValid;
    },
  }));
  
  // ========== RENDU DES ICÔNES ==========
  
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    const colors = getColors();
    const sizeStyles = getSizeStyles();
    
    return (
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={onLeftIconPress}
        disabled={!onLeftIconPress}
      >
        <Ionicons
          name={leftIcon}
          size={sizeStyles.iconSize}
          color={colors.icon}
        />
      </TouchableOpacity>
    );
  };
  
  const renderRightIcon = () => {
    const colors = getColors();
    const sizeStyles = getSizeStyles();
    
    // Icône de chargement
    if (loading) {
      return (
        <View style={styles.iconContainer}>
          <Ionicons
            name="refresh"
            size={sizeStyles.iconSize}
            color={colors.icon}
          />
        </View>
      );
    }
    
    // Bouton clear
    if (clearable && internalValue && !disabled) {
      return (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleClear}
        >
          <Ionicons
            name="close-circle"
            size={sizeStyles.iconSize}
            color={colors.icon}
          />
        </TouchableOpacity>
      );
    }
    
    // Toggle mot de passe
    if (showPasswordToggle) {
      return (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handlePasswordToggle}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={sizeStyles.iconSize}
            color={colors.icon}
          />
        </TouchableOpacity>
      );
    }
    
    // Icône personnalisée
    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
        >
          <Ionicons
            name={rightIcon}
            size={sizeStyles.iconSize}
            color={colors.icon}
          />
        </TouchableOpacity>
      );
    }
    
    return null;
  };
  
  // ========== RENDU DU LABEL ==========
  
  const renderLabel = () => {
    if (!label) return null;
    
    const colors = getColors();
    
    return (
      <Text style={[
        styles.label,
        { color: colors.text },
        labelStyle,
      ]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };
  
  // ========== RENDU DU TEXTE D'AIDE ==========
  
  const renderHelperText = () => {
    const state = getInputState();
    let text = helperText;
    let color = COLORS.neutral[600];
    
    if (state === 'error' && (errorText || validationMessage)) {
      text = errorText || validationMessage;
      color = COLORS.semantic.error;
    } else if (state === 'success' && successText) {
      text = successText;
      color = COLORS.semantic.success;
    }
    
    if (!text) return null;
    
    return (
      <Text style={[styles.helperText, { color }]}>
        {text}
      </Text>
    );
  };
  
  // ========== STYLES CALCULÉS ==========
  
  const colors = getColors();
  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  
  const inputStyles: TextStyle = {
    flex: 1,
    fontSize: sizeStyles.fontSize,
    color: colors.text,
    fontFamily: TYPOGRAPHY_STYLES.input.fontFamily,
    fontWeight: FONT_WEIGHTS.regular,
    ...(Platform.OS === 'web' && {
      outline: 'none',
    }),
  };
  
  // ========== RENDU PRINCIPAL ==========
  
  return (
    <View style={[
      styles.container,
      fullWidth && styles.fullWidth,
      style,
    ]}>
      {renderLabel()}
      
      <View style={[
        styles.inputContainer,
        variantStyles,
      ]}>
        {renderLeftIcon()}
        
        <TextInput
          ref={inputRef}
          style={[inputStyles, inputStyle]}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          testID={testID}
          {...textInputProps}
        />
        
        {renderRightIcon()}
      </View>
      
      {renderHelperText()}
    </View>
  );
});

// ========== STYLES ==========

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  label: {
    ...TYPOGRAPHY_STYLES.label,
    marginBottom: SPACING.xs,
  },
  
  required: {
    color: COLORS.semantic.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconContainer: {
    padding: SPACING.xs,
    marginHorizontal: SPACING.xs,
  },
  
  helperText: {
    ...TYPOGRAPHY_STYLES.caption,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

// ========== COMPOSANTS PRÉDÉFINIS ==========

export const FilledInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input {...props} variant="filled" />
);

export const OutlinedInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input {...props} variant="outlined" />
);

export const UnderlinedInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input {...props} variant="underlined" />
);

export const SearchInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input {...props} variant="search" leftIcon="search" />
);

export const AuthInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input {...props} variant="auth" />
);

export const GlassmorphismInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input {...props} variant="glassmorphism" />
);

export const PasswordInput: React.FC<Omit<InputProps, 'showPasswordToggle'>> = (props) => (
  <Input {...props} showPasswordToggle />
);

// ========== EXPORT PAR DÉFAUT ==========

Input.displayName = 'Input';
export default Input; 