# 📱 Configuration Appareils Physiques

## 🎯 Problème
Les appareils physiques ne peuvent pas accéder au backend via `10.0.2.2` (spécifique à l'émulateur).

## 🔧 Solution

### 1. IP Locale Configurée
- **IP de votre machine :** `192.168.0.220`
- **Port backend :** `8085`
- **URL complète :** `http://192.168.0.220:8085`

### 2. Configuration Actuelle
```typescript
// Android et iOS utilisent maintenant
baseUrl: 'http://192.168.0.220:8085'
```

### 3. Vérifications

#### Backend Accessible
```bash
# Vérifier que le backend répond
curl http://192.168.0.220:8085/health
```

#### Appareil sur le même réseau
- L'appareil physique doit être connecté au même réseau WiFi
- Vérifier que le pare-feu Windows autorise le port 8085

### 4. Test de Connexion

#### Dans l'app
1. Appuyer sur l'icône WiFi dans le header
2. Vérifier les logs :
   ```
   📱 Android détecté - Utilisation de 192.168.0.220:8085
   ✅ API accessible: OK
   ```

#### Logs attendus
```
🔍 Configuration API: { baseUrl: 'http://192.168.0.220:8085' }
🚀 POST http://192.168.0.220:8085/api/v1/auth/login
✅ Connexion réussie
```

### 5. Dépannage

#### Si l'appareil ne se connecte pas :
1. **Vérifier le réseau :**
   - Appareil et PC sur le même WiFi
   - Pas de VPN qui bloque la connexion

2. **Vérifier le pare-feu :**
   - Autoriser le port 8085 dans Windows Defender
   - Désactiver temporairement le pare-feu pour tester

3. **Vérifier l'IP :**
   ```powershell
   Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"}
   ```

4. **Tester la connectivité :**
   - Ouvrir `http://192.168.0.220:8085/health` dans le navigateur du PC
   - Doit retourner "OK"

### 6. Configuration Alternative

Si l'IP change, modifier dans `src/config/api.ts` :
```typescript
network: {
  baseUrl: 'http://NOUVELLE_IP:8085',
  name: 'Physical Devices + PostgreSQL'
}
```

## ✅ Résultat Attendu

- **Appareils physiques** : Connexion au backend via `192.168.0.220:8085`
- **Émulateurs** : Connexion via `10.0.2.2:8085` (si configuré)
- **Web** : Connexion via `localhost:8085` 