<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ member ? $t('members.edit_member') : $t('members.create_member') }}
        </h3>
      </div>

      <div class="p-6">
        <p class="text-gray-500">
          {{ $t('common.coming_soon') }} - Member form will be implemented here
        </p>

        <div class="mt-6 flex justify-end space-x-4">
          <AppButton
            variant="secondary"
            @click="$emit('cancel')"
          >
            {{ $t('common.cancel') }}
          </AppButton>
          <AppButton
            variant="primary"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ member ? $t('common.update') : $t('common.create') }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppButton } from '@ekklesia/ui';

interface Props {
  member?: any;
  isSubmitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
});

const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();

const handleSubmit = () => {
  // TODO: Implement form submission
  emit('submit', {});
};
</script>
