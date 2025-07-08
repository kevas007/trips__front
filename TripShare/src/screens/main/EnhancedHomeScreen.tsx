import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { PlaneAnimation, BoatAnimation } from '../auth/TravelAnimations';
import { authService } from '../../services/auth';
import { tripShareApi } from '../../services/tripShareApi';

const { width } = Dimensions.get('window');

interface EnhancedHomeScreenProps {
  navigation: any;
}

interface UserProgress {
  level: number;
  xp: number;
  nextLevelXp: number;
  badges: string[];
  completedChallenges: number;
  totalChallenges: number;
}

interface TravelChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

interface AIRecommendation {
  id: string;
  type: 'destination' | 'activity' | 'trip';
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  aiScore: number;
  tags: string[];
  reason: string;
}

const EnhancedHomeScreen: React.FC<EnhancedHomeScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useSimpleAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcomeTips, setShowWelcomeTips] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Data state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 3,
    xp: 750,
    nextLevelXp: 1000,
    badges: ['🌍', '✈️', '📸', '🗺️'],
    completedChallenges: 7,
    totalChallenges: 12,
  });
  
  const [challenges, setChallenges] = useState<TravelChallenge[]>([
    {
      id: '1',
      title: 'Créez votre premier itinéraire',
      description: 'Utilisez l\'IA pour créer un voyage personnalisé',
      emoji: '🗺️',
      xpReward: 100,
      completed: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: '2',
      title: 'Photographe du monde',
      description: 'Partagez 5 photos de vos voyages',
      emoji: '📸',
      xpReward: 75,
      completed: false,
      progress: 2,
      maxProgress: 5,
    },
    {
      id: '3',
      title: 'Explorateur social',
      description: 'Suivez 10 autres voyageurs',
      emoji: '👥',
      xpReward: 50,
      completed: true,
      progress: 10,
      maxProgress: 10,
    },
  ]);

  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'destination',
      title: 'Bali, Indonésie',
      subtitle: 'Paradise tropical perfect for digital nomads',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
      rating: 4.8,
      aiScore: 0.95,
      tags: ['Tropical', 'Digital Nomad', 'Wellness'],
      reason: 'Basé sur votre intérêt pour les destinations tropicales et le work-life balance',
    },
    {
      id: '2',
      type: 'activity',
      title: 'Safari Kenya',
      subtitle: 'Adventure in the African savanna',
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400',
      rating: 4.9,
      aiScore: 0.88,
      tags: ['Wildlife', 'Adventure', 'Nature'],
      reason: 'Recommandé pour votre passion des aventures nature',
    },
  ]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const tipAnim = useRef(new Animated.Value(0)).current;

  const welcomeTips = [
    { title: 'Bienvenue !', text: 'Découvrez des voyages personnalisés grâce à l\'IA', emoji: '🤖' },
    { title: 'Défis voyage', text: 'Complétez des défis pour gagner des XP et débloquer des badges', emoji: '🏆' },
    { title: 'Communauté', text: 'Partagez vos aventures et inspirez d\'autres voyageurs', emoji: '🌍' },
  ];

  useEffect(() => {
    initializeAnimations();
    updateProgressAnimation();
  }, []);

  const initializeAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation des tips
    Animated.timing(tipAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const updateProgressAnimation = () => {
    Animated.timing(progressAnim, {
      toValue: userProgress.xp / userProgress.nextLevelXp,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulation du rafraîchissement des données
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const nextTip = () => {
    if (currentTipIndex < welcomeTips.length - 1) {
      setCurrentTipIndex(prev => prev + 1);
    } else {
      setShowWelcomeTips(false);
    }
  };

  const dismissTips = () => {
    setShowWelcomeTips(false);
  };

  // Fonction de test d'authentification pour diagnostiquer les problèmes
  const testAuthentication = async () => {
    try {
      Alert.alert('🔧 Test d\'Authentification', 'Démarrage des tests...');
      
      // Test 1: Vérifier le statut d'authentification
      const isAuth = authService.isAuthenticated();
      const token = authService.getToken();
      
      console.log('🔍 Test Auth Status:', { isAuth, hasToken: !!token });
      
      if (!isAuth || !token) {
        Alert.alert('❌ Non authentifié', 'Aucun token trouvé. Veuillez vous connecter.');
        return;
      }
      
      // Test 2: Vérifier le token avec le backend
      try {
        const user = await authService.verifyToken();
        Alert.alert('✅ Authentification OK', `Utilisateur: ${user.email}\nNom: ${user.name}`);
        console.log('✅ VerifyToken réussi:', user);
      } catch (verifyError: any) {
        console.error('❌ Erreur verifyToken:', verifyError);
        Alert.alert('❌ Erreur VerifyToken', `Erreur: ${verifyError.message}\nStatus: ${verifyError?.response?.status || 'N/A'}`);
      }
      
      // Test 3: Test avec TripShareApi
      try {
        const profile = await tripShareApi.getProfile();
        console.log('✅ TripShareApi réussi:', profile);
      } catch (apiError: any) {
        console.error('❌ Erreur TripShareApi:', apiError);
        Alert.alert('❌ Erreur TripShareApi', `Erreur: ${apiError.message}`);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur générale:', error);
      Alert.alert('❌ Erreur', `Erreur: ${error.message}`);
    }
  };

  const renderProgressSection = () => (
    <View style={[
      styles.progressSection,
      {
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }
    ]}>
      <View style={styles.progressHeader}>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelText, { color: theme.colors.text.primary }]}>
            Niveau {userProgress.level}
          </Text>
          <Text style={[styles.xpText, { color: theme.colors.text.secondary }]}>
            {userProgress.xp}/{userProgress.nextLevelXp} XP
          </Text>
        </View>
        
        <View style={styles.badgesContainer}>
          {userProgress.badges.map((badge, index) => (
            <Text key={index} style={styles.badge}>{badge}</Text>
          ))}
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: theme.colors.primary[0],
              },
            ]}
          />
        </View>
      </View>

      <Text style={[styles.progressSubtext, { color: theme.colors.text.secondary }]}>
        {userProgress.nextLevelXp - userProgress.xp} XP pour le niveau suivant
      </Text>
    </View>
  );

  const renderWelcomeTips = () => {
    if (!showWelcomeTips) return null;
    
    const currentTip = welcomeTips[currentTipIndex];
    
    return (
      <Animated.View
        style={[
          styles.tipsOverlay,
          {
            opacity: tipAnim,
            transform: [{ scale: tipAnim }],
          },
        ]}
      >
        <View style={[
          styles.tipCard,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
            borderColor: theme.colors.primary[0],
          }
        ]}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={dismissTips}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <Text style={styles.tipEmoji}>{currentTip.emoji}</Text>
          <Text style={[styles.tipTitle, { color: theme.colors.text.primary }]}>
            {currentTip.title}
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text.secondary }]}>
            {currentTip.text}
          </Text>

          <View style={styles.tipNavigation}>
            <View style={styles.tipDots}>
              {welcomeTips.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipDot,
                    {
                      backgroundColor: index === currentTipIndex 
                        ? theme.colors.primary[0] 
                        : theme.colors.text.secondary,
                    },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.tipNextButton, { backgroundColor: theme.colors.primary[0] }]}
              onPress={nextTip}
            >
              <Text style={styles.tipNextText}>
                {currentTipIndex === welcomeTips.length - 1 ? 'Commencer' : 'Suivant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderChallengeCard = (challenge: TravelChallenge) => (
    <TouchableOpacity
      key={challenge.id}
      style={[
        styles.challengeCard,
        {
          backgroundColor: challenge.completed 
            ? `${theme.colors.primary[0]}20` 
            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
          borderColor: challenge.completed 
            ? theme.colors.primary[0] 
            : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
        }
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
        <View style={styles.challengeInfo}>
          <Text style={[styles.challengeTitle, { color: theme.colors.text.primary }]}>
            {challenge.title}
          </Text>
          <Text style={[styles.challengeDescription, { color: theme.colors.text.secondary }]}>
            {challenge.description}
          </Text>
        </View>
        <View style={styles.challengeReward}>
          <Text style={[styles.xpReward, { color: theme.colors.primary[0] }]}>
            +{challenge.xpReward}
          </Text>
          <Text style={[styles.xpLabel, { color: theme.colors.text.secondary }]}>
            XP
          </Text>
        </View>
      </View>

      <View style={styles.challengeProgress}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
            {challenge.progress}/{challenge.maxProgress}
          </Text>
          {challenge.completed && (
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary[0]} />
          )}
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(challenge.progress / challenge.maxProgress) * 100}%`,
                backgroundColor: challenge.completed 
                  ? theme.colors.primary[0] 
                  : `${theme.colors.primary[0]}60`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAIRecommendation = (recommendation: AIRecommendation) => (
    <TouchableOpacity
      key={recommendation.id}
      style={[
        styles.recommendationCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.recommendationHeader}>
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>IA</Text>
          <Text style={[styles.aiScore, { color: theme.colors.primary[0] }]}>
            {Math.round(recommendation.aiScore * 100)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.recommendationTitle, { color: theme.colors.text.primary }]}>
        {recommendation.title}
      </Text>
      <Text style={[styles.recommendationSubtitle, { color: theme.colors.text.secondary }]}>
        {recommendation.subtitle}
      </Text>

      <View style={styles.recommendationMeta}>
        <View style={styles.rating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.ratingText, { color: theme.colors.text.primary }]}>
            {recommendation.rating}
          </Text>
        </View>
      </View>

      <Text style={[styles.aiReason, { color: theme.colors.text.secondary }]}>
        💡 {recommendation.reason}
      </Text>

      <View style={styles.tagsContainer}>
        {recommendation.tags.slice(0, 3).map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: `${theme.colors.primary[0]}20` }]}
          >
            <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Actions rapides
      </Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[
            styles.quickActionCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              borderColor: '#2196F3',
            }
          ]}
          onPress={() => navigation.navigate('SmartItinerary')}
        >
          <PlaneAnimation size={32} color="#2196F3" />
          <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
            Créer un itinéraire IA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              borderColor: '#4CAF50',
            }
          ]}
        >
          <Ionicons name="camera-outline" size={32} color="#4CAF50" />
          <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
            Partager une photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              borderColor: '#FF9800',
            }
          ]}
        >
          <BoatAnimation size={32} color="#FF9800" />
          <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
            Explorer la carte
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              borderColor: '#9C27B0',
            }
          ]}
        >
          <Ionicons name="people-outline" size={32} color="#9C27B0" />
          <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
            Rejoindre un groupe
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header personnalisé avec bg dégradé */}
      <View style={styles.mainHeader}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerGreeting}>
                Bonjour {user?.name || 'Voyageur'} ! 👋
              </Text>
              <Text style={styles.headerSubtitle}>
                Prêt pour votre prochaine aventure ?
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="notifications-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={testAuthentication}
              >
                <Ionicons name="bug-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-circle-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[0]}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Section progression */}
          {renderProgressSection()}

          {/* Actions rapides */}
          {renderQuickActions()}

          {/* Défis voyage */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Défis voyage 🏆
            </Text>
            <View style={styles.challengesContainer}>
              {challenges.map(renderChallengeCard)}
            </View>
          </View>

          {/* Recommandations IA */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Recommandations IA ✨
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsContainer}
            >
              {aiRecommendations.map(renderAIRecommendation)}
            </ScrollView>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Tips overlay */}
      {renderWelcomeTips()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  welcomeHeader: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 13,
    opacity: 0.8,
  },
  progressSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {},
  levelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 11,
    opacity: 0.8,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    fontSize: 24,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  challengesContainer: {
    gap: 12,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 11,
    opacity: 0.8,
  },
  challengeReward: {
    alignItems: 'center',
  },
  xpReward: {
    fontSize: 13,
    fontWeight: '700',
  },
  xpLabel: {
    fontSize: 9,
    opacity: 0.8,
  },
  challengeProgress: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationsContainer: {
    gap: 16,
  },
  recommendationCard: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  recommendationHeader: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9C27B0',
  },
  aiScore: {
    fontSize: 10,
    fontWeight: '700',
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 12,
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiReason: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tipCard: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    maxWidth: 320,
  },
  dismissButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
  tipEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  tipNavigation: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  tipDots: {
    flexDirection: 'row',
    gap: 8,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipNextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tipNextText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mainHeader: {
    height: 150,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    backgroundColor: '#008080',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 8,
  },
});

export default EnhancedHomeScreen; 