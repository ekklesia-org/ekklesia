<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-6">
        {{ society ? $t('societies.edit_society') : $t('societies.create_society') }}
      </h2>

      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Society Name -->
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('common.name') }}
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.name }"
            required
          >
          <p
            v-if="errors.name"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.name }}
          </p>
        </div>

        <!-- Society Type -->
        <div>
          <label
            for="type"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('societies.columns.type') }}
          </label>
          <select
            id="type"
            v-model="form.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.type }"
            required
          >
            <option value="">
              {{ $t('societies.select_type') }}
            </option>
            <option
              v-for="(label, value) in societyTypes"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
          <p
            v-if="errors.type"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.type }}
          </p>
        </div>

        <!-- Description -->
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t('societies.description') }}
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.description }"
          />
          <p
            v-if="errors.description"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.description }}
          </p>
        </div>

        <!-- Active Status (only for editing existing societies) -->
        <div v-if="society">
          <label class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="mr-2"
            >
            {{ $t('common.active') }}
          </label>
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
            {{ isSubmitting ? $t('common.saving') : (society ? $t('common.update') : $t('common.create')) }}
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
import type { Society, SocietyType, IUpdateSocietyDto } from '@ekklesia/shared';

const { t } = useI18n();

interface Props {
  society?: Society;
  isSubmitting?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();

const form = reactive({
  name: '',
  type: '',
  description: '',
  isActive: true,
});

const errors = ref<Record<string, string>>({});

// Available society types
const societyTypes = computed(() => ({
  SAF: t('societies.types.SAF'),
  UPH: t('societies.types.UPH'),
  UPA: t('societies.types.UPA'),
  UMP: t('societies.types.UMP'),
  UCP: t('societies.types.UCP'),
}));

const validateForm = () => {
  errors.value = {};

  if (!form.name.trim()) {
    errors.value.name = t('validation.required', { field: t('common.name') });
  }

  if (!form.type.trim()) {
    errors.value.type = t('validation.required', { field: t('societies.columns.type') });
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  if (props.society) {
    // Editing existing society
    const updateData: IUpdateSocietyDto = {
      name: form.name,
      type: form.type as SocietyType,
      description: form.description || undefined,
      isActive: form.isActive,
    };
    emit('submit', updateData);
  } else {
    // Creating new society
    const createData = {
      name: form.name,
      type: form.type as SocietyType,
      description: form.description || undefined,
    };
    emit('submit', createData);
  }
};

onMounted(() => {
  if (props.society) {
    form.name = props.society.name;
    form.type = props.society.type;
    form.description = props.society.description || '';
    form.isActive = props.society.isActive;
  }
});
</script>
