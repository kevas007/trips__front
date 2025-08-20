# 🔧 Guide de Diagnostic - Problèmes d'Authentification TripShare

## 📋 Problèmes Identifiés

Après analyse du code, voici les problèmes principaux identifiés dans le système d'authentification :

### 1. 🔄 Problèmes de Synchronisation des Tokens
- **Problème**: Multiples services d'authentification (`authService`, `ApiService`, `UnifiedApiService`) avec des tokens non synchronisés
- **Impact**: Incohérences entre les services, tokens expirés non gérés uniformément
- **Symptômes**: Erreurs 401 intermittentes, déconnexions inattendues

### 2. 🚫 Gestion Incohérente des Erreurs 401
- **Problème**: Chaque service gère différemment les erreurs d'authentification
- **Impact**: Expérience utilisateur inconsistante, boucles de refresh infinies
- **Symptômes**: "Session expirée" répétées, redirections multiples

### 3. 🔁 Problèmes de Refresh Token
- **Problème**: Logique de refresh token dupliquée dans plusieurs services
- **Impact**: Conflits lors du rafraîchissement simultané
- **Symptômes**: Erreurs "Token refresh failed", déconnexions forcées

### 4. 🌐 Configuration API Inconsistante
- **Problème**: URLs et configurations différentes entre services
- **Impact**: Requêtes vers de mauvais endpoints
- **Symptômes**: Erreurs de connexion, timeouts

### 5. 📱 Problèmes de Navigation
- **Problème**: Navigation auth/main non synchronisée avec l'état d'authentification
- **Impact**: Utilisateurs coincés sur de mauvais écrans
- **Symptômes**: Écrans blancs, navigation bloquée

## 🔍 Outils de Diagnostic

### 1. Composant de Test Intégré
```typescript
// Déjà disponible dans: src/components/examples/AuthTestComponent.tsx
import { AuthTestComponent } from '../components/examples/AuthTestComponent';

// Utilisation dans EnhancedHomeScreen
const testAuthentication = async () => {
  // Tests automatisés disponibles
};
```

### 2. Commandes de Debug Console
```javascript
// Dans la console du navigateur ou debugger
console.log('🔍 Auth Status:', authService.isAuthenticated());
console.log('🔑 Token:', authService.getToken());
console.log('📱 User:', authService.getCurrentUser());
```

### 3. Vérification des Logs
```bash
# Rechercher les erreurs d'auth dans les logs
grep -r "❌.*[Aa]uth" TripShare/src/
grep -r "401" TripShare/src/
grep -r "Token" TripShare/src/
```

## 🛠️ Solutions Recommandées

### 1. ✅ Centraliser la Gestion des Tokens
**Problème**: Services multiples avec tokens désynchronisés
**Solution**: Utiliser uniquement `authService` comme source de vérité

```typescript
// ❌ AVANT: Chaque service gère ses propres tokens
class ApiService {
  private token: string | null = null;
  // ...
}

// ✅ APRÈS: Tous les services utilisent authService
class ApiService {
  private getToken() {
    return authService.getToken();
  }
}
```

### 2. ✅ Unifier la Gestion des Erreurs 401
**Problème**: Logique de refresh dupliquée
**Solution**: Intercepteur centralisé

```typescript
// ✅ Solution: Intercepteur unique dans authService
const handleUnauthorized = async (originalRequest) => {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      await authService.refreshAccessToken();
      // Retry toutes les requêtes en attente
    } catch {
      await authService.logout();
      resetToAuth();
    } finally {
      isRefreshing = false;
    }
  }
};
```

### 3. ✅ Améliorer la Vérification des Tokens
**Problème**: Tokens expirés non détectés
**Solution**: Vérification proactive

```typescript
// ✅ Vérification avant chaque requête importante
const checkTokenValidity = async () => {
  if (!token) return false;
  
  try {
    await authService.verifyToken();
    return true;
  } catch {
    await authService.logout();
    return false;
  }
};
```

### 4. ✅ Synchroniser Navigation et Auth
**Problème**: Navigation désynchronisée
**Solution**: Listeners d'état auth

```typescript
// ✅ Dans AuthNavigator
useEffect(() => {
  const unsubscribe = authService.onAuthStateChanged((user) => {
    if (!user) {
      navigation.reset({ routes: [{ name: 'AuthScreen' }] });
    } else if (user.isNewUser) {
      navigation.reset({ routes: [{ name: 'OnboardingScreen' }] });
    }
  });
  return unsubscribe;
}, []);
```

## 🚀 Plan d'Action Immédiat

### Phase 1: Diagnostic (5 min)
1. Ouvrir l'app et tester la connexion
2. Vérifier les logs console pour les erreurs
3. Utiliser `AuthTestComponent` pour tester les endpoints
4. Noter les erreurs spécifiques

### Phase 2: Corrections Critiques (15 min)
1. Corriger la configuration API si nécessaire
2. Synchroniser les tokens entre services
3. Améliorer la gestion des erreurs 401
4. Tester la navigation auth

### Phase 3: Tests (5 min)
1. Tester connexion/déconnexion
2. Tester refresh token
3. Tester navigation entre écrans
4. Vérifier la persistance des sessions

## 📞 Support Rapide

### Erreurs Communes et Solutions

#### ❌ "Session expirée" en boucle
```typescript
// Vérifier dans authService.ts ligne 325+
if (error?.response?.status === 401 && this.refreshToken) {
  // S'assurer que le refresh ne boucle pas
  if (!isRefreshing) {
    // Logique de refresh
  }
}
```

#### ❌ Navigation bloquée
```typescript
// Vérifier dans AuthNavigator.tsx ligne 20+
useEffect(() => {
  if (!isAuthenticated) {
    navigation.reset({ /* ... */ });
  }
}, [isAuthenticated]);
```

#### ❌ Erreurs de connexion réseau
```typescript
// Vérifier dans config/api.ts ligne 25+
const CURRENT_ENV = 'network'; // ou 'localhost'
```

## 🔧 Commandes de Dépannage

```bash
# Redémarrer le serveur backend
cd tripshare-backend && npm run dev

# Nettoyer le cache React Native
npx react-native start --reset-cache

# Vérifier les logs backend
tail -f tripshare-backend/logs/app.log

# Tester l'API directement
curl -X POST http://localhost:8085/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

**Note**: Ce guide est basé sur l'analyse du code actuel. Les corrections spécifiques seront implémentées selon les erreurs identifiées lors du diagnostic. 