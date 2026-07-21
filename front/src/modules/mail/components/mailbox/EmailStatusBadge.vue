<script setup lang="ts">
defineProps<{status?: string}>()

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
  <v-chip :color="colors[status || ''] || 'default'" size="small" variant="tonal">
    {{ labels[status || ''] || status || '-' }}
  </v-chip>
</template>
