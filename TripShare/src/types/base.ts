// Types de base pour l'API

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BaseAPIResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends BaseAPIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface APIService {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data?: unknown): Promise<T>;
  put<T>(endpoint: string, data?: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  patch<T>(endpoint: string, data?: unknown): Promise<T>;
}
