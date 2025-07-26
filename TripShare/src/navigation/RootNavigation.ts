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
      // Essayer de naviguer vers Auth
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Auth' as never }],
    });
    } catch (error) {
      console.warn('⚠️ Impossible de naviguer vers Auth, tentative de reload...');
      // En cas d'échec, forcer un reload de l'app
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }
  } else {
    console.warn('⚠️ Navigation pas prête, attente...');
    // Attendre que la navigation soit prête
    setTimeout(() => resetToAuth(), 100);
  }
} 