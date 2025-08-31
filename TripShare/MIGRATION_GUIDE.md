# Guide de Migration - Données de Voyage

## Vue d'ensemble

Ce guide documente les changements apportés à la structure des données de voyage pour assurer la cohérence entre le frontend et le backend.

## Changements principaux

### 1. Interface Trip mise à jour

**Avant :**
```typescript
export interface Trip {
  id: string;
  title: string;
  description?: string;
  destination: string; // ❌ Incohérent
  startDate: string;   // ❌ Format différent
  endDate: string;     // ❌ Format différent
  user_id: string;     // ❌ Devrait être created_by
  images?: string[];   // ❌ Devrait être photos
  tags?: string[];     // ❌ Devrait être travel_categories
}
```

**Après :**
```typescript
export interface Trip {
  id: string;
  title: string;
  description?: string;
  start_date?: string;  // ✅ Cohérent avec backend
  end_date?: string;    // ✅ Cohérent avec backend
  location: {           // ✅ Nouveau champ
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  created_by: string;   // ✅ Cohérent avec backend
  photos?: TripPhoto[]; // ✅ Relation backend
  travel_categories?: string[]; // ✅ Cohérent avec backend
  
  // Champs de compatibilité
  destination?: string; // Pour compatibilité
  images?: string[];    // Pour compatibilité
  tags?: string[];      // Pour compatibilité
}
```

### 2. Nouveaux types de relations

```typescript
export interface TripPhoto {
  id: string;
  trip_id: string;
  url: string;
  caption?: string;
  created_at: string;
}

export interface TripLike {
  id: string;
  trip_id: string;
  user_id: string;
  created_at: string;
  user?: UserInfo;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  joined_at?: string;
  user?: UserInfo;
}
```

## Migration du code existant

### 1. Accès aux données utilisateur

**Avant :**
```typescript
const username = trip.username;
const userId = trip.user_id;
```

**Après :**
```typescript
// Préférer l'objet user s'il existe
const username = trip.user?.username || trip.username;
const userId = trip.created_by;
```

### 2. Accès aux images

**Avant :**
```typescript
const images = trip.images || [];
```

**Après :**
```typescript
// Préférer les photos du backend
const images = trip.photos?.map(photo => photo.url) || trip.images || [];
```

### 3. Accès aux tags

**Avant :**
```typescript
const tags = trip.tags || [];
```

**Après :**
```typescript
// Préférer les catégories de voyage du backend
const tags = trip.travel_categories || trip.tags || [];
```

### 4. Accès à la destination

**Avant :**
```typescript
const destination = trip.destination;
```

**Après :**
```typescript
// Utiliser la ville depuis location
const destination = trip.location?.city || trip.destination || 'Destination inconnue';
```

## Validation des données

### Utilisation du validateur

```typescript
import { TripDataValidator } from '../utils/tripDataValidator';

// Validation complète
const validation = TripDataValidator.validateTrip(trip);
if (!validation.isValid) {
  console.error('Erreurs de validation:', validation.errors);
}

// Validation spécifique
const structureValidation = TripDataValidator.validateTripStructure(trip);
const imagesValidation = TripDataValidator.validateImagesConsistency(trip);
```

### Tests de validation

```typescript
import { testTripDataValidation } from '../utils/testTripData';

// Lancer les tests de validation
testTripDataValidation();
```

## Points d'attention

### 1. Compatibilité descendante

Les champs de compatibilité (`destination`, `images`, `tags`) sont maintenus pour assurer la compatibilité avec le code existant. Cependant, il est recommandé de migrer progressivement vers les nouveaux champs.

### 2. Gestion des erreurs

Le nouveau système de validation permet de détecter les incohérences. Utilisez ces validations pour déboguer les problèmes de données.

### 3. Performance

La transformation des données est automatique dans `tripService.ts`. Les validations sont optionnelles et peuvent être désactivées en production si nécessaire.

## Checklist de migration

- [ ] Mettre à jour les imports pour utiliser la nouvelle interface `Trip`
- [ ] Remplacer `trip.user_id` par `trip.created_by`
- [ ] Utiliser `trip.user?.username` au lieu de `trip.username`
- [ ] Adapter l'accès aux images via `trip.photos`
- [ ] Adapter l'accès aux tags via `trip.travel_categories`
- [ ] Utiliser `trip.location.city` pour la destination
- [ ] Ajouter des validations si nécessaire
- [ ] Tester avec les données réelles du backend

## Exemples de migration

### Composant de carte de voyage

**Avant :**
```typescript
const TripCard = ({ trip }: { trip: Trip }) => (
  <View>
    <Text>{trip.title}</Text>
    <Text>{trip.destination}</Text>
    <Image source={{ uri: trip.images?.[0] }} />
    <Text>{trip.username}</Text>
  </View>
);
```

**Après :**
```typescript
const TripCard = ({ trip }: { trip: Trip }) => (
  <View>
    <Text>{trip.title}</Text>
    <Text>{trip.location?.city || trip.destination}</Text>
    <Image source={{ uri: trip.photos?.[0]?.url || trip.images?.[0] }} />
    <Text>{trip.user?.username || trip.username}</Text>
  </View>
);
```

### Service de données

**Avant :**
```typescript
const processTrip = (trip: Trip) => {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    images: trip.images,
    author: trip.username
  };
};
```

**Après :**
```typescript
const processTrip = (trip: Trip) => {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.location?.city || trip.destination,
    images: trip.photos?.map(p => p.url) || trip.images,
    author: trip.user?.username || trip.username
  };
};
```

## Support

Pour toute question concernant cette migration, consultez :
- Le fichier `TRIP_DETAILS_CORRECTIONS.md` pour les détails techniques
- Les tests dans `testTripData.ts` pour des exemples d'utilisation
- Le validateur dans `tripDataValidator.ts` pour la validation des données
