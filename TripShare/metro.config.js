// === metro.config.js - CONFIGURATION OPTIMISÉE POUR PRODUCTION ===

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Obtenir la configuration par défaut d'Expo
const config = getDefaultConfig(__dirname);

// ═══════════════════════════════════════
// Configuration du resolver
config.resolver = {
  ...config.resolver,
  
  // Alias pour les imports absolus (@/...)
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/screens': path.resolve(__dirname, 'src/screens'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/contexts': path.resolve(__dirname, 'src/contexts'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/constants': path.resolve(__dirname, 'src/constants'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/navigation': path.resolve(__dirname, 'src/navigation'),
    '@/assets': path.resolve(__dirname, 'assets'),
  },

  // Extensions de fichiers supportées
  sourceExts: [
    ...config.resolver.sourceExts,
    'js',
    'jsx',
    'ts',
    'tsx',
    'json'
  ],

  // Plateformes supportées
  platforms: ['ios', 'android', 'web'],
};

// ═══════════════════════════════════════
// Configuration du transformer OPTIMISÉE
config.transformer = {
  ...config.transformer,
  
  // Configuration pour les assets
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  
  // Minification pour production
  minifierConfig: {
    // Optimisations JavaScript
    output: {
      ascii_only: true,
      comments: false,
      inline_script: false,
    },
    // Compression maximale
    compress: {
      // Tree shaking agressif
      dead_code: true,
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
      keep_infinity: false,
      reduce_vars: true,
      unused: true,
      // Optimisations supplémentaires
      collapse_vars: true,
      evaluate: true,
      hoist_funs: true,
      join_vars: true,
      loops: true,
      negate_iife: true,
      properties: true,
      sequences: true,
      side_effects: true,
      switches: true,
      typeofs: true,
    },
    mangle: {
      toplevel: false,
    },
  },
};

// ═══════════════════════════════════════
// Configuration pour ignorer les fichiers inutiles
config.resolver.blockList = [
  // Ignorer les fichiers de test
  /.*\/__tests__\/.*/,
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\.spec\.(js|jsx|ts|tsx)$/,
  
  // Ignorer les fichiers de documentation et config
  /.*\/\.git\/.*/,
  /.*\/\.DS_Store$/,
  /.*\/Thumbs\.db$/,
  /.*\/\.md$/,
  /.*\/LICENSE$/,
  /.*\/CHANGELOG/,
  
  // Éviter les conflits de node_modules imbriqués
  /.*\/node_modules\/.*\/node_modules\/.*/,
  
  // Ignorer les sources maps en production
  ...(process.env.NODE_ENV === 'production' ? [/.*\.map$/] : []),
];

// ═══════════════════════════════════════
// Optimisations pour la taille du bundle
if (process.env.NODE_ENV === 'production') {
  // Désactiver les source maps pour réduire la taille
  config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'map');
  
  // Optimiser les assets
  config.transformer.assetRegistryPath = 'react-native/Libraries/Image/AssetRegistry';
}

// Exporter la configuration
module.exports = config;