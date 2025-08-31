import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Trip } from '../../services/tripService';
import { useAuthStore } from '../../store';
import { tripSavedService } from '../../services/tripSavedService';
import { activityService, Activity } from '../../services/activityService';
import { imageService } from '../../services/imageService';
import { tripService } from '../../services/tripService';
import { likeService } from '../../services/likeService';
import { commentService } from '../../services/commentService';

import ImageCarousel from '../../components/ui/ImageCarousel';
import UserInfoCard from '../../components/ui/UserInfoCard';
import CommentsModal from '../../components/ui/CommentsModal';

interface TripDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      tripId?: string;
      id?: string;
    };
  };
}

const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const tripId = route.params?.tripId || route.params?.id;
  
  console.log('🔍 TripDetailsScreen - Paramètres reçus:', route.params);
  console.log('🔍 TripDetailsScreen - tripId:', tripId);
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Définir loadTripDetails avant son utilisation
  const loadTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tripId) {
        throw new Error('ID du voyage manquant');
      }
      
      console.log('🔍 Chargement des détails du voyage:', tripId);
      
      // Récupérer les vraies données du voyage depuis l'API
      const tripData = await tripService.getTripById(tripId);
      
      // Vérifier que les données sont valides
      if (!tripData || !tripData.id) {
        throw new Error('Données de voyage invalides');
      }
      
      // S'assurer que l'utilisateur est correctement défini
      const tripWithUser: Trip = {
        ...tripData,
        // S'assurer que l'objet user existe et est complet
        user: tripData.user || {
          id: tripData.created_by || 'unknown',
          username: 'utilisateur',
          first_name: '',
          last_name: '',
          avatar_url: imageService.getDefaultImageURL('avatar'),
          email: '',
          created_at: tripData.created_at || '',
          updated_at: tripData.updated_at || ''
        },
        // S'assurer que les images existent
        images: tripData.images && tripData.images.length > 0 ? tripData.images : [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&crop=faces,center',
          'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=600&fit=crop&crop=faces,center',
        ],
        // S'assurer que la destination existe
        destination: tripData.destination || tripData.location?.city || 'Destination inconnue',
        // S'assurer que les tags existent
        tags: tripData.tags || tripData.travel_categories || []
      };
      
      console.log('✅ Voyage récupéré avec utilisateur:', tripWithUser);
      console.log('✅ Données utilisateur:', tripWithUser.user);
      setTrip(tripWithUser);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails du voyage:', error);
      setError('Impossible de charger les détails du voyage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId && typeof tripId === 'string') {
      loadTripDetails();
    }
  }, [tripId]);

  useEffect(() => {
    if (trip && user && trip.id) {
      console.log('🔍 TripDetailsScreen - Chargement des données supplémentaires pour le voyage:', trip.id);
      
      // Charger les données avec un délai pour éviter les erreurs 429
      const loadAdditionalData = async () => {
        try {
          await checkIfTripSaved();
          await new Promise(resolve => setTimeout(resolve, 100)); // Délai de 100ms
          
          await loadTripActivities();
          await new Promise(resolve => setTimeout(resolve, 100)); // Délai de 100ms
          
          await checkIfLiked();
          await new Promise(resolve => setTimeout(resolve, 100)); // Délai de 100ms
          
          await loadLikesCount();
          await new Promise(resolve => setTimeout(resolve, 100)); // Délai de 100ms
          
          await loadCommentsCount();
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données supplémentaires:', error);
        }
      };
      
      loadAdditionalData();
    }
  }, [trip, user]);

  // Vérifier si tripId est défini
  if (!tripId) {
    console.error('❌ TripDetailsScreen - tripId est undefined!');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Erreur: ID du voyage manquant</Text>
      </View>
    );
  }

  const checkIfTripSaved = async () => {
    if (!trip || !trip.id) {
      console.log('⚠️ TripDetailsScreen - Impossible de vérifier la sauvegarde: voyage ou ID manquant');
      return;
    }
    try {
      const saved = await tripSavedService.isTripSaved(trip.id);
      setIsSaved(saved);
    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification du statut de sauvegarde:', error);
      // En cas d'erreur 429, ne pas afficher d'alerte pour éviter le spam
      if (error?.response?.status !== 429) {
        console.log('⚠️ Statut de sauvegarde non disponible');
      }
    }
  };

  const loadTripActivities = async () => {
    if (!trip || !trip.id) {
      console.log('⚠️ TripDetailsScreen - Impossible de charger les activités: voyage ou ID manquant');
      return;
    }
    try {
      setLoadingActivities(true);
      const tripActivities = await activityService.getTripActivities(trip.id);
      setActivities(tripActivities);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des activités:', error);
      // En cas d'erreur 429, ne pas afficher d'alerte pour éviter le spam
      if (error?.response?.status !== 429) {
        console.log('⚠️ Activités non disponibles');
      }
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleUserPress = () => {
    if (trip?.created_by && trip.created_by !== 'unknown') {
      navigation.navigate('PublicProfile', { userId: trip.created_by });
    } else {
      Alert.alert('Information', 'Profil utilisateur non disponible');
    }
  };

  const checkIfLiked = async () => {
    if (!trip || !trip.id) {
      console.log('⚠️ TripDetailsScreen - Impossible de vérifier le like: voyage ou ID manquant');
      return;
    }
    try {
      const liked = await likeService.isTripLiked(trip.id);
      setIsLiked(liked);
    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification du like:', error);
      // En cas d'erreur 429, ne pas afficher d'alerte pour éviter le spam
      if (error?.response?.status !== 429) {
        console.log('⚠️ Statut de like non disponible');
      }
    }
  };

  const loadLikesCount = async () => {
    if (!trip || !trip.id) {
      console.log('⚠️ TripDetailsScreen - Impossible de charger le nombre de likes: voyage ou ID manquant');
      return;
    }
    try {
      const count = await likeService.getTripLikesCount(trip.id);
      setLikesCount(count);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement du nombre de likes:', error);
      // En cas d'erreur 429, ne pas afficher d'alerte pour éviter le spam
      if (error?.response?.status !== 429) {
        console.log('⚠️ Nombre de likes non disponible');
      }
    }
  };

  const loadCommentsCount = async () => {
    if (!trip || !trip.id) {
      console.log('⚠️ TripDetailsScreen - Impossible de charger le nombre de commentaires: voyage ou ID manquant');
      return;
    }
    try {
      const response = await commentService.getTripComments(trip.id, 1, 1);
      setCommentsCount(response.total);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement du nombre de commentaires:', error);
      // En cas d'erreur 429, ne pas afficher d'alerte pour éviter le spam
      if (error?.response?.status !== 429) {
        console.log('⚠️ Nombre de commentaires non disponible');
      }
    }
  };

  const handleLike = async () => {
    if (!trip || !user) return;
    
    try {
      if (isLiked) {
        await likeService.unlikeTrip(trip.id);
        setIsLiked(false);
        // Mettre à jour le compteur immédiatement
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likeService.likeTrip(trip.id);
        setIsLiked(true);
        // Mettre à jour le compteur immédiatement
        setLikesCount(prev => prev + 1);
      }
      // Recharger le nombre de likes depuis le serveur pour confirmation
      setTimeout(() => {
        loadLikesCount();
      }, 500);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le like');
    }
  };

  const handleComment = () => {
    setShowCommentsModal(true);
  };

  const handleShare = () => {
    Alert.alert('Fonctionnalité', 'Fonctionnalité de partage à implémenter');
  };

  const handleSaveTrip = async () => {
    if (!trip) return;
    
    try {
      setSaving(true);
      
      if (isSaved) {
        // Retirer des favoris
        await tripSavedService.unsaveTrip(trip.id);
        setIsSaved(false);
        Alert.alert('Succès', 'Voyage retiré des favoris');
      } else {
        // Ajouter aux favoris
        await tripSavedService.saveTrip(trip.id);
        setIsSaved(true);
        Alert.alert('Succès', 'Voyage ajouté aux favoris');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Fonctions utilitaires pour les activités
  const getActivityIcon = (): keyof typeof Ionicons.glyphMap => {
    return 'location-outline';
  };

  const formatActivityTime = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const startStr = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (endTime) {
      const end = new Date(endTime);
      const endStr = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  };

    if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[0]} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Chargement des détails...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.semantic.error} />
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error || 'Voyage non trouvé'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={loadTripDetails}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
                                  {/* Carousel d'images */}
          <ImageCarousel
            images={trip.images || []}
            height={300}
            showPagination={true}
            showFullscreen={true}
            autoPlay={false}
            onImagePress={(index) => console.log('Image pressée:', index)}
            onImageError={(index, error) => console.error('Erreur image:', index, error)}
            style={styles.imageContainer}
          />

        {/* Informations du voyage */}
        <View style={styles.content}>
          {/* En-tête avec titre et actions */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                {trip.title}
              </Text>
                             <Text style={[styles.destination, { color: theme.colors.text.secondary }]}>
                 {trip.destination || 'Destination non spécifiée'}
               </Text>
            </View>
                         <View style={styles.actions}>
               <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                 <Ionicons 
                   name={isLiked ? "heart" : "heart-outline"} 
                   size={28} 
                   color={isLiked ? '#ff4757' : theme.colors.text.secondary} 
                 />
               </TouchableOpacity>
               <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
                 <Ionicons 
                   name="chatbubble-outline" 
                   size={28} 
                   color={theme.colors.text.secondary} 
                 />
               </TouchableOpacity>
               <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                 <Ionicons 
                   name="share-outline" 
                   size={28} 
                   color={theme.colors.text.secondary} 
                 />
               </TouchableOpacity>
             </View>
          </View>

                                 {/* Informations utilisateur */}
            <UserInfoCard
              userId={trip.created_by || 'unknown'}
              username={trip.user?.username || 'utilisateur'}
              firstName={trip.user?.first_name || ''}
              lastName={trip.user?.last_name || ''}
              avatarUrl={
                trip.user?.avatar_url || 
                imageService.getDefaultImageURL('avatar')
              }
              createdAt={trip.created_at}
              onPress={handleUserPress}
              loading={false}
            />

          {/* Description */}
          {trip.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: theme.colors.text.primary }]}>
                {trip.description}
              </Text>
            </View>
          )}

          {/* Informations de voyage */}
          <View style={styles.tripInfo}>
                         <View style={styles.infoRow}>
               <Ionicons name="calendar" size={20} color={theme.colors.primary[0]} />
               <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                 {trip.start_date ? new Date(trip.start_date).toLocaleDateString('fr-FR') : 'Non défini'} - {trip.end_date ? new Date(trip.end_date).toLocaleDateString('fr-FR') : 'Non défini'}
               </Text>
             </View>
            {trip.budget && (
              <View style={styles.infoRow}>
                <Ionicons name="wallet" size={20} color={theme.colors.primary[0]} />
                <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                  Budget: {trip.budget}€
                </Text>
              </View>
            )}
                         <View style={styles.statsRow}>
               <View style={styles.statItem}>
                 <Ionicons name="heart" size={16} color={theme.colors.semantic.error} />
                 <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                   {likesCount} j'aime
                 </Text>
               </View>
               <View style={styles.statItem}>
                 <Ionicons name="chatbubble" size={16} color={theme.colors.primary[0]} />
                 <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                   {commentsCount} commentaires
                 </Text>
               </View>
             </View>
          </View>

                                {/* Tags */}
            {trip.tags && trip.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={[styles.tagsTitle, { color: theme.colors.text.primary }]}>
                  Tags
                </Text>
                <View style={styles.tagsList}>
                  {trip.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: theme.colors.primary[0] + '20' }]}
                    >
                      <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Itinéraires/Activités */}
            <View style={styles.itineraryContainer}>
              <Text style={[styles.itineraryTitle, { color: theme.colors.text.primary }]}>
                Itinéraire
              </Text>
              
              {loadingActivities ? (
                <View style={styles.loadingActivities}>
                  <ActivityIndicator size="small" color={theme.colors.primary[0]} />
                  <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                    Chargement de l'itinéraire...
                  </Text>
                </View>
              ) : activities.length > 0 ? (
                                 <View style={styles.activitiesList}>
                   {activities.map((activity) => (
                     <View key={activity.id} style={styles.activityItem}>
                      <View style={styles.activityHeader}>
                                                 <View style={styles.activityIcon}>
                           <Ionicons 
                             name={getActivityIcon()} 
                             size={20} 
                             color={theme.colors.primary[0]} 
                           />
                         </View>
                        <View style={styles.activityInfo}>
                          <Text style={[styles.activityTitle, { color: theme.colors.text.primary }]}>
                            {activity.title}
                          </Text>
                          {activity.description && (
                            <Text style={[styles.activityDescription, { color: theme.colors.text.secondary }]}>
                              {activity.description}
                            </Text>
                          )}
                          <View style={styles.activityMeta}>
                            <Text style={[styles.activityTime, { color: theme.colors.text.secondary }]}>
                              {formatActivityTime(activity.startTime, activity.endTime)}
                            </Text>
                            {activity.location && (
                              <Text style={[styles.activityLocation, { color: theme.colors.text.secondary }]}>
                                📍 {activity.location.city}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noActivities}>
                  <Ionicons name="map-outline" size={48} color={theme.colors.text.secondary} />
                  <Text style={[styles.noActivitiesText, { color: theme.colors.text.secondary }]}>
                    Aucun itinéraire planifié pour ce voyage
                  </Text>
                </View>
              )}
            </View>

                       {/* Actions pour les utilisateurs non-créateurs */}
                            {user && trip.created_by !== user.id && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton, 
                    { 
                      backgroundColor: isSaved ? theme.colors.semantic.success : theme.colors.primary[0],
                      opacity: saving ? 0.7 : 1
                    }
                  ]}
                  onPress={handleSaveTrip}
                  disabled={saving}
                >
                  <Ionicons 
                    name={isSaved ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Enregistrement...' : (isSaved ? 'Retirer des favoris' : 'Sauvegarder le voyage')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.itineraryButton, { backgroundColor: theme.colors.primary[1] }]}
                  onPress={() => Alert.alert('Fonctionnalité', 'Voir les différents itinéraires')}
                >
                  <Ionicons name="map-outline" size={20} color="#fff" />
                  <Text style={styles.itineraryButtonText}>Voir les itinéraires</Text>
                </TouchableOpacity>
              </View>
                         )}

                           {/* Section des commentaires */}
              <View style={styles.commentsSection}>
                <View style={styles.commentsHeader}>
                  <Text style={[styles.commentsTitle, { color: theme.colors.text.primary }]}>
                    Commentaires ({commentsCount})
                  </Text>
                  <TouchableOpacity 
                    style={styles.commentsToggleButton}
                    onPress={handleComment}
                  >
                    <Ionicons 
                      name="chatbubble-outline" 
                      size={20} 
                      color={theme.colors.primary[0]} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
                  </View>
        </ScrollView>
        
        {/* Modal des commentaires */}
        <CommentsModal
          visible={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          tripId={trip.id}
          tripTitle={`Commentaires - ${trip.title}`}
        />
      </View>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Styles pour le carousel d'images
  imageContainer: {
    position: 'relative',
    height: 300, // Augmenter la hauteur pour un meilleur affichage
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  destination: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  tripInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
     tagText: {
     fontSize: 14,
     fontWeight: '500',
   },
   actionsContainer: {
     marginTop: 24,
     paddingTop: 16,
     borderTopWidth: 1,
     borderTopColor: 'rgba(0,0,0,0.1)',
   },
   saveButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
     marginBottom: 12,
   },
   saveButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: '600',
     marginLeft: 8,
   },
   itineraryButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
   },
       itineraryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    // Styles pour les itinéraires
    itineraryContainer: {
      marginTop: 24,
      marginBottom: 16,
    },
    itineraryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    loadingActivities: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    activitiesList: {
      gap: 12,
    },
    activityItem: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 14,
      marginBottom: 8,
      lineHeight: 20,
    },
    activityMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    activityTime: {
      fontSize: 12,
      fontWeight: '500',
    },
    activityLocation: {
      fontSize: 12,
    },
    noActivities: {
      alignItems: 'center',
      paddingVertical: 32,
    },
         noActivitiesText: {
       marginTop: 12,
       fontSize: 16,
       textAlign: 'center',
     },
     commentsSection: {
       marginTop: 24,
       paddingTop: 16,
       borderTopWidth: 1,
       borderTopColor: 'rgba(0,0,0,0.1)',
     },
     commentsHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 16,
     },
     commentsTitle: {
       fontSize: 18,
       fontWeight: '600',
     },
     commentsToggleButton: {
       padding: 8,
     },

     statsRow: {
       flexDirection: 'row',
       justifyContent: 'space-around',
       alignItems: 'center',
       marginTop: 8,
       paddingTop: 12,
       borderTopWidth: 1,
       borderTopColor: 'rgba(0,0,0,0.1)',
     },
     statItem: {
       flexDirection: 'row',
       alignItems: 'center',
       gap: 6,
     },
     statText: {
       fontSize: 14,
       fontWeight: '500',
     },
   });

export default TripDetailsScreen;
