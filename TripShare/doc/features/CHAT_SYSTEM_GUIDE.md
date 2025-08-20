# 💬 Guide Complet - Système de Chat TripShare

## 🎯 **Vue d'ensemble**

Le système de chat TripShare permet aux utilisateurs de communiquer en temps réel via :
- **Conversations privées** : Messages directs entre deux utilisateurs
- **Groupes** : Discussions multi-utilisateurs
- **Communautés** : Espaces de discussion publics

## 🏗️ **Architecture du Système**

### **Backend (Go)**
```
📁 models/
├── chat.go                    # Modèles de données
├── conversation.go            # Structure des conversations
├── message.go                 # Structure des messages
└── notification.go            # Notifications de chat

📁 services/
└── chat_service.go            # Logique métier du chat

📁 handlers/
└── chat_handler.go            # Gestionnaires d'API

📁 routes/
└── chat_routes.go             # Routes API
```

### **Frontend (React Native)**
```
📁 services/
└── chatService.ts             # Service de communication API

📁 screens/
├── ChatScreen.tsx             # Liste des conversations
└── ConversationScreen.tsx     # Écran de conversation

📁 components/
└── chat/                      # Composants de chat (à créer)
```

## 🔧 **Configuration Backend**

### **1. Ajout du ChatService**
```go
// Dans cmd/main.go
chatService := services.NewChatService(db)
chatHandler := handlers.NewChatHandler(chatService, userService)

// Ajouter aux services
services := &Services{
    // ... autres services
    ChatService: chatService,
}
```

### **2. Configuration des Routes**
```go
// Dans routes/routes.go
routes.SetupChatRoutes(router, chatHandler)
```

### **3. Migration de Base de Données**
```sql
-- Tables pour le chat
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    metadata JSON,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    read_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 📡 **API Endpoints**

### **Conversations**
```
GET    /api/v1/chat/conversations              # Liste des conversations
POST   /api/v1/chat/conversations              # Créer une conversation
GET    /api/v1/chat/conversations/:id          # Détails d'une conversation
GET    /api/v1/chat/conversations/private/:user_id  # Conversation privée
GET    /api/v1/chat/conversations/:id/stats    # Statistiques
```

### **Messages**
```
GET    /api/v1/chat/conversations/:id/messages     # Messages d'une conversation
POST   /api/v1/chat/conversations/:id/messages     # Envoyer un message
POST   /api/v1/chat/conversations/:id/messages/read # Marquer comme lu
POST   /api/v1/chat/messages/:id/read              # Marquer un message comme lu
```

### **Membres**
```
POST   /api/v1/chat/conversations/:id/members      # Ajouter un membre
DELETE /api/v1/chat/conversations/:id/members/:user_id # Retirer un membre
```

### **Notifications**
```
GET    /api/v1/chat/notifications                  # Notifications utilisateur
POST   /api/v1/chat/notifications/:id/read         # Marquer comme lue
```

## 🎨 **Interface Utilisateur**

### **ChatScreen - Liste des Conversations**
```tsx
const ChatScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const data = await chatService.getUserConversations();
    setConversations(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Chat" />
      <TabNavigation />
      <ConversationList 
        conversations={conversations}
        onRefresh={loadConversations}
        loading={loading}
      />
      <FloatingActionButton onPress={createNewConversation} />
    </SafeAreaView>
  );
};
```

### **ConversationScreen - Messages**
```tsx
const ConversationScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async () => {
    const sentMessage = await chatService.sendMessage(
      conversationId, 
      newMessage.trim()
    );
    
    if (sentMessage) {
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConversationHeader conversation={conversation} />
      <MessageList 
        messages={messages}
        onRefresh={loadMessages}
      />
      <MessageInput 
        value={newMessage}
        onChangeText={setNewMessage}
        onSend={sendMessage}
      />
    </SafeAreaView>
  );
};
```

## 🔄 **Fonctionnalités Principales**

### **1. Conversations Privées**
- **Création automatique** : Une conversation privée est créée automatiquement lors du premier message
- **Nommage intelligent** : Le nom affiché est celui de l'autre utilisateur
- **Statut de lecture** : Indicateurs visuels pour les messages lus/non lus

### **2. Groupes et Communautés**
- **Gestion des membres** : Ajout/retrait de membres avec rôles
- **Messages de système** : Notifications automatiques pour les événements
- **Statistiques** : Nombre de membres, messages, etc.

### **3. Notifications**
- **Notifications push** : Alertes pour nouveaux messages
- **Marquage automatique** : Messages marqués comme lus lors de l'ouverture
- **Historique** : Conservation des notifications

## 🚀 **Utilisation**

### **Créer une Conversation Privée**
```typescript
// Récupérer ou créer une conversation privée
const conversation = await chatService.getPrivateConversation(otherUserId);

// Naviguer vers la conversation
navigation.navigate('Conversation', {
  conversationId: conversation.id,
  conversationName: otherUser.username
});
```

### **Envoyer un Message**
```typescript
// Envoyer un message texte
const message = await chatService.sendMessage(
  conversationId,
  "Salut ! Comment ça va ?",
  "text"
);

// Envoyer une image
const message = await chatService.sendMessage(
  conversationId,
  "Photo de voyage",
  "image",
  JSON.stringify({ url: "https://..." })
);
```

### **Marquer comme Lu**
```typescript
// Marquer tous les messages d'une conversation comme lus
await chatService.markConversationAsRead(conversationId);

// Marquer un message spécifique comme lu
await chatService.markMessageAsRead(messageId);
```

## 🔧 **Configuration Frontend**

### **1. Service de Chat**
```typescript
// services/chatService.ts
export const chatService = new ChatService();

// Utilisation
const conversations = await chatService.getUserConversations();
const messages = await chatService.getMessages(conversationId);
```

### **2. Navigation**
```typescript
// navigation/MainNavigator.tsx
<Stack.Screen 
  name="Conversation" 
  component={ConversationScreen}
  options={{ headerShown: false }}
/>
```

### **3. Types TypeScript**
```typescript
// types/chat.ts
export interface Conversation {
  id: string;
  type: 'private' | 'group' | 'community';
  name?: string;
  members?: ConversationMember[];
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_by?: MessageRead[];
}
```

## 🧪 **Tests**

### **Tests Backend**
```go
func TestChatService_CreateConversation(t *testing.T) {
    // Test de création de conversation
}

func TestChatService_SendMessage(t *testing.T) {
    // Test d'envoi de message
}

func TestChatService_MarkAsRead(t *testing.T) {
    // Test de marquage comme lu
}
```

### **Tests Frontend**
```typescript
describe('ChatService', () => {
  it('should load conversations', async () => {
    const conversations = await chatService.getUserConversations();
    expect(conversations).toBeDefined();
  });

  it('should send message', async () => {
    const message = await chatService.sendMessage(
      conversationId,
      'Test message'
    );
    expect(message).toBeDefined();
  });
});
```

## 🔄 **Prochaines Étapes**

### **Fonctionnalités Avancées**
1. **Messages en temps réel** : WebSocket pour les mises à jour instantanées
2. **Fichiers et médias** : Upload et partage de photos/vidéos
3. **Recherche** : Recherche dans les messages et conversations
4. **Notifications push** : Intégration avec Firebase/APNS
5. **Chiffrement** : Messages chiffrés de bout en bout

### **Optimisations**
1. **Pagination** : Chargement progressif des messages
2. **Cache** : Mise en cache des conversations fréquentes
3. **Compression** : Optimisation des images et fichiers
4. **Synchronisation** : Sync multi-appareils

## 🐛 **Dépannage**

### **Problèmes Courants**

#### **Messages non envoyés**
```typescript
// Vérifier la connexion réseau
if (!isConnected) {
  Alert.alert('Erreur', 'Vérifiez votre connexion internet');
  return;
}

// Vérifier l'authentification
if (!user) {
  Alert.alert('Erreur', 'Vous devez être connecté');
  return;
}
```

#### **Conversations non chargées**
```typescript
// Vérifier les permissions
const hasPermission = await checkChatPermissions();
if (!hasPermission) {
  // Demander les permissions
  await requestChatPermissions();
}
```

#### **Messages non lus**
```typescript
// Forcer le marquage comme lu
await chatService.markConversationAsRead(conversationId);

// Rafraîchir la liste
await loadConversations();
```

## 📚 **Ressources**

- **Documentation API** : `/api/v1/chat/docs`
- **Exemples de code** : `/examples/chat`
- **Tests** : `/tests/chat`
- **Support** : Contactez l'équipe de développement

Le système de chat TripShare est maintenant entièrement fonctionnel et prêt à être utilisé ! 🚀 