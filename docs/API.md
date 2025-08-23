# API Documentation

## Vue d'ensemble

L'API TripShare suit les conventions REST et utilise OpenAPI pour la documentation.

## Base URL

- **Development**: `http://localhost:8085`
- **Staging**: `https://api-staging.trivenile.app`
- **Production**: `https://api.trivenile.app`

## Conventions REST

### Méthodes HTTP
- `GET` - Récupération de données
- `POST` - Création de ressources
- `PUT` - Mise à jour complète
- `PATCH` - Mise à jour partielle
- `DELETE` - Suppression de ressources

### Codes de statut
- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `422` - Données invalides
- `500` - Erreur serveur

### Format des réponses
```json
{
  "success": true,
  "data": {},
  "message": "Opération réussie",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Authentification

### JWT Bearer Token
```http
Authorization: Bearer <access_token>
```

### Refresh Token
```http
X-Refresh-Token: <refresh_token>
```

## Endpoints

### Authentification

#### POST /api/v1/auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "traveler123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "traveler123",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
}
```

#### POST /api/v1/auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST /api/v1/auth/refresh
Rafraîchir le token d'accès.

**Headers:**
```http
X-Refresh-Token: <refresh_token>
```

#### POST /api/v1/auth/logout
Déconnexion utilisateur.

### Utilisateurs

#### GET /api/v1/users/me
Récupérer le profil de l'utilisateur connecté.

#### PUT /api/v1/users/me
Mettre à jour le profil utilisateur.

**Body:**
```json
{
  "username": "newUsername",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Passionné de voyage"
}
```

#### GET /api/v1/users/me/stats
Statistiques de l'utilisateur.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_trips": 15,
    "total_distance": 25000,
    "countries_visited": 8,
    "total_expenses": 5000,
    "favorite_destination": "Paris"
  }
}
```

### Voyages

#### GET /api/v1/trips
Lister les voyages de l'utilisateur.

**Query Parameters:**
- `page` (int): Numéro de page (défaut: 1)
- `limit` (int): Nombre d'éléments par page (défaut: 20)
- `status` (string): Filtre par statut (draft, active, completed)
- `search` (string): Recherche par titre

#### POST /api/v1/trips
Créer un nouveau voyage.

**Body:**
```json
{
  "title": "Voyage en Europe",
  "description": "Découverte de l'Europe de l'Ouest",
  "start_date": "2024-06-01",
  "end_date": "2024-06-15",
  "budget": 3000,
  "is_public": true
}
```

#### GET /api/v1/trips/:id
Récupérer les détails d'un voyage.

#### PUT /api/v1/trips/:id
Mettre à jour un voyage.

#### DELETE /api/v1/trips/:id
Supprimer un voyage.

### Activités

#### GET /api/v1/trips/:id/activities
Lister les activités d'un voyage.

#### POST /api/v1/trips/:id/activities
Créer une nouvelle activité.

**Body:**
```json
{
  "title": "Visite du Louvre",
  "description": "Découverte des œuvres d'art",
  "location": "Paris, France",
  "start_time": "2024-06-01T10:00:00Z",
  "end_time": "2024-06-01T12:00:00Z",
  "cost": 15,
  "category": "culture"
}
```

#### PUT /api/v1/activities/:id
Mettre à jour une activité.

#### DELETE /api/v1/activities/:id
Supprimer une activité.

### Dépenses

#### GET /api/v1/trips/:id/expenses
Lister les dépenses d'un voyage.

#### POST /api/v1/trips/:id/expenses
Créer une nouvelle dépense.

**Body:**
```json
{
  "amount": 150,
  "currency": "EUR",
  "description": "Hôtel à Paris",
  "category": "accommodation",
  "date": "2024-06-01"
}
```

#### PUT /api/v1/expenses/:id
Mettre à jour une dépense.

#### DELETE /api/v1/expenses/:id
Supprimer une dépense.

### Social

#### GET /api/v1/trips/public
Découvrir des voyages publics.

#### POST /api/v1/trips/:id/share
Partager un voyage.

#### GET /api/v1/users/discover
Découvrir des utilisateurs.

## Validation

### Règles de validation communes

#### Email
- Format email valide
- Longueur maximale: 255 caractères

#### Mot de passe
- Minimum 8 caractères
- Au moins 1 majuscule, 1 minuscule, 1 chiffre
- Maximum 128 caractères

#### Titre
- Minimum 3 caractères
- Maximum 100 caractères

#### Description
- Maximum 1000 caractères

## Pagination

### Format de réponse paginée
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## Gestion d'erreurs

### Format d'erreur
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": {
      "email": ["Format email invalide"],
      "password": ["Mot de passe trop court"]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Codes d'erreur
- `VALIDATION_ERROR` - Erreur de validation
- `AUTHENTICATION_ERROR` - Erreur d'authentification
- `AUTHORIZATION_ERROR` - Erreur d'autorisation
- `NOT_FOUND_ERROR` - Ressource non trouvée
- `INTERNAL_ERROR` - Erreur interne

## Rate Limiting

- **Authentification**: 5 requêtes par minute par IP
- **API générale**: 100 requêtes par minute par utilisateur
- **Upload**: 10 fichiers par minute par utilisateur

## Versioning

L'API utilise le versioning par URL avec le préfixe `/api/v1/`.

Les changements breaking seront introduits dans `/api/v2/` avec une période de transition.
