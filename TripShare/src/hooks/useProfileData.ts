import { useCallback, useEffect, useState, useRef } from 'react';
import { profileService } from '../services/profileService';
import { useAuthStore } from '../store';
import { User, UserStats, Badge } from '../types/user';
import { authService } from '../services/auth';
import { useGlobalRefresh } from './useGlobalRefresh';

export function useProfileData() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const { registerRefreshCallback, unregisterRefreshCallback } = useGlobalRefresh();

  // Fonction pour forcer le rafraîchissement des données
  const forceRefresh = useCallback(() => {
    console.log('🔄 useProfileData - Force refresh demandé');
    hasLoadedRef.current = false;
    fetchAll();
  }, []);

  const fetchAll = useCallback(async () => {
    // Éviter les appels multiples lors du premier chargement
    if (hasLoadedRef.current && !refreshing) {
      return;
    }
    
    // Vérifier l'authentification avant de charger les données
    const token = authService.getToken();
    
    console.log('🔍 useProfileData - État de l\'authentification:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - Token disponible:', !!token);
    console.log('  - Token:', token ? `${token.substring(0, 20)}...` : 'Aucun');
    
    if (!isAuthenticated || !token) {
      console.log('❌ Utilisateur non authentifié ou token manquant');
      setError('Veuillez vous connecter pour voir votre profil');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des données de profil...');
      
      // Test de connectivité avec le backend
      console.log('🔍 useProfileData - Test de connectivité backend...');
      const isBackendAccessible = await profileService.testBackendConnection();
      
      if (!isBackendAccessible) {
        console.error('❌ Backend non accessible');
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        return;
      }
      
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
      console.error('❌ Détails de l\'erreur:', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        stack: err?.stack
      });
      
      // Si l'erreur est liée à l'authentification, afficher un message approprié
      if (err?.message?.includes('Session expirée') || 
          err?.message?.includes('Token invalide') ||
          err?.message?.includes('Token d\'authentification manquant') ||
          err?.response?.status === 401) {
        console.log('🔐 Erreur d\'authentification détectée - Redirection vers la connexion');
        setError('Session expirée, veuillez vous reconnecter');
        // Forcer la déconnexion
        await authService.logout();
      } else if (err?.response?.status === 404) {
        setError('Profil utilisateur non trouvé');
      } else if (err?.response?.status >= 500) {
        setError('Erreur serveur, veuillez réessayer plus tard');
      } else {
        setError(err?.message || 'Erreur lors du chargement du profil');
      }
    } finally {
      setLoading(false);
    }
  }, [refreshing, isAuthenticated]);

  // Vérifier les nouveaux badges après chaque action
  const checkForNewBadges = useCallback(async () => {
    if (badges.length > 0) {
      try {
        const newBadges = await profileService.checkNewBadges(badges);
        if (newBadges.length > 0) {
          console.log('🎉 Nouveaux badges détectés:', newBadges);
          setBadges(prev => [...prev, ...newBadges]);
          // Ici on pourrait afficher une notification à l'utilisateur
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des nouveaux badges:', error);
      }
    }
  }, [badges]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      fetchAll();
    }
  }, [fetchAll]);

  // S'enregistrer dans le système de rafraîchissement global
  useEffect(() => {
    registerRefreshCallback('profile', forceRefresh);
    
    return () => {
      unregisterRefreshCallback('profile');
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, forceRefresh]);

  // Vérifier les nouveaux badges après chaque mise à jour des stats
  useEffect(() => {
    if (stats && badges.length > 0) {
      checkForNewBadges();
    }
  }, [stats, checkForNewBadges]);

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
    checkForNewBadges,
    forceRefresh, // Exposer la fonction de rafraîchissement forcé
  };
} 