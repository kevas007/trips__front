import { useCallback, useEffect, useState, useRef } from 'react';
import { profileService } from '../services/profileService';
import { authService } from '../services/auth';
import { User, UserStats, Badge } from '../types/user';

export function useProfileData() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchAll = useCallback(async () => {
    // Éviter les appels multiples lors du premier chargement
    if (hasLoadedRef.current && !refreshing) {
      return;
    }
    
    // Vérifier l'authentification avant de charger les données
    if (!authService.isAuthenticated()) {
      console.log('❌ Utilisateur non authentifié');
      setError('Veuillez vous connecter pour voir votre profil');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des données de profil...');
      
      console.log('🔍 useProfileData - Début des appels API');
      
      const userData = await profileService.getProfile();
      console.log('✅ User récupéré:', userData);
      
      const statsData = await profileService.getStats();
      console.log('✅ Stats récupérées:', statsData);
      
      const badgesData = await profileService.getBadges();
      console.log('✅ Badges récupérés:', badgesData);
      
      console.log('🔍 useProfileData - Appel getUserTrips...');
      const tripsData = await profileService.getUserTrips();
      console.log('✅ Trips récupérés:', tripsData);
      
      console.log('📊 useProfileData - Données récupérées:');
      console.log('  - User:', userData);
      console.log('  - Stats:', statsData);
      console.log('  - Badges:', badgesData);
      console.log('  - Trips:', tripsData);
      console.log('  - Trips data:', tripsData.data);
      console.log('  - Trips total:', tripsData.total);
      
      setUser(userData);
      setStats(statsData);
      setBadges(badgesData);
      setUserTrips(tripsData.data || []);
      hasLoadedRef.current = true;
      
      console.log('✅ Données de profil chargées');
    } catch (err: any) {
      console.error('❌ Erreur chargement profil:', err);
      
      // Si l'erreur est liée à l'authentification, afficher un message approprié
      if (err?.message?.includes('Session expirée') || err?.message?.includes('Token invalide')) {
        setError('Session expirée, veuillez vous reconnecter');
      } else {
        setError(err?.message || 'Erreur lors du chargement du profil');
      }
    } finally {
      setLoading(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      fetchAll();
    }
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  return {
    user,
    stats,
    badges,
    userTrips,
    loading,
    error,
    refreshing,
    onRefresh,
  };
} 