import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { tripShareApi } from '../../services/tripShareApi';

const PhotoUploadTest: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // TODO: Migrer vers MediaType quand disponible
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Erreur', 'Veuillez d\'abord sélectionner une image');
      return;
    }

    setIsUploading(true);

    try {
      // Créer un FormData
      const formData = new FormData();

      // Créer un objet File à partir de l'URI
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'test_photo.jpg', { type: 'image/jpeg' });
      formData.append('photo', file);

      // Ajouter des métadonnées de test
      formData.append('description', 'Photo de test');
      formData.append('title', 'Test Upload');

      // ID de test (à remplacer par un vrai ID)
      const testTripId = '123e4567-e89b-12d3-a456-426614174000';

      // Upload via l'API
      await tripShareApi.uploadTripPhoto(testTripId, formData);

      Alert.alert('Succès', 'Photo uploadée avec succès !');
      setSelectedImage(null);

    } catch (error: any) {
      console.error('Erreur upload:', error);

      // Gérer les erreurs de modération
      if (error?.response?.status === 403) {
        Alert.alert('Photo refusée', error?.response?.data?.error || 'Contenu inapproprié détecté');
      } else if (error?.response?.status === 202) {
        Alert.alert('Photo acceptée avec avertissement', error?.response?.data?.error || 'La photo a été flagguée pour review');
      } else {
        Alert.alert('Erreur', 'Impossible d\'uploader la photo. Veuillez réessayer.');
      }

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test d'Upload de Photo</Text>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text>Aucune image sélectionnée</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sélectionner une image"
          onPress={pickImage}
          disabled={isUploading}
        />

        <Button
          title={isUploading ? "Upload en cours..." : "Uploader l'image"}
          onPress={uploadImage}
          disabled={!selectedImage || isUploading}
        />
      </View>

      {isUploading && (
        <Text style={styles.uploadingText}>Upload en cours...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    gap: 10,
  },
  uploadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
});

export default PhotoUploadTest;
