<template>
  <div>
    <AppCard :title="$t('churches.title')">
      <div class="mb-4">
        <AppButton
          class="mr-2"
          @click="createChurch"
        >
          {{ $t('churches.add_church') }}
        </AppButton>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2">
                {{ $t('churches.list.name') }}
              </th>
              <th class="py-2">
                {{ $t('churches.list.email') }}
              </th>
              <th class="py-2">
                {{ $t('churches.list.users') }}
              </th>
              <th class="py-2">
                {{ $t('churches.list.status') }}
              </th>
              <th class="py-2">
                {{ $t('churches.list.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="church in churches"
              :key="church.id"
              class="border-t"
            >
              <td class="py-2">
                {{ church.name }}
              </td>
              <td class="py-2">
                {{ church.email }}
              </td>
              <td class="py-2">
                {{ church.userCount }}
              </td>
              <td class="py-2">
                <span :class="{'text-green-500': church.isActive, 'text-gray-400': !church.isActive}">
                  {{ church.isActive ? $t('churches.status.active') : $t('churches.status.inactive') }}
                </span>
              </td>
              <td class="py-2">
                <AppButton
                  variant="primary"
                  @click="editChurch(church)"
                >
                  {{ $t('churches.edit_church') }}
                </AppButton>
                <AppButton
                  variant="primary"
                  @click="viewChurch(church)"
                >
                  {{ $t('churches.view_church') }}
                </AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Church } from '@ekklesia/shared';
import { AppCard, AppButton } from '@ekklesia/ui';
import { useChurchService } from '../composables/useChurchService';

const {
  churches,
  loading,
  error,
  loadChurches,
  createChurch: createChurchService,
  updateChurch,
  deleteChurch,
} = useChurchService();

onMounted(() => {
  loadChurches();
});

const createChurch = () => {
  console.log('Create Church clicked');
  // TODO: Open create church modal/dialog
};

const editChurch = (church: Church) => {
  console.log('Edit Church:', church);
  // TODO: Open edit church modal/dialog
};

const viewChurch = (church: Church) => {
  console.log('View Church:', church);
  // TODO: Navigate to church details page
};
</script>

