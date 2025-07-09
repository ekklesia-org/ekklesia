import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import SetupView from '../views/SetupView.vue';
import ErrorView from '../views/ErrorView.vue';
import ChurchManagerView from '../views/ChurchManagerView.vue';
import ComingSoonView from '../views/ComingSoonView.vue';
import NotFoundView from '../views/NotFoundView.vue';

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
    {
      path: '/churches',
      name: 'churches',
      component: ChurchManagerView,
      meta: { requiresAuth: true }
    },
    {
      path: '/coming-soon',
      name: 'coming-soon',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    // Routes that redirect to coming soon page
    {
      path: '/members',
      name: 'members',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/events',
      name: 'events',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/finances',
      name: 'finances',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/announcements',
      name: 'announcements',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/church-settings',
      name: 'church-settings',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    // 404 catch-all route - must be last
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { allowAll: true }
    },
  ],
});

// Navigation guard to check authentication and setup
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Skip status check for error page and 404 page
  if (to.path === '/error' || to.name === 'not-found') {
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
      const errorMessage = error instanceof Error ? error.message : 'Server error';
      next(`/error?error=${encodeURIComponent(errorMessage)}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Server error';
      next(`/error?error=${encodeURIComponent(errorMessage)}`);
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
      }
    } catch (error) {
      // Server error - redirect to error page
      console.error('Server error during root path redirect:', error);
      const errorMessage = error instanceof Error ? error.message : 'Server error';
      next(`/error?error=${encodeURIComponent(errorMessage)}`);
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
