<script setup lang="ts">
import {computed} from "vue";

const props = withDefaults(defineProps<{
  data?: Record<string, unknown> | null
  mode?: 'simple' | 'table' | 'chips'
  maxEntries?: number
}>(), {
  data: null,
  mode: 'simple',
  maxEntries: 8
})

const entries = computed(() => {
  const source = props.data ?? {}
  return Object.entries(source).slice(0, props.maxEntries)
})

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(', ')
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<template>
  <div class="w-100">
    <div
      v-if="!entries.length"
      class="text-medium-emphasis"
    >
      Sin datos
    </div>

    <div
      v-else-if="mode === 'simple'"
      class="d-flex flex-column ga-1"
    >
      <div
        v-for="[key, value] in entries"
        :key="key"
      >
        <strong>{{ key }}:</strong> {{ formatValue(value) }}
      </div>
    </div>

    <div v-else-if="mode === 'chips'" class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="[key, value] in entries"
        :key="key"
        size="small"
        variant="tonal"
      >
        <strong>{{ key }}:</strong>&nbsp;{{ formatValue(value) }}
      </v-chip>
    </div>

    <v-table
      v-else
      density="compact"
    >
      <tbody>
        <tr
          v-for="[key, value] in entries"
          :key="key"
        >
          <th class="text-left font-weight-bold">
            {{ key }}
          </th>
          <td>{{ formatValue(value) }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
