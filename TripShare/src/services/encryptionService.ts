import { unifiedApi } from './unifiedApi';

// Types pour le chiffrement
export interface KeyPair {
  private_key: string;
  public_key: string;
}

export interface EncryptedMessage {
  content: string;        // Contenu chiffré en base64
  iv: string;            // Vecteur d'initialisation
  key: string;           // Clé AES chiffrée
  recipients: Record<string, string>; // Clés chiffrées par destinataire
  signature: string;     // Signature du message
  message_type: 'private' | 'group' | 'community';
}

export interface GroupKey {
  group_id: string;
  key: string;           // Clé AES du groupe
  iv: string;            // Vecteur d'initialisation
  members: Record<string, string>; // Clés chiffrées par membre
  admin_id: string;
  created_at: number;
  updated_at: number;
}

class EncryptionService {
  private userKeys: Map<string, CryptoKey> = new Map();
  private groupKeys: Map<string, GroupKey> = new Map();

  // ========== GÉNÉRATION DE CLÉS ==========

  // Générer une nouvelle paire de clés pour l'utilisateur
  async generateKeyPair(): Promise<KeyPair> {
    try {
      console.log('🔄 Génération d\'une nouvelle paire de clés...');
      
      // Générer une paire de clés RSA
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Exporter la clé publique
      const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyBase64 = this.arrayBufferToBase64(publicKeyBuffer);

      // Exporter la clé privée
      const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyBase64 = this.arrayBufferToBase64(privateKeyBuffer);

      console.log('✅ Paire de clés générée avec succès');
      
      return {
        private_key: privateKeyBase64,
        public_key: publicKeyBase64,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la génération des clés:', error);
      throw new Error('Impossible de générer les clés de chiffrement');
    }
  }

  // Charger les clés de l'utilisateur
  async loadUserKeys(userID: string, privateKeyBase64: string, publicKeyBase64: string): Promise<void> {
    try {
      console.log('🔄 Chargement des clés utilisateur...');
      
      // Importer la clé privée
      const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['decrypt']
      );

      // Stocker les clés
      this.userKeys.set(userID, privateKey);
      
      console.log('✅ Clés utilisateur chargées');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clés:', error);
      throw new Error('Impossible de charger les clés utilisateur');
    }
  }

  // ========== CHIFFREMENT DE MESSAGES ==========

  // Chiffrer un message pour une conversation privée
  async encryptPrivateMessage(senderID: string, recipientID: string, message: string): Promise<EncryptedMessage> {
    try {
      console.log('🔄 Chiffrement d\'un message privé...');
      
      // Générer une clé AES aléatoire
      const aesKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Générer un vecteur d'initialisation
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Chiffrer le message avec AES
      const messageBuffer = new TextEncoder().encode(message);
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        aesKey,
        messageBuffer
      );

      // Récupérer la clé publique du destinataire
      const recipientPublicKey = await this.getPublicKey(recipientID);

      // Exporter la clé AES
      const aesKeyBuffer = await window.crypto.subtle.exportKey('raw', aesKey);

      // Chiffrer la clé AES avec la clé publique du destinataire
      const encryptedKey = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        recipientPublicKey,
        aesKeyBuffer
      );

      // Créer la signature du message
      const signature = await this.signMessage(senderID, encryptedContent);

      console.log('✅ Message privé chiffré avec succès');
      
      return {
        content: this.arrayBufferToBase64(encryptedContent),
        iv: this.arrayBufferToBase64(iv.buffer),
        key: this.arrayBufferToBase64(encryptedKey),
        recipients: {
          [recipientID]: this.arrayBufferToBase64(encryptedKey),
        },
        signature: this.arrayBufferToBase64(signature),
        message_type: 'private',
      };
    } catch (error) {
      console.error('❌ Erreur lors du chiffrement du message privé:', error);
      throw new Error('Impossible de chiffrer le message');
    }
  }

  // Chiffrer un message pour un groupe
  async encryptGroupMessage(senderID: string, groupID: string, message: string): Promise<EncryptedMessage> {
    try {
      console.log('🔄 Chiffrement d\'un message de groupe...');
      
      // Récupérer la clé de groupe
      const groupKey = this.groupKeys.get(groupID);
      if (!groupKey) {
        throw new Error('Clé de groupe non trouvée');
      }

      // Décoder la clé AES du groupe
      const groupAESKeyBuffer = this.base64ToArrayBuffer(groupKey.key);
      const groupAESKey = await window.crypto.subtle.importKey(
        'raw',
        groupAESKeyBuffer,
        {
          name: 'AES-GCM',
        },
        false,
        ['encrypt']
      );

      // Décoder l'IV du groupe
      const groupIV = this.base64ToArrayBuffer(groupKey.iv);

      // Chiffrer le message avec la clé AES du groupe
      const messageBuffer = new TextEncoder().encode(message);
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: groupIV,
        },
        groupAESKey,
        messageBuffer
      );

      // Créer la signature du message
      const signature = await this.signMessage(senderID, encryptedContent);

      console.log('✅ Message de groupe chiffré avec succès');
      
      return {
        content: this.arrayBufferToBase64(encryptedContent),
        iv: groupKey.iv,
        key: groupKey.key,
        recipients: groupKey.members,
        signature: this.arrayBufferToBase64(signature),
        message_type: 'group',
      };
    } catch (error) {
      console.error('❌ Erreur lors du chiffrement du message de groupe:', error);
      throw new Error('Impossible de chiffrer le message de groupe');
    }
  }

  // ========== DÉCHIFFREMENT DE MESSAGES ==========

  // Déchiffrer un message
  async decryptMessage(userID: string, encryptedMsg: EncryptedMessage): Promise<string> {
    try {
      console.log('🔄 Déchiffrement d\'un message...');
      
      // Vérifier la signature
      await this.verifyMessage(encryptedMsg);

      // Récupérer la clé chiffrée pour cet utilisateur
      const encryptedKeyStr = encryptedMsg.recipients[userID];
      if (!encryptedKeyStr) {
        throw new Error('Aucune clé trouvée pour cet utilisateur');
      }

      // Décoder la clé chiffrée
      const encryptedKey = this.base64ToArrayBuffer(encryptedKeyStr);

      // Récupérer la clé privée de l'utilisateur
      const privateKey = this.userKeys.get(userID);
      if (!privateKey) {
        throw new Error('Clé privée non trouvée pour l\'utilisateur');
      }

      // Déchiffrer la clé AES
      const aesKeyBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        privateKey,
        encryptedKey
      );

      // Importer la clé AES
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyBuffer,
        {
          name: 'AES-GCM',
        },
        false,
        ['decrypt']
      );

      // Décoder le contenu chiffré
      const encryptedContent = this.base64ToArrayBuffer(encryptedMsg.content);

      // Décoder l'IV
      const iv = this.base64ToArrayBuffer(encryptedMsg.iv);

      // Déchiffrer le message
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        aesKey,
        encryptedContent
      );

      const decryptedMessage = new TextDecoder().decode(decryptedBuffer);
      
      console.log('✅ Message déchiffré avec succès');
      return decryptedMessage;
    } catch (error) {
      console.error('❌ Erreur lors du déchiffrement:', error);
      throw new Error('Impossible de déchiffrer le message');
    }
  }

  // ========== GESTION DES GROUPES ==========

  // Charger la clé d'un groupe
  async loadGroupKey(groupID: string, groupKeyData: GroupKey): Promise<void> {
    try {
      console.log('🔄 Chargement de la clé de groupe:', groupID);
      
      // Vérifier que l'utilisateur est membre du groupe
      const userID = await this.getCurrentUserID();
      if (!groupKeyData.members[userID]) {
        throw new Error('Utilisateur non membre du groupe');
      }

      // Stocker la clé de groupe
      this.groupKeys.set(groupID, groupKeyData);
      
      console.log('✅ Clé de groupe chargée');
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la clé de groupe:', error);
      throw new Error('Impossible de charger la clé de groupe');
    }
  }

  // ========== UTILITAIRES ==========

  // Signer un message
  private async signMessage(senderID: string, data: ArrayBuffer): Promise<ArrayBuffer> {
    try {
      const privateKey = this.userKeys.get(senderID);
      if (!privateKey) {
        throw new Error('Clé privée non trouvée pour l\'expéditeur');
      }

      // Calculer le hash SHA-256
      const hash = await window.crypto.subtle.digest('SHA-256', data);

      // Signer le hash
      const signature = await window.crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        privateKey,
        hash
      );

      return signature;
    } catch (error) {
      console.error('❌ Erreur lors de la signature:', error);
      throw new Error('Impossible de signer le message');
    }
  }

  // Vérifier la signature d'un message
  private async verifyMessage(encryptedMsg: EncryptedMessage): Promise<void> {
    try {
      // Décoder la signature
      const signature = this.base64ToArrayBuffer(encryptedMsg.signature);

      // Décoder le contenu
      const content = this.base64ToArrayBuffer(encryptedMsg.content);

      // Calculer le hash
      const hash = await window.crypto.subtle.digest('SHA-256', content);

      // TODO: Récupérer la clé publique de l'expéditeur depuis l'API
      // Pour l'instant, on retourne sans vérification
      console.log('⚠️ Vérification de signature non implémentée');
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de signature:', error);
      throw new Error('Signature invalide');
    }
  }

  // Récupérer la clé publique d'un utilisateur
  private async getPublicKey(userID: string): Promise<CryptoKey> {
    try {
      // TODO: Récupérer la clé publique depuis l'API
      // Pour l'instant, on retourne une erreur
      throw new Error(`Clé publique non trouvée pour l'utilisateur ${userID}`);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la clé publique:', error);
      throw new Error('Impossible de récupérer la clé publique');
    }
  }

  // Récupérer l'ID de l'utilisateur actuel
  private async getCurrentUserID(): Promise<string> {
    // TODO: Récupérer depuis le contexte d'authentification
    return 'current-user-id';
  }

  // ========== CONVERSION DE FORMATS ==========

  // Convertir ArrayBuffer en Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convertir Base64 en ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // ========== API INTÉGRATION ==========

  // Générer et sauvegarder les clés utilisateur
  async generateAndSaveUserKeys(): Promise<KeyPair> {
    try {
      console.log('🔄 Génération et sauvegarde des clés utilisateur...');
      
      // Générer les clés
      const keyPair = await this.generateKeyPair();

      // Sauvegarder via l'API
      const response = await unifiedApi.post('/users/keys', keyPair);
      
      if (response && (response as any).success) {
        console.log('✅ Clés utilisateur sauvegardées');
        return keyPair;
      } else {
        throw new Error('Échec de la sauvegarde des clés');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la génération et sauvegarde des clés:', error);
      throw new Error('Impossible de générer et sauvegarder les clés');
    }
  }

  // Récupérer les clés utilisateur
  async getUserKeys(): Promise<KeyPair> {
    try {
      console.log('🔄 Récupération des clés utilisateur...');
      
      const response = await unifiedApi.get('/users/keys');
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Clés utilisateur récupérées');
        return (response as any).data;
      } else {
        throw new Error('Clés utilisateur non trouvées');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des clés:', error);
      throw new Error('Impossible de récupérer les clés utilisateur');
    }
  }

  // Récupérer la clé d'un groupe
  async getGroupKey(groupID: string): Promise<GroupKey> {
    try {
      console.log('🔄 Récupération de la clé de groupe:', groupID);
      
      const response = await unifiedApi.get(`/groups/${groupID}/keys`);
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Clé de groupe récupérée');
        return (response as any).data;
      } else {
        throw new Error('Clé de groupe non trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la clé de groupe:', error);
      throw new Error('Impossible de récupérer la clé de groupe');
    }
  }
}

export const encryptionService = new EncryptionService(); 