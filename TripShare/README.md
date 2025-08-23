# TripShare/Trivenile - Frontend Mobile

> Plateforme sociale de voyage nouvelle génération avec IA

## 🚀 **Démarrage Rapide**

```bash
# Installation des dépendances
npm install

# Démarrage de l'application
npm start
```

## 📱 **Technologies**

- **React Native** + **Expo** - Framework mobile
- **TypeScript** - Typage statique strict
- **Zustand** - Gestion d'état par slices
- **React Navigation** - Navigation fluide
- **i18next** - Internationalisation
- **ESLint** + **Prettier** - Qualité du code

## 🏗️ **Architecture**

L'application suit une architecture **Feature-First** conforme aux consignes d'AGENTS-frontend.md :

```
src/
├── features/           # Domaines métier
│   └── auth/          # Authentification
│       ├── components/ # Composants spécifiques
│       ├── hooks/     # Hooks personnalisés
│       ├── services/  # Services API
│       ├── types/     # Types TypeScript
│       └── index.ts   # Export principal
├── shared/            # Ressources partagées
│   ├── components/    # Composants réutilisables
│   ├── constants/     # Design system
│   ├── utils/         # Utilitaires
│   └── index.ts       # Export principal
├── store/             # Gestion d'état Zustand
│   ├── slices/        # Slices par domaine
│   └── index.ts       # Store principal
└── navigation/        # Configuration navigation
```

## 🎯 **Fonctionnalités**

### ✅ **Implémentées**
- **Authentification** - Login/Register avec validation
- **Architecture Feature-First** - Organisation modulaire
- **Store Zustand** - Gestion d'état optimisée
- **Design System** - Couleurs, espacement, typographie
- **Tests** - Tests d'interaction avec RN Testing Library
- **Linting** - ESLint + Prettier configurés
- **TypeScript** - Types stricts et validation

### 🔄 **En Cours**
- **Navigation** - Flux d'authentification
- **API Integration** - Services backend
- **Internationalisation** - Support multilingue

## 📦 **Scripts Disponibles**

```bash
# Développement
npm start              # Démarrage Expo
npm run android        # Build Android
npm run ios           # Build iOS

# Qualité
npm run lint          # Vérification ESLint
npm run lint:fix      # Correction automatique
npm run format        # Formatage Prettier
npm run type-check    # Vérification TypeScript

# Tests
npm run test          # Tests unitaires
npm run test:watch    # Tests en mode watch
npm run test:coverage # Couverture de tests

# Build
npm run build:web     # Build pour le web
npm run build:android # Build Android
npm run build:ios     # Build iOS

# Sécurité
npm run security-audit # Audit des dépendances
npm run depcheck      # Vérification des dépendances
```

## 🔧 **Configuration**

### Variables d'Environnement

Créez un fichier `.env.local` :

```env
EXPO_PUBLIC_API_URL=http://localhost:8085
EXPO_PUBLIC_ENVIRONMENT=development
```

### Configuration Expo

L'application utilise la nouvelle architecture React Native :

```json
{
  "newArchEnabled": true,
  "jsEngine": "hermes"
}
```

## 🧪 **Tests**

```bash
# Tests unitaires
npm run test

# Tests d'interaction
npm run test:integration

# Couverture
npm run test:coverage
```

## 📚 **Documentation**

- **Architecture** : `doc/FRONTEND_ARCHITECTURE.md`
- **API** : `doc/api/`
- **Guides** : `doc/guides/`
- **Setup** : `doc/setup/`

## 🚀 **Déploiement**

### Web
```bash
npm run build:web
```

### Mobile
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## 🔒 **Sécurité**

- **SecureStore** - Stockage sécurisé des tokens
- **Validation** - Sanitisation des données
- **HTTPS** - Communication sécurisée
- **Audit** - Vérification des dépendances

## 📊 **Performance**

- **Hermes** - Moteur JavaScript optimisé
- **Mémoïsation** - React.memo, useMemo, useCallback
- **Lazy Loading** - Chargement à la demande
- **Bundle Optimization** - Tree shaking, minification

## 🤝 **Contribution**

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 **Support**

- **Documentation** : `doc/`
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions

---

**TripShare/Trivenile** - Révolutionnez vos voyages avec l'IA ! 🌍✈️ 