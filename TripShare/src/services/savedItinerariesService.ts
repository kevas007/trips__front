import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedItinerary {
  id: string;
  tripId: string;
  destination: string;
  duration: string;
  budget: string;
  difficulty?: string;
  bestTime?: string;
  highlights?: string[];
  steps?: {
    id: string;
    title: string;
    description?: string;
    duration?: string;
    location?: string;
    order: number;
  }[];
  savedAt: string;
  authorName: string;
  authorAvatar: string;
  coverImage?: string;
  tags?: string[];
}

interface SavedItinerariesService {
  saveItinerary: (itinerary: Omit<SavedItinerary, 'savedAt'>) => Promise<void>;
  removeSavedItinerary: (tripId: string) => Promise<void>;
  getSavedItineraries: () => Promise<SavedItinerary[]>;
  isItinerarySaved: (tripId: string) => Promise<boolean>;
  clearAllSavedItineraries: () => Promise<void>;
}

const STORAGE_KEY = '@TripShare:savedItineraries';

class SavedItinerariesServiceImpl implements SavedItinerariesService {
  
  async saveItinerary(itinerary: Omit<SavedItinerary, 'savedAt'>): Promise<void> {
    try {
      const existingItineraries = await this.getSavedItineraries();
      
      // Vérifier si l'itinéraire n'est pas déjà sauvegardé
      const isAlreadySaved = existingItineraries.some(item => item.tripId === itinerary.tripId);
      
      if (isAlreadySaved) {
        throw new Error('Cet itinéraire est déjà dans vos favoris');
      }
      
      const newItinerary: SavedItinerary = {
        ...itinerary,
        savedAt: new Date().toISOString(),
      };
      
      const updatedItineraries = [...existingItineraries, newItinerary];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItineraries));
      
      console.log('✅ Itinéraire sauvegardé avec succès:', itinerary.destination);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'itinéraire:', error);
      throw error;
    }
  }
  
  async removeSavedItinerary(tripId: string): Promise<void> {
    try {
      const existingItineraries = await this.getSavedItineraries();
      const updatedItineraries = existingItineraries.filter(item => item.tripId !== tripId);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItineraries));
      console.log('✅ Itinéraire retiré des favoris');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'itinéraire:', error);
      throw error;
    }
  }
  
  async getSavedItineraries(): Promise<SavedItinerary[]> {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (!savedData) {
        return [];
      }
      
      const itineraries = JSON.parse(savedData) as SavedItinerary[];
      
      // Trier par date de sauvegarde (plus récent en premier)
      return itineraries.sort((a, b) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des itinéraires sauvegardés:', error);
      return [];
    }
  }
  
  async isItinerarySaved(tripId: string): Promise<boolean> {
    try {
      const savedItineraries = await this.getSavedItineraries();
      return savedItineraries.some(item => item.tripId === tripId);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'itinéraire:', error);
      return false;
    }
  }
  
  async clearAllSavedItineraries(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ Tous les itinéraires sauvegardés ont été supprimés');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des itinéraires:', error);
      throw error;
    }
  }
}

// Export service instance
export const savedItinerariesService = new SavedItinerariesServiceImpl();

// Export types
export type { SavedItinerary, SavedItinerariesService };

// Utility functions
export const formatSavedDate = (savedAt: string): string => {
  const date = new Date(savedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `Il y a ${months} mois`;
  }
};

export const getTotalSavedItineraries = async (): Promise<number> => {
  const itineraries = await savedItinerariesService.getSavedItineraries();
  return itineraries.length;
};

export const getItinerariesByDestination = async (destination: string): Promise<SavedItinerary[]> => {
  const itineraries = await savedItinerariesService.getSavedItineraries();
  return itineraries.filter(item => 
    item.destination.toLowerCase().includes(destination.toLowerCase())
  );
};

export const getItinerariesByTag = async (tag: string): Promise<SavedItinerary[]> => {
  const itineraries = await savedItinerariesService.getSavedItineraries();
  return itineraries.filter(item => 
    item.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}; 