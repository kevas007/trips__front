#!/usr/bin/env node

/**
 * Script de build pour TripShare/Trivenile Frontend
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️ Build de TripShare Frontend...\n');

// Fonction pour exécuter une commande
function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} terminé avec succès\n`);
        resolve();
      } else {
        console.error(`❌ ${description} échoué avec le code: ${code}`);
        reject(new Error(`${description} échoué`));
      }
    });

    process.on('error', (error) => {
      console.error(`❌ Erreur lors de ${description}:`, error);
      reject(error);
    });
  });
}

async function build() {
  try {
    // Nettoyage
    await runCommand('npm', ['run', 'clean'], 'Nettoyage des fichiers temporaires');
    
    // Linting
    await runCommand('npm', ['run', 'lint'], 'Vérification du code (ESLint)');
    
    // Tests
    await runCommand('npm', ['run', 'test'], 'Exécution des tests');
    
    // Type checking
    await runCommand('npm', ['run', 'type-check'], 'Vérification des types TypeScript');
    
    // Build Expo
    console.log('📱 Build Expo en cours...');
    await runCommand('npx', ['expo', 'build:web'], 'Build pour le web');
    
    console.log('🎉 Build terminé avec succès !');
    console.log('📁 Les fichiers de build sont disponibles dans le dossier dist/');
    
  } catch (error) {
    console.error('💥 Erreur lors du build:', error.message);
    process.exit(1);
  }
}

// Exécution du build
build();
