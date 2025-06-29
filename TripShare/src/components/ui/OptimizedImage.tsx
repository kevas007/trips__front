import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  ImageBackground,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { getOptimizedImage, STATE_ASSETS } from '../../constants/assets';
import { useAppTheme } from '../../hooks/useAppTheme';

interface OptimizedImageProps {
  source: string | { uri: string } | any;
  style?: ImageStyle | ViewStyle;
  containerStyle?: ViewStyle;
  placeholder?: string | React.ReactNode;
  isBackground?: boolean;
  children?: React.ReactNode;
  fallbackSource?: string;
  quality?: number;
  width?: number;
  lazy?: boolean;
  showLoader?: boolean;
  borderRadius?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  isBackground = false,
  children,
  fallbackSource,
  quality = 80,
  width = 400,
  lazy = true,
  showLoader = true,
  borderRadius,
  onLoad,
  onError,
}) => {
  const { theme } = useAppTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(1)).current;

  // Optimiser l'URL de l'image
  const optimizedSource = React.useMemo(() => {
    if (typeof source === 'string') {
      return { uri: getOptimizedImage(source, width, quality) };
    } else if (source?.uri) {
      return { uri: getOptimizedImage(source.uri, width, quality) };
    }
    return source;
  }, [source, width, quality]);

  // Source de fallback
  const fallbackImageSource = React.useMemo(() => {
    if (fallbackSource) {
      return { uri: getOptimizedImage(fallbackSource, width, quality) };
    }
    return null;
  }, [fallbackSource, width, quality]);

  // Gestion du lazy loading
  useEffect(() => {
    if (lazy) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [lazy]);

  // Animation au chargement
  const handleImageLoad = () => {
    setIsLoaded(true);
    
    // Cacher le loader
    Animated.timing(loaderOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Afficher l'image
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
    
    Animated.timing(loaderOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    onError?.();
  };

  // Placeholder par défaut
  const renderPlaceholder = () => {
    if (placeholder) {
      if (typeof placeholder === 'string') {
        return (
          <Text style={[styles.placeholderEmoji, { color: theme.colors.text.secondary }]}>
            {placeholder}
          </Text>
        );
      }
      return placeholder;
    }

    return (
      <Text style={[styles.placeholderEmoji, { color: theme.colors.text.secondary }]}>
        {hasError ? STATE_ASSETS.error : STATE_ASSETS.placeholders.photo}
      </Text>
    );
  };

  // Loader animé
  const renderLoader = () => {
    if (!showLoader || isLoaded) return null;

    return (
      <Animated.View style={[styles.loader, { opacity: loaderOpacity }]}>
        <Text style={[styles.loaderEmoji, { color: theme.colors.primary[0] }]}>
          {STATE_ASSETS.loading}
        </Text>
      </Animated.View>
    );
  };

  // Styles combinés
  const combinedStyle = {
    ...style,
    borderRadius: borderRadius || (style as any)?.borderRadius,
    opacity: isLoaded ? 1 : 0.5,
  } as ImageStyle;

  const containerStyles = [
    styles.container,
    containerStyle,
    {
      backgroundColor: theme.colors.background.card,
      borderRadius: borderRadius || (style as any)?.borderRadius,
    },
  ];

  // Rendu conditionnel selon si c'est un background ou pas
  if (!shouldLoad) {
    return (
      <View style={containerStyles}>
        {renderPlaceholder()}
      </View>
    );
  }

  if (isBackground) {
    return (
      <View style={containerStyles}>
        <ImageBackground
          source={hasError && fallbackImageSource ? fallbackImageSource : optimizedSource}
          style={combinedStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {children}
          </Animated.View>
        </ImageBackground>
        
        {!isLoaded && !hasError && (
          <View style={styles.placeholderContainer}>
            {renderPlaceholder()}
            {renderLoader()}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      {shouldLoad && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={hasError && fallbackImageSource ? fallbackImageSource : optimizedSource}
            style={combinedStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
        </Animated.View>
      )}
      
      {(!isLoaded || hasError) && (
        <View style={styles.placeholderContainer}>
          {renderPlaceholder()}
          {renderLoader()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  placeholderEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderEmoji: {
    fontSize: 24,
    textAlign: 'center',
    ...Platform.select({
      web: {
        animation: 'spin 2s linear infinite',
      },
    }),
  },
});

export default OptimizedImage; 