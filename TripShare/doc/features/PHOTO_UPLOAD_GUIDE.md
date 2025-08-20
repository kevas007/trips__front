# 📸 Guide de Test - Upload des Photos

## 🎯 Objectif
Tester l'upload des photos vers le backend pour résoudre le problème d'affichage sur Android.

## 🔧 Configuration Actuelle

### Backend
- ✅ Backend Go en cours d'exécution sur le port 8085
- ✅ Endpoint `/api/v1/trips/:id/photos` disponible
- ✅ Support multipart/form-data

### Frontend
- ✅ Configuration API mise à jour pour Android et iOS
- ✅ Fonction `uploadTripPhotos` implémentée
- ✅ Upload automatique après création du voyage

## 📱 Test sur Android

### 1. Créer un nouveau voyage
1. Ouvrir l'app sur Android
2. Aller à "Créer un itinéraire"
3. Sélectionner des photos depuis la galerie
4. Remplir les informations du voyage
5. Créer le voyage

### 2. Vérifier les logs
```
📸 Photos sélectionnées: X
✅ Voyage créé: { id: "...", ... }
📸 Upload des photos vers le backend...
📸 Upload photo 1/X: file://...
✅ Photo 1 uploadée: { ... }
```

### 3. Vérifier le feed
1. Retourner au feed principal
2. Vérifier que les photos s'affichent dans le carrousel
3. Les photos doivent maintenant être accessibles depuis Android

## 🐛 Debug

### Si les photos ne s'affichent pas :
1. Vérifier les logs d'upload
2. Vérifier que le backend répond sur `/api/v1/trips/:id/photos`
3. Vérifier que les URLs retournées sont accessibles

### Si l'upload échoue :
1. Vérifier le token d'authentification
2. Vérifier la taille des photos
3. Vérifier les permissions de stockage

## 🔄 Prochaines Étapes

1. ✅ Implémenter l'upload des photos
2. 🔄 Tester sur Android
3. 🔄 Vérifier l'affichage dans le feed
4. 🔄 Optimiser la compression des images
5. 🔄 Ajouter une barre de progression pour l'upload 