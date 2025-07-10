<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-6">
        {{ user ? $t('users.edit_user') : $t('users.create_user') }}
      </h2>

      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- First Name -->
          <div>
            <label
              for="firstName"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('users.first_name') }}
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.firstName }"
              required
            >
            <p
              v-if="errors.firstName"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.firstName }}
            </p>
          </div>

          <!-- Last Name -->
          <div>
            <label
              for="lastName"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('users.last_name') }}
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.lastName }"
              required
            >
            <p
              v-if="errors.lastName"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.lastName }}
            </p>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('users.email') }}
          </label>
          <input
            id="email"
            v-model="form.email"
            autocomplete="username"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.email }"
            required
          >
          <p
            v-if="errors.email"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.email }}
          </p>
        </div>

        <!-- Password (only for creating new users) -->
        <div v-if="!user">
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('users.password') }}
          </label>
          <input
            id="password"
            v-model="form.password"
            autocomplete="new-password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.password }"
            :required="!user"
          >
          <p
            v-if="errors.password"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.password }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            {{ $t('users.password_hint') }}
          </p>
        </div>

        <!-- Role -->
        <div>
          <label
            for="role"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('users.role') }}
          </label>
          <select
            id="role"
            v-model="form.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.role }"
            required
            :disabled="isLastSuperAdmin"
          >
            <option value="">
              {{ $t('users.select_role') }}
            </option>
            <option
              v-for="role in availableRoles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
          <p
            v-if="errors.role"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.role }}
          </p>
        </div>

        <!-- Active Status (only for editing existing users) -->
        <div v-if="user">
          <label class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="mr-2"
            >
            {{ $t('users.active') }}
          </label>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6">
          <AppButton
            type="button"
            variant="secondary"
            @click="$emit('cancel')"
          >
            {{ $t('common.cancel') }}
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? $t('common.saving') : (user ? $t('common.update') : $t('common.create')) }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton } from '@ekklesia/ui';
import { User, ICreateUserDto, IUpdateUserDto } from '@ekklesia/shared';
import { useAuth } from '../stores/auth';

const { t } = useI18n();
const auth = useAuth();

interface Props {
  user?: User;
  isSubmitting?: boolean;
  isLastSuperAdmin?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [data: ICreateUserDto | IUpdateUserDto];
  cancel: [];
}>();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  isActive: true,
});

const errors = ref<Record<string, string>>({});

// Available roles based on current user's role
const availableRoles = computed(() => {
  const currentUserRole = auth.user?.role;
  
  // Super admins can assign any role
  if (currentUserRole === 'SUPER_ADMIN') {
    return [
      { value: 'SUPER_ADMIN', label: t('users.roles.super_admin') },
      { value: 'CHURCH_ADMIN', label: t('users.roles.church_admin') },
      { value: 'PASTOR', label: t('users.roles.pastor') },
      { value: 'TREASURER', label: t('users.roles.treasurer') },
      { value: 'SECRETARY', label: t('users.roles.secretary') },
      { value: 'MEMBER', label: t('users.roles.member') }
    ];
  }
  
  // Non-super admins cannot create super admin users
  return [
    { value: 'CHURCH_ADMIN', label: t('users.roles.church_admin') },
    { value: 'PASTOR', label: t('users.roles.pastor') },
    { value: 'TREASURER', label: t('users.roles.treasurer') },
    { value: 'SECRETARY', label: t('users.roles.secretary') },
    { value: 'MEMBER', label: t('users.roles.member') }
  ];
});

const validateForm = () => {
  errors.value = {};

  if (!form.firstName.trim()) {
    errors.value.firstName = t('validation.required', { field: t('users.first_name') });
  }

  if (!form.lastName.trim()) {
    errors.value.lastName = t('validation.required', { field: t('users.last_name') });
  }

  if (!form.email.trim()) {
    errors.value.email = t('validation.required', { field: t('users.email') });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = t('validation.email_invalid');
  }

  if (!props.user && !form.password.trim()) {
    errors.value.password = t('validation.required', { field: t('users.password') });
  } else if (!props.user && form.password.length < 6) {
    errors.value.password = t('validation.min_length', { field: t('users.password'), min: 6 });
  }

  if (!form.role.trim()) {
    errors.value.role = t('validation.required', { field: t('users.role') });
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  if (props.user) {
    // Editing existing user
    const updateData: IUpdateUserDto = {
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      isActive: form.isActive,
    };
    emit('submit', updateData);
  } else {
    // Creating new user
    const createData: ICreateUserDto = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    emit('submit', createData);
  }
};

onMounted(() => {
  if (props.user) {
    form.firstName = props.user.firstName;
    form.lastName = props.user.lastName;
    form.email = props.user.email;
    form.role = props.user.role;
    form.isActive = props.user.isActive;
  }
});
</script>
