import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    title: "Bienvenue sur TripShare !",
    description: "Préparez-vous à vivre des expériences de voyage uniques et à les partager avec une communauté passionnée.",
    icon: "airplane-outline",
    color: "#FF6B6B"
  },
  {
    title: "Planifiez vos voyages",
    description: "Créez des itinéraires détaillés, trouvez les meilleurs spots et organisez vos activités en quelques clics.",
    icon: "map-outline",
    color: "#4ECDC4"
  },
  {
    title: "Partagez vos expériences",
    description: "Publiez vos photos, racontez vos aventures et inspirez d'autres voyageurs du monde entier.",
    icon: "share-social-outline",
    color: "#45B7D1"
  },
  {
    title: "Rejoignez la communauté",
    description: "Connectez-vous avec d'autres voyageurs, échangez des conseils et créez des souvenirs inoubliables.",
    icon: "people-outline",
    color: "#96CEB4"
  }
];

interface OnboardingScreenProps {
  onFinish?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const { isNewUser } = useSimpleAuth();
  const { theme, isDark } = useAppTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isNewUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthScreen' }],
      });
    }
  }, [isNewUser]);

  const handleContinue = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true
      });
    } else if (onFinish) {
      onFinish();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TravelPreferencesScreen' }],
      });
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary[0],
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

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
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <Ionicons 
            name={currentIndex === ONBOARDING_DATA.length - 1 ? "checkmark" : "arrow-forward"} 
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonIcon: {
    marginLeft: 8,
  }
});

export default OnboardingScreen; 