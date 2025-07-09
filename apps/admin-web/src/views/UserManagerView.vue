<template>
  <AdminLayout :title="$t('users.manager.title')">
    <!-- User List -->
    <div
      v-if="!showForm"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold">
          {{ $t('users.manager.all_users') }}
        </h2>
        <div class="flex space-x-4">
          <AppButton
            variant="secondary"
            @click="toggleIncludeInactive"
          >
            {{ includeInactive ? $t('users.hide_inactive') : $t('users.show_inactive') }}
          </AppButton>
          <AppButton
            variant="primary"
            @click="showCreateForm"
          >
            {{ $t('users.manager.create_user') }}
          </AppButton>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="text-center py-8"
      >
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="hasError"
        class="text-center py-8"
      >
        <p class="text-red-600">
          {{ error }}
        </p>
        <AppButton
          variant="primary"
          class="mt-4"
          @click="usersStore.fetchUsers()"
        >
          {{ $t('common.retry') }}
        </AppButton>
      </div>

      <!-- Users List -->
      <div
        v-else-if="users.length > 0"
        class="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('users.name') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('users.email') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('users.role') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('users.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('users.created') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ user.firstName }} {{ user.lastName }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ user.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRoleColor(user.role)"
                >
                  {{ $t(`users.roles.${user.role.toLowerCase()}`) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user.isActive ? $t('users.active') : $t('users.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <AppButton
                    variant="secondary"
                    size="sm"
                    @click="editUser(user)"
                  >
                    {{ $t('common.edit') }}
                  </AppButton>
                  <AppButton
                    v-if="user.isActive"
                    variant="primary"
                    size="sm"
                    :disabled="isLastSuperAdmin(user)"
                    @click="deactivateUser(user.id)"
                  >
                    {{ $t('users.deactivate') }}
                  </AppButton>
                  <AppButton
                    v-else
                    variant="success"
                    size="sm"
                    @click="activateUser(user.id)"
                  >
                    {{ $t('users.activate') }}
                  </AppButton>
                  <AppButton
                    variant="danger"
                    size="sm"
                    :disabled="isLastSuperAdmin(user)"
                    @click="deleteUser(user.id)"
                  >
                    {{ $t('common.delete') }}
                  </AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-8"
      >
        <p class="text-gray-500">
          {{ $t('users.manager.no_users') }}
        </p>
        <AppButton
          variant="primary"
          class="mt-4"
          @click="showCreateForm"
        >
          {{ $t('users.manager.create_first_user') }}
        </AppButton>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center mt-8"
      >
        <nav class="flex items-center space-x-1">
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            {{ $t('common.previous') }}
          </AppButton>
          <span class="px-4 py-2 text-sm text-gray-700">
            {{ $t('common.page_of', { current: currentPage, total: totalPages }) }}
          </span>
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            {{ $t('common.next') }}
          </AppButton>
        </nav>
      </div>
    </div>

    <!-- User Form Modal -->
    <UserForm
      v-if="showForm"
      class="py-8"
      :user="selectedUser || undefined"
      :is-submitting="isSubmitting"
      :is-last-super-admin="isLastSuperAdminForForm"
      @submit="handleFormSubmit"
      @cancel="cancelForm"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton, useToast } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';
import UserForm from '../components/UserForm.vue';
import { User, CreateUserDto, UpdateUserDto } from '../services/userService';
import { useUsersStore } from '../stores/users';
import { useSelectedChurch } from '../stores/selectedChurch';
import { useAuth } from '../stores/auth';

const { t } = useI18n();
const toast = useToast();
const usersStore = useUsersStore();
const selectedChurchStore = useSelectedChurch();
const auth = useAuth();

const selectedUser = ref<User | null>(null);
const showForm = ref(false);
const includeInactive = ref(false);

// Use store getters and state
const users = computed(() => usersStore.users);
const isLoading = computed(() => usersStore.isLoading);
const hasError = computed(() => usersStore.hasError);
const error = computed(() => usersStore.error);
const isSubmitting = computed(() => usersStore.isLoading);
const currentPage = computed(() => usersStore.currentPage);
const totalPages = computed(() => usersStore.totalPages);

const showCreateForm = () => {
  selectedUser.value = null;
  showForm.value = true;
};

const editUser = (user: User) => {
  selectedUser.value = user;
  showForm.value = true;
};

const toggleIncludeInactive = () => {
  includeInactive.value = !includeInactive.value;
  fetchUsersWithContext();
};

const fetchUsersWithContext = (page = 1) => {
  const churchId = auth.user?.role === 'SUPER_ADMIN' ? selectedChurchStore.selectedChurchId ?? undefined : undefined;
  usersStore.fetchUsers(page, includeInactive.value, churchId);
};

const activateUser = async (id: string) => {
  try {
    await usersStore.activateUser(id);
    toast.success(t('users.activate_success'));
  } catch (error) {
    console.error('Error activating user:', error);
    toast.error(t('users.activate_error'));
  }
};

const deactivateUser = async (id: string) => {
  const user = users.value.find(u => u.id === id);
  if (user && isLastSuperAdmin(user)) {
    toast.error(t('users.manager.cannot_deactivate_last_super_admin'));
    return;
  }
  
  if (confirm(t('users.manager.confirm_deactivate'))) {
    try {
      await usersStore.deactivateUser(id);
      toast.success(t('users.deactivate_success'));
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error(t('users.deactivate_error'));
    }
  }
};

const deleteUser = async (id: string) => {
  const user = users.value.find(u => u.id === id);
  if (user && isLastSuperAdmin(user)) {
    toast.error(t('users.manager.cannot_delete_last_super_admin'));
    return;
  }
  
  if (confirm(t('users.manager.confirm_delete'))) {
    try {
      await usersStore.deleteUser(id);
      toast.success(t('users.delete_success'));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('users.delete_error'));
    }
  }
};

const handleFormSubmit = async (data: CreateUserDto | UpdateUserDto) => {
  try {
    if (selectedUser.value) {
      await usersStore.updateUser(selectedUser.value.id, data as UpdateUserDto);
      toast.success(t('users.update_success'));
    } else {
      await usersStore.createUser(data as CreateUserDto);
      toast.success(t('users.create_success'));
    }
    showForm.value = false;
  } catch (error) {
    console.error('Error saving user:', error);
    const errorMessage = selectedUser.value ? t('users.update_error') : t('users.create_error');
    toast.error(errorMessage);
  }
};

const cancelForm = () => {
  showForm.value = false;
  selectedUser.value = null;
};

const previousPage = () => {
  if (currentPage.value > 1) {
    fetchUsersWithContext(currentPage.value - 1);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchUsersWithContext(currentPage.value + 1);
  }
};

const getRoleColor = (role: string) => {
  const colors = {
    'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
    'CHURCH_ADMIN': 'bg-blue-100 text-blue-800',
    'PASTOR': 'bg-green-100 text-green-800',
    'TREASURER': 'bg-yellow-100 text-yellow-800',
    'SECRETARY': 'bg-orange-100 text-orange-800',
    'MEMBER': 'bg-gray-100 text-gray-800',
  };
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

const isLastSuperAdmin = (user: User) => {
  const superAdmins = users.value.filter(u => u.role === 'SUPER_ADMIN' && u.isActive);
  return user.role === 'SUPER_ADMIN' && superAdmins.length === 1;
};

const isLastSuperAdminForForm = computed(() => {
  if (!selectedUser.value) return false;
  return isLastSuperAdmin(selectedUser.value);
});

// Watch for changes in selected church
watch(
  () => selectedChurchStore.selectedChurchId,
  (newChurchId) => {
    if (auth.user?.role === 'SUPER_ADMIN' && newChurchId) {
      fetchUsersWithContext();
    }
  }
);

onMounted(() => {
  fetchUsersWithContext();
});
</script>
