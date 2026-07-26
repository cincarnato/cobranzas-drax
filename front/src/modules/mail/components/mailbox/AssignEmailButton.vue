<script setup lang="ts">
defineProps<{loading?: boolean, disabled?: boolean}>()
defineEmits<{(e: "assign"): void}>()
</script>

<template>
  <v-btn color="primary" prepend-icon="mdi-account-plus-outline" :loading="loading" :disabled="disabled" @click="$emit('assign')">
    Tomar Correo
  </v-btn>
</template>
