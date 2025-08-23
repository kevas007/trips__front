import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PlaneAnimation, BoatAnimation, TrainAnimation } from './TravelAnimations';

const { width, height } = Dimensions.get('window');

interface AIWelcomeScreenProps {
  onContinue: () => void;
  userName?: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  emoji: string;
  color: string;
  animation?: React.ComponentType<any>;
}

const FEATURES: FeatureCard[] = [
  {
    id: 'ai-recommendations',
    title: 'Recommandations IA',
    description: 'Des suggestions personnalisées basées sur vos préférences de voyage',
    icon: 'sparkles-outline',
    emoji: '🤖',
    color: '#9C27B0',
  },
  {
    id: 'smart-itinerary',
    title: 'Itinéraires Intelligents',
    description: 'Création automatique d\'itinéraires optimisés selon votre style',
    icon: 'map-outline',
    emoji: '🗺️',
    color: '#2196F3',
    animation: PlaneAnimation,
  },
  {
    id: 'social-travel',
    title: 'Voyage Social',
    description: 'Partagez vos aventures et découvrez celles des autres',
    icon: 'people-outline',
    emoji: '👥',
    color: '#4CAF50',
  },
  {
    id: 'real-time-tips',
    title: 'Conseils en Temps Réel',
    description: 'Obtenez des conseils contextuels pendant vos voyages',
    icon: 'bulb-outline',
    emoji: '💡',
    color: '#FF9800',
    animation: BoatAnimation,
  },
];

const AI_MESSAGES = [
  "Salut ! Je suis votre assistant voyage IA 🤖",
  "Je vais vous aider à créer des voyages inoubliables ✨",
  "Prêt à explorer le monde ensemble ? 🌍",
];

const AIWelcomeScreen: React.FC<AIWelcomeScreenProps> = ({ onContinue, userName = "Voyageur" }) => {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const typewriterAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    startWelcomeSequence();
  }, []);

  const startWelcomeSequence = () => {
    // Animation d'entrée
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
    ]).start(() => {
      startTypewriterEffect();
    });

    // Animation de scintillement
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startTypewriterEffect = () => {
    const showNextMessage = () => {
      if (currentMessageIndex < AI_MESSAGES.length - 1) {
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          Animated.timing(typewriterAnim, {
            toValue: currentMessageIndex + 1,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowFeatures(true);
          Animated.spring(featuresAnim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, 1500);
      }
    };

    showNextMessage();
  };

  const renderAIAvatar = () => (
    <Animated.View
      style={[
        styles.aiAvatar,
        {
          backgroundColor: `${theme.colors.primary[0]}20`,
          borderColor: theme.colors.primary[0],
          transform: [
            { scale: pulseAnim },
            {
              rotate: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '5deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.aiAvatarEmoji}>🤖</Text>
      
      {/* Particules scintillantes */}
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle1,
          {
            opacity: sparkleAnim,
            transform: [
              {
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle2,
          {
            opacity: sparkleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <Text style={styles.sparkleText}>⭐</Text>
      </Animated.View>
    </Animated.View>
  );

  const renderMessage = (message: string, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.messageContainer,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          opacity: index <= currentMessageIndex ? 1 : 0,
          transform: [
            {
              translateY: index <= currentMessageIndex ? 0 : 20,
            },
          ],
        },
      ]}
    >
      <Text style={[styles.messageText, { color: theme.colors.text.primary }]}>
        {message}
      </Text>
    </Animated.View>
  );

  const renderFeatureCard = (feature: FeatureCard, index: number) => (
    <Animated.View
      key={feature.id}
      style={[
        styles.featureCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
          borderColor: `${feature.color}30`,
          opacity: showFeatures ? 1 : 0,
          transform: [
            {
              translateY: featuresAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            {
              scale: featuresAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
        {feature.animation ? (
          <feature.animation size={32} color={feature.color} autoStart={showFeatures} />
        ) : (
          <Text style={styles.featureEmoji}>{feature.emoji}</Text>
        )}
      </View>
      
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
          {feature.title}
        </Text>
        <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
          {feature.description}
        </Text>
      </View>
      
      <View style={[styles.featureAccent, { backgroundColor: feature.color }]} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête avec animation */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.welcomeTitle, { color: theme.colors.text.primary }]}>
            Bienvenue {userName} ! 👋
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.colors.text.secondary }]}>
            Découvrez votre assistant voyage intelligent
          </Text>
        </Animated.View>

        {/* Avatar IA et messages */}
        <Animated.View
          style={[
            styles.aiSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderAIAvatar()}
          
          <View style={styles.messagesContainer}>
            {AI_MESSAGES.map((message, index) => renderMessage(message, index))}
          </View>
        </Animated.View>

        {/* Fonctionnalités */}
        {showFeatures && (
          <View style={styles.featuresSection}>
            <Text style={[styles.featuresTitle, { color: theme.colors.text.primary }]}>
              Ce que je peux faire pour vous :
            </Text>
            
            <View style={styles.featuresGrid}>
              {FEATURES.map((feature, index) => renderFeatureCard(feature, index))}
            </View>
          </View>
        )}

        {/* Bouton de continuation */}
        {showFeatures && (
          <Animated.View
            style={[
              styles.continueSection,
              {
                opacity: featuresAnim,
                transform: [
                  {
                    translateY: featuresAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: theme.colors.primary[0] },
              ]}
              onPress={onContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>
                Commencer mon profil voyage
              </Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={[styles.continueHint, { color: theme.colors.text.secondary }]}>
              Cela ne prendra que 2 minutes ⏱️
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  aiSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  aiAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  aiAvatarEmoji: {
    fontSize: 50,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -10,
    right: -10,
  },
  sparkle2: {
    bottom: -10,
    left: -10,
  },
  sparkleText: {
    fontSize: 20,
  },
  messagesContainer: {
    width: '100%',
    gap: 12,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 21,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    lineHeight: 17,
    opacity: 0.8,
  },
  featureAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  continueSection: {
    alignItems: 'center',
    gap: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  continueHint: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default AIWelcomeScreen; 