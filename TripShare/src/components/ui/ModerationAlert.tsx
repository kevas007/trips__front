import React from 'react';
import { Alert, Platform } from 'react-native';

export type ModerationType = 'blocked' | 'flagged' | 'success';

export interface ModerationAlertOptions {
  type: ModerationType;
  message: string;
  details?: string;
  onRetry?: () => void;
  onContinue?: () => void;
}

// Messages d'erreur de modération traduits et adaptés pour les utilisateurs français
const MODERATION_MESSAGES = {
  // Messages de blocage
  weapon_threat: {
    title: '🚫 Image non autorisée',
    message: 'Cette image contient du contenu menaçant ou des armes qui ne sont pas appropriées pour une plateforme de voyage.',
    suggestion: 'Choisissez des photos positives qui montrent vos plus beaux souvenirs de voyage.',
  },
  weapon_presence: {
    title: '🚫 Contenu inapproprié',
    message: 'Cette image contient des armes ou objets dangereux non autorisés sur TripShare.',
    suggestion: 'Partagez plutôt des photos de paysages, monuments ou moments de bonheur.',
  },
  gore_violence: {
    title: '🚫 Contenu violent',
    message: 'Cette image contient du contenu violent qui ne correspond pas à l\'esprit positif de TripShare.',
    suggestion: 'Privilégiez des photos qui inspirent à voyager et découvrir le monde.',
  },
  sexual_content: {
    title: '🚫 Contenu inapproprié',
    message: 'Cette image contient du contenu sexuel inapproprié pour une plateforme familiale.',
    suggestion: 'Choisissez des photos de voyage adaptées à tous les âges.',
  },
  offensive_content: {
    title: '🚫 Contenu offensant',
    message: 'Cette image contient du contenu offensant qui ne respecte pas nos valeurs communautaires.',
    suggestion: 'Partagez des moments positifs qui donnent envie de voyager.',
  },
  file_invalid: {
    title: '❌ Fichier invalide',
    message: 'Le fichier sélectionné ne peut pas être traité. Il pourrait être corrompu ou dans un format non supporté.',
    suggestion: 'Essayez avec une autre photo ou vérifiez que votre image est au format JPEG ou PNG.',
  },
  
  // Messages d'approbation avec flag
  flagged_review: {
    title: '⚠️ Photo en attente',
    message: 'Votre photo a été ajoutée mais sera vérifiée par notre équipe.',
    suggestion: 'Elle apparaîtra publiquement après validation, généralement sous 24h.',
  },
  
  // Messages de succès
  approved: {
    title: '✅ Photo ajoutée !',
    message: 'Votre photo a été ajoutée avec succès à votre voyage.',
    suggestion: '',
  },
};

// Fonction pour détecter le type d'erreur depuis le message backend
function detectModerationError(backendMessage: string): keyof typeof MODERATION_MESSAGES {
  const message = backendMessage.toLowerCase();
  
  if (message.includes('menaçant') || message.includes('threat')) {
    return 'weapon_threat';
  } else if (message.includes('arme') || message.includes('weapon')) {
    return 'weapon_presence';
  } else if (message.includes('gore') || message.includes('violent')) {
    return 'gore_violence';
  } else if (message.includes('sexuel') || message.includes('sexual') || message.includes('nudité')) {
    return 'sexual_content';
  } else if (message.includes('offensant') || message.includes('offensive')) {
    return 'offensive_content';
  } else if (message.includes('flagguée') || message.includes('review')) {
    return 'flagged_review';
  } else if (message.includes('approuvée') || message.includes('succès')) {
    return 'approved';
  } else {
    return 'file_invalid';
  }
}

export class ModerationAlert {
  static show(options: ModerationAlertOptions): void {
    const { type, message } = options;
    
    // Détecter le type d'erreur spécifique
    let errorType: keyof typeof MODERATION_MESSAGES;
    
    if (type === 'blocked') {
      errorType = detectModerationError(message);
    } else if (type === 'flagged') {
      errorType = 'flagged_review';
    } else {
      errorType = 'approved';
    }
    
    const moderationInfo = MODERATION_MESSAGES[errorType];
    
    if (type === 'blocked') {
      // Pour les contenus bloqués, montrer une alerte avec option de retry
      Alert.alert(
        moderationInfo.title,
        `${moderationInfo.message}\n\n💡 ${moderationInfo.suggestion}`,
        [
          {
            text: 'Choisir une autre photo',
            style: 'default',
            onPress: options.onRetry,
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } else if (type === 'flagged') {
      // Pour les contenus flaggués, informer que la photo est en attente
      Alert.alert(
        moderationInfo.title,
        `${moderationInfo.message}\n\n💡 ${moderationInfo.suggestion}`,
        [
          {
            text: 'Continuer',
            style: 'default',
            onPress: options.onContinue,
          },
        ],
        { cancelable: false }
      );
    } else {
      // Pour les succès, afficher brièvement la confirmation
      if (Platform.OS === 'ios') {
        Alert.alert(
          moderationInfo.title,
          moderationInfo.message,
          [{ text: 'OK', style: 'default' }],
          { cancelable: true }
        );
      } else {
        // Sur Android, ne pas afficher d'alerte pour les succès (éviter le spam)
        console.log('✅ Photo approuvée:', moderationInfo.message);
      }
    }
  }

  // Méthode utilitaire pour identifier le statut HTTP et le type d'erreur
  static showFromApiError(error: any, onRetry?: () => void, onContinue?: () => void): void {
    let type: ModerationType = 'blocked';
    let message = 'Erreur inconnue';

    if (error?.response?.status === 403) {
      // Statut 403 = contenu bloqué
      type = 'blocked';
      message = error?.response?.data?.error || error?.message || 'Contenu non autorisé';
    } else if (error?.response?.status === 202) {
      // Statut 202 = contenu flaggué mais accepté
      type = 'flagged';
      message = error?.response?.data?.error || error?.message || 'Contenu en attente de validation';
    } else if (error?.response?.status === 201 || error?.response?.status === 200) {
      // Statut 200/201 = succès
      type = 'success';
      message = 'Photo ajoutée avec succès';
    } else {
      // Autres erreurs (400, 500, etc.)
      type = 'blocked';
      message = error?.response?.data?.error || error?.message || 'Erreur lors du traitement de l\'image';
    }

    this.show({
      type,
      message,
      onRetry,
      onContinue,
    });
  }
}

export default ModerationAlert;
