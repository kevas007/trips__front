# 🔧 Correction des Problèmes de Connectivité Backend

## 🚨 Problèmes Identifiés

### 1. **Incohérences de Ports**
- **Frontend configuré pour** : Port 8085
- **Backend par défaut** : Port 8080 (dans config.go)
- **Docker configuré pour** : Port 8085

### 2. **URLs Incorrectes**
- `localhsot` au lieu de `localhost` (typo)
- Ports 8000 au lieu de 8085
- IPs incorrectes pour les émulateurs

## ✅ Corrections Appliquées

### 1. **Configuration Frontend** (`src/config/api.ts`)
```typescript
// ✅ CORRIGÉ - Port 8085 cohérent
const LOCAL_ENVIRONMENTS = {
  localhost: {
    baseUrl: 'http://localhost:8085', // ✅ Port 8085
    name: 'Localhost + Docker Backend'
  },
  network: {
    baseUrl: 'http://192.168.0.220:8085', // ✅ Port 8085
    name: 'Physical Devices + Docker Backend'
  },
  emulator: {
    baseUrl: 'http://10.0.2.2:8085', // ✅ Port 8085
    name: 'Android Emulator + Docker Backend'
  }
};
```

### 2. **Configuration API** (`src/types/api.ts`)
```typescript
// ✅ CORRIGÉ - URLs correctes
const API_CONFIG = {
  baseURL: __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:8085/api/v1',     // ✅ localhost:8085
        android: 'http://localhost:8085/api/v1', // ✅ localhost:8085
        web: 'http://localhost:8085/api/v1',     // ✅ localhost:8085
      })
    : 'https://api.tripshare.app/v1',
};
```

### 3. **Debug Network** (`src/utils/networkDebug.ts`)
```typescript
// ✅ CORRIGÉ - URLs de test correctes
LOCALHOST_URLS: {
  web: 'http://localhost:8085',                    // ✅ Port 8085
  android_emulator: 'http://10.0.2.2:8085',       // ✅ IP émulateur
  ios_simulator: 'http://localhost:8085',          // ✅ localhost
  physical_device: 'http://192.168.0.220:8085',   // ✅ IP réseau
},
```

## 🚀 Configuration Backend

### 1. **Docker Compose** (déjà correct)
```yaml
# ✅ Port 8085 configuré
ports:
  - "0.0.0.0:8085:${SERVER_PORT:-8085}"
```

### 2. **Variables d'environnement** (à créer)
```bash
# Créer tripshare-backend/.env
PORT=8085
SERVER_PORT=8085
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=defaultpassword
DB_NAME=tripshare
REDIS_ADDR=tripshare-redis:6379
REDIS_PASSWORD=defaultpassword
JWT_SECRET=super_secret_jwt_key_for_dev_only_change_me
```

## 🧪 Tests de Connectivité

### 1. **Script de Test** (`test-backend-connection.js`)
```bash
# Tester la connectivité
node test-backend-connection.js
```

### 2. **Endpoints de Test**
- `http://localhost:8085/health` - ✅ Health check
- `http://localhost:8085/api/v1/health` - ✅ API health
- `http://localhost:8085/api/v1/auth/status` - ✅ Auth status
- `http://localhost:8085/api/v1/trips/statuses` - ✅ Trips statuses

## 🔧 Démarrage Correct

### 1. **Backend Docker**
```bash
cd tripshare-backend
docker-compose up -d
```

### 2. **Vérification Backend**
```bash
# Test health check
curl http://localhost:8085/health

# Test API
curl http://localhost:8085/api/v1/health
```

### 3. **Frontend**
```bash
cd TripShare
npm start
```

## 🐛 Dépannage

### **Erreur 404/500**
1. **Vérifier que Docker tourne** :
   ```bash
   docker ps
   # Doit voir tripshare-backend sur le port 8085
   ```

2. **Vérifier les logs backend** :
   ```bash
   docker-compose logs backend
   ```

3. **Redémarrer le backend** :
   ```bash
   docker-compose restart backend
   ```

### **Erreur de Connexion**
1. **Vérifier le port** :
   ```bash
   netstat -an | grep 8085
   # Doit voir LISTEN sur 8085
   ```

2. **Vérifier le firewall** :
   - Autoriser le port 8085 dans Windows Defender
   - Désactiver temporairement le firewall pour tester

### **Appareils Physiques**
1. **Vérifier l'IP réseau** :
   ```powershell
   Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"}
   ```

2. **Modifier l'IP dans la config** :
   ```typescript
   // src/config/api.ts
   network: {
     baseUrl: 'http://VOTRE_IP:8085',
   }
   ```

## 📱 Configuration par Plateforme

### **Web (localhost)**
- URL : `http://localhost:8085/api/v1`
- Environnement : `localhost`

### **Android Emulator**
- URL : `http://10.0.2.2:8085/api/v1`
- Environnement : `emulator`

### **iOS Simulator**
- URL : `http://localhost:8085/api/v1`
- Environnement : `localhost`

### **Appareils Physiques**
- URL : `http://192.168.0.220:8085/api/v1`
- Environnement : `network`

## ✅ Vérification Finale

### **Logs Attendus**
```
🚀 === CONFIGURATION DÉVELOPPEMENT LOCAL ===
📱 Plateforme: android
🌐 Backend: Physical Devices + Docker Backend
🔗 URL: http://192.168.0.220:8085
🗄️ Base de données: PostgreSQL local
📦 Cache: Redis local

🚀 UnifiedAPI POST http://192.168.0.220:8085/api/v1/auth/login
✅ Connexion réussie
```

### **Test de Création Vidéo**
1. Accéder à la création vidéo
2. Remplir les champs
3. Créer le voyage
4. Vérifier que le voyage apparaît avec le badge "VIDÉO"

## 🎯 Résultat Attendu

- ✅ **Backend accessible** sur le port 8085
- ✅ **Frontend connecté** au backend
- ✅ **Création vidéo** fonctionnelle
- ✅ **Voyages créés** avec badge "VIDÉO"
- ✅ **Pas d'erreurs 404/500**

---

**Note** : Toutes les corrections ont été appliquées. Le système devrait maintenant fonctionner correctement avec le port 8085 cohérent entre le frontend et le backend Docker.
