import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { socialAuthService, SocialAuthResult, SocialAuthError } from '../../services/socialAuth';
import { getFontSize, getSpacing, getBorderRadius } from '../../utils/responsive';

interface AppleAuthButtonProps {
  onSuccess: (result: SocialAuthResult) => void;
  onError: (error: SocialAuthError) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const AppleAuthButton: React.FC<AppleAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  fullWidth = true,
}) => {
  const { theme, isDark } = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Vérifier la disponibilité au montage
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await socialAuthService.isAppleAvailable();
      setIsAvailable(available);
    } catch (error) {
      console.log('❌ Apple Sign-In indisponible:', error);
      setIsAvailable(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (isLoading || disabled || !isAvailable) return;

    setIsLoading(true);
    try {
      const result = await socialAuthService.signInWithAppleIfAvailable();
      onSuccess(result);
    } catch (error: any) {
      onError(error as SocialAuthError);
    } finally {
      setIsLoading(false);
    }
  };

  // Ne pas afficher le bouton si le service n'est pas disponible
  if (!isAvailable) {
    return null;
  }

  const styles = createStyles(theme, isDark, fullWidth);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        isLoading && styles.buttonLoading,
      ]}
      onPress={handleAppleSignIn}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color="#FFFFFF" 
          />
        ) : (
          <Ionicons 
            name="logo-apple" 
            size={20} 
            color="#FFFFFF" 
            style={styles.icon}
          />
        )}
        
        <Text style={styles.text}>
          {isLoading 
            ? 'Connexion...' 
            : 'Continuer avec Apple'
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, isDark: boolean, fullWidth: boolean) => {
  return StyleSheet.create({
    button: {
      width: fullWidth ? '100%' : 'auto',
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginVertical: 4,
      backgroundColor: '#000000', // Noir pour Apple
      borderWidth: 0,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 6,
    },
    
    buttonDisabled: {
      opacity: 0.6,
    },
    
    buttonLoading: {
      opacity: 0.8,
    },
    
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    icon: {
      marginRight: 8,
    },
    
    text: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });
};

export default AppleAuthButton; 