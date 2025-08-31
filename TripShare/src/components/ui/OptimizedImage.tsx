import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  ImageSourcePropType,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { imageService } from '../../services/imageService';

interface OptimizedImageProps {
  source: string | ImageSourcePropType;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  showLoadingIndicator?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  // Options d'optimisation
  thumbnail?: boolean;
  thumbnailSize?: number;
  optimized?: boolean;
  maxWidth?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  errorPlaceholder,
  showLoadingIndicator = true,
  resizeMode = 'cover',
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  thumbnail = false,
  thumbnailSize = 150,
  optimized = true,
  maxWidth = 800,
  quality = 85,
  format = 'jpeg',
}) => {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof source === 'string') {
      processImageUrl(source);
    } else {
      // Si c'est un ImageSourcePropType, l'utiliser directement
      setImageUrl(null);
      setLoading(false);
      setError(false);
    }
  }, [source, thumbnail, thumbnailSize, optimized, maxWidth, quality, format]);

  const processImageUrl = async (url: string) => {
    try {
      setLoading(true);
      setError(false);

      let processedUrl: string;

      if (thumbnail) {
        processedUrl = imageService.getThumbnailURL(url, thumbnailSize);
      } else if (optimized) {
        processedUrl = imageService.getOptimizedImageURL(url, maxWidth);
      } else {
        processedUrl = imageService.getImageURL(url);
      }

      if (mountedRef.current) {
        setImageUrl(processedUrl);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(true);
        setImageUrl(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = (err: any) => {
    setLoading(false);
    setError(true);
    onError?.(err);
  };

  // Si c'est un ImageSourcePropType, l'utiliser directement
  if (typeof source !== 'string') {
    return (
      <View style={[styles.container, containerStyle]}>
        <Image
          source={source}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoad={handleLoad}
          onError={handleError}
        />
        {loading && showLoadingIndicator && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary[0]} />
          </View>
        )}
      </View>
    );
  }

  // Si pas d'URL ou erreur, afficher le placeholder
  if (!imageUrl || error) {
    return (
      <View style={[styles.container, containerStyle]}>
        {error ? (
          errorPlaceholder || (
            <View style={[styles.placeholder, { backgroundColor: theme.colors.background.secondary }]}>
              <Ionicons name="image-outline" size={32} color={theme.colors.text.secondary} />
            </View>
          )
        ) : (
          placeholder || (
            <View style={[styles.placeholder, { backgroundColor: theme.colors.background.secondary }]}>
              <ActivityIndicator size="small" color={theme.colors.primary[0]} />
            </View>
          )
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoad={handleLoad}
        onError={handleError}
      />
      {loading && showLoadingIndicator && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary[0]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage; 