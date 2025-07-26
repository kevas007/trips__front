import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';

const { width } = Dimensions.get('window');

// Types simplifiés
interface TripStep {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  location?: string;
  order: number;
}

interface SocialPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
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
    id: string;
    destination: string;
    duration: string;
    budget: string;
    steps?: TripStep[];
    highlights?: string[];
    difficulty?: string;
    bestTime?: string;
  };
}

interface SocialFeedHomeScreenProps {
  navigation: any;
}

const SocialFeedHomeScreen: React.FC<SocialFeedHomeScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { user } = useSimpleAuth();
  
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Posts de démonstration simplifiés
  const mockPosts: SocialPost[] = [
    {
      id: '1',
      user: {
        id: '1',
        name: 'Sarah Aventurière',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        verified: true,
      },
      location: 'Bali, Indonésie',
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
      },
      caption: '🌴 Incroyable voyage à Bali ! Voici mon itinéraire complet de 2 semaines pour découvrir cette île paradisiaque.',
      likes: 1247,
      comments: 89,
      shares: 23,
      isLiked: false,
      isSaved: false,
      timestamp: '2h',
      tags: ['Bali', 'Indonésie', 'Temple', 'Plage', 'Culture'],
      tripInfo: {
        id: 'trip-1',
        destination: 'Bali, Indonésie',
        duration: '2 semaines',
        budget: '1500€',
        difficulty: 'Modéré',
        bestTime: 'Avril - Octobre',
        highlights: ['Temples sacrés', 'Rizières en terrasse', 'Plages paradisiaques'],
      },
    },
    {
      id: '2',
      user: {
        id: '2',
        name: 'Alex Nomade',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: false,
      },
      location: 'Tokyo, Japon',
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      },
      caption: '🗼 Tokyo est une ville incroyable ! Entre tradition et modernité, voici mon itinéraire de 10 jours.',
      likes: 892,
      comments: 156,
      shares: 45,
      isLiked: true,
      isSaved: false,
      timestamp: '5h',
      tags: ['Tokyo', 'Japon', 'Culture', 'Gastronomie'],
      tripInfo: {
        id: 'trip-2',
        destination: 'Tokyo, Japon',
        duration: '10 jours',
        budget: '2800€',
        difficulty: 'Facile',
        bestTime: 'Mars - Mai, Septembre - Novembre',
        highlights: ['Temples anciens', 'Gratte-ciels futuristes', 'Cuisine exceptionnelle'],
      },
    },
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    Alert.alert('Commentaires', 'Fonctionnalité en cours de développement');
  };

  const handleShare = (postId: string) => {
    Alert.alert('Partager', 'Fonctionnalité en cours de développement');
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.headerContent}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>
            Bonjour {user?.name || 'Voyageur'} ! 👋
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Découvrez les derniers voyages partagés
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: SocialPost }) => (
    <View style={[styles.postCard, { backgroundColor: theme.colors.background.card }]}>
      {/* Header utilisateur */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.userSection}>
          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                {item.user.name}
              </Text>
              {item.user.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#0097e6" />
              )}
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={theme.colors.text.secondary} />
              <Text style={[styles.location, { color: theme.colors.text.secondary }]}>
                {item.location}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Image principale */}
      <Image source={{ uri: item.content.url }} style={styles.postImage} resizeMode="cover" />

      {/* Actions simplifiées */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isLiked ? '#ff4757' : theme.colors.text.secondary}
            />
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text.secondary} />
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {item.comments}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item.id)}
          >
            <Ionicons name="share-outline" size={24} color={theme.colors.text.secondary} />
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {item.shares}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSave(item.id)}
        >
          <Ionicons
            name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={item.isSaved ? '#0097e6' : theme.colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.captionSection}>
        <Text style={[styles.captionText, { color: theme.colors.text.primary }]}>
          <Text style={styles.captionUsername}>{item.user.name}</Text> {item.caption}
        </Text>
      </View>

      {/* Informations du voyage */}
      {item.tripInfo && (
        <View style={[styles.tripInfo, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.tripTitle, { color: theme.colors.text.primary }]}>
            📍 {item.tripInfo.destination}
          </Text>
          <Text style={[styles.tripDetails, { color: theme.colors.text.secondary }]}>
            {item.tripInfo.duration} • {item.tripInfo.budget} • {item.tripInfo.difficulty}
          </Text>
          {item.tripInfo.highlights && (
            <Text style={[styles.tripHighlights, { color: theme.colors.text.secondary }]}>
              ✨ {item.tripInfo.highlights.join(' • ')}
            </Text>
          )}
        </View>
      )}

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>
        {item.timestamp}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          Chargement des voyages...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[0]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  feedContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  captionSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: 'bold',
  },
  tripInfo: {
    margin: 12,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripDetails: {
    fontSize: 12,
    marginBottom: 4,
  },
  tripHighlights: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});

export default SocialFeedHomeScreen; 