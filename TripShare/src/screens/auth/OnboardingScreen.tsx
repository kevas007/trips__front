import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

const { width } = Dimensions.get('window');

type OnboardingNavigationProp = StackNavigationProp<OnboardingStackParamList>;

interface OnboardingScreenProps {
  onFinish?: () => void;
}

const ONBOARDING_DATA = [
  {
    title: 'Bienvenue sur TripShare !',
    description: 'Découvrez le monde et partagez vos aventures avec une communauté passionnée de voyageurs.',
    icon: 'globe',
    color: '#008080',
  },
  {
    title: 'Planifiez vos voyages',
    description: 'Créez des itinéraires personnalisés et organisez vos voyages étape par étape.',
    icon: 'map',
    color: '#4CAF50',
  },
  {
    title: 'Partagez vos expériences',
    description: 'Publiez vos photos, vidéos et récits de voyage pour inspirer d\'autres aventuriers.',
    icon: 'camera',
    color: '#FF9800',
  },
  {
    title: 'Rejoignez la communauté',
    description: 'Connectez-vous avec des voyageurs du monde entier et découvrez de nouvelles destinations.',
    icon: 'people',
    color: '#9C27B0',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish: _onFinish }) => {
  const { isNewUser, completeOnboarding } = useAuthStore();
  const { theme } = useAppTheme();
  const navigation = useNavigation<OnboardingNavigationProp>();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Debug logs
  console.log('🎯 OnboardingScreen - Rendu du composant');
  console.log('🎯 OnboardingScreen - État:', { isNewUser, currentIndex });

  useEffect(() => {
    console.log('🎯 OnboardingScreen - useEffect déclenché, isNewUser:', isNewUser);
    
    if (!isNewUser) {
      console.log('🎯 OnboardingScreen - Utilisateur pas nouveau, redirection vers l\'accueil');
      // L'utilisateur a terminé l'onboarding, il sera redirigé vers l'accueil
      completeOnboarding();
    } else {
      console.log('🎯 OnboardingScreen - Nouvel utilisateur confirmé, affichage de l\'onboarding');
    }
  }, [isNewUser, completeOnboarding]);

  const handleContinue = () => {
    console.log('🎯 OnboardingScreen - Bouton continuer pressé, index actuel:', currentIndex);
    
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const newIndex = currentIndex + 1;
      console.log('🎯 OnboardingScreen - Passage à l\'étape suivante:', newIndex);
      setCurrentIndex(newIndex);
      scrollViewRef.current?.scrollTo({
        x: width * newIndex,
        animated: true
      });
    } else {
      console.log('🎯 OnboardingScreen - Fin de l\'onboarding, navigation vers les préférences de voyage');
      // Naviguer vers l'écran des préférences de voyage au lieu de terminer l'onboarding
      navigation.navigate('TravelPreferencesScreen');
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {ONBOARDING_DATA.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                  backgroundColor: index === currentIndex ? theme.colors.primary[0] : theme.colors.text.secondary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (!isNewUser) {
    console.log('🎯 OnboardingScreen - Pas un nouvel utilisateur, affichage conditionnel');
    return null;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          console.log('🎯 OnboardingScreen - Scroll terminé, nouvel index:', newIndex);
          setCurrentIndex(newIndex);
        }}
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <Animated.View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={80} color="white" />
            </Animated.View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{item.title}</Text>
            <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
              {item.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {renderDots()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Continuer' : 'Suivant'}
          </Text>
          <Ionicons 
            name={currentIndex === ONBOARDING_DATA.length - 1 ? "arrow-forward" : "arrow-forward"} 
            size={20} 
            color="white" 
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default OnboardingScreen; 