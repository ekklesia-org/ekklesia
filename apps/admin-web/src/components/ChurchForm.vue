<template>
  <div class="church-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <!-- Basic Information -->
        <div class="form-section">
          <h3 class="section-title">
            {{ $t('churches.form.basic_info') }}
          </h3>

          <div class="form-row">
            <AppInput
              v-model="formData.name"
              :label="$t('churches.form.name')"
              :placeholder="$t('churches.form.name_placeholder')"
              :error="errors.name"
              required
            />
          </div>

          <div class="form-row">
            <AppInput
              v-model="formData.slug"
              :label="$t('churches.form.slug')"
              :placeholder="$t('churches.form.slug_placeholder')"
              :error="errors.slug"
              :help-text="$t('churches.form.slug_help')"
            />
          </div>

          <div class="form-row">
            <AppInput
              v-model="formData.email"
              type="email"
              :label="$t('churches.form.email')"
              :placeholder="$t('churches.form.email_placeholder')"
              :error="errors.email"
              required
            />
          </div>

          <div class="form-row">
            <AppInput
              v-model="formData.phone"
              :label="$t('churches.form.phone')"
              :placeholder="$t('churches.form.phone_placeholder')"
              :error="errors.phone"
            />
          </div>

          <div class="form-row">
            <AppInput
              v-model="formData.website"
              type="url"
              :label="$t('churches.form.website')"
              :placeholder="$t('churches.form.website_placeholder')"
              :error="errors.website"
            />
          </div>
        </div>

        <!-- Address Information -->
        <div class="form-section">
          <h3 class="section-title">
            {{ $t('churches.form.address_info') }}
          </h3>

          <div class="form-row">
            <AppInput
              v-model="formData.address"
              :label="$t('churches.form.address')"
              :placeholder="$t('churches.form.address_placeholder')"
              :error="errors.address"
            />
          </div>

          <div class="form-row-group">
            <AppInput
              v-model="formData.city"
              :label="$t('churches.form.city')"
              :placeholder="$t('churches.form.city_placeholder')"
              :error="errors.city"
            />

            <AppInput
              v-model="formData.state"
              :label="$t('churches.form.state')"
              :placeholder="$t('churches.form.state_placeholder')"
              :error="errors.state"
            />

            <AppInput
              v-model="formData.zipCode"
              :label="$t('churches.form.zip_code')"
              :placeholder="$t('churches.form.zip_code_placeholder')"
              :error="errors.zipCode"
            />
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="form-section">
          <h3 class="section-title">
            {{ $t('churches.form.advanced_options') }}
          </h3>

          <div class="form-row">
            <AppInput
              v-model="formData.logoUrl"
              type="url"
              :label="$t('churches.form.logo_url')"
              :placeholder="$t('churches.form.logo_url_placeholder')"
              :error="errors.logoUrl"
            />
          </div>

          <div class="form-row">
            <label class="checkbox-label">
              <input
                v-model="formData.isActive"
                type="checkbox"
                class="checkbox"
              >
              <span class="checkbox-text">{{ $t('churches.form.is_active') }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
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
          :loading="isSubmitting"
        >
          {{ isEdit ? $t('common.update') : $t('common.create') }}
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppInput, AppButton } from '@ekklesia/ui';
import type { CreateChurchDto, ChurchWithUsers } from '../services/churchService';

interface Props {
  church?: ChurchWithUsers;
  isSubmitting?: boolean;
}

interface Emits {
  (e: 'submit', data: CreateChurchDto): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  church: undefined,
  isSubmitting: false,
});

const emit = defineEmits<Emits>();
const { t } = useI18n();

const isEdit = computed(() => !!props.church);

// Form data
const formData = reactive<CreateChurchDto>({
  name: '',
  slug: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  website: '',
  logoUrl: '',
  isActive: true,
});

// Form errors
const errors = reactive<Partial<Record<keyof CreateChurchDto, string>>>({});

// Auto-generate slug when name changes
watch(() => formData.name, (newName) => {
  if (newName && !isEdit.value) {
    formData.slug = generateSlug(newName);
  }
});

// Populate form with existing church data
watch(() => props.church, (church) => {
  if (church) {
    formData.name = church.name;
    formData.slug = church.slug;
    formData.email = church.email;
    formData.phone = church.phone || '';
    formData.address = church.address || '';
    formData.city = church.city || '';
    formData.state = church.state || '';
    formData.zipCode = church.zipCode || '';
    formData.website = church.website || '';
    formData.logoUrl = church.logoUrl || '';
    formData.isActive = church.isActive;
  }
}, { immediate: true });

// Generate slug helper
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Form validation
const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof CreateChurchDto];
  });

  let isValid = true;

  // Name validation
  if (!formData.name.trim()) {
    errors.name = t('churches.form.errors.name_required');
    isValid = false;
  } else if (formData.name.length < 2) {
    errors.name = t('churches.form.errors.name_min_length');
    isValid = false;
  } else if (formData.name.length > 100) {
    errors.name = t('churches.form.errors.name_max_length');
    isValid = false;
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = t('churches.form.errors.email_required');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('churches.form.errors.email_invalid');
    isValid = false;
  }

  // Slug validation
  if (formData.slug && formData.slug.length < 2) {
    errors.slug = t('churches.form.errors.slug_min_length');
    isValid = false;
  } else if (formData.slug && formData.slug.length > 100) {
    errors.slug = t('churches.form.errors.slug_max_length');
    isValid = false;
  }

  // Website validation
  if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
    errors.website = t('churches.form.errors.website_invalid');
    isValid = false;
  }

  // Logo URL validation
  if (formData.logoUrl && !/^https?:\/\/.+\..+/.test(formData.logoUrl)) {
    errors.logoUrl = t('churches.form.errors.logo_url_invalid');
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  const submitData: CreateChurchDto = {
    ...formData,
    // Clean up empty strings
    slug: formData.slug?.trim() || undefined,
    phone: formData.phone?.trim() || undefined,
    address: formData.address?.trim() || undefined,
    city: formData.city?.trim() || undefined,
    state: formData.state?.trim() || undefined,
    zipCode: formData.zipCode?.trim() || undefined,
    website: formData.website?.trim() || undefined,
    logoUrl: formData.logoUrl?.trim() || undefined,
  };

  emit('submit', submitData);
};
</script>

<style scoped>
.church-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  gap: 2rem;
}

.form-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.checkbox-text {
  font-size: 0.875rem;
  color: #374151;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .form-row-group {
    grid-template-columns: 1fr;
  }
}
</style>
