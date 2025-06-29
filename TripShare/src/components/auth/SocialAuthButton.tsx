import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { socialAuthService, SocialAuthResult, SocialAuthError } from '../../services/socialAuth';
import { getFontSize, getSpacing, getBorderRadius } from '../../utils/responsive';

interface SocialAuthButtonProps {
  onSuccess: (result: SocialAuthResult) => void;
  onError: (error: SocialAuthError) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
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
      const available = await socialAuthService.isAvailable();
      setIsAvailable(available);
    } catch (error) {
      console.log('❌ Service d\'auth sociale indisponible:', error);
      setIsAvailable(false);
    }
  };

  const handleSocialSignIn = async () => {
    if (isLoading || disabled || !isAvailable) return;

    setIsLoading(true);
    try {
      const result = await socialAuthService.signInWithPlatformDefault();
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

  const providerName = socialAuthService.getPlatformProviderName();
  const iconName = socialAuthService.getPlatformIcon() as any;

  const styles = createStyles(theme, isDark, fullWidth);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        isLoading && styles.buttonLoading,
      ]}
      onPress={handleSocialSignIn}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={Platform.OS === 'ios' ? '#FFFFFF' : theme.colors.text.primary} 
          />
        ) : (
          <Ionicons 
            name={iconName} 
            size={20} 
            color={Platform.OS === 'ios' ? '#FFFFFF' : theme.colors.text.primary} 
            style={styles.icon}
          />
        )}
        
        <Text style={styles.text}>
          {isLoading 
            ? 'Connexion...' 
            : `Continuer avec ${providerName}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, isDark: boolean, fullWidth: boolean) => {
  const isIOS = Platform.OS === 'ios';
  
  return StyleSheet.create({
    button: {
      width: fullWidth ? '100%' : 'auto',
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginVertical: 8,
      backgroundColor: isIOS 
        ? '#000000' // Noir pour Apple
        : isDark 
          ? theme.colors.background.secondary 
          : '#FFFFFF', // Blanc pour Google
      borderWidth: isIOS ? 0 : 1,
      borderColor: isIOS 
        ? 'transparent' 
        : isDark 
          ? theme.colors.border.primary 
          : '#DADCE0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isIOS ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: isIOS ? 6 : 2,
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
      color: isIOS 
        ? '#FFFFFF' 
        : isDark 
          ? theme.colors.text.primary 
          : '#3C4043',
      textAlign: 'center',
    },
  });
};

export default SocialAuthButton; 