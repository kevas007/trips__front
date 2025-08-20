# Documentation TripShare

Ce dossier contient toute la documentation du projet TripShare, organisée par catégories pour faciliter la navigation et la maintenance.

## Structure des dossiers

### 📡 API (`/api/`)
Documentation liée aux API, authentification et intégrations backend :
- `API_INTEGRATION_GUIDE.md` - Guide d'intégration des API
- `API_LOCAL_SETUP.md` - Configuration locale de l'API
- `SOCIAL_AUTH_SETUP.md` - Configuration de l'authentification sociale
- `GOOGLE_OAUTH_SETUP.md` - Configuration OAuth Google
- `OAUTH_FIX_GUIDE.md` - Corrections OAuth
- `AUTH_DIAGNOSTIC_GUIDE.md` - Diagnostic d'authentification
- `AUTH_FIXES_SUMMARY.md` - Résumé des corrections d'auth
- `AUTH_NAVIGATION_FIX.md` - Corrections de navigation d'auth

### 🎨 Interface Utilisateur (`/ui/`)
Documentation des composants UI, design et expérience utilisateur :
- `DESIGN_IMPROVEMENTS_GUIDE.md` - Améliorations du design
- `COMPONENT_LIBRARY_GUIDE.md` - Bibliothèque de composants
- `PROFILE_COMPLETE_GUIDE.md` - Guide complet de gestion du profil utilisateur
- `KEYBOARD_AND_NAVIGATION_GUIDE.md` - Guide complet du clavier intelligent et navigation
- `USERNAME_DISPLAY_UPDATE.md` - Mise à jour de l'affichage des noms
- `design.md` - Spécifications de design détaillées

### ⚡ Fonctionnalités (`/features/`)
Documentation des fonctionnalités principales de l'application :
- `GOOGLE_MAPS_SETUP_GUIDE.md` - Configuration Google Maps
- `MAP_IMPLEMENTATION_GUIDE.md` - Implémentation des cartes
- `OPENSTREETMAP_IMPLEMENTATION_GUIDE.md` - Implémentation OpenStreetMap
- `LOCATION_SEARCH_GUIDE.md` - Recherche de localisation
- `ITINERARY_LOCATION_SEARCH_GUIDE.md` - Recherche pour les itinéraires
- `DATE_SELECTION_FEATURE.md` - Sélection de dates
- `PHOTO_UPLOAD_GUIDE.md` - Upload de photos
- `PHOTO_DISPLAY_IMPROVEMENTS.md` - Améliorations d'affichage des photos
- `SOCIAL_FEED_IMPLEMENTATION.md` - Implémentation du feed social
- `FEED_PERSONNALISE_IMPLEMENTATION.md` - Feed personnalisé
- `INSTAGRAM_STYLE_FEED_IMPLEMENTATION.md` - Feed style Instagram
- `COMMENTS_INTEGRATION_GUIDE.md` - Intégration des commentaires
- `FEED_AND_BUDGET_FIXES.md` - Corrections feed et budget

### 🐛 Debug (`/debug/`)
Documentation de débogage et résolution de problèmes :
- `IMAGE_AND_AVATAR_DISPLAY_GUIDE.md` - Guide complet pour l'affichage des images et avatars
- `STATUS_DEBUG_GUIDE.md` - Guide de débogage des statuts
- `PUBLIC_TRIPS_FEED_FIX.md` - Corrections du feed des voyages publics
- `SPLIT_ERROR_FIX.md` - Corrections des erreurs de division
- `KEY_DUPLICATE_FIX.md` - Corrections des clés dupliquées
- `SEARCH_DEBUG_GUIDE.md` - Guide de débogage de la recherche
- `PROFILE_LOOP_FIX.md` - Corrections de la boucle du profil
- `NAVIGATION_ERROR_FIX.md` - Corrections des erreurs de navigation

### ⚙️ Configuration (`/setup/`)
Documentation de configuration et d'installation :
- `PHYSICAL_DEVICE_SETUP.md` - Configuration sur appareil physique
- `ONBOARDING_TRAVEL_IMPROVEMENTS.md` - Améliorations de l'onboarding

### 📚 Guides (`/guides/`)
Guides généraux et tutoriels :
- `CREATION_GUIDE_SIMPLE.md` - Guide de création simplifié
- `FRONTEND_COMPLETION_GUIDE.md` - Guide de finalisation frontend
- `COMPLETE_DATA_SENDING_GUIDE.md` - Guide d'envoi de données
- `RENAMING_SUMMARY.md` - Résumé des renommages
- `ASSETS_INTEGRATION_SUMMARY.md` - Résumé d'intégration des assets

## Comment utiliser cette documentation

1. **Pour les développeurs** : Commencez par `/api/` pour l'intégration backend
2. **Pour les designers** : Consultez `/ui/` pour les spécifications d'interface
3. **Pour les fonctionnalités** : Explorez `/features/` pour les guides spécifiques
4. **En cas de problème** : Vérifiez `/debug/` pour les solutions
5. **Pour la configuration** : Utilisez `/setup/` pour l'installation
6. **Pour les tutoriels** : Consultez `/guides/` pour les guides généraux

## Maintenance

- Mettez à jour cette documentation lors de l'ajout de nouvelles fonctionnalités
- Fusionnez les fichiers similaires pour éviter la duplication
- Gardez les noms de fichiers cohérents et descriptifs
- Ajoutez des liens croisés entre les documents pertinents 