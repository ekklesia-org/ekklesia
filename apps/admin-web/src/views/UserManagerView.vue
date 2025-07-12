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

      <!-- Users Table -->
      <AppTable
        :columns="tableColumns"
        :data="users"
        :loading="isLoading"
        :error="error || undefined"
        :loading-text="$t('common.loading')"
        :empty-text="$t('users.manager.no_users')"
        :actions-label="$t('common.actions')"
        row-key="id"
        :show-pagination="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @retry="usersStore.fetchUsers()"
        @update:current-page="fetchUsersWithContext"
      >
        <!-- Name column -->
        <template #cell-name="{ row }">
          <div class="text-sm font-medium text-gray-900">
            {{ row.firstName }} {{ row.lastName }}
          </div>
        </template>

        <!-- Email column -->
        <template #cell-email="{ row }">
          <div class="text-sm text-gray-900">
            {{ row.email }}
          </div>
        </template>

        <!-- Role column -->
        <template #cell-role="{ row }">
          <span
            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
            :class="getRoleColor(row.role)"
          >
            {{ $t(`users.roles.${row.role.toLowerCase()}`) }}
          </span>
        </template>

        <!-- Status column -->
        <template #cell-status="{ row }">
          <span
            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
            :class="row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ row.isActive ? $t('users.active') : $t('users.inactive') }}
          </span>
        </template>

        <!-- Error action -->
        <template #error-action="{ retry }">
          <AppButton
            variant="primary"
            class="mt-4"
            @click="retry"
          >
            {{ $t('common.retry') }}
          </AppButton>
        </template>

        <!-- Empty action -->
        <template #empty-action>
          <AppButton
            variant="primary"
            class="mt-4"
            @click="showCreateForm"
          >
            {{ $t('users.manager.create_first_user') }}
          </AppButton>
        </template>

        <!-- Actions column -->
        <template #actions="{ row }">
          <div class="flex justify-end space-x-2">
            <AppButton
              variant="secondary"
              size="sm"
              @click="editUser(row)"
            >
              {{ $t('common.edit') }}
            </AppButton>
            <AppButton
              v-if="row.isActive"
              variant="primary"
              size="sm"
              :disabled="isLastSuperAdmin(row)"
              @click="deactivateUser(row.id)"
            >
              {{ $t('users.deactivate') }}
            </AppButton>
            <AppButton
              v-else
              variant="success"
              size="sm"
              @click="activateUser(row.id)"
            >
              {{ $t('users.activate') }}
            </AppButton>
            <AppButton
              variant="danger"
              size="sm"
              :disabled="isLastSuperAdmin(row)"
              @click="deleteUser(row.id)"
            >
              {{ $t('common.delete') }}
            </AppButton>
          </div>
        </template>

        <!-- Pagination -->
        <template #pagination="{ previousPage, nextPage }">
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
        </template>
      </AppTable>
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
import { AppButton, AppTable, TableColumn, User } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';
import UserForm from '../components/UserForm.vue';
import { useUsersStore } from '../stores/users';
import { useSelectedChurch } from '../stores/selectedChurch';
import { useAuth } from '../stores/auth';
import { useErrorHandler } from '../utils/errorHandler';
import { ICreateUserDto, IUpdateUserDto } from '@ekklesia/shared';

const { t } = useI18n();
const { handleError, handleSuccess } = useErrorHandler();
const usersStore = useUsersStore();
const selectedChurchStore = useSelectedChurch();
const auth = useAuth();

const selectedUser = ref<User | null>(null);
const showForm = ref(false);
const includeInactive = ref(false);
const currentPage = ref(1);
const totalPages = computed(() => usersStore.totalPages);

// Use store getters and state
const users = computed(() => usersStore.users);
const isLoading = computed(() => usersStore.isLoading);
const error = computed(() => usersStore.error);
const isSubmitting = computed(() => usersStore.isLoading);

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
    handleSuccess(t('users.activate_success'));
  } catch (error) {
    handleError(error, t('users.activate_error'));
  }
};

const deactivateUser = async (id: string) => {
  const user = users.value.find(u => u.id === id);
  if (user && isLastSuperAdmin(user)) {
    handleError(new Error(t('users.manager.cannot_deactivate_last_super_admin')));
    return;
  }

  if (confirm(t('users.manager.confirm_deactivate'))) {
    try {
      await usersStore.deactivateUser(id);
      handleSuccess(t('users.deactivate_success'));
    } catch (error) {
      handleError(error, t('users.deactivate_error'));
    }
  }
};

const deleteUser = async (id: string) => {
  const user = users.value.find(u => u.id === id);
  if (user && isLastSuperAdmin(user)) {
    handleError(new Error(t('users.manager.cannot_delete_last_super_admin')));
    return;
  }

  if (confirm(t('users.manager.confirm_delete'))) {
    try {
      await usersStore.deleteUser(id);
      handleSuccess(t('users.delete_success'));
    } catch (error) {
      handleError(error, t('users.delete_error'));
    }
  }
};

const handleFormSubmit = async (data: ICreateUserDto | IUpdateUserDto) => {
  try {
    if (selectedUser.value) {
      await usersStore.updateUser(selectedUser.value.id, data as IUpdateUserDto);
      handleSuccess(t('users.update_success'));
    } else {
      await usersStore.createUser(data as ICreateUserDto);
      handleSuccess(t('users.create_success'));
    }
    showForm.value = false;
  } catch (error) {
    console.log('Error in handleFormSubmit:', error);
    const errorMessage = selectedUser.value ? t('users.update_error') : t('users.create_error');
    handleError(error, errorMessage);
  }
};

const cancelForm = () => {
  showForm.value = false;
  selectedUser.value = null;
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

// Table columns configuration
const tableColumns = computed<TableColumn[]>(() => [
  {
    key: 'name',
    label: t('users.name'),
  },
  {
    key: 'email',
    label: t('users.email'),
  },
  {
    key: 'role',
    label: t('users.role'),
  },
  {
    key: 'status',
    label: t('users.status'),
  },
  {
    key: 'createdAt',
    label: t('users.created'),
    format: (value) => formatDate(value),
    cellClass: 'text-sm text-gray-500',
  },
]);

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
  // For SUPER_ADMIN users, wait for church selection to avoid duplicate requests
  if (auth.user?.role === 'SUPER_ADMIN') {
    // Only fetch if a church is already selected, otherwise let the watch handle it
    if (selectedChurchStore.selectedChurchId) {
      fetchUsersWithContext();
    }
  } else {
    // For non-SUPER_ADMIN users, fetch immediately
    fetchUsersWithContext();
  }
});
</script>
