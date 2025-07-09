<template>
  <div>
    <AppCard :title="$t('tenants.title')">
      <div class="mb-4">
        <AppButton
          class="mr-2"
          @click="createTenant"
        >
          {{ $t('tenants.add_tenant') }}
        </AppButton>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2">
                {{ $t('tenants.list.name') }}
              </th>
              <th class="py-2">
                {{ $t('tenants.list.email') }}
              </th>
              <th class="py-2">
                {{ $t('tenants.list.users') }}
              </th>
              <th class="py-2">
                {{ $t('tenants.list.status') }}
              </th>
              <th class="py-2">
                {{ $t('tenants.list.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tenant in tenants"
              :key="tenant.id"
              class="border-t"
            >
              <td class="py-2">
                {{ tenant.name }}
              </td>
              <td class="py-2">
                {{ tenant.email }}
              </td>
              <td class="py-2">
                {{ tenant.userCount }}
              </td>
              <td class="py-2">
                <span :class="{'text-green-500': tenant.isActive, 'text-gray-400': !tenant.isActive}">
                  {{ tenant.isActive ? $t('tenants.status.active') : $t('tenants.status.inactive') }}
                </span>
              </td>
              <td class="py-2">
                <AppButton
                  variant="text"
                  @click="editTenant(tenant)"
                >
                  {{ $t('tenants.edit_tenant') }}
                </AppButton>
                <AppButton
                  variant="text"
                  @click="viewTenant(tenant)"
                >
                  {{ $t('tenants.view_tenant') }}
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
import { Tenant } from '@ekklesia/shared';
import { AppCard, AppButton } from '@ekklesia/ui';
import { useTenantService } from '../composables/useTenantService';

const {
  tenants,
  loading,
  error,
  loadTenants,
  createTenant: createTenantService,
  updateTenant,
  deleteTenant,
} = useTenantService();

onMounted(() => {
  loadTenants();
});

const createTenant = () => {
  console.log('Create Tenant clicked');
  // TODO: Open create tenant modal/dialog
};

const editTenant = (tenant: Tenant) => {
  console.log('Edit Tenant:', tenant);
  // TODO: Open edit tenant modal/dialog
};

const viewTenant = (tenant: Tenant) => {
  console.log('View Tenant:', tenant);
  // TODO: Navigate to tenant details page
};
</script>

