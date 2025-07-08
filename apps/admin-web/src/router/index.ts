import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
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
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!token;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Route requires auth but user is not authenticated
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Route is for guests but user is authenticated
    next('/dashboard');
  } else {
    // All good, proceed
    next();
  }
});

export default router;
