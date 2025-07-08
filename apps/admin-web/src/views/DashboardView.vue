<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1 class="dashboard-title">{{ $t('dashboard.title') }}</h1>
      <div class="user-info">
        <span class="welcome-text">{{ $t('dashboard.welcome', { name: user?.firstName }) }}</span>
        <button @click="logout" class="logout-button">{{ $t('auth.logout') }}</button>
      </div>
    </header>

    <main class="dashboard-content">
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>{{ $t('dashboard.members') }}</h3>
          <p class="card-value">{{ memberCount }}</p>
        </div>
        
        <div class="dashboard-card">
          <h3>{{ $t('dashboard.events') }}</h3>
          <p class="card-value">{{ eventCount }}</p>
        </div>
        
        <div class="dashboard-card">
          <h3>{{ $t('dashboard.donations') }}</h3>
          <p class="card-value">${{ donationAmount }}</p>
        </div>
        
        <div class="dashboard-card">
          <h3>{{ $t('dashboard.announcements') }}</h3>
          <p class="card-value">{{ announcementCount }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  churchId?: string;
}

const router = useRouter();
const { t } = useI18n();

const user = ref<User | null>(null);
const memberCount = ref(0);
const eventCount = ref(0);
const donationAmount = ref(0);
const announcementCount = ref(0);

onMounted(() => {
  // Load user data from localStorage
  const userData = localStorage.getItem('user_data');
  if (userData) {
    user.value = JSON.parse(userData);
  }
  
  // Load dashboard data (mock data for now)
  loadDashboardData();
});

const loadDashboardData = () => {
  // Mock data - replace with actual API calls
  memberCount.value = 125;
  eventCount.value = 8;
  donationAmount.value = 15420;
  announcementCount.value = 3;
};

const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  router.push('/login');
};
</script>

<style scoped lang="scss">
.dashboard {
  min-height: 100vh;
  background: #f9fafb;
}

.dashboard-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .dashboard-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .welcome-text {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .logout-button {
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
      
      &:hover {
        background: #dc2626;
      }
    }
  }
}

.dashboard-content {
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
  
  h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    margin: 0;
    margin-bottom: 1rem;
  }
  
  .card-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-content {
    padding: 1rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
