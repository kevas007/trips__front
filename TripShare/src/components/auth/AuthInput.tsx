import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
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
  ...props
}: AuthInputProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [focusAnimation] = useState(new Animated.Value(0));
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const containerRef = useRef<View>(null);

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
      {icon && (
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
        style={[
          styles.input, 
          { 
            color: theme.colors.text.primary,
            opacity: isFocused ? 1 : 0.8,
          }
        ]}
        placeholder={t(placeholder)}
        placeholderTextColor={
          isFocused 
            ? (theme.colors.text.secondary + '99')
            : (theme.colors.text.secondary + '80')
        }
        value={value}
        onChangeText={(text: string) => {
          onChangeText(text);
          if (!isTouched) setIsTouched(true);
        }}
        secureTextEntry={isPasswordField && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
    marginBottom: getSpacing(20), // Augmenté pour accommoder l'ombre
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
    ...(Platform.OS === 'web' && {
      outline: 'none',
      transition: 'all 0.2s ease',
      background: 'transparent',
    }),
  },
  checkIcon: {
    marginLeft: getSpacing(8),
  },
  passwordToggle: {
    padding: getSpacing(4),
    marginLeft: getSpacing(8),
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
});

// Ajout des styles CSS dynamiques pour le web
if (Platform.OS === 'web') {
  const injectFocusStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .auth-input-focused {
        box-shadow: 
          0 0 0 3px rgba(118, 75, 162, 0.15),
          0 8px 25px rgba(118, 75, 162, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08) !important;
        transform: translateY(-1px) scale(1.01) !important;
      }
      
      .auth-input-error {
        box-shadow: 
          0 0 0 3px rgba(239, 68, 68, 0.15),
          0 8px 25px rgba(239, 68, 68, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08) !important;
      }
      
      .auth-input-valid {
        box-shadow: 
          0 0 0 3px rgba(78, 205, 196, 0.15),
          0 8px 25px rgba(78, 205, 196, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08) !important;
      }
      
      .auth-input-icon-glow {
        filter: drop-shadow(0 0 4px currentColor);
      }
    `;
    document.head.appendChild(style);
  };
  
  // Injecter les styles une seule fois
  if (typeof window !== 'undefined' && !document.querySelector('#auth-input-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-input-styles';
    style.textContent = `
      .auth-input-focused {
        box-shadow: 
          0 0 0 3px rgba(118, 75, 162, 0.15),
          0 8px 25px rgba(118, 75, 162, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08) !important;
        transform: translateY(-1px) scale(1.01) !important;
      }
      
      .auth-input-error {
        box-shadow: 
          0 0 0 3px rgba(239, 68, 68, 0.15),
          0 8px 25px rgba(239, 68, 68, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08) !important;
      }
      
      .auth-input-valid {
        box-shadow: 
          0 0 0 3px rgba(78, 205, 196, 0.15),
          0 8px 25px rgba(78, 205, 196, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08) !important;
      }
      
      .auth-input-icon-glow {
        filter: drop-shadow(0 0 4px currentColor);
      }
    `;
    document.head.appendChild(style);
  }
}

export default AuthInput; 