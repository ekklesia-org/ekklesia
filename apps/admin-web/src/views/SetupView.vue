<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Setup Ekklesia
        </h1>
        <p class="text-gray-600">
          Create your admin account and church
        </p>
      </div>

      <div class="bg-white shadow-xl rounded-lg p-8">
        <form @submit.prevent="handleSetup">
          <div class="space-y-4">
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700"
              >First Name</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                required
                class="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>

            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700"
              >Last Name</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                required
                class="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700"
              >Email address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
              >Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>

            <div>
              <label
                for="churchName"
                class="block text-sm font-medium text-gray-700"
              >Church Name</label>
              <input
                id="churchName"
                v-model="form.churchName"
                type="text"
                autocomplete="organization"
                required
                class="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>

            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Initialize System
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import EkklesiaLogo from '../assets/ekklesia-logo.svg';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  churchName: '',
});

const errors = reactive<Record<string, string>>({});

const isLoading = computed(() => authStore.isLoading);
const errorMessage = computed(() => authStore.error);

const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!form.password.trim()) {
    errors.password = 'Password is required';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (!form.churchName.trim()) {
    errors.churchName = 'Church name is required';
  }
  
  return Object.keys(errors).length === 0;
};

const handleSetup = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    await authStore.initializeSystem(form);
    router.push('/login');
  } catch (error) {
    console.error('Setup failed', error);
  }
};
</script>
