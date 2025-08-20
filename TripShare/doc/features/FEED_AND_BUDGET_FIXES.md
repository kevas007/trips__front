# Corrections Feed et Budget - TripShare

## Problèmes identifiés et solutions

### 1. Problème du Feed Home
**Problème :** Les voyages ne s'affichent pas dans le feed de la page d'accueil.

**Cause :** Les voyages dans la base de données ont le statut "planned" au lieu de "public".

**Solution :** 
- ✅ Ajout d'un champ de sélection de statut dans l'écran de création d'itinéraire
- ✅ Modification du statut par défaut de "planned" à "public"
- ✅ Validation obligatoire du statut

**Pour corriger les voyages existants :**
```sql
-- Exécuter cette commande dans la base de données
UPDATE trips 
SET status = 'public' 
WHERE status IN ('planned', 'ongoing', 'completed');
```

### 2. Correction du Champ Budget
**Problème :** Le champ budget était défini comme string mais devrait être un nombre.

**Corrections apportées :**
- ✅ Changement du type `budget: string` vers `budget: number` dans l'interface `ItineraryData`
- ✅ Mise à jour des options de budget avec des valeurs numériques :
  - "< 1000€" → 500
  - "1000€ - 3000€" → 2000  
  - "> 3000€" → 5000
- ✅ Correction de l'initialisation : `budget: ''` → `budget: 0`
- ✅ Mise à jour de la validation pour vérifier `budget === 0`
- ✅ Suppression du parsing inutile dans le payload

### 3. Ajout du Champ Durée
**Amélioration :** Ajout d'un champ de durée dans l'étape "Informations de base".

**Modifications :**
- ✅ Nouveau champ de saisie libre pour la durée
- ✅ Validation obligatoire
- ✅ Placeholder avec exemples : "Ex: 3 jours, 1 semaine, 2h..."
- ✅ Suppression du champ de durée dupliqué dans l'étape "Détails du voyage"

## Fichiers modifiés

### Frontend
- `TripShare/src/screens/itineraries/CreateItineraryScreen.tsx`
  - Interface `ItineraryData` : `budget: number`
  - Options de budget avec valeurs numériques
  - Ajout du champ durée dans l'étape "Informations de base"
  - Validation du statut obligatoire
  - Correction du payload envoyé au backend

### Backend
- `tripshare-backend/internal/handlers/trip_handler.go`
  - Gestion du champ budget comme nombre
  - Support des nouveaux champs : duration, difficulty, tags, steps

- `tripshare-backend/internal/services/trip_service.go`
  - Méthode `ListPublic` qui filtre par `status = 'public'`
  - Jointure avec la table users pour récupérer les informations utilisateur

## Comment tester

### 1. Créer un nouveau voyage
1. Ouvrir l'application
2. Aller dans "Créer un itinéraire"
3. Remplir les informations de base (titre, destination, durée)
4. Sélectionner un budget dans l'étape "Détails du voyage"
5. Ajouter des étapes
6. Ajouter des photos et sélectionner le statut "Public"
7. Créer l'itinéraire

### 2. Vérifier le feed
1. Aller sur la page d'accueil
2. Le nouveau voyage devrait apparaître dans le feed
3. Vérifier que les informations utilisateur sont affichées correctement

### 3. Corriger les voyages existants
Si les voyages existants ne s'affichent pas :

```bash
# Se connecter à la base de données PostgreSQL
docker exec -it tripshare-postgres psql -U postgres -d tripshare_dev

# Exécuter la mise à jour
UPDATE trips SET status = 'public' WHERE status IN ('planned', 'ongoing', 'completed');

# Vérifier le résultat
SELECT id, title, status, created_at FROM trips ORDER BY created_at DESC;
```

## Structure des données

### Voyage créé
```json
{
  "title": "Voyage à Bruxelles",
  "description": "Découverte de la capitale belge",
  "destination": "Bruxelles, Belgique",
  "duration": "3 jours",
  "budget": 2000,
  "difficulty": "Modéré",
  "status": "public",
  "tags": ["Culture", "Ville"],
  "steps": [...],
  "photos": [...]
}
```

### Feed Home
Le feed récupère les voyages avec :
- `status = 'public'`
- Informations utilisateur jointes (username, first_name, last_name, avatar_url)
- Tri par date de création décroissante
- Pagination (limit/offset)

## Prochaines étapes

1. **Tester la création de voyages** avec le nouveau formulaire
2. **Vérifier l'affichage dans le feed** après création
3. **Corriger les voyages existants** si nécessaire
4. **Tester la pagination** du feed
5. **Vérifier les performances** avec de nombreux voyages

## Notes techniques

- Le backend filtre automatiquement les voyages publics dans `ListPublic()`
- Les informations utilisateur sont jointes pour l'affichage dans le feed
- Le champ budget est maintenant un nombre entier pour faciliter les calculs
- La durée est un champ texte libre pour plus de flexibilité
- Le statut est obligatoire et par défaut "public" pour la visibilité 