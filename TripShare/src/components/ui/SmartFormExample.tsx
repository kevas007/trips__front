// ========== EXEMPLE DE FORMULAIRE AVEC NAVIGATION INTELLIGENTE ==========
// Ce composant montre comment utiliser l'Input avec navigation automatique entre champs

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Input, InputRef } from './Input';
export const SmartFormExample: React.FC = () => {
  const { theme } = useAppTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Refs pour la navigation entre champs
  const firstNameRef = useRef<InputRef>(null);
  const lastNameRef = useRef<InputRef>(null);
  const emailRef = useRef<InputRef>(null);
  const phoneRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const confirmPasswordRef = useRef<InputRef>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validation simple
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    Alert.alert('Succès', 'Formulaire soumis avec succès !');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        🎯 Formulaire avec Navigation Intelligente
      </Text>
      
      <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
        Appuyez sur "Suivant" pour naviguer automatiquement entre les champs
      </Text>

      {/* Prénom */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          👤 Informations Personnelles
        </Text>
        <Input
          ref={firstNameRef}
          label="Prénom *"
          placeholder="Entrez votre prénom"
          value={formData.firstName}
          onChangeText={(value) => handleChange('firstName', value)}
          smartKeyboard={true}
          leftIcon="person-outline"
          variant="outlined"
          required={true}
          nextInputRef={lastNameRef}
          helperText="Appuyez sur 'Suivant' pour passer au nom"
        />
      </View>

      {/* Nom */}
      <View style={styles.section}>
        <Input
          ref={lastNameRef}
          label="Nom *"
          placeholder="Entrez votre nom"
          value={formData.lastName}
          onChangeText={(value) => handleChange('lastName', value)}
          smartKeyboard={true}
          leftIcon="person-outline"
          variant="outlined"
          required={true}
          nextInputRef={emailRef}
          helperText="Appuyez sur 'Suivant' pour passer à l'email"
        />
      </View>

      {/* Email */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📧 Contact
        </Text>
        <Input
          ref={emailRef}
          label="Email *"
          placeholder="Entrez votre email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          smartKeyboard={true}
          leftIcon="mail-outline"
          variant="outlined"
          required={true}
          nextInputRef={phoneRef}
          helperText="Le clavier s'adapte automatiquement pour les emails"
        />
      </View>

      {/* Téléphone */}
      <View style={styles.section}>
        <Input
          ref={phoneRef}
          label="Téléphone"
          placeholder="Entrez votre numéro"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          smartKeyboard={true}
          leftIcon="call-outline"
          variant="outlined"
          nextInputRef={passwordRef}
          helperText="Le clavier s'adapte automatiquement pour les numéros"
        />
      </View>

      {/* Mot de passe */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          🔒 Sécurité
        </Text>
        <Input
          ref={passwordRef}
          label="Mot de passe *"
          placeholder="Entrez votre mot de passe"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry={true}
          showPasswordToggle={true}
          leftIcon="lock-closed-outline"
          variant="auth"
          required={true}
          validationRules={{
            minLength: 8,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            custom: (value) => {
              if (value.length < 8) return 'Minimum 8 caractères';
              if (!/(?=.*[a-z])/.test(value)) return 'Au moins une minuscule';
              if (!/(?=.*[A-Z])/.test(value)) return 'Au moins une majuscule';
              if (!/(?=.*\d)/.test(value)) return 'Au moins un chiffre';
              return true;
            }
          }}
          nextInputRef={confirmPasswordRef}
          helperText="Le mot de passe doit contenir au moins 8 caractères"
        />
      </View>

      {/* Confirmation mot de passe */}
      <View style={styles.section}>
        <Input
          ref={confirmPasswordRef}
          label="Confirmer le mot de passe *"
          placeholder="Confirmez votre mot de passe"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry={true}
          showPasswordToggle={true}
          leftIcon="lock-closed-outline"
          variant="auth"
          required={true}
          validationRules={{
            custom: (value) => {
              if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
              return true;
            }
          }}
          onSubmitEditing={handleSubmit}
          helperText="Appuyez sur 'Terminé' pour soumettre le formulaire"
        />
      </View>

      {/* Bouton de soumission */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>✅ Soumettre le Formulaire</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={[styles.instructionsTitle, { color: theme.colors.text.primary }]}>
          🎯 Comment ça marche ?
        </Text>
        <Text style={[styles.instructionsText, { color: theme.colors.text.secondary }]}>
          • Appuyez sur "Suivant" sur le clavier pour passer au champ suivant{'\n'}
          • Le clavier s'adapte automatiquement selon le type de contenu{'\n'}
          • Le dernier champ utilise "Terminé" pour soumettre{'\n'}
          • La validation se fait en temps réel{'\n'}
          • Les mots de passe peuvent être masqués/affichés
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 