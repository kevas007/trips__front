import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { socialAuthService, SocialAuthResult, SocialAuthError } from '../../services/socialAuth';
import { getFontSize, getSpacing, getBorderRadius } from '../../utils/responsive';

interface GoogleAuthButtonProps {
  onSuccess: (result: SocialAuthResult) => void;
  onError: (error: SocialAuthError) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
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
      const available = await socialAuthService.isGoogleAvailable();
      setIsAvailable(available);
    } catch (error) {
      console.log('❌ Google Sign-In indisponible:', error);
      setIsAvailable(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading || disabled || !isAvailable) return;

    setIsLoading(true);
    try {
      const result = await socialAuthService.signInWithGoogleIfAvailable();
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
      onPress={handleGoogleSignIn}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color="#3C4043" 
          />
        ) : (
          <Ionicons 
            name="logo-google" 
            size={20} 
            color="#3C4043" 
            style={styles.icon}
          />
        )}
        
        <Text style={styles.text}>
          {isLoading 
            ? 'Connexion...' 
            : 'Continuer avec Google'
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
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DADCE0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
    fontSize: 15,
      fontWeight: '600',
      color: '#3C4043',
      textAlign: 'center',
    },
  });
};

export default GoogleAuthButton; 