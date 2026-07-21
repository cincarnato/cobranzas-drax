<script setup lang="ts">
defineProps<{entities?: Array<{label: string, value?: string, source?: string, confidence?: number}>}>()
</script>

<template>
  <div v-if="entities?.length">
    <div class="text-subtitle-2 mb-2">Entidades extraídas</div>
    <v-table density="compact">
      <tbody>
        <tr v-for="(entity, index) in entities" :key="`${entity.label}-${index}`">
          <td>{{ entity.label }}</td>
          <td>{{ entity.value || '-' }}</td>
          <td class="text-caption text-medium-emphasis">{{ entity.source || '-' }}</td>
          <td class="text-caption text-medium-emphasis">{{ entity.confidence ? `${Math.round(entity.confidence * 100)}%` : '-' }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
