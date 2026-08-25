<script setup lang="ts">
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailDensity, EmailManagementFilters} from "@/modules/mail/interfaces/IEmailManagement";
import EmailFilterBar from "./EmailFilterBar.vue";

defineProps<{
  search: string
  filters: EmailManagementFilters
  mailbox: IMailbox | null
  page: number
  totalPages: number
  pageSize: number
  density: EmailDensity
  loading?: boolean
}>()

defineEmits<{
  (e: "update:search", value: string): void
  (e: "update:filters", value: EmailManagementFilters): void
  (e: "update:page", value: number): void
  (e: "update:pageSize", value: number): void
  (e: "update:density", value: EmailDensity): void
  (e: "clear"): void
  (e: "refresh"): void
}>()
</script>

<template>
  <div class="pa-3 border-b bg-surface">
    <EmailFilterBar
      :model-value="filters"
      :mailbox="mailbox"
      :search="search"
      :loading="loading"
      @update:model-value="$emit('update:filters', $event)"
      @update:search="$emit('update:search', $event)"
      @clear="$emit('clear')"
    />
    <div class="d-flex justify-end align-center flex-wrap ga-2 mt-3">
      <v-btn
        icon="mdi-refresh"
        variant="text"
        :loading="loading"
        @click="$emit('refresh')"
      />
      <v-btn-toggle :model-value="density" mandatory density="compact" @update:model-value="$emit('update:density', $event)">
        <v-btn value="comfortable" size="small">Cómodo</v-btn>
        <v-btn value="compact" size="small">Compacto</v-btn>
      </v-btn-toggle>
      <v-select
        :model-value="pageSize"
        :items="[5, 10, 15, 25, 50, 100]"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 100px"
        @update:model-value="$emit('update:pageSize', Number($event))"
      />
      <v-pagination
        :model-value="page"
        :length="totalPages"
        density="compact"
        total-visible="5"
        @update:model-value="$emit('update:page', $event)"
      />
    </div>
  </div>
</template>
