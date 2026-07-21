
<script setup lang="ts">
import {ref} from "vue";
import InboundEmailCrud from '../../cruds/InboundEmailCrud'
import {Crud, useCrud} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
import InboundEmailReplyDialog from "@/modules/mail/components/InboundEmailReplyDialog.vue";
import type {
  IInboundEmail,
  IInboundEmailProcessMark,
  InboundEmailProcessMarkStatus
} from "@/modules/mail/interfaces/IInboundEmail";
import type {MailReplyResult} from "@/modules/mail/providers/MailReplyProvider";

const entity = InboundEmailCrud.instance
const {doPaginate, form} = useCrud(entity)
const replyDialog = ref(false)
const selectedReplyEmail = ref<IInboundEmail | null>(null)

const processMarkColor = (status?: InboundEmailProcessMarkStatus | string) => {
  const val = status?.toUpperCase()

  if (val === 'SUCCESS') return 'success'
  if (val === 'FAILED') return 'error'
  if (val === 'PROCESSING') return 'info'
  if (val === 'SKIPPED') return 'warning'

  return 'default'
}

const processMarkIcon = (status?: InboundEmailProcessMarkStatus | string) => {
  const val = status?.toUpperCase()

  if (val === 'SUCCESS') return 'mdi-check-circle-outline'
  if (val === 'FAILED') return 'mdi-alert-circle-outline'
  if (val === 'PROCESSING') return 'mdi-progress-clock'
  if (val === 'SKIPPED') return 'mdi-debug-step-over'

  return 'mdi-help-circle-outline'
}

const formatAttempts = (attempts?: number) => {
  if (!attempts) return null

  return attempts === 1 ? '1 intento' : `${attempts} intentos`
}

const formatProcessMarkTitle = (mark: IInboundEmailProcessMark) => {
  const details = [
    mark.status,
    formatDateTime(String(mark.markedAt)),
    formatAttempts(mark.attempts),
    mark.lastError
  ].filter(Boolean)

  return details.join(' · ')
}

const openReplyDialog = (item: IInboundEmail) => {
  selectedReplyEmail.value = item
  replyDialog.value = true
}

const onReplySent = async (result: MailReplyResult) => {
  if (selectedReplyEmail.value?._id === result.inboundEmail._id) {
    Object.assign(selectedReplyEmail.value, result.inboundEmail)
  }
  if (form.value?._id === result.inboundEmail._id) {
    Object.assign(form.value, result.inboundEmail)
  }
  await doPaginate()
}
</script>

<template>
  <crud :entity="entity">
    <template v-slot:item.receivedAt="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.toEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.ccEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.processedAt="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.hasAttachment="{value}">{{value ? 'si' : 'no'}}</template>
    <template v-slot:item.summary="{value}">
      <v-card variant="tonal" class="my-1 pa-1"> {{value}}</v-card>

    </template>

    <template v-slot:item.processMarks="{value}">
      <div v-if="value?.length" class="process-marks-cell">
        <v-chip
          v-for="mark in value"
          :key="`${mark.key}-${mark.markedAt}`"
          :color="processMarkColor(mark.status)"
          :prepend-icon="processMarkIcon(mark.status)"
          :title="formatProcessMarkTitle(mark)"
          class="process-mark-chip"
          size="small"
          variant="tonal"
        >
          <span class="process-mark-chip__key">{{ mark.key }}</span>
          <span v-if="mark.attempts" class="process-mark-chip__attempts">
            {{ mark.attempts }}x
          </span>
          <v-icon
            v-if="mark.lastError"
            class="process-mark-chip__error"
            color="error"
            icon="mdi-alert"
            size="14"
          />
        </v-chip>
      </div>
      <span v-else class="process-marks-empty">Sin marcas</span>
    </template>

    <template v-slot:item.actions="{item}">
      <v-tooltip text="Responder" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-reply-outline"
            size="small"
            variant="text"
            @click="openReplyDialog(item as IInboundEmail)"
          />
        </template>
      </v-tooltip>
    </template>

    <template v-slot:form="{form, operation}">
     <inbound-email-view
       v-if="operation === 'view'"
       :inbound-email="form"
       @sent="onReplySent"
     />
    </template>

  </crud>

  <inbound-email-reply-dialog
    v-model="replyDialog"
    :inbound-email="selectedReplyEmail"
    @sent="onReplySent"
  />
</template>

<style scoped>
.attachments-field {
  width: 100%;
}

.attachments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.attachments-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.attachment-card {
  height: 100%;
  overflow: hidden;
}

.attachment-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.attachment-name {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-word;
}

.attachment-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.8rem;
}

.attachments-empty {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.9rem;
}

.process-marks-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 220px;
  max-width: 420px;
}

.process-mark-chip {
  max-width: 100%;
}

.process-mark-chip__key {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.process-mark-chip__attempts {
  margin-left: 6px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.72rem;
  font-weight: 600;
}

.process-mark-chip__error {
  margin-left: 4px;
}

.process-marks-empty {
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-size: 0.82rem;
  white-space: nowrap;
}
</style>
