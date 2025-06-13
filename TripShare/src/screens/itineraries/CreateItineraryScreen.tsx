import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

interface Step {
  city: string;
  date: string;
}

interface CreateItineraryScreenProps {
  navigation: any;
}

const CreateItineraryScreen: React.FC<CreateItineraryScreenProps> = ({ navigation }) => {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un itinéraire</Text>
      <TextInput
        style={styles.input}
        placeholder="Titre de l'itinéraire"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.subtitle}>Étapes</Text>
      {steps.map((step, idx) => (
        <View key={idx} style={styles.stepRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Ville"
            value={step.city}
            onChangeText={text => handleStepChange(idx, 'city', text)}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            placeholder="Date"
            value={step.date}
            onChangeText={text => handleStepChange(idx, 'date', text)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.addStepBtn} onPress={handleAddStep}>
        <Text style={styles.addStepText}>+ Ajouter une étape</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>Partager l'itinéraire</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addStepBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addStepText: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareBtn: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default CreateItineraryScreen; 