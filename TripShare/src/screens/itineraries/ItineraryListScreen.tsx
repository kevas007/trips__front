import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface Itinerary {
  id: string;
  titre: string;
  description: string;
  auteur: string;
  destinations: string[];
}

const mockItineraries: Itinerary[] = [
  {
    id: '1',
    titre: 'Tour d’Europe en train',
    description: 'Un itinéraire de 10 jours à travers Paris, Berlin et Prague.',
    auteur: 'Alice',
    destinations: ['Paris', 'Berlin', 'Prague'],
  },
  {
    id: '2',
    titre: 'Road trip en Italie',
    description: 'Découverte de Rome, Florence et Venise en voiture.',
    auteur: 'Bob',
    destinations: ['Rome', 'Florence', 'Venise'],
  },
];

const ItineraryListScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itinéraires partagés</Text>
      <FlatList
        data={mockItineraries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => {/* navigation vers le détail à venir */}}>
            <Text style={styles.cardTitle}>{item.titre}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.cardAuthor}>par {item.auteur}</Text>
            <Text style={styles.cardDest}>Destinations : {item.destinations.join(', ')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Aucun itinéraire partagé pour le moment.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 15,
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#667eea',
    marginBottom: 2,
  },
  cardDest: {
    fontSize: 13,
    color: '#888',
  },
});

export default ItineraryListScreen; 