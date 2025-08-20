const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_IMAGE_URL = 'http://localhost:9000/tripshare-uploads/defaults/default-trip-image.jpg';
const LOCAL_AVATAR_URL = 'http://localhost:9000/tripshare-uploads/defaults/default-avatar.jpg';

// Patterns de remplacement
const replacements = [
  // Images de voyages
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1488646953014-85cb44e25828\?w=400&h=300&fit=crop/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1488646953014-85cb44e25828\?w=400/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1537953773345-d172ccf13cf1\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1537953773345-d172ccf13cf1\?w=400/g,
    replacement: LOCAL_IMAGE_URL
  },
  // Avatars
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1472099645785-5658abf4ff4e\?w=100/g,
    replacement: LOCAL_AVATAR_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1494790108755-2616b612b786\?w=100/g,
    replacement: LOCAL_AVATAR_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1507003211169-0a1dd7228f2d\?w=100/g,
    replacement: LOCAL_AVATAR_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1438761681033-6461ffad8d80\?w=100/g,
    replacement: LOCAL_AVATAR_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1544005313-94ddf0286df2\?w=100/g,
    replacement: LOCAL_AVATAR_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1500648767791-00dcc994a43e\?w=100/g,
    replacement: LOCAL_AVATAR_URL
  },
  // Autres images
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1570077188670-e3a8d69ac5ff\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1540959733332-eab4deabeeaf\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1518548419970-58e3b4079ab2\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1506905925346-21bda4d32df4\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1514282401047-d79a71a590e8\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1531256456869-ce942a665e80\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1613395877344-13d4a8e0d49e\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1493976040374-85c8e12f0c0e\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1587595431973-160d0d94add1\?w=800/g,
    replacement: LOCAL_IMAGE_URL
  },
  {
    pattern: /https:\/\/images\.unsplash\.com\/photo-1469854523086-cc02fe5d8800\?w=400&h=400&fit=crop/g,
    replacement: LOCAL_IMAGE_URL
  }
];

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changes = 0;

    replacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacement);
        changes += matches.length;
      }
    });

    if (changes > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${filePath}: ${changes} remplacements effectués`);
      return changes;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return 0;
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalChanges = 0;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalChanges += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      totalChanges += processFile(filePath);
    }
  });

  return totalChanges;
}

// Point d'entrée
console.log('🔄 Remplacement des URLs Unsplash par des URLs locales...');
console.log('📁 Traitement du dossier src...');

const srcPath = path.join(__dirname, 'src');
const totalChanges = processDirectory(srcPath);

console.log(`\n✅ Traitement terminé !`);
console.log(`📊 Total des remplacements: ${totalChanges}`);
console.log(`\n🔗 URLs utilisées:`);
console.log(`   - Images: ${LOCAL_IMAGE_URL}`);
console.log(`   - Avatars: ${LOCAL_AVATAR_URL}`);
