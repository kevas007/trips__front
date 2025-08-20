# 🚨 Correction erreur d'authentification Google OAuth

## Problème identifié
Vous avez un client **Android** configuré, mais Expo avec `expo-auth-session` nécessite un client **Web application**.

## ✅ Solution étape par étape

### 1. Créer un client Web application

1. **Allez sur** : https://console.cloud.google.com/apis/credentials?project=tripshare-463019
2. **Cliquez** sur "Créer des identifiants" > "ID client OAuth 2.0"
3. **Sélectionnez** : "Application Web"
4. **Configuration** :

```
Type d'application : Application Web
Nom : tripshare-expo-web
Origines JavaScript autorisées : (laissez vide)
URI de redirection autorisés :
  - https://auth.expo.io/@VOTRE_USERNAME/TripShare
  - exp://localhost:19000/--/
  - com.tripshare.app://
```

### 2. Obtenir votre nom d'utilisateur Expo

Pour connaître votre nom d'utilisateur Expo :

```bash
npx expo whoami
```

Ou dans l'app, vérifiez la console pour voir :
```
👤 Expo Username: VOTRE_USERNAME
```

### 3. URIs de redirection typiques

Ajoutez ces URIs dans votre client Web :

```
https://auth.expo.io/@VOTRE_USERNAME/TripShare
exp://localhost:19000/--/
```

### 4. Garder les deux clients

Vous pouvez garder :
- **Client Android** : pour une future build native
- **Client Web** : pour Expo Go et development

### 5. Test rapide

Une fois le client Web créé, testez avec :

```bash
npm start
# Puis testez le bouton Google
```

## 🔧 Configuration actuelle détectée

```
Project ID : tripshare-463019
Client Android : 976853895710-bekm4c0n1phs7tvhrukatn48l5nmi5dm.apps.googleusercontent.com
Package Android : tripshare-android (modifié dans app.json)
SHA-1 : 36:9C:33:27:98:85:ED:B2:3C:3E:2A:9A:C0:02:68:06:9A:29:1E:7F
```

## 📝 Notes importantes

- **Client Android** : Fonctionne uniquement avec une build native
- **Client Web** : Fonctionne avec Expo Go et development
- **Expo utilise** des redirections web même sur mobile
- **Gardez les deux** pour flexibilité future

Le client Web résoudra immédiatement votre erreur d'authentification ! 