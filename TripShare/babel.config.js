// === babel.config.js - CONFIGURATION SIMPLIFIÉE ===

module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
      // Plugin pour React Native Gesture Handler (OBLIGATOIRE)
    
      
      // Plugin pour les alias de modules (optionnel mais recommandé)
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/contexts': './src/contexts',
            '@/hooks': './src/hooks',
            '@/constants': './src/constants',
            '@/types': './src/types',
            '@/navigation': './src/navigation',
            '@/assets': './assets'
          }
        }
      ]
    ]
  };
};