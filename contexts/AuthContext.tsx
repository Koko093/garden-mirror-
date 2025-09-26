import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getApiBaseUrl, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  setUserData, 
  getUserData, 
  removeUserData 
} from '../config/api';

// For now, we'll create a simple auth context that works with the existing structure
// This will be replaced with the MERN stack version later

// Auth states
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_ADMIN: 'SET_ADMIN',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  admin: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

// Auth reducer
const authReducer = (state: any, action: any) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      const { user, admin, token } = action.payload;
      return {
        ...state,
        user: user || null,
        admin: admin || null,
        token,
        isAuthenticated: true,
        isAdmin: !!admin,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        admin: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isAdmin: false,
        loading: false,
      };

    case AUTH_ACTIONS.SET_ADMIN:
      return {
        ...state,
        admin: action.payload,
        isAuthenticated: true,
        isAdmin: true,
        loading: false,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
        admin: state.admin ? { ...state.admin, ...action.payload } : null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create Auth Context
const AuthContext = createContext<any>(null);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;
      
      const token = getAuthToken();
      const storedUser = getUserData('user');
      const storedAdmin = getUserData('admin');

      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      try {
        // Try to use stored user/admin data
        if (storedAdmin) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              admin: storedAdmin,
              token,
            },
          });
        } else if (storedUser) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: storedUser,
              token,
            },
          });
        }
      } catch (error) {
        // Token is invalid, clear everything
        removeAuthToken();
        removeUserData('user');
        removeUserData('admin');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Login function using MongoDB backend
  const login = async (credentials: any, isAdminLogin = false) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const API_BASE_URL = getApiBaseUrl();
      const endpoint = isAdminLogin ? '/auth/admin/login' : '/auth/login';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user, admin, token } = data.data || data;

      // Store in localStorage using helpers
      setAuthToken(token);
      if (user && !isAdminLogin) {
        setUserData('user', user);
      }
      if (admin) {
        setUserData('admin', admin);
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { 
          user: isAdminLogin ? null : user, 
          admin: admin || null, 
          token 
        },
      });

      return { success: true, data: { user, admin, token } };
    } catch (error: any) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // Register function using MongoDB backend
  const register = async (userData: any) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const { user, token } = data.data || data;

      // Store in localStorage using helpers
      setAuthToken(token);
      setUserData('user', user);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, data: { user, token } };
    } catch (error: any) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear localStorage using helpers
      removeAuthToken();
      removeUserData('user');
      removeUserData('admin');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update profile function using MongoDB backend
  const updateProfile = async (profileData: any) => {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      const updatedUser = data.data?.user || data.user;

      // Update localStorage using helper
      setUserData('user', updatedUser);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      });

      return { success: true, data: { user: updatedUser } };
    } catch (error) {
      throw error;
    }
  };

  // Change password function using MongoDB backend
  const changePassword = async (passwordData: any) => {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return { success: true, message: data.message || 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific permission (for admin)
  const hasPermission = (resource: string, action: string) => {
    if (!state.admin) return false;
    if (state.admin.role === 'super_admin') return true;
    
    // Mock permission check
    return true;
  };

  // Get user display name
  const getDisplayName = () => {
    if (state.admin) return state.admin.name;
    if (state.user) return state.user.name;
    return 'Guest';
  };

  // Get user email
  const getEmail = () => {
    if (state.admin) return state.admin.email;
    if (state.user) return state.user.email;
    return null;
  };

  // Check if current user owns a resource
  const isOwner = (resourceUserId: string) => {
    return state.user && state.user.id === resourceUserId;
  };

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    
    // Utilities
    hasPermission,
    getDisplayName,
    getEmail,
    isOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component to protect routes
export const withAuth = (Component: React.ComponentType<any>, requireAdmin = false) => {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    if (requireAdmin && !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;