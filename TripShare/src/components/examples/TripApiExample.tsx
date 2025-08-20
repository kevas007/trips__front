// ========== EXEMPLE D'UTILISATION DE L'API TRIPSHARE ==========
// Composant d'exemple montrant l'utilisation du service API pour les voyages

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTrips, useAuth } from '../../hooks/useTripShareApi';
import type { CreateTripRequest } from '../../services';

export const TripApiExample: React.FC = () => {
  const { login, register } = useAuth();
  const { listTrips, createTrip, getTrip, updateTrip, deleteTrip } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Exemple de données de test
  const testCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  const testTripData: CreateTripRequest = {
    title: 'Voyage de test',
    description: 'Un voyage créé pour tester l\'API',
    start_date: '2024-06-01',
    end_date: '2024-06-07',
    destination: 'Paris, France',
    budget: 1500,
    is_public: true
  };

  // ========== FONCTIONS D'EXEMPLE ==========

  const handleLogin = async () => {
    try {
      await login.execute(testCredentials);
      Alert.alert('Succès', 'Connexion réussie !');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la connexion');
    }
  };

  const handleRegister = async () => {
    try {
      await register.execute({
        ...testCredentials,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      });
      Alert.alert('Succès', 'Inscription réussie !');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'inscription');
    }
  };

  const handleListTrips = async () => {
    try {
      await listTrips.execute();
      Alert.alert('Succès', `${listTrips.data?.length || 0} voyages trouvés`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les voyages');
    }
  };

  const handleCreateTrip = async () => {
    try {
      await createTrip.execute(testTripData);
      Alert.alert('Succès', 'Voyage créé avec succès !');
      // Recharger la liste des voyages
      await listTrips.execute();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le voyage');
    }
  };

  const handleGetTrip = async (tripId: string) => {
    try {
      await getTrip.execute(tripId);
      setSelectedTripId(tripId);
      Alert.alert('Succès', 'Détails du voyage récupérés');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les détails du voyage');
    }
  };

  const handleUpdateTrip = async (tripId: string) => {
    try {
      await updateTrip.execute(tripId, {
        title: 'Voyage mis à jour',
        budget: 2000
      });
      Alert.alert('Succès', 'Voyage mis à jour !');
      // Recharger la liste des voyages
      await listTrips.execute();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le voyage');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await deleteTrip.execute(tripId);
      Alert.alert('Succès', 'Voyage supprimé !');
      // Recharger la liste des voyages
      await listTrips.execute();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le voyage');
    }
  };

  // ========== RENDU ==========

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Exemple API TripShare
      </Text>

      {/* Section Authentification */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Authentification
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={handleLogin}
          disabled={login.loading}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {login.loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#34C759',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={handleRegister}
          disabled={register.loading}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {register.loading ? 'Inscription...' : 'S\'inscrire'}
          </Text>
        </TouchableOpacity>

        {login.error && (
          <Text style={{ color: 'red', marginTop: 5 }}>Erreur: {login.error}</Text>
        )}
      </View>

      {/* Section Voyages */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Gestion des Voyages
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: '#5856D6',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={handleListTrips}
          disabled={listTrips.loading}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {listTrips.loading ? 'Chargement...' : 'Lister les voyages'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#FF9500',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={handleCreateTrip}
          disabled={createTrip.loading}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {createTrip.loading ? 'Création...' : 'Créer un voyage'}
          </Text>
        </TouchableOpacity>

        {/* Affichage des voyages */}
        {listTrips.data && listTrips.data.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              Voyages disponibles:
            </Text>
            {listTrips.data.map((trip: any) => (
              <View
                key={trip.id}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>{trip.title}</Text>
                <Text>{trip.destination}</Text>
                <Text>Budget: {trip.budget}€</Text>
                
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#007AFF',
                      padding: 8,
                      borderRadius: 5,
                      marginRight: 10
                    }}
                    onPress={() => handleGetTrip(trip.id)}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Voir</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF9500',
                      padding: 8,
                      borderRadius: 5,
                      marginRight: 10
                    }}
                    onPress={() => handleUpdateTrip(trip.id)}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Modifier</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF3B30',
                      padding: 8,
                      borderRadius: 5
                    }}
                    onPress={() => handleDeleteTrip(trip.id)}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Affichage des erreurs */}
        {listTrips.error && (
          <Text style={{ color: 'red', marginTop: 5 }}>Erreur: {listTrips.error}</Text>
        )}
      </View>

      {/* Section Détails du voyage sélectionné */}
      {selectedTripId && getTrip.data && (
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Détails du voyage sélectionné
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#007AFF',
              borderRadius: 8,
              padding: 15,
              backgroundColor: '#F0F8FF'
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{getTrip.data.title}</Text>
            <Text>{getTrip.data.description}</Text>
            <Text>Destination: {getTrip.data.destination}</Text>
            <Text>Budget: {getTrip.data.budget}€</Text>
            <Text>Début: {getTrip.data.start_date}</Text>
            <Text>Fin: {getTrip.data.end_date}</Text>
            <Text>Public: {getTrip.data.is_public ? 'Oui' : 'Non'}</Text>
          </View>
        </View>
      )}

      {/* États de chargement */}
      {(login.loading || register.loading || listTrips.loading || createTrip.loading) && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#007AFF' }}>Chargement en cours...</Text>
        </View>
      )}
    </ScrollView>
  );
}; 