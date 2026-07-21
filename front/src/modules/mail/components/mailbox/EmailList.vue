<script setup lang="ts">
import type {EmailDensity, EmailManagementListItem} from "@/modules/mail/interfaces/IEmailManagement";
import EmailListItem from "./EmailListItem.vue";

defineProps<{
  items: EmailManagementListItem[]
  selectedId?: string | null
  loading?: boolean
  error?: string
  density: EmailDensity
  emptyText: string
}>()

defineEmits<{
  (e: "open", email: EmailManagementListItem): void
  (e: "toggle-star", email: EmailManagementListItem): void
  (e: "retry"): void
}>()
</script>

<template>
  <div class="email-list overflow-auto">
    <div v-if="loading" class="pa-3">
      <v-skeleton-loader v-for="item in 8" :key="item" type="list-item-two-line" class="mb-2" />
    </div>
    <v-alert v-else-if="error" type="error" variant="tonal" class="ma-3">
      {{ error }}
      <template #append>
        <v-btn size="small" variant="text" @click="$emit('retry')">Reintentar</v-btn>
      </template>
    </v-alert>
    <v-empty-state
      v-else-if="!items.length"
      icon="mdi-email-search-outline"
      :text="emptyText"
    />
    <template v-else>
      <EmailListItem
        v-for="email in items"
        :key="email._id"
        :email="email"
        :density="density"
        :selected="selectedId === email._id"
        @open="$emit('open', $event)"
        @toggle-star="$emit('toggle-star', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.email-list {
  min-height: 0;
}
</style>
