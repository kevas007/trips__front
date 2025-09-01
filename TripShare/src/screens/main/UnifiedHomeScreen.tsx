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
import { useAuthStore } from '../../store';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useAppTheme } from '../../hooks/useAppTheme';
import SimpleMapView from '../../components/places/SimpleMapView';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { tripService, Trip } from '../../services/tripService';
import { likeService } from '../../services/likeService';
import { useGlobalRefresh } from '../../hooks/useGlobalRefresh';
import { notificationService, Notification as NotificationType } from '../../services/notificationService';

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
    tags?: string[];
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

interface SmartAction {
  icon: string;
  action: () => void | Promise<void>;
  count?: number;
  color: string;
}

// Fonctions utilitaires pour l'organisation des feeds
const isRelevantForUser = (post: SocialPost, userPreferences?: string[]) => {
  if (!userPreferences) return true;
  return userPreferences.some(pref => 
    post.tags?.includes(pref) || 
    post.tripInfo?.destination.toLowerCase().includes(pref.toLowerCase())
  );
};

const isFromFollowing = (post: SocialPost, following?: string[]) => {
  if (!following) return false;
  return following.includes(post.user?.id || '');
};

const isNearby = (post: SocialPost, userLocation?: { lat: number, lng: number }) => {
  if (!userLocation || !post.tripInfo?.latitude || !post.tripInfo?.longitude) return false;
  const distance = getDistance(
    userLocation.lat,
    userLocation.lng,
    post.tripInfo?.latitude || 0,
    post.tripInfo?.longitude || 0
  );
  return distance <= 100; // Dans un rayon de 100km
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};

const UnifiedHomeScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useAppTheme();
  const { user, logout } = useAuthStore();
  const { registerRefreshCallback, unregisterRefreshCallback } = useGlobalRefresh();
  
  // Nouveau système de navigation intelligente
  const smartNavigation = {
    toDetails: (tripId: string) => {
      navigation.navigate('TripDetails', { 
        id: tripId,
        transition: 'slide_from_right'
      });
    },
    toMap: (coordinates: { lat: number, lng: number }) => {
      navigation.navigate('MapView', { 
        ...coordinates,
        transition: 'modal'
      });
    },
    toProfile: (userId: string) => {
      navigation.navigate('UserProfile', { 
        id: userId,
        transition: 'fade'
      });
    }
  };
  // Chargement de tous les voyages publics avec données utilisateur
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  
  const loadAllTrips = async () => {
    try {
      setTripsLoading(true);
      console.log('🔍 UnifiedHomeScreen - Chargement de tous les voyages publics avec données utilisateur');
      
      // ✅ NOUVEAU : Appeler l'endpoint sans filtre pour récupérer tous les voyages
      const response = await tripService.getUserTrips();
      console.log('✅ UnifiedHomeScreen - Voyages récupérés:', response);
      
      // S'assurer que response.data existe et est un tableau
      if (response && response.data && Array.isArray(response.data)) {
        // Vérifier que chaque élément est un objet valide
        const validTrips = response.data.filter(trip => trip && typeof trip === 'object');
        console.log(`✅ UnifiedHomeScreen - ${validTrips.length} voyages valides récupérés`);
        
        // 🔍 DÉBOGAGE : Afficher les détails de chaque voyage
        validTrips.forEach((trip, index) => {
          console.log(`📋 Voyage ${index + 1}:`, {
            id: trip.id,
            title: trip.title,
            created_by: trip.created_by,
            user: trip.user,
            user_username: trip.user?.username,
            user_avatar: trip.user?.avatar_url,
            has_user_data: !!trip.user
          });
        });
        
        setTrips(validTrips);
      } else {
        console.log('⚠️ UnifiedHomeScreen - Réponse invalide, utilisation d\'un tableau vide');
        setTrips([]);
      }
    } catch (error) {
      console.error('❌ UnifiedHomeScreen - Erreur lors du chargement des voyages:', error);
      // Ne pas afficher d'erreur à l'utilisateur, juste un tableau vide
      setTrips([]);
    } finally {
      setTripsLoading(false);
    }
  };
  
  // Vérification de l'authentification
  useRequireAuth();
  
  // Charger les voyages au montage du composant
  useEffect(() => {
    loadAllTrips();
    loadNotifications();
  }, []);
  
  // Recharger les voyages quand l'écran est focalisé
  useFocusEffect(
    React.useCallback(() => {
      loadAllTrips();
    }, [])
  );

  // S'enregistrer dans le système de rafraîchissement global
  useEffect(() => {
    registerRefreshCallback('home', loadAllTrips);
    
    return () => {
      unregisterRefreshCallback('home');
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, loadAllTrips]);
  
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
  
  // Organisation intelligente des feeds
  const [organizedFeeds, setOrganizedFeeds] = useState({
    featured: [] as SocialPost[],    // Voyages mis en avant
    trending: [] as SocialPost[],    // Tendances
    forYou: [] as SocialPost[],      // Recommandations personnalisées
    following: [] as SocialPost[],   // Voyages des personnes suivies
    nearby: [] as SocialPost[],      // Voyages proches
    recent: [] as SocialPost[]       // Derniers voyages
  });

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPost, setMapPost] = useState<SocialPost | null>(null);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const postRef = useRef<{ [key: string]: number }>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fonction pour rendre une carte de voyage
  const renderTripCard = ({ item }: { item: Trip }) => {
    // Protection contre les items invalides
    if (!item || typeof item !== 'object') {
      console.warn('⚠️ UnifiedHomeScreen - Item invalide dans renderTripCard:', item);
      return null;
    }
    
    return (
      <TouchableOpacity 
        style={[styles.tripCard, { backgroundColor: theme.colors.background.secondary }]}
        onPress={() => {
          console.log('🔍 UnifiedHomeScreen - Navigation vers TripDetails avec item:', item);
          console.log('🔍 UnifiedHomeScreen - item.id:', item.id);
          if (item.id) {
            navigation.navigate('TripDetails', { tripId: item.id });
          } else {
            console.error('❌ UnifiedHomeScreen - item.id est undefined ou null');
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.tripCardHeader}>
          <View style={styles.tripCardUserInfo}>
            <Image 
              source={{ 
                uri: (item.user && typeof item.user === 'object' && item.user.avatar_url) || 
                      (item.avatar_url) || 
                      'https://via.placeholder.com/40' 
              }}
              style={styles.tripCardAvatar}
            />
            <View style={styles.tripCardUserDetails}>
              <Text style={[styles.tripCardUserName, { color: theme.colors.text.primary }]}>
                {item.username || 
                 (item.user && typeof item.user === 'object' && item.user.username) || 
                 (item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : null) ||
                 'Utilisateur'}
              </Text>
              <Text style={[styles.tripCardDestination, { color: theme.colors.text.secondary }]}>
                {item.destination || 'Destination inconnue'}
              </Text>
            </View>
          </View>
          <Text style={[styles.tripCardDate, { color: theme.colors.text.secondary }]}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
          </Text>
        </View>
        
        <Text style={[styles.tripCardTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
        
        {item.description && (
          <Text style={[styles.tripCardDescription, { color: theme.colors.text.secondary }]}>
            {item.description}
          </Text>
        )}
        
        {/* Aperçu des images du voyage */}
        {(item.images && Array.isArray(item.images) && item.images.length > 0) && (
          <View style={styles.tripCardImages}>
            {item.images.filter(image => image && typeof image === 'string').slice(0, 3).map((image, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl(image) }}
                style={[
                  styles.tripCardImage,
                  index === 0 && styles.tripCardImageFirst,
                  index > 0 && styles.tripCardImageOverlap
                ]}
                resizeMode="cover"
              />
            ))}
            {item.images.length > 3 && (
              <View style={styles.tripCardImageOverlay}>
                <Text style={styles.tripCardImageCount}>+{item.images.length - 3}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.tripCardFooter}>
          <View style={styles.tripCardStats}>
            <Ionicons name="heart-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.tripCardStatText, { color: theme.colors.text.secondary }]}>
              {item.likes_count || 0}
            </Text>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.tripCardStatText, { color: theme.colors.text.secondary }]}>
              {item.comments_count || 0}
            </Text>
          </View>
          <View style={[styles.tripCardStatus, { backgroundColor: theme.colors.primary[0] + '20' }]}>
            <Text style={[styles.tripCardStatusText, { color: theme.colors.primary[0] }]}>
              {item.status === 'ongoing' ? 'En cours' : 
               item.status === 'completed' ? 'Terminé' : 
               item.status === 'planned' ? 'Planifié' :
               item.status === 'confirmed' ? 'Confirmé' :
               item.status === 'cancelled' ? 'Annulé' : 'Planifié'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Fonction pour gérer les URLs d'images
  const getImageUrl = (imageUrl: string | undefined, postId?: string, imageIndex?: number): string => {
    console.log('🔍 getImageUrl appelé avec:', { imageUrl, postId, imageIndex });
    
    // Vérifier que imageUrl existe et est une chaîne
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.log('⚠️ getImageUrl - URL invalide, utilisation du fallback');
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center';
    }
    
    // Si c'est une URL locale (file://), utiliser une image par défaut
    if (imageUrl.startsWith('file://')) {
      console.log('📱 Image locale détectée, utilisation du fallback');
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center';
    }
    
    // Si c'est une URL HTTP/HTTPS, l'utiliser directement
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('🌐 URL distante valide:', imageUrl);
      return imageUrl;
    }
    
    // Si c'est une URL relative du backend, utiliser le proxy d'images
    if (imageUrl.startsWith('/storage/') || imageUrl.startsWith('storage/')) {
      const cleanPath = imageUrl.replace(/^\/storage\//, '').replace(/^storage\//, '');
      const proxyUrl = `http://localhost:8085/images/${cleanPath}`;
      console.log('🔗 URL proxy backend:', proxyUrl);
      return proxyUrl;
    }
    
    // Fallback par défaut - image Unsplash
    console.log('⚠️ URL non reconnue, utilisation du fallback Unsplash');
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center';
  };



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
      console.log('🔄 Chargement des voyages depuis le store...');
      
      // Vérifier si l'utilisateur est connecté
      if (!user || !user.id) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer les voyages publics depuis le service tripService
      const response = await tripService.getPublicTrips(1, 20);
      const trips: any[] = response?.data || [];

      if (!Array.isArray(trips)) {
        console.error('❌ Format de données invalide:', trips);
        throw new Error('Format de données invalide');
      }

      console.log('✅ Voyages récupérés:', trips.length);
      
      // Debug: Afficher le premier voyage pour voir sa structure
      if (trips.length > 0) {
        console.log('🔍 Premier voyage (structure complète):', JSON.stringify(trips[0], null, 2));
      }
      
      // Convertir les voyages en posts sociaux
      const apiPosts: SocialPost[] = trips
        .filter((trip: any) => trip && typeof trip === 'object')
        .map((trip: any, index) => {
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
        
        console.log(`✅ Username affiché pour voyage ${index + 1}:`, userName);
        
        // Générer un avatar de fallback sécurisé
        const generateFallbackAvatar = (name: string) => {
          const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10) || 'user';
          return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
        };
        
        const user = {
          id: trip.created_by || trip.id || 'unknown',
          name: trip.username || trip.email?.split('@')[0] || 'Voyageur', // Utiliser le username comme nom d'affichage
          username: trip.username || trip.email?.split('@')[0] || 'user',
          email: trip.email,
          avatar: trip.avatar_url || trip.avatar || trip.user?.avatar_url || trip.user?.avatar,
          avatar_url: trip.avatar_url || trip.avatar || trip.user?.avatar_url || trip.user?.avatar,
          profile: {
            avatar_url: trip.user?.profile?.avatar_url || trip.avatar_url || trip.avatar
          },
          verified: false,
          level: 'Intermédiaire',
          trips: 1,
        };

        // Extraire la localisation
        const location = trip.location ? 
          (typeof trip.location === 'string' ? trip.location : 
           (trip.location && typeof trip.location === 'object' ? 
            `${trip.location.city || 'Ville'}, ${trip.location.country || 'Pays'}` : 
            'Destination inconnue')) : 
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
        console.log(`🔍 Voyage ${index + 1} - Type de photos:`, typeof trip.photos);
        if (trip.photos && Array.isArray(trip.photos) && trip.photos.length > 0) {
          console.log(`🔍 Voyage ${index + 1} - Premier photo:`, trip.photos[0]);
          console.log(`🔍 Voyage ${index + 1} - Type premier photo:`, typeof trip.photos[0]);
        }
        
        // Extraire toutes les URLs des photos pour le carrousel Instagram
        let tripImages: string[] = [];
        
        // Si le voyage a des photos directement attachées
        if (trip.photos && Array.isArray(trip.photos) && trip.photos.length > 0) {
          tripImages = trip.photos
            .filter((photo: any) => photo !== null && photo !== undefined)
            .map((photo: any) => {
              // Le backend retourne des objets TripPhoto avec un champ url (minuscule)
              if (typeof photo === 'object' && photo && photo.url) {
                return photo.url;
              }
              // Fallback pour les autres formats
              if (typeof photo === 'string') {
                return photo;
              }
              if (typeof photo === 'object' && photo && photo.URL) {
                return photo.URL;
              }
              return null;
            }).filter((url: string | null) => url !== null);
        }
        
        // Si aucune photo directe, essayer de récupérer les photos via l'API
        if (tripImages.length === 0 && trip.id) {
          try {
            console.log(`🔍 Tentative de récupération des photos pour le voyage ${trip.id}`);
            // Note: Cette récupération asynchrone sera gérée plus tard
            // Pour l'instant, on utilise les photos directes
          } catch (error) {
            console.warn(`⚠️ Impossible de récupérer les photos pour le voyage ${trip.id}:`, error);
          }
        }
        
        // Si aucune photo valide, utiliser une image par défaut Unsplash
        if (tripImages.length === 0) {
          tripImages = ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=faces,center'];
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
          likes: trip.likes_count || 0, // Utiliser les vraies données du backend
          comments: trip.comments_count || 0, // Utiliser les vraies données du backend
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
            latitude: (trip.location && typeof trip.location === 'object' && trip.location.latitude) || 0,
            longitude: (trip.location && typeof trip.location === 'object' && trip.location.longitude) || 0,
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

  const loadNotifications = async () => {
    try {
      console.log('🔍 UnifiedHomeScreen - Chargement des notifications depuis le backend');
      
      // Vérifier si l'utilisateur est connecté
      if (!user || !user.id) {
        console.log('⚠️ UnifiedHomeScreen - Utilisateur non connecté, pas de notifications');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await notificationService.getUserNotifications(1, 20);
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`✅ UnifiedHomeScreen - ${response.data.length} notifications récupérées`);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
      } else {
        console.log('⚠️ UnifiedHomeScreen - Réponse invalide, pas de notifications');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ UnifiedHomeScreen - Erreur lors du chargement des notifications:', error);
      // En cas d'erreur, utiliser un tableau vide
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleRefreshFeed = async () => {
    try {
      setRefreshingFeed(true);
      
      // Vérifier la connexion utilisateur
      if (!user?.id) {
        navigation.navigate('Auth' as never);
        return;
      }

      await loadPosts();
      
      // Message de succès silencieux (pas d'alerte)
      console.log('✅ Rafraîchissement réussi');
      
    } catch (error: any) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      
      // Gérer les erreurs d'authentification
      if (error.message?.includes('non connecté')) {
        navigation.navigate('Auth' as never);
        return;
      }
      
      // Pour les autres erreurs, afficher une notification discrète
      Alert.alert(
        'Erreur de connexion',
        'Vérifiez votre connexion internet et réessayez',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    } finally {
      setRefreshingFeed(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Mise à jour optimisée sans re-render complet
      setPosts(prevPosts => {
        const updatedPosts = (prevPosts || []).filter(post => post && typeof post === 'object').map(post => {
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
        const updatedPosts = (prevPosts || []).filter(post => post && typeof post === 'object').map(post => {
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
        (prevPosts || []).filter(post => post && typeof post === 'object').map(post =>
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
      const shareMessage = `${post.user && typeof post.user === 'object' ? post.user.name || 'Voyageur' : 'Voyageur'} a partagé son voyage à ${post.location}:\n\n${post.caption}\n\nDécouvrez plus sur TripShare !`;
      await Share.share({
        message: shareMessage,
        title: `Voyage à ${post.location}`,
        url: `tripshare://post/${post.id}`,
      });
      try {
        // Mocked share increment
        setPosts(prevPosts =>
          (prevPosts || []).filter(p => p && typeof p === 'object').map(p =>
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
      const itineraryText = `Itinéraire ${post.tripInfo?.destination || 'Destination'} par ${post.user && typeof post.user === 'object' ? post.user.name || 'Voyageur' : 'Voyageur'}:\n\n${(post.tripInfo?.steps || []).filter(step => step && typeof step === 'object').map(step => `${step.order || ''}. ${step.title || ''}${step.description ? ` - ${step.description}` : ''}${step.duration ? ` (${step.duration})` : ''}`).join('\n')}\n\nBudget: ${post.tripInfo?.budget || 'Budget non spécifié'}\nDurée: ${post.tripInfo?.duration || 'Durée non spécifiée'}`;
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
    const url = Platform.OS === 'ios' ? `http://maps.apple.com/?q=${latitude},${longitude}` : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${post.tripInfo?.destination || 'Destination'})`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else await Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
    } catch {}
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      (prev || []).filter(notif => notif && typeof notif === 'object').map(notif =>
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
      {item.user && typeof item.user === 'object' && (
        <Image source={{ uri: getAvatarUrl(item.user) }} style={styles.notificationAvatar2025} />
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
    // Animations et états
    const cardAnim = useRef(new Animated.Value(0)).current;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [localIsLiked, setLocalIsLiked] = useState(post.isLiked);
    const [localLikes, setLocalLikes] = useState(post.likes);
    const [localComments, setLocalComments] = useState(post.comments);
    const [localIsSaved, setLocalIsSaved] = useState(post.isSaved);
    
    const handleLocalLike = async () => {
      try {
        if (localIsLiked) {
          await likeService.unlikeTrip(post.id);
          setLocalIsLiked(false);
          setLocalLikes(prev => Math.max(0, prev - 1));
        } else {
          await likeService.likeTrip(post.id);
          setLocalIsLiked(true);
          setLocalLikes(prev => prev + 1);
        }
        console.log('✅ Like mis à jour pour le voyage:', post.id);
      } catch (error) {
        console.error('❌ Erreur lors du like:', error);
        // Revenir à l'état précédent en cas d'erreur
        setLocalIsLiked(localIsLiked);
      }
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
    
    // Actions intelligentes groupées
    const smartActions: Record<string, SmartAction> = {
      like: {
        icon: localIsLiked ? 'heart' : 'heart-outline',
        action: handleLocalLike,
        count: localLikes,
        color: localIsLiked ? '#FF4B4B' : theme.colors.text.secondary
      },
      comment: {
        icon: 'chatbubble-outline',
        action: handleLocalComment,
        count: localComments,
        color: theme.colors.text.secondary
      },
      save: {
        icon: localIsSaved ? 'bookmark' : 'bookmark-outline',
        action: handleLocalSave,
        color: localIsSaved ? theme.colors.primary[0] : theme.colors.text.secondary
      },
      share: {
        icon: 'share-social-outline',
        action: () => handleShare(post),
        color: theme.colors.text.secondary
      }
    };
    
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
    
    // Rendu intelligent des actions
    const renderSmartActions = () => (
      <View style={styles.actionBar}>
        {Object.entries(smartActions || {}).map(([key, action]) => (
          <TouchableOpacity
            key={key}
            style={styles.actionButton}
            onPress={action.action}
          >
            <Ionicons name={action.icon as any} size={24} color={action.color} />
            {action.count !== undefined && (
              <Text style={[styles.actionCount, { color: action.color }]}>
                {action.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );

    // Rendu du contenu contextuel
    const renderContextualContent = () => (
      <View style={styles.contextualContent}>
        {post.tripInfo && (
          <>
            <TouchableOpacity 
              style={styles.destinationButton}
              onPress={() => smartNavigation.toMap({
                lat: post.tripInfo?.latitude || 0,
                lng: post.tripInfo?.longitude || 0
              })}
            >
              <Text style={styles.destinationText}>
                📍 {post.tripInfo?.destination || 'Destination'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.tripDetails}>
              <Text style={styles.tripInfo}>
                ⏱️ {post.tripInfo?.duration || 'Durée non spécifiée'}
              </Text>
              <Text style={styles.tripInfo}>
                💰 {post.tripInfo?.budget || 'Budget non spécifié'}
              </Text>
              <Text style={styles.tripInfo}>
                🎯 {post.tripInfo?.difficulty || 'Difficulté non spécifiée'}
              </Text>
            </View>
          </>
        )}
      </View>
    );

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
                  uri: post.user && typeof post.user === 'object' ? getAvatarUrl(post.user) : 'https://api.dicebear.com/7.x/avataaars/png?seed=user&backgroundColor=b6e3f4,c0aede,d1d4f9&size=100'
                }} 
                style={styles.userAvatar2025}
                onError={(error) => {
                  console.log('❌ Erreur chargement avatar pour:', {
                    userName: post.user && typeof post.user === 'object' ? post.user.name || 'Voyageur' : 'Voyageur',
                    userId: post.user && typeof post.user === 'object' ? post.user.id || 'unknown' : 'unknown',
                    error: error.nativeEvent
                  });
                }}
                onLoad={() => {
                  console.log('✅ Avatar chargé avec succès pour:', post.user && typeof post.user === 'object' ? post.user.name || 'Voyageur' : 'Voyageur');
                }}
                defaultSource={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9&size=100' }}
              />
            </View>
            <View style={styles.userInfo2025}>
              <View style={styles.userNameRow2025}>
                <Text style={[styles.userName2025, { color: theme.colors.text.primary }]}>
                  {post.user && typeof post.user === 'object' ? post.user.name || 'Voyageur' : 'Voyageur'}
                </Text>
                {post.user && typeof post.user === 'object' && post.user.verified && (
                  <View style={styles.verifiedBadge2025}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
              <View style={styles.userDetails2025}>
                <Text style={[styles.userLevel2025, { color: theme.colors.text.secondary }]}>
                  {post.user && typeof post.user === 'object' ? (post.user.level || 'Intermédiaire') : 'Intermédiaire'} • {post.user && typeof post.user === 'object' ? (post.user.trips || 1) : 1} voyages
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
              <View style={styles.carouselContainer2025}>
                {(post.content.images || []).filter(imageUrl => imageUrl && typeof imageUrl === 'string').map((imageUrl, imageIndex) => (
                  <View key={imageIndex} style={styles.carouselImageContainer2025}>
                    <Image 
                      source={{ 
                        uri: getImageUrl(imageUrl, post.id, imageIndex)
                      }} 
                      style={styles.carouselImage2025} 
                      resizeMode="cover" 
                      onError={(error) => {
                        console.log('❌ Erreur chargement image carrousel:', {
                          imageUrl,
                          postId: post.id,
                          imageIndex,
                          error: error.nativeEvent
                        });
                      }}
                      onLoad={() => {
                        console.log('✅ Image chargée avec succès:', {
                          imageUrl,
                          postId: post.id,
                          imageIndex
                        });
                      }}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.3)']}
                      style={styles.imageGradient2025}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.singleImageContainer2025}>
                <Image 
                  source={{ 
                    uri: getImageUrl(post.content?.url || '', post.id, 0)
                  }} 
                  style={styles.postImage2025} 
                  resizeMode="cover" 
                  onError={(error) => {
                    console.log('❌ Erreur chargement image unique:', {
                      imageUrl: post.content?.url || '',
                      postId: post.id,
                      error: error.nativeEvent
                    });
                  }}
                  onLoad={() => {
                    console.log('✅ Image unique chargée avec succès:', {
                      imageUrl: post.content?.url || '',
                      postId: post.id
                    });
                  }}
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
                {(post.content.images || []).filter(imageUrl => imageUrl && typeof imageUrl === 'string').map((_, index) => (
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
            
            {/* Badge vidéo pour les voyages créés via la vidéo */}
            {(post.tripInfo?.tags?.includes('🎥 Vidéo Demo') || post.caption?.includes('🎥')) && (
              <View style={styles.videoBadge2025}>
                <Ionicons name="videocam" size={14} color="white" />
                <Text style={styles.videoBadgeText2025}>VIDÉO</Text>
              </View>
            )}
            
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
            <Text style={styles.captionUsername2025}>{post.user && typeof post.user === 'object' ? post.user.name || 'Voyageur' : 'Voyageur'}</Text> {post.caption}
          </Text>
        </View>
        
        {/* Informations du voyage avec glassmorphism */}
        {post.tripInfo && (
          <View style={[styles.tripInfo2025, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.tripHeader2025}>
              <Text style={[styles.tripTitle2025, { color: theme.colors.text.primary }]}>
                🗺️ Voyage à {(post.tripInfo?.destination || 'Destination').split(',')[0]}
              </Text>
            </View>
            <Text style={[styles.tripDetails2025, { color: theme.colors.text.secondary }]}>
              {post.tripInfo?.duration || 'Durée non spécifiée'} • {post.tripInfo?.budget || 'Budget non spécifié'} • {post.tripInfo?.difficulty || 'Difficulté non spécifiée'}
            </Text>
            
            {post.tripInfo?.highlights && (
              <Text style={[styles.tripHighlights2025, { color: theme.colors.text.secondary }]}>
                ✨ {(post.tripInfo?.highlights || []).join(' • ')}
              </Text>
            )}
            
            {/* Lieux visités avec design moderne */}
            {post.tripInfo?.placesVisited && post.tripInfo?.placesVisited.length > 0 && (
              <View style={styles.placesVisitedContainer2025}>
                <Text style={[styles.placesVisitedTitle2025, { color: theme.colors.text.primary }]}>
                  📍 Lieux visités ({(post.tripInfo?.placesVisited || []).filter(p => p && typeof p === 'object' && p.isVisited).length}/{(post.tripInfo?.placesVisited || []).length})
                </Text>
                <View style={styles.placesVisitedList2025}>
                  {(post.tripInfo?.placesVisited || []).filter(place => place && typeof place === 'object' && place.id).map((place, index) => (
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
                </View>
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

  // Rendu intelligent des feeds organisés
  const renderOrganizedFeeds = () => {
    const sections = [
      { title: "✨ À la une", data: organizedFeeds.featured, icon: "star" },
      { title: "🔥 Tendances", data: organizedFeeds.trending, icon: "trending-up" },
      { title: "🎯 Pour vous", data: organizedFeeds.forYou, icon: "heart" },
      { title: "👥 Abonnements", data: organizedFeeds.following, icon: "people" },
      { title: "📍 À proximité", data: organizedFeeds.nearby, icon: "location" },
      { title: "🕒 Récents", data: organizedFeeds.recent, icon: "time" }
    ];

    return sections.map(section => 
      section.data.length > 0 && (
        <View key={section.title} style={styles.feedSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name={section.icon as any} size={24} color={theme.colors.primary[0]} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              {section.title}
            </Text>
          </View>
          <View style={styles.sectionContent}>
            {(section.data || []).filter(post => post && typeof post === 'object' && post.id).map((post, index) => (
              <ModernTripCard key={post.id} post={post} index={index} />
            ))}
          </View>
        </View>
      )
    );
  };

  // Fonction pour rendre un post unifié (photo ou vidéo)
  const renderUnifiedPost = (trip: Trip) => {
    if (!trip || typeof trip !== 'object') {
      console.warn('⚠️ UnifiedHomeScreen - Trip invalide dans renderUnifiedPost:', trip);
      return null;
    }

    // Déterminer si c'est un voyage vidéo ou photo (basé sur les photos pour l'instant)
    const isVideoTrip = trip.photos && trip.photos.length > 0 && trip.photos[0]?.url?.includes('video');
    
    if (isVideoTrip) {
      return renderVideoPost(trip);
    } else {
      return renderImagePost(trip);
    }
  };

  // Fonction pour rendre un post vidéo
  const renderVideoPost = (trip: Trip) => {
    return (
      <View style={styles.videoPostContainer}>
        {/* Indicateur de type de contenu */}
        <View style={styles.contentTypeIndicator}>
          <Ionicons name="videocam" size={16} color="white" />
          <Text style={styles.contentTypeText}>VIDÉO</Text>
        </View>

        {/* Placeholder vidéo */}
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={64} color="white" />
        </View>

        {/* Actions vidéo (droite) */}
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="heart" size={24} color="white" />
            <Text style={styles.videoActionCount}>1.2k</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="chatbubble" size={24} color="white" />
            <Text style={styles.videoActionCount}>45</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="share" size={24} color="white" />
            <Text style={styles.videoActionCount}>Partager</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoActionButton}>
            <Ionicons name="bookmark" size={24} color="white" />
            <Text style={styles.videoActionCount}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>

        {/* Informations vidéo (droite) */}
        <View style={styles.videoInfo}>
          <View style={styles.videoInfoItem}>
            <Ionicons name="person" size={16} color="white" />
            <Text style={styles.videoInfoText}>Voyageur</Text>
          </View>
          <View style={styles.videoInfoItem}>
            <Ionicons name="location" size={16} color="white" />
            <Text style={styles.videoInfoText}>{trip.destination || 'Destination'}</Text>
          </View>
          <View style={styles.videoInfoItem}>
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.videoInfoText}>{trip.duration || '5 jours'}</Text>
          </View>
          <View style={styles.videoInfoItem}>
            <Ionicons name="wallet" size={16} color="white" />
            <Text style={styles.videoInfoText}>{trip.budget || '800€'}</Text>
          </View>
        </View>

        {/* Légende vidéo (bas) */}
        <View style={styles.videoCaption}>
          <View style={styles.captionHeader}>
            <Image 
              source={{ uri: getAvatarUrl(user) }} 
              style={styles.captionAvatar}
            />
            <Text style={styles.captionUserInfo}>
              {user?.username || 'Voyageur'} • Il y a 2h
            </Text>
          </View>
          <View style={styles.captionContent}>
            <Text style={styles.captionTitle}>🗺️ Voyage à {trip.destination || 'Paris'}</Text>
            <Text style={styles.captionMeta}>
              ⏱️ {trip.duration || '5 jours'} • 💰 {trip.budget || '800€'} • 🎯 Facile
            </Text>
            <Text style={styles.captionHighlights}>
              ✨ Culture • Gastronomie • Architecture
            </Text>
            <Text style={styles.captionHashtags}>
              #voyage #{trip.destination?.toLowerCase() || 'paris'} #culture #gastronomie
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Fonction pour rendre un post image
  const renderImagePost = (trip: Trip) => {
    // Utiliser les vraies données du backend
    const tripPhotos = trip.photos || [];
    const tripLikes = trip.likes || [];
    
    // 🔍 DÉBOGAGE : Vérifier les données du voyage
    console.log('🔍 renderImagePost - Trip:', {
      id: trip.id,
      title: trip.title,
      created_by: trip.created_by,
      username: trip.username,
      first_name: trip.first_name,
      last_name: trip.last_name,
      avatar_url: trip.avatar_url,
      has_user_data: !!(trip.username || trip.first_name || trip.last_name)
    });
    
    return (
      <TouchableOpacity 
        style={styles.imagePostContainer}
        onPress={() => {
          setMapPost({
            id: trip.id?.toString() || '',
            user: {
              id: trip.created_by || user?.id || '',
              name: trip.username || trip.first_name || trip.last_name || user?.username || 'Voyageur',
              avatar: trip.avatar_url || getAvatarUrl(user),
              verified: false,
              level: 'Débutant',
              trips: 1
            },
            caption: trip.description || '',
            location: trip.location?.city || trip.location?.country || 'Destination inconnue',
            likes: tripLikes.length || 0,
            comments: 0, // Pas encore implémenté
            shares: 0,
            isLiked: false,
            isSaved: false,
            timestamp: trip.created_at || '',
            tripInfo: {
              id: trip.id?.toString() || '',
              destination: trip.location?.city || trip.location?.country || 'Destination inconnue',
              budget: trip.budget || 'Non défini',
              duration: trip.duration || 'Non défini',
              difficulty: 'Facile',
              latitude: trip.location?.latitude || 48.8566,
              longitude: trip.location?.longitude || 2.3522,
              highlights: ['Culture', 'Gastronomie', 'Architecture'],
              tags: ['voyage', 'culture', 'gastronomie'],
              steps: trip.steps || []
            }
          });
          setShowMapModal(true);
        }}
      >
        {/* Header du post */}
        <View style={styles.imagePostHeader}>
          <Image 
            source={{ 
              uri: trip.avatar_url || 
                     (trip.username ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.username}&backgroundColor=b6e3f4,c0aede,d1d4f9` : 
                      getAvatarUrl(user))
            }} 
            style={styles.postAvatar}
          />
          <View style={styles.postUserInfo}>
            <Text style={styles.postUsername}>
              {trip.username || trip.first_name || trip.last_name || 'Voyageur inconnu'}
            </Text>
            <Text style={styles.postTime}>
              {trip.created_at ? new Date(trip.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </Text>
          </View>
          <TouchableOpacity style={styles.postMoreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Image du post */}
        <View style={styles.imageContainer}>
          {tripPhotos.length > 0 ? (
            <Image 
              source={{ uri: tripPhotos[0].url }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.postImage}>
              <Text style={styles.postImageEmoji}>
                {trip.location?.city?.includes('Paris') ? '🗼' : 
                 trip.location?.city?.includes('Rome') ? '🏛️' : 
                 trip.location?.city?.includes('Tokyo') ? '🗾' : 
                 trip.location?.city?.includes('Bali') ? '🏝️' : '🗺️'}
              </Text>
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.imageTitle}>🗺️ Voyage à {trip.location?.city || trip.location?.country || 'Destination inconnue'}</Text>
            <View style={styles.imageMeta}>
              <Text style={styles.imageMetaText}>⏱️ {trip.duration || 'Durée non définie'}</Text>
              <Text style={styles.imageMetaText}>💰 {trip.budget || 'Budget non défini'}</Text>
              <Text style={styles.imageMetaText}>📸 {tripPhotos.length} photo{tripPhotos.length > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {/* Actions du post */}
        <View style={styles.imageActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{tripLikes.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#666" />
              <Text style={styles.actionText}>Partager</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer du post */}
        <View style={styles.imageFooter}>
          <Text style={styles.imageCaption}>
            {trip.description || 'Aucune description disponible'}
          </Text>
          <Text style={styles.imageHashtags}>
            #voyage #{trip.location?.city?.toLowerCase() || 'destination'} #culture
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
                <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      
      {/* Header avec recherche et notifications */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary[0] }]}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.searchPlaceholder}>Rechercher des voyages...</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('Profile')}>
              <Image 
                source={{ uri: getAvatarUrl(user) }} 
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('VideoTripCreation')}>
              <Ionicons name="videocam" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => setShowNotifications(!showNotifications)}>
              <Ionicons name="notifications" size={24} color="white" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>



      {/* Main Feed - Interface Photo Unifiée */}
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => renderUnifiedPost(item)}
        style={styles.mainFeed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingFeed}
            onRefresh={loadAllTrips}
            tintColor={theme.colors.primary[0]}
            colors={[theme.colors.primary[0]]}
          />
        }
        ListEmptyComponent={
          tripsLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={theme.colors.primary[0]} />
              <Text style={[styles.emptyStateText, { color: '#333' }]}>
                Chargement des voyages...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Text style={styles.emptyStateEmoji}>🏛️</Text>
              </View>
              <Text style={[styles.emptyStateTitle, { color: '#333' }]}>
                Aucun voyage disponible
              </Text>
              <Text style={[styles.emptyStateText, { color: '#666' }]}>
                Soyez le premier à créer un voyage et partagez vos aventures !
              </Text>
              <TouchableOpacity 
                style={[styles.createFirstTripButton, { backgroundColor: theme.colors.primary[0] }]}
                onPress={() => setShowCreationModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createFirstTripButtonText}>Créer mon premier voyage</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Bouton Flottant */}
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: theme.colors.primary[0] }]}
        onPress={() => setShowCreationModal(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal de Création */}
      <Modal
        visible={showCreationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.creationModal, { backgroundColor: '#fff' }]}>
            <View style={styles.modalHeader}>
                             <Text style={[styles.modalTitle, { color: '#333' }]}>Créer un voyage</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => setShowCreationModal(false)}
              >
                                 <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
                             <Text style={[styles.modalSubtitle, { color: '#333' }]}>
                Choisissez le type de voyage à créer
              </Text>
              
                              <TouchableOpacity 
                  style={[styles.modalOption, { backgroundColor: '#f8f9fa' }]}
                  onPress={() => {
                    setShowCreationModal(false);
                    navigation.navigate('TripCreation');
                  }}
                >
                <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary[0] }]}>
                  <Ionicons name="images" size={24} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Voyage Photo</Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                    Créez un voyage avec photos et itinéraire détaillé
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalOption, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  setShowCreationModal(false);
                  navigation.navigate('VideoTripCreation');
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary[0] }]}>
                  <Ionicons name="videocam" size={24} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Voyage Vidéo</Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                    Créez un voyage avec vidéo et contenu dynamique
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowCreationModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.primary[0] }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Itinéraire */}
      <Modal
        visible={showMapModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={[styles.mapModalHeader, { backgroundColor: theme.colors.primary[0] }]}>
            <Text style={[styles.mapModalTitle, { color: 'white' }]}>
              {mapPost?.tripInfo?.destination || 'Détails du voyage'}
            </Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <SimpleMapView
              latitude={mapPost?.tripInfo?.latitude || 48.8566}
              longitude={mapPost?.tripInfo?.longitude || 2.3522}
              title={mapPost?.tripInfo?.destination || 'Voyage'}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles pour les sections de feed organisées
  feedSection: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {
    paddingLeft: 16,
  },
  // Nouveaux styles pour les actions intelligentes
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  contextualContent: {
    padding: 16,
  },
  destinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tripInfo: {
    fontSize: 14,
    color: '#666',
  },
  container2025: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  
  // Header moderne avec glassmorphism
  modernHeader2025: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent2025: {
    flex: 1,
  },
  greetingSection2025: {
    marginBottom: 4,
  },
  greetingText2025: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleText2025: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  headerActions2025: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton2025: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  profileAvatarButton2025: {
    marginRight: 8,
  },
  profileAvatar2025: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  videoBadge2025: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  videoBadgeText2025: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    backgroundColor: 'rgba(0, 128, 128, 0.95)',
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
  
  // Styles pour le modal de création moderne
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  creationModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalContent: {
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  // Styles pour les cartes de voyage modernes avec glassmorphism
  tripCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripCardUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tripCardUserDetails: {
    flex: 1,
  },
  tripCardUserName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tripCardDestination: {
    fontSize: 14,
    fontWeight: '400',
  },
  tripCardDate: {
    fontSize: 12,
    fontWeight: '400',
  },
  tripCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tripCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tripCardImages: {
    flexDirection: 'row',
    marginBottom: 12,
    height: 80,
    position: 'relative',
  },
  tripCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  tripCardImageFirst: {
    marginRight: 8,
  },
  tripCardImageOverlap: {
    marginLeft: -20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tripCardImageOverlay: {
    position: 'absolute',
    right: 8,
    top: 0,
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripCardImageCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripCardStatText: {
    fontSize: 14,
    fontWeight: '400',
  },
  tripCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripCardStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Styles pour l'interface unifiée
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 15,
  },
  searchPlaceholder: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storiesBar: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  storiesContainer: {
    flexDirection: 'row',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 60,
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyAvatarText: {
    fontSize: 20,
  },
  storyName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  mainFeed: {
    flex: 1,
    backgroundColor: '#fff',
  },
  feedContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createFirstTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createFirstTripButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Styles pour les posts vidéo
  videoPostContainer: {
    height: height,
    backgroundColor: '#000',
    position: 'relative',
  },
  contentTypeIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  contentTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  videoActions: {
    position: 'absolute',
    right: 20,
    bottom: 250,
    flexDirection: 'column',
    gap: 30,
    alignItems: 'center',
  },
  videoActionButton: {
    alignItems: 'center',
    gap: 8,
  },
  videoActionCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  videoInfo: {
    position: 'absolute',
    right: 20,
    bottom: 150,
    flexDirection: 'column',
    gap: 15,
    alignItems: 'flex-end',
  },
  videoInfoItem: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoInfoText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  videoCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 25,
  },
  captionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  captionAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 12,
  },
  captionUserInfo: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  captionContent: {
    gap: 8,
  },
  captionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captionMeta: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  captionHighlights: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  captionHashtags: {
    color: '#48dbfb',
    fontSize: 14,
    fontWeight: '600',
  },
  // Styles pour les posts image
  imagePostContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  imagePostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postUserInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 14,
    color: '#666',
  },
  postMoreButton: {
    padding: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'linear-gradient(45deg, #667eea, #764ba2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImageEmoji: {
    fontSize: 48,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  imageTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imageMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  imageMetaText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  imageFooter: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  imageCaption: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  imageHashtags: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '600',
  },
  // Styles pour les modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  creationModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalContent: {
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
});

export default UnifiedHomeScreen; 