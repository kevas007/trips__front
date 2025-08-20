# Guide de Configuration des Clés API Google Maps

## 🗺️ Configuration Requise

Pour que la fonctionnalité de carte fonctionne correctement, vous devez configurer les clés API Google Maps.

## 🔑 Étapes pour Obtenir les Clés API

### 1. **Créer un Projet Google Cloud**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez la facturation pour votre projet

### 2. **Activer l'API Maps**

1. Dans la console Google Cloud, allez dans "APIs & Services" > "Library"
2. Recherchez et activez les APIs suivantes :
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API** (optionnel, pour des fonctionnalités avancées)

### 3. **Créer les Clés API**

#### Pour Android
1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "API Key"
3. Nommez la clé "Android Maps API Key"
4. Cliquez sur "Restrict Key"
5. Sélectionnez "Android apps"
6. Ajoutez votre package name : `trivenile.android`
7. Ajoutez votre empreinte SHA-1 (voir section ci-dessous)

#### Pour iOS
1. Créez une nouvelle clé API
2. Nommez la clé "iOS Maps API Key"
3. Cliquez sur "Restrict Key"
4. Sélectionnez "iOS apps"
5. Ajoutez votre bundle identifier : `com.trivenile.app`

### 4. **Obtenir l'Empreinte SHA-1 pour Android**

#### Méthode 1 : Avec Expo
```bash
# Dans le dossier TripShare
npx expo fetch:android:hashes
```

#### Méthode 2 : Avec Keytool
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## 🔧 Configuration dans app.json

### 1. **Remplacer les Clés Placeholder**

Dans le fichier `app.json`, remplacez les valeurs placeholder par vos vraies clés :

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "VOTRE_VRAIE_CLE_IOS_ICI"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "VOTRE_VRAIE_CLE_ANDROID_ICI"
        }
      }
    }
  }
}
```

### 2. **Exemple de Configuration Complète**

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        }
      }
    }
  }
}
```

## 🚀 Test de la Configuration

### 1. **Redémarrer l'Application**
```bash
# Arrêter l'application
# Puis redémarrer
npx expo start --clear
```

### 2. **Tester la Carte**
1. Ouvrez l'application
2. Allez dans la création d'itinéraire
3. Cliquez sur le bouton 🗺️ dans un champ de lieu
4. La carte devrait s'afficher correctement

## 🔒 Sécurité des Clés API

### 1. **Restrictions Recommandées**
- **Restriction par application** : Limitez les clés à votre app spécifique
- **Restriction par API** : Limitez aux APIs Maps uniquement
- **Quotas** : Configurez des limites d'utilisation

### 2. **Variables d'Environnement (Recommandé)**
Pour plus de sécurité, utilisez des variables d'environnement :

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "${GOOGLE_MAPS_IOS_API_KEY}"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${GOOGLE_MAPS_ANDROID_API_KEY}"
        }
      }
    }
  }
}
```

Puis créez un fichier `.env` :
```env
GOOGLE_MAPS_IOS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_ANDROID_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🐛 Résolution de Problèmes

### 1. **Carte Ne S'Affiche Pas**
- Vérifiez que les clés API sont correctes
- Vérifiez que les APIs sont activées dans Google Cloud
- Vérifiez la connexion internet
- Redémarrez l'application

### 2. **Erreur "API Key Not Valid"**
- Vérifiez que la clé est correctement copiée
- Vérifiez les restrictions de la clé
- Vérifiez que l'API Maps est activée

### 3. **Erreur "This API project is not authorized"**
- Activez la facturation dans Google Cloud
- Vérifiez que les APIs sont activées
- Attendez quelques minutes après l'activation

### 4. **Carte Blanche**
- Vérifiez les permissions de localisation
- Vérifiez que le GPS est activé
- Testez sur un appareil physique

## 📱 Test sur Appareils Physiques

### Android
1. Construisez l'APK ou utilisez Expo Go
2. Installez sur un appareil Android
3. Testez la géolocalisation et la carte

### iOS
1. Construisez l'IPA ou utilisez Expo Go
2. Installez sur un appareil iOS
3. Testez la géolocalisation et la carte

## 💰 Coûts

### Google Maps API
- **Gratuit** : 200$ de crédit par mois
- **Cout typique** : ~5-10$ par mois pour une app moyenne
- **Facturation** : Après dépassement du crédit gratuit

### Optimisation des Coûts
- Limitez les requêtes de géocodage
- Utilisez le cache quand possible
- Surveillez l'utilisation dans Google Cloud Console

## ✅ Checklist de Configuration

- [ ] Projet Google Cloud créé
- [ ] Facturation activée
- [ ] APIs Maps activées
- [ ] Clés API créées
- [ ] Restrictions configurées
- [ ] Clés ajoutées dans app.json
- [ ] Application redémarrée
- [ ] Carte testée sur appareil physique

## 🎯 Prochaines Étapes

1. **Obtenir les clés API** selon ce guide
2. **Configurer dans app.json**
3. **Tester sur appareils physiques**
4. **Optimiser les performances** si nécessaire
5. **Configurer la surveillance** des coûts 