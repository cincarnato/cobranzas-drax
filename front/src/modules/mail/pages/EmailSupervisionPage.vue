<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {
  EmailSupervisionAssignedEmail,
  EmailSupervisionDaily,
  EmailSupervisionLive,
  EmailSupervisionMonthly,
  EmailSupervisionOperator,
  EmailSupervisionOperatorStatus,
} from "@/modules/mail/interfaces/IEmailSupervision";
import MailboxProvider from "@/modules/mail/providers/MailboxProvider";
import EmailSupervisionProvider from "@/modules/mail/providers/EmailSupervisionProvider";
import SessionEmailProvider from "@/modules/mail/providers/SessionEmailProvider";
import MailboxSelector from "@/modules/mail/components/mailbox/MailboxSelector.vue";
import {
  EMAIL_SUPERVISION_POLLING_MS,
  SESSION_EMAIL_INACTIVITY_THRESHOLD_MS,
} from "@/modules/mail/constants/email-supervision";

type SortItem = {key: string, order?: "asc" | "desc"}
type SupervisionMode = "realtime" | "daily" | "monthly"
type SummaryCard = {label: string; value: number | Date | string | null | undefined; icon: string; color: string; type?: "number" | "datetime"}

const route = useRoute()
const router = useRouter()
const {t} = useI18n()

const mailboxes = ref<IMailbox[]>([])
const mailboxId = ref<string | null>((route.query.mailbox as string) || null)
const mode = ref<SupervisionMode>(parseMode(route.query.mode))
const dailyDate = ref((route.query.date as string) || formatDateInput(new Date()))
const monthlyMonth = ref((route.query.month as string) || formatMonthInput(new Date()))
const live = ref<EmailSupervisionLive | null>(null)
const daily = ref<EmailSupervisionDaily | null>(null)
const monthly = ref<EmailSupervisionMonthly | null>(null)
const assignedEmails = ref<EmailSupervisionAssignedEmail[]>([])
const selectedUserId = ref<string | null>(null)
const closeSessionDialog = ref(false)
const closeSessionOperator = ref<EmailSupervisionOperator | null>(null)
const includeWithoutSession = ref(false)
const statusFilter = ref<EmailSupervisionOperatorStatus | "ALL">("ALL")
const operatorSearch = ref("")
const sortBy = ref<SortItem[]>([])
const loadingMailboxes = ref(false)
const loadingInitial = ref(false)
const loadingDaily = ref(false)
const loadingAssignedEmails = ref(false)
const closingSession = ref(false)
const refreshError = ref("")
const now = ref(Date.now())

let pollingTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

const summary = computed(() => live.value?.summary || {
  activeOperators: 0,
  pausedOperators: 0,
  pendingEmails: 0,
  assignedEmails: 0,
  closedToday: 0,
  oldestPendingReceivedAt: null,
})
const summaryCards = computed<SummaryCard[]>(() => [
  ...(mode.value === "realtime" ? liveSummaryCards.value : accumulatedSummaryCards.value),
])
const liveSummaryCards = computed<SummaryCard[]>(() => [
  {label: t("mail.supervision.summary.activeOperators"), value: summary.value.activeOperators, icon: "mdi-account-check-outline", color: "success"},
  {label: t("mail.supervision.summary.pausedOperators"), value: summary.value.pausedOperators, icon: "mdi-pause-circle-outline", color: "warning"},
  {label: t("mail.supervision.summary.pendingEmails"), value: summary.value.pendingEmails, icon: "mdi-email-clock-outline", color: "info"},
  {label: t("mail.supervision.summary.oldestPending"), value: summary.value.oldestPendingReceivedAt, icon: "mdi-timer-sand", color: "deep-orange", type: "datetime"},
  {label: t("mail.supervision.summary.assignedEmails"), value: summary.value.assignedEmails, icon: "mdi-email-check-outline", color: "primary"},
  {label: t("mail.supervision.summary.closedToday"), value: summary.value.closedToday, icon: "mdi-email-seal-outline", color: "secondary"},
])
const accumulated = computed(() => mode.value === "monthly" ? monthly.value : daily.value)
const accumulatedSummary = computed(() => accumulated.value?.summary || {
  sessionCount: 0,
  operatorCount: 0,
  assignedCount: 0,
  repliedCount: 0,
  closedCount: 0,
  durationMs: 0,
})
const accumulatedSummaryCards = computed<SummaryCard[]>(() => [
  {label: t("mail.supervision.summary.dailySessions"), value: accumulatedSummary.value.sessionCount, icon: "mdi-calendar-clock-outline", color: "primary"},
  {label: t("mail.supervision.summary.dailyOperators"), value: accumulatedSummary.value.operatorCount, icon: "mdi-account-multiple-outline", color: "info"},
  {label: t("mail.supervision.summary.dailyAssigned"), value: accumulatedSummary.value.assignedCount, icon: "mdi-email-check-outline", color: "secondary"},
  {label: t("mail.supervision.summary.dailyReplied"), value: accumulatedSummary.value.repliedCount, icon: "mdi-reply-outline", color: "success"},
  {label: t("mail.supervision.summary.dailyClosed"), value: accumulatedSummary.value.closedCount, icon: "mdi-email-seal-outline", color: "warning"},
])
const headers = computed(() => [
  {title: t("mail.supervision.table.operator"), key: "operatorName", minWidth: "220px"},
  {title: t("mail.supervision.table.status"), key: "statusSort", minWidth: "140px"},
  {title: t("mail.supervision.table.session"), key: "durationMs", minWidth: "130px"},
  {title: t("mail.supervision.table.current"), key: "currentAssignedCount", minWidth: "110px"},
  {title: t("mail.supervision.table.assigned"), key: "assignedCount", minWidth: "130px"},
  {title: t("mail.supervision.table.replied"), key: "repliedCount", minWidth: "120px"},
  {title: t("mail.supervision.table.closed"), key: "closedCount", minWidth: "110px"},
  {title: t("mail.supervision.table.lastActivity"), key: "lastActivityMs", minWidth: "180px"},
  {title: t("mail.supervision.table.actions"), key: "actions", sortable: false, align: "end" as const, minWidth: "120px"},
])
const dailyHeaders = computed(() => [
  {title: t("mail.supervision.table.operator"), key: "operatorName", minWidth: "220px"},
  {title: t("mail.supervision.table.sessions"), key: "sessionCount", minWidth: "110px"},
  {title: t("mail.supervision.table.assigned"), key: "assignedCount", minWidth: "130px"},
  {title: t("mail.supervision.table.replied"), key: "repliedCount", minWidth: "120px"},
  {title: t("mail.supervision.table.closed"), key: "closedCount", minWidth: "110px"},
  {title: t("mail.supervision.table.duration"), key: "durationMs", minWidth: "130px"},
  {title: t("mail.supervision.table.firstSession"), key: "firstStartedAt", minWidth: "160px"},
  {title: t("mail.supervision.table.lastActivity"), key: "lastActivityAt", minWidth: "160px"},
])
const monthlyHeaders = computed(() => [
  {title: t("mail.supervision.table.operator"), key: "operatorName", minWidth: "220px"},
  {title: t("mail.supervision.table.sessions"), key: "sessionCount", minWidth: "110px"},
  {title: t("mail.supervision.table.assigned"), key: "assignedCount", minWidth: "130px"},
  {title: t("mail.supervision.table.replied"), key: "repliedCount", minWidth: "120px"},
  {title: t("mail.supervision.table.closed"), key: "closedCount", minWidth: "110px"},
  {title: t("mail.supervision.table.duration"), key: "durationMs", minWidth: "130px"},
  {title: t("mail.supervision.table.avgSessionsPerActiveDay"), key: "avgSessionsPerActiveDay", minWidth: "150px"},
  {title: t("mail.supervision.table.lastActivity"), key: "lastActivityAt", minWidth: "160px"},
])
const statusOptions = computed(() => [
  {title: t("mail.supervision.filters.all"), value: "ALL"},
  {title: t("mail.supervision.status.ACTIVE"), value: "ACTIVE"},
  {title: t("mail.supervision.status.PAUSED"), value: "PAUSED"},
  {title: t("mail.supervision.status.OUT_OF_SESSION"), value: "OUT_OF_SESSION"},
])
const tableRows = computed(() => {
  const rows = (live.value?.operators || []).map((operator) => {
    const sessionEmail = operator.sessionEmail
    return {
      ...operator,
      operatorName: operator.user.name || operator.user.email || operator.user.id,
      statusSort: getStatusOrder(operator.status),
      durationMs: sessionEmail?.startedAt ? Math.max(now.value - new Date(sessionEmail.startedAt).getTime(), 0) : -1,
      lastActivityMs: sessionEmail?.lastActivityAt ? new Date(sessionEmail.lastActivityAt).getTime() : 0,
      assignedCount: sessionEmail?.assignedCount || 0,
      repliedCount: sessionEmail?.repliedCount || 0,
      closedCount: sessionEmail?.closedCount || 0,
    }
  })
  const search = operatorSearch.value.trim().toLowerCase()
  const filtered = rows.filter((row) => {
    const matchesStatus = statusFilter.value === "ALL" || row.status === statusFilter.value
    const matchesSearch = !search || row.operatorName.toLowerCase().includes(search) || (row.user.email || "").toLowerCase().includes(search)
    return matchesStatus && matchesSearch
  })
  if (sortBy.value.length) return filtered
  return [...filtered].sort((a, b) => a.statusSort - b.statusSort || b.lastActivityMs - a.lastActivityMs || a.operatorName.localeCompare(b.operatorName))
})
const accumulatedRows = computed(() => {
  const rows = (accumulated.value?.operators || []).map((operator) => ({
    ...operator,
    operatorName: operator.user.name || operator.user.email || operator.user.id,
    avgSessionsPerActiveDay: averageSessionsPerActiveDay(operator.sessionCount),
  }))
  const search = operatorSearch.value.trim().toLowerCase()
  const filtered = rows.filter((row) => !search || row.operatorName.toLowerCase().includes(search) || (row.user.email || "").toLowerCase().includes(search))
  if (sortBy.value.length) return filtered
  return [...filtered].sort((a, b) => b.closedCount - a.closedCount || b.repliedCount - a.repliedCount || b.assignedCount - a.assignedCount || a.operatorName.localeCompare(b.operatorName))
})
const selectedOperator = computed(() => tableRows.value.find((row) => row.user.id === selectedUserId.value) || null)
const drawer = computed({
  get: () => Boolean(selectedUserId.value),
  set: (value: boolean) => {
    if (!value) closeDrawer()
  },
})
const emptyText = computed(() => includeWithoutSession.value
  ? t("mail.supervision.empty.withoutSession")
  : t("mail.supervision.empty.default"))
const modeInfoText = computed(() => mode.value === "daily"
  ? t("mail.supervision.modeInfo.daily")
  : mode.value === "monthly" ? t("mail.supervision.modeInfo.monthly") : t("mail.supervision.modeInfo.realtime"))
const closeSessionOperatorName = computed(() => {
  const operator = closeSessionOperator.value
  if (!operator) return ""
  return operator.user.name || operator.user.email || operator.user.id
})

watch(mailboxId, () => {
  closeDrawer()
  syncRoute()
  void fetchCurrentMode(true)
})

watch(includeWithoutSession, () => {
  closeDrawer()
  if (mode.value === "realtime") void fetchLive(false)
})

watch(mode, () => {
  closeDrawer()
  sortBy.value = []
  syncRoute()
  if (mode.value === "realtime") {
    void fetchLive(false)
    startPolling()
    return
  }
  stopPolling()
  void fetchAccumulated(true)
})

watch(dailyDate, () => {
  syncRoute()
  if (mode.value === "daily") void fetchDaily(true)
})

watch(monthlyMonth, () => {
  syncRoute()
  if (mode.value === "monthly") void fetchMonthly(true)
})

watch(selectedOperator, (operator) => {
  if (selectedUserId.value && !operator) closeDrawer()
})

onMounted(async () => {
  clockTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  document.addEventListener("visibilitychange", handleVisibilityChange)
  await fetchMailboxes()
  if (!mailboxId.value && mailboxes.value[0]) mailboxId.value = mailboxes.value[0]._id
  await fetchCurrentMode(true)
  if (mode.value === "realtime") startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
  if (clockTimer) clearInterval(clockTimer)
  document.removeEventListener("visibilitychange", handleVisibilityChange)
})

async function fetchMailboxes() {
  loadingMailboxes.value = true
  try {
    mailboxes.value = await MailboxProvider.instance.find({limit: 500, orderBy: "name", order: "asc"}) || []
    if (mailboxId.value && !mailboxes.value.some((mailbox) => mailbox._id === mailboxId.value)) mailboxId.value = null
  } finally {
    loadingMailboxes.value = false
  }
}

async function fetchLive(initial = false) {
  if (!mailboxId.value) return
  if (initial && !live.value) loadingInitial.value = true
  try {
    live.value = await EmailSupervisionProvider.instance.live(mailboxId.value, includeWithoutSession.value)
    refreshError.value = ""
  } catch {
    refreshError.value = t("mail.supervision.errors.refresh")
  } finally {
    loadingInitial.value = false
  }
}

async function fetchDaily(initial = false) {
  if (!mailboxId.value) return
  if (initial && !daily.value) loadingDaily.value = true
  try {
    daily.value = await EmailSupervisionProvider.instance.daily(mailboxId.value, dailyDate.value)
    refreshError.value = ""
  } catch {
    refreshError.value = t("mail.supervision.errors.refresh")
  } finally {
    loadingDaily.value = false
  }
}

async function fetchMonthly(initial = false) {
  if (!mailboxId.value) return
  if (initial && !monthly.value) loadingDaily.value = true
  try {
    monthly.value = await EmailSupervisionProvider.instance.monthly(mailboxId.value, monthlyMonth.value)
    refreshError.value = ""
  } catch {
    refreshError.value = t("mail.supervision.errors.refresh")
  } finally {
    loadingDaily.value = false
  }
}

async function fetchAccumulated(initial = false) {
  if (mode.value === "monthly") {
    await fetchMonthly(initial)
    return
  }
  await fetchDaily(initial)
}

async function fetchCurrentMode(initial = false) {
  if (mode.value === "daily") {
    await fetchDaily(initial)
    return
  }
  if (mode.value === "monthly") {
    await fetchMonthly(initial)
    return
  }
  await fetchLive(initial)
}

async function openOperator(operator: EmailSupervisionOperator) {
  selectedUserId.value = operator.user.id
  assignedEmails.value = []
  if (!mailboxId.value) return
  loadingAssignedEmails.value = true
  try {
    assignedEmails.value = await EmailSupervisionProvider.instance.assignedEmails(mailboxId.value, operator.user.id)
  } finally {
    loadingAssignedEmails.value = false
  }
}

function closeDrawer() {
  selectedUserId.value = null
  assignedEmails.value = []
}

function requestCloseOperatorSession(operator: EmailSupervisionOperator) {
  if (!operator.sessionEmail || operator.status === "OUT_OF_SESSION") return
  closeSessionOperator.value = operator
  closeSessionDialog.value = true
}

async function closeOperatorSession() {
  const sessionId = closeSessionOperator.value?.sessionEmail?._id
  if (!sessionId) return
  closingSession.value = true
  try {
    await SessionEmailProvider.instance.closeBySupervisor(sessionId)
    closeSessionDialog.value = false
    if (selectedUserId.value === closeSessionOperator.value?.user.id) closeDrawer()
    closeSessionOperator.value = null
    await fetchLive(false)
  } catch {
    refreshError.value = t("mail.supervision.errors.closeSession")
  } finally {
    closingSession.value = false
  }
}

function openEmail(email: EmailSupervisionAssignedEmail) {
  void router.push({name: "InboundEmailViewPage", params: {inboundEmailId: email._id}})
}

function handleRowClick(_event: MouseEvent, row: {item: EmailSupervisionOperator}) {
  if (mode.value !== "realtime") return
  void openOperator(row.item)
}

function startPolling() {
  stopPolling()
  if (document.hidden) return
  pollingTimer = setInterval(() => {
    void fetchLive(false)
  }, EMAIL_SUPERVISION_POLLING_MS)
}

function stopPolling() {
  if (pollingTimer) clearInterval(pollingTimer)
  pollingTimer = null
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling()
    return
  }
  if (mode.value === "realtime") {
    void fetchLive(false)
    startPolling()
  }
}

function syncRoute() {
  void router.replace({
    query: {
      mailbox: mailboxId.value || undefined,
      mode: mode.value !== "realtime" ? mode.value : undefined,
      date: mode.value === "daily" ? dailyDate.value : undefined,
      month: mode.value === "monthly" ? monthlyMonth.value : undefined,
    },
  })
}

function getStatusOrder(status: EmailSupervisionOperatorStatus) {
  if (status === "ACTIVE") return 1
  if (status === "PAUSED") return 2
  return 3
}

function statusColor(status: EmailSupervisionOperatorStatus) {
  if (status === "ACTIVE") return "success"
  if (status === "PAUSED") return "warning"
  return "grey"
}

function statusLabel(status: EmailSupervisionOperatorStatus) {
  return t(`mail.supervision.status.${status}`)
}

function isInactive(operator: EmailSupervisionOperator) {
  if (operator.status !== "ACTIVE" || !operator.sessionEmail?.lastActivityAt) return false
  return now.value - new Date(operator.sessionEmail.lastActivityAt).getTime() > SESSION_EMAIL_INACTIVITY_THRESHOLD_MS
}

function formatDuration(ms: number) {
  if (ms < 0) return "-"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0")
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0")
  const seconds = (totalSeconds % 60).toString().padStart(2, "0")
  return `${hours}:${minutes}:${seconds}`
}

function formatRelative(value?: Date | string | null) {
  if (!value) return t("mail.supervision.noActivity")
  const diffSeconds = Math.max(Math.floor((now.value - new Date(value).getTime()) / 1000), 0)
  if (diffSeconds < 15) return t("mail.supervision.now")
  if (diffSeconds < 60) return t("mail.supervision.secondsAgo", {count: diffSeconds})
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return t("mail.supervision.minutesAgo", {count: diffMinutes})
  const diffHours = Math.floor(diffMinutes / 60)
  return t("mail.supervision.hoursAgo", {count: diffHours})
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-AR", {dateStyle: "short", timeStyle: "short"}).format(new Date(value))
}

function formatTime(value?: Date | string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-AR", {timeStyle: "short"}).format(new Date(value))
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR").format(value || 0)
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("es-AR", {maximumFractionDigits: 1}).format(value || 0)
}

function averageSessionsPerActiveDay(sessionCount: number) {
  if (mode.value !== "monthly") return 0
  return Number(sessionCount || 0) / daysElapsedInSelectedMonth()
}

function daysElapsedInSelectedMonth() {
  const [year, month] = monthlyMonth.value.split("-").map(Number)
  if (!year || !month) return 1
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  if (isCurrentMonth) return Math.max(today.getDate(), 1)
  return new Date(year, month, 0).getDate()
}

function formatCardValue(card: {value: unknown, type?: string}) {
  if (card.type === "datetime") return formatDateTime(card.value as Date | string | null)
  return formatNumber(Number(card.value || 0))
}

function formatDateInput(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatMonthInput(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function parseMode(value: unknown): SupervisionMode {
  if (value === "daily" || value === "monthly") return value
  return "realtime"
}
</script>

<template>
  <v-container fluid class="pa-4 email-supervision">
    <v-row class="align-center mb-3" dense>
      <v-col cols="12" md="5">
        <div class="text-h5 font-weight-bold">{{ t("mail.supervision.title") }}</div>
        <div class="text-body-2 text-medium-emphasis">{{ t("mail.supervision.subtitle") }}</div>
      </v-col>
      <v-col cols="12" md="4">
        <MailboxSelector v-model="mailboxId" :mailboxes="mailboxes" :loading="loadingMailboxes" />
      </v-col>
      <v-col cols="12" md="3" class="d-flex justify-end">
        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loadingInitial || loadingDaily"
          @click="fetchCurrentMode(false)"
        >
          {{ t("mail.supervision.refresh") }}
        </v-btn>
      </v-col>
    </v-row>

    <v-tabs v-model="mode" color="primary" density="comfortable" class="mb-3">
      <v-tab value="realtime" prepend-icon="mdi-monitor-dashboard">{{ t("mail.supervision.modes.realtime") }}</v-tab>
      <v-tab value="daily" prepend-icon="mdi-calendar-today">{{ t("mail.supervision.modes.daily") }}</v-tab>
      <v-tab value="monthly" prepend-icon="mdi-calendar-month">{{ t("mail.supervision.modes.monthly") }}</v-tab>
    </v-tabs>

    <v-alert density="compact" variant="tonal" color="info" icon="mdi-information-outline" class="mb-3">
      {{ modeInfoText }}
    </v-alert>

    <v-alert v-if="refreshError" density="compact" type="warning" variant="tonal" class="mb-3">
      {{ refreshError }}
    </v-alert>

    <v-row dense class="mb-3">
      <v-col v-for="card in summaryCards" :key="card.label" cols="12" sm="6" md="4" lg>
        <v-card variant="flat" border class="summary-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
              <div :class="card.type === 'datetime' ? 'text-subtitle-1 font-weight-bold' : 'text-h5 font-weight-bold'">{{ formatCardValue(card) }}</div>
            </div>
            <v-avatar :color="card.color" variant="tonal" size="36">
              <v-icon :icon="card.icon" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="flat" border>
      <v-card-text class="pb-0">
        <v-row dense class="align-center">
          <v-col v-if="mode === 'realtime'" cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              :label="t('mail.supervision.filters.status')"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col :cols="12" :md="mode === 'realtime' ? 4 : 5">
            <v-text-field
              v-model="operatorSearch"
              :label="t('mail.supervision.filters.operator')"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col v-if="mode === 'daily'" cols="12" md="3">
            <v-text-field
              v-model="dailyDate"
              :label="t('mail.supervision.filters.date')"
              type="date"
              prepend-inner-icon="mdi-calendar"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col v-if="mode === 'monthly'" cols="12" md="3">
            <v-text-field
              v-model="monthlyMonth"
              :label="t('mail.supervision.filters.month')"
              type="month"
              prepend-inner-icon="mdi-calendar-month"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col v-if="mode === 'realtime'" cols="12" md="5" class="d-flex justify-end">
            <v-switch
              v-model="includeWithoutSession"
              :label="t('mail.supervision.filters.includeWithoutSession')"
              density="compact"
              color="primary"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-skeleton-loader v-if="mode === 'realtime' && loadingInitial" type="table" />
      <v-data-table
        v-else-if="mode === 'realtime'"
        v-model:sort-by="sortBy"
        :headers="headers"
        :items="tableRows"
        :items-per-page="25"
        hover
        density="comfortable"
        class="supervision-table"
        :no-data-text="emptyText"
        @click:row="handleRowClick"
      >
        <template #item.operatorName="{item}">
          <div class="font-weight-medium">{{ item.operatorName }}</div>
          <div v-if="item.user.email" class="text-caption text-medium-emphasis">{{ item.user.email }}</div>
        </template>
        <template #item.statusSort="{item}">
          <div class="d-flex flex-column ga-1">
            <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
              <v-icon icon="mdi-circle" size="10" start />
              {{ statusLabel(item.status) }}
            </v-chip>
            <span v-if="isInactive(item)" class="text-caption text-warning d-inline-flex align-center ga-1">
              <v-icon icon="mdi-alert-outline" size="14" />
              {{ t("mail.supervision.inactive") }}
            </span>
          </div>
        </template>
        <template #item.durationMs="{item}">
          {{ formatDuration(item.durationMs) }}
        </template>
        <template #item.currentAssignedCount="{item}">
          <span class="font-weight-medium">{{ item.currentAssignedCount }}</span>
          <span class="text-medium-emphasis"> / {{ item.sessionEmail?.maxAssignableEmails ?? "-" }}</span>
        </template>
        <template #item.assignedCount="{item}">
          {{ formatNumber(item.assignedCount) }}
        </template>
        <template #item.repliedCount="{item}">
          {{ formatNumber(item.repliedCount) }}
        </template>
        <template #item.closedCount="{item}">
          {{ formatNumber(item.closedCount) }}
        </template>
        <template #item.lastActivityMs="{item}">
          {{ item.sessionEmail ? formatRelative(item.sessionEmail.lastActivityAt) : "-" }}
        </template>
        <template #item.actions="{item}">
          <v-btn
            v-if="item.sessionEmail"
            size="small"
            variant="tonal"
            color="error"
            prepend-icon="mdi-stop-circle-outline"
            :loading="closingSession && closeSessionOperator?.user.id === item.user.id"
            @click.stop="requestCloseOperatorSession(item)"
          >
            {{ t("mail.supervision.actions.closeSession") }}
          </v-btn>
        </template>
      </v-data-table>

      <v-skeleton-loader v-else-if="loadingDaily" type="table" />
      <v-data-table
        v-else
        v-model:sort-by="sortBy"
        :headers="mode === 'monthly' ? monthlyHeaders : dailyHeaders"
        :items="accumulatedRows"
        :items-per-page="25"
        density="comfortable"
        :no-data-text="mode === 'monthly' ? t('mail.supervision.empty.monthly') : t('mail.supervision.empty.daily')"
      >
        <template #item.operatorName="{item}">
          <div class="font-weight-medium">{{ item.operatorName }}</div>
          <div v-if="item.user.email" class="text-caption text-medium-emphasis">{{ item.user.email }}</div>
        </template>
        <template #item.sessionCount="{item}">
          {{ formatNumber(item.sessionCount) }}
        </template>
        <template #item.assignedCount="{item}">
          {{ formatNumber(item.assignedCount) }}
        </template>
        <template #item.repliedCount="{item}">
          {{ formatNumber(item.repliedCount) }}
        </template>
        <template #item.closedCount="{item}">
          {{ formatNumber(item.closedCount) }}
        </template>
        <template #item.durationMs="{item}">
          {{ formatDuration(item.durationMs) }}
        </template>
        <template #item.firstStartedAt="{item}">
          {{ formatTime(item.firstStartedAt) }}
        </template>
        <template #item.avgSessionsPerActiveDay="{item}">
          {{ formatDecimal(item.avgSessionsPerActiveDay) }}
        </template>
        <template #item.lastActivityAt="{item}">
          {{ formatTime(item.lastActivityAt) }}
        </template>
      </v-data-table>
    </v-card>

    <v-navigation-drawer v-model="drawer" location="right" temporary width="420">
      <template v-if="selectedOperator">
        <v-toolbar density="compact" color="surface">
          <v-toolbar-title class="text-subtitle-1">{{ selectedOperator.operatorName }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeDrawer" />
        </v-toolbar>
        <div class="pa-4">
          <v-chip :color="statusColor(selectedOperator.status)" size="small" variant="tonal" class="mb-3">
            <v-icon icon="mdi-circle" size="10" start />
            {{ statusLabel(selectedOperator.status) }}
          </v-chip>

          <v-list density="compact" class="mb-3">
            <v-list-item :title="t('mail.supervision.detail.startedAt')" :subtitle="formatDateTime(selectedOperator.sessionEmail?.startedAt)" />
            <v-list-item :title="t('mail.supervision.detail.duration')" :subtitle="formatDuration(selectedOperator.durationMs)" />
            <v-list-item :title="t('mail.supervision.detail.lastActivity')" :subtitle="selectedOperator.sessionEmail ? formatRelative(selectedOperator.sessionEmail.lastActivityAt) : t('mail.supervision.noActivity')" />
          </v-list>

          <div class="text-subtitle-2 mb-2">{{ t("mail.supervision.detail.capacity") }}</div>
          <v-progress-linear
            :model-value="selectedOperator.sessionEmail?.maxAssignableEmails ? (selectedOperator.currentAssignedCount / selectedOperator.sessionEmail.maxAssignableEmails) * 100 : 0"
            height="10"
            rounded
            color="primary"
            class="mb-1"
          />
          <div class="text-body-2 mb-4">
            {{ selectedOperator.currentAssignedCount }} / {{ selectedOperator.sessionEmail?.maxAssignableEmails ?? "-" }}
          </div>

          <v-row dense class="mb-4">
            <v-col cols="4">
              <v-card variant="tonal" class="metric-card">
                <div class="text-caption">{{ t("mail.supervision.table.assigned") }}</div>
                <div class="text-h6">{{ formatNumber(selectedOperator.assignedCount) }}</div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card variant="tonal" class="metric-card">
                <div class="text-caption">{{ t("mail.supervision.table.replied") }}</div>
                <div class="text-h6">{{ formatNumber(selectedOperator.repliedCount) }}</div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card variant="tonal" class="metric-card">
                <div class="text-caption">{{ t("mail.supervision.table.closed") }}</div>
                <div class="text-h6">{{ formatNumber(selectedOperator.closedCount) }}</div>
              </v-card>
            </v-col>
          </v-row>

          <div class="text-subtitle-2 mb-2">{{ t("mail.supervision.detail.currentCases") }}</div>
          <v-skeleton-loader v-if="loadingAssignedEmails" type="list-item-three-line@3" />
          <v-list v-else lines="three" density="compact">
            <v-list-item
              v-for="email in assignedEmails"
              :key="email._id"
              :title="email.subject || t('mail.supervision.noSubject')"
              :subtitle="`${email.fromName || email.fromEmail || '-'} - ${t('mail.supervision.assigned')} ${formatRelative(email.assignedAt)}`"
              @click="openEmail(email)"
            >
              <template #append>
                <div class="d-flex flex-column align-end ga-1">
                  <v-chip v-if="email.category" size="x-small" variant="tonal">{{ email.category }}</v-chip>
                  <v-chip v-if="email.priority" size="x-small" variant="tonal" color="warning">{{ email.priority }}</v-chip>
                </div>
              </template>
            </v-list-item>
            <v-list-item v-if="!assignedEmails.length" :title="t('mail.supervision.detail.noCases')" />
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>

    <v-dialog v-model="closeSessionDialog" max-width="480">
      <v-card>
        <v-card-title>{{ t("mail.supervision.closeSession.title") }}</v-card-title>
        <v-card-text>
          {{ t("mail.supervision.closeSession.message", {operator: closeSessionOperatorName}) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="closingSession" @click="closeSessionDialog = false">
            {{ t("mail.supervision.closeSession.cancel") }}
          </v-btn>
          <v-btn color="error" :loading="closingSession" @click="closeOperatorSession">
            {{ t("mail.supervision.closeSession.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.email-supervision {
  min-height: 100%;
}

.summary-card {
  border-radius: 8px;
  padding: 14px;
}

.metric-card {
  border-radius: 8px;
  padding: 10px;
}

.supervision-table :deep(tbody tr) {
  cursor: pointer;
}
</style>
