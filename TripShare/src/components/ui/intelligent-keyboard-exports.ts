// ========== EXPORTS DU SYSTÈME DE CLAVIER INTELLIGENT ==========

// Composant principal
export { default as IntelligentKeyboardSystem } from './IntelligentKeyboardSystem';
export { 
  IntelligentKeyboardSystem as KeyboardSystem,
  SmartFormWrapper,
  SmartChatWrapper,
  SmartModalWrapper,
  SmartGalleryWrapper,
  AutoKeyboardWrapper
} from './IntelligentKeyboardSystem';

// Composant de test
export { IntelligentKeyboardTest } from './IntelligentKeyboardTest';

// ========== GUIDE D'UTILISATION ==========
// 🧠 SYSTÈME DE CLAVIER INTELLIGENT
//
// 1. AUTO-DÉTECTION (Recommandé)
//    import { AutoKeyboardWrapper } from '@/components/ui/intelligent-keyboard-exports';
//    
//    <AutoKeyboardWrapper>
//      {/* Le système détecte automatiquement le type d'écran */}
//    </AutoKeyboardWrapper>
//
// 2. MODES SPÉCIALISÉS
//    
//    FORMULAIRES:
//    import { SmartFormWrapper } from '@/components/ui/intelligent-keyboard-exports';
//    
//    <SmartFormWrapper>
//      <ScrollView keyboardShouldPersistTaps="always">
//        {/* Vos champs de saisie */}
//      </ScrollView>
//    </SmartFormWrapper>
//
//    CHATS:
//    import { SmartChatWrapper } from '@/components/ui/intelligent-keyboard-exports';
//    
//    <SmartChatWrapper>
//      <FlatList>
//        {/* Messages */}
//      </FlatList>
//      <TextInput />
//    </SmartChatWrapper>
//
//    MODALES:
//    import { SmartModalWrapper } from '@/components/ui/intelligent-keyboard-exports';
//    
//    <SmartModalWrapper modalVisible={isVisible}>
//      {/* Contenu de la modale */}
//    </SmartModalWrapper>
//
//    GALERIES:
//    import { SmartGalleryWrapper } from '@/components/ui/intelligent-keyboard-exports';
//    
//    <SmartGalleryWrapper>
//      <ScrollView>
//        {/* Images */}
//      </ScrollView>
//    </SmartGalleryWrapper>
//
// 3. CONFIGURATION AVANCÉE
//    import { IntelligentKeyboardSystem } from '@/components/ui/intelligent-keyboard-exports';
//    
//    <IntelligentKeyboardSystem
//      mode="custom"
//      enableSmartOffset={true}
//      enableAdaptiveBehavior={true}
//      enableAnimations={true}
//      onKeyboardShow={(event) => console.log('Clavier affiché:', event)}
//      onFocusChange={(isFocused, inputType) => console.log('Focus:', isFocused)}
//    >
//      {/* Votre contenu */}
//    </IntelligentKeyboardSystem>
//
// 4. TEST ET VALIDATION
//    import { IntelligentKeyboardTest } from '@/components/ui/intelligent-keyboard-exports';
//    
//    // Pour tester tous les modes du système intelligent
//    <IntelligentKeyboardTest />
//
// ========== FONCTIONNALITÉS INTELLIGENTES ==========
// ✅ AUTO-DÉTECTION: Analyse automatique du contenu pour déterminer le type d'écran
// ✅ COMPORTEMENT ADAPTATIF: Ajuste automatiquement le comportement selon le type d'écran
// ✅ OFFSET INTELLIGENT: Calcule automatiquement le meilleur offset selon la plateforme
// ✅ GESTION DU FOCUS: Suit automatiquement les changements de focus
// ✅ ANIMATIONS INTELLIGENTES: Animations adaptées selon le contexte
// ✅ TAP TO DISMISS: Comportement intelligent (désactivé pour les chats)
// ✅ LOGS DÉTAILLÉS: Informations complètes pour le débogage
// ✅ PERFORMANCE OPTIMISÉE: Calculs optimisés et mise en cache 