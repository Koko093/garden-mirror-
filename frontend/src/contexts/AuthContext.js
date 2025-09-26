import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

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
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
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
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedAdmin = localStorage.getItem('admin');

      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      try {
        // Try to get current user/admin profile
        if (storedAdmin) {
          const response = await authAPI.getAdminProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              admin: response.data.admin,
              token,
            },
          });
        } else if (storedUser) {
          const response = await authAPI.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        }
      } catch (error) {
        // Token is invalid, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials, isAdminLogin = false) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = isAdminLogin 
        ? await authAPI.adminLogin(credentials)
        : await authAPI.login(credentials);

      const { user, admin, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      if (admin) {
        localStorage.setItem('admin', JSON.stringify(admin));
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, admin, token },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return response;
    } catch (error) {
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
      if (state.isAdmin) {
        await authAPI.adminLogout();
      } else {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific permission (for admin)
  const hasPermission = (resource, action) => {
    if (!state.admin) return false;
    if (state.admin.role === 'super_admin') return true;
    
    const permissions = state.admin.permissions;
    return permissions[resource] && permissions[resource][action];
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
  const isOwner = (resourceUserId) => {
    return state.user && state.user._id === resourceUserId;
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
export const withAuth = (Component, requireAdmin = false) => {
  return function AuthenticatedComponent(props) {
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