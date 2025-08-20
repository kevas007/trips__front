# 🗺️ Guide d'utilisation - Recherche de lieux

## Fonctionnalités implémentées

### ✅ Recherche de lieux avec suggestions GPS

Le système utilise l'API **Nominatim (OpenStreetMap)** - **100% gratuite** et sans limite d'utilisation.

#### 🔍 Comment utiliser :

1. **Dans l'écran de création de voyage** :
   - Cliquez sur le champ "📍 Destination"
   - Tapez des mots-clés : "Tour Eiffel", "Parc Güell", "Musée du Louvre"
   - Les suggestions apparaissent automatiquement

2. **Suggestions affichées** :
   - **Nom du lieu** : Nom principal du lieu
   - **Adresse complète** : Adresse détaillée
   - **Ville/Pays** : Localisation avec emoji 📍
   - **Coordonnées GPS** : Latitude/Longitude précises
   - **Icône** : Type de lieu (tourisme, restaurant, etc.)

3. **Boutons d'action** :
   - **🔍 Recherche** : Active/désactive les suggestions
   - **🗺️ Carte** : Recherche sur carte (en développement)

#### 🎯 Exemples de recherche :

```
"Tour Eiffel" → Tour Eiffel, Paris, France
"Parc Güell" → Parc Güell, Barcelone, Espagne
"Musée du Louvre" → Musée du Louvre, Paris, France
"Times Square" → Times Square, New York, USA
"Sagrada Familia" → Sagrada Familia, Barcelone, Espagne
```

#### 📱 Interface utilisateur améliorée :

```
📝 Titre du voyage
[Titre de votre voyage...]

📍 Destination
┌─────────────────────────────────────────────────────────┐
│ Rechercher une destination...                    [🔍][🗺️] │
└─────────────────────────────────────────────────────────┘

⏰ Durée
┌─────────────────────────────────────────────────────────┐
│ Durée (ex: 2h, 3 jours, 1 semaine)                    │
└─────────────────────────────────────────────────────────┘

Suggestions :
┌─────────────────────────────────────┐
│ 📷 Tour Eiffel                      │
│ Tour Eiffel, Paris, France          │
│ 📍 Paris, France                    │
│ 48.8584, 2.2945                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🏛️ Musée du Louvre                 │
│ Musée du Louvre, Paris, France      │
│ 📍 Paris, France                    │
│ 48.8606, 2.3376                     │
└─────────────────────────────────────┘
```

#### 🔧 Fonctionnalités techniques :

- **Debounce** : Recherche après 500ms d'inactivité
- **Minimum 3 caractères** : Pour éviter trop de requêtes
- **Limite 10 résultats** : Pour des performances optimales
- **Langue française** : Résultats en français
- **Types de lieux** : Icônes adaptées au type (tourisme, restaurant, etc.)

#### 🚀 Avantages :

- ✅ **Gratuit** : Aucun coût d'API
- ✅ **Sans limite** : Utilisation illimitée
- ✅ **Données précises** : Coordonnées GPS exactes
- ✅ **Interface intuitive** : Recherche en temps réel
- ✅ **Suggestions visuelles** : Icônes et informations détaillées

#### 🔮 Fonctionnalités futures :

- 🗺️ **Recherche sur carte** : Sélection visuelle sur une carte
- 📍 **Géolocalisation** : Utiliser la position actuelle
- ⭐ **Favoris** : Sauvegarder les lieux fréquemment utilisés
- 🏷️ **Tags** : Catégoriser les types de lieux

---

## Test de la fonctionnalité

Pour tester la recherche de lieux :

1. **Ouvrez l'app** TripShare
2. **Créez un nouveau voyage**
3. **Dans l'étape "Informations de base"**
4. **Tapez dans le champ "Destination"** :
   - "Tour Eiffel"
   - "Parc Güell" 
   - "Times Square"
   - "Sagrada Familia"

Les suggestions apparaîtront automatiquement avec les coordonnées GPS !

🎉 **La recherche de lieux est maintenant opérationnelle !** 