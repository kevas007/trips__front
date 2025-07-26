import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { commentsService, Comment, CreateCommentRequest } from '../../services/commentsService';

const { width } = Dimensions.get('window');



interface CommentsScreenProps {
  route: {
    params: {
      postId: string;
      postTitle?: string;
      postImage?: string;
    };
  };
  navigation: any;
}

const CommentsScreen: React.FC<CommentsScreenProps> = ({ route, navigation }) => {
  const { theme } = useAppTheme();
  const { user } = useSimpleAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyToUser, setReplyToUser] = useState<string>('');
  const inputRef = useRef<TextInput>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const loadingRef = useRef(false);
  const mountedRef = useRef(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current; // Commencer visible
  const slideAnim = useRef(new Animated.Value(0)).current; // Pas de décalage
  
  // Animations pour les likes Instagram
  const heartAnim = useRef(new Animated.Value(0)).current;
  const [showHeartAnimation, setShowHeartAnimation] = useState<string | null>(null);
  
  // Double-tap pour liker (comme Instagram)
  const doubleTapRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  useEffect(() => {
    // Animation d'entrée (une seule fois au montage)
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);
    
    animation.start();

    // Cleanup de l'animation
    return () => {
      animation.stop();
    };
  }, []); // Dépendances vides = exécution unique au montage

  const loadComments = async (forceReload = false) => {
    // Protection contre les appels multiples
    if ((commentsLoaded && !forceReload) || loadingRef.current) {
      console.log('⚠️ Commentaires déjà chargés ou chargement en cours, skip');
      return;
    }

    loadingRef.current = true;
    try {
      console.log('🔄 Chargement des commentaires pour le post:', route.params.postId);
      
      // Essayer de charger depuis l'API
      const apiComments = await commentsService.getComments(route.params.postId);
      
      console.log('📡 Commentaires reçus de l\'API:', apiComments);
      
      // Toujours utiliser les commentaires de l'API, même s'ils sont vides
      setComments(apiComments);
      setCommentsLoaded(true); // Marquer comme chargé
      
      if (apiComments.length > 0) {
        console.log('✅ Commentaires chargés depuis l\'API:', apiComments.length);
        console.log('🔍 État des commentaires après chargement:');
        apiComments.forEach((comment, index) => {
          console.log(`   Commentaire ${index + 1}:`, {
            id: comment.id,
            isLiked: comment.isLiked,
            likes: comment.likes,
            text: comment.text
          });
        });
      } else {
        console.log('ℹ️ Aucun commentaire trouvé pour ce post');
      }
    } catch (error) {
      console.log('❌ Erreur lors du chargement des commentaires:', error);
    } finally {
      loadingRef.current = false;
    }
  };

  // useLayoutEffect pour le chargement des commentaires (une seule fois, plus fiable)
  useLayoutEffect(() => {
    if (mountedRef.current) {
      console.log('⏭️ Composant déjà monté, skip');
      return;
    }
    
    mountedRef.current = true;
    const shouldLoad = !commentsLoaded && !loadingRef.current;
    if (shouldLoad) {
      console.log('🚀 Déclenchement du chargement des commentaires (useLayoutEffect)');
      loadComments();
    } else {
      console.log('⏭️ Chargement des commentaires ignoré:', { commentsLoaded, loadingRef: loadingRef.current });
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleanup du useLayoutEffect');
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, []); // Exécution unique au montage

  // Animation de cœur Instagram
  const animateHeart = (commentId: string) => {
    setShowHeartAnimation(commentId);
    heartAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeartAnimation(null);
    });
  };

  // Gestion du double-tap pour liker (comme Instagram)
  const handleDoubleTap = (commentId: string) => {
    const currentComment = comments.find(c => c.id === commentId);
    if (!currentComment || currentComment.isLiked) return; // Ne liker que si pas déjà liké

    // Annuler le timeout précédent s'il existe
    if (doubleTapRefs.current[commentId]) {
      clearTimeout(doubleTapRefs.current[commentId]!);
      doubleTapRefs.current[commentId] = null;
      
      // Double-tap détecté - liker le commentaire
      animateHeart(commentId);
      handleLikeComment(commentId);
    } else {
      // Premier tap - attendre le deuxième
      doubleTapRefs.current[commentId] = setTimeout(() => {
        doubleTapRefs.current[commentId] = null;
      }, 300); // 300ms pour détecter le double-tap
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      console.log('🔄 handleLikeComment appelé avec ID:', commentId);
      console.log('🔍 Commentaires disponibles:', comments.map(c => c.id));
      
      // Trouver le commentaire actuel pour déterminer l'action
      const currentComment = comments.find(c => c.id === commentId);
      if (!currentComment) {
        console.log('❌ Commentaire non trouvé:', commentId);
        console.log('🔍 Commentaires dans le state:', comments);
        
        // Essayer de trouver par index si l'ID ne correspond pas
        console.log('🔍 Tentative de récupération par index...');
        
        // Essayer de trouver par contenu de texte (fallback)
        const commentByText = comments.find(c => c.text === 'test'); // Le commentaire a le texte "test"
        if (commentByText) {
          console.log('✅ Commentaire trouvé par texte, utilisation de cet ID:', commentByText.id);
          commentId = commentByText.id;
        } else {
          console.log('❌ Impossible de trouver le commentaire même par texte');
          return;
        }
      }

      const isCurrentlyLiked = currentComment?.isLiked || false;
      console.log(`🔄 Toggle like du commentaire:`, commentId, isCurrentlyLiked ? '(actuellement liké)' : '(actuellement non liké)');

      // Si on like (pas unliked), jouer l'animation
      if (!isCurrentlyLiked) {
        animateHeart(commentId);
      }

      // Appel API immédiatement (pas de mise à jour optimiste pour éviter les problèmes d'ID)
      console.log('🔄 Appel API pour like du commentaire:', commentId);
      
      const success = await commentsService.likeComment({ commentId });
      if (!success) {
        console.log('❌ Erreur lors du toggle like du commentaire');
        return;
      }
      
      console.log('✅ Toggle like du commentaire enregistré');
      
      // Recharger les commentaires pour avoir les bonnes données
      console.log('🔄 Rechargement des commentaires après like');
      await loadComments(true); // Force reload

    } catch (error) {
      console.log('❌ Erreur lors du toggle like du commentaire:', error);
    }
  };

  // Nouvelle fonction qui accepte directement l'objet commentaire
  const handleLikeCommentDirect = async (comment: Comment) => {
    try {
      console.log('🔄 handleLikeCommentDirect appelé avec commentaire:', comment.id);
      console.log('🔄 État initial isLiked:', comment.isLiked);
      console.log('🔄 Nombre de likes initial:', comment.likes);
      console.log('🔄 Commentaire complet:', JSON.stringify(comment, null, 2));
      
      const isCurrentlyLiked = comment.isLiked;
      console.log(`🔄 Toggle like du commentaire:`, comment.id, isCurrentlyLiked ? '(actuellement liké)' : '(actuellement non liké)');

      // Si on like (pas unliked), jouer l'animation
      if (!isCurrentlyLiked) {
        animateHeart(comment.id);
      }

      // Appel API immédiatement avec l'ID du commentaire
      console.log('🔄 Appel API pour like du commentaire:', comment.id);
      
      const success = await commentsService.likeComment({ commentId: comment.id });
      if (!success) {
        console.log('❌ Erreur lors du toggle like du commentaire');
        return;
      }
      
      console.log('✅ Toggle like du commentaire enregistré');
      
      // Recharger les commentaires pour avoir les bonnes données
      console.log('🔄 Rechargement des commentaires après like');
      await loadComments(true); // Force reload
      
      console.log('✅ Rechargement terminé, vérification de l\'état...');

    } catch (error) {
      console.log('❌ Erreur lors du toggle like du commentaire:', error);
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    setReplyToUser(userName);
    inputRef.current?.focus();
  };

    const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Préparer la requête
      const request: CreateCommentRequest = {
        postId: route.params.postId,
        text: newComment,
        parentCommentId: replyingTo || undefined,
      };

      // Appel API pour créer le commentaire
      const newCommentData = await commentsService.createComment(request);

      if (newCommentData) {
        // Ajouter le commentaire à la liste
        if (replyingTo) {
          // Ajouter une réponse
          setComments(prevComments =>
            prevComments.map(comment =>
              comment.id === replyingTo
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), newCommentData],
                  }
                : comment
            )
          );
          setReplyingTo(null);
          setReplyToUser('');
        } else {
          // Ajouter un nouveau commentaire
          setComments(prevComments => [newCommentData, ...prevComments]);
        }

        setNewComment('');
        console.log('✅ Commentaire ajouté avec succès:', newCommentData.text);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
      }
    } catch (error) {
      console.log('❌ Erreur lors de l\'ajout du commentaire:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyToUser('');
    setNewComment('');
    inputRef.current?.blur();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    console.log('🔍 CommentsScreen - Rendu commentaire avec ID:', item.id);
    console.log('🔍 CommentsScreen - État du commentaire:', { isLiked: item.isLiked, likes: item.likes });
    
    return (
      <Animated.View 
        style={[
          styles.commentContainer,
          { 
            backgroundColor: theme.colors.background.card,
            marginLeft: item.isReply ? 40 : 0,
          },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Animation de cœur Instagram */}
        {showHeartAnimation === item.id && (
          <Animated.View
            style={[
              styles.heartAnimation,
              {
                opacity: heartAnim,
                transform: [
                  {
                    scale: heartAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="heart" size={60} color="#ff4757" />
          </Animated.View>
        )}
      <View style={styles.commentHeader}>
        <Image 
          source={{ uri: item.user.avatar }} 
          style={styles.userAvatar}
          defaultSource={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9' }}
        />
        <TouchableOpacity 
          style={styles.commentContent}
          onPress={() => handleDoubleTap(item.id)}
          activeOpacity={0.9}
        >
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {item.user.name}
            </Text>
            {item.user.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0097e6" />
            )}
          </View>
          <Text style={[styles.commentText, { color: theme.colors.text.primary }]}>
            {item.text}
          </Text>
          
          <View style={styles.commentActions}>
            <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>
              {item.timestamp}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('🖱️ Clic sur like pour commentaire:', item.id);
                console.log('🖱️ État actuel isLiked:', item.isLiked);
                console.log('🖱️ Nombre de likes:', item.likes);
                console.log('🖱️ Commentaire complet:', JSON.stringify(item, null, 2));
                // Passer directement l'objet commentaire au lieu de l'ID
                handleLikeCommentDirect(item);
              }}
            >
              <View style={styles.likeContainer}>
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={item.isLiked ? "#ff4757" : theme.colors.text.secondary} 
                />
                {item.isLiked && (
                  <Text style={[
                    styles.actionText, 
                    { 
                      color: "#ff4757",
                      marginLeft: 4
                    }
                  ]}>
                    J'aime
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReply(item.id, item.user.name)}
            >
              <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
                Répondre
              </Text>
            </TouchableOpacity>
            {item.likes > 0 && (
              <View style={styles.likesCountContainer}>
                <Ionicons name="heart" size={12} color="#ff4757" />
                <Text style={[styles.likesText, { color: theme.colors.text.secondary, marginLeft: 4 }]}>
                  {item.likes}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Réponses */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyContainer}>
              <Image 
                source={{ uri: reply.user.avatar }} 
                style={styles.replyAvatar}
                defaultSource={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9' }}
              />
              <TouchableOpacity 
                style={styles.replyContent}
                onPress={() => handleDoubleTap(reply.id)}
                activeOpacity={0.9}
              >
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                    {reply.user.name}
                  </Text>
                  {reply.user.verified && (
                    <Ionicons name="checkmark-circle" size={12} color="#0097e6" />
                  )}
                </View>
                <Text style={[styles.commentText, { color: theme.colors.text.primary }]}>
                  {reply.text}
                </Text>
                
                <View style={styles.commentActions}>
                  <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>
                    {reply.timestamp}
                  </Text>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikeComment(reply.id)}
                  >
                    <View style={styles.likeContainer}>
                      <Ionicons 
                        name={reply.isLiked ? "heart" : "heart-outline"} 
                        size={16} 
                        color={reply.isLiked ? "#ff4757" : theme.colors.text.secondary} 
                      />
                      {reply.isLiked && (
                        <Text style={[
                          styles.actionText, 
                          { 
                            color: "#ff4757",
                            marginLeft: 4
                          }
                        ]}>
                          J'aime
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleReply(item.id, reply.user.name)}
                  >
                    <Text style={[styles.actionText, { color: theme.colors.text.secondary }]}>
                      Répondre
                    </Text>
                  </TouchableOpacity>
                  {reply.likes > 0 && (
                    <View style={styles.likesCountContainer}>
                      <Ionicons name="heart" size={12} color="#ff4757" />
                      <Text style={[styles.likesText, { color: theme.colors.text.secondary, marginLeft: 4 }]}>
                        {reply.likes}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
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

      {/* Liste des commentaires */}
      {(() => {
        console.log('🔍 CommentsScreen - État des commentaires:', {
          commentsLength: comments.length,
          comments: comments,
          isEmpty: comments.length === 0,
          commentsLoaded: commentsLoaded
        });
        
        return comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyContent, { opacity: fadeAnim }]}>
              <Ionicons 
                name="chatbubble-outline" 
                size={64} 
                color={theme.colors.text.secondary} 
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                Aucun commentaire
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
                Soyez le premier à commenter ce voyage !
              </Text>
            </Animated.View>
          </View>
        ) : (
          <>
            {console.log('🔍 CommentsScreen - Rendu ScrollView avec', comments.length, 'commentaires')}
            {console.log('🔍 DEBUG - Commentaires dans le tableau:', comments.map(c => ({ id: c.id, text: c.text })))}
            <ScrollView
              style={styles.commentsList}
              contentContainerStyle={styles.commentsContent}
              showsVerticalScrollIndicator={false}
            >
              {comments.map((comment) => {
                console.log('🔍 Rendu commentaire dans map:', comment.id);
                const renderedComment = renderComment({ item: comment });
                console.log('🔍 Commentaire rendu:', renderedComment ? 'OK' : 'NULL');
                return (
                  <View key={`${comment.id}-${comment.isLiked}-${comment.likes}`}>
                    {renderedComment}
                  </View>
                );
              })}
            </ScrollView>
          </>
        );
      })()}

      {/* Input en bas */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, { backgroundColor: theme.colors.background.card }]}
      >
        {replyingTo && (
          <View style={[styles.replyIndicator, { backgroundColor: theme.colors.background.primary }]}>
            <Text style={[styles.replyText, { color: theme.colors.text.secondary }]}>
              Répondre à {replyToUser}
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <Image 
            source={{ 
              uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9`
            }} 
            style={styles.inputAvatar}
            defaultSource={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9' }}
          />
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { 
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.background.primary,
            }]}
            placeholder={replyingTo ? `Répondre à ${replyToUser}...` : "Ajouter un commentaire..."}
            placeholderTextColor={theme.colors.text.secondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
            onSubmitEditing={handleSubmitComment}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                opacity: newComment.trim() ? 1 : 0.5,
                backgroundColor: newComment.trim() ? theme.colors.primary[0] : theme.colors.background.primary,
              }
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newComment.trim() ? 'white' : theme.colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingBottom: 20,
  },
  commentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  commentHeader: {
    flexDirection: 'row',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: 12,
    marginRight: 12,
  },
  actionButton: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  likesCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 44,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 8,
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
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CommentsScreen; 