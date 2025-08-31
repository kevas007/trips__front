import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Comment } from '../../services/commentService';
import { commentService } from '../../services/commentService';
import { useAuthStore } from '../../store';
import OptimizedImage from './OptimizedImage';
import { imageService } from '../../services/imageService';

interface CommentItemProps {
  comment: Comment;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
  onReply: (commentId: string, username: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentUpdated,
  onCommentDeleted,
  onReply,
}) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiking, setIsLiking] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      setIsLiking(true);
      if (comment.is_liked) {
        await commentService.unlikeComment(comment.id);
      } else {
        await commentService.likeComment(comment.id);
      }
      onCommentUpdated();
    } catch (error) {
      console.error('Erreur lors du like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = async () => {
    if (editContent.trim() === '') return;
    
    try {
      await commentService.updateComment(comment.id, editContent.trim());
      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le commentaire');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le commentaire',
      'Êtes-vous sûr de vouloir supprimer ce commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentService.deleteComment(comment.id);
              onCommentDeleted();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le commentaire');
            }
          },
        },
      ]
    );
  };

  const canEdit = user && user.id === comment.user_id;
  const canDelete = user && user.id === comment.user_id;

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <OptimizedImage
          source={comment.user?.avatar_url || imageService.getDefaultImageURL('avatar')}
          style={styles.avatar}
          thumbnail
          thumbnailSize={32}
          errorPlaceholder={
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary[0] }]}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          }
        />
      </View>

      {/* Contenu du commentaire */}
      <View style={styles.contentContainer}>
        {/* En-tête avec nom et date */}
        <View style={styles.header}>
          <Text style={[styles.username, { color: theme.colors.text.primary }]}>
            {comment.user?.username || 'Utilisateur'}
          </Text>
          <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
            {formatDate(comment.created_at)}
          </Text>
        </View>

        {/* Contenu du commentaire */}
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              style={[styles.editInput, { 
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.secondary 
              }]}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Text style={[styles.editButton, { color: theme.colors.text.secondary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit}>
                <Text style={[styles.editButton, { color: theme.colors.primary[0] }]}>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={[styles.commentText, { color: theme.colors.text.primary }]}>
            {comment.content}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLike}
            disabled={isLiking}
          >
            <Ionicons 
              name={comment.is_liked ? "heart" : "heart-outline"} 
              size={16} 
              color={comment.is_liked ? theme.colors.semantic.error : theme.colors.text.secondary} 
            />
            {(comment.likes_count || 0) > 0 && (
              <Text style={[styles.likesCount, { color: theme.colors.text.secondary }]}>
                {comment.likes_count || 0}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onReply(comment.id, comment.user?.username || 'Utilisateur')}
          >
            <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
              Répondre
            </Text>
          </TouchableOpacity>

          {canEdit && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
                Modifier
              </Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDelete}
            >
              <Text style={[styles.actionText, { color: theme.colors.semantic.error }]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Réponses */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply, index) => (
              <CommentItem
                key={`${reply.id}-${index}`}
                comment={reply}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
                onReply={onReply}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  date: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    fontSize: 14,
    lineHeight: 20,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  likesCount: {
    fontSize: 12,
    marginLeft: 2,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
});

export default CommentItem;
