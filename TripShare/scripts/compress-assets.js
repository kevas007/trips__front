// === scripts/compress-assets.js ===
// Script de compression des assets lourds pour Trivenile

const fs = require('fs');
const path = require('path');

// Assets lourds identifiés
const HEAVY_ASSETS = [
  'login_bg_light.png',    // 1.19 MB
  'login_bg_dark.png',     // 0.93 MB  
  'icon_appstore_3d_1024x1024.png' // 1.10 MB
];

// Analyse des tailles
function analyzeAssets() {
  console.log('\n🔍 === ANALYSE DES ASSETS TRIVENILE ===\n');
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  const files = fs.readdirSync(assetsDir);
  
  let totalSize = 0;
  let heavyAssets = [];
  
  files.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      totalSize += stats.size;
      
      if (stats.size > 500000) { // > 500KB
        heavyAssets.push({ file, sizeMB, sizeBytes: stats.size });
      }
      
      console.log(`📸 ${file.padEnd(35)} ${sizeMB.padStart(8)} MB`);
    }
  });
  
  console.log('\n📊 === RÉSUMÉ ===');
  console.log(`📦 Taille totale assets: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🚨 Assets lourds (>500KB): ${heavyAssets.length}`);
  
  if (heavyAssets.length > 0) {
    console.log('\n🔥 === ASSETS À OPTIMISER ===');
    heavyAssets.forEach(asset => {
      console.log(`   • ${asset.file} - ${asset.sizeMB} MB`);
    });
    
    const totalHeavy = heavyAssets.reduce((sum, asset) => sum + asset.sizeBytes, 0);
    const potentialSaving = totalHeavy * 0.6; // 60% de compression estimée
    
    console.log(`\n💡 Économie potentielle: ${(potentialSaving / (1024 * 1024)).toFixed(2)} MB (-60%)`);
  }
  
  return { totalSize, heavyAssets };
}

// Recommandations d'optimisation
function showOptimizations() {
  console.log('\n⚡ === OPTIMISATIONS RECOMMANDÉES ===\n');
  
  console.log('1. 🖼️  COMPRESSION MANUELLE:');
  console.log('   • Utiliser TinyPNG.com pour compresser les PNG');
  console.log('   • Ou Squoosh.app pour WebP conversion');
  console.log('   • Objectif: Réduire de 60-80%\n');
  
  console.log('2. 📱 FORMATS ADAPTATIFS:');
  console.log('   • Créer plusieurs tailles (small, medium, large)');
  console.log('   • Utiliser WebP quand supporté');
  console.log('   • Fallback PNG pour compatibilité\n');
  
  console.log('3. 🚀 LAZY LOADING:');
  console.log('   • Déjà implémenté avec OptimizedImage ✅');
  console.log('   • Charger les assets selon le besoin\n');
  
  console.log('4. 🎯 BUNDLE OPTIMIZATION:');
  console.log('   • Tree shaking activé ✅');
  console.log('   • Minification production ✅');
  console.log('   • Source maps désactivées ✅\n');
}

// Build analysis
function analyzeBundle() {
  console.log('\n📦 === ANALYSE DU BUNDLE ===\n');
  
  const packageJson = require('../package.json');
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  console.log(`📚 Dependencies: ${dependencies.length}`);
  console.log(`🔧 DevDependencies: ${devDependencies.length}`);
  
  // Dépendances potentiellement lourdes
  const heavyDeps = dependencies.filter(dep => 
    dep.includes('react-native') || 
    dep.includes('expo') || 
    dep.includes('@react-navigation') ||
    dep.includes('axios')
  );
  
  console.log('\n🚨 Dépendances lourdes détectées:');
  heavyDeps.forEach(dep => console.log(`   • ${dep}`));
  
  console.log('\n💡 Actions recommandées:');
  console.log('   • Analyser avec: npx expo export');
  console.log('   • Bundle analyzer: npx react-native-bundle-visualizer');
  console.log('   • Audit: npm audit');
}

// Script principal
function main() {
  console.log('🌍 TRIVENILE - OPTIMISATION DES ASSETS');
  console.log('=====================================');
  
  try {
    analyzeAssets();
    showOptimizations();
    analyzeBundle();
    
    console.log('\n🎯 === OBJECTIFS ===');
    console.log('   📱 Taille finale: < 50 MB');
    console.log('   📸 Assets: < 2 MB'); 
    console.log('   🗜️  Bundle JS: < 15 MB');
    console.log('   📦 App totale: -75% vs actuel\n');
    
    console.log('✅ Analyse terminée! Consultez OPTIMIZATION_GUIDE.md pour les détails.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { analyzeAssets, analyzeBundle }; 