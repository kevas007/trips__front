import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store';
import { profileService } from '../../services/profileService';
import { useProfileData } from '../../hooks/useProfileData';

interface TravelPreferences {
  activities: string[];
  accommodation: string[];
  transportation: string[];
  food: string[];
  budget: string[];
  climate: string[];
}

const EditPreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { user, setUser } = useAuthStore();
  const { onRefresh } = useProfileData();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<TravelPreferences>({
    activities: [],
    accommodation: [],
    transportation: [],
    food: [],
    budget: [],
    climate: [],
  });

  useEffect(() => {
    if (user?.profile?.travel_preferences) {
      // S'assurer que toutes les propriétés existent avec des valeurs par défaut
      const userPrefs = user.profile.travel_preferences;
      setPreferences({
        activities: userPrefs.activities || [],
        accommodation: userPrefs.accommodation || [],
        transportation: userPrefs.transportation || [],
        food: userPrefs.food || [],
        budget: userPrefs.budget || [],
        climate: userPrefs.climate || [],
      });
    }
  }, [user]);

  const addPreference = (category: keyof TravelPreferences, value: string) => {
    if (value.trim()) {
      setPreferences(prev => ({
        ...prev,
        [category]: [...prev[category], value.trim()]
      }));
    }
  };

  const removePreference = (category: keyof TravelPreferences, index: number) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      await profileService.updateTravelPreferences(preferences);
      
      // Rafraîchir les données du profil
      await onRefresh();
      
      // Mettre à jour le store d'authentification avec les nouvelles données
      const updatedProfile = await profileService.getProfile();
      setUser(updatedProfile as any);
      
      Alert.alert('Succès', 'Préférences mises à jour avec succès');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour les préférences');
    } finally {
      setLoading(false);
    }
  };

  const PreferenceSection = ({ 
    title, 
    category, 
    placeholder, 
    suggestions 
  }: { 
    title: string; 
    category: keyof TravelPreferences; 
    placeholder: string; 
    suggestions: string[] 
  }) => {
    const [inputValue, setInputValue] = useState('');

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        
        {/* Input pour ajouter */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={() => {
              addPreference(category, inputValue);
              setInputValue('');
            }}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              addPreference(category, inputValue);
              setInputValue('');
            }}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionTag}
              onPress={() => addPreference(category, suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Préférences actuelles */}
        <View style={styles.preferencesContainer}>
          {preferences[category].map((pref, index) => (
            <View key={index} style={styles.preferenceTag}>
              <Text style={styles.preferenceText}>{pref}</Text>
              <TouchableOpacity
                onPress={() => removePreference(category, index)}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={16} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modifier les préférences</Text>
        <TouchableOpacity onPress={savePreferences} style={styles.saveButton} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <PreferenceSection
          title="Activités"
          category="activities"
          placeholder="Ajouter une activité..."
          suggestions={['Randonnée', 'Plage', 'Musée', 'Restaurant', 'Shopping', 'Sport']}
        />

        <PreferenceSection
          title="Hébergement"
          category="accommodation"
          placeholder="Ajouter un type d'hébergement..."
          suggestions={['Hôtel', 'Auberge', 'Appartement', 'Maison', 'Camping']}
        />

        <PreferenceSection
          title="Transport"
          category="transportation"
          placeholder="Ajouter un moyen de transport..."
          suggestions={['Avion', 'Train', 'Voiture', 'Bus', 'Vélo', 'Marche']}
        />

        <PreferenceSection
          title="Budget"
          category="budget"
          placeholder="Ajouter une fourchette de budget..."
          suggestions={['Économique', 'Moyen', 'Luxe', 'Très haut de gamme']}
        />

        <PreferenceSection
          title="Climat"
          category="climate"
          placeholder="Ajouter une préférence climatique..."
          suggestions={['Chaud', 'Froid', 'Tempéré', 'Tropical', 'Méditerranéen']}
        />

        <PreferenceSection
          title="Préférences alimentaires"
          category="food"
          placeholder="Ajouter une préférence alimentaire..."
          suggestions={['Végétarien', 'Vegan', 'Sans gluten', 'Halal', 'Kosher', 'Local']}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#008080',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  suggestionTag: {
    backgroundColor: '#E6F3F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    color: '#008080',
    fontSize: 12,
    fontWeight: '500',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceTag: {
    backgroundColor: '#008080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },
};

export default EditPreferencesScreen;
