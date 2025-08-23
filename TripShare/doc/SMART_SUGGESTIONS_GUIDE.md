# 🧠 Guide du Système de Suggestions Intelligentes

## 📋 Vue d'ensemble

Le système de suggestions intelligentes de TripShare combine les préférences utilisateur, les likes de la communauté et les données générées par IA pour proposer des destinations personnalisées et pertinentes.

## 🏗️ Architecture du système

### 1. **Base de données**
- **`user_destination_preferences`** : Préférences des utilisateurs
- **`ai_generated_destinations`** : Destinations enrichies par IA
- **`destination_likes`** : Likes des utilisateurs
- **`suggestion_stats`** : Statistiques quotidiennes
- **`ai_update_logs`** : Logs des mises à jour IA

### 2. **Services**
- **Frontend** : `SmartSuggestionsService` (TypeScript)
- **Backend** : `SmartSuggestionsService` (Go)
- **Base de données** : PostgreSQL avec triggers automatiques
- **IA Automatique** : ChatGPT API avec mise à jour mensuelle

### 3. **Automatisation**
- **Script Go** : `chatgpt_ai_updater.go` - Génère de nouvelles destinations
- **Cron Jobs** : Mises à jour automatiques 2 fois par mois
- **Logs** : Suivi des mises à jour et des erreurs

## 🚀 Installation et configuration

### 1. **Migration de la base de données**

```bash
# Dans le dossier tripshare-backend
migrate -path migrations -database "postgres://user:password@localhost:5432/tripshare?sslmode=disable" up
```

### 2. **Configuration ChatGPT (IA automatique)**

```bash
# Aller dans le dossier scripts
cd tripshare-backend/scripts

# Copier le fichier de configuration
cp chatgpt.env.example .env

# Éditer le fichier .env et ajouter votre clé API OpenAI
# Obtenez votre clé sur: https://platform.openai.com/api-keys
nano .env

# Configurer l'automatisation
chmod +x setup_chatgpt_automation.sh
./setup_chatgpt_automation.sh
```

### 3. **Alimentation des données d'exemple**

```bash
# Compiler et exécuter le script de seed
go run seed_smart_suggestions.go

# Tester l'intégration ChatGPT
./test_chatgpt_update.sh

# Lancer une mise à jour manuelle
./run_chatgpt_update.sh
```

### 4. **Configuration de l'environnement**

```env
# .env
API_BASE_URL=http://localhost:8080
DATABASE_URL=postgres://user:password@localhost:5432/tripshare?sslmode=disable
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 Utilisation

### 1. **Frontend - Composant React**

```tsx
import SmartDestinationSuggestions from '../components/places/SmartDestinationSuggestions';

// Dans votre composant
<SmartDestinationSuggestions
  onDestinationSelect={(destination) => {
    // Gérer la sélection de destination
    console.log('Destination sélectionnée:', destination);
  }}
  tripType="cultural"
  maxSuggestions={6}
  showFilters={true}
/>
```

### 2. **Service TypeScript**

```typescript
import { SmartSuggestionsService } from '../services/smartSuggestionsService';

// Obtenir des suggestions intelligentes
const suggestions = await SmartSuggestionsService.getSmartSuggestions(
  userId,
  {
    tripType: 'cultural',
    budget: 'medium',
    duration: 5,
    continent: 'Europe',
    maxResults: 10
  }
);

// Liker une destination
await SmartSuggestionsService.likeDestination(userId, destinationId);

// Sauvegarder une préférence
await SmartSuggestionsService.saveUserPreference({
  user_id: userId,
  destination_id: 'paris-france',
  destination_name: 'Paris',
  destination_country: 'France',
  rating: 5,
  trip_type: 'cultural',
  budget_level: 'medium',
  duration_days: 5,
  liked_places: ['tour-eiffel', 'louvre']
});
```

### 3. **Backend - API Go**

```go
// Initialiser le service
smartSuggestionsService := services.NewSmartSuggestionsService(db)

// Obtenir des suggestions
suggestions, err := smartSuggestionsService.GetSmartSuggestions(ctx, request)

// Liker une destination
err := smartSuggestionsService.LikeDestination(ctx, userID, destinationID)

// Obtenir les statistiques
stats, err := smartSuggestionsService.GetSuggestionStats(ctx)
```

## 🧮 Algorithme de scoring

Le système utilise un algorithme de scoring multi-facteurs :

### **Score de pertinence = Base + Bonus + Filtres**

1. **Score de base IA** (0-1)
   - Score de pertinence généré par l'IA

2. **Bonus de popularité** (0-0.3)
   - Basé sur le nombre de likes
   - Formule : `min(total_likes / 100, 0.3)`

3. **Bonus de tendance** (0-0.2)
   - Destinations "en vogue" (trending = "rising")

4. **Correspondance utilisateur** (0-0.4)
   - Similarité géographique (0.4)
   - Type de voyage (0.3)
   - Budget (0.2)
   - Durée (0.1)
   - Note utilisateur (0.2 si ≥ 4/5)

5. **Filtres appliqués**
   - Type de voyage : +0.3
   - Budget adapté : +0.2
   - Continent : +0.15
   - Nouvelle destination : +0.1

## 📊 Types de données

### **AIGeneratedDestination**
```typescript
{
  id: string;
  name: string;
  display_name: string;
  country: string;
  continent: string;
  coordinates: { latitude: number; longitude: number };
  
  // Données IA
  ai_score: number; // 0-100
  popularity_trend: 'rising' | 'stable' | 'declining';
  trending_reasons: string[];
  
  // Catégorisation
  primary_category: string;
  ai_tags: string[];
  
  // Recommandations
  best_time_to_visit: string[];
  suggested_duration: string;
  cost_estimate: {
    budget: 'low' | 'medium' | 'high';
    daily_cost_range: string;
    accommodation_cost: string;
  };
  
  // Contenu IA
  ai_description: string;
  ai_highlights: string[];
  ai_tips: string[];
  
  // Statistiques
  total_likes: number;
  average_rating: number;
  review_count: number;
}
```

### **UserDestinationPreference**
```typescript
{
  user_id: string;
  destination_id: string;
  destination_name: string;
  destination_country: string;
  rating: number; // 1-5
  trip_type: 'cultural' | 'beach' | 'adventure' | 'city' | 'nature';
  budget_level: 'low' | 'medium' | 'high';
  duration_days: number;
  liked_places: string[];
}
```

## 🔄 Flux de données

### **1. Suggestions intelligentes**
```
Utilisateur → Préférences → Destinations populaires → Destinations IA → Scoring → Tri → Résultats
```

### **2. Mise à jour des likes**
```
Like utilisateur → Trigger DB → Mise à jour total_likes → Recalcul suggestions
```

### **3. Alimentation IA**
```
IA externe → Génération contenu → Insertion DB → Logs → Statistiques
```

## 🛠️ Maintenance et monitoring

### **1. Mise à jour automatique avec ChatGPT**
```bash
# Vérifier les mises à jour automatiques
crontab -l

# Lancer une mise à jour manuelle
cd tripshare-backend/scripts
./run_chatgpt_update.sh

# Vérifier les logs
tail -f logs/chatgpt_update_*.log
```

### **2. Statistiques quotidiennes**
```sql
-- Calcul automatique via trigger
SELECT * FROM suggestion_stats WHERE date = CURRENT_DATE;
```

### **3. Logs IA**
```sql
-- Suivi des mises à jour IA
SELECT * FROM ai_update_logs ORDER BY created_at DESC LIMIT 10;
```

### **4. Performance**
```sql
-- Index pour optimiser les requêtes
CREATE INDEX idx_ai_destinations_ai_score ON ai_generated_destinations(ai_score);
CREATE INDEX idx_ai_destinations_total_likes ON ai_generated_destinations(total_likes);
```

## 🚀 Évolution future

### **1. Intégration IA externe** ✅ **IMPLÉMENTÉ**
- ✅ API OpenAI (ChatGPT) pour génération de contenu
- 🔄 Analyse de sentiment des avis
- 🔄 Prédiction de tendances

### **2. Personnalisation avancée**
- Apprentissage automatique des préférences
- Recommandations collaboratives
- Segmentation utilisateur

### **3. Analytics avancés**
- Dashboard de performance
- A/B testing des suggestions
- Métriques d'engagement

## 🔧 Dépannage

### **Problèmes courants**

1. **Suggestions vides**
   - Vérifier les données dans `ai_generated_destinations`
   - Contrôler les préférences utilisateur
   - Vérifier les filtres appliqués

2. **Performance lente**
   - Vérifier les index de base de données
   - Optimiser les requêtes
   - Mettre en place du cache

3. **Erreurs de scoring**
   - Vérifier la cohérence des données
   - Contrôler les algorithmes de scoring
   - Valider les types de données

### **Logs utiles**
```bash
# Logs de l'application
tail -f logs/app.log | grep "SmartSuggestions"

# Logs de base de données
tail -f logs/postgresql.log | grep "suggestion"
```

## 📚 Ressources

- [Documentation API](api/README.md)
- [Guide de migration](migrations/README.md)
- [Tests unitaires](tests/smart_suggestions_test.go)
- [Dashboard analytics](analytics/README.md)

---

**Note** : Ce système est conçu pour évoluer avec l'ajout de nouvelles destinations et l'amélioration des algorithmes IA. Les mises à jour sont automatiques via les triggers de base de données.
