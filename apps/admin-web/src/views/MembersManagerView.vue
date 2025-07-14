<template>
  <AdminLayout :title="$t('members.manager.title')">
    <!-- Member List -->
    <div
      v-if="!showForm"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold">
          {{ $t('members.manager.all_members') }}
        </h2>
        <div class="flex space-x-4">
          <AppButton
            variant="secondary"
            @click="toggleIncludeInactive"
          >
            {{ includeInactive ? $t('members.hide_inactive') : $t('members.show_inactive') }}
          </AppButton>
          <AppButton
            variant="primary"
            @click="showCreateForm"
          >
            {{ $t('members.manager.create_member') }}
          </AppButton>
        </div>
      </div>

      <!-- Members Table -->
      <AppTable
        :columns="tableColumns"
        :data="members"
        :loading="isLoading"
        :error="error"
        :loading-text="$t('common.loading')"
        :empty-text="$t('members.manager.no_members')"
        :actions-label="$t('common.actions')"
        row-key="id"
        :show-pagination="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @retry="fetchMembers"
        @update:current-page="fetchMembers"
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

        <!-- Phone column -->
        <template #cell-phone="{ row }">
          <div class="text-sm text-gray-900">
            {{ row.phone || '-' }}
          </div>
        </template>

        <!-- Baptism Date column -->
        <template #cell-baptismDate="{ row }">
          <div class="text-sm text-gray-900">
            {{ row.baptismDate ? formatDate(row.baptismDate) : '-' }}
          </div>
        </template>

        <!-- Status column -->
        <template #cell-status="{ row }">
          <div class="flex items-center space-x-2">
            <span
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              :class="row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ row.isActive ? $t('members.active') : $t('members.inactive') }}
            </span>
            <span
              v-if="row.userId"
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
              :title="$t('members.has_user_account')"
            >
              <svg
                class="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {{ $t('members.user') }}
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
            {{ $t('members.manager.create_first_member') }}
          </AppButton>
        </template>

        <!-- Actions column -->
        <template #actions="{ row }">
          <div class="flex justify-end space-x-2">
            <AppButton
              variant="secondary"
              size="sm"
              @click="editMember(row)"
            >
              {{ $t('common.edit') }}
            </AppButton>
            <AppButton
              v-if="row.isActive"
              variant="primary"
              size="sm"
              @click="deactivateMember(row.id)"
            >
              {{ $t('members.deactivate') }}
            </AppButton>
            <AppButton
              v-else
              variant="success"
              size="sm"
              @click="activateMember(row.id)"
            >
              {{ $t('members.activate') }}
            </AppButton>
            <AppButton
              variant="danger"
              size="sm"
              @click="deleteMember(row.id)"
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

    <!-- Member Form Modal -->
    <MemberForm
      v-if="showForm"
      class="py-8"
      :member="selectedMember || undefined"
      :is-submitting="isSubmitting"
      @submit="handleFormSubmit"
      @cancel="cancelForm"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton, AppTable, TableColumn } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';
import MemberForm from '../components/MemberForm.vue';
import { useErrorHandler } from '../utils/errorHandler';
import { useMembersStore } from '../stores/members';
import { useSelectedChurch } from '../stores/selectedChurch';
import { useAuth } from '../stores/auth';
import { Member } from '../services/memberService';
import { ICreateMemberDto, IUpdateMemberDto } from '@ekklesia/shared';

const { t } = useI18n();
const { handleError, handleSuccess } = useErrorHandler();
const membersStore = useMembersStore();
const selectedChurchStore = useSelectedChurch();
const auth = useAuth();

const selectedMember = ref<Member | null>(null);
const showForm = ref(false);
const includeInactive = ref(false);
const currentPage = ref(1);

// Use store getters and state
const members = computed(() => membersStore.members || []);
const isLoading = computed(() => membersStore.isLoading);
const hasError = computed(() => membersStore.hasError);
const error = computed(() => membersStore.error);
const isSubmitting = computed(() => membersStore.isLoading);
const totalPages = computed(() => membersStore.totalPages || 1);

// Table columns configuration
const tableColumns = computed<TableColumn[]>(() => [
  {
    key: 'name',
    label: t('members.name'),
  },
  {
    key: 'email',
    label: t('members.email'),
  },
  {
    key: 'phone',
    label: t('members.phone'),
  },
  {
    key: 'baptismDate',
    label: t('members.baptism_date'),
  },
  {
    key: 'status',
    label: t('members.status'),
  },
  {
    key: 'createdAt',
    label: t('members.joined'),
    format: (value) => formatDate(value),
    cellClass: 'text-sm text-gray-500',
  },
]);

const showCreateForm = () => {
  selectedMember.value = null;
  showForm.value = true;
};

const editMember = (member: Member) => {
  selectedMember.value = member;
  showForm.value = true;
};

const toggleIncludeInactive = () => {
  includeInactive.value = !includeInactive.value;
  fetchMembersWithContext();
};

const fetchMembersWithContext = (page = 1) => {
  const churchId = auth.user?.role === 'SUPER_ADMIN' ? selectedChurchStore.selectedChurchId ?? undefined : undefined;
  currentPage.value = page;
  membersStore.fetchMembers(page, includeInactive.value, churchId);
};

const fetchMembers = async (page = 1) => {
  try {
    await fetchMembersWithContext(page);
  } catch (error) {
    handleError(error, t('members.fetch_error'));
  }
};

const activateMember = async (id: string) => {
  try {
    await membersStore.activateMember(id);
    handleSuccess(t('members.activate_success'));
  } catch (error) {
    handleError(error, t('members.activate_error'));
  }
};

const deactivateMember = async (id: string) => {
  if (confirm(t('members.manager.confirm_deactivate'))) {
    try {
      await membersStore.deactivateMember(id);
      handleSuccess(t('members.deactivate_success'));
    } catch (error) {
      handleError(error, t('members.deactivate_error'));
    }
  }
};

const deleteMember = async (id: string) => {
  if (confirm(t('members.manager.confirm_delete'))) {
    try {
      await membersStore.deleteMember(id);
      handleSuccess(t('members.delete_success'));
    } catch (error) {
      handleError(error, t('members.delete_error'));
    }
  }
};

const handleFormSubmit = async (data: ICreateMemberDto | IUpdateMemberDto) => {
  try {
    if (selectedMember.value) {
      await membersStore.updateMember(selectedMember.value.id, data as IUpdateMemberDto);
      handleSuccess(t('members.update_success'));
    } else {
      await membersStore.createMember(data as ICreateMemberDto);
      handleSuccess(t('members.create_success'));
    }
    showForm.value = false;
  } catch (error) {
    console.log('Error in handleFormSubmit:', error);
    const errorMessage = selectedMember.value ? t('members.update_error') : t('members.create_error');
    handleError(error, errorMessage);
  }
};

const cancelForm = () => {
  showForm.value = false;
  selectedMember.value = null;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

// Watch for changes in selected church
watch(
  () => selectedChurchStore.selectedChurchId,
  (newChurchId) => {
    if (auth.user?.role === 'SUPER_ADMIN') {
      // Reset to first page when church changes
      currentPage.value = 1;
      // Fetch members for the new church (or all members if no church selected)
      fetchMembersWithContext(1);
    }
  }
);

onMounted(() => {
  // Always fetch members on mount
  fetchMembersWithContext();
});
</script>
