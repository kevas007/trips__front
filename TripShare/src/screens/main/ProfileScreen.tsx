import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Linking, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { profileService } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};
type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#008080', marginBottom: 8 },
  username: { fontWeight: 'bold', fontSize: 20, color: '#222' },
  name: { fontSize: 15, color: '#666', marginBottom: 4 },
  bio: { color: '#444', fontSize: 14, textAlign: 'center', marginVertical: 8, maxWidth: 260 },
  website: { color: '#008080', fontSize: 14, textAlign: 'center', marginBottom: 8, textDecorationLine: 'underline' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 12 },
  statBlock: { alignItems: 'center', minWidth: 70 },
  statValue: { fontWeight: 'bold', fontSize: 18, color: '#008080' },
  statLabel: { fontSize: 12, color: '#888' },
  actionsRow: { flexDirection: 'row', marginTop: 10, marginBottom: 8 },
  editBtn: { backgroundColor: '#008080', borderRadius: 20, paddingHorizontal: 32, paddingVertical: 8, marginHorizontal: 4 },
  editText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  followBtn: { backgroundColor: '#008080', borderRadius: 20, paddingHorizontal: 32, paddingVertical: 8, marginHorizontal: 4 },
  followText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  msgBtn: { backgroundColor: '#e0f7fa', borderRadius: 20, padding: 8, marginHorizontal: 4 },
  badgesRow: { flexDirection: 'row', marginTop: 12, marginBottom: 8, paddingHorizontal: 8 },
  badgeCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0f7fa', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  badgeText: { color: '#008080', fontWeight: 'bold', fontSize: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, margin: 24, justifyContent: 'center', backgroundColor: '#e53935' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  topRightRow: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', zIndex: 10 },
  shareBtn: { backgroundColor: '#e0f7fa', borderRadius: 20, padding: 8, marginLeft: 8 },
  gridContainer: { marginTop: 16, paddingHorizontal: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  gridItem: { width: (Dimensions.get('window').width - 32) / 3, aspectRatio: 1, backgroundColor: '#f0f0f0', margin: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  gridIcon: { color: '#bbb' },
  gridText: { color: '#bbb', fontSize: 12, marginTop: 4 },
  emptyGridText: { textAlign: 'center', color: '#888', marginTop: 24, fontSize: 15 },
});

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileScreen: React.FC = () => {
  const { user: currentUser, logout } = useSimpleAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();

  // Simule des voyages/posts (à remplacer par l'API réelle)
  const posts = user && user.posts ? user.posts : [];

  const loadProfile = async () => {
    try {
      const userData = await profileService.getProfile();
      if (userData && userData.user && userData.profile) {
        setUser({ ...userData.user, ...userData.profile });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);
  const onRefresh = () => { setRefreshing(true); loadProfile(); };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#222', fontSize: 15, marginBottom: 20 }}>Impossible de charger le profil utilisateur.</Text>
      </View>
    );
  }

  const isCurrentUser = !!currentUser && String(user.id) === String(currentUser.id);
  console.log('user.id:', user.id, 'currentUser.id:', currentUser?.id, 'isCurrentUser:', isCurrentUser);

  // Handler pour partager le profil
  const handleShare = () => {
    // À adapter avec le vrai lien de profil
    const url = `https://tonapp.com/user/${user.username}`;
    Linking.openURL(url);
  };

  // Handler pour aller aux paramètres
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
      {/* Top right actions */}
      <View style={styles.topRightRow}>
        {isCurrentUser && (
          <TouchableOpacity onPress={handleSettings} style={styles.shareBtn}>
            <Ionicons name="settings-outline" size={22} color="#008080" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={22} color="#008080" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={user.avatar_url ? { uri: user.avatar_url } : require('../../assets/logo.svg')}
            style={styles.avatar}
          />
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          {user.website ? (
            <TouchableOpacity onPress={() => Linking.openURL(user.website)}>
              <Text style={styles.website}>{user.website}</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.statsRow}>
            <Stat label="Voyages" value={user.stats?.total_trips ?? 0} />
            <Stat label="Abonnés" value={user.stats?.total_followers ?? 0} />
            <Stat label="Abonnements" value={user.stats?.total_following ?? 0} />
            <Stat label="Likes" value={user.stats?.total_likes ?? 0} />
          </View>
          <View style={styles.actionsRow}>
            {isCurrentUser ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editText}>Modifier profil</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.followBtn} onPress={() => {/* suivre/désabonner */}}>
                  <Text style={styles.followText}>{user.is_followed ? 'Se désabonner' : 'Suivre'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.msgBtn} onPress={() => {/* message */}}>
                  <Ionicons name="chatbubble-outline" size={18} color="#008080" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Badges ou Highlights */}
        {user.badges && user.badges.length > 0 && (
          <ScrollView horizontal style={styles.badgesRow} showsHorizontalScrollIndicator={false}>
            {user.badges.map((badge: string, idx: number) => (
              <View key={idx} style={styles.badgeCircle}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Grille de posts/voyages */}
        <View style={styles.gridContainer}>
          {posts.length === 0 ? (
            <View>
              <View style={styles.grid}>
                {[...Array(6)].map((_, idx) => (
                  <View key={idx} style={styles.gridItem}>
                    <Ionicons name="image-outline" size={32} style={styles.gridIcon} />
                  </View>
                ))}
              </View>
              <Text style={styles.emptyGridText}>Aucun voyage pour l'instant</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {posts.map((post: any, idx: number) => (
                <TouchableOpacity key={idx} style={styles.gridItem} onPress={() => {/* ouvrir le post */}}>
                  {post.image_url ? (
                    <Image source={{ uri: post.image_url }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                  ) : (
                    <Ionicons name="image-outline" size={32} style={styles.gridIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Déconnexion */}
        {isCurrentUser && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen; 