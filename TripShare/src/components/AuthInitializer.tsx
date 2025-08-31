import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated, Image } from 'react-native';
import { useAuthStore } from '../store';
import { authService } from '../services/auth';
import { profileService } from '../services/profileService';
import { User } from '../types/unified';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { isLoading, setUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Animations pour les images
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Images de vacances pour l'animation
  const vacationImages = [
    {
      uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
      title: 'Plage paradisiaque',
      description: 'Détendez-vous sur des plages de sable blanc'
    },
    {
      uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&crop=center',
      title: 'Aventure en montagne',
      description: 'Explorez des paysages montagneux époustouflants'
    },
    {
      uri: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop&crop=center',
      title: 'Ville historique',
      description: 'Découvrez des villes chargées d\'histoire'
    },
    {
      uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
      title: 'Coucher de soleil',
      description: 'Admirez des couchers de soleil inoubliables'
    },
    {
      uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&crop=center',
      title: 'Nature sauvage',
      description: 'Immergez-vous dans une nature préservée'
    },
    {
      uri: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop&crop=center',
      title: 'Culture locale',
      description: 'Partagez des moments avec les locaux'
    },
  ];

  // Animation des images
  useEffect(() => {
    const animateImages = () => {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
                 // Animation de sortie après 4 secondes
         setTimeout(() => {
           Animated.parallel([
             Animated.timing(fadeAnim, {
               toValue: 0,
               duration: 500,
               useNativeDriver: true,
             }),
             Animated.timing(scaleAnim, {
               toValue: 0.8,
               duration: 500,
               useNativeDriver: true,
             }),
           ]).start(() => {
             // Passer à l'image suivante
             setCurrentImageIndex((prev) => (prev + 1) % vacationImages.length);
             // Réinitialiser les animations
             fadeAnim.setValue(0);
             scaleAnim.setValue(0.8);
             rotateAnim.setValue(0);
           });
         }, 4000);
      });
    };

    // Démarrer l'animation
    animateImages();
    
         // Continuer l'animation en boucle
     const interval = setInterval(animateImages, 5500);
    
    return () => clearInterval(interval);
  }, [currentImageIndex]);

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
            
            if (userData) {
              console.log('✅ AuthInitializer - Utilisateur récupéré:', userData);
              
              // Convertir les données en format User unifié
              const userDataAny = userData as any;
              const unifiedUser: User = {
                id: userDataAny.id || userDataAny.user?.id || 'unknown',
                email: userDataAny.email || userDataAny.user?.email || '',
                username: userDataAny.username || userDataAny.user?.username || '',
                firstName: userDataAny.firstName || userDataAny.first_name || userDataAny.user?.first_name || '',
                lastName: userDataAny.lastName || userDataAny.last_name || userDataAny.user?.last_name || '',
                name: userDataAny.name || `${userDataAny.firstName || userDataAny.first_name || ''} ${userDataAny.lastName || userDataAny.last_name || ''}`.trim(),
                avatar: userDataAny.avatar || userDataAny.avatar_url || userDataAny.profile?.avatar_url,
                avatarUrl: userDataAny.avatarUrl || userDataAny.avatar_url || userDataAny.profile?.avatar_url,
                bio: userDataAny.bio || userDataAny.profile?.bio,
                createdAt: userDataAny.createdAt || userDataAny.created_at || userDataAny.user?.created_at,
                updatedAt: userDataAny.updatedAt || userDataAny.updated_at || userDataAny.user?.updated_at,
                lastLogin: userDataAny.lastLogin || userDataAny.last_login,
                verified: userDataAny.verified || false,
                settings: userDataAny.settings || {},
                stats: userDataAny.stats || {
                  posts: 0,
                  followers: 0,
                  following: 0,
                  totalViews: 0,
                  totalLikes: 0,
                  countriesVisited: 0,
                  citiesVisited: 0,
                },
                preferences: userDataAny.preferences || (userDataAny.profile && typeof userDataAny.profile === 'object' ? userDataAny.profile.travel_preferences : undefined) || {
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
    const currentImage = vacationImages[currentImageIndex];
    
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1b3a',
      }}>
        {/* Animation de l'image de vacances */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            marginBottom: 20,
          }}
        >
          <Image 
            source={{ uri: currentImage.uri }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: '#008080',
            }}
            resizeMode="cover"
          />
        </Animated.View>
        
        <Text style={{
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: 10,
          textAlign: 'center',
        }}>
          TripShare
        </Text>
        
        <Text style={{
          color: '#008080',
          fontSize: 16,
          fontWeight: '600',
          marginTop: 5,
          textAlign: 'center',
        }}>
          {currentImage.title}
        </Text>
        
        <Text style={{
          color: '#d1d5db',
          fontSize: 14,
          marginTop: 5,
          textAlign: 'center',
          paddingHorizontal: 40,
        }}>
          {currentImage.description}
        </Text>
        
        <Text style={{
          color: '#d1d5db',
          fontSize: 16,
          marginTop: 20,
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