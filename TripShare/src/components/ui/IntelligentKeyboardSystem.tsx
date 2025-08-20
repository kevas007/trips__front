// ========== SYSTÈME DE CLAVIER INTELLIGENT OPTIMISÉ ==========
// Système qui s'adapte automatiquement aux besoins de chaque écran

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Animated,
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
  InteractionManager,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ========== TYPES ET INTERFACES ==========

interface KeyboardEvent {
  endCoordinates: {
    height: number;
    width: number;
  };
  duration: number;
  easing: string;
}

interface IntelligentKeyboardSystemProps {
  children: React.ReactNode;
  style?: ViewStyle;
  
  // Mode intelligent
  mode?: 'auto' | 'form' | 'chat' | 'modal' | 'gallery' | 'custom';
  
  // Configuration automatique
  autoDetect?: boolean;
  enableSmartOffset?: boolean;
  enableAdaptiveBehavior?: boolean;
  
  // Fonctionnalités
  enableTapToDismiss?: boolean;
  enableAnimations?: boolean;
  enableFocusManagement?: boolean;
  
  // Callbacks
  onKeyboardShow?: (event: KeyboardEvent) => void;
  onKeyboardHide?: (event: KeyboardEvent) => void;
  onFocusChange?: (isFocused: boolean, inputType?: string) => void;
  onLayoutChange?: (layout: any) => void;
  
  // Configuration personnalisée
  customOffset?: number;
  customBehavior?: 'height' | 'position' | 'padding';
}

// ========== DÉTECTION INTELLIGENTE AMÉLIORÉE ==========

const detectScreenType = (children: React.ReactNode): string => {
  // Analyse des composants enfants pour déterminer le type d'écran
  const childrenString = JSON.stringify(children);
  
  // Détection plus précise avec des patterns spécifiques
  if (childrenString.includes('TextInput') && childrenString.includes('Button')) {
    return 'form';
  }
  
  if (childrenString.includes('FlatList') && childrenString.includes('TextInput')) {
    return 'chat';
  }
  
  if (childrenString.includes('Modal') || childrenString.includes('overlay')) {
    return 'modal';
  }
  
  if (childrenString.includes('Image') && childrenString.includes('ScrollView')) {
    return 'gallery';
  }
  
  // Détection basée sur les props spécifiques
  if (childrenString.includes('keyboardType') || childrenString.includes('secureTextEntry')) {
    return 'form';
  }
  
  if (childrenString.includes('multiline') && childrenString.includes('FlatList')) {
    return 'chat';
  }
  
  return 'auto';
};

const getOptimalBehavior = (screenType: string, platform: string): 'height' | 'position' | 'padding' => {
  switch (screenType) {
    case 'form':
      return platform === 'ios' ? 'padding' : 'height';
    case 'chat':
      return 'height';
    case 'modal':
      return 'padding';
    case 'gallery':
      return 'position';
    default:
      return platform === 'ios' ? 'padding' : 'height';
  }
};

const calculateSmartOffset = (
  screenType: string, 
  keyboardHeight: number, 
  screenHeight: number,
  platform: string
): number => {
  // Supprimer toutes les marges qui créent l'espace blanc
  return 0;
};

// ========== COMPOSANT PRINCIPAL OPTIMISÉ ==========

export const IntelligentKeyboardSystem: React.FC<IntelligentKeyboardSystemProps> = ({
  children,
  style,
  
  // Mode intelligent
  mode = 'auto',
  autoDetect = true,
  enableSmartOffset = true,
  enableAdaptiveBehavior = true,
  
  // Fonctionnalités
  enableTapToDismiss = true,
  enableAnimations = Platform.OS === 'ios',
  enableFocusManagement = true,
  
  // Callbacks
  onKeyboardShow,
  onKeyboardHide,
  onFocusChange,
  onLayoutChange,
  
  // Configuration personnalisée
  customOffset,
  customBehavior,
}) => {
  // ========== ÉTAT LOCAL ==========
  
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [detectedScreenType, setDetectedScreenType] = useState<string>('auto');
  const [currentInputType, setCurrentInputType] = useState<string>('');
  const [layoutInfo, setLayoutInfo] = useState<any>({});
  
  // Animations optimisées
  const keyboardAnimation = useRef(new Animated.Value(0)).current;
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const layoutAnimation = useRef(new Animated.Value(0)).current;
  
  // ========== DÉTECTION AUTOMATIQUE AMÉLIORÉE ==========
  
  useEffect(() => {
    if (autoDetect && mode === 'auto') {
      const screenType = detectScreenType(children);
      setDetectedScreenType(screenType);
      console.log('🧠 IntelligentKeyboard - Type d\'écran détecté:', screenType);
    } else {
      setDetectedScreenType(mode);
    }
  }, [children, mode, autoDetect]);
  
  // ========== GESTION DU CLAVIER OPTIMISÉE ==========
  
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        const height = Math.max(0, event.endCoordinates.height);
        
        console.log('🧠 IntelligentKeyboard - Clavier affiché:', {
          height,
          duration: event.duration,
          screenType: detectedScreenType,
          platform: Platform.OS,
          inputType: currentInputType,
        });
        
        setIsKeyboardVisible(true);
        setKeyboardHeight(height);
        
        // Animation intelligente optimisée
        if (enableAnimations) {
          Animated.timing(keyboardAnimation, {
            toValue: 1,
            duration: event.duration || 250,
            useNativeDriver: false,
          }).start();
        }
        
        onKeyboardShow?.(event);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event: KeyboardEvent) => {
        console.log('🧠 IntelligentKeyboard - Clavier masqué:', {
          duration: event.duration,
          screenType: detectedScreenType,
          platform: Platform.OS,
        });
        
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        
        // Animation intelligente optimisée
        if (enableAnimations) {
          Animated.timing(keyboardAnimation, {
            toValue: 0,
            duration: event.duration || 250,
            useNativeDriver: false,
          }).start();
        }
        
        onKeyboardHide?.(event);
      }
    );

    return () => {
      keyboardWillShow?.remove();
      keyboardWillHide?.remove();
    };
  }, [enableAnimations, onKeyboardShow, onKeyboardHide, detectedScreenType, currentInputType]);

  // ========== GESTION DU FOCUS INTELLIGENTE AMÉLIORÉE ==========
  
  useEffect(() => {
    if (!enableFocusManagement) return;
    
    const handleFocus = () => {
      setIsFocused(true);
      onFocusChange?.(true, currentInputType);
      
      if (enableAnimations) {
        Animated.timing(focusAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      onFocusChange?.(false, currentInputType);
      
      if (enableAnimations) {
        Animated.timing(focusAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    };

    // Écouter les événements de focus globaux
    const focusListener = Keyboard.addListener('keyboardDidShow', handleFocus);
    const blurListener = Keyboard.addListener('keyboardDidHide', handleBlur);

    return () => {
      focusListener?.remove();
      blurListener?.remove();
    };
  }, [enableAnimations, onFocusChange, enableFocusManagement, currentInputType]);

  // ========== CALCULS INTELLIGENTS OPTIMISÉS ==========
  
  const getIntelligentBehavior = useCallback((): 'height' | 'position' | 'padding' => {
    if (customBehavior) return customBehavior;
    if (!enableAdaptiveBehavior) return Platform.OS === 'ios' ? 'padding' : 'height';
    
    return getOptimalBehavior(detectedScreenType, Platform.OS);
  }, [customBehavior, enableAdaptiveBehavior, detectedScreenType]);

  const getIntelligentOffset = useCallback((): number => {
    if (customOffset !== undefined) return customOffset;
    if (!enableSmartOffset) return 0;
    
    return calculateSmartOffset(detectedScreenType, keyboardHeight, screenHeight, Platform.OS);
  }, [customOffset, enableSmartOffset, detectedScreenType, keyboardHeight, screenHeight]);

  const getIntelligentAnimation = useCallback(() => {
    if (!enableAnimations) return {};
    
    const baseTransform = [];
    
    // Animation de translation intelligente optimisée
    if (keyboardHeight > 0) {
      const translationFactor = detectedScreenType === 'chat' ? 0.05 : 0.02;
      baseTransform.push({
        translateY: keyboardAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -Math.min(keyboardHeight * translationFactor, 15)],
        }),
      });
    }
    
    // Animation de focus intelligente optimisée
    if (isFocused) {
      baseTransform.push({
        scale: focusAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.01],
        }),
      });
    }
    
    // Animation de layout optimisée
    baseTransform.push({
      translateY: layoutAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
      }),
    });
    
    return {
      transform: baseTransform,
    };
  }, [enableAnimations, keyboardHeight, detectedScreenType, isFocused, keyboardAnimation, focusAnimation, layoutAnimation]);

  // ========== GESTION DU TAP TO DISMISS INTELLIGENTE AMÉLIORÉE ==========
  
  const handleTapToDismiss = useCallback(() => {
    if (enableTapToDismiss && isKeyboardVisible) {
      // Ne pas masquer automatiquement pour les chats
      if (detectedScreenType === 'chat') return;
      
      console.log('🧠 IntelligentKeyboard - Tap to dismiss intelligent activé');
      Keyboard.dismiss();
    }
  }, [enableTapToDismiss, isKeyboardVisible, detectedScreenType]);

  // ========== GESTION DU LAYOUT OPTIMISÉE ==========
  
  const handleLayout = useCallback((event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    const newLayoutInfo = { width, height, x, y };
    
    setLayoutInfo(newLayoutInfo);
    onLayoutChange?.(newLayoutInfo);
    
    // Animation de layout optimisée
    if (enableAnimations) {
      Animated.timing(layoutAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [onLayoutChange, enableAnimations]);

  // ========== RENDU CONDITIONNEL INTELLIGENT OPTIMISÉ ==========
  
  // Mode spécial pour les galeries (pas de KeyboardAvoidingView)
  if (detectedScreenType === 'gallery' && enableAdaptiveBehavior) {
    return (
      <TouchableWithoutFeedback onPress={handleTapToDismiss}>
        <Animated.View
          style={[
            styles.container, 
            style, 
            getIntelligentAnimation(), 
            { backgroundColor: 'transparent' }
          ]}
          onLayout={handleLayout}
        >
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  // ========== RENDU PRINCIPAL OPTIMISÉ ==========
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, style, { backgroundColor: 'transparent' }]}
      behavior={getIntelligentBehavior()}
      keyboardVerticalOffset={0} // Supprimer la marge qui crée l'espace blanc
      // Supprimer complètement le fond blanc
      contentContainerStyle={{ 
        flex: 1, 
        backgroundColor: 'transparent',
        // Forcer la transparence sur tous les éléments
        ...(Platform.OS === 'ios' && { backgroundColor: 'transparent' }),
        ...(Platform.OS === 'android' && { backgroundColor: 'transparent' }),
      }}
    >
      <TouchableWithoutFeedback onPress={handleTapToDismiss}>
        <Animated.View
          style={[styles.content, getIntelligentAnimation(), { backgroundColor: 'transparent' }]}
          onLayout={handleLayout}
        >
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// ========== COMPOSANTS SPÉCIALISÉS INTELLIGENTS OPTIMISÉS ==========

// Wrapper pour formulaires avec détection automatique
export const SmartFormWrapper: React.FC<Omit<IntelligentKeyboardSystemProps, 'mode'>> = (props) => (
  <IntelligentKeyboardSystem
    {...props}
    mode="form"
    enableSmartOffset={true}
    enableAdaptiveBehavior={true}
    enableFocusManagement={true}
  />
);

// Wrapper pour chats avec gestion intelligente
export const SmartChatWrapper: React.FC<Omit<IntelligentKeyboardSystemProps, 'mode'>> = (props) => (
  <IntelligentKeyboardSystem
    {...props}
    mode="chat"
    enableSmartOffset={true}
    enableAdaptiveBehavior={true}
    enableTapToDismiss={false} // Ne pas masquer automatiquement dans les chats
  />
);

// Wrapper pour modales avec adaptation intelligente
export const SmartModalWrapper: React.FC<Omit<IntelligentKeyboardSystemProps, 'mode'> & { modalVisible: boolean }> = ({ 
  modalVisible, 
  ...props 
}) => {
  if (!modalVisible) return null;
  
  return (
    <IntelligentKeyboardSystem
      {...props}
      mode="modal"
      enableSmartOffset={true}
      enableAdaptiveBehavior={true}
    />
  );
};

// Wrapper pour galeries avec comportement spécial
export const SmartGalleryWrapper: React.FC<Omit<IntelligentKeyboardSystemProps, 'mode'>> = (props) => (
  <IntelligentKeyboardSystem
    {...props}
    mode="gallery"
    enableSmartOffset={false}
    enableAdaptiveBehavior={true}
    enableTapToDismiss={true}
  />
);

// Wrapper auto-détectant optimisé
export const AutoKeyboardWrapper: React.FC<Omit<IntelligentKeyboardSystemProps, 'mode'>> = (props) => (
  <IntelligentKeyboardSystem
    {...props}
    mode="auto"
    autoDetect={true}
    enableSmartOffset={true}
    enableAdaptiveBehavior={true}
  />
);

// ========== STYLES OPTIMISÉS ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Supprimer complètement le fond blanc
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent', // Supprimer complètement le fond blanc
  },
});

// ========== EXPORTS ==========

export default IntelligentKeyboardSystem; 