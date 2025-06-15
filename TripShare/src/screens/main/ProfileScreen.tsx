import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { profileService } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

// Typage navigation
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};
type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const fontSizeMap = {
  'Petit': 14,
  'Normal': 17,
  'Grand': 21,
  'Très grand': 26,
};

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    marginBottom: 16,
  },
  statBlock: {
    alignItems: 'center',
    minWidth: 80,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    margin: 24,
    justifyContent: 'center',
  },
});

const ProfileScreen: React.FC = () => {
  const { user: currentUser, logout } = useSimpleAuth();
  const { theme, fontSize } = useAppTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();

  const loadProfile = async () => {
    try {
      const userData = await profileService.getProfile();
      setUser(userData);
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
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
      </View>
    );
  }
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text.primary, fontSize: fontSizeMap[fontSize], marginBottom: 20 }}>Impossible de charger le profil utilisateur.</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.colors.background.gradient as any}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          {/* Bouton paramètres en haut à droite */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, right: 24, zIndex: 10, padding: 8, backgroundColor: theme.colors.background.card, borderRadius: 24 }}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={26} color={theme.colors.primary[0]} />
          </TouchableOpacity>
          <Image
            source={user.avatar_url ? { uri: user.avatar_url } : { uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || user.username || 'user')}` }}
            style={[
              styles.avatar,
              {
                borderColor: theme.colors.primary[0],
                backgroundColor: theme.colors.background.card,
                // boxShadow web only
                ...(Platform.OS === 'web' ? { boxShadow: `0px 4px 10px ${theme.colors.primary[0]}55` } : {}),
              },
            ]}
          />
          <Text style={{ fontSize: fontSizeMap[fontSize] + 10, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 4 }}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={{ fontSize: fontSizeMap[fontSize], color: theme.colors.text.secondary, marginBottom: 2 }}>@{user.username}</Text>
          <Text style={{ fontSize: fontSizeMap[fontSize] - 1, color: theme.colors.text.secondary, marginBottom: 12 }}>{user.email}</Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary[0] }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fontSizeMap[fontSize] - 1 }}>Éditer le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 28 }}>
          <View style={styles.statBlock}>
            <Ionicons name="airplane" size={24} color={theme.colors.primary[0]} />
            <Text style={{ fontSize: fontSizeMap[fontSize] + 2, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 4 }}>{user.stats?.total_trips ?? 0}</Text>
            <Text style={{ fontSize: fontSizeMap[fontSize] - 2, color: theme.colors.text.secondary, marginTop: 2 }}>Voyages</Text>
          </View>
          <View style={styles.statBlock}>
            <Ionicons name="earth" size={24} color={theme.colors.primary[0]} />
            <Text style={{ fontSize: fontSizeMap[fontSize] + 2, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 4 }}>{user.stats?.total_countries ?? 0}</Text>
            <Text style={{ fontSize: fontSizeMap[fontSize] - 2, color: theme.colors.text.secondary, marginTop: 2 }}>Pays</Text>
          </View>
          <View style={styles.statBlock}>
            <Ionicons name="people" size={24} color={theme.colors.primary[0]} />
            <Text style={{ fontSize: fontSizeMap[fontSize] + 2, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 4 }}>{user.stats?.total_followers ?? 0}</Text>
            <Text style={{ fontSize: fontSizeMap[fontSize] - 2, color: theme.colors.text.secondary, marginTop: 2 }}>Abonnés</Text>
          </View>
          <View style={styles.statBlock}>
            <Ionicons name="heart" size={24} color={theme.colors.primary[0]} />
            <Text style={{ fontSize: fontSizeMap[fontSize] + 2, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 4 }}>{user.stats?.total_likes ?? 0}</Text>
            <Text style={{ fontSize: fontSizeMap[fontSize] - 2, color: theme.colors.text.secondary, marginTop: 2 }}>Likes</Text>
          </View>
        </View>

        {/* Bio */}
        {user.bio ? (
          <View style={{ marginHorizontal: 24, marginBottom: 18 }}>
            <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold', fontSize: fontSizeMap[fontSize] }}>À propos de moi</Text>
            <Text style={{ color: theme.colors.text.secondary, fontSize: fontSizeMap[fontSize], marginTop: 6 }}>{user.bio}</Text>
          </View>
        ) : null}

        {/* Badges */}
        {user.stats?.badges && user.stats.badges.length > 0 && (
          <View style={{ marginHorizontal: 24, marginBottom: 18 }}>
            <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold', fontSize: fontSizeMap[fontSize] }}>Badges</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {user.stats.badges.map((badge: string, idx: number) => (
                <View key={idx} style={[styles.badge, { backgroundColor: theme.colors.primary[0] + '22' }] }>
                  <Text style={{ color: theme.colors.primary[0], fontWeight: 'bold', fontSize: fontSizeMap[fontSize] - 2 }}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen; 