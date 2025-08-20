import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: () => void;
  onSave: (postId: string) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  postId,
  likes,
  comments,
  shares,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
}) => {
  const { theme } = useAppTheme();
  const [likeAnimation] = useState(new Animated.Value(1));
  const [saveAnimation] = useState(new Animated.Value(1));
  
  const animateAction = (animationValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = () => {
    animateAction(likeAnimation);
    onLike(postId);
    
    // Feedback haptique léger
    if (Platform.OS === 'ios') {
      // Impact feedback sur iOS
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    animateAction(saveAnimation);
    onSave(postId);
    
    const message = isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris';
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const handleShare = () => {
    onShare();
  };

  const handleComment = () => {
    onComment(postId);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Actions principales */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          {/* Bouton Like avec animation */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? '#ff4757' : theme.colors.text.secondary}
              />
            </Animated.View>
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {formatNumber(likes)}
            </Text>
          </TouchableOpacity>

          {/* Bouton Commentaire */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleComment}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="chatbubble-outline" 
              size={24} 
              color={theme.colors.text.secondary} 
            />
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {formatNumber(comments)}
            </Text>
          </TouchableOpacity>

          {/* Bouton Partage */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="share-outline" 
              size={24} 
              color={theme.colors.text.secondary} 
            />
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {formatNumber(shares)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bouton Sauvegarder */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: saveAnimation }] }}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isSaved ? '#0097e6' : theme.colors.text.secondary}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Stats détaillées */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Text style={[styles.mainStat, { color: theme.colors.text.primary }]}>
            {formatNumber(likes)} j'aime
          </Text>
          <View style={styles.statsRight}>
            <Text style={[styles.secondaryStat, { color: theme.colors.text.secondary }]}>
              {formatNumber(comments)} commentaires
            </Text>
            <Text style={[styles.secondaryStat, { color: theme.colors.text.secondary }]}>
              {formatNumber(shares)} partages
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    paddingTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainStat: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsRight: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryStat: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PostActions; 