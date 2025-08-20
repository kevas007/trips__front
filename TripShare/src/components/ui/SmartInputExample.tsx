// ========== EXEMPLE D'UTILISATION DU CLAVIER INTELLIGENT ==========
// Ce composant montre comment utiliser l'Input avec détection automatique du clavier

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Input } from './Input';
import { useAppTheme } from '../../hooks/useAppTheme';

export const SmartInputExample: React.FC = () => {
  const { theme } = useAppTheme();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    amount: '',
    search: '',
    url: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        🎹 Clavier Intelligent - Exemples
      </Text>
      
      <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
        Le clavier s'adapte automatiquement selon le type de contenu saisi
      </Text>

      {/* Email - Clavier email automatique */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📧 Email (Clavier email automatique)
        </Text>
        <Input
          label="Adresse email"
          placeholder="Entrez votre email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          smartKeyboard={true}
          leftIcon="mail-outline"
          variant="outlined"
          helperText="Le clavier s'adapte automatiquement pour les emails"
        />
      </View>

      {/* Téléphone - Clavier numérique automatique */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📱 Téléphone (Clavier numérique automatique)
        </Text>
        <Input
          label="Numéro de téléphone"
          placeholder="Entrez votre numéro"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          smartKeyboard={true}
          leftIcon="call-outline"
          variant="outlined"
          helperText="Le clavier s'adapte automatiquement pour les numéros"
        />
      </View>

      {/* Montant - Clavier décimal automatique */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          💰 Montant (Clavier décimal automatique)
        </Text>
        <Input
          label="Montant"
          placeholder="Entrez le prix"
          value={formData.amount}
          onChangeText={(value) => handleChange('amount', value)}
          smartKeyboard={true}
          leftIcon="card-outline"
          variant="outlined"
          helperText="Le clavier s'adapte automatiquement pour les montants"
        />
      </View>

      {/* Recherche - Clavier web automatique */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          🔍 Recherche (Clavier web automatique)
        </Text>
        <Input
          label="Recherche"
          placeholder="Rechercher..."
          value={formData.search}
          onChangeText={(value) => handleChange('search', value)}
          smartKeyboard={true}
          leftIcon="search-outline"
          variant="search"
          helperText="Le clavier s'adapte automatiquement pour la recherche"
        />
      </View>

      {/* URL - Clavier URL automatique */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          🌐 URL (Clavier URL automatique)
        </Text>
        <Input
          label="Site web"
          placeholder="Entrez l'URL du site"
          value={formData.url}
          onChangeText={(value) => handleChange('url', value)}
          smartKeyboard={true}
          leftIcon="globe-outline"
          variant="outlined"
          helperText="Le clavier s'adapte automatiquement pour les URLs"
        />
      </View>

      {/* Exemple avec auto-focus */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          🎯 Auto-focus
        </Text>
        <Input
          label="Champ avec auto-focus"
          placeholder="Ce champ se focus automatiquement"
          autoFocus={true}
          leftIcon="star-outline"
          variant="filled"
          helperText="Ce champ se focus automatiquement au chargement"
        />
      </View>

      {/* Exemple avec validation */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          ✅ Validation en temps réel
        </Text>
        <Input
          label="Mot de passe"
          placeholder="Entrez votre mot de passe"
          secureTextEntry={true}
          showPasswordToggle={true}
          leftIcon="lock-closed-outline"
          variant="auth"
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
          helperText="Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
        />
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
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
}); 