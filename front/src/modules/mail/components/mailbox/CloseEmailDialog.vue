<script setup lang="ts">
import {onBeforeUnmount, watch} from "vue";

const props = defineProps<{modelValue: boolean, loading?: boolean, message?: string}>()
const emit = defineEmits<{(e: "update:modelValue", value: boolean): void, (e: "confirm"): void}>()

watch(() => props.modelValue, (value) => {
  if (value) {
    window.addEventListener("keydown", handleKeydown)
    return
  }
  window.removeEventListener("keydown", handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
})

function close() {
  emit("update:modelValue", false)
}

function confirm() {
  if (props.loading) return
  emit("confirm")
}

function handleKeydown(event: KeyboardEvent) {
  if (event.repeat || !props.modelValue) return
  if (event.altKey && !event.ctrlKey && !event.metaKey && event.key === "Enter") {
    event.preventDefault()
    confirm()
    return
  }
  if (event.key === "Escape") {
    event.preventDefault()
    close()
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="420" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Cerrar gestión</v-card-title>
      <v-card-text>{{ message || '¿Querés cerrar la gestión de este correo?' }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="confirm">Cerrar gestión</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
