import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../design-system';
import { chatService, Conversation, ChatMessage } from '../../services/chatService';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface RouteParams {
  conversationId: string;
  conversationName?: string;
}

const ConversationScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { conversationId, conversationName } = route.params as RouteParams;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Charger la conversation et les messages
  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      
      // Charger la conversation
      const conversationData = await chatService.getConversation(conversationId);
      if (conversationData) {
        setConversation(conversationData);
      }

      // Charger les messages
      const messagesData = await chatService.getMessages(conversationId);
      setMessages(messagesData.reverse()); // Inverser pour afficher du plus ancien au plus récent

      // Marquer la conversation comme lue
      await chatService.markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
      Alert.alert('Erreur', 'Impossible de charger la conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const sentMessage = await chatService.sendMessage(conversationId, newMessage.trim());
      
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Faire défiler vers le bas
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversation();
    setRefreshing(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const isRead = chatService.isMessageReadByUser(item, user?.id || '');

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {chatService.formatMessageTime(item.created_at)}
            </Text>
            {isOwnMessage && (
              <Ionicons
                name={isRead ? "checkmark-done" : "checkmark"}
                size={16}
                color={isRead ? COLORS.primary[0] : COLORS.neutral[400]}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (!conversation) return null;

    const getConversationTitle = () => {
      if (conversation.type === 'private' && conversation.members) {
        const otherMember = conversation.members.find(member => member.user_id !== user?.id);
        return otherMember?.user?.username || 'Utilisateur';
      }
      return conversation.name || 'Conversation';
    };

    const getMemberCount = () => {
      if (conversation.type === 'private') return null;
      return conversation.members?.length || 0;
    };

    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{getConversationTitle()}</Text>
          {getMemberCount() && (
            <Text style={styles.headerSubtitle}>{getMemberCount()} membres</Text>
          )}
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.neutral[400]} />
      <Text style={styles.emptyStateTitle}>Aucun message</Text>
      <Text style={styles.emptyStateSubtitle}>
        Commencez la conversation en envoyant un message !
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[0]} />
          <Text style={styles.loadingText}>Chargement de la conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView
        style={[styles.keyboardAvoidingView, { backgroundColor: 'transparent' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        contentContainerStyle={{ flex: 1, backgroundColor: 'transparent' }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Tapez votre message..."
            placeholderTextColor={COLORS.neutral[400]}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Supprimer le fond blanc
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#008080',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.neutral[500],
  },

  // Keyboard avoiding
  keyboardAvoidingView: {
    flex: 1,
  },

  // Messages list
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },

  // Message
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#008080',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: COLORS.neutral[800],
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.neutral[400],
    marginRight: 4,
  },
  readIcon: {
    marginLeft: 2,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: '#008080',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
});

export default ConversationScreen; 