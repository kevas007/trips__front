import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import OptimizedImage from './OptimizedImage';

interface ImageUploaderProps {
  onImagesSelected: (images: ImagePicker.ImagePickerAsset[]) => void;
  maxImages?: number;
  maxImageSize?: number; // en MB
  allowedTypes?: ('image/jpeg' | 'image/png' | 'image/webp')[];
  style?: any;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  maxImages = 5,
  maxImageSize = 10, // 10MB par défaut
  allowedTypes = ['image/jpeg', 'image/png'],
  style,
  disabled = false,
}) => {
  const { theme } = useAppTheme();
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à votre galerie photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const validateImage = (image: ImagePicker.ImagePickerAsset): boolean => {
    // Vérifier la taille
    const sizeInMB = (image.fileSize || 0) / (1024 * 1024);
    if (sizeInMB > maxImageSize) {
      Alert.alert(
        'Image trop volumineuse',
        `L'image ne doit pas dépasser ${maxImageSize}MB. Taille actuelle: ${sizeInMB.toFixed(1)}MB`
      );
      return false;
    }

    // Vérifier le type
    if (image.mimeType && !allowedTypes.includes(image.mimeType as any)) {
      Alert.alert(
        'Type d\'image non supporté',
        `Seuls les formats ${allowedTypes.join(', ')} sont acceptés.`
      );
      return false;
    }

    return true;
  };

  const pickImages = async () => {
    if (disabled || uploading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - selectedImages.length,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const validImages = result.assets.filter(validateImage);
        
        if (validImages.length > 0) {
          const newImages = [...selectedImages, ...validImages];
          setSelectedImages(newImages);
          onImagesSelected(newImages);
        }
      }
    } catch (error) {
      console.error('Erreur sélection images:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner les images');
    }
  };

  const takePhoto = async () => {
    if (disabled || uploading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        if (validateImage(image)) {
          const newImages = [...selectedImages, image];
          setSelectedImages(newImages);
          onImagesSelected(newImages);
        }
      }
    } catch (error) {
      console.error('Erreur prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    onImagesSelected(newImages);
  };

  const showImageOptions = () => {
    Alert.alert(
      'Ajouter des images',
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Prendre une photo', onPress: takePhoto },
        { text: 'Choisir depuis la galerie', onPress: pickImages },
      ]
    );
  };

  const renderImagePreview = (image: ImagePicker.ImagePickerAsset, index: number) => (
    <View key={index} style={styles.imagePreviewContainer}>
      <OptimizedImage
        source={{ uri: image.uri }}
        style={styles.imagePreview}
        resizeMode="cover"
        thumbnail
        thumbnailSize={80}
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Images sélectionnées */}
      {selectedImages.length > 0 && (
        <View style={styles.imagesContainer}>
          {selectedImages.map(renderImagePreview)}
        </View>
      )}

      {/* Bouton d'ajout */}
      {selectedImages.length < maxImages && (
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.border.primary,
            },
            disabled && styles.disabledButton,
          ]}
          onPress={showImageOptions}
          disabled={disabled || uploading}
        >
          <Ionicons
            name="add"
            size={32}
            color={disabled ? theme.colors.text.disabled : theme.colors.primary[0]}
          />
          <Text
            style={[
              styles.addButtonText,
              {
                color: disabled ? theme.colors.text.disabled : theme.colors.text.secondary,
              },
            ]}
          >
            Ajouter des images
          </Text>
          <Text
            style={[
              styles.imageCountText,
              {
                color: disabled ? theme.colors.text.disabled : theme.colors.text.secondary,
              },
            ]}
          >
            {selectedImages.length}/{maxImages}
          </Text>
        </TouchableOpacity>
      )}

      {/* Indicateur de chargement */}
      {uploading && (
        <View style={styles.uploadingContainer}>
          <Text style={[styles.uploadingText, { color: theme.colors.text.secondary }]}>
            Upload en cours...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  imageCountText: {
    marginLeft: 'auto',
    fontSize: 14,
  },
  uploadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadingText: {
    fontSize: 14,
  },
});

export default ImageUploader;
