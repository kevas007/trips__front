import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design-system';
import Button from '../../components/ui/Button';
import { ProfileScreenStyles as styles } from './ProfileScreenStyles';

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
  onShareProfile,
  onFollow,
  onMessage,
  onNavigateToTrips,
}) => {
  console.log('🎯 ProfileView - User reçu:', user);
  console.log('🎯 ProfileView - User profile:', user?.profile);
  console.log('🎯 ProfileView - User avatar_url:', user?.avatar_url);
  console.log('🎯 ProfileView - User avatar:', user?.avatar);
  console.log('🎯 ProfileView - Profile avatar_url:', user?.profile?.avatar_url);
  // Logs pour déboguer
  console.log('🎯 ProfileView - Props reçues:');
  console.log('  - User:', user);
  console.log('  - UserTrips:', userTrips);
  console.log('  - UserTrips length:', userTrips?.length);
  console.log('  - Loading:', loading);
  console.log('  - Error:', error);
  const insets = useSafeAreaInsets();

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
  const level = user?.stats?.level || 1;
  const xpForNextLevel = 1000; // À adapter si dynamique
  const xpPercent = Math.min(1, xp / xpForNextLevel);

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
              {user?.profile?.avatar_url || user?.avatar_url || user?.avatar ? (
                <Image 
                  source={{ uri: user.profile?.avatar_url || user.avatar_url || user.avatar }} 
                  style={styles.instagramAvatar}
                  defaultSource={require('../../assets/logo.svg')}
                />
              ) : (
                <View style={[styles.instagramAvatarPlaceholder, { backgroundColor: '#f0f0f0' }]}>
                  <Ionicons name="person" size={40} color="#666" />
                </View>
              )}
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
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>{badge.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>



                  {/* Préférences de voyage */}
          {user?.profile?.travel_preferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Préférences de voyage</Text>
              <View style={styles.preferencesContainer}>
                {user.profile.travel_preferences.travel_style && (
                  <View style={styles.preferenceGroup}>
                    <Text style={styles.preferenceGroupTitle}>Style de voyage:</Text>
                    <View style={styles.preferenceTags}>
                      <View style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{user.profile.travel_preferences.travel_style}</Text>
                      </View>
                    </View>
                  </View>
                )}
                {user.profile.travel_preferences.budget_range && (
                  <View style={styles.preferenceGroup}>
                    <Text style={styles.preferenceGroupTitle}>Budget:</Text>
                    <View style={styles.preferenceTags}>
                      <View style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{user.profile.travel_preferences.budget_range}</Text>
                      </View>
                    </View>
                  </View>
                )}
                {user.profile.travel_preferences.group_size && (
                  <View style={styles.preferenceGroup}>
                    <Text style={styles.preferenceGroupTitle}>Taille du groupe:</Text>
                    <View style={styles.preferenceTags}>
                      <View style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{user.profile.travel_preferences.group_size}</Text>
                      </View>
                    </View>
                  </View>
                )}
                {user.profile.travel_preferences.trip_duration && (
                  <View style={styles.preferenceGroup}>
                    <Text style={styles.preferenceGroupTitle}>Durée du voyage:</Text>
                    <View style={styles.preferenceTags}>
                      <View style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{user.profile.travel_preferences.trip_duration}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

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