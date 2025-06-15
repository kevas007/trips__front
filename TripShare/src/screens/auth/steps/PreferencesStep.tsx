import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface PreferencesStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

interface FormData {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    locationSharing: boolean;
  };
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ onNext, initialData = {} }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    language: initialData.language || 'fr',
    theme: initialData.theme || 'system',
    notifications: {
      email: initialData.notifications?.email ?? true,
      push: initialData.notifications?.push ?? true,
      marketing: initialData.notifications?.marketing ?? false,
    },
    privacy: {
      profileVisibility: initialData.privacy?.profileVisibility || 'public',
      locationSharing: initialData.privacy?.locationSharing ?? true,
    },
  });

  const handleNext = () => {
    onNext(formData);
  };

  const PreferenceItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onValueChange,
    type = 'switch',
  }: any) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <Ionicons name={icon} size={24} color={theme.colors.text} style={styles.preferenceIcon} />
        <View style={styles.preferenceText}>
          <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.preferenceDescription, { color: theme.colors.text + '80' }]}>
            {description}
          </Text>
        </View>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
                      trackColor={{ false: '#767577', true: theme.colors.primary[0] }}
          thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
        />
      ) : (
        <View style={styles.optionButtons}>
          {['public', 'private', 'friends'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                value === option && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => onValueChange(option)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  value === option && { color: '#FFFFFF' },
                ]}
              >
                {t(`privacy.${option}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('preferences.notifications')}
        </Text>
        
        <PreferenceItem
          icon="mail-outline"
          title={t('preferences.emailNotifications')}
          description={t('preferences.emailNotificationsDesc')}
          value={formData.notifications.email}
          onValueChange={(value: boolean) =>
            setFormData(prev => ({
              ...prev,
              notifications: { ...prev.notifications, email: value },
            }))
          }
        />

        <PreferenceItem
          icon="notifications-outline"
          title={t('preferences.pushNotifications')}
          description={t('preferences.pushNotificationsDesc')}
          value={formData.notifications.push}
          onValueChange={(value: boolean) =>
            setFormData(prev => ({
              ...prev,
              notifications: { ...prev.notifications, push: value },
            }))
          }
        />

        <PreferenceItem
          icon="megaphone-outline"
          title={t('preferences.marketingNotifications')}
          description={t('preferences.marketingNotificationsDesc')}
          value={formData.notifications.marketing}
          onValueChange={(value: boolean) =>
            setFormData(prev => ({
              ...prev,
              notifications: { ...prev.notifications, marketing: value },
            }))
          }
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('preferences.privacy')}
        </Text>

        <PreferenceItem
          icon="eye-outline"
          title={t('preferences.profileVisibility')}
          description={t('preferences.profileVisibilityDesc')}
          value={formData.privacy.profileVisibility}
          onValueChange={(value: string) =>
            setFormData(prev => ({
              ...prev,
              privacy: { ...prev.privacy, profileVisibility: value },
            }))
          }
          type="select"
        />

        <PreferenceItem
          icon="location-outline"
          title={t('preferences.locationSharing')}
          description={t('preferences.locationSharingDesc')}
          value={formData.privacy.locationSharing}
          onValueChange={(value: boolean) =>
            setFormData(prev => ({
              ...prev,
              privacy: { ...prev.privacy, locationSharing: value },
            }))
          }
        />

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  preferenceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceIcon: {
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default PreferencesStep; 