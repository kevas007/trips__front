import { useTranslation } from 'react-i18next';
import { AuthError } from '../services/auth';

export const useAuthErrors = () => {
  const { t } = useTranslation();

  const getLocalizedError = (error: AuthError | null): AuthError | null => {
    if (!error) return null;

    // Messages d'erreurs traduits
    const messages: Record<string, string> = {
      NETWORK_ERROR: t('errors.networkError', 'Problème de connexion. Vérifiez votre connexion internet.'),
      UNAUTHORIZED: t('errors.unauthorized', 'Email ou mot de passe incorrect'),
      BAD_REQUEST: t('errors.badRequest', 'Données invalides'),
      FORBIDDEN: t('errors.forbidden', 'Accès refusé'),
      CONFLICT: t('errors.conflict', 'Cette adresse email est déjà utilisée'),
      VALIDATION_ERROR: t('errors.validationError', 'Données invalides'),
      RATE_LIMITED: t('errors.rateLimited', 'Trop de tentatives. Veuillez réessayer plus tard.'),
      SERVER_ERROR: t('errors.serverError', 'Erreur serveur temporaire. Veuillez réessayer.'),
      UNKNOWN_ERROR: t('errors.unknownError', 'Une erreur inattendue s\'est produite'),
    };

    return {
      ...error,
      message: messages[error.code] || error.message,
    };
  };

  const getFieldError = (error: AuthError | null, field: string): string | undefined => {
    if (!error || !error.details) return undefined;
    
    if (typeof error.details === 'object' && error.details[field]) {
      return error.details[field];
    }
    
    return undefined;
  };

  const hasFieldError = (error: AuthError | null, field: string): boolean => {
    return !!getFieldError(error, field);
  };

  return {
    getLocalizedError,
    getFieldError,
    hasFieldError,
  };
}; 