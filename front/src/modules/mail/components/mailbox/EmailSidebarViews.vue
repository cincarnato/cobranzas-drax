<script setup lang="ts">
import type {EmailManagementView} from "@/modules/mail/interfaces/IEmailManagement";

defineProps<{
  modelValue: EmailManagementView
  counts: Record<string, number>
}>()

defineEmits<{(e: "update:modelValue", value: EmailManagementView): void}>()

const views: Array<{value: EmailManagementView, label: string, icon: string, count?: string}> = [
  {value: "ALL", label: "Todos", icon: "mdi-email-multiple-outline"},
  {value: "PENDING", label: "Pendientes", icon: "mdi-inbox-outline", count: "PENDING"},
  {value: "ASSIGNED_TO_ME", label: "Asignados a mí", icon: "mdi-account-check-outline", count: "ASSIGNED_TO_ME"},
  {value: "ASSIGNED", label: "Asignados", icon: "mdi-account-multiple-outline", count: "ASSIGNED"},
  {value: "CLOSED", label: "Cerrados", icon: "mdi-archive-check-outline"},
  {value: "STARRED", label: "Destacados", icon: "mdi-star-outline"},
]
</script>

<template>
  <v-list nav density="compact" class="pa-0">
    <v-list-item
      v-for="view in views"
      :key="view.value"
      :active="modelValue === view.value"
      :prepend-icon="view.icon"
      rounded="lg"
      @click="$emit('update:modelValue', view.value)"
    >
      <v-list-item-title>{{ view.label }}</v-list-item-title>
      <template v-if="view.count" #append>
        <v-chip size="x-small" variant="tonal">{{ counts[view.count] || 0 }}</v-chip>
      </template>
    </v-list-item>
  </v-list>
</template>
