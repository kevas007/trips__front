import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import OptimizedImage from './OptimizedImage';
import { imageService } from '../../services/imageService';

interface UserInfoCardProps {
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt?: string;
  onPress: () => void;
  loading?: boolean;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  userId,
  username,
  firstName,
  lastName,
  avatarUrl,
  createdAt,
  onPress,
  loading = false,
}) => {
  const { theme } = useAppTheme();

  const displayName = username || 
    (firstName && lastName ? `${firstName} ${lastName}`.trim() : 'Utilisateur');

  const displayDate = createdAt ? 
    new Date(createdAt).toLocaleDateString('fr-FR') : 
    'Date inconnue';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.touchable} 
        onPress={onPress}
        disabled={loading}
      >
        <View style={styles.avatarContainer}>
          <OptimizedImage
            source={avatarUrl || imageService.getDefaultImageURL('avatar')}
            style={styles.avatar}
            thumbnail
            thumbnailSize={40}
            errorPlaceholder={
              <View style={styles.avatarErrorOverlay}>
                <Ionicons name="person" size={20} color={theme.colors.text.secondary} />
              </View>
            }
          />
        </View>
        
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {displayName}
          </Text>
          <Text style={[styles.userDate, { color: theme.colors.text.secondary }]}>
            {displayDate}
          </Text>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={theme.colors.text.secondary} 
          style={styles.chevron}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userDate: {
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default UserInfoCard;
