import { useCallback, useRef } from 'react';

// Type pour les callbacks de rafraîchissement
type RefreshCallback = () => void;

// Hook global pour gérer les rafraîchissements
export const useGlobalRefresh = () => {
  const refreshCallbacks = useRef<Map<string, RefreshCallback>>(new Map());

  // Enregistrer un callback de rafraîchissement
  const registerRefreshCallback = useCallback((key: string, callback: RefreshCallback) => {
    console.log(`🔄 useGlobalRefresh - Enregistrement du callback: ${key}`);
    refreshCallbacks.current.set(key, callback);
  }, []);

  // Désenregistrer un callback de rafraîchissement
  const unregisterRefreshCallback = useCallback((key: string) => {
    console.log(`🔄 useGlobalRefresh - Désenregistrement du callback: ${key}`);
    refreshCallbacks.current.delete(key);
  }, []);

  // Déclencher tous les rafraîchissements
  const triggerGlobalRefresh = useCallback(() => {
    console.log('🔄 useGlobalRefresh - Déclenchement du rafraîchissement global');
    refreshCallbacks.current.forEach((callback, key) => {
      try {
        console.log(`🔄 useGlobalRefresh - Exécution du callback: ${key}`);
        callback();
      } catch (error) {
        console.error(`❌ useGlobalRefresh - Erreur dans le callback ${key}:`, error);
      }
    });
  }, []);

  // Déclencher un rafraîchissement spécifique
  const triggerSpecificRefresh = useCallback((key: string) => {
    const callback = refreshCallbacks.current.get(key);
    if (callback) {
      console.log(`🔄 useGlobalRefresh - Déclenchement du rafraîchissement spécifique: ${key}`);
      try {
        callback();
      } catch (error) {
        console.error(`❌ useGlobalRefresh - Erreur dans le callback ${key}:`, error);
      }
    } else {
      console.warn(`⚠️ useGlobalRefresh - Callback non trouvé pour la clé: ${key}`);
    }
  }, []);

  return {
    registerRefreshCallback,
    unregisterRefreshCallback,
    triggerGlobalRefresh,
    triggerSpecificRefresh,
  };
};
