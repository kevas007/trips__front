import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Keyboard,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  IntelligentKeyboardSystem,
  SmartFormWrapper,
  SmartChatWrapper,
  SmartModalWrapper,
  SmartGalleryWrapper,
  AutoKeyboardWrapper
} from './IntelligentKeyboardSystem';

// Données de test pour les différents modes
const testMessages = [
  { id: '1', text: 'Salut ! Comment ça va ?', isMe: true },
  { id: '2', text: 'Très bien, merci ! Et toi ?', isMe: false },
  { id: '3', text: 'Parfait ! On se voit bientôt ?', isMe: true },
];

const testImages = [
  { id: '1', uri: 'https://picsum.photos/300/200?random=1' },
  { id: '2', uri: 'https://picsum.photos/300/200?random=2' },
  { id: '3', uri: 'https://picsum.photos/300/200?random=3' },
];

export const IntelligentKeyboardTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState<'auto' | 'form' | 'chat' | 'modal' | 'gallery'>('auto');
  const [modalVisible, setModalVisible] = useState(false);

  const testIntelligentKeyboard = () => {
    Alert.alert(
      '🧠 Test Système Intelligent',
      `Mode: ${selectedMode}\nEmail: ${email}\nPassword: ${password}\nMessage: ${message}\nPlateforme: ${Platform.OS}`,
      [{ text: 'Parfait !' }]
    );
  };

  const renderKeyboardWrapper = () => {
    const commonProps = {
      onKeyboardShow: (event: any) => {
        console.log('🧠 IntelligentKeyboard - Clavier affiché:', {
          height: event.endCoordinates.height,
          screenType: selectedMode,
          platform: Platform.OS,
        });
      },
      onKeyboardHide: (event: any) => {
        console.log('🧠 IntelligentKeyboard - Clavier masqué:', {
          duration: event.duration,
          screenType: selectedMode,
        });
      },
      onFocusChange: (isFocused: boolean, inputType?: string) => {
        console.log('🧠 IntelligentKeyboard - Focus changé:', { isFocused, inputType });
      },
      onLayoutChange: (layout: any) => {
        console.log('🧠 IntelligentKeyboard - Layout changé:', layout);
      },
    };

    switch (selectedMode) {
      case 'form':
        return (
          <SmartFormWrapper {...commonProps}>
            {renderFormContent()}
          </SmartFormWrapper>
        );

      case 'chat':
        return (
          <SmartChatWrapper {...commonProps}>
            {renderChatContent()}
          </SmartChatWrapper>
        );

      case 'modal':
        return (
          <SmartModalWrapper {...commonProps} modalVisible={modalVisible}>
            {renderModalContent()}
          </SmartModalWrapper>
        );

      case 'gallery':
        return (
          <SmartGalleryWrapper {...commonProps}>
            {renderGalleryContent()}
          </SmartGalleryWrapper>
        );

      case 'auto':
      default:
        return (
          <AutoKeyboardWrapper {...commonProps}>
            {renderAutoContent()}
          </AutoKeyboardWrapper>
        );
    }
  };

  const renderFormContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>📝 Mode Formulaire Intelligent</Text>
      <Text style={styles.subtitle}>
        Détection automatique des champs de saisie
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre email..."
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe:</Text>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre mot de passe..."
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity style={styles.testButton} onPress={testIntelligentKeyboard}>
        <Text style={styles.buttonText}>🧪 Tester le Formulaire</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderChatContent = () => (
    <View style={styles.chatContainer}>
      <FlatList
        data={testMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.isMe ? styles.myMessage : styles.otherMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        style={styles.messagesList}
      />
      
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Tapez votre message..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => {
            if (message.trim()) {
              console.log('Message envoyé:', message);
              setMessage('');
            }
          }}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModalContent = () => (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>📱 Mode Modale Intelligent</Text>
      <Text style={styles.subtitle}>
        Gestion intelligente des modales
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Commentaire:</Text>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre commentaire..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.buttonText}>❌ Fermer Modale</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGalleryContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>🖼️ Mode Galerie Intelligent</Text>
      <Text style={styles.subtitle}>
        Comportement spécial pour les galeries
      </Text>

      {testImages.map((image) => (
        <Image
          key={image.id}
          source={{ uri: image.uri }}
          style={styles.galleryImage}
          resizeMode="cover"
        />
      ))}

      <TouchableOpacity style={styles.testButton} onPress={testIntelligentKeyboard}>
        <Text style={styles.buttonText}>🧪 Tester la Galerie</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAutoContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>🤖 Mode Auto-Détection</Text>
      <Text style={styles.subtitle}>
        Le système détecte automatiquement le type d'écran
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Recherche:</Text>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre recherche..."
          placeholderTextColor="#999"
          returnKeyType="search"
        />
      </View>

      <TouchableOpacity style={styles.testButton} onPress={testIntelligentKeyboard}>
        <Text style={styles.buttonText}>🧪 Tester l'Auto-Détection</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Sélecteur de mode */}
      <View style={styles.modeSelector}>
        <Text style={styles.modeTitle}>Mode Intelligent:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
          {[
            { key: 'auto', label: 'Auto', color: '#007AFF' },
            { key: 'form', label: 'Formulaire', color: '#34C759' },
            { key: 'chat', label: 'Chat', color: '#AF52DE' },
            { key: 'modal', label: 'Modale', color: '#FF9500' },
            { key: 'gallery', label: 'Galerie', color: '#FF3B30' },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.modeButton,
                { backgroundColor: mode.color },
                selectedMode === mode.key && styles.modeButtonActive,
              ]}
              onPress={() => setSelectedMode(mode.key as any)}
            >
              <Text style={styles.modeButtonText}>{mode.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bouton pour tester la modale */}
      {selectedMode === 'modal' && (
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <Text style={styles.buttonText}>
            {modalVisible ? '❌ Fermer Modale' : '📱 Ouvrir Modale'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Contenu principal avec wrapper intelligent */}
      {renderKeyboardWrapper()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modeSelector: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  modeScroll: {
    flexDirection: 'row',
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  modeButtonActive: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour le chat
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 18,
  },
  // Styles pour la modale
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  // Styles pour la galerie
  galleryImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
}); 