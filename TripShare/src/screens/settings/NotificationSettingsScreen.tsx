import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { NavigationProp } from '@react-navigation/native';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  enabled: boolean;
}

interface NotificationSettingsScreenProps {
  navigation: NavigationProp<any>;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const [notifications, setNotifications] = useState<NotificationCategory[]>([
    {
      id: 'push',
      title: 'Notifications Push',
      description: 'Recevoir des notifications sur votre appareil',
      icon: 'notifications',
      enabled: true,
    },
    {
      id: 'email',
      title: 'Notifications Email',
      description: 'Recevoir des notifications par email',
      icon: 'mail',
      enabled: false,
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Notifications pour les nouveaux messages',
      icon: 'chatbubble',
      enabled: true,
    },
    {
      id: 'trips',
      title: 'Voyages',
      description: 'Notifications pour les mises à jour de vos voyages',
      icon: 'airplane',
      enabled: true,
    },
    {
      id: 'social',
      title: 'Social',
      description: 'Notifications pour les interactions sociales',
      icon: 'people',
      enabled: true,
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Recevoir des offres et promotions',
      icon: 'megaphone',
      enabled: false,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const handleSave = async () => {
    try {
      // TODO: Implémenter la sauvegarde des préférences
      Alert.alert('Succès', 'Préférences de notification sauvegardées');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences');
    }
  };

  const NotificationItem = ({ item }: { item: NotificationCategory }) => (
    <View style={[styles.notificationItem, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.notificationIcon}>
        <Ionicons name={item.icon} size={24} color={theme.colors.primary[0]} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.notificationDescription, { color: theme.colors.text.secondary }]}>
          {item.description}
        </Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleNotification(item.id)}
        trackColor={{ false: theme.colors.glassmorphism.border, true: theme.colors.primary[0] }}
        thumbColor={theme.colors.background.card}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Notifications
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {notifications.map(item => (
          <NotificationItem key={item.id} item={item} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79,140,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationSettingsScreen; 