import { apiClient } from './client';
import type { 
  RegisterUserDto, 
  RegisterResponse, 
  LoginCredentials, 
  AuthResponse 
} from '@/types';

/**
 * Register a new user account
 */
export const registerUser = async (userData: RegisterUserDto): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
  return response.data;
};

/**
 * Login with existing credentials
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};