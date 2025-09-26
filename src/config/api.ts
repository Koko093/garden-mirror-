// API Configuration for Garden Mirror
export const getApiBaseUrl = (): string => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Browser environment - try to get from environment or use default
    return (window as any).__REACT_APP_API_URL__ || 
           (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
           'http://localhost:5000/api';
  }
  
  // Server-side rendering or build time
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback
  return 'http://localhost:5000/api';
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper to get auth token safely
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

// Helper to set auth token safely
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.warn('Failed to save auth token:', error);
    }
  }
};

// Helper to remove auth token safely
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  }
};

// Helper to store user data safely
export const setUserData = (key: string, data: any): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save ${key}:`, error);
    }
  }
};

// Helper to get user data safely
export const getUserData = (key: string): any => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Helper to remove user data safely
export const removeUserData = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key}:`, error);
    }
  }
};