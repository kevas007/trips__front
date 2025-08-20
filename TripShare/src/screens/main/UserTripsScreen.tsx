import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design-system';
import { UserTripsScreenStyles as styles } from './UserTripsScreenStyles';

interface UserTripsScreenProps {
  userTrips: any[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onGoBack: () => void;
  onTripPress?: (trip: any) => void;
}

type TabType = 'all' | 'planned' | 'active' | 'completed' | 'saved';

const UserTripsScreen: React.FC<UserTripsScreenProps> = ({
  userTrips,
  loading,
  error,
  refreshing,
  onRefresh,
  onGoBack,
  onTripPress,
}) => {
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [pressedCard, setPressedCard] = useState<string | null>(null);

  console.log('🎯 UserTripsScreen - Props reçues:');
  console.log('  - userTrips:', userTrips);
  console.log('  - userTrips length:', userTrips?.length);
  console.log('  - loading:', loading);
  console.log('  - error:', error);

  // Fonction pour gérer le chargement des images
  const handleImageLoad = (tripId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [tripId]: false }));
  };

  const handleImageError = (tripId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [tripId]: false }));
  };

  // Fonction pour obtenir l'icône et la couleur selon le statut
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planned':
      case 'draft':
        return { 
          icon: 'calendar', 
          color: '#FF6B35', 
          bgColor: '#FFF8E1',
          placeholderImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
        };
      case 'active':
      case 'ongoing':
        return { 
          icon: 'play-circle', 
          color: '#4CAF50', 
          bgColor: '#E8F5E8',
          placeholderImage: 'http://localhost:8085/storage/defaults/default-trip-image.jpg'
        };
      case 'completed':
      case 'finished':
        return { 
          icon: 'checkmark-circle', 
          color: '#2196F3', 
          bgColor: '#E3F2FD',
          placeholderImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
        };
      case 'saved':
      case 'bookmarked':
        return { 
          icon: 'bookmark', 
          color: '#9C27B0', 
          bgColor: '#F3E5F5',
          placeholderImage: 'http://localhost:8085/storage/defaults/default-trip-image.jpg'
        };
      default:
        return { 
          icon: 'airplane', 
          color: '#666666', 
          bgColor: '#F5F5F5',
          placeholderImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
        };
    }
  };

  // Fonction pour formater la localisation
  const formatLocation = (location: any): string => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      if (location.city && location.country) {
        return `${location.city}, ${location.country}`;
      }
      if (location.country) return location.country;
      if (location.city) return location.city;
      return 'Localisation inconnue';
    }
    return String(location);
  };

  // Fonction pour filtrer les voyages selon l'onglet actif
  const getFilteredTrips = (): any[] => {
    switch (activeTab) {
      case 'planned':
        return userTrips.filter(trip => trip.status === 'planned' || trip.status === 'draft');
      case 'active':
        return userTrips.filter(trip => trip.status === 'active' || trip.status === 'ongoing');
      case 'completed':
        return userTrips.filter(trip => trip.status === 'completed' || trip.status === 'finished');
      case 'saved':
        return userTrips.filter(trip => trip.status === 'saved' || trip.status === 'bookmarked');
      default:
        return userTrips;
    }
  };

  // Configuration des onglets
  const tabs: { key: TabType; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'Tous', icon: 'grid', color: '#008080' },
    { key: 'planned', label: 'À faire', icon: 'calendar', color: '#FF6B35' },
    { key: 'active', label: 'En cours', icon: 'play-circle', color: '#4CAF50' },
    { key: 'completed', label: 'Terminés', icon: 'checkmark-circle', color: '#2196F3' },
    { key: 'saved', label: 'Sauvegardés', icon: 'bookmark', color: '#9C27B0' },
  ];

  // Fonction pour rendre une carte de voyage
  const renderTripCard = (trip: any) => {
    console.log('🎯 renderTripCard - Trip:', trip);
    console.log('  - title:', trip.title);
    console.log('  - name:', trip.name);
    console.log('  - location:', trip.location);
    console.log('  - location type:', typeof trip.location);
    
    const statusConfig = getStatusConfig(trip.status);
    const hasImage = trip.cover_image_url || trip.image_url;
    const isImageLoading = imageLoadingStates[trip.id];
    const isPressed = pressedCard === trip.id;

    return (
      <TouchableOpacity
        key={trip.id}
        style={[
          styles.tripCard,
          isPressed && styles.tripCardPressed
        ]}
        onPress={() => onTripPress?.(trip)}
        onPressIn={() => setPressedCard(trip.id)}
        onPressOut={() => setPressedCard(null)}
        activeOpacity={0.9}
      >
        <View style={styles.tripImageContainer}>
          {hasImage ? (
            <>
              <Image
                source={{ uri: trip.cover_image_url || trip.image_url }}
                style={styles.tripImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [trip.id]: true }))}
                onLoad={() => handleImageLoad(trip.id)}
                onError={() => handleImageError(trip.id)}
              />
              {isImageLoading && (
                <View style={styles.imageLoadingIndicator}>
                  <ActivityIndicator size="small" color={statusConfig.color} />
                </View>
              )}
            </>
          ) : (
            <View style={[styles.tripImagePlaceholder, { backgroundColor: statusConfig.bgColor }]}>
              <Image
                source={{ uri: statusConfig.placeholderImage }}
                style={styles.tripImage}
                resizeMode="cover"
              />
              <View style={styles.placeholderOverlay}>
                <Ionicons name={statusConfig.icon as any} size={32} color={statusConfig.color} />
              </View>
            </View>
          )}
          
          {/* Badge de statut */}
          <View style={styles.tripImageOverlay}>
            <View style={styles.statusBadge}>
              <Ionicons name={statusConfig.icon as any} size={16} color="white" />
            </View>
          </View>

          {/* Overlay avec titre */}
          <View style={styles.tripTitleOverlay}>
            <Text style={styles.tripTitleText} numberOfLines={1}>
              {String(trip.title || trip.name || 'Voyage sans titre')}
            </Text>
            {trip.location && (
              <Text style={styles.tripLocationText} numberOfLines={1}>
                📍 {formatLocation(trip.location)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Rendu des onglets
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
              { borderBottomColor: tab.color }
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.key ? tab.color : COLORS.neutral[500]} 
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && { color: tab.color }
            ]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <View style={[styles.tabIndicator, { backgroundColor: tab.color }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Chargement des voyages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredTrips = getFilteredTrips();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, onGoBack.toString() === '() => {}' && { justifyContent: 'center' }]}>
        {onGoBack.toString() !== '() => {}' && (
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Mes Voyages</Text>
        {onGoBack.toString() !== '() => {}' && <View style={styles.headerSpacer} />}
      </View>

      {/* Onglets */}
      {renderTabs()}

      {/* Contenu */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredTrips.length}</Text>
            <Text style={styles.statLabel}>
              {activeTab === 'all' ? 'Voyages créés' : 
               activeTab === 'planned' ? 'Voyages à faire' :
               activeTab === 'active' ? 'Voyages en cours' :
               activeTab === 'completed' ? 'Voyages terminés' :
               'Voyages sauvegardés'}
            </Text>
          </View>
        </View>

        {/* Galerie des voyages */}
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane-outline" size={80} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'all' ? 'Aucun voyage créé' :
               activeTab === 'planned' ? 'Aucun voyage à faire' :
               activeTab === 'active' ? 'Aucun voyage en cours' :
               activeTab === 'completed' ? 'Aucun voyage terminé' :
               'Aucun voyage sauvegardé'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' ? 'Commencez par créer votre premier voyage pour le voir apparaître ici !' :
               'Les voyages de cette catégorie apparaîtront ici.'}
            </Text>
          </View>
        ) : (
          <View style={styles.galleryContainer}>
            <View style={styles.tripsGrid}>
              {filteredTrips.map(renderTripCard)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserTripsScreen; 