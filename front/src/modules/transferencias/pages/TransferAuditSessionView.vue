<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {onBeforeRouteLeave} from "vue-router";
import TransferEmail from "../components/TransferEmail.vue";
import {useTransferAuditSession} from "../composables/useTransferAuditSession";
import type {ITransferEmail} from "../interfaces/ITransferEmail";

const batchSize = ref(5)
const batchSizeOptions = Array.from({length: 10}, (_, index) => index + 1)
const confirmDialog = ref(false)
const pendingAction = ref<null | (() => void | Promise<void>)>(null)
const transferEmailRef = ref<InstanceType<typeof TransferEmail> | null>(null)
let heartbeatTimer: ReturnType<typeof window.setInterval> | null = null

const {
  session,
  items,
  stats,
  currentItem,
  currentItemId,
  pendingItems,
  completedItems,
  loading,
  starting,
  completing,
  heartbeatError,
  errorMessage,
  isAuditModalOpen,
  isDirty,
  isCompleted,
  loadActiveSession,
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  requestMoreItems,
  openItem,
  closeItem,
  moveToNext,
  moveToPrevious,
  markSaved,
  sendHeartbeat,
} = useTransferAuditSession()

const elapsedText = computed(() => {
  if (!session.value?.startedAt) return '-'
  const elapsedMs = Date.now() - new Date(session.value.startedAt).getTime()
  const minutes = Math.floor(elapsedMs / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours ? `${hours} h ${remainingMinutes} min` : `${Math.max(minutes, 0)} min`
})

const sessionStatusLabel = computed(() => {
  switch (session.value?.status) {
    case 'ACTIVE': return 'Activa'
    case 'PAUSED': return 'Pausada'
    case 'COMPLETED': return 'Finalizada'
    case 'EXPIRED': return 'Vencida'
    case 'CANCELLED': return 'Cancelada'
    default: return 'Sin sesión'
  }
})

const startedAtText = computed(() => session.value?.startedAt ? formatTime(session.value.startedAt) : '-')
const averageText = computed(() => {
  const auditedCount = stats.value.auditedCount || completedItems.value.length
  if (!session.value?.startedAt || !auditedCount) return '-'
  const elapsedSeconds = Math.max(1, Math.floor((Date.now() - new Date(session.value.startedAt).getTime()) / 1000))
  return formatDuration(Math.floor(elapsedSeconds / auditedCount))
})
const validatedCount = computed(() => items.value.filter((item) => item.humanStatus === 'VALIDADO').length)
const correctedCount = computed(() => items.value.filter((item) => item.humanStatus === 'CORREGIDO').length)
const discardedCount = computed(() => items.value.filter((item) => item.humanStatus === 'DESCARTADO').length)
const canStartNewSession = computed(() => Boolean(session.value && ['COMPLETED', 'EXPIRED', 'CANCELLED'].includes(session.value.status)))
const showSummary = computed(() => isCompleted.value || session.value?.status === 'COMPLETED')
const processedCount = computed(() => stats.value.auditedCount || completedItems.value.length || session.value?.auditedCount || 0)
const summaryValidatedCount = computed(() => stats.value.validatedCount || validatedCount.value || session.value?.validatedCount || 0)
const summaryCorrectedCount = computed(() => stats.value.correctedCount || correctedCount.value || session.value?.correctedCount || 0)
const summaryDiscardedCount = computed(() => stats.value.discardedCount || discardedCount.value || session.value?.discardedCount || 0)

onMounted(async () => {
  await loadActiveSession()
  syncBatchSizeFromSession()
  heartbeatTimer = window.setInterval(() => {
    void sendHeartbeat()
  }, 90000)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer)
  window.removeEventListener('keydown', handleKeydown)
})

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm('Tenés cambios sin guardar.\n\n¿Querés salir y descartar los cambios?')
})

function formatCurrency(amount?: number | null, currency?: string) {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-AR', {style: 'currency', currency: currency || 'ARS'}).format(amount)
}

function formatDate(date?: Date | string | null) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-AR', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(date))
}

function formatTime(date?: Date | string | null) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-AR', {hour: '2-digit', minute: '2-digit'}).format(new Date(date))
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return minutes ? `${minutes} min ${rest} s` : `${rest} s`
}

function itemState(item: ITransferEmail) {
  if (item.status === 'AUDITADO') return 'completed'
  if (item.assignmentExpiresAt && new Date(item.assignmentExpiresAt).getTime() <= Date.now()) return 'expired'
  if (item._id === currentItemId.value) return 'current'
  return 'pending'
}

function itemIcon(item: ITransferEmail) {
  const state = itemState(item)
  if (state === 'completed') return 'mdi-check'
  if (state === 'current') return 'mdi-circle'
  if (state === 'expired') return 'mdi-alert-circle-outline'
  return 'mdi-circle-outline'
}

function aiLabel(status?: string) {
  switch (status) {
    case 'PROCESADO_CONFIABLE': return 'IA confiable'
    case 'PROCESADO_CON_DUDAS': return 'IA con dudas'
    case 'PROCESADO_INCOMPLETO': return 'IA incompleta'
    case 'PROCESADO_SIN_IA': return 'Fallback sin IA'
    case 'ERROR_PROCESAMIENTO': return 'Error IA'
    default: return 'IA pendiente'
  }
}

function guarded(action: () => void | Promise<void>) {
  if (!isDirty.value) {
    void action()
    return
  }
  pendingAction.value = action
  confirmDialog.value = true
}

function discardChangesAndContinue() {
  confirmDialog.value = false
  isDirty.value = false
  const action = pendingAction.value
  pendingAction.value = null
  if (action) void action()
}

function handleSaved(updated: ITransferEmail) {
  markSaved(updated)
}

function syncBatchSizeFromSession() {
  if (!session.value?.batchSize) return
  batchSize.value = Math.min(Math.max(Number(session.value.batchSize), 1), 10)
}

async function startNewSession() {
  await startSession(batchSize.value)
  syncBatchSizeFromSession()
}

async function finishSession() {
  await completeSession()
  syncBatchSizeFromSession()
}

function saveCurrent() {
  void transferEmailRef.value?.saveMetadata()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return

  const target = event.target as HTMLElement | null
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName || '')
  if (isInput) return

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    saveCurrent()
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    saveCurrent()
  }
  if (event.altKey && event.key === 'ArrowRight') {
    event.preventDefault()
    guarded(moveToNext)
  }
  if (event.altKey && event.key === 'ArrowLeft') {
    event.preventDefault()
    guarded(moveToPrevious)
  }
  if (event.key === 'Escape' && isAuditModalOpen.value) {
    event.preventDefault()
    guarded(closeItem)
  }
}
</script>

<template>
  <v-container fluid class="audit-session-view py-4">
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="heartbeatError" type="warning" variant="tonal" class="mb-3">
      {{ heartbeatError }}
    </v-alert>

    <div class="session-header mb-4">
      <div>
        <h1 class="text-h5 font-weight-bold">Sesión de auditoría</h1>
        <div class="text-body-2 text-medium-emphasis">
          {{ sessionStatusLabel }}
          <template v-if="session">
            · {{ stats.auditedCount }} de {{ stats.assignedCount || items.length }} completados · Iniciada {{ startedAtText }} · {{ elapsedText }}
          </template>
        </div>
      </div>

      <div class="session-actions">
        <v-btn
          v-if="session?.status === 'PAUSED'"
          color="primary"
          variant="flat"
          prepend-icon="mdi-play"
          @click="resumeSession"
        >
          Continuar sesión
        </v-btn>
        <v-btn
          v-if="session?.status === 'ACTIVE'"
          variant="tonal"
          prepend-icon="mdi-pause"
          @click="guarded(pauseSession)"
        >
          Pausar sesión
        </v-btn>
        <v-btn
          v-if="session && ['ACTIVE', 'PAUSED'].includes(session.status)"
          color="error"
          variant="tonal"
          prepend-icon="mdi-stop"
          :loading="completing"
          @click="guarded(completeSession)"
        >
          Finalizar sesión
        </v-btn>
      </div>
    </div>

    <v-card v-if="!session" variant="flat" class="start-panel pa-6">
      <v-row align="center">
        <v-col cols="12" md="7">
          <div class="text-h6 font-weight-bold mb-2">Iniciar lote de trabajo</div>
          <div class="text-body-2 text-medium-emphasis">
            El sistema te asignará un grupo de transferencias pendientes para auditarlas de forma exclusiva.
          </div>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="batchSize"
            :items="batchSizeOptions"
            label="Lote"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3" class="text-md-right">
          <v-btn color="primary" variant="flat" :loading="starting" class="start-session-button" @click="startNewSession">
            Iniciar sesión de auditoría
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <template v-else>
      <v-row>
        <v-col cols="12" lg="4" xl="3">
          <v-card variant="flat" class="queue-panel">
            <div class="queue-header">
              <div class="font-weight-bold">Cola asignada</div>
              <div class="queue-chips">
                <v-chip size="small" variant="tonal">{{ pendingItems.length }} pendientes</v-chip>
                <v-chip size="small" color="success" variant="tonal">{{ stats.auditedCount }} procesados</v-chip>
              </div>
            </div>

            <v-list density="compact" lines="two" class="py-0">
              <v-list-item
                v-for="(item, index) in items"
                :key="item._id"
                :class="['queue-item', `queue-item--${itemState(item)}`]"
                :disabled="itemState(item) === 'expired'"
                @click="item.status === 'AUDITADO' ? undefined : guarded(() => openItem(item._id))"
              >
                <template #prepend>
                  <v-icon :icon="itemIcon(item)" />
                </template>
                <v-list-item-title>
                  {{ index + 1 }}. {{ formatCurrency(item.amount, item.currency) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(item.transferDate || item.emailDate) }} · {{ item.status === 'AUDITADO' ? item.humanStatus : aiLabel(item.aiStatus) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8" xl="9">
          <template v-if="showSummary">
            <v-card variant="flat" class="summary-panel pa-6">
              <div class="text-h5 font-weight-bold mb-4">Lote completado</div>
              <v-row>
                <v-col cols="6" md="3"><strong>{{ processedCount }}</strong><div>procesados</div></v-col>
                <v-col cols="6" md="3"><strong>{{ summaryValidatedCount }}</strong><div>validados</div></v-col>
                <v-col cols="6" md="3"><strong>{{ summaryCorrectedCount }}</strong><div>corregidos</div></v-col>
                <v-col cols="6" md="3"><strong>{{ summaryDiscardedCount }}</strong><div>descartados</div></v-col>
              </v-row>
              <v-divider class="my-4" />
              <div class="text-body-2">Tiempo total: {{ elapsedText }}</div>
              <div class="text-body-2">Promedio por registro: {{ averageText }}</div>
              <div v-if="session?.status === 'ACTIVE'" class="mt-5 d-flex ga-2 flex-wrap">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  @click="requestMoreItems(batchSize)"
                >
                  Solicitar otro lote
                </v-btn>
                <v-btn
                  color="error"
                  variant="tonal"
                  prepend-icon="mdi-stop"
                  @click="finishSession"
                >
                  Finalizar sesión
                </v-btn>
              </div>
            </v-card>

            <v-card v-if="canStartNewSession" variant="flat" class="new-session-panel pa-4 mt-3">
              <div class="new-session-panel__content">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Nueva sesión</div>
                  <div class="text-body-2 text-medium-emphasis">Elegí la cantidad de registros para el próximo lote.</div>
                </div>
                <div class="new-session-panel__actions">
                  <v-select
                    v-model="batchSize"
                    :items="batchSizeOptions"
                    label="Lote"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="summary-batch-select"
                  />
                  <v-btn
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-play"
                    :loading="starting"
                    class="start-session-button"
                    @click="startNewSession"
                  >
                    Iniciar nueva sesión
                  </v-btn>
                </div>
              </div>
            </v-card>
          </template>

          <v-card v-else variant="flat" class="work-panel pa-6">
            <div class="text-h6 font-weight-bold mb-2">Registro actual</div>
            <div v-if="currentItem" class="text-body-2 text-medium-emphasis mb-4">
              {{ formatCurrency(currentItem.amount, currentItem.currency) }} · {{ aiLabel(currentItem.aiStatus) }}
            </div>
            <v-btn
              v-if="currentItem"
              color="primary"
              variant="flat"
              prepend-icon="mdi-open-in-app"
              @click="openItem(currentItem._id)"
            >
              Abrir auditoría
            </v-btn>
            <v-alert v-else type="info" variant="tonal">
              No hay registros pendientes asignados.
            </v-alert>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="isAuditModalOpen" fullscreen :scrim="false" transition="dialog-bottom-transition" class="audit-fullscreen-dialog">
      <v-card class="audit-modal">
        <v-toolbar density="compact" color="surface" class="audit-toolbar">
          <v-toolbar-title class="text-body-1">
            Transferencia {{ Math.max(items.findIndex((item) => item._id === currentItemId) + 1, 1) }} de {{ items.length }}
            <template v-if="currentItem"> · {{ formatCurrency(currentItem.amount, currentItem.currency) }} · {{ aiLabel(currentItem.aiStatus) }}</template>
            <v-chip v-if="isDirty" size="x-small" color="warning" variant="tonal" class="ml-2">Cambios sin guardar</v-chip>
          </v-toolbar-title>
          <v-btn icon="mdi-chevron-left" variant="text" title="Anterior (Alt + Flecha izquierda)" @click="guarded(moveToPrevious)" />
          <v-btn icon="mdi-content-save" variant="text" title="Guardar (Ctrl/Cmd + S)" @click="saveCurrent" />
          <v-btn icon="mdi-chevron-right" variant="text" title="Siguiente (Alt + Flecha derecha)" @click="guarded(moveToNext)" />
          <v-btn icon="mdi-close" variant="text" title="Cerrar (Escape)" @click="guarded(closeItem)" />
        </v-toolbar>

        <div class="audit-modal-content">
          <TransferEmail
            v-if="currentItem"
            ref="transferEmailRef"
            :transfer-email="currentItem"
            :audit-session-id="session?._id"
            @saved="handleSaved"
            @dirty-change="isDirty = $event"
          />
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog" max-width="420">
      <v-card>
        <v-card-title>Tenés cambios sin guardar.</v-card-title>
        <v-card-text>¿Querés salir y descartar los cambios?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Seguir auditando</v-btn>
          <v-btn color="error" variant="flat" @click="discardChangesAndContinue">Descartar cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay :model-value="loading" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </v-container>
</template>

<style scoped>
.session-header,
.session-actions,
.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.start-panel,
.queue-panel,
.summary-panel,
.new-session-panel,
.work-panel {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
  border-radius: 8px;
}

.queue-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.queue-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.queue-item {
  border-left: 4px solid transparent;
}

.queue-item--current {
  border-left-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.queue-item--completed {
  opacity: 0.72;
}

.queue-item--expired {
  opacity: 0.55;
}

.audit-fullscreen-dialog :deep(.v-overlay__content) {
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
}

.audit-modal {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.audit-toolbar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.audit-modal-content {
  height: calc(100vh - 48px);
  overflow: auto;
  padding: 16px;
}

.start-session-button {
  white-space: nowrap;
}

.summary-batch-select {
  max-width: 120px;
  min-width: 100px;
}

.new-session-panel__content,
.new-session-panel__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.new-session-panel__content {
  justify-content: space-between;
}

.new-session-panel__actions {
  justify-content: flex-end;
}
</style>
