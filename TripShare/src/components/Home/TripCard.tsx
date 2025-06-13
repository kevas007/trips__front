import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = width > 768;
const isDesktop = width > 1024;

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    days: number;
    likes: number;
    image: string;
    author: string;
    tags: string[];
    emoji: string;
    price: string;
  };
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const { theme } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.card,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <Image source={{ uri: trip.image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.emoji, { fontSize: isWeb ? 24 : 20 }]}>
            {trip.emoji}
          </Text>
          <TouchableOpacity style={styles.likeButton}>
            <Ionicons name="heart-outline" size={20} color="#fff" />
            <Text style={styles.likesCount}>{trip.likes}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: '#fff' }]} numberOfLines={2}>
          {trip.title}
        </Text>
        <Text style={[styles.destination, { color: '#fff' }]}>
          {trip.destination}
        </Text>
        <View style={styles.footer}>
          <View style={styles.authorContainer}>
            <Text style={[styles.author, { color: '#fff' }]}>
              {trip.author}
            </Text>
            <Text style={[styles.days, { color: '#fff' }]}>
              {trip.days} jours
            </Text>
          </View>
          <Text style={[styles.price, { color: '#fff' }]}>
            {trip.price}
          </Text>
        </View>
        <View style={styles.tagsContainer}>
          {trip.tags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Text style={[styles.tagText, { color: '#fff' }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: isWeb ? 300 : isTablet ? 280 : 250,
    height: isWeb ? 400 : isTablet ? 380 : 350,
    borderRadius: 16,
    marginRight: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  likesCount: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
  title: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  destination: {
    fontSize: isWeb ? 14 : 12,
    opacity: 0.9,
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  authorContainer: {
    flex: 1,
  },
  author: {
    fontSize: isWeb ? 14 : 12,
    opacity: 0.9,
  },
  days: {
    fontSize: isWeb ? 12 : 10,
    opacity: 0.8,
    marginTop: 2,
  },
  price: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: isWeb ? 12 : 10,
  },
});

export default TripCard; 