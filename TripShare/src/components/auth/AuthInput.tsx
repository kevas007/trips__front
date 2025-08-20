import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform, Animated, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getInputHeight, getFontSize, getBorderRadius, getSpacing } from '../../utils/responsive';

interface AuthInputProps {
  icon?: any;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  isValid?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  showPasswordToggle?: boolean;
  nextInputRef?: React.RefObject<any>;
  onSubmitEditing?: () => void;
  leftComponent?: React.ReactNode; // Nouveau: composant à gauche dans l'input
  [key: string]: any;
}

const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  value,
  onChangeText,
  placeholder,
  error,
  isValid,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  showPasswordToggle = false,
  nextInputRef,
  onSubmitEditing,
  leftComponent,
  ...props
}: AuthInputProps) => {
  // Debug: Vérifier les props reçues
  console.log('AuthInput props:', { placeholder, value, icon });
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [focusAnimation] = useState(new Animated.Value(0));
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const containerRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  // Déterminer si c'est un champ mot de passe
  const isPasswordField = secureTextEntry || showPasswordToggle;

  // Appliquer les classes CSS pour le web
  useEffect(() => {
    if (Platform.OS === 'web' && containerRef.current) {
      const element = containerRef.current as any;
      if (element && element.className !== undefined) {
        element.className = element.className
          .replace(/auth-input-\w+/g, '') // Retirer les anciennes classes
          .trim();
        
        if (isFocused) {
          element.className += ' auth-input-focused';
        } else if (error && isTouched) {
          element.className += ' auth-input-error';
        } else if (isValid) {
          element.className += ' auth-input-valid';
        }
      }
    }
  }, [isFocused, error, isTouched, isValid]);

  let borderColor = theme.colors.glassmorphism.border || '#e0e0e0';
  let shadowColor = 'transparent';
  let glowOpacity = 0;
  
  if (isFocused) {
    borderColor = theme.colors.primary[0] || '#008080';
    shadowColor = theme.colors.primary[0] || '#008080';
    glowOpacity = 0.3;
  } else if (error && isTouched) {
    borderColor = theme.colors.semantic.error || '#ef4444';
    shadowColor = theme.colors.semantic.error || '#ef4444';
    glowOpacity = 0.2;
  } else if (isValid) {
    borderColor = '#4ecdc4';
    shadowColor = '#4ecdc4';
    glowOpacity = 0.2;
  }

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Forcer l'affichage du clavier
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  // ========== NAVIGATION ENTRE CHAMPS ==========
  
  const handleSubmitEditing = () => {
    // Appeler le callback personnalisé s'il existe
    if (onSubmitEditing) {
      onSubmitEditing();
      return;
    }
    
    // Navigation automatique vers le champ suivant
    if (nextInputRef?.current) {
      nextInputRef.current.focus();
    } else {
      // Si pas de champ suivant, masquer le clavier
      Keyboard.dismiss();
    }
  };

  const animatedScale = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const animatedShadowOpacity = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, glowOpacity],
  });

  const dynamicStyles = {
    borderColor,
    shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: animatedShadowOpacity,
    shadowRadius: 8,
    elevation: isFocused ? 8 : 2,
    transform: [{ scale: animatedScale }],
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={{ marginBottom: Platform.OS === 'android' ? getSpacing(12) : getSpacing(20) }}
    >
      <Animated.View
        ref={containerRef}
        style={[
          styles.inputWrapper,
          { 
            backgroundColor: theme.colors.glassmorphism.background || 'rgba(255,255,255,0.1)',
          },
          dynamicStyles,
          style,
        ]}
      >
        {leftComponent && (
          <View style={styles.leftComponentContainer}>
            {leftComponent}
          </View>
        )}
        
        {icon && !leftComponent && (
          <Ionicons
            name={icon}
            size={Platform.OS === 'web' ? 20 : getFontSize(22)}
            color={
              isFocused 
                ? (theme.colors.primary[0] || '#008080')
                : (error && isTouched 
                    ? theme.colors.semantic.error 
                    : theme.colors.text.secondary)
            }
            style={[
              styles.inputIcon, 
              { 
                opacity: isFocused ? 1 : 0.7,
                ...(Platform.OS !== 'web' && isFocused && {
                  shadowColor: theme.colors.primary[0] || '#008080',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                  elevation: 4,
                }),
                ...(Platform.OS === 'web' && isFocused && {
                  filter: 'drop-shadow(0 0 4px currentColor)',
                  WebkitFilter: 'drop-shadow(0 0 4px currentColor)',
                })
              }
            ]}
          />
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input, 
            { 
              color: theme.colors.text.primary || '#000000',
              opacity: 1,
              flex: 1, // S'assurer que le TextInput prend l'espace disponible
              minWidth: 0, // Permettre au TextInput de se rétrécir
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          value={value}
          onChangeText={(text: string) => {
            console.log('AuthInput onChangeText:', { placeholder, value, text });
            onChangeText(text);
            if (!isTouched) setIsTouched(true);
          }}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={nextInputRef?.current ? 'next' : 'done'}
          blurOnSubmit={!nextInputRef?.current}
          onSubmitEditing={handleSubmitEditing}
          editable={true}
          {...props}
        />
        
        {/* Bouton pour voir/masquer le mot de passe */}
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={Platform.OS === 'web' ? 20 : getFontSize(22)}
              color={
                isFocused 
                  ? (theme.colors.primary[0] || '#008080')
                  : theme.colors.text.secondary
              }
            />
          </TouchableOpacity>
        )}
        
        {isValid && !isPasswordField && (
          <Animated.View
            style={{
              opacity: focusAnimation,
              transform: [{ scale: animatedScale }],
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={Platform.OS === 'web' ? 22 : getFontSize(24)}
              color="#4ecdc4"
              style={styles.checkIcon}
            />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: getBorderRadius(12),
    borderWidth: Platform.OS === 'web' ? 2 : 1.5,
    paddingLeft: getSpacing(14),
    paddingRight: getSpacing(14),
    height: getInputHeight(),
    // Styles pour web avec effet de glow CSS
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
  },
  inputIcon: {
    marginRight: getSpacing(10),
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  input: {
    flex: 1,
    fontSize: getFontSize(16),
    paddingVertical: Platform.OS === 'android' ? getSpacing(2) : 0,
    paddingLeft: 0, // Pas de padding left car géré par le leftComponent
    zIndex: 1, // S'assurer que le TextInput est au-dessus des autres éléments
    minWidth: 0, // Permettre au TextInput de se rétrécir
    ...(Platform.OS === 'web' && {
      outline: 'none',
      border: 'none',
      background: 'transparent',
    }),
  },
  passwordToggle: {
    marginLeft: getSpacing(10),
    padding: getSpacing(4),
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  checkIcon: {
    marginLeft: getSpacing(10),
  },
  leftComponentContainer: {
    marginRight: getSpacing(6),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'android' ? 70 : 80, // Largeur plus compacte
    maxWidth: Platform.OS === 'android' ? 80 : 90, // Largeur maximale
  },
});

export default AuthInput;
