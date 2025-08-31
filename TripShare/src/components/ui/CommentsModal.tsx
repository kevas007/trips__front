import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Comment, commentService } from '../../services/commentService';
import { useAuthStore } from '../../store';
import CommentItem from './CommentItem';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle?: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  tripId,
  tripTitle = 'Commentaires',
}) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string; username: string } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      loadComments();
    }
  }, [visible, tripId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const loadComments = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await commentService.getTripComments(tripId, pageNum, 20);
      
      if (pageNum === 1) {
        setComments(response.comments);
      } else {
        setComments(prev => [...prev, ...response.comments]);
      }
      
      setHasMore(response.comments.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      setSending(true);
      const newComment = await commentService.createComment(tripId, {
        content: commentText.trim(),
        parent_id: replyTo?.commentId,
      });
      
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setReplyTo(null);
      
      // Faire défiler vers le haut pour voir le nouveau commentaire
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le commentaire');
    } finally {
      setSending(false);
    }
  };

  const handleCommentUpdated = () => {
    loadComments(1);
  };

  const handleCommentDeleted = () => {
    loadComments(1);
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ commentId, username });
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadComments(page + 1);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      onCommentUpdated={handleCommentUpdated}
      onCommentDeleted={handleCommentDeleted}
      onReply={handleReply}
    />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary[0]} />
        <Text style={[styles.loadMoreText, { color: theme.colors.text.secondary }]}>
          Chargement...
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
        
        {/* En-tête */}
        <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {tripTitle}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Liste des commentaires */}
          {loading && comments.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[0]} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                Chargement des commentaires...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              contentContainerStyle={[
                styles.commentsContent,
                keyboardVisible && { paddingBottom: 100 }
              ]}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            />
          )}

          {/* Zone de saisie */}
          {user && (
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary }]}>
              {replyTo && (
                <View style={styles.replyIndicator}>
                  <Text style={[styles.replyText, { color: theme.colors.text.secondary }]}>
                    Répondre à @{replyTo.username}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyTo(null)}>
                    <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.inputRow}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={replyTo ? `Répondre à @${replyTo.username}...` : "Ajouter un commentaire..."}
                  placeholderTextColor={theme.colors.text.secondary}
                  style={[styles.input, { 
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.primary 
                  }]}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { 
                      backgroundColor: commentText.trim() ? theme.colors.primary[0] : theme.colors.text.secondary,
                      opacity: sending ? 0.7 : 1
                    }
                  ]}
                  onPress={handleSendComment}
                  disabled={!commentText.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  replyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentsModal;
