import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { UserPreferences } from '../types/api';

// Options de style de voyage
const TRAVEL_STYLES = [
  { key: 'luxury', label: 'Luxe', icon: 'diamond-outline' },
  { key: 'mid-range', label: 'Confort', icon: 'bed-outline' },
  { key: 'budget', label: 'Économique', icon: 'wallet-outline' },
  { key: 'backpacker', label: 'Backpacker', icon: 'backpack-outline' },
];

// Intérêts de voyage
const INTERESTS = [
  { key: 'culture', label: 'Culture', icon: 'museum-outline' },
  { key: 'nature', label: 'Nature', icon: 'leaf-outline' },
  { key: 'adventure', label: 'Aventure', icon: 'compass-outline' },
  { key: 'food', label: 'Gastronomie', icon: 'restaurant-outline' },
  { key: 'history', label: 'Histoire', icon: 'book-outline' },
  { key: 'shopping', label: 'Shopping', icon: 'cart-outline' },
  { key: 'nightlife', label: 'Vie nocturne', icon: 'moon-outline' },
  { key: 'relaxation', label: 'Détente', icon: 'umbrella-outline' },
];

// Restrictions alimentaires
const DIETARY_RESTRICTIONS = [
  { key: 'vegetarian', label: 'Végétarien', icon: 'nutrition-outline' },
  { key: 'vegan', label: 'Végan', icon: 'leaf-outline' },
  { key: 'gluten-free', label: 'Sans gluten', icon: 'ban-outline' },
  { key: 'halal', label: 'Halal', icon: 'restaurant-outline' },
  { key: 'kosher', label: 'Casher', icon: 'restaurant-outline' },
];

// Accessibilité
const ACCESSIBILITY = [
  { key: 'wheelchair', label: 'Fauteuil roulant', icon: 'wheelchair-outline' },
  { key: 'visual', label: 'Déficience visuelle', icon: 'eye-outline' },
  { key: 'hearing', label: 'Déficience auditive', icon: 'ear-outline' },
  { key: 'mobility', label: 'Mobilité réduite', icon: 'walk-outline' },
];

const TravelPreferencesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    travelStyle: 'mid-range',
    interests: [],
    favoriteDestinations: [],
    avoidedActivities: [],
    dietaryRestrictions: [],
    accessibility: [],
  });

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiService.updatePreferences(preferences);
      
      if (response.success) {
        Alert.alert(
          'Préférences enregistrées',
          'Vos préférences de voyage ont été sauvegardées avec succès.',
          [
            {
              text: 'Continuer',
              onPress: () => navigation.navigate('Home' as never),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors de la sauvegarde des préférences'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOptionChips = (
    options: Array<{ key: string; label: string; icon: string }>,
    selectedArray: string[],
    onToggle: (key: string) => void
  ) => (
    <View style={styles.chipContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.chip,
            selectedArray.includes(option.key) && styles.chipSelected,
          ]}
          onPress={() => onToggle(option.key)}
        >
          <Ionicons
            name={option.icon as any}
            size={20}
                                color={selectedArray.includes(option.key) ? '#fff' : '#008080'}
            style={styles.chipIcon}
          />
          <Text
            style={[
              styles.chipText,
              selectedArray.includes(option.key) && styles.chipTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vos Préférences de Voyage</Text>
        <Text style={styles.subtitle}>
          Personnalisez votre expérience de voyage
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style de Voyage</Text>
        <View style={styles.chipContainer}>
          {TRAVEL_STYLES.map(style => (
            <TouchableOpacity
              key={style.key}
              style={[
                styles.chip,
                preferences.travelStyle === style.key && styles.chipSelected,
              ]}
              onPress={() =>
                setPreferences({ ...preferences, travelStyle: style.key as any })
              }
            >
              <Ionicons
                name={style.icon as any}
                size={20}
                color={
                                      preferences.travelStyle === style.key ? '#fff' : '#008080'
                }
                style={styles.chipIcon}
              />
              <Text
                style={[
                  styles.chipText,
                  preferences.travelStyle === style.key && styles.chipTextSelected,
                ]}
              >
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Centres d'Intérêt</Text>
        {renderOptionChips(
          INTERESTS,
          preferences.interests || [],
          (key) =>
            setPreferences({
              ...preferences,
              interests: toggleArrayItem(preferences.interests || [], key),
            })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restrictions Alimentaires</Text>
        {renderOptionChips(
          DIETARY_RESTRICTIONS,
          preferences.dietaryRestrictions || [],
          (key) =>
            setPreferences({
              ...preferences,
              dietaryRestrictions: toggleArrayItem(
                preferences.dietaryRestrictions || [],
                key
              ),
            })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibilité</Text>
        {renderOptionChips(
          ACCESSIBILITY,
          preferences.accessibility || [],
          (key) =>
            setPreferences({
              ...preferences,
              accessibility: toggleArrayItem(preferences.accessibility || [], key),
            })
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          {
            backgroundColor: '#008080', // Material Design 3 Teal
          },
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Enregistrer les Préférences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 8,
    color: '#4a5568',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#edf2f7',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#008080', // Material Design 3 Teal
    borderColor: '#5a67d8',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 6,
    color: '#4a5568',
  },
  chipTextSelected: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#008080', // Material Design 3 Teal
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
});

export default TravelPreferencesScreen; 