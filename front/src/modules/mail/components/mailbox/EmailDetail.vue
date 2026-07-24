<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import dayjs from "dayjs";
import type {EmailManagementDetail, EmailManagementPermissions} from "@/modules/mail/interfaces/IEmailManagement";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import EmailStatusBadge from "./EmailStatusBadge.vue";
import EmailReplyStatus from "./EmailReplyStatus.vue";
import EmailThread from "./EmailThread.vue";
import EmailManagementPanel from "./EmailManagementPanel.vue";
import CloseEmailDialog from "./CloseEmailDialog.vue";
import AssignEmailButton from "./AssignEmailButton.vue";
import InboundEmailReplyComposer from "@/modules/mail/components/InboundEmailReplyComposer.vue";

const props = defineProps<{
  detail: EmailManagementDetail | null
  loading?: boolean
  error?: string
  currentUser: any
  permissions: EmailManagementPermissions
  actionLoading?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: "back"): void
  (e: "retry"): void
  (e: "assign"): void
  (e: "save-classification", value: any): void
  (e: "reassign", userId: string | null): void
  (e: "close", closeReason?: string | null): void
  (e: "reply-sent", value: any): void
}>()

const showPanel = ref(true)
const closeDialog = ref(false)
const takeDialog = ref(false)
const replyComposerRef = ref<{focusEditor: () => void} | null>(null)
const threadPaneRef = ref<HTMLElement | null>(null)
const pendingCloseReason = ref<string | null>(null)

const email = computed(() => props.detail?.inboundEmail || null)
const canReply = computed(() => props.permissions.canReply && email.value?.attentionStatus !== "CLOSED")
const currentUserId = computed(() => (props.currentUser as any)?._id || props.currentUser?.id || "")
const assignedToId = computed(() => {
  const assigned = email.value?.assignedTo
  if (!assigned) return ""
  return String(typeof assigned === "object" ? assigned._id || assigned.id : assigned)
})
const assignedToMe = computed(() => Boolean(assignedToId.value && currentUserId.value && assignedToId.value === String(currentUserId.value)))
const assignedToOther = computed(() => Boolean(assignedToId.value && !assignedToMe.value))
const canTakeEmail = computed(() => props.permissions.canAssign && email.value?.attentionStatus !== "CLOSED" && !assignedToMe.value)
const assignedToName = computed(() => {
  const assigned = email.value?.assignedTo
  if (!assigned || typeof assigned === "string") return ""
  return assigned.name || assigned.username || assigned.email || ""
})
const senderLabel = computed(() => {
  const name = email.value?.fromName || ""
  const address = email.value?.fromEmail || ""
  if (name && address) return `${name} <${address}>`
  return name || address || "-"
})
const assigneeLabel = computed(() => {
  const assigned = email.value?.assignedTo
  if (!assigned) return "Sin asignar"
  if (typeof assigned === "string") return assigned
  return assigned.name || assigned.username || assigned.email || assigned._id || "Sin asignar"
})

watch(canReply, async (value, previous) => {
  if (!value || previous) return
  await nextTick()
  threadPaneRef.value?.scrollTo({top: threadPaneRef.value.scrollHeight, behavior: "smooth"})
  replyComposerRef.value?.focusEditor()
})

function requestClose(closeReason?: string | null) {
  if (!email.value || !props.detail?.mailbox) return
  if (closeValidation(closeReason)) return
  if (props.detail.mailbox.replyRequiredToClose && !(email.value.replyCount && email.value.replyCount > 0)) return
  pendingCloseReason.value = closeReason || null
  closeDialog.value = true
}

function requestTakeEmail() {
  if (!canTakeEmail.value) return
  if (assignedToOther.value) {
    takeDialog.value = true
    return
  }
  emit("assign")
}

function confirmTakeEmail() {
  takeDialog.value = false
  emit("assign")
}

function closeValidation(closeReason?: string | null) {
  const replyValidation = closeBaseValidation()
  if (replyValidation) return replyValidation
  if (props.detail?.mailbox.closeReasonRequired && !(closeReason || email.value?.closeReason)) {
    return "Este mailbox requiere un motivo de cierre antes de cerrar la gestión."
  }
  return ""
}

function closeBaseValidation() {
  if (!email.value || !props.detail?.mailbox) return ""
  if (props.detail.mailbox.replyRequiredToClose && !(email.value.replyCount && email.value.replyCount > 0)) {
    return "Este mailbox requiere una respuesta antes de cerrar la gestión."
  }
  return ""
}
</script>

<template>
  <div class="email-detail h-100 d-flex flex-column">
    <div v-if="loading" class="pa-4">
      <v-skeleton-loader type="article, actions" />
    </div>
    <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
      {{ error }}
      <template #append>
        <v-btn size="small" variant="text" @click="$emit('retry')">Reintentar</v-btn>
      </template>
    </v-alert>
    <v-empty-state v-else-if="!detail || !email" icon="mdi-email-open-outline" text="Seleccioná un correo para ver el detalle." />
    <template v-else>
      <div class="detail-layout">
        <div class="detail-main">
          <div class="pa-4 border-b bg-surface">
            <div class="d-flex align-start ga-2">
              <v-btn icon="mdi-arrow-left" variant="text" @click="$emit('back')" />
              <div class="flex-grow-1 min-w-0">
                <h2 class="text-h6 text-truncate">{{ email.subject || 'Sin asunto' }}</h2>
                <div class="d-flex flex-wrap align-center ga-2 mt-2">
                  <span class="text-body-2">De: {{ senderLabel }}</span>
                  <span class="text-caption text-medium-emphasis">Para: {{ (email.toEmails || []).join(', ') }}</span>
                  <span class="text-caption text-medium-emphasis">{{ dayjs(email.receivedAt).format('DD/MM/YYYY HH:mm') }}</span>
                  <EmailReplyStatus :email="email" />
                </div>
                <div class="email-attribute-row d-flex flex-wrap align-center ga-2 mt-2">
                  <EmailStatusBadge :status="email.attentionStatus" labeled color="blue-grey" />
                  <v-chip size="small" variant="tonal" color="blue-grey">
                    <span class="attribute-label">Asignación:</span>
                    <span>{{ assigneeLabel }}</span>
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="teal">
                    <span class="attribute-label">Categoría:</span>
                    <span>{{ email.category || 'Sin categoría' }}</span>
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="deep-purple">
                    <span class="attribute-label">Prioridad:</span>
                    <span>{{ email.priority || 'Sin prioridad' }}</span>
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="pink">
                    <span class="attribute-label">Sentimiento:</span>
                    <span>{{ email.sentiment || 'Sin sentimiento' }}</span>
                  </v-chip>
                </div>
                <v-alert v-if="assignedToName && !permissions.canReply" density="compact" variant="tonal" color="info" class="mt-3">
                  {{ assignedToName }} está gestionando este correo.
                </v-alert>
              </div>
              <v-btn :icon="showPanel ? 'mdi-dock-right' : 'mdi-dock-window'" variant="text" @click="showPanel = !showPanel" />
            </div>
          </div>

          <div ref="threadPaneRef" class="thread-pane pa-4">
            <EmailThread :inbound-thread="detail.inboundThread" :outbound-thread="detail.outboundThread" />
            <InboundEmailReplyComposer
              v-if="canReply"
              ref="replyComposerRef"
              :inbound-email="email as IInboundEmail"
              :mailbox="detail.mailbox"
              class="mt-4"
              @sent="$emit('reply-sent', $event)"
            />
            <div v-else-if="email.attentionStatus !== 'CLOSED'" class="reply-gate mt-4 pa-4">
              <v-alert
                density="compact"
                variant="tonal"
                :color="assignedToOther ? 'warning' : 'info'"
                class="mb-3"
              >
                <template v-if="assignedToOther">
                  Este correo está asignado a {{ assignedToName || 'otro usuario' }}. Para responderlo primero tenés que tomarlo.
                </template>
                <template v-else>
                  Para responder el correo primero tenés que tomarlo.
                </template>
              </v-alert>
              <AssignEmailButton
                v-if="canTakeEmail"
                :loading="actionLoading"
                @assign="requestTakeEmail"
              />
            </div>
            <v-alert v-else density="compact" variant="tonal" color="info" class="mt-4">
              La gestión está cerrada.
            </v-alert>
          </div>
        </div>
        <aside v-if="showPanel" class="management-panel border-s overflow-auto">
          <EmailManagementPanel
            :email="email"
            :mailbox="detail.mailbox"
            :permissions="permissions"
            :saving="saving"
            :action-loading="actionLoading"
            :close-validation="closeBaseValidation()"
            @assign="$emit('assign')"
            @save-classification="$emit('save-classification', $event)"
            @reassign="$emit('reassign', $event)"
            @close-request="requestClose"
          />
        </aside>
      </div>
      <CloseEmailDialog v-model="closeDialog" :loading="actionLoading" @confirm="closeDialog = false; emit('close', pendingCloseReason)" />
      <v-dialog v-model="takeDialog" max-width="460">
        <v-card>
          <v-card-title>Tomar correo asignado</v-card-title>
          <v-card-text>
            Este correo está asignado a {{ assignedToName || 'otro usuario' }}. Si confirmás, se desasignará de ese usuario y quedará asignado a vos.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" :disabled="actionLoading" @click="takeDialog = false">Cancelar</v-btn>
            <v-btn color="primary" :loading="actionLoading" @click="confirmTakeEmail">Tomar Correo</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<style scoped>
.email-detail {
  overflow: hidden;
}
.detail-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  overflow: hidden;
}
.detail-main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.thread-pane {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.reply-gate {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
.email-attribute-row :deep(.v-chip__content) {
  gap: 4px;
}
.attribute-label {
  font-weight: 600;
}
.management-panel {
  width: 340px;
  flex: 0 0 340px;
}
@media (max-width: 960px) {
  .management-panel {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgb(var(--v-theme-surface));
    z-index: 2;
  }
}
</style>
