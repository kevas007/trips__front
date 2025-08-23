// === babel.config.js - CONFIGURATION CORRIGÉE POUR JSX ===

module.exports = function(api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Configuration JSX moderne
          jsxRuntime: 'automatic',
          jsxImportSource: 'react',
        }
      ]
    ],
    plugins: [
      // Plugin pour les alias de modules
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
      ],
      
      // Plugin pour React JSX automatique
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: 'react'
        }
      ],
      
      // Plugins essentiels pour JSC
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      
      // Support des class properties avec loose mode pour JSC
      [
        '@babel/plugin-proposal-class-properties',
        { loose: true }
      ],
      
      // Support des decorators
      [
        '@babel/plugin-proposal-decorators',
        { legacy: true }
      ],
      
      // Plugin pour React Native
      '@babel/plugin-transform-react-jsx-source',
      
      // Optimisations conditionnelles pour la production
      ...(isProduction ? [
        // Supprimer les console.log en production
        'transform-remove-console',
      ] : []),
    ],
    
    // Configuration spécifique pour JSC
    env: {
      production: {
        plugins: [
          'transform-remove-console'
        ]
      }
    }
  };
};