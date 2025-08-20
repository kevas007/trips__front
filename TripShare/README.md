# 🌍 Trivenile - Plateforme Sociale de Voyage Nouvelle Génération

<div align="center">
  <img src="./assets/icon.png" alt="Trivenile Logo" width="120" height="120" />
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-53.0-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 🚀 **À propos de Trivenile**

**Trivenile** est une plateforme sociale de voyage révolutionnaire qui combine l'intelligence artificielle, la gamification et une expérience utilisateur moderne pour transformer la façon dont vous planifiez, partagez et vivez vos aventures.

### ✨ **Fonctionnalités principales**

🤖 **IA Intelligente**
- Recommandations personnalisées basées sur vos préférences
- Planification automatique d'itinéraires optimisés
- Assistant voyage intelligent

🎮 **Expérience Gamifiée**
- Système de points et récompenses
- Défis de voyage quotidiens
- Badges et accomplissements

📱 **Interface Moderne**
- Design élégant et intuitif
- Animations fluides et immersives
- Mode sombre/clair adaptatif

🌐 **Social & Partage**
- Partage d'itinéraires en temps réel
- Communauté de voyageurs passionnés
- Photos et souvenirs géolocalisés

## 🛠️ **Technologies**

### **Frontend Mobile**
- **React Native 0.79** - Framework multiplateforme
- **Expo 53** - Plateforme de développement
- **TypeScript** - Typage statique
- **Zustand** - Gestion d'état moderne
- **React Hook Form** - Gestion des formulaires
- **react-native-svg** - Graphiques vectoriels

### **Design System**
- **Expo Linear Gradient** - Dégradés natifs
- **Responsive Design** - Adaptation multi-écrans
- **Animations** - React Native Animated API
- **Thèmes** - Support mode sombre/clair

### **Internationalisation**
- **i18next** - Support multilingue
- **Français & Anglais** - Langues supportées

## 📱 **Installation & Démarrage**

### **Prérequis**
- Node.js 18+
- npm ou yarn
- Expo CLI
- iOS Simulator / Android Emulator

### **Installation**
```bash
# Cloner le repository
git clone https://github.com/trivenile/mobile-app.git
cd trivenile

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Ou directement sur plateforme
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

### **Scripts disponibles**
```bash
npm start          # Serveur Expo
npm run ios        # iOS
npm run android    # Android  
npm run clear      # Cache clear
npm test          # Tests Jest
npm run lint      # ESLint
npm run type-check # TypeScript
```

## 🏗️ **Architecture du Projet**

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Authentification
│   ├── Home/           # Écran d'accueil
│   └── ui/             # Composants UI génériques
├── screens/            # Écrans de l'application
│   ├── auth/           # Connexion/Inscription
│   ├── main/           # Écrans principaux
│   └── settings/       # Paramètres
├── navigation/         # Configuration navigation
├── services/           # Services API
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── utils/              # Utilitaires
├── types/              # Types TypeScript
├── constants/          # Constantes
└── i18n/               # Traductions
```

## 🎨 **Assets & Design**

### **Icons & Images**
- 📱 **26 icônes** multi-résolutions (iOS/Android/Web)
- 🎭 **Fonds d'écran** optimisés (mode clair/sombre)
- 🌍 **Logo SVG** vectoriel adaptatif

### **Optimisations**
- ✅ **Lazy loading** automatique
- ✅ **Compression** intelligente
- ✅ **Fallbacks** gracieux
- ✅ **Cache** optimisé

## 🔐 **Sécurité & Authentification**

- 🔒 **JWT** sécurisé
- 🍎 **Apple Sign-In** 
- 🔵 **Google OAuth**
- 📱 **Biométrie** (Face ID/Touch ID)
- 🔐 **Secure Store** pour les tokens

## 🌍 **Déploiement**

### **Expo Application Services (EAS)**
```bash
# Build Android
npm run build:android

# Build iOS  
npm run build:ios
```

### **Configuration**
- **Bundle ID**: `com.trivenile.app`
- **Package**: `trivenile.android`
- **Version**: `1.0.0`

## 🤝 **Contribution**

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md).

### **Développement**
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 **Licence**

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 📞 **Support & Contact**

- 📧 **Email**: support@trivenile.app
- 🌐 **Site web**: https://trivenile.app
- 📱 **App Store**: [À venir]
- 🤖 **Google Play**: [À venir]

---

<div align="center">
  <p><strong>Développé avec ❤️ par l'équipe Trivenile</strong></p>
  <p>🌍 Révolutionnons ensemble l'expérience voyage</p>
</div> 