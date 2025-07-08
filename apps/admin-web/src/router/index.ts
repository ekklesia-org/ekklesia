import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        // Redirect based on auth status
        const authStore = useAuthStore();
        return authStore.isAuthenticated ? '/dashboard' : '/login';
      }
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

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
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
