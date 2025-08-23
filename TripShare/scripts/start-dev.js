#!/usr/bin/env node

/**
 * Script de démarrage pour l'environnement de développement
 * TripShare/Trivenile Frontend
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de TripShare Frontend...\n');

// Vérification des dépendances
console.log('📦 Vérification des dépendances...');
const installProcess = spawn('npm', ['install'], {
  stdio: 'inherit',
  shell: true
});

installProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Dépendances installées avec succès\n');
    
    // Démarrage de l'application
    console.log('🎯 Démarrage de l\'application Expo...');
    const startProcess = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true
    });

    startProcess.on('close', (code) => {
      console.log(`\n🏁 Application arrêtée avec le code: ${code}`);
    });

    startProcess.on('error', (error) => {
      console.error('❌ Erreur lors du démarrage:', error);
    });
  } else {
    console.error('❌ Erreur lors de l\'installation des dépendances');
  }
});

installProcess.on('error', (error) => {
  console.error('❌ Erreur lors de l\'installation:', error);
});
