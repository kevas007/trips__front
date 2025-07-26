# 🎨 Guide de la Bibliothèque de Composants TripShare

## 🌟 Vue d'Ensemble

Cette bibliothèque de composants unifie l'interface utilisateur de TripShare avec un système de design cohérent, moderne et accessible. Tous les composants suivent les mêmes principes de design et utilisent un système de couleurs, typographie et espacement standardisé.

## 📋 Table des Matières

1. [🎯 Système de Design](#système-de-design)
2. [🎨 Couleurs](#couleurs)
3. [✏️ Typographie](#typographie)
4. [📏 Espacement](#espacement)
5. [🔘 Boutons](#boutons)
6. [📝 Champs de Saisie](#champs-de-saisie)
7. [🃏 Cartes](#cartes)
8. [🚀 Utilisation](#utilisation)
9. [♿ Accessibilité](#accessibilité)
10. [📱 Responsive Design](#responsive-design)

---

## 🎯 Système de Design

### Principes Fondamentaux

- **Cohérence** : Tous les composants suivent les mêmes règles visuelles
- **Flexibilité** : Variantes multiples pour différents contextes
- **Accessibilité** : Conforme aux standards WCAG AA
- **Performance** : Optimisé pour React Native et Web
- **Voyage** : Adapté au domaine du voyage et du social

### Architecture

```
src/
├── design-system/
│   ├── colors.ts      # Palette de couleurs unifié
│   ├── typography.ts  # Système typographique
│   ├── spacing.ts     # Espacement cohérent
│   └── shadows.ts     # Ombres standardisées
├── components/ui/
│   ├── Button.tsx     # Boutons unifiés
│   ├── Input.tsx      # Champs de saisie
│   └── Card.tsx       # Système de cartes
```

---

## 🎨 Couleurs

### Palette Principale

```typescript
import { COLORS } from '../design-system/colors';

// Couleurs primaires (Teal)
COLORS.primary[500]  // #008080 - Couleur principale
COLORS.primary[50]   // #E0F7F7 - Très clair
COLORS.primary[900]  // #002020 - Très foncé

// Couleurs sémantiques
COLORS.semantic.success  // #4CAF50
COLORS.semantic.warning  // #FF9800
COLORS.semantic.error    // #F44336
COLORS.semantic.info     // #2196F3
```

### Couleurs Voyage

```typescript
// Couleurs thématiques
COLORS.travel.beach      // #00BCD4 - Cyan plage
COLORS.travel.mountain   // #795548 - Brun montagne
COLORS.travel.city       // #607D8B - Gris urbain
COLORS.travel.culture    // #9C27B0 - Violet culture
COLORS.travel.adventure  // #FF5722 - Orange aventure
COLORS.travel.romantic   // #E91E63 - Rose romantique
COLORS.travel.family     // #4CAF50 - Vert famille
```

### Helpers

```typescript
import { getColorWithOpacity, getContrastColor } from '../design-system/colors';

// Transparence
const transparentColor = getColorWithOpacity('#008080', 0.5);

// Contraste automatique
const textColor = getContrastColor('#008080'); // Retourne blanc ou noir
```

---

## ✏️ Typographie

### Hiérarchie

```typescript
import { TYPOGRAPHY_STYLES } from '../design-system/typography';

// Titres
TYPOGRAPHY_STYLES.h1  // 32px, bold
TYPOGRAPHY_STYLES.h2  // 26px, bold
TYPOGRAPHY_STYLES.h3  // 22px, semibold
TYPOGRAPHY_STYLES.h4  // 18px, semibold
TYPOGRAPHY_STYLES.h5  // 16px, medium
TYPOGRAPHY_STYLES.h6  // 14px, medium

// Contenu
TYPOGRAPHY_STYLES.bodyLarge   // 17px, regular
TYPOGRAPHY_STYLES.bodyMedium  // 15px, regular
TYPOGRAPHY_STYLES.bodySmall   // 13px, regular

// Utilitaires
TYPOGRAPHY_STYLES.caption    // 12px, regular
TYPOGRAPHY_STYLES.button     // 15px, semibold
TYPOGRAPHY_STYLES.label      // 14px, medium
```

### Utilisation

```tsx
<Text style={TYPOGRAPHY_STYLES.h2}>
  Titre Principal
</Text>

<Text style={TYPOGRAPHY_STYLES.bodyMedium}>
  Contenu du paragraphe
</Text>
```

---

## 📏 Espacement

### Système de Base

```typescript
import { SPACING } from '../design-system/spacing';

SPACING.xs    // 4px
SPACING.sm    // 8px
SPACING.md    // 12px
SPACING.lg    // 16px
SPACING.xl    // 20px
SPACING['2xl'] // 24px
SPACING['3xl'] // 32px
// ... jusqu'à 9xl (128px)
```

### Espacement Contextuel

```typescript
import { CONTEXTUAL_SPACING } from '../design-system/spacing';

// Cartes
CONTEXTUAL_SPACING.card.padding        // 16px
CONTEXTUAL_SPACING.card.margin         // 12px
CONTEXTUAL_SPACING.card.borderRadius   // 12px

// Boutons
CONTEXTUAL_SPACING.button.paddingVertical    // 12px
CONTEXTUAL_SPACING.button.paddingHorizontal  // 20px

// Champs de saisie
CONTEXTUAL_SPACING.input.paddingVertical     // 12px
CONTEXTUAL_SPACING.input.paddingHorizontal   // 16px
```

### Helpers

```typescript
import { getSpacing, getResponsiveSpacing } from '../design-system/spacing';

// Espacement calculé
const customSpacing = getSpacing(3); // 12px

// Espacement responsive
const responsiveSpacing = getResponsiveSpacing(16); // S'adapte à l'écran
```

---

## 🔘 Boutons

### Variantes Disponibles

```tsx
import { Button, PrimaryButton, SecondaryButton } from '../components/ui/Button';

// Bouton principal
<PrimaryButton onPress={() => {}}>
  Confirmer
</PrimaryButton>

// Bouton secondaire
<SecondaryButton onPress={() => {}}>
  Annuler
</SecondaryButton>

// Bouton personnalisé
<Button 
  variant="travel"
  travelType="beach"
  size="lg"
  onPress={() => {}}
>
  Réserver ce voyage
</Button>
```

### Toutes les Variantes

- `primary` - Bouton principal (teal)
- `secondary` - Bouton secondaire (outline)
- `tertiary` - Bouton tertiaire (ghost)
- `success` - Bouton succès (vert)
- `warning` - Bouton attention (orange)
- `error` - Bouton erreur (rouge)
- `info` - Bouton information (bleu)
- `travel` - Bouton voyage (couleurs thématiques)
- `social` - Bouton social (réseaux sociaux)
- `glassmorphism` - Bouton avec effet verre

### Tailles et Formes

```tsx
// Tailles
<Button size="xs">Très petit</Button>
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>
<Button size="xl">Très grand</Button>

// Formes
<Button shape="rounded">Arrondi</Button>
<Button shape="pill">Pilule</Button>
<Button shape="square">Carré</Button>
<Button shape="circle">Cercle</Button>
```

### Icônes et États

```tsx
// Avec icônes
<Button 
  leftIcon="airplane"
  rightIcon="arrow-forward"
  onPress={() => {}}
>
  Voyager
</Button>

// États
<Button loading>Chargement...</Button>
<Button disabled>Désactivé</Button>

// Bouton icône seulement
<Button 
  leftIcon="heart"
  iconOnly
  shape="circle"
  onPress={() => {}}
/>
```

---

## 📝 Champs de Saisie

### Variantes Disponibles

```tsx
import { Input, AuthInput, SearchInput } from '../components/ui/Input';

// Champ standard
<Input
  label="Email"
  placeholder="votre@email.com"
  value={email}
  onChangeText={setEmail}
/>

// Champ d'authentification
<AuthInput
  label="Mot de passe"
  showPasswordToggle
  value={password}
  onChangeText={setPassword}
/>

// Champ de recherche
<SearchInput
  placeholder="Rechercher une destination..."
  value={search}
  onChangeText={setSearch}
/>
```

### Toutes les Variantes

- `default` - Champ standard
- `filled` - Fond coloré
- `outlined` - Avec bordure
- `underlined` - Ligne en bas
- `glassmorphism` - Effet verre
- `search` - Recherche
- `auth` - Authentification

### Fonctionnalités Avancées

```tsx
// Validation
<Input
  label="Nom d'utilisateur"
  required
  validationRules={{
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  }}
  onValidation={(isValid, message) => {
    console.log('Validation:', isValid, message);
  }}
/>

// Icônes et actions
<Input
  leftIcon="person"
  rightIcon="checkmark-circle"
  clearable
  onRightIconPress={() => {}}
/>

// États
<Input error errorText="Email invalide" />
<Input success successText="Email valide" />
<Input loading />
```

---

## 🃏 Cartes

### Variantes Disponibles

```tsx
import { Card, TravelCard, SocialCard } from '../components/ui/Card';

// Carte standard
<Card
  title="Titre de la carte"
  subtitle="Sous-titre"
  description="Description détaillée de la carte"
  onPress={() => {}}
/>

// Carte voyage
<TravelCard
  title="Paris, France"
  subtitle="Voyage culturel"
  description="Découvrez la ville lumière"
  image="https://example.com/paris.jpg"
  travelType="culture"
  duration="5 jours"
  price="€1,200"
  rating={4.8}
  onPress={() => {}}
/>

// Carte sociale
<SocialCard
  title="Marie Dubois"
  subtitle="@marie_travel"
  description="Magnifique coucher de soleil à Santorini !"
  avatar="https://example.com/marie.jpg"
  verified
  likes={245}
  comments={32}
  shares={15}
  onPress={() => {}}
/>
```

### Toutes les Variantes

- `default` - Carte standard
- `elevated` - Carte surélevée
- `outlined` - Avec bordure
- `filled` - Fond coloré
- `glassmorphism` - Effet verre
- `travel` - Carte voyage
- `social` - Carte sociale
- `stat` - Carte statistique
- `feature` - Carte mise en avant

### Layouts et Tailles

```tsx
// Layouts
<Card layout="vertical">Layout vertical</Card>
<Card layout="horizontal">Layout horizontal</Card>
<Card layout="media">Média en haut</Card>
<Card layout="avatar">Avec avatar</Card>
<Card layout="icon">Avec icône</Card>

// Tailles
<Card size="sm">Petite carte</Card>
<Card size="md">Carte moyenne</Card>
<Card size="lg">Grande carte</Card>
<Card size="xl">Très grande carte</Card>
```

### Actions et Métadonnées

```tsx
// Actions
<Card
  title="Carte avec actions"
  actions={[
    {
      icon: 'heart-outline',
      label: 'J\'aime',
      onPress: () => {},
    },
    {
      icon: 'share-outline',
      label: 'Partager',
      onPress: () => {},
    },
  ]}
/>

// Badges et statuts
<Card
  title="Carte avec badge"
  badge="Nouveau"
  badgeColor="#FF6B6B"
  status="active"
/>
```

---

## 🚀 Utilisation

### Import des Composants

```typescript
// Composants principaux
import { Button, Input, Card } from '../components/ui';

// Variantes spécifiques
import { 
  PrimaryButton, 
  SecondaryButton,
  AuthInput,
  SearchInput,
  TravelCard,
  SocialCard 
} from '../components/ui';

// Système de design
import { COLORS, TYPOGRAPHY_STYLES, SPACING } from '../design-system';
```

### Exemple d'Écran Complet

```tsx
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Button, 
  Input, 
  Card, 
  COLORS, 
  SPACING 
} from '../components/ui';

const ExampleScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView style={{ 
      flex: 1, 
      backgroundColor: COLORS.neutral[50],
      padding: SPACING.lg 
    }}>
      <Card
        variant="elevated"
        title="Connexion"
        description="Connectez-vous pour accéder à votre compte"
      >
        <Input
          label="Email"
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          leftIcon="mail"
          keyboardType="email-address"
        />
        
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          showPasswordToggle
          leftIcon="lock-closed"
        />
        
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => {}}
        >
          Se connecter
        </Button>
      </Card>
    </ScrollView>
  );
};
```

---

## ♿ Accessibilité

### Principes Appliqués

- **Contraste** : Tous les textes respectent WCAG AA (4.5:1)
- **Taille tactile** : Minimum 44px pour les éléments interactifs
- **Labels** : Tous les composants ont des labels appropriés
- **Navigation** : Support du clavier et lecteurs d'écran
- **États** : Indication claire des états (focus, disabled, error)

### Utilisation

```tsx
// Labels d'accessibilité
<Button
  accessibilityLabel="Réserver ce voyage à Paris"
  accessibilityHint="Ouvre l'écran de réservation"
>
  Réserver
</Button>

// États d'accessibilité
<Input
  accessibilityLabel="Adresse email"
  accessibilityHint="Entrez votre adresse email pour vous connecter"
  error={emailError}
/>
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
// Tailles d'écran détectées automatiquement
SCREEN_SIZES.small      // < 375px (iPhone SE)
SCREEN_SIZES.medium     // < 768px (iPhone standard)
SCREEN_SIZES.large      // < 1024px (iPad)
SCREEN_SIZES.extraLarge // >= 1024px (iPad Pro, Desktop)
```

### Espacement Responsive

```typescript
// S'adapte automatiquement à la taille d'écran
const spacing = getResponsiveSpacing(16);
// Petit écran: 12.8px
// Écran moyen: 16px  
// Grand écran: 19.2px
// Très grand écran: 22.4px
```

### Composants Responsifs

Tous les composants s'adaptent automatiquement :

- **Boutons** : Taille et espacement ajustés
- **Inputs** : Hauteur et police adaptées
- **Cartes** : Espacement et layout optimisés
- **Typographie** : Tailles de police responsives

---

## 🔧 Personnalisation

### Thèmes Personnalisés

```typescript
// Modifier les couleurs globalement
const customColors = {
  ...COLORS,
  primary: {
    ...COLORS.primary,
    500: '#YOUR_BRAND_COLOR',
  },
};

// Utiliser dans vos composants
<Button 
  backgroundColor={customColors.primary[500]}
  onPress={() => {}}
>
  Bouton personnalisé
</Button>
```

### Styles Personnalisés

```tsx
// Styles personnalisés tout en gardant la cohérence
<Card
  style={{
    borderRadius: 20,
    marginVertical: SPACING.xl,
  }}
  titleStyle={{
    color: COLORS.travel.adventure,
    fontSize: TYPOGRAPHY_STYLES.h3.fontSize,
  }}
/>
```

---

## 🐛 Dépannage

### Problèmes Courants

1. **Import manquant** : Vérifiez les chemins d'import
2. **Styles non appliqués** : Assurez-vous d'utiliser les helpers du design system
3. **Responsive** : Utilisez `getResponsiveSpacing` pour l'espacement adaptatif
4. **Couleurs** : Utilisez `COLORS` plutôt que des valeurs hardcodées

### Debug

```typescript
// Vérifier les valeurs du design system
console.log('Couleur primaire:', COLORS.primary[500]);
console.log('Espacement large:', SPACING.lg);
console.log('Style de titre:', TYPOGRAPHY_STYLES.h2);
```

---

## 📚 Ressources

- [Material Design 3](https://m3.material.io/) - Inspiration du système
- [React Native](https://reactnative.dev/) - Documentation officielle
- [Expo](https://expo.dev/) - Outils de développement
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibilité

---

## 🤝 Contribution

Pour ajouter de nouveaux composants ou améliorer les existants :

1. Suivez les principes du design system
2. Utilisez les couleurs, typographie et espacement standardisés
3. Implémentez l'accessibilité dès le début
4. Testez sur différentes tailles d'écran
5. Documentez les nouvelles fonctionnalités

---

*Ce guide est maintenu à jour avec les dernières versions des composants TripShare.* 