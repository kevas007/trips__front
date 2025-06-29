import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { PlaneAnimation, BoatAnimation } from '../auth/TravelAnimations';

const { width } = Dimensions.get('window');

interface SmartItineraryScreenProps {
  navigation: any;
  route: any;
}

interface AIRecommendation {
  id: string;
  type: 'destination' | 'activity' | 'restaurant' | 'accommodation';
  title: string;
  description: string;
  location: string;
  rating: number;
  priceRange: number;
  tags: string[];
  image?: string;
  aiReason: string;
  confidence: number;
}

interface ItineraryDay {
  day: number;
  date: string;
  recommendations: AIRecommendation[];
  estimatedCost: number;
  totalDuration: number;
}

const SmartItineraryScreen: React.FC<SmartItineraryScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [userPreferences] = useState(route.params?.preferences || {});
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const generationSteps = [
    { title: 'Analyse de vos préférences', emoji: '🤖', duration: 2000 },
    { title: 'Recherche de destinations', emoji: '🌍', duration: 1500 },
    { title: 'Optimisation des trajets', emoji: '🗺️', duration: 1800 },
    { title: 'Sélection d\'activités', emoji: '🎯', duration: 1200 },
    { title: 'Finalisation de l\'itinéraire', emoji: '✨', duration: 1000 },
  ];

  useEffect(() => {
    if (route.params?.autoGenerate) {
      generateSmartItinerary();
    }
    startInitialAnimations();
  }, []);

  const startInitialAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const generateSmartItinerary = async () => {
    setIsGenerating(true);
    setGenerationStep(0);

    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      
      // Animation de progression
      Animated.timing(progressAnim, {
        toValue: (i + 1) / generationSteps.length,
        duration: 500,
        useNativeDriver: false,
      }).start();

      // Simulation du temps de génération
      await new Promise(resolve => setTimeout(resolve, generationSteps[i].duration));
    }

    // Génération des données d'itinéraire (simulation)
    const mockItinerary = generateMockItinerary();
    setItinerary(mockItinerary);
    setIsGenerating(false);
  };

  const generateMockItinerary = (): ItineraryDay[] => {
    const mockRecommendations: AIRecommendation[] = [
      {
        id: '1',
        type: 'destination',
        title: 'Tour Eiffel',
        description: 'Monument emblématique de Paris avec vue panoramique',
        location: 'Champ de Mars, Paris',
        rating: 4.8,
        priceRange: 2,
        tags: ['Monument', 'Vue', 'Photo'],
        aiReason: 'Basé sur votre intérêt pour la culture et les monuments historiques',
        confidence: 0.95,
      },
      {
        id: '2',
        type: 'restaurant',
        title: 'Le Comptoir du Relais',
        description: 'Cuisine française authentique dans le 6ème arrondissement',
        location: '9 Carrefour de l\'Odéon, Paris',
        rating: 4.6,
        priceRange: 3,
        tags: ['Gastronomie', 'Local', 'Traditionnel'],
        aiReason: 'Recommandé pour votre passion pour la gastronomie française',
        confidence: 0.88,
      },
      {
        id: '3',
        type: 'activity',
        title: 'Croisière sur la Seine',
        description: 'Découverte de Paris depuis la Seine au coucher du soleil',
        location: 'Port de la Bourdonnais, Paris',
        rating: 4.7,
        priceRange: 2,
        tags: ['Bateau', 'Romantique', 'Vue'],
        aiReason: 'Parfait pour votre style de voyage confort et vos transports préférés',
        confidence: 0.92,
      },
    ];

    return [
      {
        day: 1,
        date: '15 Mars 2024',
        recommendations: mockRecommendations,
        estimatedCost: 150,
        totalDuration: 8,
      },
    ];
  };

  const renderGenerationProgress = () => (
    <View style={styles.generationContainer}>
      <Animated.View
        style={[
          styles.aiRobot,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.robotEmoji}>🤖</Text>
      </Animated.View>

      <Text style={[styles.generationTitle, { color: theme.colors.text.primary }]}>
        Génération de votre itinéraire IA
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
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
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          {Math.round((generationStep + 1) / generationSteps.length * 100)}%
        </Text>
      </View>

      <View style={styles.stepsContainer}>
        {generationSteps.map((step, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepItem,
              {
                opacity: index <= generationStep ? 1 : 0.3,
                backgroundColor: index === generationStep 
                  ? `${theme.colors.primary[0]}20` 
                  : 'transparent',
              },
            ]}
          >
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
            <Text style={[
              styles.stepText,
              { color: theme.colors.text.primary },
              index === generationStep && { fontWeight: '700' }
            ]}>
              {step.title}
            </Text>
            {index <= generationStep && (
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={theme.colors.primary[0]} 
                style={styles.checkIcon}
              />
            )}
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderRecommendationCard = (recommendation: AIRecommendation) => (
    <TouchableOpacity
      key={recommendation.id}
      style={[
        styles.recommendationCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.typeIcon,
          { backgroundColor: getTypeColor(recommendation.type) + '20' }
        ]}>
          <Ionicons
            name={getTypeIcon(recommendation.type)}
            size={24}
            color={getTypeColor(recommendation.type)}
          />
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            {recommendation.title}
          </Text>
          <Text style={[styles.cardLocation, { color: theme.colors.text.secondary }]}>
            {recommendation.location}
          </Text>
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={[styles.confidenceText, { color: theme.colors.primary[0] }]}>
            {Math.round(recommendation.confidence * 100)}%
          </Text>
          <Text style={[styles.confidenceLabel, { color: theme.colors.text.secondary }]}>
            IA
          </Text>
        </View>
      </View>

      <Text style={[styles.cardDescription, { color: theme.colors.text.secondary }]}>
        {recommendation.description}
      </Text>

      <View style={styles.cardMeta}>
        <View style={styles.rating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.ratingText, { color: theme.colors.text.primary }]}>
            {recommendation.rating}
          </Text>
        </View>

        <View style={styles.priceRange}>
          {Array.from({ length: 3 }, (_, i) => (
            <Text
              key={i}
              style={[
                styles.priceSymbol,
                {
                  color: i < recommendation.priceRange 
                    ? theme.colors.primary[0] 
                    : theme.colors.text.disabled
                }
              ]}
            >
              €
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.aiReason}>
        <Ionicons name="bulb-outline" size={16} color={theme.colors.primary[0]} />
        <Text style={[styles.aiReasonText, { color: theme.colors.text.secondary }]}>
          {recommendation.aiReason}
        </Text>
      </View>

      <View style={styles.tagsContainer}>
        {recommendation.tags.map((tag, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              { backgroundColor: `${theme.colors.primary[0]}20` }
            ]}
          >
            <Text style={[styles.tagText, { color: theme.colors.primary[0] }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderItineraryDay = (day: ItineraryDay) => (
    <View key={day.day} style={styles.dayContainer}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayTitle, { color: theme.colors.text.primary }]}>
          Jour {day.day}
        </Text>
        <Text style={[styles.dayDate, { color: theme.colors.text.secondary }]}>
          {day.date}
        </Text>
      </View>

      <View style={styles.dayStats}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary[0]} />
          <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
            {day.totalDuration}h
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="card-outline" size={20} color={theme.colors.primary[0]} />
          <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
            ~{day.estimatedCost}€
          </Text>
        </View>
      </View>

      <View style={styles.recommendationsContainer}>
        {day.recommendations.map(renderRecommendationCard)}
      </View>
    </View>
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'destination': return 'location-outline';
      case 'activity': return 'compass-outline';
      case 'restaurant': return 'restaurant-outline';
      case 'accommodation': return 'bed-outline';
      default: return 'bookmark-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'destination': return '#2196F3';
      case 'activity': return '#FF9800';
      case 'restaurant': return '#F44336';
      case 'accommodation': return '#4CAF50';
      default: return '#9C27B0';
    }
  };

  const handleSaveItinerary = () => {
    Alert.alert(
      'Sauvegarder l\'itinéraire',
      'Voulez-vous sauvegarder cet itinéraire généré par l\'IA ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Sauvegarder', 
          onPress: () => {
            // Logique de sauvegarde
            Alert.alert('Succès', 'Itinéraire sauvegardé !');
          }
        },
      ]
    );
  };

  const handleRegenerateItinerary = () => {
    Alert.alert(
      'Régénérer l\'itinéraire',
      'Voulez-vous générer un nouvel itinéraire avec l\'IA ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Régénérer', onPress: generateSmartItinerary },
      ]
    );
  };

  if (isGenerating) {
    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderGenerationProgress()}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              Votre Itinéraire IA ✨
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
              Personnalisé selon vos préférences
            </Text>
          </View>

          {itinerary.length > 0 ? (
            <>
              {itinerary.map(renderItineraryDay)}
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    { backgroundColor: theme.colors.primary[0] }
                  ]}
                  onPress={handleSaveItinerary}
                >
                  <Ionicons name="bookmark" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Sauvegarder</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.regenerateButton,
                    { 
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.primary[0],
                      borderWidth: 2,
                    }
                  ]}
                  onPress={handleRegenerateItinerary}
                >
                  <Ionicons name="refresh" size={20} color={theme.colors.primary[0]} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.primary[0] }]}>
                    Régénérer
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🗺️</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                Aucun itinéraire généré
              </Text>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  { backgroundColor: theme.colors.primary[0] }
                ]}
                onPress={generateSmartItinerary}
              >
                <Text style={styles.generateButtonText}>Générer mon itinéraire IA</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  generationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  aiRobot: {
    marginBottom: 30,
  },
  robotEmoji: {
    fontSize: 80,
  },
  generationTitle: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepsContainer: {
    width: '100%',
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  stepEmoji: {
    fontSize: 21,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  dayContainer: {
    marginBottom: 30,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 13,
    opacity: 0.8,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsContainer: {
    gap: 16,
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 11,
    opacity: 0.8,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  cardDescription: {
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 16,
    opacity: 0.8,
  },
  cardMeta: {
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
  priceRange: {
    flexDirection: 'row',
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  aiReasonText: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  regenerateButton: {},
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
  },
  generateButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SmartItineraryScreen; 