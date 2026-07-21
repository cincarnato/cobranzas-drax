<script setup lang="ts">
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";

defineProps<{
  modelValue: string | null
  mailboxes: IMailbox[]
  loading?: boolean
}>()

defineEmits<{(e: "update:modelValue", value: string | null): void}>()
</script>

<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="mailboxes"
    :loading="loading"
    item-title="name"
    item-value="_id"
    label="Mailbox"
    density="compact"
    variant="outlined"
    hide-details
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #item="{props, item}">
      <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.email">
        <template #prepend>
          <v-badge dot inline :color="item.raw.isActive ? 'success' : 'grey'" />
        </template>
      </v-list-item>
    </template>
    <template #selection="{item}">
      <div class="d-flex align-center ga-2 min-w-0">
        <v-badge dot inline :color="item.raw.isActive ? 'success' : 'grey'" />
        <div class="text-truncate">
          <div class="text-body-2">{{ item.raw.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.raw.email }}</div>
        </div>
      </div>
    </template>
  </v-autocomplete>
</template>
