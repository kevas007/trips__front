import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import OptimizedImage from './OptimizedImage';

interface ImageCarouselProps {
  images: string[];
  height?: number;
  showPagination?: boolean;
  showFullscreen?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onImagePress?: (index: number) => void;
  onImageError?: (index: number, error: any) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  height = 250,
  showPagination = true,
  showFullscreen = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onImagePress,
  onImageError,
  style,
}) => {
  const { theme } = useAppTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrer les images valides
  const validImages = images.filter(img => img && img.trim() !== '');

  useEffect(() => {
    if (autoPlay && validImages.length > 1) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [autoPlay, currentIndex, validImages.length]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleImagePress = (index: number) => {
    if (showFullscreen) {
      setFullscreenIndex(index);
      setFullscreenVisible(true);
    }
    onImagePress?.(index);
  };

  const handleImageError = (index: number, error: any) => {
    onImageError?.(index, error);
  };

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[styles.imageContainer, { width: screenWidth, height }]}
      onPress={() => handleImagePress(index)}
      activeOpacity={0.9}
    >
      <OptimizedImage
        source={item}
        style={styles.image}
        resizeMode="cover"
        optimized
        maxWidth={screenWidth}
        onError={(error) => handleImageError(index, error)}
        errorPlaceholder={
          <View style={[styles.errorPlaceholder, { backgroundColor: theme.colors.background.secondary }]}>
            <Ionicons name="image-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
              Image non disponible
            </Text>
          </View>
        }
      />
      {showFullscreen && (
        <View style={styles.fullscreenButton}>
          <Ionicons name="expand-outline" size={20} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (!showPagination || validImages.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {validImages.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              },
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    );
  };

  const renderFullscreenModal = () => (
    <Modal
      visible={fullscreenVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setFullscreenVisible(false)}
    >
      <View style={styles.fullscreenContainer}>
        <View style={styles.fullscreenHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullscreenVisible(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.fullscreenCounter}>
            {fullscreenIndex + 1} / {validImages.length}
          </Text>
        </View>
        
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setFullscreenIndex(index);
          }}
          style={styles.fullscreenScrollView}
        >
          {validImages.map((image, index) => (
            <View key={index} style={styles.fullscreenImageContainer}>
              <OptimizedImage
                source={image}
                style={styles.fullscreenImage}
                resizeMode="contain"
                optimized={false}
                onError={(error) => handleImageError(index, error)}
                errorPlaceholder={
                  <View style={[styles.fullscreenErrorPlaceholder, { backgroundColor: theme.colors.background.secondary }]}>
                    <Ionicons name="image-outline" size={64} color={theme.colors.text.secondary} />
                    <Text style={[styles.fullscreenErrorText, { color: theme.colors.text.secondary }]}>
                      Image non disponible
                    </Text>
                  </View>
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  if (!images || images.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }, style]}>
        <Ionicons name="image-outline" size={48} color={theme.colors.text.secondary} />
        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
          Aucune image disponible
        </Text>
      </View>
    );
  }



  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={validImages}
        renderItem={renderImage}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
      {renderPagination()}
      {renderFullscreenModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0, // Supprimer les coins arrondis pour un affichage plein
  },
  fullscreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  errorPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: 8,
  },
  fullscreenCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fullscreenScrollView: {
    flex: 1,
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    maxWidth: screenWidth,
    maxHeight: '100%',
  },
  fullscreenErrorPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenErrorText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ImageCarousel;
