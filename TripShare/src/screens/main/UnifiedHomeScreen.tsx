import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  Alert,
  Image,
  FlatList,
  Modal,
  Share,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import SimpleMapView from '../../components/places/SimpleMapView';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { tripShareApi } from '../../services/tripShareApi';
import { Trip } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Types pour les notifications
interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'trip' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
  data?: any;
}

// Types pour les posts sociaux (mockés)
interface SocialPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    level: string;
    trips: number;
  };
  caption: string;
  location: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  timestamp: string;
  tags?: string[];
  content?: {
    type: string;
    url: string;
    images?: string[]; // Pour le carrousel Instagram
  };
  tripInfo?: {
    id?: string;
    destination: string;
    budget: string;
    duration: string;
    difficulty?: string;
    latitude?: number;
    longitude?: number;
    highlights?: string[];
    steps: Array<{
      order: number;
      title: string;
      description?: string;
      duration?: string;
    }>;
    placesVisited?: Array<{
      id: string;
      name: string;
      description?: string;
      isVisited: boolean;
      visitDate?: string;
    }>;
  };
}

interface PostFilters {
  userPreferences?: string[];
}

const UnifiedHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useAppTheme();
  const { user, logout } = useSimpleAuth();
  
  // Vérification de l'authentification
  useRequireAuth();
  
  // Animations pour 2025
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  // Fonction utilitaire pour gérer les erreurs d'authentification
  const handleAuthError = (error: any, context: string = '') => {
    if (error.message && (
      error.message.includes('Token invalide') || 
      error.message.includes('401') || 
      error.message.includes('Unauthorized') ||
      error.message.includes('Refresh failed')
    )) {
      console.log(`🔐 Token expiré (${context}), déconnexion automatique...`);
      
      // Nettoyer les tokens et forcer la reconnexion
      logout();
      
      Alert.alert(
        'Session expirée',
        'Votre session a expiré. Veuillez vous reconnecter.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation vers l'écran de connexion
              navigation.navigate('Auth' as never);
            }
          }
        ]
      );
      return true; // Indique qu'une erreur d'auth a été gérée
    }
    return false; // Pas d'erreur d'auth
  };
  
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPost, setMapPost] = useState<SocialPost | null>(null);
  const postRef = useRef<{ [key: string]: number }>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Animations d'entrée 2025
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    loadPosts();
    loadNotifications();
  }, []);

  // Recharger les voyages quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 HomeScreen focus - Rechargement des voyages');
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    setLoadingFeed(true);
    try {
      console.log('🔄 Chargement des voyages depuis l\'API...');
      
      // Récupérer les voyages publics depuis l'API
      const trips: any[] = await tripShareApi.listPublicTrips(20, 0);
      console.log('✅ Voyages récupérés:', trips.length);
      
      // Debug: Afficher le premier voyage pour voir sa structure
      if (trips.length > 0) {
        console.log('🔍 Premier voyage (structure complète):', JSON.stringify(trips[0], null, 2));
      }
      
      // Convertir les voyages en posts sociaux
      const apiPosts: SocialPost[] = trips.map((trip: any, index) => {
        // Debug: Afficher les informations utilisateur pour chaque voyage
        console.log(`🔍 Voyage ${index + 1} - Infos utilisateur:`, {
          username: trip.username,
          first_name: trip.first_name,
          last_name: trip.last_name,
          created_by: trip.created_by,
          avatar_url: trip.avatar_url
        });
        
        // Utiliser les vraies informations utilisateur
        const userName = trip.username || trip.first_name || 'Voyageur';
        const userDisplayName = trip.first_name && trip.last_name ? 
          `${trip.first_name} ${trip.last_name}` : 
          userName;
        
        console.log(`✅ Nom affiché pour voyage ${index + 1}:`, userDisplayName);
        
        // Générer un avatar de fallback sécurisé
        const generateFallbackAvatar = (name: string) => {
          const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10) || 'user';
          return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
        };
        
        const user = {
          id: trip.created_by || trip.id || 'unknown',
          name: userDisplayName,
          avatar: trip.avatar_url || generateFallbackAvatar(userDisplayName),
          verified: false,
          level: 'Intermédiaire',
          trips: 1,
        };

        // Extraire la localisation
        const location = trip.location ? 
          (typeof trip.location === 'string' ? trip.location : 
           `${trip.location.city || 'Ville'}, ${trip.location.country || 'Pays'}`) : 
          'Destination inconnue';

        // Calculer la durée si possible
        let duration = 'Durée non spécifiée';
        if (trip.start_date && trip.end_date) {
          const startDate = new Date(trip.start_date);
          const endDate = new Date(trip.end_date);
          const durationMs = endDate.getTime() - startDate.getTime();
          const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
          duration = durationDays === 1 ? '1 jour' : `${durationDays} jours`;
        }

        // Debug: Afficher les informations des photos
        console.log(`🔍 Voyage ${index + 1} - Photos:`, trip.photos);
        
        // Extraire toutes les URLs des photos pour le carrousel Instagram
        let tripImages: string[] = [];
        if (trip.photos && trip.photos.length > 0) {
          tripImages = trip.photos.map((photo: any) => 
            typeof photo === 'string' ? photo : photo.url
          );
        } else {
          // Image par défaut si aucune photo
          tripImages = ['https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'];
        }
        
        const tripImage = tripImages[0]; // Première image pour compatibilité
        console.log(`🖼️ Voyage ${index + 1} - Images du carrousel:`, tripImages);

        // Créer le post social avec les vraies données
        return {
          id: trip.id,
          user,
          location,
          content: {
            type: 'image',
            url: tripImage,
            images: tripImages, // Toutes les images pour le carrousel
          },
          caption: `🗺️ ${trip.title}\n\n${trip.description || ''}`,
          likes: 0, // Pas de données mockées
          comments: 0, // Pas de données mockées
          shares: 0, // Pas de données mockées
          isLiked: false,
          isSaved: false,
          timestamp: 'Maintenant',
          tags: trip.tags || [], // Utiliser les vrais tags si disponibles
          tripInfo: {
            id: trip.id,
            destination: location,
            duration,
            budget: trip.budget ? `${trip.budget}€` : 'Non spécifié',
            difficulty: trip.trip_type || 'Non spécifié',
            latitude: trip.location?.latitude || 0,
            longitude: trip.location?.longitude || 0,
            highlights: trip.travel_categories || [], // Utiliser les vraies catégories
            steps: trip.steps || [], // Utiliser les vraies étapes
            placesVisited: trip.places_visited || [],
          },
        };
      });

      console.log('✅ Posts convertis:', apiPosts.length);
      setPosts(apiPosts);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des voyages:', error);
      
      // Gérer les erreurs d'authentification
      if (handleAuthError(error, 'loadPosts')) {
        return;
      }
      
      // En cas d'erreur, ne pas afficher de données mockées
      console.log('⚠️ Erreur API - Aucune donnée mockée affichée');
      setPosts([]); // Liste vide au lieu de données mockées
    } finally {
      setLoadingFeed(false);
    }
  };

  const loadNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: 'Nouveau like',
        message: 'Sarah Aventurière a aimé votre post sur Bali',
        timestamp: '5min',
        isRead: false,
        user: {
          id: '1',
          name: 'Sarah Aventurière',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah Aventurière',
        },
      },
      {
        id: '2',
        type: 'comment',
        title: 'Nouveau commentaire',
        message: 'Alex Nomade a commenté votre voyage à Tokyo',
        timestamp: '12min',
        isRead: false,
        user: {
          id: '2',
          name: 'Alex Nomade',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex Nomade',
        },
      },
      {
        id: '3',
        type: 'follow',
        title: 'Nouveau follower',
        message: 'Marie Exploratrice vous suit maintenant',
        timestamp: '1h',
        isRead: false,
        user: {
          id: '3',
          name: 'Marie Exploratrice',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie Exploratrice',
        },
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Nouveau badge !',
        message: 'Vous avez débloqué le badge "Explorateur"',
        timestamp: '2h',
        isRead: true,
      },
      {
        id: '5',
        type: 'reminder',
        title: 'Rappel voyage',
        message: 'Votre voyage à Paris commence dans 3 jours',
        timestamp: '1j',
        isRead: true,
      },
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  };

  const handleRefreshFeed = async () => {
    setRefreshingFeed(true);
    await loadPosts();
    setRefreshingFeed(false);
  };

  const handleLike = async (postId: string) => {
    try {
      // Mise à jour optimisée sans re-render complet
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            const newLikeCount = post.isLiked ? post.likes - 1 : post.likes + 1;
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: newLikeCount
            };
          }
          return post;
        });
        return updatedPosts;
      });
      
      console.log('✅ Like mis à jour pour le voyage:', postId);
      
      // TODO: Implémenter l'appel API pour persister le like
      // const response = await tripShareApi.likeTrip(postId);
      
    } catch (error: any) {
      if (handleAuthError(error, 'handleLike')) return;
      console.log('❌ Erreur lors du like:', error.message);
    }
  };

  const handleComment = (postId: string) => {
    try {
      // Mise à jour optimisée du compteur de commentaires
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1
            };
          }
          return post;
        });
        return updatedPosts;
      });
      
      console.log('💬 Commentaire ajouté pour le voyage:', postId);
      
      // Afficher une alerte temporaire
      Alert.alert(
        'Commentaires',
        'Fonctionnalité en cours de développement. Votre commentaire sera bientôt disponible !',
        [{ text: 'OK' }]
      );
      
      // TODO: Implémenter l'écran de commentaires
      // navigation.navigate('Comments', { postId });
      
    } catch (error: any) {
      if (handleAuthError(error, 'handleComment')) return;
      console.log('❌ Erreur lors du commentaire:', error.message);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, isSaved: !post.isSaved }
            : post
        )
      );
      
      console.log('✅ Sauvegarde mise à jour pour le voyage:', postId);
      
      // TODO: Implémenter l'appel API pour persister la sauvegarde
      
    } catch (error: any) {
      if (handleAuthError(error, 'handleSave')) return;
      console.log('❌ Erreur lors de la sauvegarde:', error.message);
    }
  };

  const handleShare = async (post: SocialPost) => {
    try {
      const shareMessage = `${post.user.name} a partagé son voyage à ${post.location}:\n\n${post.caption}\n\nDécouvrez plus sur TripShare !`;
      await Share.share({
        message: shareMessage,
        title: `Voyage à ${post.location}`,
        url: `tripshare://post/${post.id}`,
      });
      try {
        // Mocked share increment
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === post.id
              ? { ...p, shares: p.shares + 1 }
              : p
          )
        );
      } catch (error: any) {
        if (handleAuthError(error, 'handleShare')) return;
      }
    } catch {}
  };

  const handleCopyItinerary = async (post: SocialPost) => {
    if (!post.tripInfo?.steps) return;
    try {
      // Mocked copy itinerary
      const itineraryText = `Itinéraire ${post.tripInfo.destination} par ${post.user.name}:\n\n${post.tripInfo.steps.map(step => `${step.order}. ${step.title}${step.description ? ` - ${step.description}` : ''}${step.duration ? ` (${step.duration})` : ''}`).join('\n')}\n\nBudget: ${post.tripInfo.budget}\nDurée: ${post.tripInfo.duration}`;
      await Clipboard.setStringAsync(itineraryText);
      if (Platform.OS === 'android') Alert.alert('Succès', 'Itinéraire copié dans le presse-papiers !');
    } catch {}
  };

  const handleOpenMap = (post: SocialPost) => {
    if (!post.tripInfo?.latitude || !post.tripInfo?.longitude) return;
    setMapPost(post);
    setShowMapModal(true);
  };

  const handleOpenInMaps = async (post: SocialPost) => {
    if (!post.tripInfo?.latitude || !post.tripInfo?.longitude) return;
    const { latitude, longitude } = post.tripInfo;
    const url = Platform.OS === 'ios' ? `http://maps.apple.com/?q=${latitude},${longitude}` : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${post.tripInfo.destination})`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else await Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
    } catch {}
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem2025,
        { backgroundColor: theme.colors.background.card },
        !item.isRead && { borderLeftColor: theme.colors.primary[0], borderLeftWidth: 3 }
      ]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      {item.user && (
        <Image source={{ uri: item.user.avatar }} style={styles.notificationAvatar2025} />
      )}
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.notificationMessage, { color: theme.colors.text.secondary }]}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: theme.colors.text.secondary }]}>
          {item.timestamp}
        </Text>
      </View>
      {!item.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary[0] }]} />
      )}
    </TouchableOpacity>
  );

  // Composant séparé pour la carte avec animations
  const ModernTripCard = React.memo(({ post, index }: { post: SocialPost; index: number }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [localIsLiked, setLocalIsLiked] = useState(post.isLiked);
    const [localLikes, setLocalLikes] = useState(post.likes);
    const [localComments, setLocalComments] = useState(post.comments);
    const [localIsSaved, setLocalIsSaved] = useState(post.isSaved);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }, 0);
      
      return () => clearTimeout(timer);
    }, [index]);

    const handleScrollEnd = (event: any) => {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentImageIndex(newIndex);
    };
    
    const getCurrentIndex = () => {
      return currentImageIndex;
    };

    const handleLocalLike = () => {
      setLocalIsLiked(!localIsLiked);
      setLocalLikes(localIsLiked ? localLikes - 1 : localLikes + 1);
      console.log('✅ Like local mis à jour pour le voyage:', post.id);
    };

    const handleLocalComment = () => {
      setLocalComments(localComments + 1);
      console.log('💬 Commentaire local ajouté pour le voyage:', post.id);
      
      // Navigation vers l'écran de commentaires
      navigation.navigate('Comments', { 
        postId: post.id,
        postTitle: post.tripInfo?.destination || 'Voyage',
        postImage: post.content?.url || post.content?.images?.[0]
      });
    };

    const handleLocalSave = () => {
      setLocalIsSaved(!localIsSaved);
      console.log('✅ Sauvegarde locale mise à jour pour le voyage:', post.id);
    };
    
    return (
      <Animated.View 
        style={[
          styles.modernCard2025, 
          { 
            backgroundColor: theme.colors.background.card,
            opacity: cardAnim,
            transform: [
              { translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })},
              { scale: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
              })}
            ]
          }
        ]}
      >
        {/* Header utilisateur avec glassmorphism */}
        <View style={styles.postHeader2025}>
          <TouchableOpacity style={styles.userSection2025}>
            <View style={styles.avatarContainer2025}>
              <Image 
                source={{ 
                  uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.user.name || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=100`
                }} 
                style={styles.userAvatar2025}
                onError={() => {
                  console.log('❌ Erreur chargement avatar pour:', post.user.name);
                }}
                defaultSource={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9&size=100' }}
              />
            </View>
            <View style={styles.userInfo2025}>
              <View style={styles.userNameRow2025}>
                <Text style={[styles.userName2025, { color: theme.colors.text.primary }]}>
                  {post.user.name}
                </Text>
                {post.user.verified && (
                  <View style={styles.verifiedBadge2025}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
              <View style={styles.userDetails2025}>
                <Text style={[styles.userLevel2025, { color: theme.colors.text.secondary }]}>
                  {post.user.level} • {post.user.trips} voyages
                </Text>
                <View style={styles.locationRow2025}>
                  <Ionicons name="location" size={12} color={theme.colors.text.secondary} />
                  <Text style={[styles.location2025, { color: theme.colors.text.secondary }]}>
                    {post.location.split(',')[0]}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

        </View>
        
        {/* Carrousel d'images avec design 2025 */}
        {post.content && (
          <View style={styles.imageContainer2025}>
            {post.content.images && post.content.images.length > 1 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.carouselContainer2025}
                onMomentumScrollEnd={handleScrollEnd}
              >
                {post.content.images.map((imageUrl, imageIndex) => (
                  <View key={imageIndex} style={styles.carouselImageContainer2025}>
                    <Image 
                      source={{ 
                        uri: imageUrl.startsWith('file://') 
                          ? 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'
                          : imageUrl 
                      }} 
                      style={styles.carouselImage2025} 
                      resizeMode="cover" 
                      onError={() => {
                        console.log('❌ Erreur chargement image carrousel:', imageUrl);
                        if (imageUrl.startsWith('file://')) {
                          console.log('📱 Image locale non accessible sur cette plateforme');
                        }
                      }}
                      defaultSource={{ uri: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800' }}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.3)']}
                      style={styles.imageGradient2025}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.singleImageContainer2025}>
                <Image 
                  source={{ 
                    uri: post.content.url.startsWith('file://') 
                      ? 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'
                      : post.content.url 
                  }} 
                  style={styles.postImage2025} 
                  resizeMode="cover" 
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.imageGradient2025}
                />
              </View>
            )}
            
            {/* Indicateurs de pagination modernes */}
            {post.content.images && post.content.images.length > 1 && (
              <View style={styles.carouselIndicators2025}>
                {post.content.images.map((_, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.carouselDot2025, 
                      index === getCurrentIndex() && styles.carouselDotActive2025
                    ]} 
                  />
                ))}
              </View>
            )}
            
            {/* Badge de destination flottant */}
            <View style={styles.destinationBadge2025}>
              <Ionicons name="location" size={16} color="white" />
              <Text style={styles.destinationText2025} numberOfLines={1}>
                {(post.tripInfo?.destination || post.location).split(',')[0]}
              </Text>
            </View>
            
            {post.content.type === 'video' && (
              <View style={styles.videoOverlay2025}>
                <Ionicons name="play-circle" size={40} color="white" />
              </View>
            )}
          </View>
        )}
        
        {/* Actions sociales avec micro-interactions */}
        <View style={styles.actionsSection2025}>
          <View style={styles.leftActions2025}>
            <TouchableOpacity 
              style={styles.actionButton2025} 
              onPress={handleLocalLike}
              activeOpacity={0.7}
            >
              <Animated.View style={[
                styles.likeButtonInner2025,
                localIsLiked && { transform: [{ scale: 1.2 }] }
              ]}>
                <Ionicons 
                  name={localIsLiked ? 'heart' : 'heart-outline'} 
                  size={24} 
                  color={localIsLiked ? '#ff4757' : theme.colors.text.secondary} 
                />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton2025} 
              onPress={handleLocalComment}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton2025} 
              onPress={() => handleShare(post)}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.actionButton2025} 
            onPress={handleLocalSave}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={localIsSaved ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={localIsSaved ? theme.colors.primary[0] : theme.colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Compteurs avec design moderne */}
        <View style={styles.countersSection2025}>
          <Text style={[styles.likesCount2025, { color: theme.colors.text.primary }]}>
            {localLikes} j'aime
          </Text>
          {localComments > 0 && (
            <Text style={[styles.commentsCount2025, { color: theme.colors.text.secondary }]}>
              Voir les {localComments} commentaires
            </Text>
          )}
        </View>
        
        {/* Caption avec typographie moderne */}
        <View style={styles.captionSection2025}>
          <Text style={[styles.captionText2025, { color: theme.colors.text.primary }]}>
            <Text style={styles.captionUsername2025}>{post.user.name}</Text> {post.caption}
          </Text>
        </View>
        
        {/* Informations du voyage avec glassmorphism */}
        {post.tripInfo && (
          <View style={[styles.tripInfo2025, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.tripHeader2025}>
              <Text style={[styles.tripTitle2025, { color: theme.colors.text.primary }]}>
                🗺️ Voyage à {post.tripInfo.destination.split(',')[0]}
              </Text>
            </View>
            <Text style={[styles.tripDetails2025, { color: theme.colors.text.secondary }]}>
              {post.tripInfo.duration} • {post.tripInfo.budget} • {post.tripInfo.difficulty}
            </Text>
            
            {post.tripInfo.highlights && (
              <Text style={[styles.tripHighlights2025, { color: theme.colors.text.secondary }]}>
                ✨ {post.tripInfo.highlights.join(' • ')}
              </Text>
            )}
            
            {/* Lieux visités avec design moderne */}
            {post.tripInfo.placesVisited && post.tripInfo.placesVisited.length > 0 && (
              <View style={styles.placesVisitedContainer2025}>
                <Text style={[styles.placesVisitedTitle2025, { color: theme.colors.text.primary }]}>
                  📍 Lieux visités ({post.tripInfo.placesVisited.filter(p => p.isVisited).length}/{post.tripInfo.placesVisited.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.placesVisitedList2025}>
                  {post.tripInfo.placesVisited.map((place, index) => (
                    <View
                      key={place.id}
                      style={[
                        styles.placeVisitedChip2025,
                        {
                          backgroundColor: place.isVisited ? '#4CAF50' : theme.colors.background.card,
                          borderColor: place.isVisited ? '#4CAF50' : theme.colors.border.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name={place.isVisited ? 'checkmark-circle' : 'ellipse-outline'}
                        size={12}
                        color={place.isVisited ? 'white' : theme.colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.placeVisitedText2025,
                          {
                            color: place.isVisited ? 'white' : theme.colors.text.primary,
                          },
                        ]}
                      >
                        {place.name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Actions du voyage avec design 2025 */}
            <View style={styles.tripActions2025}>
              <TouchableOpacity 
                style={[styles.tripActionButton2025, { borderColor: theme.colors.border.primary }]} 
                onPress={() => handleCopyItinerary(post)}
              >
                <Ionicons name="copy-outline" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.tripActionText2025, { color: theme.colors.primary[0] }]}>Copier</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tripActionButton2025, { borderColor: theme.colors.border.primary }]} 
                onPress={() => handleOpenMap(post)}
              >
                <Ionicons name="map-outline" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.tripActionText2025, { color: theme.colors.primary[0] }]}>Carte</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tripActionButton2025, { borderColor: theme.colors.border.primary }]} 
                onPress={() => handleOpenInMaps(post)}
              >
                <Ionicons name="navigate-outline" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.tripActionText2025, { color: theme.colors.primary[0] }]}>Ouvrir</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tripActionButton2025, { borderColor: theme.colors.border.primary }]} 
                onPress={() => navigation.navigate('TripPlacesManager', { 
                  tripId: post.tripInfo?.id || '', 
                  tripTitle: post.tripInfo?.destination || 'Voyage' 
                })}
              >
                <Ionicons name="location-outline" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.tripActionText2025, { color: theme.colors.primary[0] }]}>Lieux</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Timestamp moderne */}
        <Text style={[styles.timestamp2025, { color: theme.colors.text.secondary }]}>
          {post.timestamp}
        </Text>
      </Animated.View>
    );
  });

  const renderModernTripCard = ({ item: post, index }: { item: SocialPost; index: number }) => {
    return <ModernTripCard post={post} index={index} />;
  };

  return (
    <SafeAreaView style={[styles.container2025, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header moderne avec glassmorphism */}
      <Animated.View 
        style={[
          styles.modernHeader2025, 
          { 
            backgroundColor: theme.colors.background.card,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            })}]
          }
        ]}
      >
        <View style={styles.headerContent2025}>
          <View style={styles.greetingSection2025}>
            <Text style={[styles.greetingText2025, { color: theme.colors.text.primary }]}>
              Bonjour, {user?.username || user?.name || 'Voyageur'} 👋
            </Text>
            <Text style={[styles.subtitleText2025, { color: theme.colors.text.secondary }]}>
              Découvrez de nouvelles aventures
            </Text>
          </View>
          
          <View style={styles.headerActions2025}>
            <TouchableOpacity 
              style={[styles.iconButton2025, { backgroundColor: theme.colors.background.primary }]}
              onPress={() => setShowNotifications(!showNotifications)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text.primary} />
              {unreadCount > 0 && (
                <View style={[styles.notificationBadge2025, { backgroundColor: '#ff4757' }]}>
                  <Text style={styles.notificationBadgeText2025}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Notifications avec glassmorphism */}
      {showNotifications && (
        <Animated.View 
          style={[
            styles.notificationsContainer2025, 
            { backgroundColor: theme.colors.background.card }
          ]}
        >
          <View style={styles.notificationsHeader2025}>
            <Text style={[styles.notificationsTitle2025, { color: theme.colors.text.primary }]}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            style={styles.notificationsList2025}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {/* Feed moderne avec animations */}
      {loadingFeed ? (
        <View style={styles.loadingContainer2025}>
          <ActivityIndicator size="large" color={theme.colors.primary[0]} />
          <Text style={[styles.loadingText2025, { color: theme.colors.text.secondary }]}>
            Chargement des voyages...
          </Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyFeedContainer2025}>
          <View style={[styles.emptyIconContainer2025, { backgroundColor: theme.colors.primary[0] + '15' }]}>
            <Ionicons name="airplane-outline" size={48} color={theme.colors.primary[0]} />
          </View>
          <Text style={[styles.emptyFeedTitle2025, { color: theme.colors.text.primary }]}>
            Aucun voyage partagé
          </Text>
          <Text style={[styles.emptyFeedSubtitle2025, { color: theme.colors.text.secondary }]}>
            Soyez le premier à partager votre aventure !{'\n'}
            Créez un voyage et inspirez d'autres voyageurs.
          </Text>
          <TouchableOpacity 
            style={[styles.createFirstTripButton2025, { backgroundColor: theme.colors.primary[0] }]}
            onPress={() => navigation.navigate('SimpleCreateTrip')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createFirstTripButtonText2025}>Créer mon premier voyage</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={posts}
            renderItem={renderModernTripCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.modernFeedContainer2025}
            refreshControl={<RefreshControl refreshing={refreshingFeed} onRefresh={handleRefreshFeed} />}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {/* Bouton flottant moderne avec glassmorphism */}
      <TouchableOpacity 
        style={[styles.modernFloatingButton2025, { backgroundColor: theme.colors.primary[0] }]}
        onPress={() => navigation.navigate('SimpleCreateTrip')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal carte moderne */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={[styles.mapModalContainer2025, { backgroundColor: theme.colors.background.primary }]}>
          <View style={[styles.mapModalHeader2025, { borderBottomColor: theme.colors.border.primary }]}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.mapModalTitle2025, { color: theme.colors.text.primary }]}>{mapPost?.tripInfo?.destination}</Text>
            <TouchableOpacity onPress={() => mapPost && handleOpenInMaps(mapPost)}>
              <Ionicons name="navigate-outline" size={24} color={theme.colors.primary[0]} />
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            {mapPost?.tripInfo?.latitude && mapPost?.tripInfo?.longitude && (
              <SimpleMapView
                latitude={mapPost.tripInfo.latitude}
                longitude={mapPost.tripInfo.longitude}
                title={mapPost.tripInfo.destination}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container2025: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  
  // Header moderne
  modernHeader2025: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent2025: {
    flex: 1,
  },
  greetingSection2025: {
    marginBottom: 4,
  },
  greetingText2025: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitleText2025: {
    fontSize: 14,
    fontWeight: '400',
  },
  headerActions2025: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton2025: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge2025: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText2025: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  
  // Notifications
  notificationsContainer2025: {
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  notificationsHeader2025: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  notificationsTitle2025: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  notificationsList2025: { 
    maxHeight: 250 
  },
  notificationItem2025: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    alignItems: 'center',
  },
  notificationAvatar2025: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 12 
  },
  notificationContent: { 
    flex: 1 
  },
  notificationTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 2 
  },
  notificationMessage: { 
    fontSize: 12, 
    marginBottom: 4 
  },
  notificationTime: { 
    fontSize: 10 
  },
  unreadDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  
  // Loading et Empty states
  loadingContainer2025: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loadingText2025: { 
    marginTop: 10, 
    fontSize: 14 
  },
  emptyFeedContainer2025: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer2025: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyFeedTitle2025: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyFeedSubtitle2025: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createFirstTripButton2025: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  createFirstTripButtonText2025: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Feed moderne
  modernFeedContainer2025: { 
    padding: 16,
    gap: 16,
  },
  
  // Cartes modernes
  modernCard2025: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  postImage2025: {
    width: '100%',
    height: '100%',
  },
  userAvatar2025: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName2025: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userDetails2025: {
    marginTop: 2,
  },
  userLevel2025: {
    fontSize: 12,
    fontWeight: '400',
  },
  locationRow2025: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location2025: {
    fontSize: 12,
    fontWeight: '400',
  },
  userSection2025: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer2025: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
  },
  verifiedBadge2025: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },
  moreButton2025: {
    padding: 8,
  },
  imageContainer2025: {
    position: 'relative',
    height: 200,
    marginBottom: 12,
  },
  carouselContainer2025: {
    width: '100%',
    height: '100%',
  },
  carouselImageContainer2025: {
    width: width,
    height: '100%',
  },
  carouselImage2025: {
    width: '100%',
    height: '100%',
  },
  carouselIndicators2025: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  carouselDot2025: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  carouselDotActive2025: {
    backgroundColor: 'white',
  },
  imageGradient2025: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: 16,
  },
  singleImageContainer2025: {
    position: 'relative',
    height: '100%',
    borderRadius: 16,
  },
  destinationBadge2025: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destinationText2025: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  videoOverlay2025: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionsSection2025: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftActions2025: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton2025: {
    padding: 8,
  },
  likeButtonInner2025: {
    transform: [{ scale: 1 }],
  },
  postHeader2025: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo2025: {
    flex: 1,
  },
  userNameRow2025: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernFloatingButton2025: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mapModalContainer2025: { 
    flex: 1 
  },
  mapModalHeader2025: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1 
  },
  mapModalTitle2025: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  mapContainer: { 
    flex: 1 
  },
  countersSection2025: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  likesCount2025: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentsCount2025: {
    fontSize: 14,
    fontWeight: '400',
  },
  captionSection2025: {
    marginBottom: 12,
  },
  captionText2025: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionUsername2025: {
    fontWeight: '600',
  },
  tripInfo2025: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  tripHeader2025: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle2025: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripStats2025: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDetails2025: {
    fontSize: 12,
    fontWeight: '400',
  },
  tripHighlights2025: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  placesVisitedContainer2025: {
    marginBottom: 12,
  },
  placesVisitedTitle2025: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  placesVisitedList2025: {
    flexDirection: 'row',
  },
  placeVisitedChip2025: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
  },
  placeVisitedText2025: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  tripActions2025: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  tripActionButton2025: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tripActionText2025: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp2025: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
});

export default UnifiedHomeScreen; 