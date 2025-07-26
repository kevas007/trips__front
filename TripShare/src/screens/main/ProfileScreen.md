# ProfileScreen - Écran de Profil Utilisateur

## Description

L'écran de profil est un composant moderne et professionnel qui affiche les informations détaillées d'un utilisateur dans l'application TripShare. Il utilise le design system de l'application avec un design glassmorphism et des animations fluides.

## Fonctionnalités

### 🎨 Design Moderne
- **Header avec photo de couverture** : Image de fond avec overlay et boutons d'action
- **Avatar avec badge de vérification** : Photo de profil avec indicateur de compte vérifié
- **Design glassmorphism** : Effets de transparence et d'ombre pour un look moderne
- **Responsive** : S'adapte à différentes tailles d'écran

### 📊 Statistiques Utilisateur
- **Voyages créés** : Nombre total de voyages créés
- **Pays visités** : Nombre de pays explorés
- **Villes visitées** : Nombre de villes découvertes
- **Vues totales** : Nombre de vues sur les contenus
- **J'aime reçus** : Nombre total de likes
- **Partages** : Nombre de voyages partagés

### 🏆 Système de Badges
- **Badges d'achievement** : Récompenses pour les accomplissements
- **Badges de contenu** : Reconnaissance pour le partage de contenu
- **Badges sociaux** : Indicateurs d'influence sociale
- **Interaction** : Tap pour voir les détails du badge

### 🎯 Préférences de Voyage
- **Activités préférées** : Types d'activités (Culture, Aventure, Gastronomie)
- **Hébergement** : Préférences d'hébergement
- **Transport** : Modes de transport préférés
- **Budget** : Niveau de budget
- **Climat** : Préférences climatiques

### 🔧 Actions Utilisateur
- **Modifier le profil** : Accès à l'édition du profil
- **Suivre/Ne plus suivre** : Gestion des relations sociales
- **Envoyer un message** : Communication directe
- **Partager le profil** : Partage sur les réseaux sociaux
- **Paramètres** : Accès aux paramètres de l'application

## Structure des Fichiers

```
src/screens/main/
├── ProfileScreen.tsx          # Composant principal
├── ProfileScreenStyles.ts     # Styles séparés
└── ProfileScreen.md          # Documentation
```

## Utilisation

```tsx
import ProfileScreen from './screens/main/ProfileScreen';

// Dans votre navigation
<ProfileScreen navigation={navigation} />
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `navigation` | `any` | Objet de navigation React Navigation |

## État Local

| État | Type | Description |
|------|------|-------------|
| `user` | `User` | Données de l'utilisateur |
| `badges` | `Badge[]` | Liste des badges de l'utilisateur |
| `refreshing` | `boolean` | État de rafraîchissement |
| `isEditing` | `boolean` | Mode édition du profil |

## Fonctions Principales

### `renderStatItem(label, value, icon)`
Affiche un élément de statistique avec une valeur, un label et une icône.

### `renderBadge(badge)`
Affiche un badge utilisateur avec interaction.

### `handleEditProfile()`
Gère la navigation vers l'écran d'édition du profil.

### `handleFollow()`
Gère l'action de suivre/ne plus suivre un utilisateur.

### `handleMessage()`
Gère l'envoi de message à l'utilisateur.

### `handleShareProfile()`
Gère le partage du profil sur les réseaux sociaux.

## Design System

L'écran utilise le design system de l'application :

- **Couleurs** : Palette teal Material Design 3
- **Typographie** : SF Pro Display/Text
- **Espacement** : Système de spacing responsive
- **Bordures** : Rayons de bordure cohérents
- **Ombres** : Système d'ombres Material Design

## Responsive Design

L'écran s'adapte automatiquement aux différentes tailles d'écran :

- **Mobile** : Layout optimisé pour les petits écrans
- **Tablet** : Utilisation optimale de l'espace disponible
- **Web** : Interface adaptée aux écrans larges

## Accessibilité

- **Contraste** : Respect des ratios de contraste WCAG
- **Navigation** : Support de la navigation au clavier
- **Screen readers** : Labels appropriés pour les lecteurs d'écran
- **Taille de texte** : Respect des préférences utilisateur

## Performance

- **Lazy loading** : Chargement différé des images
- **Memoization** : Optimisation des re-renders
- **Pull-to-refresh** : Rafraîchissement des données
- **Image optimization** : Images optimisées pour le web

## Intégration API

L'écran est conçu pour s'intégrer avec l'API backend :

```tsx
// Exemple d'intégration avec l'API
const loadUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    setUser(response.data);
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
  }
};
```

## Évolutions Futures

- [ ] Mode sombre/clair
- [ ] Animations de transition
- [ ] Partage avancé avec métadonnées
- [ ] Intégration avec les réseaux sociaux
- [ ] Mode hors ligne
- [ ] Notifications push pour les interactions 