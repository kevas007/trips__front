import React from 'react';
import { View, Platform } from 'react-native';
import AppleAuthButton from './AppleAuthButton';
import GoogleAuthButton from './GoogleAuthButton';
import { SocialAuthResult, SocialAuthError } from '../../services/socialAuth';

interface SocialAuthButtonsProps {
  onSuccess: (result: SocialAuthResult) => void;
  onError: (error: SocialAuthError) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSuccess,
  onError,
  disabled = false,
  fullWidth = true,
}) => {
  return (
    <View style={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* BOUTONS CACHÉS - Connexion sociale désactivée */}
      {/* iOS : Afficher Apple ET Google */}
      {/* {Platform.OS === 'ios' && (
        <>
          <AppleAuthButton
            onSuccess={onSuccess}
            onError={onError}
            disabled={disabled}
            fullWidth={fullWidth}
          />
          <GoogleAuthButton
            onSuccess={onSuccess}
            onError={onError}
            disabled={disabled}
            fullWidth={fullWidth}
          />
        </>
      )} */}
      
      {/* Android : Afficher seulement Google */}
      {/* {Platform.OS === 'android' && (
        <GoogleAuthButton
          onSuccess={onSuccess}
          onError={onError}
          disabled={disabled}
          fullWidth={fullWidth}
        />
      )} */}
    </View>
  );
};

export default SocialAuthButtons; 