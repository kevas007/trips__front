import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store';
import { useTrips } from '../../hooks/useTripShareApi';
import { Trip } from '../../types/api';

interface CreatePostScreenProps {
  navigation: any;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { listTrips } = useTrips();
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTripDay, setSelectedTripDay] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Charger les voyages de l'utilisateur
  useEffect(() => {
    loadUserTrips();
  }, []);

  const loadUserTrips = async () => {
    setLoadingTrips(true);
    try {
      await listTrips.execute();
      if (listTrips.data && Array.isArray(listTrips.data)) {
        // Filtrer seulement les voyages de l'utilisateur connecté
        const userTrips = listTrips.data.filter((trip: Trip) => trip.author.id === user?.id);
        setTrips(userTrips);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des voyages:', error);
      Alert.alert('Erreur', 'Impossible de charger vos voyages');
    } finally {
      setLoadingTrips(false);
    }
  };

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
      mediaTypes: ['images'],
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
      mediaTypes: ['images'],
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => setSelectedImages(prev => prev.filter((_, i) => i !== index))
        }
      ]
    );
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...selectedImages];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setSelectedImages(newImages);
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const setMainImage = (index: number) => {
    if (index === 0) return; // Déjà l'image principale
    
    const newImages = [...selectedImages];
    const [mainImage] = newImages.splice(index, 1);
    newImages.unshift(mainImage);
    setSelectedImages(newImages);
    
    Alert.alert('✅ Image principale', 'Cette image sera maintenant affichée en premier');
  };

  const duplicateImage = (index: number) => {
    const imageToDuplicate = selectedImages[index];
    setSelectedImages(prev => [...prev, imageToDuplicate]);
    Alert.alert('✅ Image dupliquée', 'L\'image a été ajoutée à la fin de votre sélection');
  };

  const selectTripDay = () => {
    if (!selectedTrip) return;
    
    const duration = selectedTrip.duration || 7;
    const days = Array.from({ length: duration }, (_, i) => `Jour ${i + 1}`);
    
    Alert.alert(
      'Choisir un jour',
      'À quel jour de votre voyage correspond ce post ?',
      [
        { text: 'Annuler', style: 'cancel' },
        ...days.slice(0, 5).map((day, index) => ({
          text: day,
          onPress: () => setSelectedTripDay(index + 1)
        })),
      ]
    );
  };

  const selectActivity = () => {
    const activities = [
      'Visite culturelle',
      'Randonnée',
      'Restaurant',
      'Activité sportive',
      'Détente',
      'Shopping',
      'Transport',
      'Hébergement'
    ];
    
    Alert.alert(
      'Type d\'activité',
      'Quel type d\'activité représente ce post ?',
      [
        { text: 'Annuler', style: 'cancel' },
        ...activities.slice(0, 6).map(activity => ({
          text: activity,
          onPress: () => setSelectedActivity(activity)
        })),
      ]
    );
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
      // Préparer les données du post
      const postData = {
        content: caption.trim(),
        media_urls: selectedImages, // En production, il faudrait d'abord uploader les images
        trip_id: selectedTrip?.id || null,
        trip_day: selectedTripDay,
        activity_type: selectedActivity,
        type: 'photo' as const,
        visibility: 'public' as const,
        location: location.trim() || null,
      };

      console.log('📝 Création du post avec les données enrichies:', {
        ...postData,
        trip_name: selectedTrip?.title || 'Aucun voyage',
        trip_destination: selectedTrip?.destination?.name || 'Aucune destination',
        media_count: selectedImages.length,
        day_info: selectedTripDay ? `Jour ${selectedTripDay}` : 'Voyage global',
        activity_info: selectedActivity || 'Activité générale',
      });

      // Simulation de l'upload et de la création du post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const successMessage = selectedTrip 
        ? `Votre post a été publié et associé au voyage "${selectedTrip.title}" !`
        : 'Votre post a été publié avec succès !';
      
      Alert.alert(
        'Succès !',
        successMessage,
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
      <TouchableOpacity onPress={() => openImageViewer(index)}>
        <Image source={{ uri }} style={styles.imagePreview} />
        
        {/* Badge pour l'image principale */}
        {index === 0 && (
          <View style={styles.mainImageBadge}>
            <Ionicons name="star" size={12} color="white" />
            <Text style={styles.mainImageText}>Principal</Text>
          </View>
        )}
        
        {/* Numéro de l'image */}
        <View style={styles.imageNumber}>
          <Text style={styles.imageNumberText}>{index + 1}</Text>
        </View>
      </TouchableOpacity>

      {/* Menu d'actions sur l'image */}
      <View style={styles.imageActions}>
        <TouchableOpacity
          style={styles.imageActionButton}
          onPress={() => removeImage(index)}
        >
          <Ionicons name="trash" size={16} color="#FF6B6B" />
        </TouchableOpacity>
        
        {index !== 0 && (
          <TouchableOpacity
            style={styles.imageActionButton}
            onPress={() => setMainImage(index)}
          >
            <Ionicons name="star-outline" size={16} color="#FFD700" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.imageActionButton}
          onPress={() => duplicateImage(index)}
        >
          <Ionicons name="copy" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Boutons de réorganisation */}
      {selectedImages.length > 1 && (
        <View style={styles.reorderButtons}>
          {index > 0 && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => reorderImages(index, index - 1)}
            >
              <Ionicons name="chevron-back" size={16} color="white" />
            </TouchableOpacity>
          )}
          {index < selectedImages.length - 1 && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => reorderImages(index, index + 1)}
            >
              <Ionicons name="chevron-forward" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }, { backgroundColor: 'transparent' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      contentContainerStyle={{ flex: 1, backgroundColor: 'transparent' }}
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
            source={{ uri: user?.avatar || 'http://localhost:8085/storage/defaults/default-avatar.jpg' }}
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {user?.first_name || user?.username || 'Vous'}
            </Text>
            <Text style={[styles.userSubtext, { color: theme.colors.text.secondary }]}>
              Partagez votre aventure
            </Text>
          </View>
        </View>

                {/* Image selection - Version user-friendly */}
        {selectedImages.length === 0 ? (
          <View style={styles.friendlyImageSelection}>
            <Text style={[styles.instructionText, { color: theme.colors.text.primary }]}>
              📸 Ajoutez une photo à votre post
            </Text>
            <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
              Choisissez une belle photo de votre aventure !
            </Text>
            
            <TouchableOpacity 
               style={styles.mainActionButton}
               onPress={pickImage}
             >
               <Ionicons name="images" size={40} color="white" />
               <Text style={styles.mainActionText}>
                 📱 Galerie Photos
               </Text>
               <Text style={styles.mainActionSubtext}>
                 Choisir une photo existante
               </Text>
             </TouchableOpacity>
             
             <Text style={[styles.orText, { color: theme.colors.text.secondary }]}>
               ou
             </Text>
             
             <TouchableOpacity 
               style={styles.secondaryActionButton}
               onPress={takePhoto}
             >
               <Ionicons name="camera" size={32} color="#007AFF" />
               <Text style={styles.secondaryActionText}>
                 📷 Nouvelle Photo
               </Text>
               <Text style={styles.secondaryActionSubtext}>
                 Prendre une photo maintenant
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

        {/* Caption input - Version user-friendly */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>
            ✍️ Décrivez votre aventure
          </Text>
          <Text style={styles.sectionHelp}>
            Que voulez-vous partager avec vos amis ?
          </Text>
          <TextInput
            style={styles.friendlyCaptionInput}
            placeholder="Exemple: Quelle vue magnifique ! J'ai adoré cette randonnée en montagne 🏔️"
            placeholderTextColor="#8899A6"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <View style={styles.characterCountContainer}>
            <Text style={styles.characterCount}>
              {caption.length}/500 caractères
            </Text>
            {caption.length > 450 && (
              <Text style={styles.warningText}>
                ⚠️ Presque à la limite !
              </Text>
            )}
          </View>
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

        {/* Trip selection - Version user-friendly */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>
            ✈️ Associer à un voyage
          </Text>
          <Text style={styles.sectionHelp}>
            Reliez ce post à l'un de vos voyages (optionnel)
          </Text>
          
          <TouchableOpacity
            style={[
              styles.friendlyTripButton,
              selectedTrip && styles.friendlyTripButtonSelected,
            ]}
            onPress={() => setShowTripModal(true)}
          >
            {selectedTrip ? (
              <View style={styles.selectedTripContainer}>
                <Image 
                  source={{ uri: selectedTrip.coverImage || 'https://via.placeholder.com/60x60?text=✈️' }} 
                  style={styles.selectedTripImage}
                />
                <View style={styles.selectedTripInfo}>
                  <Text style={styles.selectedTripTitle}>
                    {selectedTrip.title}
                  </Text>
                  <Text style={styles.selectedTripDestination}>
                    📍 {selectedTrip.destination.name}
                  </Text>
                  <Text style={styles.selectedTripDates}>
                    📅 {new Date(selectedTrip.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedTrip.endDate).toLocaleDateString('fr-FR')}
                  </Text>
                  
                  {/* Options avancées d'association */}
                  <View style={styles.tripDetailsContainer}>
                    {selectedTripDay && (
                      <Text style={styles.tripDetailText}>
                        🗓️ Jour {selectedTripDay}
                      </Text>
                    )}
                    {selectedActivity && (
                      <Text style={styles.tripDetailText}>
                        🎯 {selectedActivity}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.tripActions}>
                  <TouchableOpacity 
                    style={styles.tripActionButton}
                    onPress={() => {
                      Alert.alert(
                        'Détails du voyage',
                        'Associer à un jour ou une activité spécifique ?',
                        [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Jour spécifique', onPress: () => selectTripDay() },
                          { text: 'Activité', onPress: () => selectActivity() },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="settings" size={16} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.unselectTripButton}
                    onPress={() => {
                      setSelectedTrip(null);
                      setSelectedTripDay(null);
                      setSelectedActivity(null);
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noTripSelected}>
                <Ionicons name="airplane" size={32} color="#007AFF" />
                <Text style={styles.noTripText}>
                  🌍 Choisir un voyage
                </Text>
                <Text style={styles.noTripSubtext}>
                  {trips.length > 0 
                    ? `${trips.length} voyage${trips.length > 1 ? 's' : ''} disponible${trips.length > 1 ? 's' : ''}`
                    : 'Aucun voyage trouvé'
                  }
                </Text>
              </View>
            )}
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

      {/* Modal de sélection de voyage */}
      <Modal
        visible={showTripModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTripModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTripModal(false)}>
              <Text style={styles.modalCancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choisir un voyage</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Liste des voyages */}
          {loadingTrips ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.modalLoadingText}>Chargement de vos voyages...</Text>
            </View>
          ) : trips.length === 0 ? (
            <View style={styles.modalEmptyContainer}>
              <Ionicons name="airplane-outline" size={64} color="#CCCCCC" />
              <Text style={styles.modalEmptyTitle}>Aucun voyage trouvé</Text>
              <Text style={styles.modalEmptySubtitle}>
                Créez votre premier voyage pour pouvoir l'associer à vos posts !
              </Text>
              <TouchableOpacity 
                style={styles.modalCreateTripButton}
                onPress={() => {
                  setShowTripModal(false);
                  Alert.alert(
                    'Créer un voyage',
                    'La création de voyage sera bientôt disponible ! Pour l\'instant, vous pouvez publier votre post sans l\'associer à un voyage.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.modalCreateTripText}>Créer un voyage</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={trips}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalTripItem,
                    selectedTrip?.id === item.id && styles.modalTripItemSelected
                  ]}
                  onPress={() => {
                    setSelectedTrip(item);
                    setShowTripModal(false);
                  }}
                >
                  <Image 
                    source={{ uri: item.coverImage || 'https://via.placeholder.com/60x60?text=✈️' }}
                    style={styles.modalTripImage}
                  />
                  <View style={styles.modalTripInfo}>
                    <Text style={styles.modalTripTitle}>{item.title}</Text>
                    <Text style={styles.modalTripDestination}>
                      📍 {item.destination.name}
                    </Text>
                    <Text style={styles.modalTripDates}>
                      📅 {new Date(item.startDate).toLocaleDateString('fr-FR')} - {new Date(item.endDate).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  {selectedTrip?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalTripsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>

      {/* Modal de visualisation d'images */}
      <Modal
        visible={showImageViewer}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageViewer(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity 
            style={styles.imageViewerClose}
            onPress={() => setShowImageViewer(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageViewerScroll}
            contentOffset={{ x: currentImageIndex * width, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
          >
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageViewerContainer}>
                <Image 
                  source={{ uri }} 
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.imageViewerInfo}>
            <Text style={styles.imageViewerCounter}>
              {currentImageIndex + 1} / {selectedImages.length}
            </Text>
            <View style={styles.imageViewerActions}>
              <TouchableOpacity
                style={styles.imageViewerActionButton}
                onPress={() => {
                  setMainImage(currentImageIndex);
                  setShowImageViewer(false);
                }}
              >
                <Ionicons name="star" size={20} color="white" />
                <Text style={styles.imageViewerActionText}>Principal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imageViewerActionButton}
                onPress={() => {
                  duplicateImage(currentImageIndex);
                  setShowImageViewer(false);
                }}
              >
                <Ionicons name="copy" size={20} color="white" />
                <Text style={styles.imageViewerActionText}>Dupliquer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.imageViewerActionButton, styles.deleteButton]}
                onPress={() => {
                  removeImage(currentImageIndex);
                  setShowImageViewer(false);
                }}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.imageViewerActionText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Nouveaux styles pour l'interface user-friendly
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  mainActionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  mainActionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  secondaryActionButton: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
  },
  secondaryActionSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  friendlyImageSelection: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  orText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  // Styles pour l'interface de saisie améliorée
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2B33',
    marginBottom: 8,
  },
  sectionHelp: {
    fontSize: 12,
    color: '#8899A6',
    marginBottom: 16,
    lineHeight: 18,
  },
  friendlyCaptionInput: {
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderRadius: 16,
    padding: 20,
    fontSize: 14,
    minHeight: 120,
    backgroundColor: '#F8F9FA',
    color: '#1C2B33',
    textAlignVertical: 'top',
  },
  characterCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  
  // Styles pour la sélection de voyage user-friendly
  friendlyTripButton: {
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginTop: 8,
  },
  friendlyTripButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  selectedTripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTripImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  selectedTripInfo: {
    flex: 1,
  },
  selectedTripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2B33',
    marginBottom: 4,
  },
  selectedTripDestination: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  unselectTripButton: {
    padding: 4,
  },
  noTripSelected: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  noTripText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 12,
    marginBottom: 4,
  },
  noTripSubtext: {
    fontSize: 12,
    color: '#8899A6',
    textAlign: 'center',
  },

  // Styles pour la modal de sélection
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2B33',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalLoadingText: {
    fontSize: 16,
    color: '#8899A6',
    marginTop: 16,
    textAlign: 'center',
  },
  modalEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalEmptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B33',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalEmptySubtitle: {
    fontSize: 16,
    color: '#8899A6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalCreateTripButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  modalCreateTripText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTripsList: {
    padding: 20,
  },
  modalTripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E1E8ED',
    backgroundColor: '#F8F9FA',
  },
  modalTripItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  modalTripImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  modalTripInfo: {
    flex: 1,
  },
  modalTripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2B33',
    marginBottom: 4,
  },
  modalTripDestination: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  modalTripDates: {
    fontSize: 12,
    color: '#8899A6',
  },

  // Styles pour les fonctionnalités avancées d'images
  mainImageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  mainImageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  imageNumber: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  imageActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  imageActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reorderButtons: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  reorderButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Styles pour la modal de visualisation d'images
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerScroll: {
    flex: 1,
  },
  imageViewerContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: width - 40,
    height: '80%',
  },
  imageViewerInfo: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageViewerCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  imageViewerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  imageViewerActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageViewerActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
  },

  // Styles pour les détails de voyage avancés
  selectedTripDates: {
    fontSize: 12,
    color: '#8899A6',
    marginTop: 2,
  },
  tripDetailsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tripDetailText: {
    fontSize: 11,
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tripActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  tripActionButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePostScreen; 