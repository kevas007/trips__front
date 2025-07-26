# Guide d'Intégration API TripShare

## Vue d'ensemble

Ce guide explique comment utiliser le nouveau service API TripShare qui implémente tous les endpoints du backend Go dans le frontend React Native.

## Structure des Services

### 1. Service API Principal (`tripShareApi`)

Le service principal `TripShareApiService` contient tous les endpoints du backend Go :

```typescript
import { tripShareApi } from '../services';

// Authentification
await tripShareApi.login({ email: 'user@example.com', password: 'password' });
await tripShareApi.register({ /* données d'inscription */ });

// Voyages
await tripShareApi.createTrip({ /* données du voyage */ });
await tripShareApi.listTrips({ /* filtres optionnels */ });
await tripShareApi.getTrip(tripId);
await tripShareApi.updateTrip(tripId, { /* modifications */ });
await tripShareApi.deleteTrip(tripId);

// Activités
await tripShareApi.createActivity(tripId, { /* données de l'activité */ });
await tripShareApi.listActivities(tripId);

// Dépenses
await tripShareApi.createExpense(tripId, { /* données de la dépense */ });
await tripShareApi.listExpenses(tripId);

// Profil utilisateur
await tripShareApi.getProfile();
await tripShareApi.updateProfile({ /* modifications */ });
```

### 2. Hooks Personnalisés

Des hooks React personnalisés sont disponibles pour faciliter l'utilisation :

```typescript
import { useAuth, useTrips, useActivities, useExpenses, useProfile } from '../hooks/useTripShareApi';

// Dans un composant
const MyComponent = () => {
  const { login, register } = useAuth();
  const { listTrips, createTrip } = useTrips();
  const { listActivities } = useActivities();
  const { listExpenses } = useExpenses();
  const { getProfile } = useProfile();

  // Utilisation
  const handleLogin = async () => {
    await login.execute({ email: 'user@example.com', password: 'password' });
    console.log('Utilisateur connecté:', login.data);
  };

  const handleCreateTrip = async () => {
    await createTrip.execute({
      title: 'Mon voyage',
      destination: 'Paris',
      start_date: '2024-06-01',
      end_date: '2024-06-07',
      budget: 1500
    });
  };
};
```

## Endpoints Disponibles

### Authentification (`/api/v1/auth/`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Inscription d'un nouvel utilisateur |
| POST | `/login` | Connexion utilisateur |
| POST | `/refresh` | Rafraîchissement du token |
| POST | `/logout` | Déconnexion |
| POST | `/verify-email` | Vérification de l'email |
| POST | `/resend-verification` | Renvoi de l'email de vérification |
| POST | `/forgot-password` | Demande de réinitialisation de mot de passe |
| POST | `/reset-password` | Réinitialisation du mot de passe |
| POST | `/change-password` | Changement de mot de passe |

### Utilisateurs (`/api/v1/users/`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/me` | Récupérer le profil utilisateur |
| PUT | `/me` | Mettre à jour le profil |
| GET | `/me/stats` | Statistiques utilisateur |
| GET | `/me/badges` | Badges de l'utilisateur |
| GET | `/me/followers` | Abonnés de l'utilisateur |
| GET | `/me/following` | Abonnements de l'utilisateur |
| POST | `/me/follow/:id` | Suivre un utilisateur |
| DELETE | `/me/follow/:id` | Ne plus suivre un utilisateur |
| GET | `/discover` | Découvrir des utilisateurs |
| GET | `/search` | Rechercher des utilisateurs |
| DELETE | `/me` | Supprimer le compte |
| POST | `/me/avatar` | Uploader un avatar |
| POST | `/change-email` | Changer l'email |

### Voyages (`/api/v1/trips/`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/` | Créer un voyage |
| GET | `/` | Lister les voyages |
| GET | `/:id` | Récupérer un voyage |
| PUT | `/:id` | Mettre à jour un voyage |
| DELETE | `/:id` | Supprimer un voyage |
| GET | `/:id/export` | Exporter un voyage |
| POST | `/:id/duplicate` | Dupliquer un voyage |

### Membres de Voyage (`/api/v1/trips/:id/members`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Lister les membres |
| POST | `/` | Ajouter un membre |
| PUT | `/members/:member_id` | Mettre à jour un membre |
| DELETE | `/members/:member_id` | Supprimer un membre |

### Photos de Voyage (`/api/v1/trips/:id/photos`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Lister les photos |
| POST | `/` | Uploader une photo |
| PUT | `/photos/:photo_id` | Mettre à jour une photo |
| DELETE | `/photos/:photo_id` | Supprimer une photo |

### Activités (`/api/v1/trips/:id/activities`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Lister les activités |
| POST | `/` | Créer une activité |
| PUT | `/activities/:activity_id` | Mettre à jour une activité |
| DELETE | `/activities/:activity_id` | Supprimer une activité |

### Dépenses (`/api/v1/trips/:id/expenses`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Lister les dépenses |
| POST | `/` | Créer une dépense |
| PUT | `/expenses/:expense_id` | Mettre à jour une dépense |
| DELETE | `/expenses/:expense_id` | Supprimer une dépense |
| GET | `/export` | Exporter les dépenses |

### Badges (`/api/v1/badges/`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/` | Créer un badge (admin) |
| GET | `/` | Lister les badges |
| GET | `/:id` | Récupérer un badge |
| PUT | `/:id` | Mettre à jour un badge (admin) |
| DELETE | `/:id` | Supprimer un badge (admin) |
| POST | `/:id/award` | Attribuer un badge (admin) |
| GET | `/:id/users` | Utilisateurs avec ce badge |

## Types TypeScript

Tous les types sont exportés depuis le service :

```typescript
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateTripRequest,
  UpdateTripRequest,
  TripFilters,
  CreateActivityRequest,
  CreateExpenseRequest,
  // ... et plus encore
} from '../services';
```

## Gestion des Erreurs

Le service gère automatiquement :
- Les erreurs de réseau
- Les erreurs d'authentification (401)
- Le rafraîchissement automatique des tokens
- Les timeouts de requête

```typescript
try {
  const trips = await tripShareApi.listTrips();
  console.log('Voyages récupérés:', trips);
} catch (error) {
  console.error('Erreur API:', error.message);
  // Gérer l'erreur dans l'interface utilisateur
}
```

## Exemple Complet

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTrips, useAuth } from '../hooks/useTripShareApi';

const TripListScreen = () => {
  const { login } = useAuth();
  const { listTrips, createTrip } = useTrips();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Se connecter automatiquement
    login.execute({ email: 'user@example.com', password: 'password' });
  }, []);

  useEffect(() => {
    // Charger les voyages quand l'utilisateur est connecté
    if (login.data) {
      listTrips.execute();
    }
  }, [login.data]);

  useEffect(() => {
    // Mettre à jour la liste quand les données changent
    if (listTrips.data) {
      setTrips(listTrips.data);
    }
  }, [listTrips.data]);

  const handleCreateTrip = async () => {
    await createTrip.execute({
      title: 'Nouveau voyage',
      destination: 'Paris',
      start_date: '2024-06-01',
      end_date: '2024-06-07',
      budget: 1500
    });
    
    // Recharger la liste
    await listTrips.execute();
  };

  return (
    <View>
      <Text>Mes Voyages</Text>
      
      {listTrips.loading && <Text>Chargement...</Text>}
      
      {listTrips.error && <Text style={{ color: 'red' }}>{listTrips.error}</Text>}
      
      {trips.map(trip => (
        <View key={trip.id}>
          <Text>{trip.title}</Text>
          <Text>{trip.destination}</Text>
        </View>
      ))}
      
      <TouchableOpacity onPress={handleCreateTrip} disabled={createTrip.loading}>
        <Text>{createTrip.loading ? 'Création...' : 'Créer un voyage'}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Configuration

Le service utilise la configuration définie dans `src/config/api.ts` :

- **Développement local** : `http://localhost:8085/api/v1`
- **Réseau local** : `http://192.168.0.220:8085/api/v1`

Pour changer d'environnement, modifiez `CURRENT_ENV` dans le fichier de configuration.

## Migration depuis l'Ancien Service

Si vous utilisez l'ancien service API, voici comment migrer :

```typescript
// Ancien code
import { APIService } from '../services/api';
const api = new APIService();
const trips = await api.getTrips(filters);

// Nouveau code
import { tripShareApi } from '../services';
const trips = await tripShareApi.listTrips(filters);

// Ou avec les hooks
import { useTrips } from '../hooks/useTripShareApi';
const { listTrips } = useTrips();
await listTrips.execute(filters);
```

## Support

Pour toute question ou problème avec l'API, consultez :
1. Les logs de la console pour les erreurs détaillées
2. La documentation du backend Go
3. Les types TypeScript pour la structure des données 