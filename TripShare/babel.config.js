// === babel.config.js - CONFIGURATION OPTIMISÉE PRODUCTION ===

module.exports = function(api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Optimisations pour la production
          jsxImportSource: 'react',
          jsxRuntime: 'automatic',
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
      
      // Optimisations conditionnelles pour la production
      ...(isProduction ? [
        // Supprimer les console.log en production
        'transform-remove-console',
        
        // Optimiser les imports React
        [
          '@babel/plugin-transform-react-jsx',
          {
            runtime: 'automatic',
            importSource: 'react'
          }
        ]
      ] : []),
      
      // Optimisations pour toutes les plateformes
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      
      // Support des class properties
      [
        '@babel/plugin-proposal-class-properties',
        { loose: true }
      ],
      
      // Support des decorators
      [
        '@babel/plugin-proposal-decorators',
        { legacy: true }
      ]
    ],
    
    // Optimisations par environnement
    env: {
      production: {
        plugins: [
          // Tree shaking optimisé
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    }
  };
};