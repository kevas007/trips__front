/**
 * 🛡️ Utilitaires pour la gestion des erreurs de modération
 */

import { Alert } from 'react-native';

export interface ModerationError {
  isModerated: boolean;
  isInvalidFormat: boolean;
  isTechnical: boolean;
  message: string;
  originalError: string;
}

/**
 * Analyse un message d'erreur du backend pour déterminer le type
 */
export const analyzeModerationError = (errorMessage: string, statusCode: number): ModerationError => {
  const lowerMessage = errorMessage.toLowerCase();
  
  // Détection des erreurs de modération
  if (statusCode === 400 && (
    lowerMessage.includes('rejetée par la modération') ||
    lowerMessage.includes('nudité détectée') ||
    lowerMessage.includes('violence détectée') ||
    lowerMessage.includes('arme détectée') ||
    lowerMessage.includes('drogues détectées') ||
    lowerMessage.includes('alcool détecté') ||
    lowerMessage.includes('contenu inapproprié')
  )) {
    return {
      isModerated: true,
      isInvalidFormat: false,
      isTechnical: false,
      message: getFriendlyModerationMessage(errorMessage),
      originalError: errorMessage
    };
  }
  
  // Détection des erreurs de format
  if (statusCode === 400 && (
    lowerMessage.includes('format') ||
    lowerMessage.includes('taille') ||
    lowerMessage.includes('dimension') ||
    lowerMessage.includes('invalide') ||
    lowerMessage.includes('corrompu') ||
    lowerMessage.includes('décodage')
  )) {
    return {
      isModerated: false,
      isInvalidFormat: true,
      isTechnical: false,
      message: getFriendlyFormatMessage(errorMessage),
      originalError: errorMessage
    };
  }
  
  // Erreur technique par défaut
  return {
    isModerated: false,
    isInvalidFormat: false,
    isTechnical: true,
    message: 'Erreur technique lors de l\'upload',
    originalError: errorMessage
  };
};

/**
 * Transforme un message technique de modération en message user-friendly
 */
const getFriendlyModerationMessage = (errorMessage: string): string => {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('nudité')) {
    return '🔞 Cette image contient du contenu pour adultes et ne peut pas être partagée';
  }
  
  if (lowerMessage.includes('violence')) {
    return '⚔️ Cette image contient du contenu violent et ne peut pas être partagée';
  }
  
  if (lowerMessage.includes('arme')) {
    return '🔫 Cette image contient des armes et ne peut pas être partagée';
  }
  
  if (lowerMessage.includes('drogue')) {
    return '💊 Cette image contient du contenu lié aux drogues et ne peut pas être partagée';
  }
  
  if (lowerMessage.includes('alcool')) {
    return '🍺 Cette image contient trop de contenu lié à l\'alcool et ne peut pas être partagée';
  }
  
  if (lowerMessage.includes('rejetée par la modération')) {
    return '🚫 Cette image a été rejetée par notre système de modération automatique';
  }
  
  return '🛡️ Cette image ne respecte pas nos règles de communauté';
};

/**
 * Transforme un message technique de format en message user-friendly
 */
const getFriendlyFormatMessage = (errorMessage: string): string => {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('trop petite') || lowerMessage.includes('suspicious_size')) {
    return '📏 Cette image est trop petite. Utilisez une image d\'au moins 50x50 pixels';
  }
  
  if (lowerMessage.includes('dimension') || lowerMessage.includes('suspicious_dimensions')) {
    return '📐 Les dimensions de cette image sont invalides';
  }
  
  if (lowerMessage.includes('format') || lowerMessage.includes('unsupported_format')) {
    return '📁 Format non supporté. Utilisez JPG, JPEG ou PNG';
  }
  
  if (lowerMessage.includes('corrompu') || lowerMessage.includes('décodage') || lowerMessage.includes('decode_error')) {
    return '💔 Cette image est corrompue ou illisible';
  }
  
  return '📷 Format d\'image invalide. Utilisez JPG ou PNG';
};

/**
 * Affiche une alerte adaptée selon le type d'erreur
 */
export const showModerationAlert = (
  errors: ModerationError[], 
  successCount: number = 0,
  totalCount: number = 0
) => {
  if (errors.length === 0) return;
  
  const moderatedCount = errors.filter(e => e.isModerated).length;
  const formatCount = errors.filter(e => e.isInvalidFormat).length;
  const technicalCount = errors.filter(e => e.isTechnical).length;
  
  let title = '';
  let message = '';
  
  if (moderatedCount > 0) {
    title = '🛡️ Contenu bloqué par la modération';
    message = `${moderatedCount} image(s) ont été rejetées par notre système de sécurité.\n\n`;
    
    if (moderatedCount === 1) {
      message += `Raison : ${errors.find(e => e.isModerated)?.message}`;
    } else {
      message += 'Nous protégeons notre communauté en bloquant automatiquement les contenus inappropriés.';
    }
    
    if (successCount > 0) {
      message += `\n\n✅ ${successCount} autres images ont été uploadées avec succès.`;
    }
    
    message += '\n\n💡 Conseil : Choisissez des photos de voyage familiales.';
    
  } else if (formatCount > 0) {
    title = '📷 Problème de format d\'image';
    message = `${formatCount} image(s) ont un problème de format.\n\n`;
    
    if (formatCount === 1) {
      message += `Problème : ${errors.find(e => e.isInvalidFormat)?.message}`;
    } else {
      message += 'Assurez-vous d\'utiliser des images JPG ou PNG de bonne qualité.';
    }
    
    if (successCount > 0) {
      message += `\n\n✅ ${successCount} autres images ont été uploadées.`;
    }
    
  } else {
    title = '❌ Erreur technique';
    message = `Impossible d'uploader ${technicalCount} image(s). Vérifiez votre connexion internet.`;
    
    if (successCount > 0) {
      message += `\n\n✅ ${successCount} images ont été uploadées.`;
    }
  }
  
  Alert.alert(title, message, [
    { text: 'Compris', style: 'default' }
  ]);
};

/**
 * Crée un message de résumé pour les logs
 */
export const createUploadSummary = (
  successCount: number,
  errorCount: number,
  errors: ModerationError[]
): string => {
  let summary = `📊 Upload terminé: ${successCount} succès, ${errorCount} échecs`;
  
  if (errors.length > 0) {
    const moderatedCount = errors.filter(e => e.isModerated).length;
    const formatCount = errors.filter(e => e.isInvalidFormat).length;
    
    if (moderatedCount > 0) summary += ` (${moderatedCount} modérées)`;
    if (formatCount > 0) summary += ` (${formatCount} format invalide)`;
  }
  
  return summary;
};
