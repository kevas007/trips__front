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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { PlaneAnimation, BoatAnimation, TrainAnimation } from '../TravelAnimations';

const { width } = Dimensions.get('window');

interface TravelOnboardingStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

// Options améliorées avec émojis et couleurs
const TRAVEL_STYLES = [
  { key: 'luxury', label: 'Luxe', icon: 'diamond-outline', emoji: '💎', color: '#FFD700' },
  { key: 'comfort', label: 'Confort', icon: 'bed-outline', emoji: '🛏️', color: '#4CAF50' },
  { key: 'budget', label: 'Économique', icon: 'wallet-outline', emoji: '💰', color: '#FF9800' },
  { key: 'adventure', label: 'Aventure', icon: 'compass-outline', emoji: '🏔️', color: '#F44336' },
];

const TRANSPORT_PREFERENCES = [
  { key: 'plane', label: 'Avion', emoji: '✈️', component: PlaneAnimation },
  { key: 'train', label: 'Train', emoji: '🚂', component: TrainAnimation },
  { key: 'car', label: 'Voiture', emoji: '🚗', component: null },
  { key: 'boat', label: 'Bateau', emoji: '🚢', component: BoatAnimation },
];

const INTERESTS = [
  { key: 'culture', label: 'Culture', emoji: '🏛️', color: '#9C27B0' },
  { key: 'nature', label: 'Nature', emoji: '🌿', color: '#4CAF50' },
  { key: 'food', label: 'Gastronomie', emoji: '🍽️', color: '#FF5722' },
  { key: 'adventure', label: 'Aventure', emoji: '🏃‍♂️', color: '#FF9800' },
  { key: 'history', label: 'Histoire', emoji: '📚', color: '#795548' },
  { key: 'art', label: 'Art', emoji: '🎨', color: '#E91E63' },
  { key: 'nightlife', label: 'Vie nocturne', emoji: '🌙', color: '#673AB7' },
  { key: 'wellness', label: 'Bien-être', emoji: '🧘‍♀️', color: '#00BCD4' },
];

const CLIMATE_PREFERENCES = [
  { key: 'tropical', label: 'Tropical', emoji: '🌴', color: '#4CAF50' },
  { key: 'temperate', label: 'Tempéré', emoji: '🌸', color: '#2196F3' },
  { key: 'cold', label: 'Froid', emoji: '❄️', color: '#00BCD4' },
  { key: 'desert', label: 'Désert', emoji: '🏜️', color: '#FF9800' },
];

const TravelOnboardingStep: React.FC<TravelOnboardingStepProps> = ({ onNext, initialData = {} }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    travelStyle: initialData.travelStyle || '',
    transportPreferences: initialData.transportPreferences || [],
    interests: initialData.interests || [],
    climatePreferences: initialData.climatePreferences || [],
    budgetRange: initialData.budgetRange || 'medium',
    groupPreference: initialData.groupPreference || 'flexible',
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { title: 'Style de voyage', subtitle: 'Comment aimez-vous voyager ?' },
    { title: 'Transport favori', subtitle: 'Quel moyen de transport préférez-vous ?' },
    { title: 'Centres d\'intérêt', subtitle: 'Qu\'est-ce qui vous passionne ?' },
    { title: 'Climat idéal', subtitle: 'Dans quel environnement vous sentez-vous bien ?' },
  ];

  useEffect(() => {
    animateStepTransition();
    updateProgress();
  }, [currentStep]);

  const animateStepTransition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateProgress = () => {
    const newProgress = (currentStep + 1) / steps.length;
    setProgress(newProgress);
    
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleSelection = (key: string, value: any, isArray = false) => {
    setFormData(prev => ({
      ...prev,
      [key]: isArray ? toggleArrayItem(prev[key] as string[], value) : value,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Animation de célébration avant de terminer
      Animated.spring(celebrationAnim, {
        toValue: 1,
        tension: 50,
        friction: 4,
        useNativeDriver: true,
      }).start(() => {
        onNext(formData);
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderProgressBar = () => (
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
      <Text style={[styles.progressText, { color: theme.colors.text.primary }]}>
        {currentStep + 1} / {steps.length}
      </Text>
    </View>
  );

  const renderOptionCard = (
    option: any,
    isSelected: boolean,
    onPress: () => void,
    showAnimation = false
  ) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.optionCard,
        {
          backgroundColor: isSelected
            ? `${option.color || theme.colors.primary[0]}20`
            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
          borderColor: isSelected
            ? (option.color || theme.colors.primary[0])
            : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionContent}>
        {showAnimation && option.component ? (
          <option.component size={32} autoStart={isSelected} />
        ) : (
          <Text style={styles.optionEmoji}>{option.emoji}</Text>
        )}
        <Text style={[
          styles.optionLabel,
          { color: theme.colors.text.primary },
          isSelected && { fontWeight: '700' }
        ]}>
          {option.label}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={option.color || theme.colors.primary[0]}
            style={styles.checkmark}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Style de voyage
        return (
          <View style={styles.optionsGrid}>
            {TRAVEL_STYLES.map(style =>
              renderOptionCard(
                style,
                formData.travelStyle === style.key,
                () => handleSelection('travelStyle', style.key)
              )
            )}
          </View>
        );

      case 1: // Transport
        return (
          <View style={styles.optionsGrid}>
            {TRANSPORT_PREFERENCES.map(transport =>
              renderOptionCard(
                transport,
                formData.transportPreferences.includes(transport.key),
                () => handleSelection('transportPreferences', transport.key, true),
                true
              )
            )}
          </View>
        );

      case 2: // Intérêts
        return (
          <View style={styles.optionsGrid}>
            {INTERESTS.map(interest =>
              renderOptionCard(
                interest,
                formData.interests.includes(interest.key),
                () => handleSelection('interests', interest.key, true)
              )
            )}
          </View>
        );

      case 3: // Climat
        return (
          <View style={styles.optionsGrid}>
            {CLIMATE_PREFERENCES.map(climate =>
              renderOptionCard(
                climate,
                formData.climatePreferences.includes(climate.key),
                () => handleSelection('climatePreferences', climate.key, true)
              )
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.travelStyle !== '';
      case 1: return formData.transportPreferences.length > 0;
      case 2: return formData.interests.length > 0;
      case 3: return formData.climatePreferences.length > 0;
      default: return true;
    }
  };

  return (
    <View style={styles.container}>
      {renderProgressBar()}
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
            {steps[currentStep].title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
            {steps[currentStep].subtitle}
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.text.secondary }]}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text.secondary} />
              <Text style={[styles.backButtonText, { color: theme.colors.text.secondary }]}>
                Retour
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: canProceed() ? theme.colors.primary[0] : theme.colors.text.disabled,
                flex: currentStep === 0 ? 1 : 0.7,
              },
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </Text>
            <Ionicons 
              name={currentStep === steps.length - 1 ? "checkmark" : "arrow-forward"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Animation de célébration */}
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.celebrationText}>🎉</Text>
        <Text style={[styles.celebrationMessage, { color: theme.colors.text.primary }]}>
          Profil voyage créé !
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  optionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
  },
  backButton: {
    flex: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  celebrationText: {
    fontSize: 80,
    marginBottom: 20,
  },
  celebrationMessage: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default TravelOnboardingStep; 