<script setup lang="ts">
defineProps<{modelValue: boolean, loading?: boolean, message?: string}>()
defineEmits<{(e: "update:modelValue", value: boolean): void, (e: "confirm"): void}>()
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="420" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Cerrar gestión</v-card-title>
      <v-card-text>{{ message || '¿Querés cerrar la gestión de este correo?' }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="$emit('confirm')">Cerrar gestión</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
