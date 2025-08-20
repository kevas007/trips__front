import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PlaceDetails } from '../../services/intelligentPlacesService';

const { width } = Dimensions.get('window');

interface IntelligentPlaceCardProps {
  place: PlaceDetails;
  onSelect?: (place: PlaceDetails) => void;
  showFullDetails?: boolean;
  compact?: boolean;
}

const IntelligentPlaceCard: React.FC<IntelligentPlaceCardProps> = ({
  place,
  onSelect,
  showFullDetails = false,
  compact = false,
}) => {
  const { theme } = useAppTheme();
  const [showModal, setShowModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(place);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attraction': return 'camera-outline';
      case 'restaurant': return 'restaurant-outline';
      case 'hotel': return 'bed-outline';
      case 'shopping': return 'bag-outline';
      case 'nature': return 'leaf-outline';
      case 'culture': return 'library-outline';
      case 'nightlife': return 'wine-outline';
      case 'transport': return 'car-outline';
      default: return 'location-outline';
    }
  };

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#27AE60';
      case 'medium': return '#F39C12';
      case 'high': return '#E74C3C';
      default: return theme.colors.text.secondary;
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#DDD" />
      );
    }

    return stars;
  };

  const renderPhotos = () => {
    if (place.photos.length === 0) return null;

    return (
      <View style={styles.photosContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.7));
            setCurrentPhotoIndex(index);
          }}
        >
          {place.photos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setShowModal(true)}
            >
              <Image
                source={{ uri: photo.url }}
                style={[styles.photo, { width: compact ? width * 0.7 : width * 0.85 }]}
                defaultSource={{ uri: 'http://localhost:8085/storage/defaults/default-trip-image.jpg' }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {place.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {place.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  {
                    backgroundColor: index === currentPhotoIndex 
                      ? theme.colors.primary[0] 
                      : 'rgba(255,255,255,0.5)'
                  }
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderReviews = () => {
    if (!place.reviews || place.reviews.length === 0) return null;

    const topReview = place.reviews[0];

    return (
      <View style={styles.reviewsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          💬 Avis récents
        </Text>
        <View style={[styles.reviewCard, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.reviewAuthor, { color: theme.colors.text.primary }]}>
              {topReview.author}
            </Text>
            <View style={styles.reviewRating}>
              {renderStarRating(topReview.rating)}
            </View>
          </View>
          <Text style={[styles.reviewText, { color: theme.colors.text.secondary }]}>
            {topReview.text}
          </Text>
          <Text style={[styles.reviewDate, { color: theme.colors.text.tertiary }]}>
            {new Date(topReview.time).toLocaleDateString()}
          </Text>
        </View>
        
        {place.reviews.length > 1 && (
          <TouchableOpacity style={styles.moreReviewsButton}>
            <Text style={[styles.moreReviewsText, { color: theme.colors.primary[0] }]}>
              Voir {place.reviews.length - 1} autres avis
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPracticalInfo = () => {
    return (
      <View style={styles.practicalSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          ℹ️ Informations pratiques
        </Text>
        
        {place.opening_hours && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {place.opening_hours.open_now ? 'Ouvert maintenant' : 'Fermé'}
            </Text>
          </View>
        )}

        {place.phone && (
          <TouchableOpacity style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.infoText, { color: theme.colors.primary[0] }]}>
              {place.phone}
            </Text>
          </TouchableOpacity>
        )}

        {place.website && (
          <TouchableOpacity style={styles.infoRow}>
            <Ionicons name="globe-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={[styles.infoText, { color: theme.colors.primary[0] }]}>
              Site web
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoRow}>
          <Ionicons 
            name="people-outline" 
            size={16} 
            color={getCrowdLevelColor(place.local_insights.crowd_level)} 
          />
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            Affluence: {place.local_insights.crowd_level === 'low' ? 'Faible' : 
                        place.local_insights.crowd_level === 'medium' ? 'Modérée' : 'Élevée'}
          </Text>
        </View>

        {place.local_insights.insider_tip && (
          <View style={[styles.tipContainer, { backgroundColor: `${theme.colors.primary[0]}15` }]}>
            <Ionicons name="bulb-outline" size={16} color={theme.colors.primary[0]} />
            <Text style={[styles.tipText, { color: theme.colors.text.primary }]}>
              {place.local_insights.insider_tip}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTags = () => {
    if (place.custom_tags.length === 0) return null;

    return (
      <View style={styles.tagsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          🏷️ Tags
        </Text>
        <View style={styles.tagsContainer}>
          {place.custom_tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: `${theme.colors.primary[0]}20` }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: theme.colors.background.card }]}
        onPress={handleSelect}
      >
        <Image
          source={{ uri: place.photos[0]?.url }}
          style={styles.compactImage}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=150&fit=crop' }}
        />
        <View style={styles.compactContent}>
          <Text style={[styles.compactName, { color: theme.colors.text.primary }]}>
            {place.name}
          </Text>
          <View style={styles.compactMeta}>
            <View style={styles.compactRating}>
              {place.rating && renderStarRating(place.rating)}
              {place.rating && (
                <Text style={[styles.compactRatingText, { color: theme.colors.text.secondary }]}>
                  {place.rating}
                </Text>
              )}
            </View>
            <Ionicons
              name={getCategoryIcon(place.category) as any}
              size={14}
              color={theme.colors.text.secondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
        {/* Photos */}
        {renderPhotos()}

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Header avec titre et évaluation */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={[styles.name, { color: theme.colors.text.primary }]}>
                {place.name}
              </Text>
              <View style={styles.categoryRow}>
                <Ionicons
                  name={getCategoryIcon(place.category) as any}
                  size={16}
                  color={theme.colors.primary[0]}
                />
                <Text style={[styles.category, { color: theme.colors.text.secondary }]}>
                  {place.subcategory}
                </Text>
              </View>
            </View>

            {place.rating && (
              <View style={styles.ratingSection}>
                <View style={styles.ratingRow}>
                  {renderStarRating(place.rating)}
                </View>
                <Text style={[styles.ratingText, { color: theme.colors.text.primary }]}>
                  {place.rating}
                </Text>
                {place.user_ratings_total && (
                  <Text style={[styles.reviewCount, { color: theme.colors.text.secondary }]}>
                    ({place.user_ratings_total.toLocaleString()})
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Description et recommandation */}
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {place.recommendation_reason}
          </Text>

          {/* Métadonnées */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
              <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
                {place.estimated_duration}
              </Text>
            </View>

            {place.price_level !== undefined && (
              <View style={styles.metaItem}>
                <Text style={[styles.priceLevel, { color: theme.colors.text.secondary }]}>
                  {'€'.repeat(place.price_level + 1)}
                </Text>
              </View>
            )}

            <View style={[styles.popularityBadge, { backgroundColor: theme.colors.primary[0] }]}>
              <Text style={styles.popularityText}>
                {place.popularity_score}% populaire
              </Text>
            </View>
          </View>

          {showFullDetails && (
            <>
              {renderReviews()}
              {renderPracticalInfo()}
              {renderTags()}
            </>
          )}

          {/* Bouton d'action */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={handleSelect}
          >
            <Text style={styles.actionButtonText}>
              Ajouter à l'itinéraire
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal pour photos en plein écran */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowModal(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {place.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo.url }}
                style={styles.modalPhoto}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  photosContainer: {
    position: 'relative',
  },
  photo: {
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  content: {
    padding: 16,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  category: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  ratingSection: {
    alignItems: 'flex-end',
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewCount: {
    fontSize: 12,
  },
  compactMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRatingText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  priceLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  popularityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  popularityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 16,
  },
  reviewsSection: {
    marginTop: 16,
  },
  reviewCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 11,
  },
  moreReviewsButton: {
    alignSelf: 'flex-start',
  },
  moreReviewsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  practicalSection: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
  },
  tipContainer: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    fontStyle: 'italic',
  },
  tagsSection: {
    marginTop: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalPhoto: {
    width: width,
    height: '100%',
  },
});

export default IntelligentPlaceCard;
