<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="loading"
      class="text-center py-8"
    >
      <p>{{ loadingText || 'Loading...' }}</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-8"
    >
      <p class="text-red-600">
        {{ error }}
      </p>
      <slot
        name="error-action"
        :retry="() => $emit('retry')"
      />
    </div>

    <!-- Table -->
    <div
      v-else-if="data && data.length > 0"
      class="bg-white shadow-md rounded-lg overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="[
                column.align === 'right' ? 'text-right' : 'text-left',
                column.headerClass
              ]"
            >
              {{ column.label }}
            </th>
            <th
              v-if="$slots.actions"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ actionsLabel || 'Actions' }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            class="hover:bg-gray-50"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
              :class="[
                column.align === 'right' ? 'text-right' : 'text-left',
                column.cellClass
              ]"
            >
              <!-- Custom cell slot -->
              <slot
                v-if="$slots[`cell-${column.key}`]"
                :name="`cell-${column.key}`"
                :value="getValue(row, column.key)"
                :row="row"
                :column="column"
                :index="index"
              />
              <!-- Default cell content -->
              <span
                v-else
                :class="column.valueClass"
              >
                {{ formatValue(getValue(row, column.key), column) }}
              </span>
            </td>
            <td
              v-if="$slots.actions"
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <slot
                name="actions"
                :row="row"
                :index="index"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-8"
    >
      <p class="text-gray-500">
        {{ emptyText || 'No data available' }}
      </p>
      <slot name="empty-action" />
    </div>

    <!-- Pagination -->
    <div
      v-if="showPagination && totalPages > 1"
      class="flex justify-center mt-8"
    >
      <slot
        name="pagination"
        :current-page="currentPage"
        :total-pages="totalPages"
        :previous-page="() => $emit('update:currentPage', currentPage - 1)"
        :next-page="() => $emit('update:currentPage', currentPage + 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  headerClass?: string;
  cellClass?: string;
  valueClass?: string;
  format?: (value: any, row: any) => string;
}

export interface TableProps {
  columns: TableColumn[];
  data?: any[];
  loading?: boolean;
  error?: string;
  emptyText?: string;
  loadingText?: string;
  actionsLabel?: string;
  rowKey?: string | ((row: any, index: number) => string | number);
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
}

const props = withDefaults(defineProps<TableProps>(), {
  data: () => [],
  loading: false,
  error: '',
  emptyText: 'No data available',
  loadingText: 'Loading...',
  showPagination: false,
  currentPage: 1,
  totalPages: 1,
  rowKey: undefined,
  actionsLabel: 'Actions',
});

const emit = defineEmits<{
  retry: [];
  'update:currentPage': [page: number];
}>();

const getRowKey = (row: any, index: number): string | number => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index);
  }
  if (props.rowKey && row[props.rowKey] !== undefined) {
    return row[props.rowKey];
  }
  return index;
};

const getValue = (row: any, key: string): any => {
  // Support nested properties with dot notation
  const keys = key.split('.');
  let value = row;
  for (const k of keys) {
    value = value?.[k];
  }
  return value;
};

const formatValue = (value: any, column: TableColumn): string => {
  if (column.format) {
    return column.format(value, value);
  }
  if (value === null || value === undefined) {
    return '-';
  }
  return String(value);
};
</script>
