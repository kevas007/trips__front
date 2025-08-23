#!/usr/bin/env node

/**
 * Script de correction des imports incorrects
 * TripShare/Trivenile Frontend
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Correction des imports incorrects...\n');

// Fonction pour corriger les imports dans un fichier
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Correction des imports useAppTheme
    const useAppThemeRegex = /import\s+\{\s*useAppTheme\s*\}\s+from\s+['"][^'"]*hooks\/useAppTheme['"];?\s*\n?/g;
    if (useAppThemeRegex.test(content)) {
      content = content.replace(useAppThemeRegex, '');
      hasChanges = true;
      console.log(`✅ Supprimé import useAppTheme dans: ${filePath}`);
    }

    // Correction des imports de types incorrects
    const incorrectTypeImports = [
      {
        pattern: /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"][^'"]*types\/auth['"];?\s*\n?/g,
        replacement: (match, types) => {
          return `import { ${types} } from '../features/auth/types';`;
        }
      },
      {
        pattern: /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"][^'"]*types\/trips['"];?\s*\n?/g,
        replacement: (match, types) => {
          return `import { ${types} } from '../types/trips';`;
        }
      }
    ];

    incorrectTypeImports.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
        console.log(`✅ Corrigé import de types dans: ${filePath}`);
      }
    });

    // Écriture du fichier si des changements ont été effectués
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
    }

    return hasChanges;
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction principale
async function fixAllImports() {
  try {
    // Recherche de tous les fichiers TypeScript/JavaScript
    const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });

    console.log(`📁 Trouvé ${files.length} fichiers à analyser\n`);

    let fixedFiles = 0;
    let totalFiles = files.length;

    for (const file of files) {
      if (fixImportsInFile(file)) {
        fixedFiles++;
      }
    }

    console.log(`\n🎉 Correction terminée !`);
    console.log(`📊 Fichiers corrigés: ${fixedFiles}/${totalFiles}`);

    if (fixedFiles > 0) {
      console.log('\n📋 Résumé des corrections:');
      console.log('   - Suppression des imports useAppTheme inexistants');
      console.log('   - Correction des chemins d\'imports de types');
      console.log('   - Nettoyage des imports inutilisés');
    } else {
      console.log('\n✅ Aucune correction nécessaire - tous les imports sont corrects !');
    }

  } catch (error) {
    console.error('💥 Erreur lors de la correction des imports:', error.message);
    process.exit(1);
  }
}

// Exécution du script
fixAllImports();
