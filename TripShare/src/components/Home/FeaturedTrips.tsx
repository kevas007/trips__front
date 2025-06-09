// src/components/Home/FeaturedTrips.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TripCard {
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
}

interface FeaturedTripsProps {
  featuredTrips: TripCard[];
  searchQuery: string;
}

const FeaturedTrips: React.FC<FeaturedTripsProps> = ({
  featuredTrips,
  searchQuery,
}) => {
  const window = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  // Filtrer par titre ou destination si searchQuery non vide
  const filteredTrips = featuredTrips.filter((trip) =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredTrips.length === 0) {
    return <Text style={styles.emptyText}>Aucun voyage trouvé.</Text>;
  }

  // Pour calculer la largeur d’une carte :
  // - Sur mobile, on garde 85% de la largeur pour le FlatList horizontal
  // - Sur web, on veut 30% de la largeur pour permettre au moins 3 cartes côte à côte avec de l’espace
  const CARD_WIDTH = isWeb
    ? window.width * 0.30
    : window.width * 0.85;

  const renderTripCard = ({ item }: { item: TripCard }) => (
    <TouchableOpacity
      style={[styles.tripCard, { width: CARD_WIDTH }]}
      onPress={() =>
        Alert.alert(
          `${item.emoji} ${item.title}`,
          `Voyage de ${item.days} jours à ${item.destination} par ${item.author}`
        )
      }
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.tripCardImage}
        imageStyle={styles.tripCardImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.tripCardOverlay}
        >
          <View style={styles.tripCardHeader}>
            <View style={styles.tripCardTags}>
              {item.tags.slice(0, 2).map((tag, idx) => (
                <View key={idx} style={styles.tripCardTag}>
                  <Text style={styles.tripCardTagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tripCardFooter}>
            <Text style={styles.tripCardEmoji}>{item.emoji}</Text>
            <Text style={styles.tripCardTitle}>{item.title}</Text>
            <Text style={styles.tripCardDestination}>{item.destination}</Text>
            <View style={styles.tripCardMeta}>
              <Text style={styles.tripCardDays}>{item.days} jours</Text>
              <Text style={styles.tripCardPrice}>{item.price}</Text>
            </View>
            <View style={styles.tripCardStats}>
              <Ionicons name="heart" size={14} color="#FF6B9D" />
              <Text style={styles.tripCardLikes}>{item.likes}</Text>
              <Text style={styles.tripCardAuthor}> • {item.author}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tripsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>✨ Voyages Inspirants</Text>
        <TouchableOpacity onPress={() => console.log('Voir tout')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {isWeb ? (
        // === Version Web : grille "space-between" ===
        <View style={[styles.webGridContainer, { paddingHorizontal: window.width * 0.02 }]}>
          {filteredTrips.map((trip) => (
            <View key={trip.id} style={[styles.tripCard, { width: CARD_WIDTH, marginBottom: 20 }]}>
              <TouchableOpacity
                style={{ flex: 1, borderRadius: 20, overflow: 'hidden' }}
                onPress={() =>
                  Alert.alert(
                    `${trip.emoji} ${trip.title}`,
                    `Voyage de ${trip.days} jours à ${trip.destination} par ${trip.author}`
                  )
                }
              >
                <ImageBackground
                  source={{ uri: trip.image }}
                  style={styles.tripCardImage}
                  imageStyle={styles.tripCardImageStyle}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.tripCardOverlay}
                  >
                    <View style={styles.tripCardHeader}>
                      <View style={styles.tripCardTags}>
                        {trip.tags.slice(0, 2).map((tag, idx) => (
                          <View key={idx} style={styles.tripCardTag}>
                            <Text style={styles.tripCardTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity style={styles.likeButton}>
                        <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.tripCardFooter}>
                      <Text style={styles.tripCardEmoji}>{trip.emoji}</Text>
                      <Text style={styles.tripCardTitle}>{trip.title}</Text>
                      <Text style={styles.tripCardDestination}>{trip.destination}</Text>
                      <View style={styles.tripCardMeta}>
                        <Text style={styles.tripCardDays}>{trip.days} jours</Text>
                        <Text style={styles.tripCardPrice}>{trip.price}</Text>
                      </View>
                      <View style={styles.tripCardStats}>
                        <Ionicons name="heart" size={14} color="#FF6B9D" />
                        <Text style={styles.tripCardLikes}>{trip.likes}</Text>
                        <Text style={styles.tripCardAuthor}> • {trip.author}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        // === Version Mobile : FlatList horizontale ===
        <FlatList
          data={filteredTrips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tripsList}
          snapToInterval={CARD_WIDTH + 15}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}
    </View>
  );
};

export default FeaturedTrips;

const styles = StyleSheet.create({
  tripsContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },

  // === Conteneur grille Web ===
  webGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // === Styles communs aux cartes ===
  tripsList: {
    paddingHorizontal: 20,
  },
  tripCard: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginRight: 15, // marginRight appliquée seulement en mobile
  },
  tripCardImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tripCardImageStyle: {
    borderRadius: 20,
  },
  tripCardOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripCardTags: {
    flexDirection: 'row',
  },
  tripCardTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
  },
  tripCardTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  likeButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 8,
  },
  tripCardFooter: {
    alignSelf: 'flex-start',
  },
  tripCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tripCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  tripCardDestination: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 8,
  },
  tripCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripCardDays: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  tripCardPrice: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tripCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripCardLikes: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  tripCardAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  emptyText: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 10,
  },
});
