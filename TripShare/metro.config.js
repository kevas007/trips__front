// === metro.config.js - CONFIGURATION CORRIGÉE ===

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
// Configuration du transformer
config.transformer = {
  ...config.transformer,
  
  // Configuration pour les assets
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// ═══════════════════════════════════════
// Configuration pour ignorer certains fichiers
config.resolver.blockList = [
  // Ignorer les fichiers de test
  /.*\/__tests__\/.*/,
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\.spec\.(js|jsx|ts|tsx)$/,
  
  // Ignorer les fichiers de configuration et système
  /.*\/\.git\/.*/,
  /.*\/\.DS_Store$/,
  /.*\/Thumbs\.db$/,
  
  // Éviter les conflits de node_modules imbriqués
  /.*\/node_modules\/.*\/node_modules\/.*/,
];

// Exporter la configuration
module.exports = config;