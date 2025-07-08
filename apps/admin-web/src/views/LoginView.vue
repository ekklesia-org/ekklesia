<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-section">
        <h1 class="app-title">{{ $t('app.title') }}</h1>
        <p class="app-subtitle">{{ $t('auth.admin_portal') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <h2 class="form-title">{{ $t('auth.login') }}</h2>
        
        <div class="form-group">
          <label for="email" class="form-label">{{ $t('auth.email') }}</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            :placeholder="$t('auth.email_placeholder')"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            required 
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password" 
            :placeholder="$t('auth.password_placeholder')"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            required 
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="login-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? $t('auth.logging_in') : $t('auth.login') }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>
      </form>

      <div class="login-footer">
        <p class="footer-text">{{ $t('auth.need_help') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    churchId?: string;
  };
}

const router = useRouter();
const { t } = useI18n();

const formData = reactive<LoginForm>({
  email: '',
  password: ''
});

const errors = reactive<FormErrors>({});
const errorMessage = ref('');
const isLoading = ref(false);

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors]);
  
  if (!formData.email) {
    errors.email = t('validation.required', { field: t('auth.email') });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('validation.email_invalid');
  }
  
  if (!formData.password) {
    errors.password = t('validation.required', { field: t('auth.password') });
  } else if (formData.password.length < 6) {
    errors.password = t('validation.min_length', { field: t('auth.password'), min: 6 });
  }
  
  return Object.keys(errors).length === 0;
};

const handleLogin = async () => {
  errorMessage.value = '';
  
  if (!validateForm()) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    const response = await axios.post<LoginResponse>('/api/auth/login', {
      email: formData.email,
      password: formData.password
    });
    
    const { access_token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    // Redirect to dashboard
    router.push('/dashboard');
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.response?.data?.translationKey) {
      errorMessage.value = t(error.response.data.translationKey);
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = t('errors.auth.login_failed');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
  
  .app-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    margin-bottom: 0.5rem;
  }
  
  .app-subtitle {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }
}

.login-form {
  .form-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
    
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    
    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      &.input-error {
        border-color: #ef4444;
        
        &:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
      }
    }
    
    .error-text {
      display: block;
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.25rem;
    }
  }
  
  .form-actions {
    margin-top: 1.5rem;
    
    .login-button {
      width: 100%;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      
      &:hover:not(:disabled) {
        background: #2563eb;
      }
      
      &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      
      .loading-spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }
  
  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .error-icon {
      font-size: 1rem;
    }
  }
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  
  .footer-text {
    color: #6b7280;
    font-size: 0.75rem;
    margin: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .logo-section .app-title {
    font-size: 1.75rem;
  }
}
</style>

