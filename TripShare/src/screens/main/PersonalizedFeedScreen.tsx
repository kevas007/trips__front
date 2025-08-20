import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import SocialFeedScreen from './SocialFeedScreen';
import { useAuthStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';

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
    destination: string;
    duration: string;
    budget: string;
  };
}

// Simule un ensemble de posts avec des tags de préférences
const ALL_POSTS: SocialPost[] = [
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
    tags: ['Bali', 'Indonésie', 'Voyage', 'Culture', 'Nature', 'Aventure', 'Plage'],
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
    tags: ['Santorini', 'Grèce', 'CoucherDeSoleil', 'Culture', 'Ville', 'Gastronomie'],
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
    tags: ['Tokyo', 'Japon', 'Néon', 'Culture', 'Ville', 'Gastronomie'],
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
    tags: ['Marrakech', 'Maroc', 'Souks', 'Culture', 'Ville', 'Gastronomie'],
    tripInfo: {
      destination: 'Marrakech, Maroc',
      duration: '5 jours',
      budget: '800€',
    },
  },
  {
    id: '5',
    user: {
      id: '5',
      name: 'Emma Aventurière',
      avatar: 'http://localhost:8085/storage/defaults/default-avatar.jpg',
      verified: true,
    },
    location: 'Chamonix, France',
    content: {
      type: 'image',
      url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
    },
    caption: '🏔️ Randonnée épique dans les Alpes ! Le Mont-Blanc nous offre des vues à couper le souffle. L\'air pur et les paysages montagneux sont revitalisants. #Chamonix #MontBlanc #Randonnée #Montagne',
    likes: 945,
    comments: 67,
    shares: 19,
    isLiked: false,
    isSaved: true,
    timestamp: '3j',
    tags: ['Chamonix', 'Montagne', 'Randonnée', 'Nature', 'Aventure'],
    tripInfo: {
      destination: 'Chamonix, France',
      duration: '1 semaine',
      budget: '1200€',
    },
  },
  {
    id: '6',
    user: {
      id: '6',
      name: 'Lucas Explorer',
      avatar: 'http://localhost:8085/storage/defaults/default-avatar.jpg',
      verified: false,
    },
    location: 'Maldives',
    content: {
      type: 'image',
      url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
    },
    caption: '🏝️ Paradis sur terre aux Maldives ! Les eaux turquoise et le sable blanc créent un décor de rêve. Le snorkeling avec les tortues était magique. #Maldives #Plage #Farniente #Soleil',
    likes: 1876,
    comments: 234,
    shares: 89,
    isLiked: true,
    isSaved: false,
    timestamp: '4j',
    tags: ['Maldives', 'Plage', 'Farniente', 'Soleil', 'Nature'],
    tripInfo: {
      destination: 'Maldives',
      duration: '2 semaines',
      budget: '3500€',
    },
  },
];

function shuffleArray(array: SocialPost[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const PersonalizedFeedScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthStore();
  const preferences = user?.preferences?.activities || [];

  // Filtrage des posts selon les préférences
  const filteredPosts = React.useMemo(() => {
    if (preferences.length === 0) {
      return shuffleArray(ALL_POSTS);
    }
    const matches = ALL_POSTS.filter(post =>
      post.tags.some(tag => preferences.includes(tag))
    );
    return matches.length > 0 ? matches : shuffleArray(ALL_POSTS);
  }, [preferences]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header coloré personnalisé */}
      <View style={styles.mainHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerGreeting}>
              Bonjour {user?.name || 'Voyageur'} ! 👋
            </Text>
            <Text style={styles.headerSubtitle}>
              Voici votre feed personnalisé
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Feed personnalisé sans aucun espace blanc */}
      <View style={{ flex: 1, marginTop: -20 }}>
        <SocialFeedScreen navigation={navigation} posts={filteredPosts} personalized />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainHeader: {
    height: 130,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    backgroundColor: '#008080',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 8,
  },
});

export default PersonalizedFeedScreen; 