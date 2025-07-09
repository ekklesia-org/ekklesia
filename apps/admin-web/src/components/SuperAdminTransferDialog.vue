<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <!-- Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600" />
        </div>

        <!-- Title -->
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ $t('churches.super_admin_transfer.title') }}
        </h3>

        <!-- Warning message -->
        <p class="text-sm text-gray-500 mb-4">
          {{ $t('churches.super_admin_transfer.warning') }}
        </p>

        <!-- Super Admin list -->
        <div class="mb-4 text-left">
          <h4 class="font-medium text-gray-700 mb-2">
            {{ $t('churches.super_admin_transfer.affected_users') }}
          </h4>
          <div class="bg-gray-50 rounded-lg p-3">
            <div
              v-for="admin in superAdmins"
              :key="admin.id"
              class="flex items-center space-x-2 mb-1 last:mb-0"
            >
              <div class="w-2 h-2 bg-red-500 rounded-full" />
              <span class="text-sm">{{ admin.firstName }} {{ admin.lastName }} ({{ admin.email }})</span>
            </div>
          </div>
        </div>

        <!-- Transfer options -->
        <div class="mb-4 text-left">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('churches.super_admin_transfer.select_destination') }}
          </label>
          <select
            v-model="selectedChurchId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {{ $t('churches.super_admin_transfer.select_church') }}
            </option>
            <option
              v-for="church in availableChurches"
              :key="church.id"
              :value="church.id"
            >
              {{ church.name }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-center space-x-3">
          <AppButton
            variant="secondary"
            @click="$emit('cancel')"
          >
            {{ $t('common.cancel') }}
          </AppButton>
          <AppButton
            variant="primary"
            :disabled="!selectedChurchId || isTransferring"
            :is-loading="isTransferring"
            @click="handleTransfer"
          >
            {{ $t('churches.super_admin_transfer.transfer_and_delete') }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton, useToast } from '@ekklesia/ui';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { Church } from '@ekklesia/shared';
import { ChurchService } from '../services/churchService';
import { useErrorHandler } from '../utils/errorHandler';

interface SuperAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  churchId: string;
  churchName: string;
  superAdmins: SuperAdmin[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  transfer: [toChurchId: string];
  cancel: [];
}>();

const { t } = useI18n();
const toast = useToast();
const churchService = new ChurchService();
const { handleError, handleSuccess } = useErrorHandler();

const selectedChurchId = ref<string>('');
const availableChurches = ref<Church[]>([]);
const isTransferring = ref(false);

onMounted(async () => {
  try {
    availableChurches.value = await churchService.getTransferOptions(props.churchId);
  } catch (error) {
    handleError(error, t('churches.super_admin_transfer.fetch_options_error'));
  }
});

const handleTransfer = async () => {
  if (!selectedChurchId.value) return;

  isTransferring.value = true;

  try {
    await churchService.transferSuperAdmins(props.churchId, selectedChurchId.value);
    handleSuccess(t('churches.super_admin_transfer.transfer_success'));
    emit('transfer', selectedChurchId.value);
  } catch (error) {
    handleError(error, t('churches.super_admin_transfer.transfer_error'));
  } finally {
    isTransferring.value = false;
  }
};
</script>
