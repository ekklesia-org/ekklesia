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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';
import { ChurchService, ChurchWithUsers } from '../services/churchService';
import ChurchForm from '../components/ChurchForm.vue';

const { t } = useI18n();
const churchService = new ChurchService();

const churches = ref<ChurchWithUsers[]>([]);
const selectedChurch = ref<ChurchWithUsers | null>(null);
const showForm = ref(false);
const isSubmitting = ref(false);

const fetchChurches = async () => {
  const response = await churchService.getChurches();
  churches.value = response.churches;
};

const showCreateForm = () => {
  selectedChurch.value = null;
  showForm.value = true;
};

const editChurch = (church: ChurchWithUsers) => {
  selectedChurch.value = church;
  showForm.value = true;
};

const deleteChurch = async (id: string) => {
  if (confirm(t('churches.manager.confirm_delete'))) {
    await churchService.deleteChurch(id);
    await fetchChurches();
  }
};

const handleFormSubmit = async (data: any) => {
  isSubmitting.value = true;

  try {
    if (selectedChurch.value) {
      await churchService.updateChurch(selectedChurch.value.id, data);
    } else {
      await churchService.createChurch(data);
    }
  } catch (error) {
    console.error('Error saving church:', error);
  } finally {
    isSubmitting.value = false;
    showForm.value = false;
    fetchChurches();
  }
};

const cancelForm = () => {
  showForm.value = false;
};

onMounted(() => {
  fetchChurches();
});
</script>

<style scoped>
.text-md {
  font-size: 1rem;
}
</style>

