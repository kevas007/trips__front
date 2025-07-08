import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../types/theme';
import { Trip } from '../../types/trip';
import TripMap from './TripMap';
import TripSteps from './TripSteps';

const { width } = Dimensions.get('window');

export interface TripCardProps {
  trip: Trip;
  theme: Theme;
  onDuplicate?: (trip: Trip) => void;
  showRecommendationScore?: boolean;
  recommendationScore?: number;
  recommendationReason?: string;
  navigation?: any;
}

const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  theme, 
  onDuplicate, 
  showRecommendationScore = false,
  recommendationScore,
  recommendationReason,
  navigation 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(trip);
    }
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return '#4CAF50';
      case 'Modéré':
        return '#FF9800';
      case 'Difficile':
        return '#F44336';
      default:
        return theme.colors.text.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: trip.user.avatar }} style={styles.avatar} />
          <View>
            <View style={styles.usernameContainer}>
              <Text style={[styles.username, { color: theme.colors.text.primary }]}>
                {trip.user.username}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary[0] }]}>
                <Text style={styles.levelText}>{trip.user.level}</Text>
              </View>
            </View>
            <Text style={[styles.tripCount, { color: theme.colors.text.secondary }]}>
              {trip.user.trips} voyages
            </Text>
            {showRecommendationScore && recommendationScore && (
              <View style={styles.recommendationContainer}>
                <View style={[styles.recommendationBadge, { backgroundColor: theme.colors.primary[0] + '20' }]}>
                  <Ionicons name="star" size={12} color={theme.colors.primary[0]} />
                  <Text style={[styles.recommendationScore, { color: theme.colors.primary[0] }]}>
                    {Math.round(recommendationScore * 100)}%
                  </Text>
                </View>
                <Text style={[styles.recommendationReason, { color: theme.colors.text.secondary }]}>
                  {recommendationReason}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={toggleMap} style={styles.mapButton}>
          <Ionicons 
            name={showMap ? "map" : "map-outline"} 
            size={24} 
            color={theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Image principale */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: trip.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.location}>{trip.location}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.background.card }
          ]}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons
            name={showMap ? "map" : "map-outline"}
            size={20}
            color={theme.colors.text.primary}
          />
          <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>
            {showMap ? "Masquer la carte" : "Voir la carte"}
          </Text>
        </TouchableOpacity>

        {trip.steps && trip.steps.length > 0 && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.background.card }
            ]}
            onPress={() => setShowSteps(!showSteps)}
          >
            <Ionicons
              name={showSteps ? "list" : "list-outline"}
              size={20}
              color={theme.colors.text.primary}
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>
              {showSteps ? "Masquer les étapes" : "Voir les étapes"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carte de l'itinéraire */}
      {showMap && (
        <TripMap
          trip={trip}
          onLocationPress={(location) => {
            Alert.alert(
              'Destination',
              `${location}\n${trip.description}`
            );
          }}
        />
      )}

      {/* Étapes de l'itinéraire */}
      {showSteps && trip.steps && trip.steps.length > 0 && (
        <TripSteps
          steps={trip.steps}
          theme={theme}
          onStepPress={(step) => {
            Alert.alert(
              step.title,
              `${step.description || ''}\n\nDurée: ${step.duration}\nActivités: ${step.activities.length}`
            );
          }}
        />
      )}

      {/* Bouton de duplication */}
      <TouchableOpacity 
        onPress={handleDuplicate} 
        style={[
          styles.duplicateButton,
          { backgroundColor: theme.colors.primary[0] }
        ]}
      >
        <Ionicons name="copy-outline" size={20} color="#fff" />
        <Text style={styles.duplicateButtonText}>Copier cet itinéraire</Text>
      </TouchableOpacity>

      {/* Informations du voyage */}
      <View style={styles.tripInfo}>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          {trip.description}
        </Text>

        {/* Tags */}
        <View style={styles.tags}>
          {trip.tags.map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: theme.colors.background.card }]}
            >
              <Text style={[styles.tagText, { color: theme.colors.text.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Statistiques */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
              {trip.duration}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="wallet-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
              {trip.budget}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={isLiked ? theme.colors.primary[0] : theme.colors.text.secondary}
              onPress={handleLike}
            />
            <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
              {formatNumber(trip.likes)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
              {formatNumber(trip.comments)}
            </Text>
          </View>
        </View>

        {/* Difficulté et transport */}
        <View style={styles.details}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: trip.difficulty === 'Difficile' ? '#FF6B6B' : trip.difficulty === 'Modéré' ? '#FFB86C' : '#63E6BE' }
          ]}>
            <Text style={styles.difficultyText}>{trip.difficulty}</Text>
          </View>
          <View style={styles.transport}>
            {trip.transport.map((mode, index) => (
              <Text key={index} style={[styles.transportText, { color: theme.colors.text.secondary }]}>
                {mode}
              </Text>
            ))}
          </View>
        </View>

        {/* Points forts */}
        <View style={styles.highlights}>
          <Text style={[styles.highlightsTitle, { color: theme.colors.text.primary }]}>
            Points forts :
          </Text>
          {trip.highlights.map((highlight, index) => (
            <Text
              key={index}
              style={[styles.highlightText, { color: theme.colors.text.secondary }]}
            >
              • {highlight}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tripCount: {
    fontSize: 12,
    marginTop: 2,
  },
  mapButton: {
    padding: 8,
  },
  imageContainer: {
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  duplicateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  duplicateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tripInfo: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  transport: {
    flexDirection: 'row',
  },
  transportText: {
    fontSize: 14,
    marginLeft: 8,
  },
  highlights: {
    marginTop: 12,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recommendationContainer: {
    marginTop: 4,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  recommendationScore: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  recommendationReason: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default TripCard; 