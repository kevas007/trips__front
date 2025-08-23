import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import InstagramLikeTagInput from './InstagramLikeTagInput';

/**
 * Composant de démonstration pour InstagramLikeTagInput
 * Montre les différentes configurations et utilisations possibles
 */
const TagInputDemo: React.FC = () => {
  const { theme } = useAppTheme();
  const [basicTags, setBasicTags] = useState<string[]>(['voyage', 'paris']);
  const [limitedTags, setLimitedTags] = useState<string[]>([]);
  const [customOnlyTags, setCustomOnlyTags] = useState<string[]>([]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        🏷️ Instagram-like Tags Demo
      </Text>

      {/* Configuration basique */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Configuration Standard
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          Interface complète avec suggestions populaires et création personnalisée
        </Text>
        
        <InstagramLikeTagInput
          selectedTags={basicTags}
          onTagsChange={setBasicTags}
          maxTags={8}
          placeholder="Rechercher des tags de voyage..."
          showPopularTags={true}
          allowCustomTags={true}
        />
        
        <Text style={[styles.result, { color: theme.colors.text.secondary }]}>
          Tags sélectionnés: {basicTags.join(', ') || 'Aucun'}
        </Text>
      </View>

      {/* Configuration avec limite stricte */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Limite Stricte (3 tags max)
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          Idéal pour des contextes où peu de tags sont nécessaires
        </Text>
        
        <InstagramLikeTagInput
          selectedTags={limitedTags}
          onTagsChange={setLimitedTags}
          maxTags={3}
          placeholder="Maximum 3 tags..."
          showPopularTags={true}
          allowCustomTags={true}
        />
        
        <Text style={[styles.result, { color: theme.colors.text.secondary }]}>
          Tags sélectionnés: {limitedTags.join(', ') || 'Aucun'}
        </Text>
      </View>

      {/* Configuration tags personnalisés uniquement */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Tags Personnalisés Uniquement
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          Pas de suggestions populaires, création libre uniquement
        </Text>
        
        <InstagramLikeTagInput
          selectedTags={customOnlyTags}
          onTagsChange={setCustomOnlyTags}
          maxTags={5}
          placeholder="Créez vos propres tags..."
          showPopularTags={false}
          allowCustomTags={true}
        />
        
        <Text style={[styles.result, { color: theme.colors.text.secondary }]}>
          Tags sélectionnés: {customOnlyTags.join(', ') || 'Aucun'}
        </Text>
      </View>

      {/* Guide d'utilisation */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          💡 Guide d'Utilisation
        </Text>
        
        <View style={styles.guideItem}>
          <Text style={[styles.guideTitle, { color: theme.colors.primary[0] }]}>
            🔍 Recherche Intelligente
          </Text>
          <Text style={[styles.guideText, { color: theme.colors.text.secondary }]}>
            Tapez dans le champ pour voir les suggestions filtrées en temps réel
          </Text>
        </View>

        <View style={styles.guideItem}>
          <Text style={[styles.guideTitle, { color: theme.colors.primary[0] }]}>
            📊 Tags Populaires
          </Text>
          <Text style={[styles.guideText, { color: theme.colors.text.secondary }]}>
            Explorez les catégories : Voyage, Destinations, Activités, Émotions
          </Text>
        </View>

        <View style={styles.guideItem}>
          <Text style={[styles.guideTitle, { color: theme.colors.primary[0] }]}>
            ➕ Création Personnalisée
          </Text>
          <Text style={[styles.guideText, { color: theme.colors.text.secondary }]}>
            Créez vos propres tags en tapant puis en appuyant sur "Créer"
          </Text>
        </View>

        <View style={styles.guideItem}>
          <Text style={[styles.guideTitle, { color: theme.colors.primary[0] }]}>
            📈 Indicateurs de Tendance
          </Text>
          <Text style={[styles.guideText, { color: theme.colors.text.secondary }]}>
            Les tags avec 📈 sont en tendance, les chiffres montrent la popularité
          </Text>
        </View>

        <View style={styles.guideItem}>
          <Text style={[styles.guideTitle, { color: theme.colors.primary[0] }]}>
            ❌ Gestion Facile
          </Text>
          <Text style={[styles.guideText, { color: theme.colors.text.secondary }]}>
            Supprimez un tag en cliquant sur le ❌ à côté
          </Text>
        </View>
      </View>

      {/* Statistiques de démonstration */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          📊 Statistiques Demo
        </Text>
        
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary[0] }]}>
              {(basicTags.length + limitedTags.length + customOnlyTags.length)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Tags Total
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
              {customOnlyTags.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Personnalisés
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
              {(basicTags.length + limitedTags.length)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Populaires
            </Text>
          </View>
        </View>
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
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  result: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  guideItem: {
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TagInputDemo;
