// src/components/Home/AnimatedHeader.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface AnimatedHeaderProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  pulseAnim: Animated.Value;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  fadeAnim,
  slideAnim,
  pulseAnim,
}) => {
  const { user } = useAuth();

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.1)', 'transparent']}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <Animated.View
              style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={['#FF6B9D', '#4ECDC4']}
                style={styles.avatarGradient}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || '🌍'}
                </Text>
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </Animated.View>

            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>
                Bonjour {user?.name?.split(' ')[0] || 'Explorateur'} !
              </Text>
              <Text style={styles.inspirationText}>
                Prêt pour votre prochaine aventure ? 🌟
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() =>
              Alert.alert(
                '🔔 Notifications',
                '• Nouveau compagnon de voyage trouvé !\n• Votre itinéraire Tokyo est populaire\n• Offre spéciale vol Paris-Bali',
              )
            }>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="notifications-outline" size={24} color="#667eea" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 15,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarGradient: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ADE80',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  inspirationText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AnimatedHeader;
