import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types/post';
import { COLORS } from '../design-system';

const screenWidth = Dimensions.get('window').width;
const ITEM_MARGIN = 6;
const NUM_COLUMNS = 3;
const ITEM_SIZE = (screenWidth - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface GalleryGridProps {
  posts: Post[];
  isOwnProfile: boolean;
  onToggleVisibility?: (post: Post, newVisibility: 'public' | 'private') => void;
  onPressPost?: (post: Post) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ posts, isOwnProfile, onToggleVisibility, onPressPost }) => {
  return (
    <View style={styles.grid}>
      {posts.map((post) => {
        const isPublic = post.visibility === 'public';
        const mainImage = post.media_urls[0];
        return (
          <TouchableOpacity
            key={post.id}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => onPressPost && onPressPost(post)}
          >
            <Image
              source={{ uri: mainImage }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Ionicons
                name={isPublic ? 'eye-outline' : 'lock-closed-outline'}
                size={20}
                color={isPublic ? COLORS.primary[500] : COLORS.gray[600]}
                style={{ marginRight: 4 }}
              />
              {isOwnProfile && (
                <Switch
                  value={isPublic}
                  onValueChange={() => onToggleVisibility && onToggleVisibility(post, isPublic ? 'private' : 'public')}
                  thumbColor={isPublic ? COLORS.primary[500] : COLORS.gray[400]}
                  trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: ITEM_MARGIN,
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: ITEM_MARGIN,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[200],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});

export default GalleryGrid; 