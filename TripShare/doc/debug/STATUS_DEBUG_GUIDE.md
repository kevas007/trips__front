# Guide de Débogage - Problème du Statut

## Problème identifié
Lors de la création d'un itinéraire, le statut choisi par l'utilisateur n'est pas pris en compte et le voyage est toujours créé avec le statut "planned".

## Diagnostic

### 1. Vérifier les logs frontend
Dans l'application React Native, lors de la création d'un itinéraire, vérifiez les logs dans la console :

```javascript
// Ces logs devraient apparaître lors de la création
console.log('Payload envoyé au backend:', payload);
console.log('Statut sélectionné:', itineraryData.status);
```

**Résultat attendu :**
- `status: 'public'` dans le payload
- `Statut sélectionné: public` dans les logs

### 2. Vérifier les logs backend
Dans les logs du backend, cherchez ces messages :

```
✅ CreateTrip - Payload reçu: Title=..., Location=..., Status=...
🔍 TripService.Create - Statut reçu: '...' (type: ...)
✅ TripService.Create - Statut valide conservé: '...'
```

**Résultat attendu :**
- `Status=public` dans le payload reçu
- `Statut reçu: 'public'` dans le service
- `Statut valide conservé: 'public'`

### 3. Vérifier la base de données
Après création, vérifiez le statut en base :

```sql
SELECT id, title, status, created_at 
FROM trips 
ORDER BY created_at DESC 
LIMIT 1;
```

**Résultat attendu :**
- `status` devrait être `'public'`

## Solutions possibles

### Solution 1 : Vérifier la sélection du statut
Assurez-vous que l'utilisateur sélectionne bien le statut "Public" dans l'étape "Photos et tags".

### Solution 2 : Forcer le statut public
Si le problème persiste, vous pouvez temporairement forcer le statut public dans le frontend :

```typescript
// Dans createItinerary()
const payload = {
  // ... autres champs
  status: 'public', // Forcer le statut public
};
```

### Solution 3 : Vérifier la validation backend
Le backend pourrait rejeter le statut "public". Vérifiez que `models.IsValidCreationStatus('public')` retourne `true`.

## Test de création

1. **Créer un nouveau voyage** avec toutes les étapes
2. **Sélectionner explicitement "Public"** dans l'étape finale
3. **Vérifier les logs** frontend et backend
4. **Vérifier en base** le statut créé
5. **Vérifier le feed** pour voir si le voyage apparaît

## Commandes de test

### Vérifier les voyages récents
```sql
SELECT id, title, status, created_at 
FROM trips 
ORDER BY created_at DESC 
LIMIT 5;
```

### Mettre à jour un voyage existant
```sql
UPDATE trips 
SET status = 'public' 
WHERE id = 'votre-uuid-ici';
```

### Vérifier les voyages publics
```sql
SELECT COUNT(*) as voyages_publics 
FROM trips 
WHERE status = 'public';
```

## Logs à surveiller

### Frontend (React Native)
```
Payload envoyé au backend: {title: "...", status: "public", ...}
Statut sélectionné: public
```

### Backend (Go)
```
✅ CreateTrip - Payload reçu: Title=..., Status=public
🔍 TripService.Create - Statut reçu: 'public' (type: models.TripStatus)
✅ TripService.Create - Statut valide conservé: 'public'
✅ TripService.Create - Trip créé avec succès, ID: ..., Status: public
```

## Prochaines étapes

1. **Tester la création** avec les logs activés
2. **Identifier où le statut est perdu** (frontend, transmission, backend)
3. **Corriger le problème** selon le diagnostic
4. **Vérifier que les voyages apparaissent** dans le feed 