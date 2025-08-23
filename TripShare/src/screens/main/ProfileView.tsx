import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../design-system';
import Button from '../../components/ui/Button';
import { ProfileScreenStyles as styles } from './ProfileScreenStyles';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { badgeService } from '../../services/badgeService';

interface ProfileViewProps {
  user: any;
  badges: any[];
  userTrips: any[];
  isOwnProfile: boolean;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onEditProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onShareProfile: () => void;
  onFollow: () => void;
  onMessage: () => void;
  onNavigateToTrips: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  badges,
  userTrips,
  isOwnProfile,
  loading,
  error,
  refreshing,
  onRefresh,
  onEditProfile,
  onSettings,
  onLogout,
  onShareProfile: _onShareProfile,
  onFollow,
  onMessage,
  onNavigateToTrips,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const navigation = useNavigation();
  
  console.log('🎯 ProfileView - User reçu:', user);
  console.log('🎯 ProfileView - User profile:', user?.profile);
  console.log('🎯 ProfileView - User avatar_url:', user?.avatar_url);
  console.log('🎯 ProfileView - User avatar:', user?.avatar);
  console.log('🎯 ProfileView - Profile avatar_url:', user?.profile?.avatar_url);
  console.log('🎯 ProfileView - getAvatarUrl result:', getAvatarUrl(user));
  // Logs pour déboguer
  console.log('🎯 ProfileView - Props reçues:');
  console.log('  - User:', user);
  console.log('  - UserTrips:', userTrips);
  console.log('  - UserTrips length:', userTrips?.length);
  console.log('  - Loading:', loading);
  console.log('  - Error:', error);

  // Animation d'apparition
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  // Données de niveau dynamiques (exemple simple)
  const xp = user?.stats?.xp || 0;
  const _level = user?.stats?.level || 1;
  const xpForNextLevel = 1000; // À adapter si dynamique
  const _xpPercent = Math.min(1, xp / xpForNextLevel);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
        <Button title="Réessayer" onPress={onRefresh} />
      </View>
    );
  }

    return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#FAFAFA' }}>
        {/* Header cohérent avec HomeScreen */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Profil</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={onSettings}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>



        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
                  {/* Section profil Instagram-style */}
        <View style={styles.instagramProfileSection}>
          {/* Avatar et infos utilisateur */}
          <View style={styles.instagramProfileHeader}>
            <View style={styles.instagramAvatarSection}>
              <Image 
                source={{ 
                  uri: avatarError 
                    ? `http://localhost:8085/storage/defaults/default-avatar.jpg&h=100&fit=crop&crop=face`
                    : getAvatarUrl(user)
                }} 
                style={styles.instagramAvatar}
                onError={(error) => {
                  console.warn('⚠️ Erreur chargement avatar ProfileView:', error?.nativeEvent?.error);
                  console.warn('⚠️ URL getAvatarUrl qui a échoué:', getAvatarUrl(user));
                  console.warn('⚠️ User data:', JSON.stringify(user, null, 2));
                  setAvatarError(true);
                }}
              />
            </View>
            
            <View style={styles.instagramUserInfoSection}>
              <Text style={styles.instagramUsername}>
                {user?.username || 'utilisateur'}
              </Text>
              <Text style={styles.instagramDisplayName}>
                {user?.name || user?.username || 'Utilisateur TripShare'}
              </Text>
              {user?.profile?.bio && (
                <Text style={styles.instagramBio}>{user.profile.bio}</Text>
              )}
            </View>
          </View>

          {/* Statistiques Instagram-style */}
          <View style={styles.instagramStatsRow}>
            <TouchableOpacity style={styles.instagramStatItem} onPress={() => {
              console.log('🚀 Navigation vers la page des voyages');
              onNavigateToTrips();
            }}>
              <Text style={styles.instagramStatNumber}>{user?.stats?.tripsCreated || 0}</Text>
              <Text style={styles.instagramStatLabel}>Voyages</Text>
            </TouchableOpacity>
            <View style={styles.instagramStatItem}>
              <Text style={styles.instagramStatNumber}>{user?.stats?.followers || 0}</Text>
              <Text style={styles.instagramStatLabel}>Abonnés</Text>
            </View>
            <View style={styles.instagramStatItem}>
              <Text style={styles.instagramStatNumber}>{user?.stats?.following || 0}</Text>
              <Text style={styles.instagramStatLabel}>Abonnements</Text>
            </View>
          </View>

          {/* Boutons d'action Instagram-style */}
          <View style={styles.instagramActionButtonsRow}>
            {isOwnProfile ? (
              <TouchableOpacity style={styles.instagramEditProfileButton} onPress={onEditProfile}>
                <Text style={styles.instagramEditProfileButtonText}>Modifier le profil</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.instagramFollowButton} onPress={onFollow}>
                  <Text style={styles.instagramFollowButtonText}>Suivre</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.instagramMessageButton} onPress={onMessage}>
                  <Text style={styles.instagramMessageButtonText}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>





        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges ({badges.length})</Text>
          <View style={styles.badgesGrid}>
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <View key={`badge-${badge.id || index}`} style={styles.badgeItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginRight: 12 }}>{badge.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDescription}>{badge.description}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#666666" />
                <Text style={styles.emptyStateText}>Aucun badge pour le moment</Text>
                <Text style={styles.emptyStateSubtext}>Créez des voyages pour gagner des badges !</Text>
              </View>
            )}
          </View>
          
          {/* Prochains badges disponibles */}
          {isOwnProfile && user?.stats && (
            <View style={styles.nextBadgesSection}>
              <Text style={styles.nextBadgesTitle}>Prochains badges à débloquer</Text>
              <View style={styles.nextBadgesContainer}>
                {(() => {
                  const nextBadges = badgeService.getNextAvailableBadges(user.stats, user.createdAt || new Date().toISOString());
                  
                  return nextBadges.slice(0, 3).map((badge, index) => (
                    <View key={`next-badge-${index}`} style={styles.nextBadgeItem}>
                      <Text style={{ fontSize: 24, opacity: 0.5 }}>{badge.icon}</Text>
                      <Text style={styles.nextBadgeName}>{badge.name}</Text>
                      <Text style={styles.nextBadgeDescription}>{badge.description}</Text>
                    </View>
                  ));
                })()}
              </View>
            </View>
          )}
        </View>

        {/* Préférences de voyage */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Préférences de voyage</Text>
            {isOwnProfile && (
              <TouchableOpacity style={styles.editButton} onPress={() => {
                console.log('Navigation vers EditPreferencesScreen');
                navigation.navigate('EditPreferences' as never);
              }}>
                <Ionicons name="pencil" size={16} color="#008080" />
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {user?.profile?.travel_preferences ? (
            <View style={styles.preferencesContainer}>
              {/* Activités */}
              {user.profile.travel_preferences.activities && user.profile.travel_preferences.activities.length > 0 && (
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceGroupTitle}>Activités:</Text>
                  <View style={styles.preferenceTags}>
                    {user.profile.travel_preferences.activities.map((activity: string, index: number) => (
                      <View key={`activity-${index}`} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{activity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Hébergement */}
              {user.profile.travel_preferences.accommodation && user.profile.travel_preferences.accommodation.length > 0 && (
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceGroupTitle}>Hébergement:</Text>
                  <View style={styles.preferenceTags}>
                    {user.profile.travel_preferences.accommodation.map((acc: string, index: number) => (
                      <View key={`accommodation-${index}`} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{acc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Transport */}
              {user.profile.travel_preferences.transportation && user.profile.travel_preferences.transportation.length > 0 && (
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceGroupTitle}>Transport:</Text>
                  <View style={styles.preferenceTags}>
                    {user.profile.travel_preferences.transportation.map((transport: string, index: number) => (
                      <View key={`transport-${index}`} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{transport}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Budget */}
              {user.profile.travel_preferences.budget && user.profile.travel_preferences.budget.length > 0 && (
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceGroupTitle}>Budget:</Text>
                  <View style={styles.preferenceTags}>
                    {user.profile.travel_preferences.budget.map((budget: string, index: number) => (
                      <View key={`budget-${index}`} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{budget}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Climat */}
              {user.profile.travel_preferences.climate && user.profile.travel_preferences.climate.length > 0 && (
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceGroupTitle}>Climat:</Text>
                  <View style={styles.preferenceTags}>
                    {user.profile.travel_preferences.climate.map((climate: string, index: number) => (
                      <View key={`climate-${index}`} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{climate}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Nourriture */}
              {user.profile.travel_preferences.food && user.profile.travel_preferences.food.length > 0 && (
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceGroupTitle}>Préférences alimentaires:</Text>
                  <View style={styles.preferenceTags}>
                    {user.profile.travel_preferences.food.map((food: string, index: number) => (
                      <View key={`food-${index}`} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{food}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Vérifier s'il y a des préférences */}
              {(!user.profile.travel_preferences.activities || user.profile.travel_preferences.activities.length === 0) &&
               (!user.profile.travel_preferences.accommodation || user.profile.travel_preferences.accommodation.length === 0) &&
               (!user.profile.travel_preferences.transportation || user.profile.travel_preferences.transportation.length === 0) &&
               (!user.profile.travel_preferences.budget || user.profile.travel_preferences.budget.length === 0) &&
               (!user.profile.travel_preferences.climate || user.profile.travel_preferences.climate.length === 0) &&
               (!user.profile.travel_preferences.food || user.profile.travel_preferences.food.length === 0) && (
                <View style={styles.emptyState}>
                  <Ionicons name="options-outline" size={48} color="#666666" />
                  <Text style={styles.emptyStateText}>Aucune préférence définie</Text>
                  <Text style={styles.emptyStateSubtext}>Ajoutez vos préférences pour des recommandations personnalisées</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="options-outline" size={48} color="#666666" />
              <Text style={styles.emptyStateText}>Aucune préférence définie</Text>
              <Text style={styles.emptyStateSubtext}>Ajoutez vos préférences pour des recommandations personnalisées</Text>
            </View>
          )}
        </View>

        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.neutral[500]} />
              <Text style={styles.infoLabel}>Nom complet:</Text>
              <Text style={styles.infoValue}>
                {user?.user?.first_name && user?.user?.last_name 
                  ? `${user.user.first_name} ${user.user.last_name}`.trim()
                  : 'Non renseigné'
                }
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={16} color={COLORS.neutral[500]} />
              <Text style={styles.infoLabel}>Langue:</Text>
              <Text style={styles.infoValue}>{user?.user?.language || 'Français'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.neutral[500]} />
              <Text style={styles.infoLabel}>Fuseau horaire:</Text>
              <Text style={styles.infoValue}>{user?.user?.timezone || 'UTC'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={16} color={COLORS.neutral[500]} />
              <Text style={styles.infoLabel}>Devise:</Text>
              <Text style={styles.infoValue}>{user?.user?.preferred_currency || 'EUR'}</Text>
            </View>
          </View>
        </View>

        {/* Préférences générales */}
        {user?.preferences?.activities?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Préférences générales</Text>
            <View style={styles.preferencesContainer}>
              {user.preferences.activities.map((activity: string, index: number) => (
                <View key={index} style={styles.preferenceTag}>
                  <Text style={styles.preferenceText}>{activity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}



        {/* Membre depuis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membre depuis</Text>
          <Text style={styles.memberSince}>
            {user?.user?.created_at ? new Date(user.user.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Récemment'}
          </Text>
        </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfileView; 