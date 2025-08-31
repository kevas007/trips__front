import { unifiedApi } from './unifiedApi';

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface ImageInfo {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  tripId?: string;
  userId?: string;
}

export interface TripImagesResponse {
  images: ImageInfo[];
  total: number;
}

class ImageService {
  private baseURL: string;

  constructor() {
    // Utiliser l'URL du backend pour les images
    this.baseURL = 'http://192.168.0.220:8085';
  }

  /**
   * Upload une image pour un voyage
   */
  async uploadTripImage(tripId: string, imageFile: any): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('tripId', tripId);

      const response = await unifiedApi.put<ImageUploadResponse>('/api/v1/trips/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Erreur upload image voyage:', error);
      throw new Error('Impossible d\'uploader l\'image');
    }
  }

  /**
   * Upload un avatar utilisateur
   */
  async uploadUserAvatar(imageFile: any): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', imageFile);

      const response = await unifiedApi.put<ImageUploadResponse>('/api/v1/users/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      throw new Error('Impossible d\'uploader l\'avatar');
    }
  }

  /**
   * Récupérer les images d'un voyage
   */
  async getTripImages(tripId: string): Promise<TripImagesResponse> {
    try {
      const response = await unifiedApi.get<TripImagesResponse>(`/api/v1/trips/${tripId}/images`);

      return response;
    } catch (error) {
      console.error('Erreur récupération images voyage:', error);
      throw new Error('Impossible de récupérer les images');
    }
  }

  /**
   * Supprimer une image
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      await unifiedApi.delete(`/api/v1/images/${imageId}`);
    } catch (error) {
      console.error('Erreur suppression image:', error);
      throw new Error('Impossible de supprimer l\'image');
    }
  }

  /**
   * Obtenir l'URL d'une image avec proxy
   */
  getImageURL(imagePath: string): string {
    // Si c'est déjà une URL complète, la retourner
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Sinon, construire l'URL avec le proxy
    return `${this.baseURL}/images/${imagePath}`;
  }

  /**
   * Obtenir l'URL d'une image par défaut
   */
  getDefaultImageURL(type: 'trip' | 'avatar' = 'trip'): string {
    const path = type === 'trip' ? 'defaults/default-trip-image.jpg' : 'defaults/default-avatar.jpg';
    return this.getImageURL(path);
  }

  /**
   * Vérifier si une image existe
   */
  async checkImageExists(imagePath: string): Promise<boolean> {
    try {
      console.log('🔍 Vérification image:', imagePath);
      const imageUrl = this.getImageURL(imagePath);
      console.log('🔗 URL complète:', imageUrl);
      
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const exists = response.ok;
      console.log('✅ Image existe:', exists, 'Status:', response.status);
      return exists;
    } catch (error) {
      console.error('❌ Erreur vérification image:', error);
      return false;
    }
  }

  /**
   * Précharger une image
   */
  preloadImage(imagePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Erreur préchargement image'));
      img.src = this.getImageURL(imagePath);
    });
  }

  /**
   * Précharger plusieurs images
   */
  async preloadImages(imagePaths: string[]): Promise<void> {
    const promises = imagePaths.map(path => this.preloadImage(path));
    await Promise.allSettled(promises);
  }

  /**
   * Obtenir les métadonnées d'une image
   */
  async getImageMetadata(imagePath: string): Promise<{ width: number; height: number; size: number } | null> {
    try {
      const response = await fetch(this.getImageURL(imagePath));
      if (!response.ok) return null;

      const blob = await response.blob();
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            size: blob.size,
          });
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Optimiser une image pour l'affichage
   */
  optimizeImageURL(imagePath: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    const url = this.getImageURL(imagePath);
    const params = new URLSearchParams();

    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);

    return params.toString() ? `${url}?${params.toString()}` : url;
  }

  /**
   * Créer une URL de thumbnail
   */
  getThumbnailURL(imagePath: string, size: number = 150): string {
    return this.optimizeImageURL(imagePath, {
      width: size,
      height: size,
      quality: 80,
      format: 'jpeg',
    });
  }

  /**
   * Créer une URL d'image optimisée pour l'affichage
   */
  getOptimizedImageURL(imagePath: string, maxWidth: number = 800): string {
    return this.optimizeImageURL(imagePath, {
      width: maxWidth,
      quality: 85,
      format: 'jpeg',
    });
  }
}

export const imageService = new ImageService();
