<script setup lang="ts">
import dayjs from "dayjs";
import type {EmailDensity} from "@/modules/mail/interfaces/IEmailManagement";
import type {IOutboundEmail} from "@/modules/mail/interfaces/IOutboundEmail";

defineProps<{
  items: IOutboundEmail[]
  loading?: boolean
  error?: string
  density: EmailDensity
  emptyText: string
}>()

defineEmits<{
  (e: "retry"): void
  (e: "open", email: IOutboundEmail): void
}>()
</script>

<template>
  <div class="outbound-email-list">
    <div v-if="loading" class="pa-3">
      <v-skeleton-loader v-for="item in 8" :key="item" type="list-item-two-line" class="mb-2" />
    </div>
    <v-alert v-else-if="error" type="error" variant="tonal" class="ma-3">
      {{ error }}
      <template #append>
        <v-btn size="small" variant="text" @click="$emit('retry')">Reintentar</v-btn>
      </template>
    </v-alert>
    <v-empty-state
      v-else-if="!items.length"
      icon="mdi-send-outline"
      :text="emptyText"
    />
    <div v-else class="outbound-email-list-content">
      <div
        v-for="email in items"
        :key="email._id"
        class="outbound-email-list-item border-b px-3 py-2"
        :class="density"
        @click="$emit('open', email)"
      >
        <v-icon icon="mdi-send-outline" color="primary" />
        <div class="recipient-block">
          <span class="recipient text-truncate">Para: {{ (email.toEmails || []).join(', ') || '-' }}</span>
          <span class="from text-caption text-medium-emphasis text-truncate">
            Por: {{ typeof email.user === 'object' ? (email.user?.username || email.user?.name || email.user?.email || '-') : (email.user || '-') }}
          </span>
        </div>
        <div class="message-block">
          <span class="subject-row">
            <span class="subject text-truncate">{{ email.subject || 'Sin asunto' }}</span>
            <v-icon
              v-if="email.attachments?.length"
              icon="mdi-paperclip"
              size="small"
              class="text-medium-emphasis"
            />
          </span>
          <span class="fragment text-body-2 text-medium-emphasis text-truncate">{{ email.bodyText || '' }}</span>
        </div>
        <v-chip
          size="x-small"
          variant="tonal"
          :color="email.status === 'SENT' ? 'success' : email.status === 'FAILED' ? 'error' : 'warning'"
        >
          {{ email.status }}
        </v-chip>
        <span class="date text-caption text-medium-emphasis">{{ dayjs(email.sentAt || email.createdAt).format('DD/MM HH:mm') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.outbound-email-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.outbound-email-list-content {
  min-width: 980px;
}
.outbound-email-list-item {
  min-height: 72px;
  display: grid;
  grid-template-columns: 36px 280px minmax(260px, 1fr) 110px 120px;
  align-items: center;
  column-gap: 10px;
  cursor: pointer;
}
.outbound-email-list-item:hover {
  background: rgb(var(--v-theme-surface-variant), 0.45);
}
.outbound-email-list-item.compact {
  min-height: 54px;
}
.recipient-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.outbound-email-list-item > .v-icon {
  align-self: center;
  justify-self: center;
}
.outbound-email-list-item > .v-chip {
  align-self: center;
  justify-self: center;
}
.message-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.recipient {
  font-weight: 500;
}
.subject {
  font-weight: 500;
}
.subject-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.subject-row .subject {
  min-width: 0;
}
.date {
  align-self: center;
  justify-self: end;
  white-space: nowrap;
}
.fragment {
  min-width: 0;
}
</style>
