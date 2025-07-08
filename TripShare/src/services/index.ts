// ========== EXPORTS DES SERVICES API ==========

// Service API principal avec tous les endpoints du backend Go
export { tripShareApi, TripShareApiService } from './tripShareApi';

// Types d'API exportés
export type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  CreateTripRequest,
  UpdateTripRequest,
  TripFilters,
  AddMemberRequest,
  UpdateMemberRequest,
  CreateActivityRequest,
  UpdateActivityRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  AwardBadgeRequest
} from './tripShareApi';

// Services existants
export { authService } from './auth';
export { unifiedApi } from './unifiedApi';
export { profileService } from './profileService';
export { socialAuth } from './socialAuth';
export { countryService } from './countryService';

// Service API legacy (pour compatibilité)
export { APIService } from './api'; 