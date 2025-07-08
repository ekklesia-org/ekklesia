<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('dashboard.title') }}
            </h1>
            <p class="text-sm text-gray-600 mt-1">
              {{ $t('dashboard.welcome', { name: user?.firstName }) }}
            </p>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ user?.firstName?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">
                  {{ user?.firstName }} {{ user?.lastName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ user?.email }}
                </p>
              </div>
            </div>

            <button
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
              @click="logout"
            >
              <svg
                class="-ml-0.5 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {{ $t('auth.logout') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Members Card -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ $t('dashboard.members') }}
                </dt>
                <dd class="text-2xl font-semibold text-gray-900">
                  {{ memberCount.toLocaleString() }}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <!-- Events Card -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ $t('dashboard.events') }}
                </dt>
                <dd class="text-2xl font-semibold text-gray-900">
                  {{ eventCount }}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <!-- Donations Card -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-8 w-8 text-yellow-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ $t('dashboard.donations') }}
                </dt>
                <dd class="text-2xl font-semibold text-gray-900">
                  ${{ donationAmount.toLocaleString() }}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <!-- Announcements Card -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-8 w-8 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ $t('dashboard.announcements') }}
                </dt>
                <dd class="text-2xl font-semibold text-gray-900">
                  {{ announcementCount }}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('dashboard.quick_actions') }}
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
              <svg
                class="h-6 w-6 text-blue-600 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ $t('dashboard.add_member') }}</span>
            </button>

            <button class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
              <svg
                class="h-6 w-6 text-green-600 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ $t('dashboard.create_event') }}</span>
            </button>

            <button class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
              <svg
                class="h-6 w-6 text-purple-600 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ $t('dashboard.new_announcement') }}</span>
            </button>
          </div>
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
