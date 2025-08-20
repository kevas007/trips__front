import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Alert,
  Share,
  ScrollView,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import SimpleMapView from '../../components/places/SimpleMapView';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { SocialStackParamList } from '../../types/navigation';
import AppBackground from '../../components/ui/AppBackground';


const { width, height } = Dimensions.get('window');

interface SocialPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  } | null; // Permettre null pour gérer les cas où user n'est pas défini
  location: string;
  content: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  timestamp: string;
  tags: string[];
  tripInfo?: {
    destination: string;
    duration: string;
    budget: string;
    latitude?: number;
    longitude?: number;
    steps?: Step[];
  };
}

interface Step {
  title: string;
  duration?: string;
  description?: string;
}

interface SocialFeedScreenProps {
  navigation: any; // On garde 'any' temporairement pour éviter les problèmes de navigation entre stacks
  posts?: SocialPost[];
  personalized?: boolean;
  filters?: string[];
  headerTitle?: string;
}

const SocialFeedScreen: React.FC<SocialFeedScreenProps> = ({ navigation, posts, personalized, filters, headerTitle }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [feedPosts, setFeedPosts] = useState<SocialPost[]>(posts || [
    // Post avec user null pour tester la gestion d'erreur
    {
      id: '0',
      user: null,
      location: 'Test Location',
      content: {
        type: 'image',
        url: 'https://via.placeholder.com/400x300',
      },
      caption: 'Test post without user',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      timestamp: '1h',
      tags: ['test'],
    },
    {
      id: '1',
      user: {
        id: '1',
        name: 'Sarah Voyage',
        avatar: 'http://localhost:8085/storage/defaults/default-avatar.jpg',
        verified: true,
      },
      location: 'Bali, Indonésie',
      content: {
        type: 'image',
        url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      },
      caption: '🌴 Premier jour à Bali ! Les rizières en terrasse de Tegalalang sont absolument magnifiques. La culture balinaise est si riche et authentique. #Bali #Indonésie #Voyage #Culture',
      likes: 1247,
      comments: 89,
      shares: 23,
      isLiked: false,
      isSaved: false,
      timestamp: '2h',
      tags: ['Bali', 'Indonésie', 'Voyage', 'Culture'],
      tripInfo: {
        destination: 'Bali, Indonésie',
        duration: '2 semaines',
        budget: '1500€',
      },
    },
    {
      id: '2',
      user: {
        id: '2',
        name: 'Alex Explorer',
        avatar: 'http://localhost:8085/storage/defaults/default-avatar.jpg',
        verified: false,
      },
      location: 'Santorini, Grèce',
      content: {
        type: 'image',
        url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      },
      caption: '☀️ Coucher de soleil magique à Oia ! Les maisons blanches et les dômes bleus créent un paysage de carte postale. Le vin local est exceptionnel aussi ! #Santorini #Grèce #CoucherDeSoleil',
      likes: 892,
      comments: 45,
      shares: 12,
      isLiked: true,
      isSaved: true,
      timestamp: '5h',
      tags: ['Santorini', 'Grèce', 'CoucherDeSoleil'],
      tripInfo: {
        destination: 'Santorini, Grèce',
        duration: '1 semaine',
        budget: '2000€',
      },
    },
    {
      id: '3',
      user: {
        id: '3',
        name: 'Marie Aventurière',
        avatar: 'http://localhost:8085/storage/defaults/default-avatar.jpg',
        verified: true,
      },
      location: 'Tokyo, Japon',
      content: {
        type: 'image',
        url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      },
      caption: '🗼 Tokyo by night ! Les néons de Shibuya sont hypnotisants. J\'ai découvert des ramens incroyables dans un petit restaurant caché. La culture japonaise est fascinante ! #Tokyo #Japon #Néon #Culture',
      likes: 2156,
      comments: 156,
      shares: 67,
      isLiked: false,
      isSaved: false,
      timestamp: '1j',
      tags: ['Tokyo', 'Japon', 'Néon', 'Culture'],
      tripInfo: {
        destination: 'Tokyo, Japon',
        duration: '10 jours',
        budget: '3000€',
      },
    },
    {
      id: '4',
      user: {
        id: '4',
        name: 'Thomas Nomade',
        avatar: 'http://localhost:8085/storage/defaults/default-avatar.jpg',
        verified: false,
      },
      location: 'Marrakech, Maroc',
      content: {
        type: 'image',
        url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
      },
      caption: '🏺 Les souks de Marrakech sont un labyrinthe de couleurs et d\'odeurs ! Le thé à la menthe et les épices parfument l\'air. Une expérience sensorielle unique ! #Marrakech #Maroc #Souks #Culture',
      likes: 678,
      comments: 34,
      shares: 8,
      isLiked: true,
      isSaved: false,
      timestamp: '2j',
      tags: ['Marrakech', 'Maroc', 'Souks', 'Culture'],
      tripInfo: {
        destination: 'Marrakech, Maroc',
        duration: '5 jours',
        budget: '800€',
      },
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  // Ajout d'un état pour la carte ouverte
  const [openMapPostId, setOpenMapPostId] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    setFeedPosts(prevPosts =>
      prevPosts.map(post =>
        post && post.id === postId
          ? Object.assign({}, post, {
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            })
          : post
      ).filter(Boolean) // Filtrer les posts null
    );
  };

  const handleSave = (postId: string) => {
    setFeedPosts(prevPosts =>
      prevPosts.map(post =>
        post && post.id === postId
          ? Object.assign({}, post, { isSaved: !post.isSaved })
          : post
      ).filter(Boolean) // Filtrer les posts null
    );
  };

  const handleShare = async (post: SocialPost) => {
    try {
      const userName = post.user?.name || 'un voyageur';
      await Share.share({
        message: `Découvre ce voyage incroyable à ${post.location} par ${userName} sur TripShare !`,
        url: `tripshare://post/${post.id}`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager ce post');
    }
  };

  const handleComment = (postId: string) => {
    if (personalized) {
      // Si on est dans le contexte personnalisé (HomeStack), naviguer vers l'onglet Social
      navigation.navigate('Social', { screen: 'Comments', params: { postId } });
    } else {
      // Si on est déjà dans le SocialStack, navigation directe
      navigation.navigate('Comments', { postId });
    }
  };

  const handleUserProfilePress = (userId: string, userName: string) => {
    if (!userId || !userName) {
      console.warn('User ID or name is missing');
      return;
    }
    // Feedback visuel temporaire
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Navigation vers le profil de ${userName}`, ToastAndroid.SHORT);
    }
    navigation.navigate('Profile', { screen: 'PublicProfile', params: { userId } });
  };

  const copyItinerary = (item: SocialPost) => {
    if (!item.tripInfo || !item.tripInfo.steps) return;
    let text = `Voyage à ${item.tripInfo.destination}\nDurée : ${item.tripInfo.duration}\nBudget : ${item.tripInfo.budget}\n\nÉtapes :\n`;
    item.tripInfo.steps.forEach((step, idx) => {
      text += `${idx + 1}. ${step.title}`;
      if (step.duration) text += ` - ${step.duration}`;
      if (step.description) text += `\n   ${step.description}`;
      text += '\n';
    });
    Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Itinéraire copié !', ToastAndroid.SHORT);
    } else {
      Alert.alert('Succès', 'Itinéraire copié !');
    }
  };

  const renderPost = ({ item, index }: { item: SocialPost; index: number }) => {
    // Vérification de sécurité pour éviter les erreurs si user est null
    if (!item || !item.user) {
      console.warn('Post without user data:', item?.id || 'unknown');
      return (
        <View style={[styles.postCard, { padding: 20, alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.text.secondary }}>
            Post non disponible
          </Text>
        </View>
      );
    }

    // À ce point, TypeScript sait que item.user n'est pas null
    const user = item.user;

    return (
      <View style={styles.postCard}>
        {/* Header avec info utilisateur */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userSection}
            onPress={() => handleUserProfilePress(user.id, user.name)}
          >
            <Image 
              source={{ uri: user.avatar || 'https://via.placeholder.com/40' }} 
              style={styles.userAvatar} 
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                  {user.name || 'Utilisateur inconnu'}
                </Text>
                {user.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#0097e6" />
                )}
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={theme.colors.text.secondary} />
                <Text style={[styles.location, { color: theme.colors.text.secondary }]}>
                  {item.location || 'Lieu non spécifié'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Image principale */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.content.url }}
            style={styles.postImage}
            resizeMode="cover"
          />
          {item.content.type === 'video' && (
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={40} color="white" />
            </View>
          )}
        </View>

        {/* Actions et interactions */}
        <View style={styles.actionsSection}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={item.isLiked ? '#ff4757' : theme.colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleComment(item.id)}
            >
              <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSave(item.id)}
          >
            <Ionicons
              name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={item.isSaved ? '#ffa502' : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={[styles.likesCount, { color: theme.colors.text.primary }]}>
            {item.likes.toLocaleString()} j'aime
          </Text>
          <Text style={[styles.commentsCount, { color: theme.colors.text.secondary }]}>
            Voir les {item.comments} commentaires
          </Text>
        </View>

                {/* Description */}
        <View style={styles.captionSection}>
          <Text style={[styles.caption, { color: theme.colors.text.primary }]} numberOfLines={3}>
            <Text 
              style={[styles.clickableUserName, { color: theme.colors.text.primary }]}
              onPress={() => handleUserProfilePress(user.id, user.name)}
            >
              {user.name || 'Utilisateur inconnu'}
            </Text> {item.caption}
          </Text>
        </View>

        {/* Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsSection}>
          {item.tags.map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Informations de voyage */}
        {item.tripInfo && (
          <View style={styles.tripInfoCard}>
            <View style={styles.tripInfoHeader}>
              <Ionicons name="airplane" size={16} color="#0097e6" />
              <Text style={[styles.tripInfoTitle, { color: theme.colors.text.primary }]}>
                Détails du voyage
              </Text>
            </View>
            <View style={styles.tripInfoGrid}>
              <View style={styles.tripInfoItem}>
                <Ionicons name="location" size={14} color="#ffa502" />
                <Text style={[styles.tripInfoText, { color: theme.colors.text.secondary }]}>
                  {item.tripInfo.destination}
                </Text>
              </View>
              <View style={styles.tripInfoItem}>
                <Ionicons name="time" size={14} color="#ffa502" />
                <Text style={[styles.tripInfoText, { color: theme.colors.text.secondary }]}>
                  {item.tripInfo.duration}
                </Text>
              </View>
              <View style={styles.tripInfoItem}>
                <Ionicons name="wallet" size={14} color="#ffa502" />
                <Text style={[styles.tripInfoText, { color: theme.colors.text.secondary }]}>
                  {item.tripInfo.budget}
                </Text>
              </View>
            </View>
            {/* Bouton voir sur la carte */}
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setOpenMapPostId(openMapPostId === item.id ? null : item.id)}
            >
              <Ionicons name="map" size={18} color="#008080" />
              <Text style={styles.mapButtonText}>
                {openMapPostId === item.id ? 'Masquer la carte' : 'Voir sur la carte'}
              </Text>
            </TouchableOpacity>
            {/* Mini-carte si ouvert */}
            {openMapPostId === item.id && item.tripInfo && (
              <View style={{ marginTop: 10 }}>
                {/* Si coordonnées disponibles, les passer à SimpleMapView, sinon rien */}
                <SimpleMapView
                  latitude={item.tripInfo.latitude || 0}
                  longitude={item.tripInfo.longitude || 0}
                  title={item.tripInfo.destination}
                />
                <TouchableOpacity
                  style={styles.openInMapsButton}
                  onPress={() => {
                    if (item.tripInfo && item.tripInfo.latitude && item.tripInfo.longitude) {
                      Linking.openURL(`geo:${item.tripInfo.latitude},${item.tripInfo.longitude}`);
                    } else if (item.tripInfo) {
                      const q = encodeURIComponent(item.tripInfo.destination);
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
                    }
                  }}
                >
                  <Ionicons name="navigate" size={18} color="#008080" />
                  <Text style={styles.openInMapsText}>Ouvrir dans Maps</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.tripInfo && item.tripInfo.steps && item.tripInfo.steps.length > 0 && (
              <TouchableOpacity style={styles.copyButton} onPress={() => copyItinerary(item)}>
                <Ionicons name="copy" size={18} color="#008080" />
                <Text style={styles.copyButtonText}>Copier l’itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Timestamp */}
        <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const defaultFilters = ['Tous', 'Destinations', 'Aventures', 'Culture', 'Gastronomie', 'Nature'];
  const filterList = filters || defaultFilters;
  const title = headerTitle || (personalized ? 'Mon Feed' : 'Découvertes');

  return (
    <AppBackground>
      {/* Header moderne */}
      <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            {title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            Explore le monde
          </Text>
        </View>
        {/* Barre d'icônes uniquement si pas personalized */}
        {!personalized && (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="filter" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                if (personalized) {
                  // Si on est dans le contexte personnalisé (HomeStack), naviguer vers l'onglet Social
                  navigation.navigate('Social', { screen: 'CreatePost' });
                } else {
                  // Si on est déjà dans le SocialStack, navigation directe
                  navigation.navigate('CreatePost');
                }
              }}
            >
              <Ionicons name="add-circle" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filtres rapides - uniquement si pas personalized */}
      {!personalized && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterList.map((filter, idx) => (
            <TouchableOpacity key={filter} style={[styles.filterChip, idx === 0 && styles.filterChipActive]}>
              <Text style={idx === 0 ? styles.filterChipTextActive : styles.filterChipText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Feed avec cartes */}
      <FlatList
        ref={flatListRef}
        data={feedPosts.filter(post => post && post.user)} // Filtrer les posts invalides
        renderItem={renderPost}
        keyExtractor={(item) => item?.id || `post-${Math.random()}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={personalized ? { paddingLeft: 16, paddingRight: 16, paddingBottom: 16 } : styles.feedContainer}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => {
          if (personalized) {
            // Si on est dans le contexte personnalisé (HomeStack), naviguer vers l'onglet Social
            navigation.navigate('Social', { screen: 'CreatePost' });
          } else {
            // Si on est déjà dans le SocialStack, navigation directe
            navigation.navigate('CreatePost');
          }
        }}
        icon="camera"
        bottom={120}
      />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingVertical: 8,
    minHeight: 44,
},
filtersContent: {
  alignItems: 'center',
  minHeight: 44,
},
  filterChip: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0097e6',
  },
  filterChipText: {
    color: '#0097e6',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  feedContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  clickableUserName: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentsCount: {
    fontSize: 12,
  },
  captionSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tagChip: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: '#0097e6',
    fontSize: 12,
    fontWeight: '500',
  },
  tripInfoCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  tripInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tripInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tripInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tripInfoText: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapButtonText: {
    color: '#008080',
    fontWeight: '600',
    marginLeft: 6,
  },
  openInMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#008080',
  },
  openInMapsText: {
    color: '#008080',
    fontWeight: '600',
    marginLeft: 6,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyButtonText: {
    color: '#008080',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SocialFeedScreen; 