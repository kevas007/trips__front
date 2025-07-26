import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS } from '../../design-system';
import { usePublicProfile, useUserPublicTrips } from '../../hooks/useTripShareApi';
import ProfileView from './ProfileView';
import { Badge } from '../../types/user';
import AppBackground from '../../components/ui/AppBackground';

// Données mockées pour fallback
const mockBadges: Badge[] = [
  { id: 1, name: 'Globe-trotter', description: 'A visité 10+ pays', icon: '🌍', category: 'achievement', created_at: '2023-06-15T10:00:00Z' },
  { id: 2, name: 'Photographe', description: 'Partagé 50+ photos', icon: '📸', category: 'content', created_at: '2023-08-20T10:00:00Z' },
  { id: 3, name: 'Aventurier', description: 'Complété 5 voyages d\'aventure', icon: '🏔️', category: 'achievement', created_at: '2023-09-10T10:00:00Z' },
  { id: 4, name: 'Influenceur', description: '100+ followers', icon: '⭐', category: 'social', created_at: '2023-10-05T10:00:00Z' },
];

interface PublicProfileScreenProps {
  navigation: any;
  route: { params?: { userId?: string } };
}

const PublicProfileScreen: React.FC<PublicProfileScreenProps> = ({ navigation, route }) => {
  if (!route.params || !route.params.userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Aucun utilisateur sélectionné</Text>
      </View>
    );
  }

  const { userId } = route.params;
  const { data, loading, error, execute } = usePublicProfile(userId);
  const { data: trips, loading: tripsLoading, error: tripsError, execute: loadTrips } = useUserPublicTrips(userId);
  const [refreshing, setRefreshing] = useState(false);
  const [badges] = useState<Badge[]>(mockBadges); // TODO: charger les vrais badges

  useEffect(() => {
    execute();
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([execute(), loadTrips()]).finally(() => setRefreshing(false));
  }, [execute, loadTrips]);

  return (
    <AppBackground>
      <ProfileView
        user={data}
        badges={badges}
        isOwnProfile={false}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onFollow={() => {}}
        onMessage={() => {}}
        onShareProfile={() => {}}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.gray[900], marginBottom: 12 }}>
          Itinéraires publics
        </Text>
        {tripsLoading ? (
          <ActivityIndicator color={COLORS.primary[500]} />
        ) : tripsError ? (
          <Text style={{ color: COLORS.error }}>Erreur lors du chargement des itinéraires</Text>
        ) : trips && trips.length === 0 ? (
          <Text style={{ color: COLORS.gray[500], fontStyle: 'italic' }}>Aucun itinéraire public</Text>
        ) : (
          trips.map((trip: any) => (
            <TouchableOpacity
              key={trip.id}
              style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: COLORS.primary[500], shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}
              onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.primary[700] }}>{trip.title}</Text>
              <Text style={{ color: COLORS.gray[700] }}>{trip.destination}</Text>
              <Text style={{ color: COLORS.gray[500], fontSize: 12 }}>{trip.start_date} - {trip.end_date}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </AppBackground>
  );
};

export default PublicProfileScreen; 