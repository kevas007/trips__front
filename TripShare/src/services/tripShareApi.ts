// ========== TRIPSHARE API SERVICE - ENDPOINTS COMPLETS ==========
// Service API complet basé sur les routes du backend Go

import { unifiedApi } from './unifiedApi';
import { User, Trip, Activity, Expense, Badge, UserProfile, TripMember, TripPhoto } from '../types';
import { API_CONFIG } from '../config/api';
import { authService } from './auth';

// ========== TYPES D'AUTHENTIFICATION ==========
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangeEmailRequest {
  new_email: string;
  password: string;
}

// ========== TYPES DE VOYAGES ==========
export interface CreateTripRequest {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  budget?: number;
  status: string; // 'planned', 'ongoing', 'completed'
  visibility: string; // 'public', 'private'
  photos: string[];
  duration?: string;
  difficulty?: string;
  tags?: string[];
  places_visited?: Array<{
    name: string;
    description?: string;
    address?: string;
    is_visited: boolean;
    visit_date?: string;
    photos: string[];
    notes?: string;
  }>;
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {}

export interface TripFilters {
  search?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget_min?: number;
  budget_max?: number;
  is_public?: boolean;
  page?: number;
  limit?: number;
}

// ========== TYPES DE MEMBRES ==========
export interface AddMemberRequest {
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface UpdateMemberRequest {
  role: 'admin' | 'member' | 'viewer';
}

// ========== TYPES D'ACTIVITÉS ==========
export interface CreateActivityRequest {
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time?: string;
  cost?: number;
  category?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {}

// ========== TYPES DE DÉPENSES ==========
export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paid_by: string;
  shared_with?: string[];
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

// ========== TYPES DE BADGES ==========
export interface CreateBadgeRequest {
  name: string;
  description: string;
  icon_url?: string;
  criteria?: string;
}

export interface UpdateBadgeRequest extends Partial<CreateBadgeRequest> {}

export interface AwardBadgeRequest {
  user_id: string;
}

// ========== SERVICE API COMPLET ==========
export class TripShareApiService {
  // ========== AUTHENTIFICATION ==========
  
  // POST /api/v1/auth/register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return unifiedApi.post<AuthResponse>('/auth/register', data);
  }

  // POST /api/v1/auth/login
  async login(data: LoginRequest): Promise<AuthResponse> {
    return unifiedApi.post<AuthResponse>('/auth/login', data);
  }

  // POST /api/v1/auth/refresh
  async refreshToken(): Promise<AuthResponse> {
    return unifiedApi.post<AuthResponse>('/auth/refresh');
  }

  // POST /api/v1/auth/logout
  async logout(): Promise<void> {
    return unifiedApi.post<void>('/auth/logout');
  }

  // POST /api/v1/auth/verify-email
  async verifyEmail(token: string): Promise<void> {
    return unifiedApi.post<void>('/auth/verify-email', { token });
  }

  // POST /api/v1/auth/resend-verification
  async resendVerification(email: string): Promise<void> {
    return unifiedApi.post<void>('/auth/resend-verification', { email });
  }

  // POST /api/v1/auth/forgot-password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return unifiedApi.post<void>('/auth/forgot-password', data);
  }

  // POST /api/v1/auth/reset-password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    return unifiedApi.post<void>('/auth/reset-password', data);
  }

  // POST /api/v1/auth/change-password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return unifiedApi.post<void>('/auth/change-password', data);
  }

  // ========== UTILISATEURS ==========

  // GET /api/v1/users/me
  async getProfile(): Promise<UserProfile> {
    return unifiedApi.get<UserProfile>('/users/me');
  }

  // PUT /api/v1/users/me
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return unifiedApi.put<UserProfile>('/users/me', data);
  }

  // GET /api/v1/users/me/stats
  async getUserStats(): Promise<any> {
    return unifiedApi.get<any>('/users/me/stats');
  }

  // GET /api/v1/users/me/badges
  async getUserBadges(): Promise<Badge[]> {
    return unifiedApi.get<Badge[]>('/users/me/badges');
  }

  // GET /api/v1/users/me/followers
  async getFollowers(): Promise<User[]> {
    return unifiedApi.get<User[]>('/users/me/followers');
  }

  // GET /api/v1/users/me/following
  async getFollowing(): Promise<User[]> {
    return unifiedApi.get<User[]>('/users/me/following');
  }

  // POST /api/v1/users/me/follow/:id
  async followUser(userId: string): Promise<void> {
    return unifiedApi.post<void>(`/users/me/follow/${userId}`);
  }

  // DELETE /api/v1/users/me/follow/:id
  async unfollowUser(userId: string): Promise<void> {
    return unifiedApi.delete<void>(`/users/me/follow/${userId}`);
  }

  // GET /api/v1/users/discover
  async discoverUsers(): Promise<User[]> {
    return unifiedApi.get<User[]>('/users/discover');
  }

  // GET /api/v1/users/search
  async searchUsers(query: string): Promise<User[]> {
    return unifiedApi.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }

  // GET /api/v1/users/:id
  async getUserProfile(userId: string): Promise<UserProfile> {
    return unifiedApi.get<UserProfile>(`/users/${userId}`);
  }

  // DELETE /api/v1/users/me
  async deleteAccount(): Promise<void> {
    return unifiedApi.delete<void>('/users/me');
  }

  // POST /api/v1/users/me/avatar
  async uploadAvatar(formData: FormData): Promise<{ avatar_url: string }> {
    return unifiedApi.put<{ avatar_url: string }>('/users/me/avatar', formData);
  }

  // POST /api/v1/users/change-email
  async changeEmail(data: ChangeEmailRequest): Promise<void> {
    return unifiedApi.post<void>('/users/change-email', data);
  }

  // ========== VOYAGES ==========

  // POST /api/v1/trips
  async createTrip(data: CreateTripRequest): Promise<Trip> {
    return unifiedApi.post<Trip>('/trips', data);
  }

  // GET /api/v1/trips
  async listTrips(filters?: TripFilters): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return unifiedApi.get<Trip[]>(`/trips${queryString ? `?${queryString}` : ''}`);
  }

  // GET /api/v1/trips/public
  async listPublicTrips(limit: number = 20, offset: number = 0): Promise<Trip[]> {
    return unifiedApi.get<Trip[]>(`/trips/public?limit=${limit}&offset=${offset}`, { skipApiPrefix: true });
  }

  // GET /api/v1/trips/public?userId=...
  async listPublicTripsByUser(userId: string): Promise<Trip[]> {
    return unifiedApi.get<Trip[]>(`/trips/public?userId=${userId}`, { skipApiPrefix: true });
  }

  // GET /api/v1/trips/:id
  async getTrip(tripId: string): Promise<Trip> {
    return unifiedApi.get<Trip>(`/trips/${tripId}`);
  }

  // PUT /api/v1/trips/:id
  async updateTrip(tripId: string, data: UpdateTripRequest): Promise<Trip> {
    return unifiedApi.put<Trip>(`/trips/${tripId}`, data);
  }

  // DELETE /api/v1/trips/:id
  async deleteTrip(tripId: string): Promise<void> {
    return unifiedApi.delete<void>(`/trips/${tripId}`);
  }

  // GET /api/v1/trips/:id/export
  async exportTrip(tripId: string): Promise<Blob> {
    const token = await unifiedApi.get(''); // Utiliser une méthode publique pour récupérer le token
    const response = await fetch(`http://localhost:8085/api/v1/trips/${tripId}/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.blob();
  }

  // POST /api/v1/trips/:id/duplicate
  async duplicateTrip(tripId: string): Promise<Trip> {
    return unifiedApi.post<Trip>(`/trips/${tripId}/duplicate`);
  }

  // ========== MEMBRES DE VOYAGE ==========

  // GET /api/v1/trips/:id/members
  async listTripMembers(tripId: string): Promise<TripMember[]> {
    return unifiedApi.get<TripMember[]>(`/trips/${tripId}/members`);
  }

  // POST /api/v1/trips/:id/members
  async addTripMember(tripId: string, data: AddMemberRequest): Promise<TripMember> {
    return unifiedApi.post<TripMember>(`/trips/${tripId}/members`, data);
  }

  // PUT /api/v1/trips/members/:member_id
  async updateTripMember(memberId: string, data: UpdateMemberRequest): Promise<TripMember> {
    return unifiedApi.put<TripMember>(`/trips/members/${memberId}`, data);
  }

  // DELETE /api/v1/trips/members/:member_id
  async deleteTripMember(memberId: string): Promise<void> {
    return unifiedApi.delete<void>(`/trips/members/${memberId}`);
  }

  // ========== PHOTOS DE VOYAGE ==========

  // GET /api/v1/trips/:id/photos
  async listTripPhotos(tripId: string): Promise<TripPhoto[]> {
    try {
      console.log(`🔍 TripShareApi - Récupération des photos pour le voyage ${tripId}`);
      const photos = await unifiedApi.get<TripPhoto[]>(`/trips/${tripId}/photos`);
      console.log(`✅ TripShareApi - ${photos.length} photos récupérées`);
      return photos;
    } catch (error: any) {
      console.error(`❌ TripShareApi - Erreur récupération photos:`, error);
      return [];
    }
  }

  // POST /api/v1/trips/:id/photos
  async uploadTripPhoto(tripId: string, formData: FormData): Promise<TripPhoto> {
    // Utiliser fetch directement pour FormData
    const token = authService.getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/trips/${tripId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Ne pas définir Content-Type pour FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur upload photo: ${response.status}`);
    }

    return response.json();
  }

  // PUT /api/v1/trips/photos/:photo_id
  async updateTripPhoto(photoId: string, data: Partial<TripPhoto>): Promise<TripPhoto> {
    return unifiedApi.put<TripPhoto>(`/trips/photos/${photoId}`, data);
  }

  // DELETE /api/v1/trips/photos/:photo_id
  async deleteTripPhoto(photoId: string): Promise<void> {
    return unifiedApi.delete<void>(`/trips/photos/${photoId}`);
  }

  // ========== ACTIVITÉS ==========

  // GET /api/v1/trips/:id/activities
  async listActivities(tripId: string): Promise<Activity[]> {
    return unifiedApi.get<Activity[]>(`/trips/${tripId}/activities`);
  }

  // POST /api/v1/trips/:id/activities
  async createActivity(tripId: string, data: CreateActivityRequest): Promise<Activity> {
    return unifiedApi.post<Activity>(`/trips/${tripId}/activities`, data);
  }

  // PUT /api/v1/trips/activities/:activity_id
  async updateActivity(activityId: string, data: UpdateActivityRequest): Promise<Activity> {
    return unifiedApi.put<Activity>(`/trips/activities/${activityId}`, data);
  }

  // DELETE /api/v1/trips/activities/:activity_id
  async deleteActivity(activityId: string): Promise<void> {
    return unifiedApi.delete<void>(`/trips/activities/${activityId}`);
  }

  // ========== DÉPENSES ==========

  // GET /api/v1/trips/:id/expenses
  async listExpenses(tripId: string): Promise<Expense[]> {
    return unifiedApi.get<Expense[]>(`/trips/${tripId}/expenses`);
  }

  // POST /api/v1/trips/:id/expenses
  async createExpense(tripId: string, data: CreateExpenseRequest): Promise<Expense> {
    return unifiedApi.post<Expense>(`/trips/${tripId}/expenses`, data);
  }

  // PUT /api/v1/trips/expenses/:expense_id
  async updateExpense(expenseId: string, data: UpdateExpenseRequest): Promise<Expense> {
    return unifiedApi.put<Expense>(`/trips/expenses/${expenseId}`, data);
  }

  // DELETE /api/v1/trips/expenses/:expense_id
  async deleteExpense(expenseId: string): Promise<void> {
    return unifiedApi.delete<void>(`/trips/expenses/${expenseId}`);
  }

  // GET /api/v1/trips/:id/expenses/export
  async exportExpenses(tripId: string): Promise<Blob> {
    const token = await unifiedApi.get(''); // Utiliser une méthode publique pour récupérer le token
    const response = await fetch(`http://localhost:8085/api/v1/trips/${tripId}/expenses/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.blob();
  }

  // ========== BADGES ==========

  // POST /api/v1/badges
  async createBadge(data: CreateBadgeRequest): Promise<Badge> {
    return unifiedApi.post<Badge>('/badges', data);
  }

  // GET /api/v1/badges
  async listBadges(): Promise<Badge[]> {
    return unifiedApi.get<Badge[]>('/badges');
  }

  // GET /api/v1/badges/:id
  async getBadge(badgeId: string): Promise<Badge> {
    return unifiedApi.get<Badge>(`/badges/${badgeId}`);
  }

  // PUT /api/v1/badges/:id
  async updateBadge(badgeId: string, data: UpdateBadgeRequest): Promise<Badge> {
    return unifiedApi.put<Badge>(`/badges/${badgeId}`, data);
  }

  // DELETE /api/v1/badges/:id
  async deleteBadge(badgeId: string): Promise<void> {
    return unifiedApi.delete<void>(`/badges/${badgeId}`);
  }

  // POST /api/v1/badges/:id/award
  async awardBadge(badgeId: string, data: AwardBadgeRequest): Promise<void> {
    return unifiedApi.post<void>(`/badges/${badgeId}/award`, data);
  }

  // GET /api/v1/badges/:id/users
  async getBadgeUsers(badgeId: string): Promise<User[]> {
    return unifiedApi.get<User[]>(`/badges/${badgeId}/users`);
  }
}

// Instance exportée du service
export const tripShareApi = new TripShareApiService(); 