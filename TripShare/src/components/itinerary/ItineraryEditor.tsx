import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ItineraryStep } from '../../services/itinerarySuggestionsService';

interface ItineraryEditorProps {
  steps: ItineraryStep[];
  onStepsChange: (steps: ItineraryStep[]) => void;
  destination: string;
}

const ItineraryEditor: React.FC<ItineraryEditorProps> = ({
  steps,
  onStepsChange,
  destination,
}) => {
  const { theme } = useAppTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStep, setEditingStep] = useState<ItineraryStep | null>(null);
      const [newStep, setNewStep] = useState<Partial<ItineraryStep>>({
      title: '',
      description: '',
      suggestedDuration: '2h',
      category: 'activity',
      priority: 'optional',
      estimatedCost: 'medium',
      tips: '',
      photos: [],
    });

  const categories = [
    { value: 'monument', label: '🏛️ Monument' },
    { value: 'museum', label: '🏛️ Musée' },
    { value: 'restaurant', label: '🍽️ Restaurant' },
    { value: 'shopping', label: '🛍️ Shopping' },
    { value: 'nature', label: '🌿 Nature' },
    { value: 'activity', label: '🎯 Activité' },
    { value: 'accommodation', label: '🏨 Hébergement' },
  ];

  const priorities = [
    { value: 'must-see', label: '⭐ Incontournable' },
    { value: 'recommended', label: '👍 Recommandé' },
    { value: 'optional', label: '💡 Optionnel' },
  ];

  const costs = [
    { value: 'free', label: '🆓 Gratuit' },
    { value: 'low', label: '💰 Faible' },
    { value: 'medium', label: '💰💰 Moyen' },
    { value: 'high', label: '💰💰💰 Élevé' },
  ];

  const handleImagePick = async (index?: number) => {
    try {
      // Demander les permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin des permissions pour accéder à la caméra et à la galerie.');
        return;
      }

      // Afficher les options
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Annuler', 'Prendre une photo', 'Choisir depuis la galerie'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await takePicture(index);
            } else if (buttonIndex === 2) {
              await pickImage(index);
            }
          }
        );
      } else {
        Alert.alert(
          'Ajouter une photo',
          'Choisissez une source',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Prendre une photo', onPress: () => takePicture(index) },
            { text: 'Galerie', onPress: () => pickImage(index) },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra ou à la galerie.');
    }
  };

  const takePicture = async (index?: number) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // TODO: Migrer vers MediaType quand disponible
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        if (typeof index === 'number') {
          // Modifier une photo existante
          const newPhotos = [...(newStep.photos || [])];
          newPhotos[index] = result.assets[0].uri;
          setNewStep(prev => ({ ...prev, photos: newPhotos }));
        } else {
          // Ajouter une nouvelle photo
          const newPhotos = [...(newStep.photos || []), result.assets[0].uri];
          setNewStep(prev => ({ ...prev, photos: newPhotos }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo.');
    }
  };

  const pickImage = async (index?: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // TODO: Migrer vers MediaType quand disponible
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        if (typeof index === 'number') {
          // Modifier une photo existante
          const newPhotos = [...(newStep.photos || [])];
          newPhotos[index] = result.assets[0].uri;
          setNewStep(prev => ({ ...prev, photos: newPhotos }));
        } else {
          // Ajouter une nouvelle photo
          const newPhotos = [...(newStep.photos || []), result.assets[0].uri];
          setNewStep(prev => ({ ...prev, photos: newPhotos }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image.');
    }
  };

  const handleAddStep = () => {
    if (!newStep.title?.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    const step: ItineraryStep = {
      id: `custom-${Date.now()}`,
      title: newStep.title!,
      description: newStep.description || 'Lieu créé par l\'utilisateur',
      city: destination,
      coordinates: { latitude: 0, longitude: 0 }, // Coordonnées par défaut
      suggestedDuration: newStep.suggestedDuration || '2h',
      category: newStep.category as any || 'activity',
      priority: newStep.priority as any || 'optional',
      bestTimeToVisit: ['morning', 'afternoon'],
      estimatedCost: newStep.estimatedCost as any || 'medium',
      tips: newStep.tips || 'Lieu personnalisé à découvrir',
      photos: newStep.photos || [],
      photoUrl: newStep.photos?.[0] || null,
    };

    console.log('Ajout d\'une nouvelle étape:', step);
    const updatedSteps = [...steps, step];
    onStepsChange(updatedSteps);
    
    // Feedback visuel
    Alert.alert('Succès', `Étape "${step.title}" ajoutée à votre itinéraire !`);
    
    setNewStep({
      title: '',
      description: '',
      suggestedDuration: '2h',
      category: 'activity',
      priority: 'optional',
      estimatedCost: 'medium',
      tips: '',
      photos: [],
    });
    setShowAddModal(false);
  };

  const handleEditStep = (index: number) => {
    console.log('Édition de l\'étape:', steps[index]);
    setEditingStep(steps[index]);
    setNewStep(steps[index]);
    console.log('Nouvelle étape définie:', steps[index]);
    setShowAddModal(true);
  };

  const handleUpdateStep = () => {
    if (!editingStep || !newStep.title?.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    const updatedSteps = steps.map((step, index) => {
      if (step.id === editingStep.id) {
        return {
          ...step,
          title: newStep.title,
          description: newStep.description || step.description,
          suggestedDuration: newStep.suggestedDuration || step.suggestedDuration,
          category: newStep.category as any || step.category,
          priority: newStep.priority as any || step.priority,
          estimatedCost: newStep.estimatedCost as any || step.estimatedCost,
          tips: newStep.tips || step.tips,
        };
      }
      return step;
    });

    onStepsChange(updatedSteps);
    setEditingStep(null);
    setNewStep({
      title: '',
      description: '',
      suggestedDuration: '2h',
      category: 'activity',
      priority: 'optional',
      estimatedCost: 'medium',
      tips: '',
      photos: [],
    });
    setShowAddModal(false);
  };

  const handleDeleteStep = (index: number) => {
    Alert.alert(
      'Supprimer l\'étape',
      `Êtes-vous sûr de vouloir supprimer "${steps[index].title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedSteps = steps.filter((_, i) => i !== index);
            onStepsChange(updatedSteps);
          },
        },
      ]
    );
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...steps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    onStepsChange(updatedSteps);
  };

  const renderStep = (step: ItineraryStep, index: number) => {
    const categoryInfo = categories.find(c => c.value === step.category);
    const priorityInfo = priorities.find(p => p.value === step.priority);
    const costInfo = costs.find(c => c.value === step.estimatedCost);

    return (
      <View key={step.id} style={[styles.stepCard, { backgroundColor: theme.colors.background.card }]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={[styles.stepNumberText, { color: theme.colors.primary[0] }]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              {step.title}
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              {step.description}
            </Text>
          </View>
          <View style={styles.stepActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditStep(index)}
            >
              <Ionicons name="pencil" size={16} color={theme.colors.primary[0]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteStep(index)}
            >
              <Ionicons name="trash" size={16} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
            <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
              {step.suggestedDuration}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
              {categoryInfo?.label}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
              {priorityInfo?.label}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
              {costInfo?.label}
            </Text>
          </View>
        </View>

        {index > 0 && (
          <TouchableOpacity
            style={styles.moveButton}
            onPress={() => handleMoveStep(index, index - 1)}
          >
            <Ionicons name="arrow-up" size={16} color={theme.colors.primary[0]} />
          </TouchableOpacity>
        )}
        {index < steps.length - 1 && (
          <TouchableOpacity
            style={styles.moveButton}
            onPress={() => handleMoveStep(index, index + 1)}
          >
            <Ionicons name="arrow-down" size={16} color={theme.colors.primary[0]} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          📋 Itinéraire ({steps.length} étapes)
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={() => {
            console.log('Ouverture du modal d\'ajout');
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Ajouter une étape</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
        {steps.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
              Aucune étape ajoutée
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.secondary }]}>
              Ajoutez des étapes pour créer votre itinéraire
            </Text>
          </View>
        ) : (
          steps.map((step, index) => renderStep(step, index))
        )}
      </ScrollView>

      {/* Modal pour ajouter/éditer une étape */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.modalHeader}>
               <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                 {editingStep ? 'Modifier l\'étape' : 'Ajouter une étape'}
               </Text>
               <TouchableOpacity onPress={() => setShowAddModal(false)}>
                 <Ionicons name="close" size={24} color={theme.colors.text.primary} />
               </TouchableOpacity>
             </View>
             
             <ScrollView 
                style={styles.modalBody}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={styles.modalBodyContainer}>
              <View style={styles.photoSection}>
                <View style={styles.photoHeader}>
                  <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                    Photos
                  </Text>
                  <TouchableOpacity
                    style={[styles.addPhotoButton, { backgroundColor: theme.colors.primary[0] }]}
                    onPress={() => handleImagePick()}
                  >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.photosContainer}
                >
                  {(!newStep.photos || newStep.photos.length === 0) ? (
                    <View style={[styles.photoPreview, { borderColor: theme.colors.border.primary }]}>
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="images-outline" size={40} color={theme.colors.text.secondary} />
                        <Text style={[styles.placeholderText, { color: theme.colors.text.secondary }]}>
                          Aucune photo
                        </Text>
                      </View>
                    </View>
                  ) : (
                    newStep.photos.map((photo, index) => (
                      <View key={index} style={[styles.photoPreview, { borderColor: theme.colors.border.primary }]}>
                        <Image
                          source={{ uri: photo }}
                          style={styles.photo}
                          resizeMode="cover"
                        />
                        <View style={styles.photoActions}>
                          <TouchableOpacity
                            style={[styles.photoActionButton, { backgroundColor: theme.colors.primary[0] }]}
                            onPress={() => handleImagePick(index)}
                          >
                            <Ionicons name="create" size={16} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.photoActionButton, { backgroundColor: '#FF4444' }]}
                            onPress={() => {
                              // Supprimer cette photo
                              const newPhotos = newStep.photos.filter((_, i) => i !== index);
                              setNewStep(prev => ({ ...prev, photos: newPhotos }));
                            }}
                          >
                            <Ionicons name="trash" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Titre *
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary 
                  }]}
                  value={newStep.title}
                  onChangeText={(text) => setNewStep(prev => ({ ...prev, title: text }))}
                  placeholder="Nom du lieu"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Description
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary 
                  }]}
                  value={newStep.description}
                  onChangeText={(text) => setNewStep(prev => ({ ...prev, description: text }))}
                  placeholder="Description du lieu"
                  placeholderTextColor={theme.colors.text.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Durée suggérée
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary 
                  }]}
                  value={newStep.suggestedDuration}
                  onChangeText={(text) => setNewStep(prev => ({ ...prev, suggestedDuration: text }))}
                  placeholder="Ex: 2h, 30min"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Catégorie
                </Text>
                <View style={styles.optionsGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: newStep.category === category.value 
                            ? theme.colors.primary[0] 
                            : theme.colors.background.card,
                          borderColor: theme.colors.border.primary,
                        }
                      ]}
                      onPress={() => setNewStep(prev => ({ ...prev, category: category.value as any }))}
                    >
                      <Text style={[
                        styles.optionText,
                        { 
                          color: newStep.category === category.value 
                            ? 'white' 
                            : theme.colors.text.primary 
                        }
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Priorité
                </Text>
                <View style={styles.optionsGrid}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: newStep.priority === priority.value 
                            ? theme.colors.primary[0] 
                            : theme.colors.background.card,
                          borderColor: theme.colors.border.primary,
                        }
                      ]}
                      onPress={() => setNewStep(prev => ({ ...prev, priority: priority.value as any }))}
                    >
                      <Text style={[
                        styles.optionText,
                        { 
                          color: newStep.priority === priority.value 
                            ? 'white' 
                            : theme.colors.text.primary 
                        }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Coût estimé
                </Text>
                <View style={styles.optionsGrid}>
                  {costs.map((cost) => (
                    <TouchableOpacity
                      key={cost.value}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: newStep.estimatedCost === cost.value 
                            ? theme.colors.primary[0] 
                            : theme.colors.background.card,
                          borderColor: theme.colors.border.primary,
                        }
                      ]}
                      onPress={() => setNewStep(prev => ({ ...prev, estimatedCost: cost.value as any }))}
                    >
                      <Text style={[
                        styles.optionText,
                        { 
                          color: newStep.estimatedCost === cost.value 
                            ? 'white' 
                            : theme.colors.text.primary 
                        }
                      ]}>
                        {cost.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                  Conseils
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.colors.background.card,
                    borderColor: theme.colors.border.primary,
                    color: theme.colors.text.primary 
                  }]}
                  value={newStep.tips}
                  onChangeText={(text) => setNewStep(prev => ({ ...prev, tips: text }))}
                  placeholder="Conseils pour cette étape"
                  placeholderTextColor={theme.colors.text.secondary}
                  multiline
                  numberOfLines={2}
                />
              </View>
              </View>
             </ScrollView>

             <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border.primary }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text.primary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary[0] }]}
                onPress={editingStep ? handleUpdateStep : handleAddStep}
              >
                <Text style={styles.saveButtonText}>
                  {editingStep ? 'Modifier' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
                         </View>
           </View>
         </SafeAreaView>
       </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  photoSection: {
    marginBottom: 20,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addPhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  photoActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  photoActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stepsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  stepCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  stepDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  moveButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '95%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBodyContainer: {
    width: '100%',
    flex: 1,
  },
  modalBody: {
    width: '100%',
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    flex: 1,
    minWidth: '48%',
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor handled in style prop
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default ItineraryEditor;
