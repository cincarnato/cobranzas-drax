<script setup lang="ts">
const props = defineProps<{user?: any}>()

function userName() {
  if (!props.user) return "Sin asignar"
  if (typeof props.user === "string") return props.user
  return props.user.name || props.user.username || props.user.email || props.user._id || "Sin asignar"
}

function initials() {
  return userName().split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="d-inline-flex align-center ga-2 min-w-0">
    <v-avatar size="24" color="surface-variant">
      <span class="text-caption">{{ initials() }}</span>
    </v-avatar>
    <span class="text-body-2 text-truncate">{{ userName() }}</span>
  </div>
</template>
