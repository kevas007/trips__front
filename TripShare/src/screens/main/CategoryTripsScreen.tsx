import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { api } from '../../services/api';
import { Trip } from '../../types/trip';
import TripCard from '../../components/Home/TripCard';

interface CategoryTripsScreenProps {
  route: {
    params: {
      category: string;
      categoryName: string;
    };
  };
  navigation: any;
}

const CategoryTripsScreen: React.FC<CategoryTripsScreenProps> = ({ route, navigation }) => {
  const { category, categoryName } = route.params;
  const { theme, isDark } = useAppTheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTrips = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }

      const response = await api.getTripsByCategory(category, pageNum, 10);
      if (response.success && response.data) {
        const newTrips = response.data as Trip[];
        
        if (refresh) {
          setTrips(newTrips || []);
        } else {
          setTrips(prev => [...(prev || []), ...(newTrips || [])]);
        }

        setHasMore(newTrips.length === 10);
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des voyages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips(1, true);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await loadTrips(page);
  };

  useEffect(() => {
    loadTrips(1, true);
  }, [category]);

  const renderTrip = ({ item }: { item: Trip }) => (
    <TripCard
      trip={item}
      theme={theme}
      navigation={navigation}
      onDuplicate={(trip) => {
        // TODO: Implémenter la duplication
        console.log('Dupliquer le voyage:', trip.title);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {categoryName}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          {trips.length} voyages trouvés
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="compass-outline" 
        size={64} 
        color={theme.colors.text.secondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Aucun voyage trouvé
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Aucun voyage n'a été trouvé dans la catégorie "{categoryName}"
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary[0]} />
        <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
          Chargement...
        </Text>
      </View>
    );
  };

  if (loading && trips.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[0]} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Chargement des voyages...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[0]]}
            tintColor={theme.colors.primary[0]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default CategoryTripsScreen; 