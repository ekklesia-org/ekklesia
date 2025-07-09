<template>
  <AdminLayout :title="$t('churches.manager.title')">
    <!-- Church List -->
    <div
      v-if="!showForm"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="flex justify-between mb-6">
        <h2 class="text-lg font-semibold">
          {{ $t('churches.manager.all_churches') }}
        </h2>
        <AppButton
          variant="primary"
          @click="showCreateForm"
        >
          {{ $t('churches.manager.create_church') }}
        </AppButton>
      </div>

      <div
        v-if="churches.length > 0"
        class="grid grid-cols-1 gap-6"
      >
        <div
          v-for="church in churches"
          :key="church.id"
          class="p-4 bg-white shadow-md rounded-lg"
        >
          <h3 class="text-md font-semibold">
            {{ church.name }}
          </h3>
          <p><strong>{{ $t('common.email') }}:</strong> {{ church.email }}</p>
          <p><strong>{{ $t('common.phone') }}:</strong> {{ church.phone || '-' }}</p>
          <p><strong>{{ $t('common.address') }}:</strong> {{ church.address || '-' }} </p>
          <p>
            <strong>{{ $t('churches.manager.users') }}:</strong>
            <span
              v-for="user in church.users"
              :key="user.id"
            >
              {{ user.firstName }} {{ user.lastName }}{{ user !== church.users[church.users.length - 1] ? ',' : '' }}
            </span>
          </p>

          <div class="flex justify-end mt-4 space-x-2">
            <AppButton
              variant="secondary"
              @click="editChurch(church)"
            >
              {{ $t('common.edit') }}
            </AppButton>
            <AppButton
              variant="danger"
              @click="deleteChurch(church.id)"
            >
              {{ $t('common.delete') }}
            </AppButton>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center"
      >
        <p>{{ $t('churches.manager.no_churches') }}</p>
      </div>
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
import { AppButton, useToast } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';
import { ChurchWithUsers, CreateChurchDto } from '../services/churchService';
import ChurchForm from '../components/ChurchForm.vue';
import SuperAdminTransferDialog from '../components/SuperAdminTransferDialog.vue';
import { useChurchesStore } from '../stores/churches';

const { t } = useI18n();
const toast = useToast();
const churchesStore = useChurchesStore();

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
        toast.success(t('churches.delete_success'));
      } catch (error: any) {
        // Handle API errors
        if (error.response?.status === 400) {
          toast.error(error.response.data.message || t('churches.super_admin_transfer.cannot_delete_last_church'));
        } else {
          toast.error(t('churches.delete_error'));
        }
      }
    }
  }
};

const handleFormSubmit = async (data: CreateChurchDto) => {
  try {
    if (selectedChurch.value) {
      await churchesStore.updateChurch(selectedChurch.value.id, data);
      toast.success(t('churches.update_success'));
    } else {
      await churchesStore.createChurch(data);
      toast.success(t('churches.create_success'));
    }
  } catch (error) {
    console.error('Error saving church:', error);
    const errorMessage = selectedChurch.value ? t('churches.update_error') : t('churches.create_error');
    toast.error(errorMessage);
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
    toast.success(t('churches.transfer_delete_success'));
    showTransferDialog.value = false;
    churchToDelete.value = null;
  } catch (error) {
    console.error('Error deleting church after transfer:', error);
    toast.error(t('churches.transfer_delete_error'));
  }
};

const cancelTransfer = () => {
  showTransferDialog.value = false;
  churchToDelete.value = null;
};

onMounted(() => {
  churchesStore.fetchChurches();
});
</script>

<style scoped>
.text-md {
  font-size: 1rem;
}
</style>

