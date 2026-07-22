<script setup lang="ts">
import {computed} from "vue";
import dayjs from "dayjs";
import type {EmailDensity, EmailManagementListItem} from "@/modules/mail/interfaces/IEmailManagement";
import EmailStatusBadge from "./EmailStatusBadge.vue";

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
const assignee = computed(() => {
  const user = props.email.assignedTo
  if (!user || typeof user === "string") return ""
  return user.name || user.username || user.email || ""
})
const replyIndicator = computed(() => {
  if (!props.email.replyCount) return {icon: "mdi-reply-alert", color: "warning", label: "Sin respuesta"}
  return {icon: "mdi-reply-check", color: "success", label: "Respondido"}
})
</script>

<template>
  <div
    class="email-list-item border-b px-3 py-2 cursor-pointer"
    :class="[{selected, unread}, density]"
    @click="$emit('open', email)"
  >
    <div v-if="density === 'comfortable'" class="email-row comfortable-row">
      <v-btn
        :icon="email.userState?.isStarred ? 'mdi-star' : 'mdi-star-outline'"
        :color="email.userState?.isStarred ? 'amber' : undefined"
        variant="text"
        density="compact"
        @click.stop="$emit('toggle-star', email)"
      />
      <span class="sender text-truncate">{{ sender }}</span>
      <span class="subject text-truncate">{{ email.subject || 'Sin asunto' }}</span>
      <EmailStatusBadge :status="email.attentionStatus" />
      <v-tooltip :text="replyIndicator.label">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" :icon="replyIndicator.icon" :color="replyIndicator.color" size="20" />
        </template>
      </v-tooltip>
      <v-tooltip v-if="email.hasAttachments" text="Tiene adjuntos">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" class="attachment-icon" size="20" icon="mdi-paperclip" />
        </template>
      </v-tooltip>
      <v-chip v-if="email.category" size="x-small" variant="tonal">{{ email.category }}</v-chip>
      <v-chip v-if="email.priority" size="x-small" variant="tonal">{{ email.priority }}</v-chip>
      <v-chip v-if="assignee" size="x-small" variant="tonal" color="blue-grey">{{ assignee }}</v-chip>
      <span class="date text-caption text-medium-emphasis">{{ dayjs(email.receivedAt).format('DD/MM HH:mm') }}</span>
      <div class="summary-line">
        <span class="fragment text-body-2 text-medium-emphasis text-truncate">{{ fragment }}</span>
        <v-icon v-if="String(email.sentiment || '').toLowerCase().includes('neg')" color="error" size="18" icon="mdi-emoticon-sad-outline" />
        <v-chip v-if="email.processingStatus === 'ERROR'" size="x-small" color="error" variant="tonal">Error de procesamiento</v-chip>
        <v-chip v-if="email.isDuplicate" size="x-small" color="warning" variant="tonal">Posible duplicado</v-chip>
        <v-chip v-if="email.attachmentsOcrError" size="x-small" color="error" variant="tonal">Error al procesar adjunto</v-chip>
      </div>
    </div>
    <div v-else class="email-row compact-row">
      <v-btn
        :icon="email.userState?.isStarred ? 'mdi-star' : 'mdi-star-outline'"
        :color="email.userState?.isStarred ? 'amber' : undefined"
        variant="text"
        density="compact"
        @click.stop="$emit('toggle-star', email)"
      />
      <span class="sender text-truncate">{{ sender }}</span>
      <span class="subject text-truncate">{{ email.subject || 'Sin asunto' }}</span>
      <EmailStatusBadge :status="email.attentionStatus" />
      <v-tooltip :text="replyIndicator.label">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" :icon="replyIndicator.icon" :color="replyIndicator.color" size="20" />
        </template>
      </v-tooltip>
      <v-tooltip v-if="email.hasAttachments" text="Tiene adjuntos">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" class="attachment-icon" size="20" icon="mdi-paperclip" />
        </template>
      </v-tooltip>
      <v-chip v-if="email.category" size="x-small" variant="tonal">{{ email.category }}</v-chip>
      <v-chip v-if="email.priority" size="x-small" variant="tonal">{{ email.priority }}</v-chip>
      <v-chip v-if="assignee" size="x-small" variant="tonal" color="blue-grey">{{ assignee }}</v-chip>
      <span class="date text-caption text-medium-emphasis">{{ dayjs(email.receivedAt).format('DD/MM HH:mm') }}</span>
    </div>
  </div>
</template>

<style scoped>
.email-list-item {
  min-height: 54px;
  min-width: 1120px;
}
.email-list-item.comfortable {
  min-height: 82px;
}
.email-list-item:hover,
.email-list-item.selected {
  background: rgb(var(--v-theme-surface-variant), 0.45);
}
.compact-row {
  display: grid;
  grid-template-columns: 40px 170px minmax(220px, 1fr) auto auto auto auto auto auto 110px;
  align-items: center;
  column-gap: 10px;
}
.comfortable-row {
  display: grid;
  grid-template-columns: 40px 180px minmax(260px, 1fr) auto auto auto auto auto auto 110px;
  grid-template-rows: 28px 28px;
  align-items: center;
  column-gap: 10px;
  row-gap: 4px;
}
.sender {
  font-weight: 500;
}
.subject {
  font-weight: 500;
}
.fragment {
  min-width: 0;
}
.date {
  white-space: nowrap;
  justify-self: end;
}
.attachment-icon {
  color: rgba(var(--v-theme-on-surface), 0.72);
}
.summary-line {
  grid-column: 3 / -1;
  grid-row: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.unread .sender,
.unread .subject {
  font-weight: 700;
}
</style>
