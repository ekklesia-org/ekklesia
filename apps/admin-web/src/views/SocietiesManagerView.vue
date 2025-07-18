<template>
  <AdminLayout :title="$t('societies.manager.title')">
    <!-- Societies List -->
    <div
      v-if="!showForm"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold">
          {{ $t('societies.manager.all_societies') }}
        </h2>
        <div class="flex space-x-4">
          <AppButton
            variant="primary"
            @click="showCreateForm"
          >
            {{ $t('societies.manager.create_society') }}
          </AppButton>
        </div>
      </div>

      <!-- Societies Table -->
      <AppTable
        :columns="tableColumns"
        :data="societies"
        :loading="isLoading"
        :error="error || undefined"
        :loading-text="$t('common.loading')"
        :empty-text="$t('societies.manager.no_societies')"
        :actions-label="$t('common.actions')"
        row-key="id"
        :show-pagination="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @retry="fetchSocieties"
        @update:current-page="fetchSocieties"
      >
        <!-- Name column -->
        <template #cell-name="{ row }">
          <div class="text-sm font-medium text-gray-900">
            {{ row.name }}
          </div>
        </template>

        <!-- Type column -->
        <template #cell-type="{ row }">
          <div class="text-sm text-gray-900">
            {{ $t('societies.types.' + row.type) }}
          </div>
        </template>

        <!-- Status column -->
        <template #cell-status="{ row }">
          <div class="flex items-center space-x-2">
            <span
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              :class="row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ row.isActive ? $t('common.active') : $t('common.inactive') }}
            </span>
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

        <!-- Empty action -->
        <template #empty-action>
          <AppButton
            variant="primary"
            class="mt-4"
            @click="showCreateForm"
          >
            {{ $t('societies.manager.create_first_society') }}
          </AppButton>
        </template>

        <!-- Actions column -->
        <template #actions="{ row }">
          <div class="flex justify-end space-x-2">
            <AppButton
              variant="secondary"
              size="sm"
              @click="editSociety(row)"
            >
              {{ $t('common.edit') }}
            </AppButton>
            <AppButton
              v-if="row.isActive"
              variant="danger"
              size="sm"
              @click="deactivateSociety(row.id)"
            >
              {{ $t('societies.deactivate') }}
            </AppButton>
            <AppButton
              v-else
              variant="success"
              size="sm"
              @click="activateSociety(row.id)"
            >
              {{ $t('societies.activate') }}
            </AppButton>
            <AppButton
              variant="danger"
              size="sm"
              @click="deleteSociety(row.id)"
            >
              {{ $t('common.delete') }}
            </AppButton>
          </div>
        </template>

        <!-- Pagination -->
        <template #pagination="{ previousPage, nextPage, currentPage: slotCurrentPage, totalPages: slotTotalPages }">
          <nav class="flex items-center space-x-1">
            <AppButton
              variant="secondary"
              size="sm"
              :disabled="slotCurrentPage === 1"
              @click="previousPage"
            >
              {{ $t('common.previous') }}
            </AppButton>
            <span class="px-4 py-2 text-sm text-gray-700">
              {{ $t('common.page_of', { current: slotCurrentPage, total: slotTotalPages }) }}
            </span>
            <AppButton
              variant="secondary"
              size="sm"
              :disabled="slotCurrentPage === slotTotalPages"
              @click="nextPage"
            >
              {{ $t('common.next') }}
            </AppButton>
          </nav>
        </template>
      </AppTable>
    </div>

    <!-- Society Form Modal -->
    <SocietyForm
      v-if="showForm"
      class="py-8"
      :society="selectedSociety || undefined"
      :is-submitting="isSubmitting"
      @submit="handleFormSubmit"
      @cancel="cancelForm"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton, AppTable } from '@ekklesia/ui';
import type { Society } from '@ekklesia/shared';
import AdminLayout from '../components/AdminLayout.vue';
import SocietyForm from '../components/SocietyForm.vue';
import { useSocietiesStore } from '../stores/societies';
import { useErrorHandler } from '../utils/errorHandler';

const societiesStore = useSocietiesStore();
const { t } = useI18n();
const { handleError, handleSuccess } = useErrorHandler();

const showForm = ref(false);
const selectedSociety = ref<Society | null>(null);

const isLoading = computed(() => societiesStore.isLoading);
const error = computed(() => societiesStore.error);
const societies = computed(() => societiesStore.societies);
const currentPage = computed(() => societiesStore.currentPage);
const totalPages = computed(() => societiesStore.totalPages);
const isSubmitting = computed(() => societiesStore.isSubmitting);

const fetchSocieties = () => {
  societiesStore.fetchSocieties();
};

const showCreateForm = () => {
  selectedSociety.value = null;
  showForm.value = true;
};

const editSociety = (society: Society) => {
  selectedSociety.value = society;
  showForm.value = true;
};

const handleFormSubmit = async (data: any) => {
  try {
    if (selectedSociety.value) {
      await societiesStore.updateSociety(selectedSociety.value.id, data);
      handleSuccess(t('societies.manager.updated_successfully'));
    } else {
      await societiesStore.createSociety(data);
      handleSuccess(t('societies.manager.created_successfully'));
    }
    showForm.value = false;
    fetchSocieties();
  } catch (error) {
    handleError(error, t('common.error_occurred'));
  }
};

const cancelForm = () => {
  showForm.value = false;
};

const deactivateSociety = async (id: string) => {
  try {
    await societiesStore.deactivateSociety(id);
    handleSuccess(t('societies.deactivated_successfully'));
    fetchSocieties();
  } catch (error) {
    handleError(error, t('common.error_occurred'));
  }
};

const activateSociety = async (id: string) => {
  try {
    await societiesStore.activateSociety(id);
    handleSuccess(t('societies.activated_successfully'));
    fetchSocieties();
  } catch (error) {
    handleError(error, t('common.error_occurred'));
  }
};

const deleteSociety = async (id: string) => {
  try {
    await societiesStore.deleteSociety(id);
    handleSuccess(t('societies.deleted_successfully'));
    fetchSocieties();
  } catch (error) {
    handleError(error, t('common.error_occurred'));
  }
};

// Table columns for display
const tableColumns = [
  { label: t('societies.columns.name'), key: 'name' },
  { label: t('societies.columns.type'), key: 'type' },
  { label: t('common.status'), key: 'status' },
];

fetchSocieties();
</script>
<style scoped>
</style>
