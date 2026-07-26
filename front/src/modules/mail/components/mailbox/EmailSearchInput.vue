<script setup lang="ts">
defineProps<{modelValue?: string, loading?: boolean}>()
defineEmits<{(e: "update:modelValue", value: string): void}>()
</script>

<template>
  <v-text-field
    :model-value="modelValue"
    :loading="loading"
    prepend-inner-icon="mdi-magnify"
    label="Buscar correos"
    density="compact"
    variant="outlined"
    hide-details
    clearable
    @update:model-value="$emit('update:modelValue', $event || '')"
  />
</template>
