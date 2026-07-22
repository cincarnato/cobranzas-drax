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
    class="mailbox-selector"
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
      <div class="mailbox-selection d-flex align-center ga-2">
        <v-badge dot inline :color="item.raw.isActive ? 'success' : 'grey'" />
        <span class="mailbox-selection-text text-body-2 text-truncate">{{ item.raw.name }}</span>
      </div>
    </template>
  </v-autocomplete>
</template>

<style scoped>
.mailbox-selector {
  flex: 0 0 auto;
}
.mailbox-selector :deep(.v-field) {
  min-height: 40px;
}
.mailbox-selector :deep(.v-field__input) {
  min-width: 0;
  flex-wrap: nowrap;
}
.mailbox-selector :deep(.v-autocomplete__selection) {
  min-width: 0;
  max-width: 100%;
}
.mailbox-selection {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
.mailbox-selection-text {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
