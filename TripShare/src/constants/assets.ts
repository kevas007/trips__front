import { Platform, Dimensions } from 'react-native';

// === Assets Constants pour Trivenile ===
// Centralisation des assets pour optimisation et maintenance

// === ASSETS LOCAUX ===
export const LOCAL_ASSETS = {
  // Fonds d'écran optimisés - NOUVEAUX BACKGROUNDS
  loginBackgrounds: {
    light: require('../../assets/login_bg_light.png'),
    dark: require('../../assets/login_bg_dark.png'),
  },
  
  // Nouveaux backgrounds modernes
  backgrounds: {
    // Backgrounds principaux
    primary: require('../../assets/backgrounds/modern_gradient.png'),
    secondary: require('../../assets/backgrounds/abstract_waves.png'),
    nature: require('../../assets/backgrounds/nature_landscape.png'),
    urban: require('../../assets/backgrounds/city_skyline.png'),
    travel: require('../../assets/backgrounds/travel_inspiration.png'),
    
    // Backgrounds pour sections spécifiques
    home: require('../../assets/backgrounds/home_hero.png'),
    profile: require('../../assets/backgrounds/profile_header.png'),
    search: require('../../assets/backgrounds/search_background.png'),
  },
  
  // Icônes et logos
  icons: {
    app: require('../../assets/icon.png'),
    adaptive: require('../../assets/adaptive-icon.png'),
    splash: require('../../assets/splash-icon.png'),
    // Favicon optimisé 3D 32x32px
    favicon: require('../../assets/favicon_3d_32x32.png'),
    favicon16: require('../../assets/favicon_3d_16x16.png'),
    favicon48: require('../../assets/favicon_3d_48x48.png'),
  },
  
  // Logo SVG (présent dans src/assets/)
  logo: require('../assets/logo.svg'),
};

// === DESTINATIONS PLACEHOLDERS (URLs Unsplash optimisées) ===
export const DESTINATION_PLACEHOLDERS = {
  paris: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=faces,center',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&crop=faces,center',
  bali: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop&crop=faces,center',
  iceland: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&crop=faces,center',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&crop=faces,center',
  alps: 'https://images.unsplash.com/photo-1464822759844-d150356c4f2e?w=800&h=600&fit=crop&crop=faces,center',
  safari: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&crop=faces,center',
};

// === ASSETS PAR CATÉGORIE ===
export const CATEGORY_ASSETS = {
  travel: {
    adventure: '🏔️',
    beach: '🏖️', 
    city: '🏙️',
    culture: '🏛️',
    nature: '🌿',
    food: '🍜',
  },
  activities: {
    hiking: '🥾',
    diving: '🤿',
    skiing: '⛷️',
    photography: '📸',
    cooking: '👨‍🍳',
    museum: '🎨',
  }
};

// === ASSETS D'ÉTAT (Emojis pour placeholders) ===
export const STATE_ASSETS = {
  loading: '⏳',
  error: '😕',
  empty: '🌍',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

// === UTILITAIRES ===

// Générateur d'avatar Dicebear
export const generateAvatarUrl = (identifier: string, style: 'initials' | 'avataaars' | 'bottts' = 'initials') => {
  const encodedId = encodeURIComponent(identifier);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedId}&backgroundColor=008080,4FB3B3,B2DFDF`;
};

// Optimisation automatique des URLs Unsplash - SUPPRIMÉE LA REDIMENSION
export const getOptimizedImage = (
  unsplashUrl: string,
  width: number = 400,
  height: number = 300,
  quality: number = 80
) => {
  const { width: screenWidth } = Dimensions.get('window');
  
  // Ajuster selon la taille d'écran
  const optimalWidth = Math.min(width, screenWidth * 2); // 2x pour Retina
  
  // Qualité adaptée par plateforme
  const platformQuality = Platform.select({
    web: 85,
    ios: 90,
    android: quality,
  });
  
  // Construire l'URL optimisée - SANS REDIMENSION
  if (unsplashUrl.includes('unsplash.com')) {
    const baseUrl = unsplashUrl.split('?')[0];
    return `${baseUrl}?w=${optimalWidth}&h=${height}&fit=crop&crop=faces,center&auto=format&q=${platformQuality}`;
  }
  
  return unsplashUrl;
};

// Configuration responsive pour les assets
export const getResponsiveAsset = (baseAsset: any, screenWidth: number) => {
  // Retourner l'asset approprié selon la taille d'écran
  if (screenWidth < 400) {
    return baseAsset; // Version originale pour petits écrans
  } else if (screenWidth < 800) {
    return baseAsset; // Version medium (à implémenter)
  }
  return baseAsset; // Version large (à implémenter)
};

// Export par défaut pour faciliter l'import
export default {
  LOCAL_ASSETS,
  DESTINATION_PLACEHOLDERS,
  CATEGORY_ASSETS,
  STATE_ASSETS,
  generateAvatarUrl,
  getOptimizedImage,
  getResponsiveAsset,
}; 