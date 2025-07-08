# Component Usage Examples

## Installation

First, add the UI library to your applications:

```bash
# In your package.json dependencies
"@ekklesia/ui": "workspace:*"
```

## Basic Usage Examples

### AppButton

```vue
<template>
  <div>
    <!-- Primary button -->
    <AppButton variant="primary" @click="handleSave">
      Save Changes
    </AppButton>

    <!-- Button with loading state -->
    <AppButton 
      variant="primary" 
      :is-loading="isLoading"
      loading-text="Saving..."
      @click="handleSave"
    >
      Save Changes
    </AppButton>

    <!-- Button with icon -->
    <AppButton variant="secondary" size="sm">
      <template #icon>
        <PlusIcon class="h-4 w-4" />
      </template>
      Add Item
    </AppButton>

    <!-- Danger button -->
    <AppButton variant="danger" @click="handleDelete">
      Delete
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AppButton } from '@ekklesia/ui';
import { PlusIcon } from '@heroicons/vue/24/outline';

const isLoading = ref(false);

const handleSave = async () => {
  isLoading.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  isLoading.value = false;
};

const handleDelete = () => {
  // Handle delete logic
};
</script>
```

### AppCard

```vue
<template>
  <div>
    <!-- Basic card -->
    <AppCard title="User Profile">
      <p>This is the card content</p>
    </AppCard>

    <!-- Card with header slot -->
    <AppCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Custom Header</h3>
          <AppButton size="sm" variant="ghost">Edit</AppButton>
        </div>
      </template>
      <p>Card content with custom header</p>
    </AppCard>

    <!-- Card with footer -->
    <AppCard title="Settings" variant="elevated">
      <div class="space-y-4">
        <AppInput label="Name" v-model="name" />
        <AppInput label="Email" v-model="email" type="email" />
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <AppButton variant="secondary">Cancel</AppButton>
          <AppButton variant="primary">Save</AppButton>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AppCard, AppButton, AppInput } from '@ekklesia/ui';

const name = ref('');
const email = ref('');
</script>
```

### AppStatsCard

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Basic stats card -->
    <AppStatsCard 
      title="Total Users" 
      :value="1234" 
      color="blue"
    >
      <template #icon>
        <UsersIcon />
      </template>
    </AppStatsCard>

    <!-- Currency formatting -->
    <AppStatsCard 
      title="Revenue" 
      :value="15420" 
      color="green"
      format-as="currency"
    >
      <template #icon>
        <CurrencyDollarIcon />
      </template>
    </AppStatsCard>

    <!-- With trend indicator -->
    <AppStatsCard 
      title="Conversion Rate" 
      :value="23.5" 
      color="purple"
      format-as="percentage"
      :trend="{ value: 5.2, unit: '%', label: 'vs last month', direction: 'up' }"
    >
      <template #icon>
        <ChartBarIcon />
      </template>
    </AppStatsCard>

    <!-- Decline trend -->
    <AppStatsCard 
      title="Bounce Rate" 
      :value="12.1" 
      color="red"
      format-as="percentage"
      :trend="{ value: 2.1, unit: '%', label: 'vs last month', direction: 'down' }"
    >
      <template #icon>
        <ArrowTrendingDownIcon />
      </template>
    </AppStatsCard>
  </div>
</template>

<script setup lang="ts">
import { AppStatsCard } from '@ekklesia/ui';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingDownIcon 
} from '@heroicons/vue/24/outline';
</script>
```

### AppInput

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic input -->
    <AppInput
      v-model="formData.name"
      label="Full Name"
      placeholder="Enter your full name"
      required
    />

    <!-- Email input with validation -->
    <AppInput
      v-model="formData.email"
      label="Email Address"
      type="email"
      placeholder="Enter your email"
      :error="errors.email"
      help-text="We'll never share your email with anyone"
      required
    />

    <!-- Password input -->
    <AppInput
      v-model="formData.password"
      label="Password"
      type="password"
      placeholder="Enter your password"
      :error="errors.password"
      help-text="Password must be at least 8 characters long"
      required
    />

    <!-- Input with icon -->
    <AppInput
      v-model="formData.phone"
      label="Phone Number"
      type="tel"
      placeholder="(555) 123-4567"
    >
      <template #icon>
        <PhoneIcon class="h-5 w-5 text-gray-400" />
      </template>
    </AppInput>

    <!-- Disabled input -->
    <AppInput
      v-model="formData.readonly"
      label="Read Only Field"
      disabled
    />

    <AppButton type="submit" variant="primary" full-width>
      Submit Form
    </AppButton>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { AppInput, AppButton } from '@ekklesia/ui';
import { PhoneIcon } from '@heroicons/vue/24/outline';

const formData = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
  readonly: 'This field is read-only'
});

const errors = reactive({
  email: '',
  password: ''
});

const handleSubmit = () => {
  // Reset errors
  errors.email = '';
  errors.password = '';

  // Validate
  if (!formData.email.includes('@')) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (!errors.email && !errors.password) {
    console.log('Form submitted:', formData);
  }
};
</script>
```

### AppHeader

```vue
<template>
  <div>
    <AppHeader 
      title="Dashboard" 
      subtitle="Welcome back, John!"
      :user="currentUser"
      logo-src="/path/to/logo.png"
    >
      <template #actions>
        <AppButton variant="ghost" size="sm">
          <template #icon>
            <BellIcon class="h-4 w-4" />
          </template>
        </AppButton>
        <AppButton variant="ghost" size="sm">
          <template #icon>
            <CogIcon class="h-4 w-4" />
          </template>
        </AppButton>
      </template>
      
      <template #userActions>
        <AppButton variant="danger" size="sm" @click="handleLogout">
          <template #icon>
            <ArrowRightOnRectangleIcon class="h-4 w-4" />
          </template>
          Logout
        </AppButton>
      </template>
    </AppHeader>

    <!-- Header without user info -->
    <AppHeader 
      title="Public Page" 
      :show-user-info="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AppHeader, AppButton, type User } from '@ekklesia/ui';
import { 
  BellIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/vue/24/outline';

// Mock user data
const currentUser = computed((): User => ({
  id: '1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin'
}));

const handleLogout = () => {
  // Handle logout logic
  console.log('Logging out...');
};
</script>
```

### AppAlert

```vue
<template>
  <div class="space-y-4">
    <!-- Success alert -->
    <AppAlert 
      variant="success" 
      title="Success!" 
      message="Your changes have been saved successfully."
    />

    <!-- Error alert with close button -->
    <AppAlert 
      variant="error" 
      title="Error!" 
      message="There was an error processing your request."
      closeable
      @close="handleCloseError"
    />

    <!-- Warning alert -->
    <AppAlert 
      variant="warning" 
      title="Warning!" 
      message="This action cannot be undone."
    />

    <!-- Info alert -->
    <AppAlert 
      variant="info" 
      title="Info" 
      message="New features are now available."
    />

    <!-- Custom alert content -->
    <AppAlert variant="error" closeable @close="handleCloseCustom">
      <div class="text-sm">
        <p class="font-medium text-red-800">There were 2 errors with your submission</p>
        <ul class="mt-2 text-red-700 list-disc list-inside">
          <li>Your password must be at least 8 characters</li>
          <li>Your email address is already in use</li>
        </ul>
      </div>
    </AppAlert>
  </div>
</template>

<script setup lang="ts">
import { AppAlert } from '@ekklesia/ui';

const handleCloseError = () => {
  console.log('Error alert closed');
};

const handleCloseCustom = () => {
  console.log('Custom alert closed');
};
</script>
```

## Complete Example: Login Page

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md">
      <AppCard variant="elevated" rounded="xl">
        <div class="mb-8">
          <h2 class="text-2xl font-light text-gray-900 mb-2">Sign In</h2>
          <p class="text-gray-500 text-sm">Enter your credentials to access your account</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <AppInput
            v-model="formData.email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            :error="errors.email"
            autocomplete="email"
            required
          />

          <AppInput
            v-model="formData.password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            :error="errors.password"
            autocomplete="current-password"
            required
          />

          <AppAlert
            v-if="loginError"
            variant="error"
            :message="loginError"
            closeable
            @close="loginError = ''"
          />

          <AppButton
            type="submit"
            variant="primary"
            :is-loading="isLoading"
            loading-text="Signing in..."
            full-width
          >
            Sign In
          </AppButton>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { AppCard, AppInput, AppButton, AppAlert } from '@ekklesia/ui';

const formData = reactive({
  email: '',
  password: ''
});

const errors = reactive({
  email: '',
  password: ''
});

const isLoading = ref(false);
const loginError = ref('');

const handleLogin = async () => {
  // Reset errors
  errors.email = '';
  errors.password = '';
  loginError.value = '';

  // Validate
  if (!formData.email) {
    errors.email = 'Email is required';
    return;
  }

  if (!formData.password) {
    errors.password = 'Password is required';
    return;
  }

  // Simulate login
  isLoading.value = true;
  try {
    // Your login logic here
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Login successful!');
  } catch (error) {
    loginError.value = 'Invalid email or password';
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## TypeScript Integration

When using TypeScript, you can import types from the UI library:

```typescript
import { type User } from '@ekklesia/ui';

// Use the User type in your components
const currentUser: User = {
  id: '1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin'
};
```

## Best Practices

1. **Always use v-model for form inputs**: This ensures proper two-way binding
2. **Handle loading states**: Use the `isLoading` prop for async operations
3. **Provide proper error handling**: Use the `error` prop for validation messages
4. **Use semantic HTML**: The components output proper semantic HTML
5. **Add accessibility attributes**: Most components include ARIA attributes automatically
6. **Use slots for customization**: Take advantage of named slots for flexible layouts
7. **Follow naming conventions**: Use consistent prop names across your application
