#!/usr/bin/env node

// ========== SCRIPT DE DÉMARRAGE BACKEND LOCAL ==========

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 === DÉMARRAGE DU BACKEND TRIPSHARE LOCAL ===\n');

// Configuration
const BACKEND_DIR = '../tripshare-backend';
const BACKEND_PORT = 8085;
const API_ENDPOINT = `http://localhost:${BACKEND_PORT}/api/v1`;

console.log(`📂 Dossier backend: ${BACKEND_DIR}`);
console.log(`🌐 Port backend: ${BACKEND_PORT}`);
console.log(`📡 API endpoint: ${API_ENDPOINT}\n`);

// Fonction pour exécuter une commande
function runCommand(command, directory = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Exécution: ${command}`);
    console.log(`📁 Dans: ${directory}\n`);
    
    const child = exec(command, { cwd: directory }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`⚠️ Warning: ${stderr}`);
      }
      console.log(`✅ Succès: ${stdout}`);
      resolve(stdout);
    });

    // Afficher la sortie en temps réel
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

// Fonction principale
async function startBackend() {
  try {
    // 1. Vérifier que le dossier backend existe
    const backendPath = path.resolve(__dirname, BACKEND_DIR);
    console.log(`🔍 Vérification du backend dans: ${backendPath}`);
    
    // 2. Installer les dépendances Go si nécessaire
    console.log('📦 Installation des dépendances Go...');
    await runCommand('go mod tidy', backendPath);
    
    // 3. Démarrer le serveur
    console.log(`🚀 Démarrage du serveur sur le port ${BACKEND_PORT}...`);
    await runCommand('go run cmd/main.go', backendPath);
    
  } catch (error) {
    console.error('❌ Échec du démarrage du backend:', error.message);
    console.log('\n📋 === AIDE AU DÉPANNAGE ===');
    console.log('1. Vérifiez que Go est installé: go version');
    console.log('2. Vérifiez que le dossier backend existe');
    console.log('3. Vérifiez la configuration de la base de données');
    console.log(`4. Testez manuellement: cd ${BACKEND_DIR} && go run cmd/main.go`);
    process.exit(1);
  }
}

// Instructions d'usage
console.log('📋 === INSTRUCTIONS ===');
console.log('1. Ce script va démarrer le backend TripShare en local');
console.log('2. Le frontend est configuré pour pointer vers localhost:8085');
console.log('3. Utilisez Ctrl+C pour arrêter le serveur');
console.log('4. Modifiez src/config/api.ts pour changer l\'environnement\n');

// Démarrer
startBackend(); 