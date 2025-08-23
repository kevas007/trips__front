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
import { NavigationProp } from '@react-navigation/native';

interface AppearanceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  type: 'switch' | 'select';
  value: boolean | string;
  options?: string[];
}

interface AppearanceSettingsScreenProps {
  navigation: NavigationProp<any>;
}

const AppearanceSettingsScreen: React.FC<AppearanceSettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useAppTheme();
  const [appearanceOptions, setAppearanceOptions] = useState<AppearanceOption[]>([
    {
      id: 'darkMode',
      title: 'Mode Sombre',
      description: 'Activer le thème sombre pour l\'application',
      icon: 'moon',
      type: 'switch',
      value: isDark,
    },
    {
      id: 'fontSize',
      title: 'Taille du Texte',
      description: 'Ajuster la taille du texte dans l\'application',
      icon: 'text',
      type: 'select',
      value: 'Normal',
      options: ['Petit', 'Normal', 'Grand', 'Très grand'],
    },
    {
      id: 'animations',
      title: 'Animations',
      description: 'Activer les animations dans l\'application',
      icon: 'flash',
      type: 'switch',
      value: true,
    },
    {
      id: 'reduceMotion',
      title: 'Réduire les Animations',
      description: 'Réduire les animations pour une meilleure accessibilité',
      icon: 'accessibility',
      type: 'switch',
      value: false,
    },
    {
      id: 'highContrast',
      title: 'Contraste Élevé',
      description: 'Augmenter le contraste pour une meilleure lisibilité',
      icon: 'contrast',
      type: 'switch',
      value: false,
    },
  ]);

  const toggleOption = (id: string) => {
    setAppearanceOptions(prev =>
      prev.map(option =>
        option.id === id
          ? { ...option, value: !option.value }
          : option
      )
    );
  };

  const selectOption = (id: string, value: string) => {
    setAppearanceOptions(prev =>
      prev.map(option =>
        option.id === id
          ? { ...option, value }
          : option
      )
    );
  };

  const handleSave = async () => {
    try {
      // TODO: Implémenter la sauvegarde des préférences
      Alert.alert('Succès', 'Paramètres d\'apparence sauvegardés');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const AppearanceItem = ({ item }: { item: AppearanceOption }) => (
    <View style={[styles.appearanceItem, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.appearanceIcon}>
        <Ionicons name={item.icon} size={24} color={theme.colors.primary[0]} />
      </View>
      <View style={styles.appearanceContent}>
        <Text style={[styles.appearanceTitle, { color: theme.colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.appearanceDescription, { color: theme.colors.text.secondary }]}>
          {item.description}
        </Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value as boolean}
          onValueChange={() => {
            if (item.id === 'darkMode') {
              toggleTheme();
            }
            toggleOption(item.id);
          }}
          trackColor={{ false: theme.colors.glassmorphism.border, true: theme.colors.primary[0] }}
          thumbColor={theme.colors.background.card}
        />
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            Alert.alert(
              item.title,
              'Choisir une option',
              item.options?.map(option => ({
                text: option,
                onPress: () => selectOption(item.id, option),
              }))
            );
          }}
        >
          <Text style={[styles.selectButtonText, { color: theme.colors.primary[0] }]}>
            {item.value}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.primary[0]}
            style={styles.selectIcon}
          />
        </TouchableOpacity>
      )}
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
          Apparence
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {appearanceOptions.map(item => (
          <AppearanceItem key={item.id} item={item} />
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
  appearanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  appearanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,128,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appearanceContent: {
    flex: 1,
  },
  appearanceTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  appearanceDescription: {
    fontSize: 11,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,128,128,0.1)',
  },
  selectButtonText: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
  },
  selectIcon: {
    marginLeft: 4,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default AppearanceSettingsScreen; 