// Test de connectivité API
const testApiConnection = async () => {
  const urls = [
    'http://localhost:8085/health',
    'http://10.0.2.2:8085/health'
  ];

  console.log('🔍 Test de connectivité API...\n');

  for (const url of urls) {
    try {
      console.log(`📡 Test: ${url}`);
      const response = await fetch(url);
      const data = await response.text();
      console.log(`✅ Succès: ${data}\n`);
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}\n`);
    }
  }
};

// Test si on est dans un environnement Node.js
if (typeof fetch !== 'undefined') {
  testApiConnection();
} else {
  console.log('⚠️ Ce script nécessite fetch() - exécutez-le dans un navigateur ou Node.js 18+');
} 