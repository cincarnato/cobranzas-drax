<script setup lang="ts">
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const opened = ref(false)

const generalShortcuts = computed(() => [
  {
    keys: ["Alt", "T"],
    title: t("mailbox.shortcuts.items.takeEmail.title"),
    description: t("mailbox.shortcuts.items.takeEmail.description"),
  },

  {
    keys: ["Alt", "Q"],
    title: t("mailbox.shortcuts.items.manageCategory.title"),
    description: t("mailbox.shortcuts.items.manageCategory.description"),
  },

  {
    keys: ["Ctrl", "Enter"],
    title: t("mailbox.shortcuts.items.saveTransfer.title"),
    description: t("mailbox.shortcuts.items.saveTransfer.description"),
  },
  {
    keys: ["Esc"],
    title: t("mailbox.shortcuts.items.closeEmbedded.title"),
    description: t("mailbox.shortcuts.items.closeEmbedded.description"),
  },

  {
    keys: ["Alt", "J"],
    title: t("mailbox.shortcuts.items.nextEmail.title"),
    description: t("mailbox.shortcuts.items.nextEmail.description"),
  },
  {
    keys: ["Alt", "K"],
    title: t("mailbox.shortcuts.items.previousEmail.title"),
    description: t("mailbox.shortcuts.items.previousEmail.description"),
  },
])

const closeShortcuts = computed(() => [
  {
    keys: ["Alt", "G"],
    title: t("mailbox.shortcuts.items.closeEmail.title"),
    description: t("mailbox.shortcuts.items.closeEmail.description"),
  },
  {
    keys: ["Alt", "Enter"],
    title: t("mailbox.shortcuts.items.confirmClose.title"),
    description: t("mailbox.shortcuts.items.confirmClose.description"),
  },
  {
    keys: ["Esc"],
    title: t("mailbox.shortcuts.items.cancelClose.title"),
    description: t("mailbox.shortcuts.items.cancelClose.description"),
  },
])
</script>

<template>
  <v-dialog v-model="opened" max-width="680">
    <template #activator="{props}">
      <v-btn
        v-bind="props"
        prepend-icon="mdi-keyboard-outline"
        variant="text"
      >
        {{ t("mailbox.shortcuts.button") }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-keyboard-outline" />
        <span>{{ t("mailbox.shortcuts.title") }}</span>
      </v-card-title>
      <v-card-subtitle>{{ t("mailbox.shortcuts.subtitle") }}</v-card-subtitle>
      <v-card-text>
        <v-list lines="two" density="compact">
          <v-list-item
            v-for="shortcut in generalShortcuts"
            :key="shortcut.title"
            class="shortcut-item px-0"
          >
            <template #prepend>
              <div class="shortcut-keys">
                <kbd
                  v-for="key in shortcut.keys"
                  :key="key"
                  class="shortcut-key"
                >
                  {{ key }}
                </kbd>
              </div>
            </template>
            <v-list-item-title>{{ shortcut.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ shortcut.description }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="my-2" />
          <v-list-item
            v-for="shortcut in closeShortcuts"
            :key="shortcut.title"
            class="shortcut-item px-0"
          >
            <template #prepend>
              <div class="shortcut-keys">
                <kbd
                  v-for="key in shortcut.keys"
                  :key="key"
                  class="shortcut-key"
                >
                  {{ key }}
                </kbd>
              </div>
            </template>
            <v-list-item-title>{{ shortcut.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ shortcut.description }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="opened = false">{{ t("mailbox.shortcuts.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.shortcut-item :deep(.v-list-item__prepend) {
  align-self: center;
  margin-inline-end: 16px;
}
.shortcut-keys {
  min-width: 116px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.shortcut-key {
  min-width: 32px;
  padding: 2px 6px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
}
</style>
