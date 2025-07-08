import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  text: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  replies?: Comment[];
}

interface CommentsScreenProps {
  navigation: any;
  route: {
    params: {
      postId: string;
    };
  };
}

const CommentsScreen: React.FC<CommentsScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useSimpleAuth();
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        id: '1',
        name: 'Marie Voyage',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        verified: true,
      },
      text: 'Magnifique photo ! Bali est vraiment un paradis terrestre 🌴',
      likes: 12,
      isLiked: false,
      timestamp: '2h',
      replies: [
        {
          id: '1-1',
          user: {
            id: '2',
            name: 'Sarah Voyage',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
            verified: true,
          },
          text: 'Merci ! C\'est encore plus beau en vrai 😍',
          likes: 5,
          isLiked: true,
          timestamp: '1h',
        },
      ],
    },
    {
      id: '2',
      user: {
        id: '3',
        name: 'Thomas Explorer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        verified: false,
      },
      text: 'J\'y étais l\'année dernière ! Les rizières sont incroyables au coucher du soleil',
      likes: 8,
      isLiked: false,
      timestamp: '3h',
    },
    {
      id: '3',
      user: {
        id: '4',
        name: 'Alex Nomade',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: false,
      },
      text: 'Quel itinéraire recommandes-tu pour Bali ? Je prévois d\'y aller bientôt !',
      likes: 15,
      isLiked: false,
      timestamp: '4h',
    },
    {
      id: '4',
      user: {
        id: '5',
        name: 'Emma Aventurière',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        verified: true,
      },
      text: 'Les temples sont aussi magnifiques ! N\'oublie pas Ubud 😊',
      likes: 6,
      isLiked: false,
      timestamp: '5h',
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleLikeComment = (commentId: string) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    inputRef.current?.focus();
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'current-user',
        name: user?.firstName || 'Vous',
        avatar: user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        verified: false,
      },
      text: newComment,
      likes: 0,
      isLiked: false,
      timestamp: 'Maintenant',
    };

    if (replyingTo) {
      // Ajouter une réponse
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === replyingTo
            ? {
                ...comment,
                replies: [...(comment.replies || []), comment],
              }
            : comment
        )
      );
      setReplyingTo(null);
    } else {
      // Ajouter un nouveau commentaire
      setComments(prevComments => [comment, ...prevComments]);
    }

    setNewComment('');
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {item.user.name}
            </Text>
            {item.user.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0097e6" />
            )}
          </View>
          <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>
            {item.timestamp}
          </Text>
        </View>
        
        <Text style={[styles.commentText, { color: theme.colors.text.primary }]}>
          {item.text}
        </Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikeComment(item.id)}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={item.isLiked ? '#ff4757' : theme.colors.text.secondary}
            />
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              {item.likes > 0 ? item.likes : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReply(item.id, item.user.name)}
          >
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              Répondre
            </Text>
          </TouchableOpacity>
        </View>

        {/* Réponses */}
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {item.replies.map(reply => (
              <View key={reply.id} style={styles.replyContainer}>
                <Image source={{ uri: reply.user.avatar }} style={styles.replyAvatar} />
                <View style={styles.replyContent}>
                  <View style={styles.replyHeader}>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                        {reply.user.name}
                      </Text>
                      {reply.user.verified && (
                        <Ionicons name="checkmark-circle" size={12} color="#0097e6" />
                      )}
                    </View>
                    <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>
                      {reply.timestamp}
                    </Text>
                  </View>
                  
                  <Text style={[styles.commentText, { color: theme.colors.text.primary }]}>
                    {reply.text}
                  </Text>
                  
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLikeComment(reply.id)}
                    >
                      <Ionicons
                        name={reply.isLiked ? 'heart' : 'heart-outline'}
                        size={14}
                        color={reply.isLiked ? '#ff4757' : theme.colors.text.secondary}
                      />
                      <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
                        {reply.likes > 0 ? reply.likes : ''}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleReply(item.id, reply.user.name)}
                    >
                      <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
                        Répondre
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Commentaires
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}>
        {replyingTo && (
          <View style={styles.replyingTo}>
            <Text style={[styles.replyingToText, { color: theme.colors.text.secondary }]}>
              Répondre à un commentaire
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <Image
            source={{ uri: user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
            style={styles.inputAvatar}
          />
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text.primary,
              borderColor: theme.colors.border,
            }]}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={theme.colors.text.secondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newComment.trim() ? theme.colors.primary[0] : theme.colors.surface }
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={newComment.trim() ? 'white' : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 20,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentsScreen; 