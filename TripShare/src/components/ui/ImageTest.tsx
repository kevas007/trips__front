import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import OptimizedImage from './OptimizedImage';

const ImageTest: React.FC = () => {
  const { theme } = useAppTheme();

  const testImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&crop=faces,center',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=600&fit=crop&crop=faces,center',
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Test des Images
      </Text>
      
      {testImages.map((imageUrl, index) => (
        <View key={index} style={styles.imageContainer}>
          <Text style={[styles.imageLabel, { color: theme.colors.text.secondary }]}>
            Image {index + 1}: {imageUrl.substring(0, 50)}...
          </Text>
          <OptimizedImage
            source={imageUrl}
            style={styles.testImage}
            resizeMode="cover"
            onLoad={() => console.log(`✅ Image ${index + 1} chargée avec succès`)}
            onError={(error) => console.error(`❌ Erreur image ${index + 1}:`, error)}
            errorPlaceholder={
              <View style={[styles.errorPlaceholder, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
                  Erreur de chargement
                </Text>
              </View>
            }
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  testImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  errorPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
  },
});

export default ImageTest;
