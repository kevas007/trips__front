# 🌍 TripShare - Application Mobile de Partage de Voyages

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install --legacy-peer-deps

# Démarrage avec cache nettoyé
npm run clear

# Ou reset complet si problèmes
npm run reset
```

## 🔧 Dépannage React Native / Hermes

### ❌ Erreurs Courantes

#### `Cannot read property 'S' of undefined`
```bash
# 1. Nettoyer le cache Metro
npm run clear

# 2. Reset complet si nécessaire
npm run reset

# 3. Vérifier les modules natifs
npx expo install --check
```

#### `Cannot read property 'default' of undefined`
```bash
# 1. Vérifier les importations ES6/CJS
# 2. Nettoyer node_modules
rm -rf node_modules && npm install --legacy-peer-deps

# 3. Reset Metro + cache
npm run reset
```

#### `Property 'theme' doesn't exist`
✅ **RÉSOLU** - Problème de compatibilité React 19 → React 18

### 🔄 Scripts de Nettoyage

```bash
npm run clear    # Nettoie cache Metro
npm run reset    # Reset cache + Metro
npm run clean    # Réinstalle + reset complet
```

## 📱 Compatibilité

- **React Native**: 0.79.2
- **React**: 18.2.0 (downgrade depuis 19 pour compatibilité)
- **Expo**: ~53.0.0
- **TypeScript**: ~5.8.3

## 🏗️ Architecture

```
src/
├── components/     # Composants réutilisables
├── screens/        # Écrans de l'application
├── services/       # Services API et logique métier
├── contexts/       # Contexts React (Auth, Theme)
├── hooks/          # Hooks personnalisés
├── navigation/     # Configuration navigation
├── theme/          # Système de thème
├── types/          # Types TypeScript
├── i18n/           # Internationalisation
└── utils/          # Utilitaires
```

## 🛠️ Développement

### Variables d'environnement
```env
API_BASE_URL=http://34.246.200.184:8000/api/v1
```

### Build de production
```bash
# Android
npm run build:android

# iOS  
npm run build:ios

# Web
npm run build:web
```

## 📝 Notes Importantes

- **React 19** n'est pas encore compatible avec Expo 53
- Utiliser `--legacy-peer-deps` pour npm install
- Moteur **Hermes** activé pour les performances
- Support **Web/iOS/Android** 