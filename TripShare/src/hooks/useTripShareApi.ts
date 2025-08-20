// ========== HOOK PERSONNALISÉ POUR L'API TRIPSHARE ==========
// Hook qui encapsule les appels API avec gestion d'état et d'erreurs

import React, { useCallback, useState, useEffect } from 'react';
import { tripShareApi } from '../services';
import type {
  LoginRequest,
  RegisterRequest,
  CreateTripRequest,
  UpdateTripRequest,
  TripFilters,
  CreateActivityRequest,
  CreateExpenseRequest
} from '../services';
import { useAPI } from './useAPI';
import { Trip } from '../types/trip';

// ========== TYPES D'ÉTAT ==========
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiResponse<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

// ========== HOOK PRINCIPAL ==========
export const useTripShareApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};

// ========== HOOKS SPÉCIALISÉS ==========

// Hook pour l'authentification
export const useAuth = () => {
  const loginState = useTripShareApi();
  const registerState = useTripShareApi();
  const logoutState = useTripShareApi();

  const login = useCallback(async (credentials: LoginRequest) => {
    await loginState.execute(() => tripShareApi.login(credentials));
  }, [loginState]);

  const register = useCallback(async (userData: RegisterRequest) => {
    await registerState.execute(() => tripShareApi.register(userData));
  }, [registerState]);

  const logout = useCallback(async () => {
    await logoutState.execute(() => tripShareApi.logout());
  }, [logoutState]);

  return {
    login: { ...loginState, execute: login },
    register: { ...registerState, execute: register },
    logout: { ...logoutState, execute: logout },
  };
};

// Hook pour les voyages
export const useTrips = () => {
  const listTripsState = useTripShareApi();
  const createTripState = useTripShareApi();
  const getTripState = useTripShareApi();
  const updateTripState = useTripShareApi();
  const deleteTripState = useTripShareApi();

  const listTrips = useCallback(async (filters?: TripFilters) => {
    await listTripsState.execute(() => tripShareApi.listTrips(filters));
  }, [listTripsState]);

  const createTrip = useCallback(async (tripData: CreateTripRequest) => {
    await createTripState.execute(() => tripShareApi.createTrip(tripData));
  }, [createTripState]);

  const getTrip = useCallback(async (tripId: string) => {
    await getTripState.execute(() => tripShareApi.getTrip(tripId));
  }, [getTripState]);

  const updateTrip = useCallback(async (tripId: string, tripData: UpdateTripRequest) => {
    await updateTripState.execute(() => tripShareApi.updateTrip(tripId, tripData));
  }, [updateTripState]);

  const deleteTrip = useCallback(async (tripId: string) => {
    await deleteTripState.execute(() => tripShareApi.deleteTrip(tripId));
  }, [deleteTripState]);

  return {
    listTrips: { ...listTripsState, execute: listTrips },
    createTrip: { ...createTripState, execute: createTrip },
    getTrip: { ...getTripState, execute: getTrip },
    updateTrip: { ...updateTripState, execute: updateTrip },
    deleteTrip: { ...deleteTripState, execute: deleteTrip },
  };
};

// Hook pour les activités
export const useActivities = () => {
  const listActivitiesState = useTripShareApi();
  const createActivityState = useTripShareApi();
  const updateActivityState = useTripShareApi();
  const deleteActivityState = useTripShareApi();

  const listActivities = useCallback(async (tripId: string) => {
    await listActivitiesState.execute(() => tripShareApi.listActivities(tripId));
  }, [listActivitiesState]);

  const createActivity = useCallback(async (tripId: string, activityData: CreateActivityRequest) => {
    await createActivityState.execute(() => tripShareApi.createActivity(tripId, activityData));
  }, [createActivityState]);

  const updateActivity = useCallback(async (activityId: string, activityData: Partial<CreateActivityRequest>) => {
    await updateActivityState.execute(() => tripShareApi.updateActivity(activityId, activityData));
  }, [updateActivityState]);

  const deleteActivity = useCallback(async (activityId: string) => {
    await deleteActivityState.execute(() => tripShareApi.deleteActivity(activityId));
  }, [deleteActivityState]);

  return {
    listActivities: { ...listActivitiesState, execute: listActivities },
    createActivity: { ...createActivityState, execute: createActivity },
    updateActivity: { ...updateActivityState, execute: updateActivity },
    deleteActivity: { ...deleteActivityState, execute: deleteActivity },
  };
};

// Hook pour les dépenses
export const useExpenses = () => {
  const listExpensesState = useTripShareApi();
  const createExpenseState = useTripShareApi();
  const updateExpenseState = useTripShareApi();
  const deleteExpenseState = useTripShareApi();

  const listExpenses = useCallback(async (tripId: string) => {
    await listExpensesState.execute(() => tripShareApi.listExpenses(tripId));
  }, [listExpensesState]);

  const createExpense = useCallback(async (tripId: string, expenseData: CreateExpenseRequest) => {
    await createExpenseState.execute(() => tripShareApi.createExpense(tripId, expenseData));
  }, [createExpenseState]);

  const updateExpense = useCallback(async (expenseId: string, expenseData: Partial<CreateExpenseRequest>) => {
    await updateExpenseState.execute(() => tripShareApi.updateExpense(expenseId, expenseData));
  }, [updateExpenseState]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    await deleteExpenseState.execute(() => tripShareApi.deleteExpense(expenseId));
  }, [deleteExpenseState]);

  return {
    listExpenses: { ...listExpensesState, execute: listExpenses },
    createExpense: { ...createExpenseState, execute: createExpense },
    updateExpense: { ...updateExpenseState, execute: updateExpense },
    deleteExpense: { ...deleteExpenseState, execute: deleteExpense },
  };
};

// Hook pour le profil utilisateur
export const useProfile = () => {
  const getProfileState = useTripShareApi();
  const updateProfileState = useTripShareApi();
  const getUserBadgesState = useTripShareApi();

  const getProfile = useCallback(async () => {
    await getProfileState.execute(() => tripShareApi.getProfile());
  }, [getProfileState]);

  const updateProfile = useCallback(async (profileData: any) => {
    await updateProfileState.execute(() => tripShareApi.updateProfile(profileData));
  }, [updateProfileState]);

  const getUserBadges = useCallback(async () => {
    await getUserBadgesState.execute(() => tripShareApi.getUserBadges());
  }, [getUserBadgesState]);

  return {
    getProfile: { ...getProfileState, execute: getProfile },
    updateProfile: { ...updateProfileState, execute: updateProfile },
    getUserBadges: { ...getUserBadgesState, execute: getUserBadges },
  };
};

// Hook pour les badges
export const useBadges = () => {
  const listBadgesState = useTripShareApi();
  const getBadgeState = useTripShareApi();

  const listBadges = useCallback(async () => {
    await listBadgesState.execute(() => tripShareApi.listBadges());
  }, [listBadgesState]);

  const getBadge = useCallback(async (badgeId: string) => {
    await getBadgeState.execute(() => tripShareApi.getBadge(badgeId));
  }, [getBadgeState]);

  return {
    listBadges: { ...listBadgesState, execute: listBadges },
    getBadge: { ...getBadgeState, execute: getBadge },
  };
}; 

export const usePublicProfile = (userId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tripShareApi.getUserProfile(userId);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}; 

export const useUserPublicTrips = (userId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tripShareApi.listPublicTripsByUser(userId);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}; 

export function useSavedTrips() {
  const { get, post, delete: deleteRequest } = useAPI();
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSavedTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trips = await get<Trip[]>('/trips/saved');
      setSavedTrips(trips);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des voyages enregistrés');
      setSavedTrips([]);
    } finally {
      setLoading(false);
    }
  }, [get]);

  const saveTrip = useCallback(async (tripId: string) => {
    try {
      await post(`/trips/${tripId}/save`);
      // Rafraîchir la liste
      getSavedTrips();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de l\'enregistrement du voyage');
    }
  }, [post, getSavedTrips]);

  const unsaveTrip = useCallback(async (tripId: string) => {
    try {
      await deleteRequest(`/trips/${tripId}/save`);
      // Rafraîchir la liste
      getSavedTrips();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression du voyage');
    }
  }, [deleteRequest, getSavedTrips]);

  return {
    savedTrips,
    loading,
    error,
    getSavedTrips,
    saveTrip,
    unsaveTrip,
  };
} 