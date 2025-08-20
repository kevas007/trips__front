import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  category: string;
  use_count: number;
}

interface PopularTagsProps {
  onTagPress: (tag: Tag) => void;
  selectedTagIds?: string[];
  category?: string;
  limit?: number;
}

const PopularTags: React.FC<PopularTagsProps> = ({
  onTagPress,
  selectedTagIds = [],
  category,
  limit = 20,
}) => {
  const { theme, isDark } = useAppTheme();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les tags populaires
  const loadPopularTags = async () => {
    setIsLoading(true);
    try {
      let url = `http://localhost:8085/api/v1/tags/popular?limit=${limit}`;
      if (category) {
        url = `http://localhost:8085/api/v1/tags/category/${category}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        if (category) {
          setTags(data.data.tags || []);
        } else {
          setTags(data.data || []);
        }
      }
    } catch (error) {
      console.error('Erreur chargement tags populaires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPopularTags();
  }, [category, limit]);

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

  const renderTag = ({ item }: { item: Tag }) => {
    const isSelected = selectedTagIds.includes(item.id);
    const tagColor = item.color || getTagColor(item.category);

    return (
      <TouchableOpacity
        style={[
          styles.tag,
          {
            backgroundColor: isSelected ? tagColor : 'transparent',
            borderColor: tagColor,
            borderWidth: 1,
          }
        ]}
        onPress={() => onTagPress(item)}
      >
        <Text style={[
          styles.tagText,
          { 
            color: isSelected ? 'white' : tagColor 
          }
        ]}>
          {item.name}
        </Text>
        {item.use_count > 0 && (
          <Text style={[
            styles.tagCount,
            { 
              color: isSelected ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant 
            }
          ]}>
            {item.use_count}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Chargement des tags...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {category ? `Tags ${category}` : 'Tags populaires'}
      </Text>
      <FlatList
        data={tags}
        renderItem={renderTag}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tagsGrid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  tagsGrid: {
    paddingBottom: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  tag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    minHeight: 36,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  tagCount: {
    fontSize: 12,
    marginLeft: 8,
    minWidth: 20,
    textAlign: 'right',
  },
});

export default PopularTags;
