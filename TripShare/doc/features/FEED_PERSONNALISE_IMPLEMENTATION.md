# Système de Feed Personnalisé - TripShare

## Vue d'ensemble

Le système de feed personnalisé de TripShare affiche du contenu basé sur les préférences de voyage de l'utilisateur. Si l'utilisateur n'a pas de préférences, il affiche du contenu aléatoire pour l'inspirer.

## Architecture

### 1. Backend (Go)

#### Service de Recommandations
- **Fichier**: `tripshare-backend/internal/services/recommendation_service.go`
- **Fonctionnalités**:
  - `GetRecommendedTrips()`: Récupère les voyages recommandés basés sur les préférences
  - `calculateRecommendationScore()`: Calcule un score de pertinence (0-1)
  - `getRandomTrips()`: Retourne des voyages aléatoires si pas de préférences

#### Mapping des Catégories
```go
var CategoryMapping = map[string][]string{
    "tourist_attraction": {"culture", "photography"},
    "museum":             {"culture", "photography"},
    "park":               {"nature", "photography"},
    "outdoor_recreation": {"adventure", "nature"},
    "beach":              {"beach", "nature"},
    // ...
}
```

#### API Endpoints
- `GET /api/v1/recommendations/trips` - Voyages recommandés
- `GET /api/v1/recommendations/travel-category/:category` - Voyages par catégorie
- `GET /api/v1/users/me/travel-preferences` - Préférences utilisateur

### 2. Frontend (React Native)

#### Composant Principal: PersonalizedFeed
- **Fichier**: `TripShare/src/components/Home/PersonalizedFeed.tsx`
- **Fonctionnalités**:
  - Charge les préférences utilisateur
  - Affiche des recommandations personnalisées ou du contenu aléatoire
  - Gère les catégories suggérées
  - Pull-to-refresh et pagination

#### Types de Contenu du Feed
```typescript
interface FeedItem {
  id: string;
  type: 'trip' | 'recommendation' | 'category';
  title: string;
  subtitle: string;
  data: any;
  score?: number;
  reason?: string;
}
```

#### Composant TripCard Amélioré
- **Fichier**: `TripShare/src/components/Home/TripCard.tsx`
- **Nouvelles fonctionnalités**:
  - Affichage du score de recommandation (0-100%)
  - Raison de recommandation
  - Badge IA pour les recommandations

#### Écran de Catégories
- **Fichier**: `TripShare/src/screens/main/CategoryTripsScreen.tsx`
- **Fonctionnalités**:
  - Affichage des voyages par catégorie
  - Pagination infinie
  - Navigation depuis le feed

## Logique de Recommandation

### Score de Recommandation
Le score est calculé en combinant plusieurs facteurs :

1. **Catégories Maps (25%)**: Correspondance avec les préférences d'activités
2. **Catégories de Voyage (35%)**: Correspondance directe avec les intérêts
3. **Type de Voyage (20%)**: Correspondance avec le style de voyage
4. **Budget (20%)**: Correspondance avec les préférences budgétaires
5. **Climat (10%)**: Correspondance avec les préférences climatiques

### Exemple de Calcul
```go
score := mapCategoryScore * 0.25 + 
         travelCategoryScore * 0.35 + 
         typeScore * 0.20 + 
         budgetScore * 0.20 + 
         climateScore * 0.10
```

## Interface Utilisateur

### Feed Personnalisé
- **Header dynamique**: Change selon les préférences
  - Avec préférences: "🎯 Recommandations pour vous"
  - Sans préférences: "🌟 Découvrez de nouveaux voyages"

### Catégories Suggérées
- Basées sur les préférences utilisateur
- Affichage avec émojis et descriptions
- Navigation vers l'écran de catégorie

### Scores de Recommandation
- Badge avec pourcentage (ex: "85%")
- Raison de recommandation (ex: "Parfaitement adapté à vos goûts")
- Couleurs et icônes pour l'identification rapide

## Flux de Données

### 1. Chargement Initial
```
Utilisateur → PersonalizedFeed → API → Backend
Backend → Service Recommandations → Base de données
Base de données → Préférences + Voyages → Score de recommandation
Score → Frontend → Affichage personnalisé
```

### 2. Sans Préférences
```
Utilisateur → PersonalizedFeed → API → Backend
Backend → getRandomTrips() → Voyages aléatoires
Voyages aléatoires → Frontend → Affichage d'inspiration
```

### 3. Navigation par Catégorie
```
Feed → Catégorie → CategoryTripsScreen → API
API → getTripsByCategory() → Voyages filtrés
Voyages filtrés → Affichage paginé
```

## Configuration

### Variables d'Environnement
```bash
# Backend
API_URL=http://localhost:3000/api
JWT_SECRET=your-secret-key

# Frontend
API_URL=http://localhost:3000/api
```

### Préférences par Défaut
Si l'utilisateur n'a pas de préférences, le système utilise :
- Voyages populaires
- Catégories générales (Culture, Nature, Aventure, Gastronomie)
- Scores aléatoires entre 0.1 et 0.6

## Utilisation

### Pour l'Utilisateur
1. **Avec préférences**: Le feed affiche des recommandations personnalisées
2. **Sans préférences**: Le feed affiche du contenu d'inspiration
3. **Toggle**: Possibilité de basculer entre feed personnalisé et classique
4. **Navigation**: Clic sur catégorie pour explorer plus de contenu

### Pour le Développeur
1. **Ajouter une catégorie**: Modifier `CategoryMapping` dans le backend
2. **Modifier l'algorithme**: Ajuster les poids dans `calculateRecommendationScore`
3. **Personnaliser l'UI**: Modifier les composants `PersonalizedFeed` et `TripCard`

## Avantages

### Pour l'Utilisateur
- **Contenu pertinent**: Voyages adaptés aux goûts
- **Découverte**: Nouvelles destinations basées sur les préférences
- **Flexibilité**: Possibilité de voir du contenu classique ou personnalisé
- **Transparence**: Scores et raisons de recommandation visibles

### Pour l'Application
- **Engagement**: Contenu plus pertinent = plus d'engagement
- **Rétention**: Utilisateurs plus susceptibles de revenir
- **Scalabilité**: Système extensible pour de nouvelles catégories
- **Performance**: Cache et pagination pour de bonnes performances

## Évolutions Futures

1. **Machine Learning**: Intégration d'algorithmes ML plus sophistiqués
2. **Collaborative Filtering**: Recommandations basées sur les utilisateurs similaires
3. **Feedback Loop**: Apprentissage des préférences basé sur les interactions
4. **Géolocalisation**: Recommandations basées sur la localisation
5. **Saisonnalité**: Recommandations adaptées aux saisons
6. **Prix dynamiques**: Intégration des prix pour les recommandations 