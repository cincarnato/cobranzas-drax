<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailManagementView} from "@/modules/mail/interfaces/IEmailManagement";
import MailboxSelector from "./MailboxSelector.vue";
import EmailSidebarViews from "./EmailSidebarViews.vue";
import EmailCategoryList from "./EmailCategoryList.vue";
import SessionEmailPanel from "./SessionEmailPanel.vue";
import type {SessionEmailState} from "@/modules/mail/interfaces/ISessionEmail";

defineProps<{
  mailboxId: string | null
  mailbox: IMailbox | null
  mailboxes: IMailbox[]
  view: EmailManagementView
  category?: string
  counts: Record<string, number>
  sessionEmailState?: SessionEmailState | null
  sessionEmailLoading?: boolean
  loadingMailboxes?: boolean
}>()

defineEmits<{
  (e: "update:mailboxId", value: string | null): void
  (e: "update:view", value: EmailManagementView): void
  (e: "update:category", value?: string): void
  (e: "compose"): void
  (e: "configure"): void
  (e: "session-email:start"): void
  (e: "session-email:pause"): void
  (e: "session-email:resume"): void
  (e: "session-email:close"): void
}>()

const {t} = useI18n()
</script>

<template>
  <div class="email-sidebar-content pa-3">
    <div class="email-sidebar-primary d-flex flex-column ga-3">
      <MailboxSelector
        :model-value="mailboxId"
        :mailboxes="mailboxes"
        :loading="loadingMailboxes"
        @update:model-value="$emit('update:mailboxId', $event)"
      />
      <v-btn
        variant="tonal"
        color="secondary"
        prepend-icon="mdi-cog-outline"
        block
        density="compact"
        class="settings-button"
        :disabled="!mailboxId"
        @click="$emit('configure')"
      >
        {{ t('mail.settings.button') }}
      </v-btn>
      <v-btn
        color="primary"
        prepend-icon="mdi-pencil-outline"
        block
        density="compact"
        class="compose-button"
        @click="$emit('compose')"
      >
        Redactar
      </v-btn>
      <SessionEmailPanel
        :state="sessionEmailState || null"
        :loading="sessionEmailLoading"
        :disabled="!mailboxId"
        @start="$emit('session-email:start')"
        @pause="$emit('session-email:pause')"
        @resume="$emit('session-email:resume')"
        @close="$emit('session-email:close')"
      />
      <EmailSidebarViews :model-value="view" :counts="counts" @update:model-value="$emit('update:view', $event)" />
    </div>
    <v-divider />
    <div class="email-sidebar-categories">
      <EmailCategoryList :mailbox="mailbox" :model-value="category" @update:model-value="$emit('update:category', $event)" />
    </div>
  </div>
</template>

<style scoped>
.email-sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.email-sidebar-primary {
  flex: 0 0 auto;
}
.email-sidebar-categories {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.compose-button,
.settings-button {
  flex: 0 0 auto;
  height: 36px;
  min-height: 36px;
}
</style>
