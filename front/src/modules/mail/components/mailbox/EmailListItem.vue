<script setup lang="ts">
import {computed} from "vue";
import dayjs from "dayjs";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailDensity, EmailManagementListItem} from "@/modules/mail/interfaces/IEmailManagement";
import {useMailboxAiOptions} from "@/modules/mail/composables/useMailboxAiOptions";
import EmailStatusBadge from "./EmailStatusBadge.vue";

const props = defineProps<{
  email: EmailManagementListItem
  mailbox: IMailbox | null
  selected?: boolean
  density: EmailDensity
}>()

defineEmits<{
  (e: "open", email: EmailManagementListItem): void
  (e: "toggle-star", email: EmailManagementListItem): void
}>()

const {sentimentEmoji, priorityIcon, priorityColor} = useMailboxAiOptions()
const sender = computed(() => props.email.fromName || props.email.fromEmail || "Remitente desconocido")
const senderEmail = computed(() => props.email.fromEmail || "")
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
const sentimentValue = computed(() => props.email.sentiment || "")
const sentimentDisplay = computed(() => sentimentEmoji(props.mailbox, sentimentValue.value) || sentimentValue.value)
const priorityValue = computed(() => props.email.priority || "")
const priorityDisplay = computed(() => priorityIcon(props.mailbox, priorityValue.value) || priorityValue.value)
const priorityDisplayColor = computed(() => priorityColor(props.mailbox, priorityValue.value))
</script>

<template>
  <div
    class="email-list-item border-b px-3 py-2 cursor-pointer"
    :class="[{selected, unread}, density]"
    @click="$emit('open', email)"
  >
    <div v-if="density === 'comfortable'" class="email-row comfortable-row">
      <v-btn
        class="star-action"
        :icon="email.userState?.isStarred ? 'mdi-star' : 'mdi-star-outline'"
        :color="email.userState?.isStarred ? 'amber' : undefined"
        variant="text"
        density="compact"
        @click.stop="$emit('toggle-star', email)"
      />
      <div class="ai-indicators">
        <v-tooltip v-if="priorityValue" :text="priorityValue">
          <template #activator="{props: tooltipProps}">
            <v-icon
              v-if="priorityDisplay !== priorityValue"
              v-bind="tooltipProps"
              :icon="priorityDisplay"
              :color="priorityDisplayColor"
              size="18"
            />
            <v-chip v-else v-bind="tooltipProps" size="x-small" variant="tonal" :color="priorityDisplayColor">
              {{ priorityDisplay }}
            </v-chip>
          </template>
        </v-tooltip>
        <v-tooltip v-if="sentimentValue" :text="sentimentValue">
          <template #activator="{props: tooltipProps}">
            <span v-if="sentimentDisplay !== sentimentValue" v-bind="tooltipProps" class="sentiment-emoji">{{ sentimentDisplay }}</span>
            <v-chip v-else v-bind="tooltipProps" size="x-small" variant="tonal">{{ sentimentDisplay }}</v-chip>
          </template>
        </v-tooltip>
      </div>
      <div class="sender-block">
        <span class="sender text-truncate">{{ sender }}</span>
        <span v-if="senderEmail && senderEmail !== sender" class="sender-email text-caption text-medium-emphasis text-truncate">
          {{ senderEmail }}
        </span>
      </div>
      <v-tooltip v-if="email.hasAttachments" text="Tiene adjuntos">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" class="attachment-icon" size="20" icon="mdi-paperclip" />
        </template>
      </v-tooltip>
      <span class="subject text-truncate">{{ email.subject || 'Sin asunto' }}</span>
      <v-tooltip :text="replyIndicator.label">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" class="reply-icon" :icon="replyIndicator.icon" :color="replyIndicator.color" size="20" />
        </template>
      </v-tooltip>
      <div class="assignment-meta">
        <EmailStatusBadge :status="email.attentionStatus" />
        <v-chip v-if="assignee" size="x-small" variant="tonal" color="blue-grey" class="assignee-chip">
          {{ assignee }}
        </v-chip>
      </div>
      <div class="right-meta">
        <span class="date text-caption text-medium-emphasis">{{ dayjs(email.receivedAt).format('DD/MM HH:mm') }}</span>
        <div v-if="email.category" class="date-chip-row">
          <v-chip v-if="email.category" size="x-small" variant="tonal">{{ email.category }}</v-chip>
        </div>
      </div>
      <div class="summary-line">
        <span class="fragment text-body-2 text-medium-emphasis text-truncate">{{ fragment }}</span>
        <v-chip v-if="email.processingStatus === 'ERROR'" size="x-small" color="error" variant="tonal">Error de procesamiento</v-chip>
        <v-chip v-if="email.isDuplicate" size="x-small" color="warning" variant="tonal">Posible duplicado</v-chip>
        <v-chip v-if="email.attachmentsOcrError" size="x-small" color="error" variant="tonal">Error al procesar adjunto</v-chip>
      </div>
    </div>
    <div v-else class="email-row compact-row">
      <v-btn
        class="star-action"
        :icon="email.userState?.isStarred ? 'mdi-star' : 'mdi-star-outline'"
        :color="email.userState?.isStarred ? 'amber' : undefined"
        variant="text"
        density="compact"
        @click.stop="$emit('toggle-star', email)"
      />
      <div class="ai-indicators">
        <v-tooltip v-if="priorityValue" :text="priorityValue">
          <template #activator="{props: tooltipProps}">
            <v-icon
              v-if="priorityDisplay !== priorityValue"
              v-bind="tooltipProps"
              :icon="priorityDisplay"
              :color="priorityDisplayColor"
              size="18"
            />
            <v-chip v-else v-bind="tooltipProps" size="x-small" variant="tonal" :color="priorityDisplayColor">
              {{ priorityDisplay }}
            </v-chip>
          </template>
        </v-tooltip>
        <v-tooltip v-if="sentimentValue" :text="sentimentValue">
          <template #activator="{props: tooltipProps}">
            <span v-if="sentimentDisplay !== sentimentValue" v-bind="tooltipProps" class="sentiment-emoji">{{ sentimentDisplay }}</span>
            <v-chip v-else v-bind="tooltipProps" size="x-small" variant="tonal">{{ sentimentDisplay }}</v-chip>
          </template>
        </v-tooltip>
      </div>
      <span class="sender text-truncate">{{ sender }}</span>
      <v-tooltip v-if="email.hasAttachments" text="Tiene adjuntos">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" class="attachment-icon" size="20" icon="mdi-paperclip" />
        </template>
      </v-tooltip>
      <span class="subject text-truncate">{{ email.subject || 'Sin asunto' }}</span>
      <v-tooltip :text="replyIndicator.label">
        <template #activator="{props: tooltipProps}">
          <v-icon v-bind="tooltipProps" class="reply-icon" :icon="replyIndicator.icon" :color="replyIndicator.color" size="20" />
        </template>
      </v-tooltip>
      <div class="assignment-meta">
        <EmailStatusBadge :status="email.attentionStatus" />
        <v-chip v-if="assignee" size="x-small" variant="tonal" color="blue-grey" class="assignee-chip">
          {{ assignee }}
        </v-chip>
      </div>
      <div class="right-meta">
        <span class="date text-caption text-medium-emphasis">{{ dayjs(email.receivedAt).format('DD/MM HH:mm') }}</span>
        <div v-if="email.category" class="date-chip-row">
          <v-chip v-if="email.category" size="x-small" variant="tonal">{{ email.category }}</v-chip>
        </div>
      </div>
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
  grid-template-columns: 40px 52px 170px 24px minmax(220px, 1fr) 28px 150px 150px;
  align-items: center;
  column-gap: 10px;
}
.comfortable-row {
  display: grid;
  grid-template-columns: 40px 52px 260px 24px minmax(260px, 1fr) 28px 150px 150px;
  grid-template-rows: 28px 28px;
  align-items: center;
  column-gap: 10px;
  row-gap: 4px;
}
.star-action {
  grid-column: 1;
  justify-self: center;
}
.comfortable-row .star-action {
  grid-row: 1 / span 2;
}
.ai-indicators {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}
.comfortable-row .ai-indicators {
  grid-row: 1 / span 2;
}
.sender-block {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.comfortable-row .sender-block {
  grid-row: 1 / span 2;
}
.compact-row .sender {
  grid-column: 3;
}
.attachment-icon {
  grid-column: 4;
  justify-self: center;
  color: rgba(var(--v-theme-on-surface), 0.72);
}
.comfortable-row .attachment-icon {
  grid-row: 1 / span 2;
}
.sender {
  font-weight: 500;
}
.sender-email {
  line-height: 1.2;
}
.subject {
  grid-column: 5;
  font-weight: 500;
}
.reply-icon {
  grid-column: 6;
  justify-self: center;
}
.comfortable-row .reply-icon {
  grid-row: 1 / span 2;
}
.fragment {
  min-width: 0;
}
.date {
  white-space: nowrap;
}
.assignment-meta {
  grid-column: 7;
  justify-self: end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  min-width: 0;
  max-width: 150px;
}
.comfortable-row .assignment-meta {
  grid-row: 1 / span 2;
}
.right-meta {
  grid-column: 8;
  justify-self: end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  min-width: 0;
  max-width: 150px;
}
.comfortable-row .right-meta {
  grid-row: 1 / span 2;
}
.assignee-chip {
  max-width: 100%;
}
.date-chip-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  max-width: 100%;
}
.sentiment-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  line-height: 1;
}
.summary-line {
  grid-column: 5 / 7;
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
