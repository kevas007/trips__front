# 🚀 Configuration API Locale - TripShare

> **Configuration pour développement local uniquement**  
> Pas de mise en production prévue pour le moment

## 📋 Prérequis

1. **Backend Docker** lancé dans `tripshare-backend/`
2. **Redis** inclus dans le docker-compose
3. **Expo CLI** installé

## 🐳 Démarrage du Backend

```bash
# Dans tripshare-backend/
docker-compose up -d

# Vérification
curl http://localhost:8000
```

## 📱 Configuration Frontend

### Configuration actuelle
- **Fichier** : `src/config/api.ts`
- **Environnement** : `docker` (par défaut)
- **URL Web** : `http://localhost:8000`
- **URL Android** : `http://10.0.2.2:8000`

### Basculer entre les modes

#### Mode Docker (défaut)
```typescript
// src/config/api.ts
const CURRENT_ENV = 'docker';
```
- ✅ Web : `http://localhost:8000`
- ✅ Android Emulator : `http://10.0.2.2:8000`
- ✅ iOS Simulator : `http://localhost:8000`

#### Mode Network (pour devices physiques)
```typescript
// src/config/api.ts
const CURRENT_ENV = 'network';
```
- ✅ Tous devices : `http://192.168.0.220:8000`
- ⚠️ **Changez l'IP** selon votre réseau local

## 🔧 Démarrage complet

### 1. Backend
```bash
cd tripshare-backend
docker-compose up -d
```

### 2. Frontend
```bash
cd TripShare
npm start
```

### 3. Vérification
```bash
# Test backend
curl http://localhost:8000

# Logs backend
docker-compose logs -f backend
```

## 🐛 Debug

### Problèmes courants

1. **Erreur 404 `/api/v1`**
   - ✅ **CORRIGÉ** : Plus d'ajout automatique de `/api/v1`

2. **Connection refused**
   - Vérifiez que Docker tourne : `docker ps`
   - Redémarrez : `docker-compose restart`

3. **Android emulator ne peut pas joindre**
   - Utilisez `10.0.2.2:8000` au lieu de `localhost:8000`
   - C'est géré automatiquement dans la config

4. **Device physique ne peut pas joindre**
   - Changez vers `CURRENT_ENV = 'network'`
   - Vérifiez votre IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)

### Commandes de diagnostic

```bash
# Test réseau
npx expo start --tunnel  # Pour devices physiques

# Logs détaillés
# Les logs API sont automatiquement activés en développement
```

## 📊 Architecture Actuelle

```
Frontend (Expo)     Backend (Docker)     Redis
     ↓                     ↓               ↓
Port 19000,19001     Port 8000        Port 6379
     ↓                     ↓               ↓
  Web/Mobile    ←→    Go API Server  ←→  Database
```

## 💡 Notes de développement

- **Logs automatiques** : Activés par défaut
- **Hot reload** : Supporté côté frontend
- **CORS** : Configuré pour localhost
- **Timeout** : 10s (optimisé pour local)

---

## 🔄 Changements récents

- ✅ Configuration centralisée dans `src/config/api.ts`
- ✅ Plus de URLs hardcodées
- ✅ Support automatique Android emulator
- ✅ Suppression des références `/api/v1`
- ✅ Logs de debug améliorés 