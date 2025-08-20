// Utilitaire pour gérer les URLs d'avatars
export const getAvatarUrl = (user: any): string => {
  console.log('🔍 getAvatarUrl appelé avec user:', {
    id: user?.id,
    name: user?.name,
    username: user?.username,
    avatar: user?.avatar,
    avatar_url: user?.avatar_url,
    profile_avatar_url: user?.profile?.avatar_url
  });
  
  // Priorité 1 : Avatar personnalisé de l'utilisateur
  // Structure backend: { user: {...}, profile: { avatar_url: "..." } }
  const customAvatar = user?.avatar || user?.avatar_url || user?.profile?.avatar_url;
  if (customAvatar) {
    console.log('👤 Avatar personnalisé trouvé:', customAvatar);
    console.log('🔍 Test détection SVG:', {
      includesDicebear: customAvatar.includes('dicebear.com'),
      includesSvg: customAvatar.includes('/svg?'),
      includesDotSvg: customAvatar.includes('.svg'),
      shouldConvert: customAvatar.includes('dicebear.com') && (customAvatar.includes('/svg?') || customAvatar.includes('.svg'))
    });
    
    // Si c'est une URL locale (file://), utiliser DiceBear
    if (customAvatar.startsWith('file://')) {
      console.log('📱 Avatar local détecté, utilisation de DiceBear');
      const seed = user?.username || user?.name || 'user';
      return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=100`;
    }
    
    // Si c'est une URL DiceBear SVG, la convertir en PNG pour compatibilité React Native
    if (customAvatar.includes('dicebear.com') && (customAvatar.includes('/svg?') || customAvatar.includes('.svg'))) {
      let pngUrl = customAvatar.replace('/svg?', '/png?').replace('.svg', '.png');
      
      // Nettoyer le seed en supprimant les espaces
      pngUrl = pngUrl.replace(/seed=([^&]*)/g, (match, seed) => {
        const cleanSeed = decodeURIComponent(seed).replace(/\s+/g, '');
        return `seed=${encodeURIComponent(cleanSeed)}`;
      });
      
      console.log('🔄 Avatar DiceBear converti SVG→PNG:', pngUrl);
      return pngUrl;
    }
    
    // Si c'est une URL HTTP/HTTPS normale, l'utiliser directement
    if (customAvatar.startsWith('http://') || customAvatar.startsWith('https://')) {
      console.log('🌐 Avatar distant valide:', customAvatar);
      return customAvatar;
    }
    
    // Si c'est une URL relative du backend, la compléter
    if (customAvatar.startsWith('/storage/') || customAvatar.startsWith('storage/')) {
      const fullUrl = `http://localhost:8085${customAvatar.startsWith('/') ? '' : '/'}${customAvatar}`;
      console.log('🔗 Avatar backend complété:', fullUrl);
      return fullUrl;
    }
  }
  
  // Priorité 2 : Avatar généré par DiceBear basé sur le nom/username (PNG pour compatibilité)
  // Priorité: name (sans espaces) > username > email
  let seed = user?.name || user?.username || user?.email?.split('@')[0] || 'user';
  
  // Nettoyer le seed en supprimant les espaces pour cohérence
  seed = seed.replace(/\s+/g, '');
  
  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=100`;
  console.log('🎲 Avatar DiceBear PNG généré pour:', seed);
  return dicebearUrl;
};
