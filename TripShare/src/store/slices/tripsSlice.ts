import { StateCreator } from 'zustand';
import { Trip, CreateTripData, UpdateTripData } from '../../types/trips';

export interface TripsSlice {
  // State
  trips: Trip[];
  currentTrip: Trip | null;
  isLoadingTrips: boolean;
  tripsError: string | null;
  
  // Actions
  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  createTrip: (data: CreateTripData) => Promise<void>;
  updateTrip: (id: string, data: UpdateTripData) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  setCurrentTrip: (trip: Trip | null) => void;
  clearTripsError: () => void;
}

export const tripsSlice: StateCreator<TripsSlice> = (set, _get) => ({
  // Initial state
  trips: [],
  currentTrip: null,
  isLoadingTrips: false,
  tripsError: null,

  // Actions
  fetchTrips: async () => {
    set({ isLoadingTrips: true, tripsError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/trips');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      
      set({
        trips: data.trips,
        isLoadingTrips: false,
        tripsError: null,
      });
    } catch (error) {
      set({
        isLoadingTrips: false,
        tripsError: error instanceof Error ? error.message : 'Failed to fetch trips',
      });
    }
  },

  fetchTrip: async (id: string) => {
    set({ isLoadingTrips: true, tripsError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch(`/api/v1/trips/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trip');
      }
      
      const data = await response.json();
      
      set({
        currentTrip: data.trip,
        isLoadingTrips: false,
        tripsError: null,
      });
    } catch (error) {
      set({
        isLoadingTrips: false,
        tripsError: error instanceof Error ? error.message : 'Failed to fetch trip',
      });
    }
  },

  createTrip: async (data: CreateTripData) => {
    set({ isLoadingTrips: true, tripsError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create trip');
      }
      
      const responseData = await response.json();
      
      set((state) => ({
        trips: [...state.trips, responseData.trip],
        isLoadingTrips: false,
        tripsError: null,
      }));
    } catch (error) {
      set({
        isLoadingTrips: false,
        tripsError: error instanceof Error ? error.message : 'Failed to create trip',
      });
    }
  },

  updateTrip: async (id: string, data: UpdateTripData) => {
    set({ isLoadingTrips: true, tripsError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch(`/api/v1/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update trip');
      }
      
      const responseData = await response.json();
      
      set((state) => ({
        trips: state.trips.map(trip => 
          trip.id === id ? responseData.trip : trip
        ),
        currentTrip: state.currentTrip?.id === id ? responseData.trip : state.currentTrip,
        isLoadingTrips: false,
        tripsError: null,
      }));
    } catch (error) {
      set({
        isLoadingTrips: false,
        tripsError: error instanceof Error ? error.message : 'Failed to update trip',
      });
    }
  },

  deleteTrip: async (id: string) => {
    set({ isLoadingTrips: true, tripsError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch(`/api/v1/trips/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }
      
      set((state) => ({
        trips: state.trips.filter(trip => trip.id !== id),
        currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
        isLoadingTrips: false,
        tripsError: null,
      }));
    } catch (error) {
      set({
        isLoadingTrips: false,
        tripsError: error instanceof Error ? error.message : 'Failed to delete trip',
      });
    }
  },

  setCurrentTrip: (trip: Trip | null) => {
    set({ currentTrip: trip });
  },

  clearTripsError: () => {
    set({ tripsError: null });
  },
});
