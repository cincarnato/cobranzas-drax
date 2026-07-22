<script setup lang="ts">
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailManagementView} from "@/modules/mail/interfaces/IEmailManagement";
import MailboxSelector from "./MailboxSelector.vue";
import EmailSidebarViews from "./EmailSidebarViews.vue";
import EmailCategoryList from "./EmailCategoryList.vue";

defineProps<{
  mailboxId: string | null
  mailbox: IMailbox | null
  mailboxes: IMailbox[]
  view: EmailManagementView
  category?: string
  counts: Record<string, number>
  loadingMailboxes?: boolean
}>()

defineEmits<{
  (e: "update:mailboxId", value: string | null): void
  (e: "update:view", value: EmailManagementView): void
  (e: "update:category", value?: string): void
  (e: "compose"): void
}>()
</script>

<template>
  <div class="pa-3 d-flex flex-column ga-3 h-100">
    <MailboxSelector
      :model-value="mailboxId"
      :mailboxes="mailboxes"
      :loading="loadingMailboxes"
      @update:model-value="$emit('update:mailboxId', $event)"
    />
    <v-btn color="primary" prepend-icon="mdi-pencil-outline" block class="compose-button" @click="$emit('compose')">
      Redactar
    </v-btn>
    <EmailSidebarViews :model-value="view" :counts="counts" @update:model-value="$emit('update:view', $event)" />
    <v-divider />
    <EmailCategoryList :mailbox="mailbox" :model-value="category" @update:model-value="$emit('update:category', $event)" />
  </div>
</template>

<style scoped>
.compose-button {
  flex: 0 0 auto;
  height: 40px;
  min-height: 40px;
}
</style>
