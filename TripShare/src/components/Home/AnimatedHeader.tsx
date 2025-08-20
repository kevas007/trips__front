// src/components/Home/AnimatedHeader.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../types/theme';
import { User } from '../../types/user';

export interface AnimatedHeaderProps {
  user: User | null;
  theme: Theme;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ user, theme }) => {
  // Debug: Afficher les informations utilisateur
  console.log('🔍 AnimatedHeader - User data:', {
    user: !!user,
    username: user?.username,
    email: user?.email,
    name: user?.name,
    avatar: user?.avatar
  });

  return (
    <View style={styles.welcomeSection}>
      <View style={styles.userInfo}>
        <Image
          source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
          style={styles.userAvatar}
        />
        <View>
          <Text style={[styles.welcomeText, { color: theme.colors.text.primary }]}>
            Bonjour, {user?.username || user?.name || 'Voyageur'} 👋
          </Text>
          <Text style={[styles.userLevel, { color: theme.colors.text.secondary }]}>
            Niveau: Explorateur
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addTripButton}>
        <LinearGradient
          colors={[theme.colors.primary[0], theme.colors.primary[1]]}
          style={styles.addTripGradient}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addTripText}>Créer</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userLevel: {
    fontSize: 14,
    marginTop: 2,
  },
  addTripButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addTripText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default AnimatedHeader;
