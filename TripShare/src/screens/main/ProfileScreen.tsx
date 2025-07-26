import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ProfileView from './ProfileView';
import { useProfileData } from '../../hooks/useProfileData';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';

const ProfileScreen = () => {
  useRequireAuth();
  const navigation = useNavigation();
  const { logout } = useSimpleAuth();
  const {
    user,
    stats,
    badges,
    userTrips,
    loading,
    error,
    refreshing,
    onRefresh,
  } = useProfileData();

  // Logs pour déboguer
  console.log('📱 ProfileScreen - Données du hook:');
  console.log('  - User:', user);
  console.log('  - Stats:', stats);
  console.log('  - UserTrips:', userTrips);
  console.log('  - UserTrips length:', userTrips?.length);

  // Fusionner les stats dans l'objet user pour le ProfileView
  const userWithStats = user ? { ...user, stats } : null;

  return (
    <ProfileView
      user={userWithStats}
      badges={badges}
      userTrips={userTrips}
      isOwnProfile={true}
      loading={loading}
      error={error}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEditProfile={() => {}}
      onSettings={() => {}}
      onLogout={logout}
      onShareProfile={() => {}}
      onFollow={() => {}}
      onMessage={() => {}}
      onNavigateToTrips={() => {
        console.log('🚀 Navigation vers UserTripsScreen');
        navigation.navigate('UserTrips' as never);
      }}
    />
  );
};

export default ProfileScreen; 