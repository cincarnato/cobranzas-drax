<script setup lang="ts">
const props = defineProps<{status?: string, labeled?: boolean, color?: string}>()

const labels: Record<string, string> = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignado",
  CLOSED: "Cerrado",
}

const colors: Record<string, string> = {
  PENDING: "warning",
  ASSIGNED: "info",
  CLOSED: "success",
}
</script>

<template>
  <v-chip :color="props.color || colors[status || ''] || 'default'" size="small" variant="tonal">
    <span v-if="labeled" class="font-weight-semibold">Estado:</span>
    <span>{{ labels[status || ''] || status || '-' }}</span>
  </v-chip>
</template>
