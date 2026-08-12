<script setup lang="ts">
import {computed} from "vue";
import dayjs from "dayjs";
import type {IOutboundEmail} from "@/modules/mail/interfaces/IOutboundEmail";
import EmailAttachments from "@/modules/mail/components/mailbox/EmailAttachments.vue";

const props = defineProps<{
  email: IOutboundEmail | null
}>()

defineEmits<{
  (e: "back"): void
}>()

const senderUser = computed(() => {
  const user = props.email?.user
  if (!user) return "-"
  if (typeof user === "string") return user
  return user.username || user.name || user.email || user._id || "-"
})

const mailboxLabel = computed(() => {
  const mailbox = props.email?.mailbox
  if (!mailbox) return "-"
  if (typeof mailbox === "string") return mailbox
  return mailbox.email || mailbox.name || mailbox._id || "-"
})

const dateLabel = computed(() => {
  const value = props.email?.sentAt || props.email?.createdAt
  return value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"
})

const statusColor = computed(() => {
  if (props.email?.status === "SENT") return "success"
  if (props.email?.status === "FAILED") return "error"
  return "warning"
})

const outboundAction = computed(() => {
  if (props.email?.inboundEmail && !props.email?.inReplyTo) {
    return {
      label: "Reenvio",
      icon: "mdi-share-outline",
      color: "deep-purple",
    }
  }
  if (props.email?.inboundEmail) {
    return {
      label: "Respuesta",
      icon: "mdi-reply-outline",
      color: "deep-orange-darken-2",
    }
  }
  return {
    label: "Nuevo",
    icon: "mdi-pencil-outline",
    color: "primary",
  }
})

function formatList(values?: string[]) {
  return values?.length ? values.join(", ") : "-"
}
</script>

<template>
  <div class="outbound-detail h-100 d-flex flex-column">
    <div class="pa-4 border-b bg-surface">
      <div class="d-flex align-start ga-2">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$emit('back')" />
        <div class="flex-grow-1 min-w-0">
          <h2 class="text-h6 text-truncate">{{ email?.subject || 'Sin asunto' }}</h2>
          <div class="d-flex flex-wrap align-center ga-2 mt-2">
            <v-chip size="small" variant="tonal" :color="statusColor">{{ email?.status || '-' }}</v-chip>
            <v-chip size="small" variant="tonal" :color="outboundAction.color" :prepend-icon="outboundAction.icon">
              {{ outboundAction.label }}
            </v-chip>
            <span class="text-body-2">De: {{ email?.fromEmail || '-' }}</span>
            <span class="text-caption text-medium-emphasis">Por: {{ senderUser }}</span>
            <span class="text-caption text-medium-emphasis">{{ dateLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="outbound-detail-body pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-list density="compact" class="border rounded">
            <v-list-item title="ID" :subtitle="email?._id || '-'" />
            <v-list-item title="Mailbox" :subtitle="mailboxLabel" />
            <v-list-item title="Usuario" :subtitle="senderUser" />
            <v-list-item title="Estado" :subtitle="email?.status || '-'" />
            <v-list-item title="Tipo" :subtitle="outboundAction.label" />
            <v-list-item title="Fecha de envío" :subtitle="dateLabel" />
            <v-list-item title="Message ID" :subtitle="email?.messageId || '-'" />
          </v-list>
        </v-col>
        <v-col cols="12" md="6">
          <v-list density="compact" class="border rounded">
            <v-list-item title="Para" :subtitle="formatList(email?.toEmails)" />
            <v-list-item title="CC" :subtitle="formatList(email?.ccEmails)" />
            <v-list-item title="BCC" :subtitle="formatList(email?.bccEmails)" />
            <v-list-item title="In Reply To" :subtitle="email?.inReplyTo || '-'" />
            <v-list-item title="Intentos" :subtitle="String(email?.attempts ?? 0)" />
            <v-list-item title="Error" :subtitle="email?.lastError || '-'" />
          </v-list>
        </v-col>
      </v-row>

      <v-card class="mt-4" variant="outlined">
        <v-card-title class="text-subtitle-1">Contenido</v-card-title>
        <v-divider />
        <v-card-text>
          <EmailAttachments :attachments="email?.attachments" class="mb-4" />
          <div v-if="email?.bodyHtml" class="email-body" v-html="email.bodyHtml" />
          <div v-else class="email-body-pre">{{ email?.bodyText || '-' }}</div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.outbound-detail {
  overflow: hidden;
}
.outbound-detail-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.email-body {
  overflow-wrap: anywhere;
}
.email-body :deep(img) {
  max-width: 100%;
}
.email-body-pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
