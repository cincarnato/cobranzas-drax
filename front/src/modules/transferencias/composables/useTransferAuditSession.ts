import {computed, ref} from "vue";
import TransferAuditSessionProvider from "../providers/TransferAuditSessionProvider";
import type {
  ITransferAuditSession,
  ITransferAuditSessionState,
  ITransferAuditSessionStats
} from "../interfaces/ITransferAuditSession";
import type {ITransferEmail} from "../interfaces/ITransferEmail";

const session = ref<ITransferAuditSession | null>(null)
const items = ref<ITransferEmail[]>([])
const currentItemId = ref<string | null>(null)
const loading = ref(false)
const starting = ref(false)
const completing = ref(false)
const heartbeatError = ref('')
const errorMessage = ref('')
const isAuditModalOpen = ref(false)
const isDirty = ref(false)
const lastCompletedSession = ref<ITransferAuditSession | null>(null)
const lastCompletedItems = ref<ITransferEmail[]>([])
const auditedItemIds = ref<Set<string>>(new Set())
const countedHumanStatusByItem = ref<Map<string, ITransferEmail['humanStatus']>>(new Map())
const stats = ref<ITransferAuditSessionStats>({
  assignedCount: 0,
  auditedCount: 0,
  pendingCount: 0,
  validatedCount: 0,
  correctedCount: 0,
  discardedCount: 0,
  referredCount: 0,
})

const currentItem = computed(() => items.value.find((item) => item._id === currentItemId.value) || null)
const pendingItems = computed(() => items.value.filter((item) => item.status !== 'AUDITADO'))
const completedItems = computed(() => items.value.filter((item) => item.status === 'AUDITADO'))
const isCompleted = computed(() => Boolean(session.value && items.value.length > 0 && pendingItems.value.length === 0))

function applyState(state: ITransferAuditSessionState) {
  session.value = state.session
  items.value = state.items || []
  seedCountedItems(items.value)
  stats.value = resolveStats(state)
  currentItemId.value = state.currentItemId || currentItemId.value || pendingItems.value[0]?._id || null
  if (state.session?.status === 'COMPLETED') {
    lastCompletedSession.value = state.session
    lastCompletedItems.value = state.items || []
  }
}

function seedCountedItems(sourceItems: ITransferEmail[]) {
  const nextAuditedItemIds = new Set(auditedItemIds.value)
  const nextHumanStatusByItem = new Map(countedHumanStatusByItem.value)

  for (const item of sourceItems) {
    if (item.status !== 'AUDITADO') continue
    nextAuditedItemIds.add(item._id)
    nextHumanStatusByItem.set(item._id, item.humanStatus)
  }

  auditedItemIds.value = nextAuditedItemIds
  countedHumanStatusByItem.value = nextHumanStatusByItem
}

function resolveStats(state: ITransferAuditSessionState): ITransferAuditSessionStats {
  const fallbackItems = state.items || []
  const itemStats = buildItemStats(fallbackItems)

  return {
    assignedCount: Math.max(state.stats?.assignedCount || 0, state.session?.assignedCount || 0, fallbackItems.length, stats.value.assignedCount),
    auditedCount: Math.max(state.stats?.auditedCount || 0, state.session?.auditedCount || 0, itemStats.auditedCount, stats.value.auditedCount),
    pendingCount: state.stats?.pendingCount ?? itemStats.pendingCount,
    validatedCount: Math.max(state.stats?.validatedCount || 0, state.session?.validatedCount || 0, itemStats.validatedCount, stats.value.validatedCount),
    correctedCount: Math.max(state.stats?.correctedCount || 0, state.session?.correctedCount || 0, itemStats.correctedCount, stats.value.correctedCount),
    discardedCount: Math.max(state.stats?.discardedCount || 0, state.session?.discardedCount || 0, itemStats.discardedCount, stats.value.discardedCount),
    referredCount: Math.max(state.stats?.referredCount || 0, state.session?.referredCount || 0, itemStats.referredCount, stats.value.referredCount),
  }
}

function buildItemStats(sourceItems: ITransferEmail[]): ITransferAuditSessionStats {
  const audited = sourceItems.filter((item) => item.status === 'AUDITADO')
  return {
    assignedCount: sourceItems.length,
    auditedCount: audited.length,
    pendingCount: sourceItems.filter((item) => item.status !== 'AUDITADO').length,
    validatedCount: sourceItems.filter((item) => item.humanStatus === 'VALIDADO').length,
    correctedCount: sourceItems.filter((item) => item.humanStatus === 'CORREGIDO').length,
    discardedCount: sourceItems.filter((item) => item.humanStatus === 'DESCARTADO').length,
    referredCount: 0,
  }
}

async function loadActiveSession() {
  loading.value = true
  errorMessage.value = ''
  try {
    applyState(await TransferAuditSessionProvider.instance.active())
  } catch (error) {
    console.error('Error loading transfer audit session:', error)
    errorMessage.value = 'No se pudo cargar la sesión de auditoría.'
  } finally {
    loading.value = false
  }
}

async function startSession(batchSize = 5) {
  starting.value = true
  errorMessage.value = ''
  try {
    session.value = null
    items.value = []
    currentItemId.value = null
    isAuditModalOpen.value = false
    isDirty.value = false
    auditedItemIds.value = new Set()
    countedHumanStatusByItem.value = new Map()
    stats.value = buildItemStats([])
    applyState(await TransferAuditSessionProvider.instance.start(batchSize))
  } catch (error) {
    console.error('Error starting transfer audit session:', error)
    errorMessage.value = 'No se pudo iniciar la sesión.'
  } finally {
    starting.value = false
  }
}

async function pauseSession() {
  if (!session.value) return
  loading.value = true
  try {
    applyState(await TransferAuditSessionProvider.instance.pause(session.value._id))
    isAuditModalOpen.value = false
  } finally {
    loading.value = false
  }
}

async function resumeSession() {
  if (!session.value) return
  loading.value = true
  try {
    applyState(await TransferAuditSessionProvider.instance.resume(session.value._id))
  } finally {
    loading.value = false
  }
}

async function completeSession() {
  if (!session.value) return
  completing.value = true
  try {
    applyState(await TransferAuditSessionProvider.instance.complete(session.value._id))
    isAuditModalOpen.value = false
  } finally {
    completing.value = false
  }
}

async function requestMoreItems(batchSize = 5) {
  if (!session.value) return
  loading.value = true
  try {
    applyState(await TransferAuditSessionProvider.instance.requestMore(session.value._id, batchSize))
  } finally {
    loading.value = false
  }
}

function openItem(id: string) {
  currentItemId.value = id
  isAuditModalOpen.value = true
}

function closeItem() {
  isAuditModalOpen.value = false
}

function moveToNext() {
  if (!items.value.length || !currentItemId.value) return
  const currentIndex = items.value.findIndex((item) => item._id === currentItemId.value)
  const next = items.value.slice(currentIndex + 1).find((item) => item.status !== 'AUDITADO')
  if (next) currentItemId.value = next._id
}

function moveToPrevious() {
  if (!items.value.length || !currentItemId.value) return
  const currentIndex = items.value.findIndex((item) => item._id === currentItemId.value)
  const previous = items.value.slice(0, currentIndex).reverse().find((item) => item.status !== 'AUDITADO')
  if (previous) currentItemId.value = previous._id
}

function markSaved(updated: ITransferEmail) {
  const index = items.value.findIndex((item) => item._id === updated._id)
  if (index >= 0) items.value[index] = updated
  updateStatsFromSavedItem(updated)
  isDirty.value = false

  const next = pendingItems.value.find((item) => item._id !== updated._id)
  if (next) {
    currentItemId.value = next._id
    isAuditModalOpen.value = true
  } else {
    isAuditModalOpen.value = false
  }
}

function updateStatsFromSavedItem(updated: ITransferEmail) {
  const wasAudited = auditedItemIds.value.has(updated._id)
  const isAudited = updated.status === 'AUDITADO'
  if (!wasAudited && isAudited) {
    stats.value.auditedCount += 1
    stats.value.pendingCount = Math.max(0, stats.value.pendingCount - 1)
    auditedItemIds.value.add(updated._id)
  }

  const previousHumanStatus = countedHumanStatusByItem.value.get(updated._id)
  if (previousHumanStatus && previousHumanStatus !== updated.humanStatus) {
    decrementHumanStatus(previousHumanStatus)
  }

  if (isAudited && updated.humanStatus && previousHumanStatus !== updated.humanStatus) {
    incrementHumanStatus(updated.humanStatus)
    countedHumanStatusByItem.value.set(updated._id, updated.humanStatus)
  }

  if (session.value) {
    session.value.auditedCount = stats.value.auditedCount
    session.value.validatedCount = stats.value.validatedCount
    session.value.correctedCount = stats.value.correctedCount
    session.value.discardedCount = stats.value.discardedCount
    session.value.referredCount = stats.value.referredCount
  }
}

function incrementHumanStatus(humanStatus: ITransferEmail['humanStatus']) {
  if (humanStatus === 'VALIDADO') stats.value.validatedCount += 1
  if (humanStatus === 'CORREGIDO') stats.value.correctedCount += 1
  if (humanStatus === 'DESCARTADO') stats.value.discardedCount += 1
}

function decrementHumanStatus(humanStatus: ITransferEmail['humanStatus']) {
  if (humanStatus === 'VALIDADO') stats.value.validatedCount = Math.max(0, stats.value.validatedCount - 1)
  if (humanStatus === 'CORREGIDO') stats.value.correctedCount = Math.max(0, stats.value.correctedCount - 1)
  if (humanStatus === 'DESCARTADO') stats.value.discardedCount = Math.max(0, stats.value.discardedCount - 1)
}

async function sendHeartbeat() {
  if (!session.value || session.value.status !== 'ACTIVE') return
  try {
    heartbeatError.value = ''
    applyState(await TransferAuditSessionProvider.instance.heartbeat(session.value._id))
  } catch (error) {
    console.error('Transfer audit session heartbeat failed:', error)
    heartbeatError.value = 'No se pudo renovar la sesión. Revisá la conexión antes de guardar.'
  }
}

export function useTransferAuditSession() {
  return {
    session,
    items,
    stats,
    lastCompletedSession,
    lastCompletedItems,
    currentItemId,
    currentItem,
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
  }
}
