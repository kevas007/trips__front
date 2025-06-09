import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { profileService } from '../../services/profileService';
import { User, UserStats, Badge } from '../../types/user';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ProfileScreen: React.FC = () => {
  const { user: currentUser, logout, isLoading: isAuthLoading } = useAuth();
  const { theme, isDark, toggleTheme } = useAppTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();

  const loadProfile = async () => {
    try {
      const userData = await profileService.getProfile();
      setUser(userData);
      console.log('Profil chargé:', userData);
      console.log('Stats chargées:', userData.stats);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setUser(null);
      setLoading(false);
      setRefreshing(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const stylesModern = StyleSheet.create({
    statCard: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      minWidth: 90,
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 4 },
    statLabel: { fontSize: 13, color: '#b0b0b0', marginTop: 2 },
    buttonPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4f8cff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      justifyContent: 'center',
      shadowColor: '#4f8cff',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    buttonSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#4f8cff',
    },
    buttonDanger: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ff4f4f',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      justifyContent: 'center',
      shadowColor: '#ff4f4f',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  });

  if (loading) {
    return (
      <View style={[stylesModern.container, { backgroundColor: theme.colors.background.primary }]}>
        <Text style={{ color: 'red', fontSize: 22, fontWeight: 'bold', marginTop: 40 }}>TEST PROFILE RENDU</Text>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[stylesModern.container, { backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red', fontSize: 22, fontWeight: 'bold', marginBottom: 30 }}>TEST PROFILE RENDU</Text>
        <Text style={[stylesModern.errorText, { color: theme.colors.text.primary, marginBottom: 20 }]}>Impossible de charger le profil utilisateur.</Text>
        <Text style={{ color: theme.colors.text.secondary, fontSize: 13, marginBottom: 10 }}>Détail technique :</Text>
        <Text selectable style={{ color: theme.colors.text.secondary, fontSize: 12, marginBottom: 10, maxWidth: 400 }}>
          user: {JSON.stringify(user)}
        </Text>
        <Text style={{ color: theme.colors.text.secondary, fontSize: 12, maxWidth: 400 }}>
          stats: {JSON.stringify(user?.stats)}
        </Text>
        <Text style={{ color: theme.colors.text.secondary, fontSize: 12, marginTop: 20 }}>Vérifie la console pour plus de détails.</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.colors.background.gradient}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Image
            source={user.avatar_url ? { uri: user.avatar_url } : { uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || user.username || 'user')}` }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 4,
              borderColor: theme.colors.primary[0],
              backgroundColor: theme.colors.background.card,
              marginBottom: 16,
              boxShadow: `0px 4px 10px ${theme.colors.primary[0]}55`,
            }}
          />
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 4 }}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.text.secondary, marginBottom: 2 }}>@{user.username}</Text>
          <Text style={{ fontSize: 15, color: theme.colors.text.secondary, marginBottom: 12 }}>{user.email}</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 24 }}>
          <View style={stylesModern.statCard}>
            <Ionicons name="airplane" size={24} color="#4f8cff" />
            <Text style={stylesModern.statValue}>{user.stats?.total_trips ?? 0}</Text>
            <Text style={stylesModern.statLabel}>Voyages</Text>
          </View>
          <View style={stylesModern.statCard}>
            <Ionicons name="people" size={24} color="#4f8cff" />
            <Text style={stylesModern.statValue}>{user.stats?.total_followers ?? 0}</Text>
            <Text style={stylesModern.statLabel}>Abonnés</Text>
          </View>
          <View style={stylesModern.statCard}>
            <Ionicons name="person-add" size={24} color="#4f8cff" />
            <Text style={stylesModern.statValue}>{user.stats?.total_following ?? 0}</Text>
            <Text style={stylesModern.statLabel}>Abonnements</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ marginHorizontal: 24, marginTop: 16 }}>
          <TouchableOpacity style={stylesModern.buttonPrimary} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={stylesModern.buttonText}>Modifier le profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={stylesModern.buttonSecondary} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color="#4f8cff" style={{ marginRight: 8 }} />
            <Text style={[stylesModern.buttonText, { color: '#4f8cff' }]}>Paramètres</Text>
          </TouchableOpacity>
          <TouchableOpacity style={stylesModern.buttonDanger} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={stylesModern.buttonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen; 