import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import SetupView from '../views/SetupView.vue';
import ErrorView from '../views/ErrorView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView,
      meta: { requiresSetup: true }
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorView,
      meta: { allowAll: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
  ],
});

// Navigation guard to check authentication and setup
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Skip status check for error page
  if (to.path === '/error') {
    next();
    return;
  }
  
  // Check if system needs setup (except for setup route itself)
  if (to.path !== '/setup') {
    try {
      const systemStatus = await authStore.checkSystemStatus();
      if (systemStatus.needsSetup) {
        next('/setup');
        return;
      }
    } catch (error) {
      // Server error - redirect to error page
      console.error('Server error during status check:', error);
      next(`/error?error=${encodeURIComponent(error.message || 'Server error')}`);
      return;
    }
  }
  
  // For setup route, check if system already initialized
  if (to.meta.requiresSetup) {
    try {
      const systemStatus = await authStore.checkSystemStatus();
      if (systemStatus.isInitialized) {
        next('/login');
        return;
      }
    } catch (error) {
      // Server error - redirect to error page
      console.error('Server error during setup route check:', error);
      next(`/error?error=${encodeURIComponent(error.message || 'Server error')}`);
      return;
    }
  }
  
  // Handle root path redirect based on auth status
  if (to.path === '/') {
    try {
      const systemStatus = await authStore.checkSystemStatus();
      if (systemStatus.needsSetup) {
        next('/setup');
        return;
      }
      
      if (authStore.isAuthenticated) {
        next('/dashboard');
        return;
      } else {
        next('/login');
        return;
      }
    } catch (error) {
      // Server error - redirect to error page
      console.error('Server error during root path redirect:', error);
      next(`/error?error=${encodeURIComponent(error.message || 'Server error')}`);
      return;
    }
  }
  
  // For routes that require authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Not authenticated, redirect to login
      next('/login');
      return;
    }
    
    // Validate token if we have one
    if (authStore.token) {
      const isValid = await authStore.validateToken();
      if (!isValid) {
        // Token is invalid, redirect to login
        next('/login');
        return;
      }
    }
  }
  
  // For routes that require guest (unauthenticated) status
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // User is authenticated but trying to access guest route
    next('/dashboard');
    return;
  }
  
  // All good, proceed
  next();
});

export default router;
