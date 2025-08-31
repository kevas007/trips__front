/**
 * Service centralisé pour la gestion des erreurs API
 */
export class ErrorService {
  /**
   * Gère les erreurs API et retourne un message d'erreur approprié
   */
  static handleApiError(error: any): string {
    console.error('❌ ErrorService - Erreur API:', error);

    // Erreurs de réseau
    if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
      return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
    }

    // Erreurs HTTP spécifiques
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Données invalides. Vérifiez les informations saisies.';
        case 401:
          return 'Session expirée. Veuillez vous reconnecter.';
        case 403:
          return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        case 404:
          return 'Ressource non trouvée.';
        case 429:
          return 'Trop de requêtes. Veuillez réessayer plus tard.';
        case 500:
          return 'Erreur serveur. Veuillez réessayer plus tard.';
        case 502:
        case 503:
        case 504:
          return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
        default:
          return `Erreur ${error.response.status}: ${error.response.data?.error || 'Erreur inattendue'}`;
      }
    }

    // Erreurs de validation
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        return errors[0].message || 'Données invalides';
      }
    }

    // Erreurs de message personnalisé
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }

    // Erreurs génériques
    if (error?.message) {
      return error.message;
    }

    return 'Erreur inattendue. Veuillez réessayer.';
  }

  /**
   * Vérifie si une erreur est de type réseau
   */
  static isNetworkError(error: any): boolean {
    return error?.message?.includes('Network Error') || 
           error?.message?.includes('fetch') ||
           error?.message?.includes('timeout');
  }

  /**
   * Vérifie si une erreur est de type rate limit (429)
   */
  static isRateLimitError(error: any): boolean {
    return error?.response?.status === 429;
  }

  /**
   * Vérifie si une erreur est de type authentification (401)
   */
  static isAuthError(error: any): boolean {
    return error?.response?.status === 401;
  }

  /**
   * Vérifie si une erreur est de type serveur (5xx)
   */
  static isServerError(error: any): boolean {
    const status = error?.response?.status;
    return status >= 500 && status < 600;
  }

  /**
   * Log une erreur avec des détails pour le débogage
   */
  static logError(context: string, error: any, additionalInfo?: any): void {
    console.error(`❌ ${context}:`, {
      error,
      additionalInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Retourne un message d'erreur pour l'utilisateur final
   */
  static getUserFriendlyMessage(error: any): string {
    const message = this.handleApiError(error);
    
    // Masquer les détails techniques pour l'utilisateur final
    if (message.includes('fetch') || message.includes('Network Error')) {
      return 'Problème de connexion. Vérifiez votre connexion internet.';
    }
    
    return message;
  }
}
