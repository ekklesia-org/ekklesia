<template>
  <AdminLayout :title="$t('churches.manager.title')">
    <!-- Church List -->
    <div
      v-if="!showForm"
      class="container mx-auto mt-8 px-4 sm:px-6 lg:px-8"
    >
      <div class="flex justify-between mb-6">
        <h2 class="text-2xl font-bold leading-tight">
          {{ $t('churches.manager.all_churches') }}
        </h2>
        <AppButton
          variant="primary"
          aria-label="Create Church"
          @click="showCreateForm"
        >
          {{ $t('churches.manager.create_church') }}
        </AppButton>
      </div>

      <!-- Churches Table -->
      <AppTable
        :columns="tableColumns"
        :data="churches"
        :loading="churchesStore.isLoading"
        :error="churchesStore.error || undefined"
        :loading-text="$t('common.loading')"
        :empty-text="$t('churches.manager.no_churches')"
        :actions-label="$t('common.actions')"
        row-key="id"
        @retry="churchesStore.fetchChurches()"
      >
        <!-- Users column -->
        <template #cell-users="{ row }: { row: ChurchWithUsers }">
          <div class="text-sm text-gray-900">
            <span v-if="!row.users || row.users.length === 0">-</span>
            <span v-else>
              {{ row.users.map((u) => `${u.firstName} ${u.lastName}`).join(', ') }}
            </span>
          </div>
        </template>

        <!-- Actions column -->
        <template #actions="{ row }">
          <div class="flex justify-end space-x-2">
            <AppButton
              variant="secondary"
              size="sm"
              @click="editChurch(row)"
            >
              {{ $t('common.edit') }}
            </AppButton>
            <AppButton
              variant="danger"
              size="sm"
              @click="deleteChurch(row.id)"
            >
              {{ $t('common.delete') }}
            </AppButton>
          </div>
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
      </AppTable>
    </div>

    <!-- Church Form Modal -->
    <ChurchForm
      v-if="showForm"
      class="py-8"
      :church="selectedChurch || undefined"
      :is-submitting="isSubmitting"
      @submit="handleFormSubmit"
      @cancel="cancelForm"
    />

    <!-- Super Admin Transfer Dialog -->
    <SuperAdminTransferDialog
      v-if="showTransferDialog && churchToDelete"
      :church-id="churchToDelete.id"
      :church-name="churchToDelete.name"
      :super-admins="churchToDelete.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive)"
      @transfer="handleTransfer"
      @cancel="cancelTransfer"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton, AppTable, TableColumn, useToast } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';
import { ChurchWithUsers, ICreateChurchDto } from '@ekklesia/shared';
import ChurchForm from '../components/ChurchForm.vue';
import SuperAdminTransferDialog from '../components/SuperAdminTransferDialog.vue';
import { useChurchesStore } from '../stores/churches';
import { useErrorHandler } from '../utils/errorHandler';

const { t } = useI18n();
const toast = useToast();
const churchesStore = useChurchesStore();
const { handleError, handleSuccess } = useErrorHandler();

const selectedChurch = ref<ChurchWithUsers | null>(null);
const showForm = ref(false);
const showTransferDialog = ref(false);
const churchToDelete = ref<ChurchWithUsers | null>(null);

// Use store getters and state
const churches = computed(() => churchesStore.churches);
const isSubmitting = computed(() => churchesStore.isLoading);

const showCreateForm = () => {
  selectedChurch.value = null;
  showForm.value = true;
};

const editChurch = (church: ChurchWithUsers) => {
  selectedChurch.value = church;
  showForm.value = true;
};

const deleteChurch = async (id: string) => {
  const church = churches.value.find(c => c.id === id);
  if (!church) return;

  // Check if church has Super Admin users
  const superAdmins = church.users.filter(user => user.role === 'SUPER_ADMIN' && user.isActive);

  if (superAdmins.length > 0) {
    // Show transfer dialog for Super Admins
    churchToDelete.value = church;
    showTransferDialog.value = true;
  } else {
    // Normal deletion flow
    if (confirm(t('churches.manager.confirm_delete'))) {
      try {
        await churchesStore.deleteChurch(id);
        handleSuccess(t('churches.delete_success'));
      } catch (error: any) {
        handleError(error, t('churches.delete_error'));
      }
    }
  }
};

const handleFormSubmit = async (data: ICreateChurchDto) => {
  try {
    if (selectedChurch.value) {
      await churchesStore.updateChurch(selectedChurch.value.id, data);
      handleSuccess(t('churches.update_success'));
    } else {
      await churchesStore.createChurch(data);
      handleSuccess(t('churches.create_success'));
    }
  } catch (error) {
    const errorMessage = selectedChurch.value ? t('churches.update_error') : t('churches.create_error');
    handleError(error, errorMessage);
  } finally {
    showForm.value = false;
  }
};

const cancelForm = () => {
  showForm.value = false;
};

const handleTransfer = async (toChurchId: string) => {
  if (!churchToDelete.value) return;

  try {
    // After transfer, proceed with deletion
    await churchesStore.deleteChurch(churchToDelete.value.id);
    handleSuccess(t('churches.transfer_delete_success'));
    showTransferDialog.value = false;
    churchToDelete.value = null;
  } catch (error) {
    handleError(error, t('churches.transfer_delete_error'));
  }
};

const cancelTransfer = () => {
  showTransferDialog.value = false;
  churchToDelete.value = null;
};

// Table columns configuration
const tableColumns = computed<TableColumn[]>(() => [
  {
    key: 'name',
    label: t('churches.name'),
  },
  {
    key: 'email',
    label: t('common.email'),
  },
  {
    key: 'phone',
    label: t('common.phone'),
  },
  {
    key: 'address',
    label: t('common.address'),
  },
  {
    key: 'taxId',
    label: t('common.tax_id'),
  },
  {
    key: 'users',
    label: t('churches.manager.users'),
  },
]);

onMounted(() => {
  churchesStore.fetchChurches();
});
</script>

<style scoped>
.text-lg {
  font-size: 1.125rem;
}

.text-xl {
  font-size: 1.25rem;
  font-weight: bold;
}

.text-2xl {
  font-size: 1.5rem;
  font-weight: bold;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.transition-shadow {
  transition: box-shadow 0.3s ease-in-out;
}
</style>

