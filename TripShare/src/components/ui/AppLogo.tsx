import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  style 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 50;
      case 'large': return 120;
      default: return 80;
    }
  };

  const logoSize = getSize();
  const textSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <View style={[styles.container, style]}>
      {/* Logo image */}
      <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
        <Image
          source={require('../../../assets/logo/logo.png')}
          style={[styles.logoImage, { width: logoSize, height: logoSize }]}
          resizeMode="contain"
        />
      </View>
      
      {/* Texte TripShare */}
      {showText && (
        <Text style={[styles.logoText, { fontSize: textSize }]}>
          TRIPSHARE
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    borderRadius: 12,
  },
  logoText: {
    color: '#008080',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
});

export default AppLogo; 