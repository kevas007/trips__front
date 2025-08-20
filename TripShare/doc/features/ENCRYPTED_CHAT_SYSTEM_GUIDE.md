# 🔐 Guide Complet - Système de Chat Chiffré de Bout en Bout

## 🎯 **Vue d'ensemble**

Le système de chat TripShare implémente un chiffrement de bout en bout (E2EE) complet pour garantir la confidentialité et la sécurité des communications. Tous les messages sont chiffrés localement avant d'être envoyés et ne peuvent être déchiffrés que par les destinataires autorisés.

## 🔒 **Architecture de Sécurité**

### **Principe de Fonctionnement**
```
👤 Utilisateur A                    🌐 Serveur                    👤 Utilisateur B
     │                                   │                              │
     │ 1. Génère clés RSA               │                              │
     │ 2. Envoie clé publique           │                              │
     │                                   │                              │
     │ 3. Chiffre message avec AES      │                              │
     │ 4. Chiffre clé AES avec clé      │                              │
     │    publique de B                  │                              │
     │ 5. Envoie message chiffré        │                              │
     │                                   │                              │
     │                                   │ 6. Transmet message         │
     │                                   │                              │
     │                                   │                              │ 7. Déchiffre clé AES
     │                                   │                              │    avec clé privée
     │                                   │                              │ 8. Déchiffre message
     │                                   │                              │    avec clé AES
```

### **Types de Chiffrement**
- **RSA-2048** : Pour l'échange de clés et les signatures
- **AES-256-GCM** : Pour le chiffrement des messages
- **SHA-256** : Pour les signatures et vérifications

## 🏗️ **Architecture Technique**

### **Backend (Go)**
```
📁 models/
├── encryption.go              # Modèles pour les clés et messages chiffrés
├── user_key.go                # Clés utilisateur
├── group_key.go               # Clés de groupe
└── encrypted_message.go       # Messages chiffrés

📁 services/
├── encryption_service.go      # Service de chiffrement principal
├── group_service.go           # Gestion des groupes avec chiffrement
└── chat_service.go            # Service de chat avec E2EE

📁 handlers/
├── encryption_handler.go      # Gestion des clés
├── group_handler.go           # Gestion des groupes
└── chat_handler.go            # Gestion des messages chiffrés
```

### **Frontend (React Native)**
```
📁 services/
├── encryptionService.ts       # Service de chiffrement côté client
├── chatService.ts             # Service de chat avec E2EE
└── groupService.ts            # Service de gestion des groupes

📁 components/
├── EncryptedChat.tsx          # Composant de chat chiffré
├── GroupManagement.tsx        # Gestion des groupes
└── KeyManagement.tsx          # Gestion des clés
```

## 🔑 **Gestion des Clés**

### **Clés Utilisateur**
```typescript
interface KeyPair {
  private_key: string;  // Clé privée RSA (chiffrée)
  public_key: string;   // Clé publique RSA
}

// Génération des clés
const keyPair = await encryptionService.generateKeyPair();
await encryptionService.saveUserKeys(keyPair);
```

### **Clés de Groupe**
```typescript
interface GroupKey {
  group_id: string;
  key: string;                    // Clé AES du groupe
  iv: string;                     // Vecteur d'initialisation
  members: Record<string, string>; // Clés chiffrées par membre
  admin_id: string;
  created_at: number;
  updated_at: number;
}
```

## 💬 **Types de Conversations**

### **1. Conversations Privées**
- **Chiffrement** : Chaque message utilise une nouvelle clé AES
- **Destinataires** : Seulement les deux utilisateurs
- **Sécurité** : Chiffrement de bout en bout complet

```typescript
// Chiffrement d'un message privé
const encryptedMessage = await encryptionService.encryptPrivateMessage(
  senderID,
  recipientID,
  "Message secret"
);

// Déchiffrement
const decryptedMessage = await encryptionService.decryptMessage(
  userID,
  encryptedMessage
);
```

### **2. Groupes**
- **Chiffrement** : Une clé AES partagée pour tous les membres
- **Gestion** : Clé renouvelée lors de l'ajout/retrait de membres
- **Administration** : Seuls les admins peuvent modifier le groupe

```typescript
// Création d'un groupe
const group = await groupService.createGroup({
  name: "Mon Groupe",
  description: "Groupe sécurisé",
  memberIDs: [user1, user2, user3]
});

// Envoi d'un message de groupe
const encryptedMessage = await encryptionService.encryptGroupMessage(
  senderID,
  groupID,
  "Message de groupe"
);
```

### **3. Communautés**
- **Chiffrement** : Clé AES partagée pour tous les membres
- **Accès** : Ouvert à tous les utilisateurs
- **Modération** : Système de modération intégré

## 🔄 **Processus de Chiffrement**

### **Envoi d'un Message**
```typescript
async function sendEncryptedMessage(recipientID: string, message: string) {
  // 1. Générer une clé AES aléatoire
  const aesKey = await crypto.subtle.generateKey({
    name: 'AES-GCM',
    length: 256
  }, true, ['encrypt']);

  // 2. Chiffrer le message avec AES
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await crypto.subtle.encrypt({
    name: 'AES-GCM',
    iv: iv
  }, aesKey, new TextEncoder().encode(message));

  // 3. Récupérer la clé publique du destinataire
  const recipientPublicKey = await getPublicKey(recipientID);

  // 4. Chiffrer la clé AES avec la clé publique
  const encryptedKey = await crypto.subtle.encrypt({
    name: 'RSA-OAEP'
  }, recipientPublicKey, await crypto.subtle.exportKey('raw', aesKey));

  // 5. Signer le message
  const signature = await signMessage(encryptedContent);

  // 6. Envoyer le message chiffré
  return {
    content: base64Encode(encryptedContent),
    iv: base64Encode(iv),
    key: base64Encode(encryptedKey),
    signature: base64Encode(signature)
  };
}
```

### **Réception d'un Message**
```typescript
async function decryptMessage(userID: string, encryptedMessage: EncryptedMessage) {
  // 1. Vérifier la signature
  await verifyMessage(encryptedMessage);

  // 2. Récupérer la clé privée
  const privateKey = await getUserPrivateKey(userID);

  // 3. Déchiffrer la clé AES
  const encryptedKey = base64Decode(encryptedMessage.key);
  const aesKeyBuffer = await crypto.subtle.decrypt({
    name: 'RSA-OAEP'
  }, privateKey, encryptedKey);

  // 4. Importer la clé AES
  const aesKey = await crypto.subtle.importKey('raw', aesKeyBuffer, {
    name: 'AES-GCM'
  }, false, ['decrypt']);

  // 5. Déchiffrer le message
  const encryptedContent = base64Decode(encryptedMessage.content);
  const iv = base64Decode(encryptedMessage.iv);
  
  const decryptedBuffer = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: iv
  }, aesKey, encryptedContent);

  return new TextDecoder().decode(decryptedBuffer);
}
```

## 🛡️ **Sécurité et Bonnes Pratiques**

### **Gestion des Clés**
- **Génération sécurisée** : Utilisation de `crypto.getRandomValues()`
- **Stockage local** : Clés privées jamais envoyées au serveur
- **Rotation automatique** : Renouvellement périodique des clés
- **Sauvegarde** : Système de récupération de clés

### **Vérification d'Intégrité**
- **Signatures** : Chaque message est signé par l'expéditeur
- **Vérification** : Validation de l'authenticité des messages
- **Replay Protection** : Protection contre les attaques par rejeu

### **Gestion des Groupes**
- **Clés partagées** : Une clé AES par groupe
- **Rotation automatique** : Nouvelle clé lors de changements de membres
- **Contrôle d'accès** : Seuls les admins peuvent modifier le groupe

## 📡 **API Endpoints**

### **Gestion des Clés**
```
POST   /api/v1/users/keys              # Générer et sauvegarder les clés
GET    /api/v1/users/keys              # Récupérer les clés utilisateur
POST   /api/v1/users/keys/rotate       # Faire tourner les clés
```

### **Gestion des Groupes**
```
POST   /api/v1/groups                  # Créer un groupe
GET    /api/v1/groups                  # Liste des groupes
GET    /api/v1/groups/:id              # Informations du groupe
GET    /api/v1/groups/:id/members      # Membres du groupe
POST   /api/v1/groups/:id/members      # Ajouter un membre
DELETE /api/v1/groups/:id/members/:user_id  # Retirer un membre
POST   /api/v1/groups/:id/members/promote   # Promouvoir un membre
```

### **Clés de Groupe**
```
GET    /api/v1/groups/:id/keys         # Récupérer la clé de groupe
POST   /api/v1/groups/:id/keys/rotate  # Faire tourner la clé
```

### **Messages Chiffrés**
```
POST   /api/v1/chat/conversations/:id/messages  # Envoyer un message chiffré
GET    /api/v1/chat/conversations/:id/messages  # Récupérer les messages
```

## 🔧 **Configuration**

### **Backend**
```go
// Initialisation des services
encryptionService := services.NewEncryptionService()
groupService := services.NewGroupService(db, encryptionService)
chatService := services.NewChatService(db, encryptionService)

// Configuration des routes
routes.SetupEncryptionRoutes(router, encryptionHandler)
routes.SetupGroupRoutes(router, groupHandler)
routes.SetupChatRoutes(router, chatHandler)
```

### **Frontend**
```typescript
// Initialisation des services
const encryptionService = new EncryptionService();
const chatService = new ChatService(encryptionService);
const groupService = new GroupService(encryptionService);

// Configuration du contexte
const ChatProvider = ({ children }) => (
  <ChatContext.Provider value={{ chatService, encryptionService }}>
    {children}
  </ChatContext.Provider>
);
```

## 🧪 **Tests de Sécurité**

### **Tests de Chiffrement**
```typescript
describe('EncryptionService', () => {
  it('should encrypt and decrypt messages correctly', async () => {
    const message = 'Message secret';
    const encrypted = await encryptionService.encryptPrivateMessage(
      senderID, recipientID, message
    );
    const decrypted = await encryptionService.decryptMessage(
      recipientID, encrypted
    );
    expect(decrypted).toBe(message);
  });

  it('should reject tampered messages', async () => {
    const encrypted = await encryptionService.encryptPrivateMessage(
      senderID, recipientID, 'Message'
    );
    encrypted.content = 'tampered';
    
    await expect(
      encryptionService.decryptMessage(recipientID, encrypted)
    ).rejects.toThrow('Signature invalide');
  });
});
```

### **Tests de Groupes**
```typescript
describe('GroupService', () => {
  it('should rotate keys when members change', async () => {
    const group = await groupService.createGroup('Test Group', [user1, user2]);
    const originalKey = await groupService.getGroupKey(group.id);
    
    await groupService.addMember(group.id, user3);
    const newKey = await groupService.getGroupKey(group.id);
    
    expect(newKey.key).not.toBe(originalKey.key);
  });
});
```

## 🚀 **Utilisation**

### **Première Configuration**
```typescript
// 1. Générer les clés lors de l'inscription
const keyPair = await encryptionService.generateAndSaveUserKeys();

// 2. Charger les clés lors de la connexion
const userKeys = await encryptionService.getUserKeys();
await encryptionService.loadUserKeys(userID, userKeys.private_key, userKeys.public_key);
```

### **Envoi de Messages**
```typescript
// Message privé
const encryptedMessage = await encryptionService.encryptPrivateMessage(
  currentUserID,
  recipientID,
  "Salut ! Comment ça va ?"
);
await chatService.sendMessage(conversationID, encryptedMessage);

// Message de groupe
const encryptedGroupMessage = await encryptionService.encryptGroupMessage(
  currentUserID,
  groupID,
  "Message pour le groupe"
);
await chatService.sendMessage(groupConversationID, encryptedGroupMessage);
```

### **Réception de Messages**
```typescript
// Récupérer et déchiffrer les messages
const messages = await chatService.getMessages(conversationID);
const decryptedMessages = await Promise.all(
  messages.map(async (msg) => ({
    ...msg,
    content: await encryptionService.decryptMessage(currentUserID, msg)
  }))
);
```

## 🔄 **Maintenance et Mise à Jour**

### **Rotation des Clés**
- **Automatique** : Tous les 90 jours pour les clés utilisateur
- **Manuelle** : Lors de changements de membres dans les groupes
- **Sécurisée** : Anciens messages restent accessibles avec les anciennes clés

### **Sauvegarde et Récupération**
- **Sauvegarde locale** : Clés privées sauvegardées localement
- **Récupération** : Système de récupération via phrase de récupération
- **Migration** : Support de la migration entre appareils

## 📚 **Ressources et Support**

- **Documentation API** : `/api/v1/docs/encryption`
- **Tests de sécurité** : `/tests/security/`
- **Audit de sécurité** : Rapport disponible sur demande
- **Support** : Équipe de sécurité dédiée

Le système de chat chiffré TripShare garantit une confidentialité totale de vos communications ! 🔐✨ 