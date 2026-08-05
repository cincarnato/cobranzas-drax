<script setup lang="ts">
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";

defineProps<{
  mailbox: IMailbox | null
  modelValue?: string
}>()

defineEmits<{(e: "update:modelValue", value?: string): void}>()

const {t} = useI18n()
const expanded = ref(true)
</script>

<template>
  <div class="email-category-list">
    <v-btn
      variant="text"
      block
      class="category-toggle px-2"
      :append-icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      @click="expanded = !expanded"
    >
      <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">
        {{ t('mailbox.field.categories') }}
      </span>
    </v-btn>

    <v-expand-transition>
      <div v-show="expanded" class="category-content">
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
    </v-expand-transition>
  </div>
</template>

<style scoped>
.email-category-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.category-toggle {
  flex: 0 0 auto;
  height: 32px;
  min-height: 32px;
  justify-content: space-between;
}
.category-toggle :deep(.v-btn__content) {
  justify-content: flex-start;
}
.category-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}
</style>
