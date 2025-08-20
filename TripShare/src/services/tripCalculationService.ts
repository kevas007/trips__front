import { Trip, TripStatus, TripCalculatedStats } from '../types/trip';

/**
 * Service pour calculer automatiquement les statuts et durées des voyages
 * Correspond aux calculs du backend pour la cohérence
 */
export class TripCalculationService {
  
  /**
   * Calcule automatiquement le statut d'un voyage basé sur les dates
   */
  static calculateStatus(trip: Trip): TripStatus {
    const now = new Date();
    
    // Si pas de dates, considérer comme planifié
    if (!trip.startDate || !trip.endDate) {
      return 'planned';
    }
    
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    // Si la date de fin est passée, le voyage est terminé
    if (now > endDate) {
      return 'completed';
    }
    
    // Si la date de début est passée mais pas la date de fin, le voyage est en cours
    if (now > startDate && now < endDate) {
      return 'ongoing';
    }
    
    // Sinon, le voyage est planifié
    return 'planned';
  }
  
  /**
   * Calcule la durée d'un voyage en jours
   */
  static calculateDuration(trip: Trip): number {
    if (!trip.startDate || !trip.endDate) {
      return 0;
    }
    
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    return durationDays + 1; // +1 pour inclure le jour de début
  }
  
  /**
   * Retourne la durée formatée pour l'affichage
   */
  static getDurationDisplay(trip: Trip): string {
    const duration = this.calculateDuration(trip);
    
    if (duration === 0) {
      return 'Durée non définie';
    } else if (duration === 1) {
      return '1 jour';
    } else {
      return `${duration} jours`;
    }
  }
  
  /**
   * Vérifie si le voyage est en retard
   */
  static isOverdue(trip: Trip): boolean {
    if (!trip.endDate) {
      return false;
    }
    
    const now = new Date();
    const endDate = new Date(trip.endDate);
    
    return now > endDate && trip.status !== 'completed';
  }
  
  /**
   * Calcule le nombre de jours jusqu'au début du voyage
   */
  static getDaysUntilStart(trip: Trip): number {
    if (!trip.startDate) {
      return -1; // Date non définie
    }
    
    const now = new Date();
    const startDate = new Date(trip.startDate);
    
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  /**
   * Calcule le nombre de jours jusqu'à la fin du voyage
   */
  static getDaysUntilEnd(trip: Trip): number {
    if (!trip.endDate) {
      return -1; // Date non définie
    }
    
    const now = new Date();
    const endDate = new Date(trip.endDate);
    
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  /**
   * Calcule le pourcentage de progression du voyage (0-100)
   */
  static getProgressPercentage(trip: Trip): number {
    if (!trip.startDate || !trip.endDate) {
      return 0;
    }
    
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    
    if (totalDuration <= 0) {
      return 0;
    }
    
    const elapsed = now.getTime() - startDate.getTime();
    const percentage = (elapsed / totalDuration) * 100;
    
    // Limiter entre 0 et 100
    if (percentage < 0) {
      return 0;
    } else if (percentage > 100) {
      return 100;
    }
    
    return percentage;
  }
  
  /**
   * Formate l'affichage des jours restants
   */
  static formatDaysDisplay(days: number): string {
    if (days > 0) {
      return `${days} jours`;
    } else if (days === 0) {
      return 'Aujourd\'hui';
    } else {
      return `Il y a ${Math.abs(days)} jours`;
    }
  }
  
  /**
   * Calcule toutes les statistiques d'un voyage
   */
  static calculateTripStats(trip: Trip): TripCalculatedStats {
    const status = this.calculateStatus(trip);
    const duration = this.calculateDuration(trip);
    const durationDisplay = this.getDurationDisplay(trip);
    const isOverdue = this.isOverdue(trip);
    const progressPercentage = this.getProgressPercentage(trip);
    
    const stats: TripCalculatedStats = {
      status,
      statusDisplay: this.getStatusDisplayName(status),
      duration: durationDisplay,
      durationDays: duration,
      isOverdue,
      progressPercentage,
    };
    
    // Ajouter les jours restants si applicable
    if (trip.startDate) {
      const daysUntilStart = this.getDaysUntilStart(trip);
      stats.daysUntilStart = daysUntilStart;
      stats.daysUntilStartDisplay = this.formatDaysDisplay(daysUntilStart);
    }
    
    if (trip.endDate) {
      const daysUntilEnd = this.getDaysUntilEnd(trip);
      stats.daysUntilEnd = daysUntilEnd;
      stats.daysUntilEndDisplay = this.formatDaysDisplay(daysUntilEnd);
    }
    
    return stats;
  }
  
  /**
   * Retourne le nom d'affichage d'un statut
   */
  static getStatusDisplayName(status: TripStatus): string {
    const displayNames: Record<TripStatus, string> = {
      planned: 'Planifié',
      ongoing: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    
    return displayNames[status] || status;
  }
  
  /**
   * Retourne la couleur d'un statut
   */
  static getStatusColor(status: TripStatus): string {
    const colors: Record<TripStatus, string> = {
      planned: '#3B82F6', // Bleu
      ongoing: '#10B981', // Vert
      completed: '#6B7280', // Gris
      cancelled: '#EF4444', // Rouge
    };
    
    return colors[status] || '#6B7280';
  }
  
  /**
   * Retourne l'icône d'un statut
   */
  static getStatusIcon(status: TripStatus): string {
    const icons: Record<TripStatus, string> = {
      planned: 'calendar-outline',
      ongoing: 'rocket-outline',
      completed: 'checkmark-circle-outline',
      cancelled: 'close-circle-outline',
    };
    
    return icons[status] || 'help-circle-outline';
  }
  
  /**
   * Vérifie si un voyage est actuellement en cours
   */
  static isCurrentlyOngoing(trip: Trip): boolean {
    return this.calculateStatus(trip) === 'ongoing';
  }
  
  /**
   * Vérifie si un voyage est terminé
   */
  static isCompleted(trip: Trip): boolean {
    return this.calculateStatus(trip) === 'completed';
  }
  
  /**
   * Vérifie si un voyage est planifié
   */
  static isPlanned(trip: Trip): boolean {
    return this.calculateStatus(trip) === 'planned';
  }
  
  /**
   * Calcule le temps restant jusqu'au début du voyage
   */
  static getTimeUntilStart(trip: Trip): { days: number; hours: number; minutes: number } {
    if (!trip.startDate) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const diffMs = startDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }
  
  /**
   * Formate le temps restant pour l'affichage
   */
  static formatTimeRemaining(trip: Trip): string {
    const timeUntilStart = this.getTimeUntilStart(trip);
    
    if (timeUntilStart.days > 0) {
      return `${timeUntilStart.days}j ${timeUntilStart.hours}h`;
    } else if (timeUntilStart.hours > 0) {
      return `${timeUntilStart.hours}h ${timeUntilStart.minutes}m`;
    } else if (timeUntilStart.minutes > 0) {
      return `${timeUntilStart.minutes}m`;
    } else {
      return 'Maintenant';
    }
  }
  
  /**
   * Vérifie si un voyage commence bientôt (dans les 7 prochains jours)
   */
  static isStartingSoon(trip: Trip): boolean {
    const daysUntilStart = this.getDaysUntilStart(trip);
    return daysUntilStart >= 0 && daysUntilStart <= 7;
  }
  
  /**
   * Vérifie si un voyage se termine bientôt (dans les 3 prochains jours)
   */
  static isEndingSoon(trip: Trip): boolean {
    const daysUntilEnd = this.getDaysUntilEnd(trip);
    return daysUntilEnd >= 0 && daysUntilEnd <= 3;
  }
} 