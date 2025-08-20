import { createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function resetToAuth() {
  if (navigationRef.isReady()) {
    try {
      console.log('🔄 RootNavigation - resetToAuth appelée');
      
      // Vérifier l'état actuel de la navigation
      const currentState = navigationRef.getState();
      console.log('🔍 État navigation actuel:', JSON.stringify(currentState, null, 2));
      
      // Reset vers l'écran Auth du stack principal
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
      
      console.log('✅ Reset vers Auth réussi');
    } catch (error) {
      console.warn('⚠️ Erreur lors du reset vers Auth:', error);
      
      // Tentative alternative : naviguer vers AuthScreen dans AuthNavigator
      try {
        navigationRef.navigate('Auth' as never, { screen: 'AuthScreen' } as never);
        console.log('✅ Navigation alternative vers Auth réussie');
      } catch (fallbackError) {
        console.warn('⚠️ Navigation alternative échouée aussi:', fallbackError);
        
        // Dernière tentative : reload si on est sur web
        if (typeof window !== 'undefined' && window.location) {
          console.log('🔄 Forcer le reload de la page...');
          window.location.reload();
        }
      }
    }
  } else {
    console.warn('⚠️ Navigation pas prête, attente...');
    // Attendre que la navigation soit prête
    setTimeout(() => resetToAuth(), 100);
  }
} 