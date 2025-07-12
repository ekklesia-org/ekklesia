<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-6">
        {{ member ? $t('members.edit_member') : $t('members.create_member') }}
      </h2>

      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- First Name -->
          <div>
            <label
              for="firstName"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.first_name') }}
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.firstName }"
              required
            >
            <p
              v-if="errors.firstName"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.firstName }}
            </p>
          </div>

          <!-- Last Name -->
          <div>
            <label
              for="lastName"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.last_name') }}
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.lastName }"
              required
            >
            <p
              v-if="errors.lastName"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.lastName }}
            </p>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.email') }}
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.email }"
            >
            <p
              v-if="errors.email"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label
              for="phone"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.phone') }}
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.phone }"
            >
            <p
              v-if="errors.phone"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.phone }}
            </p>
          </div>
        </div>

        <!-- Personal Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date of Birth -->
          <div>
            <label
              for="dateOfBirth"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.date_of_birth') }}
            </label>
            <input
              id="dateOfBirth"
              v-model="form.dateOfBirth"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.dateOfBirth }"
            >
            <p
              v-if="errors.dateOfBirth"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.dateOfBirth }}
            </p>
          </div>

          <!-- Marital Status -->
          <div>
            <label
              for="maritalStatus"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.marital_status') }}
            </label>
            <select
              id="maritalStatus"
              v-model="form.maritalStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.maritalStatus }"
              required
            >
              <option value="">
                {{ $t('members.select_marital_status') }}
              </option>
              <option value="SINGLE">
                {{ $t('members.marital_status_single') }}
              </option>
              <option value="MARRIED">
                {{ $t('members.marital_status_married') }}
              </option>
              <option value="DIVORCED">
                {{ $t('members.marital_status_divorced') }}
              </option>
              <option value="WIDOWED">
                {{ $t('members.marital_status_widowed') }}
              </option>
            </select>
            <p
              v-if="errors.maritalStatus"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.maritalStatus }}
            </p>
          </div>
        </div>

        <!-- Document Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- CPF -->
          <div>
            <label
              for="cpf"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.cpf') }}
            </label>
            <input
              id="cpf"
              v-model="form.cpf"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.cpf }"
              placeholder="000.000.000-00"
            >
            <p
              v-if="errors.cpf"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.cpf }}
            </p>
          </div>

          <!-- RG -->
          <div>
            <label
              for="rg"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.rg') }}
            </label>
            <input
              id="rg"
              v-model="form.rg"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.rg }"
            >
            <p
              v-if="errors.rg"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.rg }}
            </p>
          </div>
        </div>

        <!-- Address -->
        <div>
          <label
            for="address"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('members.address') }}
          </label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.address }"
          >
          <p
            v-if="errors.address"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.address }}
          </p>
        </div>

        <!-- City, State, and ZIP Code -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- City -->
          <div>
            <label
              for="city"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.city') }}
            </label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.city }"
            >
            <p
              v-if="errors.city"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.city }}
            </p>
          </div>

          <!-- State -->
          <div>
            <label
              for="state"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.state') }}
            </label>
            <input
              id="state"
              v-model="form.state"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.state }"
            >
            <p
              v-if="errors.state"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.state }}
            </p>
          </div>

          <!-- ZIP Code -->
          <div>
            <label
              for="zipCode"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.zip_code') }}
            </label>
            <input
              id="zipCode"
              v-model="form.zipCode"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.zipCode }"
              placeholder="00000-000"
            >
            <p
              v-if="errors.zipCode"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.zipCode }}
            </p>
          </div>
        </div>

        <!-- Member Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Member Since -->
          <div>
            <label
              for="memberSince"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.member_since') }}
            </label>
            <input
              id="memberSince"
              v-model="form.memberSince"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.memberSince }"
              required
            >
            <p
              v-if="errors.memberSince"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.memberSince }}
            </p>
          </div>

          <!-- Baptism Date -->
          <div>
            <label
              for="baptismDate"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.baptism_date') }}
            </label>
            <input
              id="baptismDate"
              v-model="form.baptismDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.baptismDate }"
            >
            <p
              v-if="errors.baptismDate"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.baptismDate }}
            </p>
          </div>
        </div>

        <!-- Profession -->
        <div>
          <label
            for="profession"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('members.profession') }}
          </label>
          <input
            id="profession"
            v-model="form.profession"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.profession }"
          >
          <p
            v-if="errors.profession"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.profession }}
          </p>
        </div>

        <!-- Notes -->
        <div>
          <label
            for="notes"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('members.notes') }}
          </label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.notes }"
          />
          <p
            v-if="errors.notes"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.notes }}
          </p>
        </div>

        <!-- Member Status (only for editing existing members) -->
        <div
          v-if="member"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <!-- Status -->
          <div>
            <label
              for="status"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('members.status') }}
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.status }"
              required
            >
              <option value="ACTIVE">
                {{ $t('members.status_active') }}
              </option>
              <option value="INACTIVE">
                {{ $t('members.status_inactive') }}
              </option>
              <option value="TRANSFERRED">
                {{ $t('members.status_transferred') }}
              </option>
              <option value="DECEASED">
                {{ $t('members.status_deceased') }}
              </option>
            </select>
            <p
              v-if="errors.status"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.status }}
            </p>
          </div>

          <!-- Active Status -->
          <div class="flex items-center">
            <label class="flex items-center">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="mr-2"
              >
              {{ $t('members.active') }}
            </label>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6">
          <AppButton
            type="button"
            variant="secondary"
            @click="$emit('cancel')"
          >
            {{ $t('common.cancel') }}
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? $t('common.saving') : (member ? $t('common.update') : $t('common.create')) }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppButton } from '@ekklesia/ui';
import { Member } from '../services/memberService';
import { ICreateMemberDto, IUpdateMemberDto } from '@ekklesia/shared';
import { useSelectedChurch } from '../stores/selectedChurch';
import { useAuthStore } from '../stores';

const { t } = useI18n();
const selectedChurchStore = useSelectedChurch();
const authStore = useAuthStore();

interface Props {
  member?: Member;
  isSubmitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  member: undefined,
  isSubmitting: false,
});

const emit = defineEmits<{
  submit: [data: ICreateMemberDto | IUpdateMemberDto];
  cancel: [];
}>();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  cpf: '',
  rg: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  maritalStatus: '',
  memberSince: '',
  baptismDate: '',
  profession: '',
  notes: '',
  status: 'ACTIVE',
  isActive: true,
});

const errors = ref<Record<string, string>>({});

const validateForm = () => {
  errors.value = {};

  if (!form.firstName.trim()) {
    errors.value.firstName = t('validation.required', { field: t('members.first_name') });
  }

  if (!form.lastName.trim()) {
    errors.value.lastName = t('validation.required', { field: t('members.last_name') });
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = t('validation.email_invalid');
  }

  if (!form.maritalStatus.trim()) {
    errors.value.maritalStatus = t('validation.required', { field: t('members.marital_status') });
  }

  if (!form.memberSince.trim()) {
    errors.value.memberSince = t('validation.required', { field: t('members.member_since') });
  }

  if (form.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf)) {
    errors.value.cpf = t('validation.cpf_invalid');
  }

  if (form.zipCode && !/^\d{5}-\d{3}$/.test(form.zipCode)) {
    errors.value.zipCode = t('validation.zip_code_invalid');
  }

  return Object.keys(errors.value).length === 0;
};

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
  return date.toISOString().split('T')[0];
};

const parseDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  if (props.member) {
    // Editing existing member
    const updateData: IUpdateMemberDto = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      dateOfBirth: parseDate(form.dateOfBirth)?.toISOString(),
      cpf: form.cpf || undefined,
      rg: form.rg || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zipCode: form.zipCode || undefined,
      maritalStatus: form.maritalStatus as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED',
      baptismDate: parseDate(form.baptismDate)?.toISOString(),
      profession: form.profession || undefined,
      notes: form.notes || undefined,
      status: form.status as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED',
    };
    emit('submit', updateData);
  } else {
    // Creating new member
    const createData: ICreateMemberDto = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      dateOfBirth: parseDate(form.dateOfBirth)?.toISOString(),
      cpf: form.cpf || undefined,
      rg: form.rg || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zipCode: form.zipCode || undefined,
      maritalStatus: form.maritalStatus as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED',
      memberSince: new Date(form.memberSince).toISOString(),
      baptismDate: parseDate(form.baptismDate)?.toISOString(),
      profession: form.profession || undefined,
      notes: form.notes || undefined,
      churchId: selectedChurchStore.selectedChurch?.id || authStore.user?.churchId || '',
    };
    emit('submit', createData);
  }
};

onMounted(() => {
  if (props.member) {
    form.firstName = props.member.firstName;
    form.lastName = props.member.lastName;
    form.email = props.member.email || '';
    form.phone = props.member.phone || '';
    form.dateOfBirth = formatDate(props.member.dateOfBirth);
    form.cpf = props.member.cpf || '';
    form.rg = props.member.rg || '';
    form.address = props.member.address || '';
    form.city = props.member.city || '';
    form.state = props.member.state || '';
    form.zipCode = props.member.zipCode || '';
    form.maritalStatus = props.member.maritalStatus;
    form.memberSince = formatDate(props.member.memberSince);
    form.baptismDate = formatDate(props.member.baptismDate);
    form.profession = props.member.profession || '';
    form.notes = props.member.notes || '';
    form.status = props.member.status;
    form.isActive = props.member.isActive;
  } else {
    // Set default member since date to today for new members
    form.memberSince = new Date().toISOString().split('T')[0];
  }
});
</script>
