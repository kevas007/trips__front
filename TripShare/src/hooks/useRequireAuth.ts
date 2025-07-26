import { useEffect, useRef } from 'react';
import { authService } from '../services/auth';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

export function useRequireAuth() {
  const hasCheckedRef = useRef(false);
  const { logout, isAuthenticated, user } = useSimpleAuth();

  useEffect(() => {
    const checkAuth = async () => {
      // Éviter les vérifications multiples
      if (hasCheckedRef.current) return;
      
      hasCheckedRef.current = true;
      
      try {
        console.log('🔍 useRequireAuth - Vérification:', { isAuthenticated, hasUser: !!user });
        
        // Si déjà authentifié via le contexte, pas besoin de vérifier
        if (isAuthenticated && user) {
          console.log('✅ useRequireAuth - Utilisateur déjà authentifié');
          return;
        }
        
        // Vérifier le token local
        const isAuth = authService.isAuthenticated();
        console.log('🔍 useRequireAuth - Token local:', isAuth);
        
        if (!isAuth) {
          console.log('❌ useRequireAuth - Aucun token, déconnexion');
          await logout();
          return;
        }

        // Vérifier la validité du token avec le serveur seulement si nécessaire
        try {
          await authService.verifyToken();
          console.log('✅ useRequireAuth - Token valide');
        } catch (error) {
          console.log('❌ useRequireAuth - Token invalide, déconnexion');
          await logout();
        }
      } catch (error) {
        console.error('❌ useRequireAuth - Erreur:', error);
        await logout();
      }
    };
    
    checkAuth();
  }, []); // Pas de dépendances pour éviter les re-exécutions
} 