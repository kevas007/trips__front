# Guide de Débogage - Affichage des Images

## Problème identifié
Les images des voyages ne s'affichent pas dans le feed de la page d'accueil, même si elles sont stockées dans le backend.

## Diagnostic

### 1. Vérifier les logs backend
Dans les logs du backend, cherchez ces messages :

```
✅ TripService.ListPublic - X voyages publics trouvés
  - Voyage 1: ID=..., Title=..., Photos=X
    📸 Première photo: http://...
```

**Résultat attendu :**
- `Photos=X` où X > 0
- `📸 Première photo: http://...` avec une URL valide

### 2. Vérifier les logs frontend
Dans l'application React Native, lors du chargement du feed, vérifiez les logs :

```javascript
// Ces logs devraient apparaître lors du chargement du feed
🔍 Voyage 1 - Photos: [{id: "...", url: "http://...", ...}]
🖼️ Voyage 1 - Image utilisée: http://...
```

**Résultat attendu :**
- `Photos: [...]` avec un tableau d'objets contenant des URLs
- `Image utilisée: http://...` avec une URL valide

### 3. Vérifier la base de données
Vérifiez que les photos sont bien stockées :

```sql
-- Vérifier les photos d'un voyage spécifique
SELECT tp.id, tp.url, tp.title, tp.created_at 
FROM trip_photos tp 
JOIN trips t ON tp.trip_id = t.id 
WHERE t.title = 'Votre titre de voyage'
ORDER BY tp.created_at DESC;

-- Vérifier tous les voyages avec photos
SELECT t.id, t.title, COUNT(tp.id) as photo_count 
FROM trips t 
LEFT JOIN trip_photos tp ON t.id = tp.trip_id 
WHERE t.status = 'public'
GROUP BY t.id, t.title 
ORDER BY t.created_at DESC;
```

**Résultat attendu :**
- Des URLs valides dans la colonne `url`
- `photo_count > 0` pour les voyages avec photos

## Solutions possibles

### Solution 1 : Vérifier la structure des photos
Les photos peuvent être stockées de deux façons :
1. **Objets TripPhoto** : `{id: "...", url: "http://...", title: "..."}`
2. **URLs directes** : `"http://..."`

Le code frontend gère les deux cas :
```typescript
const tripImage = trip.photos && trip.photos.length > 0 
  ? trip.photos[0].url || trip.photos[0] // Support pour les objets TripPhoto et les URLs directes
  : 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800';
```

### Solution 2 : Vérifier les URLs des images
Assurez-vous que les URLs des images sont accessibles :
- URLs complètes (avec http/https)
- Serveur d'images accessible
- Pas de problèmes CORS

### Solution 3 : Vérifier le stockage des images
Si les images sont stockées localement, vérifiez :
- Le serveur de fichiers est démarré
- Les chemins sont corrects
- Les permissions sont bonnes

## Test de diagnostic

### 1. Créer un voyage avec photos
1. Créer un nouveau voyage
2. Ajouter des photos dans l'étape "Photos et tags"
3. Publier le voyage

### 2. Vérifier les logs
1. Recharger le feed
2. Vérifier les logs backend et frontend
3. Identifier où les photos sont perdues

### 3. Vérifier l'affichage
1. Vérifier que l'image s'affiche dans le feed
2. Vérifier que l'URL est correcte
3. Tester l'URL directement dans un navigateur

## Commandes de test

### Vérifier les photos en base
```sql
-- Compter les photos par voyage
SELECT 
  t.id, 
  t.title, 
  COUNT(tp.id) as photo_count,
  ARRAY_AGG(tp.url) as photo_urls
FROM trips t 
LEFT JOIN trip_photos tp ON t.id = tp.trip_id 
WHERE t.status = 'public'
GROUP BY t.id, t.title 
ORDER BY t.created_at DESC;
```

### Vérifier une URL d'image
```bash
# Tester si une URL d'image est accessible
curl -I "http://votre-url-image.com/image.jpg"
```

### Vérifier les logs backend
```bash
# Voir les logs du backend
docker logs tripshare-backend | grep -E "(ListPublic|Photos|Voyage)"
```

## Structure attendue des données

### Backend (Go)
```go
type Trip struct {
  ID     uuid.UUID  `json:"id"`
  Title  string     `json:"title"`
  Photos []TripPhoto `json:"photos"`
  // ...
}

type TripPhoto struct {
  ID  uuid.UUID `json:"id"`
  URL string    `json:"url"`
  // ...
}
```

### Frontend (TypeScript)
```typescript
interface Trip {
  id: string;
  title: string;
  photos: Array<{
    id: string;
    url: string;
    title?: string;
  }>;
  // ...
}
```

## Prochaines étapes

1. **Tester la création** d'un voyage avec photos
2. **Vérifier les logs** backend et frontend
3. **Identifier le format** des photos reçues
4. **Corriger l'affichage** selon le format détecté
5. **Tester l'accessibilité** des URLs d'images 