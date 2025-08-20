# 🔐 Configuration Authentification Sociale - TripShare

Ce guide vous explique comment configurer l'authentification avec **Apple** (iOS) et **Google** (Android) dans votre application TripShare.

## 📱 Fonctionnalités Implémentées

- ✅ **Apple Sign-In** pour iOS
- ✅ **Google Sign-In** pour Android  
- ✅ **Détection automatique** de la plateforme
- ✅ **Interface adaptative** selon iOS/Android
- ✅ **Gestion d'erreurs** complète
- ✅ **Types TypeScript** complets

---

## 🚀 Configuration Rapide

### 1. Configuration Google (Android)

#### Étape 1: Google Cloud Console
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - **Google+ API**
   - **Google Sign-In API**

#### Étape 2: Créer les identifiants OAuth 2.0
```bash
# Types d'identifiants nécessaires :
- Application Android (SHA-1 de votre keystore)
- Application iOS (Bundle ID)
- Application Web (pour backend)
```

#### Étape 3: Fichiers de configuration
Téléchargez et placez les fichiers :
```
android/app/google-services.json     # Configuration Android
ios/GoogleService-Info.plist        # Configuration iOS
```

#### Étape 4: Mettre à jour la configuration
Éditez `src/config/socialAuth.config.ts` :
```typescript
export const SOCIAL_AUTH_CONFIG = {
  google: {
    webClientId: 'VOTRE_WEB_CLIENT_ID.googleusercontent.com',
    iosClientId: 'VOTRE_IOS_CLIENT_ID.googleusercontent.com',
    androidClientId: 'VOTRE_ANDROID_CLIENT_ID.googleusercontent.com',
    // ...
  }
};
```

### 2. Configuration Apple (iOS)

#### Étape 1: Apple Developer Console
1. Allez sur [Apple Developer](https://developer.apple.com/account/resources/identifiers/)
2. Configurez votre **App ID** avec la capability **Sign In with Apple**
3. Créez un **Service ID** (optionnel pour mobile)

#### Étape 2: Configuration dans Expo
Le plugin `expo-apple-authentication` est déjà configuré dans `app.json`.

#### Étape 3: Mettre à jour la configuration
```typescript
export const SOCIAL_AUTH_CONFIG = {
  apple: {
    serviceId: 'com.votreapp.tripshare', // Votre Bundle ID
  }
};
```

---

## 🔧 Instructions Détaillées

### Google Sign-In Configuration

#### 1. Obtenir le SHA-1 de votre keystore
```bash
# Debug keystore (développement)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production keystore
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

#### 2. Configuration Android OAuth
```
Application type: Android app
Package name: com.votreapp.tripshare
SHA-1 certificate fingerprint: [VOTRE_SHA1]
```

#### 3. Configuration iOS OAuth
```
Application type: iOS app
Bundle ID: com.votreapp.tripshare
```

#### 4. Configuration Web OAuth (pour backend)
```
Application type: Web application
Authorized origins: https://votre-domaine.com
Authorized redirect URIs: https://votre-domaine.com/auth/google/callback
```

### Apple Sign-In Configuration

#### 1. App ID Configuration
```
Identifier: com.votreapp.tripshare
Capabilities: ✅ Sign In with Apple
```

#### 2. Service ID (optionnel)
```
Identifier: com.votreapp.tripshare.service
Primary App ID: com.votreapp.tripshare
Website URLs: https://votre-domaine.com
Return URLs: https://votre-domaine.com/auth/apple/callback
```

---

## 📱 Utilisation dans le Code

### Bouton d'authentification automatique
```typescript
import SocialAuthButton from '../components/auth/SocialAuthButton';

<SocialAuthButton
  onSuccess={handleSocialAuthSuccess}
  onError={handleSocialAuthError}
  disabled={isLoading}
  fullWidth
/>
```

### Gestion des résultats
```typescript
const handleSocialAuthSuccess = async (result: SocialAuthResult) => {
  console.log('Provider:', result.provider); // 'google' ou 'apple'
  console.log('User:', result.name);
  console.log('Email:', result.email);
  console.log('ID Token:', result.idToken);
  
  // Connexion avec votre backend
  await login({
    email: result.email,
    socialAuth: {
      provider: result.provider,
      idToken: result.idToken,
      // ...
    }
  });
};
```

### Interface adaptative
Le bouton s'adapte automatiquement selon la plateforme :

- **iOS** : Bouton noir "Continuer avec Apple" + icône Apple
- **Android** : Bouton blanc "Continuer avec Google" + icône Google

---

## 🛠️ Backend Integration

### Vérification des tokens côté serveur

#### Google ID Token
```go
// Exemple en Go
func verifyGoogleToken(idToken string) (*User, error) {
    client := &http.Client{}
    url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)
    
    resp, err := client.Get(url)
    if err != nil {
        return nil, err
    }
    
    // Parser la réponse et créer l'utilisateur
    // ...
}
```

#### Apple ID Token
```go
// Exemple en Go avec JWT
func verifyAppleToken(idToken string) (*User, error) {
    // Récupérer les clés publiques Apple
    // Vérifier la signature JWT
    // Extraire les claims
    // ...
}
```

---

## 🔍 Diagnostic et Debug

### Vérifier la configuration
```typescript
import { logConfigurationStatus } from '../config/socialAuth.config';

// Affiche le statut de configuration dans la console
logConfigurationStatus();
```

### Logs de debug
Le service affiche automatiquement :
```
🔐 Statut configuration authentification sociale:
   Google: ✅ Configuré
   Apple: ✅ Configuré
```

### Erreurs communes

#### Google Sign-In
```
❌ DEVELOPER_ERROR: Configuration invalide
→ Vérifiez SHA-1 et package name

❌ SIGN_IN_CANCELLED: Utilisateur a annulé
→ Gestion normale, ne pas afficher d'erreur

❌ NETWORK_ERROR: Pas de connexion
→ Vérifiez la connexion internet
```

#### Apple Sign-In
```
❌ ERR_CANCELED: Utilisateur a annulé
→ Gestion normale

❌ NOT_AVAILABLE: Service indisponible
→ Vérifiez iOS version (13+) et configuration
```

---

## 📚 Ressources Utiles

### Documentation officielle
- [Google Sign-In Android](https://developers.google.com/identity/sign-in/android)
- [Apple Sign-In](https://developer.apple.com/documentation/sign_in_with_apple)
- [Expo Apple Auth](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

### Outils de debug
- [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [JWT.io](https://jwt.io/) pour décoder les tokens Apple

### Support
- 📧 Issues GitHub : [Créer un issue](https://github.com/votre-repo/issues)
- 💬 Discord : [Serveur de support](https://discord.gg/votre-serveur)

---

## ✅ Checklist de Configuration

### Google
- [ ] Projet créé dans Google Cloud Console
- [ ] APIs activées (Google+ API, Google Sign-In API)
- [ ] Identifiants OAuth 2.0 créés (Android, iOS, Web)
- [ ] SHA-1 ajouté pour Android
- [ ] Bundle ID configuré pour iOS
- [ ] Fichiers `google-services.json` et `GoogleService-Info.plist` téléchargés
- [ ] Configuration mise à jour dans `socialAuth.config.ts`

### Apple
- [ ] App ID configuré avec Sign In with Apple
- [ ] Service ID créé (si nécessaire)
- [ ] Domaines configurés
- [ ] Bundle ID mis à jour dans `socialAuth.config.ts`

### Test
- [ ] Test de connexion sur iOS (Apple)
- [ ] Test de connexion sur Android (Google)
- [ ] Gestion d'erreurs testée
- [ ] Tokens vérifiés côté backend

---

🎉 **Félicitations !** Votre authentification sociale est maintenant configurée et prête à l'emploi. 