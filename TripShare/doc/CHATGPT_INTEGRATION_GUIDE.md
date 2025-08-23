# 🤖 Guide d'Intégration ChatGPT pour TripShare

## 🎯 Vue d'ensemble

Ce guide explique comment configurer et utiliser **ChatGPT** comme IA automatique pour générer de nouvelles destinations de voyage dans TripShare.

## 🚀 Configuration rapide

### 1. **Obtenir une clé API OpenAI**

1. Allez sur [OpenAI Platform](https://platform.openai.com/api-keys)
2. Créez un compte ou connectez-vous
3. Générez une nouvelle clé API
4. Copiez la clé (elle commence par `sk-`)

### 2. **Configuration du système**

```bash
# Aller dans le dossier scripts
cd tripshare-backend/scripts

# Copier le fichier de configuration
cp chatgpt.env.example .env

# Éditer le fichier .env
nano .env

# Ajouter votre clé API
OPENAI_API_KEY=sk-votre-clé-api-ici
```

### 3. **Installation de l'automatisation**

```bash
# Rendre le script exécutable
chmod +x setup_chatgpt_automation.sh

# Lancer la configuration
./setup_chatgpt_automation.sh
```

## 🧪 Test de l'intégration

### 1. **Test de la configuration**

```bash
# Tester la connexion API et la base de données
./test_chatgpt_update.sh
```

**Résultat attendu :**
```
🧪 Test de la mise à jour ChatGPT...
✅ Connexion API ChatGPT OK
✅ Connexion base de données OK
✅ Tous les tests sont passés
🚀 Vous pouvez maintenant exécuter: ./run_chatgpt_update.sh
```

### 2. **Test manuel**

```bash
# Lancer une mise à jour manuelle
./run_chatgpt_update.sh
```

**Résultat attendu :**
```
🤖 Démarrage mise à jour ChatGPT - [date]
🎯 ChatGPT a généré 6 destinations
✅ Destination ajoutée: Bali, Indonésie (Indonésie)
✅ Destination ajoutée: Santorini, Grèce (Grèce)
✅ Destination ajoutée: Machu Picchu, Pérou (Pérou)
✅ Destination ajoutée: Banff, Canada (Canada)
✅ Destination ajoutée: Zanzibar, Tanzanie (Tanzanie)
✅ Destination ajoutée: Patagonie, Argentine (Argentine)
✅ Mise à jour terminée! 6 nouvelles destinations générées par ChatGPT
```

## ⚙️ Configuration avancée

### 1. **Modifier le prompt ChatGPT**

Éditez le fichier `chatgpt_ai_updater.go` et modifiez la variable `prompt` :

```go
prompt := `Génère 6 nouvelles destinations de voyage tendance au format JSON.
	
Chaque destination doit inclure:
- name: nom simple (ex: "Bali")
- display_name: nom complet (ex: "Bali, Indonésie")
- country: pays
- region: région/état
- continent: continent
- latitude/longitude: coordonnées GPS
- ai_score: score de 70 à 100
- popularity_trend: "rising", "stable", ou "declining"
- trending_reasons: 3 raisons de la tendance
- primary_category: "cultural", "adventure", "nature", "beach", "city", "mountain"
- ai_tags: 5 tags pertinents
- best_time_to_visit: saisons recommandées
- suggested_duration: durée suggérée
- cost_estimate_budget: "low", "medium", "high"
- ai_description: description de 2-3 phrases
- ai_highlights: 4 points forts
- ai_tips: 3 conseils pratiques

Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après.`
```

### 2. **Modifier la fréquence des mises à jour**

#### Linux/Mac (Cron)
```bash
# Éditer le cron job
crontab -e

# Modifier la ligne pour changer la fréquence
# Exemple: tous les 7 jours à 3h du matin
0 3 */7 * * cd /chemin/vers/tripshare-backend/scripts && ./run_chatgpt_update.sh
```

#### Windows (Task Scheduler)
1. Ouvrez "Planificateur de tâches"
2. Modifiez la tâche existante
3. Changez le déclencheur selon vos besoins

### 3. **Configuration des logs**

```bash
# Vérifier les logs récents
ls -la logs/

# Suivre les logs en temps réel
tail -f logs/chatgpt_update_*.log

# Nettoyer les anciens logs (plus de 30 jours)
find logs/ -name "chatgpt_update_*.log" -mtime +30 -delete
```

## 📊 Surveillance et maintenance

### 1. **Vérifier les mises à jour**

```sql
-- Voir les dernières mises à jour
SELECT 
    update_type,
    destinations_added,
    ai_version,
    data_source,
    update_details,
    created_at
FROM ai_update_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. **Vérifier les destinations générées**

```sql
-- Voir les destinations récentes
SELECT 
    name,
    display_name,
    country,
    ai_score,
    popularity_trend,
    total_likes,
    last_ai_update
FROM ai_generated_destinations 
WHERE data_source = 'chatgpt_generated'
ORDER BY last_ai_update DESC 
LIMIT 10;
```

### 3. **Statistiques de performance**

```sql
-- Statistiques des suggestions
SELECT 
    date,
    total_suggestions,
    avg_response_time,
    success_rate
FROM suggestion_stats 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

## 🔧 Dépannage

### **Problèmes courants**

1. **Erreur "OPENAI_API_KEY non définie"**
   ```bash
   # Vérifier la variable d'environnement
   echo $OPENAI_API_KEY
   
   # Si vide, l'ajouter
   export OPENAI_API_KEY="sk-votre-clé-api"
   ```

2. **Erreur "Base de données non accessible"**
   ```bash
   # Vérifier que PostgreSQL est démarré
   sudo systemctl status postgresql
   
   # Démarrer si nécessaire
   sudo systemctl start postgresql
   ```

3. **Erreur "Erreur API ChatGPT"**
   ```bash
   # Vérifier la validité de la clé API
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   
   # Vérifier les quotas
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/usage
   ```

4. **Erreur "Erreur parsing destinations"**
   ```bash
   # Vérifier les logs détaillés
   tail -n 50 logs/chatgpt_update_*.log
   
   # Le problème vient souvent du format JSON retourné par ChatGPT
   # Modifiez le prompt pour être plus spécifique
   ```

### **Logs utiles**

```bash
# Logs de l'application
tail -f logs/chatgpt_update_*.log

# Logs de base de données
tail -f /var/log/postgresql/postgresql-*.log | grep "tripshare"

# Logs système
journalctl -u postgresql -f
```

## 💰 Coûts et quotas

### **Estimation des coûts**

- **GPT-4** : ~$0.03 par 1K tokens
- **6 destinations** : ~2000 tokens par mise à jour
- **2 mises à jour/mois** : ~$0.12/mois

### **Gestion des quotas**

```bash
# Vérifier l'utilisation
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/usage

# Limiter les appels (dans le script)
# Ajouter un délai entre les appels
time.Sleep(1 * time.Second)
```

## 🎯 Personnalisation avancée

### 1. **Modifier les catégories**

Éditez le prompt pour inclure de nouvelles catégories :

```go
// Ajouter de nouvelles catégories
"primary_category": "cultural", "adventure", "nature", "beach", "city", "mountain", "food", "wellness", "historical"
```

### 2. **Ajuster les scores IA**

Modifiez la logique de scoring dans le script :

```go
// Personnaliser les scores selon vos critères
if dest.PopularityTrend == "rising" {
    dest.AIScore += 10
}
```

### 3. **Ajouter des filtres géographiques**

```go
// Filtrer par continent
if dest.Continent == "Europe" {
    // Logique spécifique pour l'Europe
}
```

## 📞 Support

- **Documentation API OpenAI** : [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Guide des modèles** : [https://platform.openai.com/docs/models](https://platform.openai.com/docs/models)
- **Gestion des quotas** : [https://platform.openai.com/docs/guides/rate-limits](https://platform.openai.com/docs/guides/rate-limits)

---

**Note** : Cette intégration ChatGPT permet à TripShare de rester à jour avec les dernières tendances de voyage automatiquement, sans intervention manuelle !
