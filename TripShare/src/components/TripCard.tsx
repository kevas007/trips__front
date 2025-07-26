import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../types/trip';
import { COLORS } from '../design-system';

const screenWidth = Dimensions.get('window').width;
const CARD_MARGIN = 8;
const CARD_WIDTH = (screenWidth - CARD_MARGIN * 3) / 2; // 2 colonnes

interface TripCardProps {
  trip: Trip;
  onPress?: (trip: Trip) => void;
  onToggleSave?: (trip: Trip) => void;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  onPress, 
  onToggleSave, 
  isSaved = false, 
  showSaveButton = false 
}) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'Gratuit';
    return `${price}€`;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    if (duration === 1) return '1 jour';
    return `${duration} jours`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress && onPress(trip)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: trip.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400' }}
          style={styles.image}
          resizeMode="cover"
        />
        {showSaveButton && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onToggleSave && onToggleSave(trip)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? COLORS.primary[500] : '#fff'}
            />
          </TouchableOpacity>
        )}
        <View style={styles.overlay}>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{formatPrice(undefined)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {trip.description}
        </Text>
        <View style={styles.details}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray[600]} />
            <Text style={styles.location} numberOfLines={1}>
              {trip.location}
            </Text>
          </View>
          {trip.duration && (
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray[600]} />
              <Text style={styles.duration}>
                {trip.duration}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.difficulty}>
            <Text style={[styles.difficultyText, { 
              color: trip.difficulty === 'Facile' ? COLORS.success : 
                     trip.difficulty === 'Modéré' ? COLORS.warning : COLORS.error 
            }]}>
              {trip.difficulty}
            </Text>
          </View>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.ratingText}>{trip.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: CARD_MARGIN / 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginLeft: 4,
    flex: 1,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.gray[700],
    marginLeft: 2,
    fontWeight: '500',
  },
});

export default TripCard; 