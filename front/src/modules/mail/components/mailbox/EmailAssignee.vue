<script setup lang="ts">
const props = defineProps<{user?: any}>()

function userName() {
  if (!props.user) return "Sin asignar"
  if (typeof props.user === "string") return props.user
  return props.user.name || props.user.username || props.user.email || props.user._id || "Sin asignar"
}
</script>

<template>
  <v-chip size="small" variant="tonal" color="blue-grey" class="assignee-chip">
    {{ userName() }}
  </v-chip>
</template>

<style scoped>
.assignee-chip {
  max-width: 100%;
}
</style>
