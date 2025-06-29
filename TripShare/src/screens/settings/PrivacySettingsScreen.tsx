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

interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  enabled: boolean;
}

interface PrivacySettingsScreenProps {
  navigation: NavigationProp<any>;
}

const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([
    {
      id: 'profile',
      title: 'Profil Public',
      description: 'Rendre votre profil visible pour tous les utilisateurs',
      icon: 'eye',
      enabled: true,
    },
    {
      id: 'email',
      title: 'Email Public',
      description: 'Afficher votre email sur votre profil',
      icon: 'mail',
      enabled: false,
    },
    {
      id: 'location',
      title: 'Localisation',
      description: 'Partager votre position actuelle',
      icon: 'location',
      enabled: false,
    },
    {
      id: 'activity',
      title: 'Activité',
      description: 'Afficher votre activité récente',
      icon: 'time',
      enabled: true,
    },
    {
      id: 'friends',
      title: 'Liste d\'amis',
      description: 'Rendre votre liste d\'amis visible',
      icon: 'people',
      enabled: true,
    },
    {
      id: 'trips',
      title: 'Voyages',
      description: 'Partager vos voyages avec la communauté',
      icon: 'airplane',
      enabled: true,
    },
  ]);

  const togglePrivacy = (id: string) => {
    setPrivacyOptions(prev =>
      prev.map(option =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const handleSave = async () => {
    try {
      // TODO: Implémenter la sauvegarde des préférences
      Alert.alert('Succès', 'Paramètres de confidentialité sauvegardés');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const PrivacyItem = ({ item }: { item: PrivacyOption }) => (
    <View style={[styles.privacyItem, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.privacyIcon}>
        <Ionicons name={item.icon} size={24} color={theme.colors.primary[0]} />
      </View>
      <View style={styles.privacyContent}>
        <Text style={[styles.privacyTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.privacyDescription, { color: theme.colors.text.secondary }]}>
          {item.description}
        </Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => togglePrivacy(item.id)}
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
          Confidentialité
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {privacyOptions.map(item => (
          <PrivacyItem key={item.id} item={item} />
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,128,128,0.1)', // Material Design 3 Teal
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 6,
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

export default PrivacySettingsScreen; 