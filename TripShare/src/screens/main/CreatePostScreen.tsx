import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';

interface CreatePostScreenProps {
  navigation: any;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useSimpleAuth();
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à votre galerie photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à votre caméra.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une photo');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter une description à votre post');
      return;
    }

    setIsPosting(true);

    try {
      // Simulation de l'upload et de la création du post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Succès !',
        'Votre post a été publié avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de publier votre post. Veuillez réessayer.');
    } finally {
      setIsPosting(false);
    }
  };

  const renderImagePreview = (uri: string, index: number) => (
    <View key={index} style={styles.imagePreviewContainer}>
      <Image source={{ uri }} style={styles.imagePreview} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelButton, { color: theme.colors.text.secondary }]}>
            Annuler
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Nouveau Post
        </Text>
        
        <TouchableOpacity
          style={[
            styles.postButton,
            {
              backgroundColor: selectedImages.length > 0 && caption.trim() 
                ? theme.colors.primary[0] 
                : theme.colors.surface,
            },
          ]}
          onPress={handlePost}
          disabled={selectedImages.length === 0 || !caption.trim() || isPosting}
        >
          <Text
            style={[
              styles.postButtonText,
              {
                color: selectedImages.length > 0 && caption.trim() 
                  ? 'white' 
                  : theme.colors.text.secondary,
              },
            ]}
          >
            {isPosting ? 'Publication...' : 'Publier'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User info */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {user?.firstName || 'Vous'}
            </Text>
            <Text style={[styles.userSubtext, { color: theme.colors.text.secondary }]}>
              Partagez votre aventure
            </Text>
          </View>
        </View>

        {/* Image selection */}
        {selectedImages.length === 0 ? (
          <View style={styles.imageSelectionContainer}>
            <TouchableOpacity style={styles.imageSelectionButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={48} color={theme.colors.text.secondary} />
              <Text style={[styles.imageSelectionText, { color: theme.colors.text.secondary }]}>
                Sélectionner des photos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageSelectionButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={48} color={theme.colors.text.secondary} />
              <Text style={[styles.imageSelectionText, { color: theme.colors.text.secondary }]}>
                Prendre une photo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map(renderImagePreview)}
            </ScrollView>
            
            <TouchableOpacity style={styles.addMoreButton} onPress={pickImage}>
              <Ionicons name="add" size={24} color={theme.colors.primary[0]} />
              <Text style={[styles.addMoreText, { color: theme.colors.primary[0] }]}>
                Ajouter plus
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Caption input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.captionInput,
              {
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Racontez votre aventure..."
            placeholderTextColor={theme.colors.text.secondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.characterCount, { color: theme.colors.text.secondary }]}>
            {caption.length}/500
          </Text>
        </View>

        {/* Location input */}
        <View style={styles.inputContainer}>
          <View style={styles.locationInputContainer}>
            <Ionicons name="location" size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={[
                styles.locationInput,
                {
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Ajouter un lieu"
              placeholderTextColor={theme.colors.text.secondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Trip selection */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[
              styles.tripSelectionButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => navigation.navigate('SelectTrip')}
          >
            <Ionicons name="airplane" size={20} color={theme.colors.text.secondary} />
            <Text style={[styles.tripSelectionText, { color: theme.colors.text.secondary }]}>
              {selectedTrip ? `Voyage: ${selectedTrip.title}` : 'Associer à un voyage'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Tags suggestions */}
        <View style={styles.tagsContainer}>
          <Text style={[styles.tagsTitle, { color: theme.colors.text.primary }]}>
            Tags populaires
          </Text>
          <View style={styles.tagsList}>
            {['#Voyage', '#Aventure', '#Culture', '#Nature', '#Photographie', '#Découverte'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor: caption.includes(tag) 
                      ? theme.colors.primary[0] 
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => {
                  if (!caption.includes(tag)) {
                    setCaption(prev => prev + (prev ? ' ' : '') + tag);
                  }
                }}
              >
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: caption.includes(tag) 
                        ? 'white' 
                        : theme.colors.text.secondary,
                    },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userSubtext: {
    fontSize: 14,
  },
  imageSelectionContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  imageSelectionButton: {
    flex: 1,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageSelectionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  imagesContainer: {
    marginBottom: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 12,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
  },
  tripSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tripSelectionText: {
    flex: 1,
    fontSize: 16,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
  },
});

export default CreatePostScreen; 