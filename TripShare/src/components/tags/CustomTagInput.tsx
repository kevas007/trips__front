import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTags } from '../../store';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  category: string;
  use_count: number;
}

interface CustomTagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowCustomTags?: boolean;
  suggestedCategories?: string[];
}

const CustomTagInput: React.FC<CustomTagInputProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Ajouter des tags...",
  maxTags = 10,
  allowCustomTags = true,
  suggestedCategories = ['general', 'location', 'activity', 'food', 'mood'],
}) => {
  const { theme, isDark } = useAppTheme();
  const { searchTags: searchTagsStore, createTag, loading } = useTags();
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Rechercher des tags suggestions
  const searchTags = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const tags = await searchTagsStore(query, 10);
      // Filtrer les tags déjà sélectionnés
      const filteredTags = tags.filter((tag: Tag) => 
        !selectedTags.some(selected => selected.id === tag.id)
      );
      setSuggestions(filteredTags);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur recherche tags:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Créer un nouveau tag personnalisé
  const createCustomTag = async (name: string, category: string = 'general') => {
    if (!allowCustomTags) return null;

    try {
      const newTag = await createTag(name.trim(), category);
      return newTag;
    } catch (error) {
      console.error('Erreur création tag:', error);
      Alert.alert('Erreur', 'Impossible de créer le tag personnalisé');
      return null;
    }
  };

  // Ajouter un tag (existant ou nouveau)
  const addTag = async (tag?: Tag) => {
    if (selectedTags.length >= maxTags) {
      Alert.alert('Limite atteinte', `Vous ne pouvez ajouter que ${maxTags} tags maximum.`);
      return;
    }

    let tagToAdd = tag;

    // Si pas de tag fourni, créer un nouveau tag avec le texte saisi
    if (!tagToAdd && inputText.trim()) {
      if (!allowCustomTags) {
        Alert.alert('Non autorisé', 'Vous ne pouvez pas créer de tags personnalisés.');
        return;
      }

      // Demander la catégorie pour le nouveau tag
      Alert.alert(
        'Nouveau tag',
        `Créer le tag "${inputText.trim()}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Créer', 
            onPress: async () => {
              const newTag = await createCustomTag(inputText.trim());
              if (newTag) {
                const updatedTags = [...selectedTags, newTag];
                onTagsChange(updatedTags);
                setInputText('');
                setShowSuggestions(false);
              }
            }
          },
        ]
      );
      return;
    }

    if (tagToAdd) {
      // Vérifier si le tag n'est pas déjà sélectionné
      if (selectedTags.some(selected => selected.id === tagToAdd!.id)) {
        return;
      }

      const updatedTags = [...selectedTags, tagToAdd];
      onTagsChange(updatedTags);
      setInputText('');
      setShowSuggestions(false);
    }
  };

  // Supprimer un tag
  const removeTag = (tagId: string) => {
    const updatedTags = selectedTags.filter(tag => tag.id !== tagId);
    onTagsChange(updatedTags);
  };

  // Gérer la recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText) {
        searchTags(inputText);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputText]);

  // Couleur du tag selon la catégorie
  const getTagColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      location: '#EF4444',
      activity: '#F59E0B', 
      food: '#10B981',
      accommodation: '#8B5CF6',
      transport: '#06B6D4',
      weather: '#84CC16',
      mood: '#EC4899',
      budget: '#F59E0B',
      difficulty: '#6B7280',
      general: '#3B82F6',
    };
    return colors[category] || '#3B82F6';
  };

  const renderTag = ({ item }: { item: Tag }) => (
    <View style={[styles.tag, { backgroundColor: item.color || getTagColor(item.category) }]}>
      <Text style={styles.tagText}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => removeTag(item.id)}
        style={styles.removeButton}
      >
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderSuggestion = ({ item }: { item: Tag }) => (
    <TouchableOpacity
      style={[
        styles.suggestion,
        { 
          backgroundColor: isDark ? theme.colors.surfaceVariant : '#FFFFFF',
          borderColor: theme.colors.outline,
        }
      ]}
      onPress={() => addTag(item)}
    >
      <View style={[
        styles.suggestionColorBar, 
        { backgroundColor: item.color || getTagColor(item.category) }
      ]} />
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionName, { color: theme.colors.onSurface }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={[styles.suggestionDescription, { color: theme.colors.onSurfaceVariant }]}>
            {item.description}
          </Text>
        )}
        <View style={styles.suggestionMeta}>
          <Text style={[styles.suggestionCategory, { color: theme.colors.onSurfaceVariant }]}>
            {item.category}
          </Text>
          <Text style={[styles.suggestionCount, { color: theme.colors.onSurfaceVariant }]}>
            {item.use_count} utilisations
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <FlatList
          data={selectedTags}
          renderItem={renderTag}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedTags}
          contentContainerStyle={styles.selectedTagsContent}
        />
      )}

      {/* Champ de saisie */}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: isDark ? theme.colors.surfaceVariant : '#FFFFFF',
          borderColor: theme.colors.outline,
        }
      ]}>
        <TextInput
          style={[styles.input, { color: theme.colors.onSurface }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          onSubmitEditing={() => addTag()}
          returnKeyType="done"
        />
        {loading && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
        {inputText.length > 0 && allowCustomTags && (
          <TouchableOpacity
            onPress={() => addTag()}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[
          styles.suggestionsContainer,
          { 
            backgroundColor: isDark ? theme.colors.surface : '#FFFFFF',
            borderColor: theme.colors.outline,
          }
        ]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={item => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Compteur de tags */}
      <Text style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}>
        {selectedTags.length}/{maxTags} tags
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selectedTags: {
    marginBottom: 8,
  },
  selectedTagsContent: {
    paddingHorizontal: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  addButton: {
    marginLeft: 8,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
  },
  suggestionsList: {
    padding: 4,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  suggestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  suggestionCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  suggestionCount: {
    fontSize: 12,
  },
  counter: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomTagInput;
