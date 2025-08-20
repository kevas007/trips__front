# Configuration Google OAuth pour TripShare (Android + iOS)

## 📱 Votre configuration actuelle

### Informations détectées :
- **Bundle ID suggéré** : `com.tripshare.app`
- **Empreinte SHA-1 (Debug)** : [Votre empreinte SHA-1]
- **Nom de l'app** : TripShare
- **Project ID détecté** : `tripshare-463019`

## 🔧 Configuration étape par étape

### 1. Google Cloud Console - Configuration correcte

1. **Accédez à** : https://console.cloud.google.com/apis/credentials
2. **Sélectionnez le projet** : `tripshare-463019`
3. **Activez l'API** "Google Sign-In API" si pas déjà fait

### 2. Création du bon type de client OAuth

**⚠️ IMPORTANT** : Pour Expo avec `expo-auth-session`, utilisez un client de type **"Web application"**, pas "Android" ou "iOS".

1. **Cliquez** sur "Créer des identifiants" > "ID client OAuth 2.0"
2. **Sélectionnez** : "Application Web"
3. **Configurez** :

```
Type d'application : Application Web
Nom : tripshare-mobile
Origines JavaScript autorisées : (laissez vide)
URI de redirection autorisés : 
  - https://auth.expo.io/@your-username/tripshare
  - com.tripshare.app://
```

### 3. Configuration des URI de redirection

Pour Expo, ajoutez ces URI de redirection :

```
https://auth.expo.io/@VOTRE_USERNAME/tripshare
https://auth.expo.io/@VOTRE_USERNAME/TripShare
com.tripshare.app://
```

⚠️ Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur Expo.

### 4. Mise à jour du code

Mettez à jour le fichier `src/config/socialAuth.config.ts` :

```typescript
export const SOCIAL_AUTH_CONFIG = {
  google: {
    // Utilisez le MÊME Client ID Web pour iOS et Android
    iosClientId: '976853895710-bekm4c0n1phs7tvhrukatn48l5nmi5dm.apps.googleusercontent.com',
    androidClientId: '976853895710-bekm4c0n1phs7tvhrukatn48l5nmi5dm.apps.googleusercontent.com',
    
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  },
  
  apple: {
    serviceId: 'com.tripshare.app',
  }
};
```

### 5. Vérification de l'API

Assurez-vous que ces APIs sont activées :
1. **Google+ API** (même si dépréciée)
2. **Google Sign-In API** 
3. **People API** (recommandée)

### 6. Test de l'URI de redirection

Pour obtenir votre URI de redirection Expo exacte :

```javascript
import * as AuthSession from 'expo-auth-session';

// Ajoutez ceci temporairement dans votre app pour voir l'URI
console.log('Redirect URI:', AuthSession.makeRedirectUri());
```

## 🚨 Problèmes courants et solutions

### "Accès bloqué" ou erreur 400 :
- ✅ Utilisez un client "Web application", pas "Installed"
- ✅ Ajoutez les bons URI de redirection
- ✅ Vérifiez que les APIs sont activées

### "redirect_uri_mismatch" :
- ✅ Ajoutez l'URI exacte retournée par `AuthSession.makeRedirectUri()`
- ✅ Incluez votre nom d'utilisateur Expo

### "invalid_client" :
- ✅ Utilisez le Client ID Web dans la configuration
- ✅ Vérifiez que le projet est correct

## ✅ Configuration finale

Dans Google Cloud Console, vous devriez avoir :

```
Type : Application Web (pas Installed!)
Nom : tripshare-mobile
Client ID : 976853895710-bekm4c0n1phs7tvhrukatn48l5nmi5dm.apps.googleusercontent.com
URI de redirection autorisés :
  - https://auth.expo.io/@VOTRE_USERNAME/tripshare
  - com.tripshare.app://
```

## 🔧 Commande de debug

Pour débugger l'URI de redirection :

```bash
npx expo start
# Dans la console de l'app, vérifiez l'URI généré
```

Cette configuration devrait résoudre le problème d'accès bloqué !

## 🔑 Commandes utiles

### Obtenir l'empreinte SHA-1 (Debug) :
```bash
keytool -list -v -keystore $env:USERPROFILE\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Obtenir l'empreinte SHA-1 (Production) :
```bash
keytool -list -v -keystore path/to/your/production.keystore -alias your-alias
```

## 🚨 Important

- Utilisez le **même Bundle ID** (`com.tripshare.app`) pour iOS et Android
- L'empreinte SHA-1 **change** entre debug et production
- Ajoutez **les deux empreintes** (debug + production) dans Google Console
- Pour la **production**, générez un nouveau keystore et ajoutez son SHA-1

## 📞 Support

Si problème, vérifiez :
1. Bundle ID identique partout
2. Client IDs corrects dans le code
3. Fichiers google-services.json et GoogleService-Info.plist présents
4. SHA-1 ajoutée dans Google Console 