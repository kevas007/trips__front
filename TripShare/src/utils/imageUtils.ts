import { API_CONFIG } from '../config/api';

/**
 * Utilitaires pour la gestion des URLs d'images
 */

// URL de base pour les images du backend
const getBackendImageUrl = (path: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Obtient l'URL d'une image en gérant les différents cas
 */
export const getImageUrl = (imageUrl: string, fallbackPath?: string): string => {
  // Si c'est une URL locale (file://), utiliser le fallback
  if (imageUrl.startsWith('file://')) {
    return fallbackPath ? getBackendImageUrl(fallbackPath) : getBackendImageUrl('/storage/tripshare-uploads/defaults/default-trip-image.jpg');
  }
  
  // Si c'est une URL HTTP/HTTPS valide, l'utiliser directement
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si c'est une URL relative du backend, la compléter
  if (imageUrl.startsWith('/storage/') || imageUrl.startsWith('storage/')) {
    return getBackendImageUrl(imageUrl);
  }
  
  // Fallback par défaut
  return fallbackPath ? getBackendImageUrl(fallbackPath) : getBackendImageUrl('/storage/tripshare-uploads/defaults/default-trip-image.jpg');
};

/**
 * URLs d'images par défaut
 */
export const DEFAULT_IMAGES = {
  trip: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  destination: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=faces,center',
} as const;

/**
 * Obtient l'URL d'une image avec fallback automatique
 */
export const getImageUrlWithFallback = (
  imageUrl: string, 
  type: keyof typeof DEFAULT_IMAGES = 'trip'
): string => {
  return getImageUrl(imageUrl, DEFAULT_IMAGES[type]);
};

/**
 * Vérifie si une URL d'image est valide
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // URLs locales (file://) sont considérées comme valides
  if (url.startsWith('file://')) return true;
  
  // URLs HTTP/HTTPS
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  
  // URLs relatives du backend
  if (url.startsWith('/storage/') || url.startsWith('storage/')) return true;
  
  return false;
};
