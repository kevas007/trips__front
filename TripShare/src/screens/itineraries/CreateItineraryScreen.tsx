import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Step {
  city: string;
  date: string;
}

interface CreateItineraryScreenProps {
  navigation: any;
}

const CreateItineraryScreen: React.FC<CreateItineraryScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Step[]>([{ city: '', date: '' }]);

  const handleAddStep = () => {
    setSteps([...steps, { city: '', date: '' }]);
  };

  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleShare = () => {
    if (!title || !description || steps.some(s => !s.city || !s.date)) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs.');
      return;
    }
    // Ici, on enverra l'itinéraire au backend ou au store
    Alert.alert('Succès', 'Itinéraire partagé !');
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Créer un nouvel itinéraire</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Titre</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
              borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
              color: theme.colors.text.primary,
            }]}
            placeholder="Titre de votre itinéraire"
            placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
              borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
              color: theme.colors.text.primary,
            }]}
            placeholder="Décrivez votre itinéraire"
            placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Destination</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
              borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
              color: theme.colors.text.primary,
            }]}
            placeholder="Où allez-vous ?"
            placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Durée (jours)</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
              borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
              color: theme.colors.text.primary,
            }]}
            placeholder="Nombre de jours"
            placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={() => {
            Alert.alert('Succès', 'Itinéraire créé avec succès !');
            navigation.goBack();
          }}
        >
          <Text style={styles.createButtonText}>Créer l'itinéraire</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateItineraryScreen; 