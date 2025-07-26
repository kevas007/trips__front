import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design-system';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

interface ChatGroup {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  memberCount: number;
  unreadCount?: number;
}

interface ChatCommunity {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  memberCount: number;
  unreadCount?: number;
}

const mockPrivateChats: ChatContact[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    lastMessage: 'Salut ! Comment ça va ?',
    timestamp: '14:30',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Thomas Martin',
    lastMessage: 'Très bien, merci ! Et toi ?',
    timestamp: '14:32',
  },
  {
    id: '3',
    name: 'Sophie Bernard',
    lastMessage: 'Super ! Tu pars bientôt en voyage ?',
    timestamp: '14:33',
    unreadCount: 1,
  },
];

const mockGroups: ChatGroup[] = [
  {
    id: '1',
    name: 'Voyage Paris 2024',
    lastMessage: 'Thomas: On se retrouve à 10h ?',
    timestamp: '14:30',
    memberCount: 8,
    unreadCount: 5,
  },
  {
    id: '2',
    name: 'Amis Voyageurs',
    lastMessage: 'Marie: Qui part en Italie cet été ?',
    timestamp: '14:32',
    memberCount: 12,
  },
  {
    id: '3',
    name: 'Backpackers Europe',
    lastMessage: 'Sophie: Photos du Mont-Saint-Michel !',
    timestamp: '14:33',
    memberCount: 25,
    unreadCount: 3,
  },
];

const mockCommunities: ChatCommunity[] = [
  {
    id: '1',
    name: 'Voyageurs France',
    lastMessage: 'Nouveau membre: Bienvenue Sarah !',
    timestamp: '14:30',
    memberCount: 1250,
    unreadCount: 12,
  },
  {
    id: '2',
    name: 'Photographes Voyage',
    lastMessage: 'Nouveau post: Sunset à Bali',
    timestamp: '14:32',
    memberCount: 890,
  },
  {
    id: '3',
    name: 'Budget Travel',
    lastMessage: 'Nouveau conseil: Voyager pas cher',
    timestamp: '14:33',
    memberCount: 2100,
    unreadCount: 8,
  },
];

type ChatTabType = 'pv' | 'groupes' | 'communautes';

const ChatScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChatTabType>('pv');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const tabs = [
    { key: 'pv' as ChatTabType, label: 'PV', icon: 'person' },
    { key: 'groupes' as ChatTabType, label: 'Groupes', icon: 'people' },
    { key: 'communautes' as ChatTabType, label: 'Communautés', icon: 'globe' },
  ];

  const renderPrivateChat = ({ item }: { item: ChatContact }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={COLORS.neutral[400]} />
        </View>
        {item.unreadCount && item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: ChatGroup }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, styles.groupAvatar]}>
          <Ionicons name="people" size={24} color={COLORS.neutral[400]} />
        </View>
        {item.unreadCount && item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.timestamp}</Text>
        </View>
        <View style={styles.chatDetails}>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          <Text style={styles.memberCount}>{item.memberCount} membres</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCommunity = ({ item }: { item: ChatCommunity }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, styles.communityAvatar]}>
          <Ionicons name="globe" size={24} color={COLORS.neutral[400]} />
        </View>
        {item.unreadCount && item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.timestamp}</Text>
        </View>
        <View style={styles.chatDetails}>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          <Text style={styles.memberCount}>{item.memberCount} membres</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.key ? '#008080' : COLORS.neutral[500]} 
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && { color: '#008080' }
            ]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <View style={styles.tabIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleCreateNew = () => {
    switch (activeTab) {
      case 'pv':
        Alert.alert(
          'Nouvelle conversation',
          'Créer une nouvelle conversation privée ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Créer', 
              onPress: () => {
                // Ici on pourrait naviguer vers un écran de sélection de contact
                Alert.alert('Succès', 'Nouvelle conversation privée créée !');
              }
            }
          ]
        );
        break;
      case 'groupes':
        Alert.alert(
          'Nouveau groupe',
          'Créer un nouveau groupe de discussion ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Créer', 
              onPress: () => {
                // Ici on pourrait naviguer vers un écran de création de groupe
                Alert.alert('Succès', 'Nouveau groupe créé !');
              }
            }
          ]
        );
        break;
      case 'communautes':
        Alert.alert(
          'Nouvelle communauté',
          'Créer une nouvelle communauté ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Créer', 
              onPress: () => {
                // Ici on pourrait naviguer vers un écran de création de communauté
                Alert.alert('Succès', 'Nouvelle communauté créée !');
              }
            }
          ]
        );
        break;
    }
  };

  const getFloatingButtonIcon = () => {
    switch (activeTab) {
      case 'pv':
        return 'person-add';
      case 'groupes':
        return 'people';
      case 'communautes':
        return 'add-circle';
      default:
        return 'add';
    }
  };

  const getFloatingButtonText = () => {
    switch (activeTab) {
      case 'pv':
        return 'Nouvelle conversation';
      case 'groupes':
        return 'Nouveau groupe';
      case 'communautes':
        return 'Nouvelle communauté';
      default:
        return 'Créer';
    }
  };

  const filterData = (data: any[], query: string) => {
    if (!query.trim()) return data;
    
    const lowerQuery = query.toLowerCase();
    return data.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.lastMessage.toLowerCase().includes(lowerQuery)
    );
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'pv':
        return filterData(mockPrivateChats, searchQuery);
      case 'groupes':
        return filterData(mockGroups, searchQuery);
      case 'communautes':
        return filterData(mockCommunities, searchQuery);
      default:
        return [];
    }
  };

  const renderContent = () => {
    const filteredData = getFilteredData();
    
    switch (activeTab) {
      case 'pv':
        return (
          <FlatList
            data={filteredData}
            renderItem={renderPrivateChat}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            ListEmptyComponent={
              searchQuery ? (
                <View style={styles.emptySearchContainer}>
                  <Ionicons name="search-outline" size={64} color={COLORS.neutral[400]} />
                  <Text style={styles.emptySearchTitle}>Aucun résultat trouvé</Text>
                  <Text style={styles.emptySearchSubtitle}>
                    Aucune conversation ne correspond à "{searchQuery}"
                  </Text>
                </View>
              ) : null
            }
          />
        );
      case 'groupes':
        return (
          <FlatList
            data={filteredData}
            renderItem={renderGroup}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            ListEmptyComponent={
              searchQuery ? (
                <View style={styles.emptySearchContainer}>
                  <Ionicons name="search-outline" size={64} color={COLORS.neutral[400]} />
                  <Text style={styles.emptySearchTitle}>Aucun résultat trouvé</Text>
                  <Text style={styles.emptySearchSubtitle}>
                    Aucun groupe ne correspond à "{searchQuery}"
                  </Text>
                </View>
              ) : null
            }
          />
        );
      case 'communautes':
        return (
          <FlatList
            data={filteredData}
            renderItem={renderCommunity}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            ListEmptyComponent={
              searchQuery ? (
                <View style={styles.emptySearchContainer}>
                  <Ionicons name="search-outline" size={64} color={COLORS.neutral[400]} />
                  <Text style={styles.emptySearchTitle}>Aucun résultat trouvé</Text>
                  <Text style={styles.emptySearchSubtitle}>
                    Aucune communauté ne correspond à "{searchQuery}"
                  </Text>
                </View>
              ) : null
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsSearching(!isSearching)}
        >
          <Ionicons name={isSearching ? "close" : "search"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      {isSearching && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.neutral[500]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={COLORS.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.neutral[500]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Onglets */}
      {renderTabs()}

      {/* Contenu */}
      {renderContent()}

      {/* Bouton flottant */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleCreateNew}
        activeOpacity={0.8}
      >
        <Ionicons name={getFloatingButtonIcon() as any} size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButton: {
    padding: 8,
  },
  
  // Onglets
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    position: 'relative',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    borderBottomColor: '#008080',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[500],
    marginLeft: 6,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#008080',
  },

  // Liste des chats
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatar: {
    backgroundColor: '#E3F2FD',
  },
  communityAvatar: {
    backgroundColor: '#F3E5F5',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  
  // Bouton flottant
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#008080',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Barre de recherche
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },

  // État vide de recherche
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySearchSubtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatScreen; 