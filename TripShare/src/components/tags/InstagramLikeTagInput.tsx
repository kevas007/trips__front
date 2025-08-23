import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
const { width } = Dimensions.get('window');

interface Tag {
  id: string;
  text: string;
  category: 'popular' | 'trending' | 'custom' | 'recent';
  usage_count?: number;
}

interface InstagramLikeTagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  showPopularTags?: boolean;
  allowCustomTags?: boolean;
}

// Tags populaires organisés par catégories comme Instagram
const POPULAR_TAGS: { [category: string]: Tag[] } = {
  voyage: [
    { id: '1', text: 'voyage', category: 'popular', usage_count: 1500000 },
    { id: '2', text: 'vacances', category: 'popular', usage_count: 800000 },
    { id: '3', text: 'aventure', category: 'popular', usage_count: 650000 },
    { id: '4', text: 'exploration', category: 'popular', usage_count: 420000 },
    { id: '5', text: 'wanderlust', category: 'popular', usage_count: 380000 },
  ],
  destinations: [
    { id: '6', text: 'paris', category: 'trending', usage_count: 2500000 },
    { id: '7', text: 'tokyo', category: 'trending', usage_count: 1800000 },
    { id: '8', text: 'newyork', category: 'trending', usage_count: 2200000 },
    { id: '9', text: 'londres', category: 'trending', usage_count: 1200000 },
    { id: '10', text: 'rome', category: 'trending', usage_count: 950000 },
  ],
  activites: [
    { id: '11', text: 'photographie', category: 'popular', usage_count: 750000 },
    { id: '12', text: 'randonnee', category: 'popular', usage_count: 600000 },
    { id: '13', text: 'plongee', category: 'popular', usage_count: 300000 },
    { id: '14', text: 'culture', category: 'popular', usage_count: 520000 },
    { id: '15', text: 'gastronomie', category: 'popular', usage_count: 480000 },
  ],
  emotions: [
    { id: '16', text: 'amazing', category: 'trending', usage_count: 890000 },
    { id: '17', text: 'incredible', category: 'trending', usage_count: 650000 },
    { id: '18', text: 'blessed', category: 'trending', usage_count: 720000 },
    { id: '19', text: 'grateful', category: 'trending', usage_count: 580000 },
    { id: '20', text: 'memories', category: 'trending', usage_count: 910000 },
  ],
};

const InstagramLikeTagInput: React.FC<InstagramLikeTagInputProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  placeholder = "Ajouter des tags...",
  showPopularTags = true,
  allowCustomTags = true,
}) => {
  const { theme } = useAppTheme();
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('voyage');
  const inputRef = useRef<TextInput>(null);
  const suggestionAnimation = useRef(new Animated.Value(0)).current;

  // Animation pour les suggestions
  useEffect(() => {
    Animated.timing(suggestionAnimation, {
      toValue: showSuggestions ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showSuggestions]);

  // Filtrer les tags en fonction de l'input
  useEffect(() => {
    if (inputText.length > 0) {
      const allTags = Object.values(POPULAR_TAGS).flat();
      const filtered = allTags.filter(tag =>
        tag.text.toLowerCase().includes(inputText.toLowerCase()) &&
        !selectedTags.includes(tag.text)
      );
      setFilteredTags(filtered.slice(0, 20)); // Limiter à 20 suggestions
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [inputText, selectedTags]);

  const handleAddTag = (tagText: string) => {
    if (selectedTags.length >= maxTags) {
      return;
    }

    const cleanTag = tagText.toLowerCase().trim().replace(/[^a-zA-Z0-9àâäéèêëïîôöùûüÿç]/g, '');
    
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      onTagsChange([...selectedTags, cleanTag]);
      setInputText('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputSubmit = () => {
    if (inputText.trim() && allowCustomTags) {
      handleAddTag(inputText);
    }
  };

  const formatTagCount = (count?: number): string => {
    if (!count) return '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {Object.keys(POPULAR_TAGS).map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryTab,
            {
              backgroundColor: activeCategory === category 
                ? theme.colors.primary[0] 
                : theme.colors.background.card,
              borderColor: theme.colors.border.primary,
            }
          ]}
          onPress={() => setActiveCategory(category)}
        >
          <Text style={[
            styles.categoryTabText,
            {
              color: activeCategory === category 
                ? 'white' 
                : theme.colors.text.primary,
            }
          ]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSelectedTags = () => (
    <View style={styles.selectedTagsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.selectedTagsScroll}
      >
        {selectedTags.map((tag, index) => (
          <Animated.View
            key={tag}
            style={[
              styles.selectedTag,
              { backgroundColor: theme.colors.primary[0] }
            ]}
          >
            <Text style={styles.selectedTagText}>#{tag}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveTag(tag)}
              style={styles.removeTagButton}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
      
      <Text style={[
        styles.tagCounter,
        { 
          color: selectedTags.length >= maxTags 
            ? '#FF6B6B' 
            : theme.colors.text.secondary 
        }
      ]}>
        {selectedTags.length}/{maxTags}
      </Text>
    </View>
  );

  const renderSuggestions = () => (
    <Animated.View
      style={[
        styles.suggestionsContainer,
        {
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.primary,
          maxHeight: suggestionAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 250],
          }),
          opacity: suggestionAnimation,
        }
      ]}
    >
      <View style={styles.suggestionsList}>
        {filteredTags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.suggestionItem,
              { borderBottomColor: theme.colors.border.primary }
            ]}
            onPress={() => handleAddTag(tag.text)}
          >
            <View style={styles.suggestionContent}>
              <View style={styles.suggestionLeft}>
                <Text style={[styles.hashtagSymbol, { color: theme.colors.text.secondary }]}>
                  #
                </Text>
                <Text style={[styles.suggestionText, { color: theme.colors.text.primary }]}>
                  {tag.text}
                </Text>
              </View>
              
              <View style={styles.suggestionRight}>
                {tag.category === 'trending' && (
                  <Ionicons name="trending-up" size={14} color="#FF6B6B" />
                )}
                <Text style={[styles.tagCount, { color: theme.colors.text.secondary }]}>
                  {formatTagCount(tag.usage_count)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {allowCustomTags && inputText.trim() && (
          <TouchableOpacity
            style={[
              styles.suggestionItem,
              styles.createCustomTag,
              { borderBottomColor: theme.colors.border.primary }
            ]}
            onPress={() => handleAddTag(inputText)}
          >
            <View style={styles.suggestionContent}>
              <View style={styles.suggestionLeft}>
                <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary[0]} />
                <Text style={[styles.suggestionText, { color: theme.colors.primary[0] }]}>
                  Créer "#{inputText.toLowerCase()}"
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderPopularTags = () => {
    if (!showPopularTags || showSuggestions) return null;

    return (
      <View style={styles.popularTagsContainer}>
        {renderCategoryTabs()}
        
        <View style={styles.popularTagsGrid}>
          {POPULAR_TAGS[activeCategory]?.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.popularTag,
                {
                  backgroundColor: selectedTags.includes(tag.text)
                    ? theme.colors.primary[0]
                    : theme.colors.background.card,
                  borderColor: theme.colors.border.primary,
                  opacity: selectedTags.length >= maxTags && !selectedTags.includes(tag.text) ? 0.5 : 1,
                }
              ]}
              onPress={() => handleAddTag(tag.text)}
              disabled={selectedTags.length >= maxTags && !selectedTags.includes(tag.text)}
            >
              <View style={styles.popularTagContent}>
                <Text style={[
                  styles.popularTagText,
                  {
                    color: selectedTags.includes(tag.text)
                      ? 'white'
                      : theme.colors.text.primary,
                  }
                ]}>
                  #{tag.text}
                </Text>
                
                <View style={styles.popularTagMeta}>
                  {tag.category === 'trending' && (
                    <Ionicons 
                      name="trending-up" 
                      size={12} 
                      color={selectedTags.includes(tag.text) ? 'white' : '#FF6B6B'} 
                    />
                  )}
                  <Text style={[
                    styles.popularTagCount,
                    {
                      color: selectedTags.includes(tag.text)
                        ? 'rgba(255,255,255,0.7)'
                        : theme.colors.text.secondary,
                    }
                  ]}>
                    {formatTagCount(tag.usage_count)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && renderSelectedTags()}

      {/* Champ de saisie */}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.colors.background.card,
          borderColor: showSuggestions ? theme.colors.primary[0] : theme.colors.border.primary,
        }
      ]}>
        <Ionicons 
          name="pricetag-outline" 
          size={20} 
          color={theme.colors.text.secondary} 
          style={styles.inputIcon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.text.primary }]}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleInputSubmit}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          maxLength={30}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          editable={selectedTags.length < maxTags}
        />
        
        {inputText.length > 0 && (
          <TouchableOpacity
            onPress={() => setInputText('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions dynamiques */}
      {showSuggestions && renderSuggestions()}

      {/* Tags populaires */}
      {renderPopularTags()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectedTagsContainer: {
    marginBottom: 16,
  },
  selectedTagsScroll: {
    marginBottom: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  removeTagButton: {
    marginLeft: 4,
  },
  tagCounter: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  createCustomTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hashtagSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  suggestionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  popularTagsContainer: {
    marginTop: 8,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTabsContent: {
    paddingHorizontal: 4,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  popularTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularTag: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  popularTagContent: {
    alignItems: 'center',
  },
  popularTagText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  popularTagMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  popularTagCount: {
    fontSize: 10,
    fontWeight: '400',
  },
});

export default InstagramLikeTagInput;
