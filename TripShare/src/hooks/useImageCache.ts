import { useState, useEffect, useCallback } from 'react';
import { imageService } from '../services/imageService';

interface CachedImage {
  url: string;
  loaded: boolean;
  error: boolean;
  metadata?: {
    width: number;
    height: number;
    size: number;
  };
}

interface UseImageCacheReturn {
  cachedImages: Map<string, CachedImage>;
  preloadImage: (imagePath: string) => Promise<void>;
  preloadImages: (imagePaths: string[]) => Promise<void>;
  getImageStatus: (imagePath: string) => CachedImage | null;
  clearCache: () => void;
  isLoading: boolean;
}

const imageCache = new Map<string, CachedImage>();

export const useImageCache = (): UseImageCacheReturn => {
  const [cachedImages, setCachedImages] = useState<Map<string, CachedImage>>(imageCache);
  const [isLoading, setIsLoading] = useState(false);

  const updateCache = useCallback((imagePath: string, updates: Partial<CachedImage>) => {
    const current = imageCache.get(imagePath) || {
      url: imagePath,
      loaded: false,
      error: false,
    };

    const updated = { ...current, ...updates };
    imageCache.set(imagePath, updated);
    setCachedImages(new Map(imageCache));
  }, []);

  const preloadImage = useCallback(async (imagePath: string): Promise<void> => {
    // Si l'image est déjà en cache et chargée, ne rien faire
    const cached = imageCache.get(imagePath);
    if (cached?.loaded) {
      return;
    }

    // Marquer comme en cours de chargement
    updateCache(imagePath, { loaded: false, error: false });

    try {
      // Vérifier si l'image existe
      const exists = await imageService.checkImageExists(imagePath);
      if (!exists) {
        updateCache(imagePath, { error: true });
        return;
      }

      // Précharger l'image
      await imageService.preloadImage(imagePath);

      // Récupérer les métadonnées
      const metadata = await imageService.getImageMetadata(imagePath);

      // Marquer comme chargée
      updateCache(imagePath, { 
        loaded: true, 
        error: false,
        metadata 
      });
    } catch (error) {
      console.error('Erreur préchargement image:', imagePath, error);
      updateCache(imagePath, { error: true });
    }
  }, [updateCache]);

  const preloadImages = useCallback(async (imagePaths: string[]): Promise<void> => {
    setIsLoading(true);
    try {
      const promises = imagePaths.map(path => preloadImage(path));
      await Promise.allSettled(promises);
    } finally {
      setIsLoading(false);
    }
  }, [preloadImage]);

  const getImageStatus = useCallback((imagePath: string): CachedImage | null => {
    return imageCache.get(imagePath) || null;
  }, []);

  const clearCache = useCallback(() => {
    imageCache.clear();
    setCachedImages(new Map());
  }, []);

  // Nettoyer le cache périodiquement (optionnel)
  useEffect(() => {
    const interval = setInterval(() => {
      // Supprimer les images en erreur après 5 minutes
      const now = Date.now();
      for (const [path, cached] of imageCache.entries()) {
        if (cached.error && cached.metadata?.size) {
          // Supprimer après 5 minutes
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          if (cached.metadata.size < fiveMinutesAgo) {
            imageCache.delete(path);
          }
        }
      }
      setCachedImages(new Map(imageCache));
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return {
    cachedImages,
    preloadImage,
    preloadImages,
    getImageStatus,
    clearCache,
    isLoading,
  };
};

// Hook spécialisé pour les images de voyage
export const useTripImages = (tripId: string, imagePaths: string[]) => {
  const { preloadImages, getImageStatus, isLoading } = useImageCache();

  useEffect(() => {
    if (tripId && imagePaths.length > 0) {
      preloadImages(imagePaths);
    }
  }, [tripId, imagePaths, preloadImages]);

  const getOptimizedImageUrl = useCallback((imagePath: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }) => {
    return imageService.optimizeImageURL(imagePath, options);
  }, []);

  const getThumbnailUrl = useCallback((imagePath: string) => {
    return imageService.getThumbnailURL(imagePath);
  }, []);

  return {
    isLoading,
    getImageStatus,
    getOptimizedImageUrl,
    getThumbnailUrl,
  };
};

// Hook spécialisé pour les avatars
export const useAvatarCache = (avatarPath: string) => {
  const { preloadImage, getImageStatus } = useImageCache();

  useEffect(() => {
    if (avatarPath) {
      preloadImage(avatarPath);
    }
  }, [avatarPath, preloadImage]);

  const getAvatarUrl = useCallback((path: string) => {
    return imageService.getThumbnailURL(path, 40);
  }, []);

  return {
    getImageStatus,
    getAvatarUrl,
  };
};
