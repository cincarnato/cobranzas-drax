<script setup lang="ts">
import {computed} from "vue";
import dayjs from "dayjs";
import type {EmailDensity, EmailManagementListItem} from "@/modules/mail/interfaces/IEmailManagement";
import EmailStatusBadge from "./EmailStatusBadge.vue";
import EmailReplyStatus from "./EmailReplyStatus.vue";
import EmailAssignee from "./EmailAssignee.vue";

const props = defineProps<{
  email: EmailManagementListItem
  selected?: boolean
  density: EmailDensity
}>()

defineEmits<{
  (e: "open", email: EmailManagementListItem): void
  (e: "toggle-star", email: EmailManagementListItem): void
}>()

const sender = computed(() => props.email.fromName || props.email.fromEmail || "Remitente desconocido")
const fragment = computed(() => props.email.summary || props.email.bodyText || props.email.normalizedText || "")
const unread = computed(() => !props.email.userState?.isRead)
</script>

<template>
  <div
    class="email-list-item border-b px-3 py-2 cursor-pointer"
    :class="[{selected, unread}, density]"
    @click="$emit('open', email)"
  >
    <div class="d-flex align-center ga-2 min-w-0">
      <v-checkbox-btn density="compact" @click.stop />
      <v-btn
        :icon="email.userState?.isStarred ? 'mdi-star' : 'mdi-star-outline'"
        :color="email.userState?.isStarred ? 'amber' : undefined"
        variant="text"
        density="compact"
        @click.stop="$emit('toggle-star', email)"
      />
      <div class="flex-grow-1 min-w-0">
        <div class="d-flex align-center ga-2 min-w-0">
          <span class="sender text-truncate">{{ sender }}</span>
          <span class="subject text-truncate">{{ email.subject || 'Sin asunto' }}</span>
          <v-spacer />
          <span class="text-caption text-medium-emphasis">{{ dayjs(email.receivedAt).format('DD/MM HH:mm') }}</span>
        </div>
        <div v-if="density === 'comfortable'" class="d-flex align-center ga-2 mt-1 min-w-0">
          <span class="text-body-2 text-medium-emphasis text-truncate flex-grow-1">{{ fragment }}</span>
          <v-chip v-if="email.category" size="x-small" variant="tonal">{{ email.category }}</v-chip>
          <v-chip v-if="email.priority" size="x-small" variant="text" prepend-icon="mdi-flag-outline">{{ email.priority }}</v-chip>
          <v-icon v-if="email.hasAttachments" size="18" icon="mdi-paperclip" />
          <v-icon v-if="String(email.sentiment || '').toLowerCase().includes('neg')" color="error" size="18" icon="mdi-emoticon-sad-outline" />
          <v-chip v-if="email.processingStatus === 'REVIEW_REQUIRED'" size="x-small" color="warning" variant="tonal">Revisión requerida</v-chip>
          <v-chip v-if="email.processingStatus === 'ERROR'" size="x-small" color="error" variant="tonal">Error de procesamiento</v-chip>
          <v-chip v-if="email.isDuplicate" size="x-small" color="warning" variant="tonal">Posible duplicado</v-chip>
          <v-chip v-if="email.attachmentsOcrError" size="x-small" color="error" variant="tonal">Error al procesar adjunto</v-chip>
        </div>
      </div>
      <div class="d-none d-lg-flex align-center ga-2 email-meta">
        <EmailStatusBadge :status="email.attentionStatus" />
        <EmailReplyStatus :email="email" />
        <EmailAssignee :user="email.assignedTo" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.email-list-item {
  min-height: 54px;
}
.email-list-item.comfortable {
  min-height: 78px;
}
.email-list-item:hover,
.email-list-item.selected {
  background: rgb(var(--v-theme-surface-variant), 0.45);
}
.sender {
  width: 160px;
  font-weight: 500;
}
.subject {
  font-weight: 500;
}
.unread .sender,
.unread .subject {
  font-weight: 700;
}
.email-meta {
  min-width: 330px;
  justify-content: flex-end;
}
</style>
