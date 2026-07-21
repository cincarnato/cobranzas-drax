<script setup lang="ts">
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";

defineProps<{
  mailbox: IMailbox | null
  modelValue?: string
}>()

defineEmits<{(e: "update:modelValue", value?: string): void}>()
</script>

<template>
  <div>
    <div class="text-caption text-medium-emphasis font-weight-bold px-2 mb-2">CATEGORÍAS</div>
    <v-alert
      v-if="mailbox && !(mailbox.categories || []).length"
      density="compact"
      variant="tonal"
      color="info"
      class="mb-2"
    >
      Este mailbox todavía no tiene categorías configuradas.
    </v-alert>
    <v-list v-else nav density="compact" class="pa-0">
      <v-list-item
        v-for="category in mailbox?.categories || []"
        :key="category.name"
        :active="modelValue === category.name"
        prepend-icon="mdi-label-outline"
        rounded="lg"
        @click="$emit('update:modelValue', modelValue === category.name ? undefined : category.name)"
      >
        <v-list-item-title>{{ category.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>
