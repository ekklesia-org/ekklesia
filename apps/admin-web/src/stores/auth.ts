import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import type { User, LoginCredentials, LoginResponse } from '@ekklesia/shared';

// Auth Store
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string>('');
  const lastTokenValidation = ref<number>(0);
  const TOKEN_VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userFullName = computed(() => {
    if (!user.value) return '';
    return `${user.value.firstName} ${user.value.lastName}`;
  });
  const userInitials = computed(() => {
    if (!user.value) return '';
    return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`.toUpperCase();
  });

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true;
    error.value = '';

    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', credentials);
      const { access_token, user: userData } = response.data;

      // Store auth data
      token.value = access_token;
      user.value = userData;

      // Persist to localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));

      // Set default authorization header for future requests
      setAuthHeader(access_token);
    } catch (err: unknown) {
      console.error('Login error:', err);

      // Handle API error responses
      if (axios.isAxiosError(err) && err.response?.data?.translationKey) {
        error.value = err.response.data.translationKey;
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        error.value = err.response.data.message;
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        error.value = 'errors.auth.invalid_credentials';
      } else if (axios.isAxiosError(err) && err.response && err.response.status >= 500) {
        error.value = 'errors.server_error';
      } else {
        error.value = 'errors.auth.login_failed';
      }

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = (): void => {
    // Clear state
    user.value = null;
    token.value = null;
    error.value = '';

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];

    // Redirect to login (handled by router guard)
  };

  const initializeAuth = (): void => {
    // Try to restore auth state from localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedUserData = localStorage.getItem('user_data');

    if (storedToken && storedUserData) {
      try {
        token.value = storedToken;
        user.value = JSON.parse(storedUserData);
        setAuthHeader(storedToken);
      } catch (err) {
        console.error('Failed to restore auth state:', err);
        // Clear corrupted data
        logout();
      }
    }
  };

  const validateToken = async (force = false): Promise<boolean> => {
    if (!token.value) return false;

    // Check if we need to validate the token (cached validation)
    const now = Date.now();
    if (!force && lastTokenValidation.value && (now - lastTokenValidation.value) < TOKEN_VALIDATION_INTERVAL) {
      // Token was validated recently, assume it's still valid
      return true;
    }

    try {
      // Validate token with the server
      await axios.get('/api/auth/profile');
      lastTokenValidation.value = now;
      return true;
    } catch (err) {
      console.error('Token validation failed:', err);
      logout();
      return false;
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
      localStorage.setItem('user_data', JSON.stringify(user.value));
    }
  };

  const clearError = (): void => {
    error.value = '';
  };

  // Check if system is initialized
  const checkSystemStatus = async (): Promise<{ isInitialized: boolean; needsSetup: boolean }> => {
    try {
      const response = await axios.get('/api/setup/status');
      return response.data;
    } catch (err) {
      console.error('Failed to check system status:', err);

      // Create a more descriptive error to throw
      let errorMessage = 'Server is not responding';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          errorMessage = 'Cannot connect to server';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server internal error';
        } else if (err.response?.status === 503) {
          errorMessage = 'Service unavailable';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      // Throw the error so it can be caught by the router
      const serverError = new Error(errorMessage);
      serverError.name = 'ServerError';
      throw serverError;
    }
  };

  // Safe status check for error view - returns null on error instead of throwing
  const safeCheckSystemStatus = async (): Promise<{ isInitialized: boolean; needsSetup: boolean } | null> => {
    try {
      const response = await axios.get('/api/setup/status');
      return response.data;
    } catch (err) {
      console.error('Safe status check failed:', err);
      return null;
    }
  };

  // Initialize system with first admin user
  const initializeSystem = async (setupData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    churchName: string;
  }): Promise<void> => {
    isLoading.value = true;
    error.value = '';

    try {
      await axios.post('/api/setup/initialize', setupData);
    } catch (err: unknown) {
      console.error('Setup error:', err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        error.value = err.response.data.message;
      } else {
        error.value = 'Setup failed. Please try again.';
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Helper function to set auth header
  const setAuthHeader = (authToken: string): void => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  // Return store API
  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    userFullName,
    userInitials,

    // Actions
    login,
    logout,
    initializeAuth,
    validateToken,
    updateUser,
    clearError,
    checkSystemStatus,
    safeCheckSystemStatus,
    initializeSystem
  };
});

// Auth composable for convenience
export const useAuth = () => {
  const authStore = useAuthStore();
  const router = useRouter();

  const loginAndRedirect = async (credentials: LoginCredentials, redirectTo = '/dashboard') => {
    await authStore.login(credentials);
    router.push(redirectTo);
  };

  const logoutAndRedirect = (redirectTo = '/login') => {
    authStore.logout();
    router.push(redirectTo);
  };

  return {
    ...authStore,
    loginAndRedirect,
    logoutAndRedirect
  };
};
