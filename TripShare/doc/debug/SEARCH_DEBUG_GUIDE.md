# Guide de Débogage - Recherche de Lieux

## 🔍 Problème Identifié
La recherche de lieux ne fonctionne pas : aucune suggestion n'apparaît quand vous tapez dans la barre de recherche.

## ✅ Corrections Apportées

### 1. **Réduction du Seuil de Recherche**
- **Avant** : Minimum 3 caractères
- **Après** : Minimum 2 caractères
- **Raison** : Permettre la recherche avec des termes courts

### 2. **Ajout de Filtres Géographiques**
- **Pays prioritaires** : France, Belgique, Suisse, Canada
- **Paramètre** : `countrycodes=fr,be,ch,ca`
- **Avantage** : Résultats plus pertinents pour l'Europe

### 3. **Amélioration de l'Affichage**
- **Indicateur de chargement** : Visible pendant la recherche
- **Gestion d'erreurs** : Messages d'erreur dans la console
- **Debug logs** : Suivi des requêtes et réponses

### 4. **Debounce Optimisé**
- **Délai** : 300ms au lieu de 500ms
- **Avantage** : Réponse plus rapide

## 🧪 Test de la Recherche

### 1. **Ouvrir la Console de Débogage**
- **Android** : `adb logcat` ou console Expo
- **iOS** : Console Xcode ou console Expo
- **Web** : F12 > Console

### 2. **Tester la Recherche**
1. **Ouvrir la carte** : Cliquer sur 🗺️
2. **Taper "Paris"** dans la barre de recherche
3. **Attendre 300ms** (debounce)
4. **Vérifier les logs** dans la console

### 3. **Logs Attendus**
```
Recherche pour: Paris
Réponse status: 200
Données reçues: 5 résultats
Suggestions mises à jour: 5
```

## 🎯 Tests Recommandés

### **Test 1 : Recherche Simple**
- **Tapez** : "Paris"
- **Attendu** : Suggestions avec Paris, France

### **Test 2 : Recherche Spécifique**
- **Tapez** : "Tour Eiffel"
- **Attendu** : Suggestions avec la Tour Eiffel

### **Test 3 : Recherche Internationale**
- **Tapez** : "Bruxelles"
- **Attendu** : Suggestions avec Bruxelles, Belgique

### **Test 4 : Recherche Courte**
- **Tapez** : "Lyon"
- **Attendu** : Suggestions avec Lyon, France

## 🐛 Diagnostic des Problèmes

### **Si Aucun Log N'Apparaît**
- **Problème** : La fonction de recherche n'est pas appelée
- **Cause** : Erreur dans le debounce ou l'événement onChangeText
- **Solution** : Vérifier la console pour les erreurs JavaScript

### **Si "Recherche pour:" Apparaît Mais Pas de Réponse**
- **Problème** : L'API Nominatim ne répond pas
- **Cause** : Problème de réseau ou API indisponible
- **Solution** : Vérifier la connexion internet

### **Si "Réponse status: 200" Mais Pas de Suggestions**
- **Problème** : L'API répond mais les données sont vides
- **Cause** : Requête trop spécifique ou pas de résultats
- **Solution** : Essayer des termes plus génériques

### **Si "Erreur API:" Apparaît**
- **Problème** : L'API retourne une erreur
- **Cause** : Rate limiting ou problème temporaire
- **Solution** : Attendre quelques secondes et réessayer

## 🔧 Solutions Alternatives

### **Si l'API Nominatim Ne Fonctionne Pas**

#### Option 1 : API Alternative
```javascript
// Utiliser une autre API de géocodage
const response = await fetch(
  `https://api.example.com/search?q=${encodeURIComponent(query)}`
);
```

#### Option 2 : Cache Local
```javascript
// Mettre en cache les résultats récents
const cachedResults = await AsyncStorage.getItem(`search_${query}`);
if (cachedResults) {
  setSearchResults(JSON.parse(cachedResults));
}
```

#### Option 3 : Recherche Hors Ligne
```javascript
// Recherche dans une base de données locale
const localResults = await searchLocalDatabase(query);
setSearchResults(localResults);
```

## 📱 Test sur Appareil Physique

### **Android**
1. **Ouvrir les outils de développement**
2. **Aller dans Console**
3. **Tester la recherche**
4. **Vérifier les logs**

### **iOS**
1. **Ouvrir Xcode**
2. **Aller dans Console**
3. **Tester la recherche**
4. **Vérifier les logs**

## 🎯 Prochaines Étapes

### **Si la Recherche Fonctionne**
1. **Tester avec différents termes**
2. **Vérifier que la carte se centre correctement**
3. **Tester la sélection de lieu**

### **Si la Recherche Ne Fonctionne Toujours Pas**
1. **Vérifier les logs de la console**
2. **Tester la connexion internet**
3. **Essayer une API alternative**
4. **Implémenter un cache local**

## 📋 Checklist de Test

- [ ] Console de débogage ouverte
- [ ] Recherche "Paris" testée
- [ ] Logs "Recherche pour:" visibles
- [ ] Logs "Réponse status: 200" visibles
- [ ] Suggestions apparaissent sous la barre de recherche
- [ ] Clic sur une suggestion centre la carte
- [ ] Marqueur se déplace vers le lieu sélectionné

## 🆘 Support

Si la recherche ne fonctionne toujours pas après ces tests :
1. **Partagez les logs** de la console
2. **Décrivez le comportement** exact
3. **Indiquez l'appareil** utilisé (Android/iOS/Web)
4. **Précisez la version** d'Expo

La recherche devrait maintenant fonctionner avec les améliorations apportées ! 🔍✨ 