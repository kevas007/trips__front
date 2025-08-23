# Architecture TripShare/Trivenile

## Vue d'ensemble

TripShare/Trivenile est une plateforme sociale de voyage nouvelle génération construite avec une architecture microservices moderne.

## Architecture Globale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Infrastructure │
│   (React Native)│◄──►│   (Go + Gin)    │◄──►│   (Docker)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Expo EAS      │    │   PostgreSQL    │    │     Redis       │
│   (Build/Deploy)│    │   (Base de      │    │   (Cache)       │
└─────────────────┘    │   données)      │    └─────────────────┘
                       └─────────────────┘              │
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     MinIO       │    │   AWS SES       │
                       │ (Stockage)      │    │   (Emails)      │
                       └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Structure Feature-First
```
src/
├── features/
│   ├── auth/           # Authentification
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── trips/          # Gestion des voyages
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── social/         # Fonctionnalités sociales
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── profile/        # Profil utilisateur
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/
│   ├── components/     # Composants réutilisables
│   ├── hooks/          # Hooks partagés
│   ├── services/       # Services API
│   ├── utils/          # Utilitaires
│   ├── types/          # Types partagés
│   └── constants/      # Constantes
├── store/              # Zustand store
├── navigation/         # Configuration navigation
├── assets/             # Images, fonts
└── i18n/               # Traductions
```

### Gestion d'État (Zustand)
```typescript
// store/index.ts
import { create } from 'zustand'
import { authSlice } from './slices/authSlice'
import { tripsSlice } from './slices/tripsSlice'
import { socialSlice } from './slices/socialSlice'

export const useStore = create((set, get) => ({
  ...authSlice(set, get),
  ...tripsSlice(set, get),
  ...socialSlice(set, get),
}))
```

## Backend Architecture

### Clean Architecture
```
internal/
├── domain/             # Entités et règles métier
│   ├── entities/       # Entités du domaine
│   ├── valueobjects/   # Objets de valeur
│   └── repositories/   # Interfaces des repositories
├── http/               # Couche transport
│   ├── handlers/       # Gestionnaires HTTP
│   ├── middlewares/    # Middlewares
│   ├── dto/           # Data Transfer Objects
│   └── validation/    # Validation des données
├── repo/               # Implémentation persistence
│   ├── postgres/      # Repository PostgreSQL
│   └── redis/         # Repository Redis
├── service/            # Cas d'usage
│   ├── auth/          # Services d'authentification
│   ├── trips/         # Services de voyages
│   └── social/        # Services sociaux
├── auth/               # Authentification
│   ├── jwt/           # Gestion JWT
│   └── rbac/          # Contrôle d'accès
├── cache/              # Cache Redis
├── storage/            # Stockage MinIO
└── config/             # Configuration
```

### Flux de données
```
HTTP Request → Middleware → Handler → Service → Repository → Database
     ↑                                                           ↓
HTTP Response ← Handler ← Service ← Repository ← Database
```

## Base de données

### Schéma principal
```sql
-- Utilisateurs
users (
  id, email, password_hash, username, avatar_url,
  created_at, updated_at, last_login
)

-- Voyages
trips (
  id, user_id, title, description, start_date, end_date,
  status, budget, created_at, updated_at
)

-- Activités
activities (
  id, trip_id, title, description, location, start_time,
  end_time, cost, created_at, updated_at
)

-- Dépenses
expenses (
  id, trip_id, user_id, amount, currency, description,
  category, date, created_at, updated_at
)

-- Partage social
shares (
  id, trip_id, user_id, is_public, created_at
)
```

## Sécurité

### Authentification
- JWT avec refresh tokens
- Rotation automatique des tokens
- Hachage bcrypt pour les mots de passe

### Autorisation
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- Contrôle d'accès par voyage

### Protection
- Rate limiting par IP et utilisateur
- Validation stricte des données
- CORS configuré strictement

## Performance

### Frontend
- Lazy loading des composants
- Optimisation des images
- Cache Zustand intelligent
- Bundle splitting

### Backend
- Pool de connexions PostgreSQL
- Cache Redis pour les données fréquentes
- Pagination des résultats
- Index optimisés

## Monitoring

### Métriques
- Latence des endpoints
- Taux d'erreur
- Utilisation des ressources
- Performance des requêtes

### Logs
- Logs structurés avec correlation-id
- Niveaux : debug, info, warn, error
- Rotation automatique

## Déploiement

### Environnements
- **Development** : Docker Compose local
- **Staging** : Infrastructure cloud
- **Production** : Infrastructure cloud avec monitoring

### CI/CD
- Tests automatiques
- Build et déploiement automatisés
- Rollback en cas de problème
- Monitoring post-déploiement
