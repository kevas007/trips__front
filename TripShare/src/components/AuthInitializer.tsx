import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store';
import { authService } from '../services/auth';
import { profileService } from '../services/profileService';
import { User } from '../types/unified';
import { Ionicons } from '@expo/vector-icons';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { isLoading, setUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthInitializer - Vérification de l\'authentification...');
        
        // Vérifier si on a un token valide
        const token = authService.getToken();
        console.log('🔍 AuthInitializer - Token disponible:', !!token);
        
        if (token) {
          // Essayer de récupérer les informations utilisateur
          try {
            console.log('🔍 AuthInitializer - Tentative de récupération du profil...');
            const userData = await profileService.getProfile();
            console.log('✅ AuthInitializer - Utilisateur récupéré:', userData);
            
            if (userData) {
              // Convertir les données du backend vers l'interface unifiée
              const userDataAny = userData as any;
              const unifiedUser: User = {
                id: userDataAny.id || '',
                email: userDataAny.email || '',
                name: userDataAny.name || `${userDataAny.firstName || userDataAny.first_name || ''} ${userDataAny.lastName || userDataAny.last_name || ''}`.trim(),
                username: userDataAny.username || '',
                firstName: userDataAny.firstName || userDataAny.first_name || '',
                lastName: userDataAny.lastName || userDataAny.last_name || '',
                avatar: userDataAny.avatar || userDataAny.avatar_url,
                avatarUrl: userDataAny.avatar_url || userDataAny.avatar,
                bio: userDataAny.bio || userDataAny.profile?.bio,
                verified: userDataAny.verified || false,
                createdAt: userDataAny.createdAt || userDataAny.created_at || new Date().toISOString(),
                updatedAt: userDataAny.updatedAt || userDataAny.updated_at || new Date().toISOString(),
                lastLogin: userDataAny.lastLogin || userDataAny.last_login,
                settings: userDataAny.settings || {
                  biometricEnabled: false,
                  notificationsEnabled: true,
                  emailNotifications: true,
                  language: 'fr',
                  currency: 'EUR',
                  timezone: 'Europe/Paris',
                  privacyLevel: 'public',
                  autoSync: true,
                  dataCollection: true,
                },
                stats: userDataAny.stats || {
                  tripsCreated: 0,
                  tripsShared: 0,
                  tripsLiked: 0,
                  followers: 0,
                  following: 0,
                  totalViews: 0,
                  totalLikes: 0,
                  countriesVisited: 0,
                  citiesVisited: 0,
                },
                preferences: userDataAny.preferences || userDataAny.profile?.travel_preferences || {
                  activities: [],
                  accommodation: [],
                  transport: [],
                  food: [],
                  budget: [],
                  climate: [],
                  culture: [],
                },
                profile: userDataAny.profile,
              };
              
              setUser(unifiedUser);
              console.log('✅ AuthInitializer - État d\'authentification restauré');
            }
          } catch (error) {
            console.warn('⚠️ AuthInitializer - Erreur lors de la récupération du profil:', error);
            // Token invalide, nettoyer
            await authService.logout();
          }
        } else {
          console.log('ℹ️ AuthInitializer - Aucun token trouvé');
        }
      } catch (error) {
        console.error('❌ AuthInitializer - Erreur lors de l\'initialisation:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setUser]);

  if (isLoading || isInitializing) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1b3a',
      }}>
        <Ionicons 
          name="airplane" 
          size={64} 
          color="#008080"
        />
        <Text style={{
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: 20,
        }}>
          TripShare
        </Text>
        <Text style={{
          color: '#d1d5db',
          fontSize: 16,
          marginTop: 10,
          marginBottom: 30,
        }}>
          Initialisation...
        </Text>
        <ActivityIndicator 
          size="large" 
          color="#008080"
        />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer; 