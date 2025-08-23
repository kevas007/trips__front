import { Badge } from '../types/user';

export interface BadgeCriteria {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'milestone' | 'special';
  condition: (userStats: any) => boolean;
  priority: number;
}

// Définition des critères de badges
const BADGE_CRITERIA: BadgeCriteria[] = [
  {
    id: 'first_trip',
    name: 'Premier Voyageur',
    description: 'A créé son premier voyage',
    icon: '🎒',
    category: 'achievement',
    condition: (stats) => stats.tripsCreated >= 1,
    priority: 1,
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'A créé 5 voyages',
    icon: '🗺️',
    category: 'milestone',
    condition: (stats) => stats.tripsCreated >= 5,
    priority: 2,
  },
  {
    id: 'adventurer',
    name: 'Aventurier',
    description: 'A créé 10 voyages',
    icon: '🏔️',
    category: 'milestone',
    condition: (stats) => stats.tripsCreated >= 10,
    priority: 3,
  },
  {
    id: 'travel_expert',
    name: 'Expert Voyageur',
    description: 'A créé 25 voyages',
    icon: '✈️',
    category: 'milestone',
    condition: (stats) => stats.tripsCreated >= 25,
    priority: 4,
  },
  {
    id: 'social_butterfly',
    name: 'Papillon Social',
    description: 'A 10 abonnés',
    icon: '🦋',
    category: 'milestone',
    condition: (stats) => stats.followers >= 10,
    priority: 2,
  },
  {
    id: 'influencer',
    name: 'Influenceur',
    description: 'A 50 abonnés',
    icon: '⭐',
    category: 'milestone',
    condition: (stats) => stats.followers >= 50,
    priority: 3,
  },
  {
    id: 'popular',
    name: 'Populaire',
    description: 'A 100 abonnés',
    icon: '👑',
    category: 'milestone',
    condition: (stats) => stats.followers >= 100,
    priority: 4,
  },
  {
    id: 'liked',
    name: 'Apprécié',
    description: 'A reçu 10 likes',
    icon: '❤️',
    category: 'milestone',
    condition: (stats) => stats.totalLikes >= 10,
    priority: 2,
  },
  {
    id: 'loved',
    name: 'Adoré',
    description: 'A reçu 50 likes',
    icon: '💖',
    category: 'milestone',
    condition: (stats) => stats.totalLikes >= 50,
    priority: 3,
  },
  {
    id: 'viral',
    name: 'Viral',
    description: 'A reçu 100 likes',
    icon: '🔥',
    category: 'milestone',
    condition: (stats) => stats.totalLikes >= 100,
    priority: 4,
  },
  {
    id: 'viewed',
    name: 'Vu',
    description: 'A 100 vues totales',
    icon: '👁️',
    category: 'milestone',
    condition: (stats) => stats.totalViews >= 100,
    priority: 2,
  },
  {
    id: 'famous',
    name: 'Célèbre',
    description: 'A 1000 vues totales',
    icon: '🌟',
    category: 'milestone',
    condition: (stats) => stats.totalViews >= 1000,
    priority: 3,
  },
  {
    id: 'world_traveler',
    name: 'Voyageur du Monde',
    description: 'A visité 5 pays différents',
    icon: '🌍',
    category: 'milestone',
    condition: (stats) => stats.countriesVisited >= 5,
    priority: 3,
  },
  {
    id: 'city_explorer',
    name: 'Explorateur de Villes',
    description: 'A visité 10 villes différentes',
    icon: '🏙️',
    category: 'milestone',
    condition: (stats) => stats.citiesVisited >= 10,
    priority: 3,
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Membre depuis plus de 30 jours',
    icon: '🎯',
    category: 'special',
    condition: (stats) => {
      const daysSinceCreation = Math.floor((Date.now() - new Date(stats.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreation >= 30;
    },
    priority: 1,
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Membre depuis plus de 6 mois',
    icon: '🎖️',
    category: 'special',
    condition: (stats) => {
      const daysSinceCreation = Math.floor((Date.now() - new Date(stats.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreation >= 180;
    },
    priority: 2,
  },
];

class BadgeService {
  // Calculer les badges automatiquement basés sur les statistiques utilisateur
  calculateBadges(userStats: any, userCreatedAt: string): Badge[] {
    const earnedBadges: Badge[] = [];
    
    // Ajouter les statistiques de création pour les calculs
    const statsWithCreation = {
      ...userStats,
      createdAt: userCreatedAt,
    };

    // Vérifier chaque critère de badge
    BADGE_CRITERIA.forEach((criteria) => {
      if (criteria.condition(statsWithCreation)) {
        earnedBadges.push({
          id: parseInt(criteria.id) || Math.random(),
          name: criteria.name,
          description: criteria.description,
          icon: criteria.icon,
          category: criteria.category,
          created_at: new Date().toISOString(),
        });
      }
    });

    // Trier par priorité (plus haute priorité en premier)
    return earnedBadges.sort((a, b) => {
      const aCriteria = BADGE_CRITERIA.find(c => c.name === a.name);
      const bCriteria = BADGE_CRITERIA.find(c => c.name === b.name);
      return (bCriteria?.priority || 0) - (aCriteria?.priority || 0);
    });
  }

  // Vérifier si un utilisateur a gagné de nouveaux badges
  checkForNewBadges(currentBadges: Badge[], userStats: any, userCreatedAt: string): Badge[] {
    const allPossibleBadges = this.calculateBadges(userStats, userCreatedAt);
    const currentBadgeNames = currentBadges.map(badge => badge.name);
    
    return allPossibleBadges.filter(badge => !currentBadgeNames.includes(badge.name));
  }

  // Obtenir les badges par catégorie
  getBadgesByCategory(badges: Badge[]): Record<string, Badge[]> {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, Badge[]>);
  }

  // Obtenir les prochains badges disponibles
  getNextAvailableBadges(userStats: any, userCreatedAt: string): BadgeCriteria[] {
    const currentBadges = this.calculateBadges(userStats, userCreatedAt);
    const currentBadgeIds = currentBadges.map(badge => badge.name);
    
    return BADGE_CRITERIA
      .filter(criteria => !currentBadgeIds.includes(criteria.name))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5); // Retourner les 5 prochains badges les plus accessibles
  }
}

export const badgeService = new BadgeService();
