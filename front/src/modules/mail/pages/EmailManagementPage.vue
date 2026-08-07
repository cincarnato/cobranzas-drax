<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAuth, useAuthStore} from "@drax/identity-vue";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {IOutboundEmail} from "@/modules/mail/interfaces/IOutboundEmail";
import type {IMailboxUserSetting} from "@/modules/mail/interfaces/IMailboxUserSetting";
import type {
  EmailDensity,
  EmailManagementDetail,
  EmailManagementFilters,
  EmailManagementListItem,
  EmailManagementView,
} from "@/modules/mail/interfaces/IEmailManagement";
import MailboxProvider from "@/modules/mail/providers/MailboxProvider";
import EmailManagementProvider from "@/modules/mail/providers/EmailManagementProvider";
import OutboundEmailProvider from "@/modules/mail/providers/OutboundEmailProvider";
import MailboxUserSettingProvider from "@/modules/mail/providers/MailboxUserSettingProvider";
import SessionEmailProvider from "@/modules/mail/providers/SessionEmailProvider";
import type {SessionEmailState} from "@/modules/mail/interfaces/ISessionEmail";
import {useMailboxAiOptions} from "@/modules/mail/composables/useMailboxAiOptions";
import EmailSidebar from "@/modules/mail/components/mailbox/EmailSidebar.vue";
import EmailToolbar from "@/modules/mail/components/mailbox/EmailToolbar.vue";
import EmailList from "@/modules/mail/components/mailbox/EmailList.vue";
import OutboundEmailList from "@/modules/mail/components/mailbox/OutboundEmailList.vue";
import OutboundEmailDetail from "@/modules/mail/components/mailbox/OutboundEmailDetail.vue";
import EmailDetail from "@/modules/mail/components/mailbox/EmailDetail.vue";
import InboundEmailReplyComposer from "@/modules/mail/components/InboundEmailReplyComposer.vue";
import MailboxUserSettingsDialog from "@/modules/mail/components/mailbox/MailboxUserSettingsDialog.vue";

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const authStore = useAuthStore()
const {optionNames} = useMailboxAiOptions()

const mailboxes = ref<IMailbox[]>([])
const mailboxId = ref<string | null>((route.query.mailbox as string) || null)
const view = ref<EmailManagementView>((route.query.view as EmailManagementView) || "PENDING")
const search = ref((route.query.search as string) || "")
const debouncedSearch = ref(search.value)
const page = ref(Number(route.query.page || 1))
const pageSize = ref(25)
const density = ref<EmailDensity>("comfortable")
const filters = ref<EmailManagementFilters>({
  category: route.query.category as string || undefined,
  priorities: route.query.priority ? String(route.query.priority).split(",") : [],
  assignedTo: route.query.assignedTo as string || undefined,
  dateFrom: undefined,
  dateTo: undefined,
  hasAttachments: undefined,
  withoutReply: undefined,
  tags: [],
})

const items = ref<EmailManagementListItem[]>([])
const outboundItems = ref<IOutboundEmail[]>([])
const selectedOutboundEmail = ref<IOutboundEmail | null>(null)
const totalPages = ref(1)
const totalItems = ref(0)
const selectedId = ref<string | null>(null)
const detail = ref<EmailManagementDetail | null>(null)
const counts = ref<Record<string, number>>({})
const loadingMailboxes = ref(false)
const loadingList = ref(false)
const loadingDetail = ref(false)
const actionLoading = ref(false)
const saving = ref(false)
const detailNavigationLoading = ref(false)
const autoAdvanceLoading = ref(false)
const sessionEmailState = ref<SessionEmailState | null>(null)
const sessionEmailLoading = ref(false)
const closeSessionEmailDialog = ref(false)
const composeOpen = ref(false)
const mailboxSettingsDialog = ref(false)
const mailboxUserSettings = ref<IMailboxUserSetting | null>(null)
const mailboxUserSettingsLoading = ref(false)
const mailboxUserSettingsSaving = ref(false)
const listError = ref("")
const detailError = ref("")
const snackbar = ref({show: false, text: "", color: "info"})
const routeInboundEmailId = ref(queryParamToString(route.query.inboundEmail))
let searchTimer: ReturnType<typeof setTimeout> | null = null
let countsTimer: ReturnType<typeof setInterval> | null = null
let skipNextListWatch = false

const currentUser = computed(() => authStore.authUser)
const currentUserId = computed(() => (currentUser.value as any)?._id || currentUser.value?.id)
const selectedMailbox = computed(() => mailboxes.value.find((item) => item._id === mailboxId.value) || null)
const selectedListIndex = computed(() => selectedId.value ? items.value.findIndex((item) => item._id === selectedId.value) : -1)
const canNavigatePreviousEmail = computed(() => view.value !== "SENT" && selectedListIndex.value !== -1 && (selectedListIndex.value > 0 || page.value > 1))
const canNavigateNextEmail = computed(() => view.value !== "SENT" && selectedListIndex.value !== -1 && (selectedListIndex.value < items.value.length - 1 || page.value < totalPages.value))
const isSupervisor = computed(() => auth.hasPermission("inboundemail:manage"))
const baseCanUpdate = computed(() => auth.hasPermission("inboundemail:update") || isSupervisor.value)
const canAssignOperator = computed(() => auth.hasPermission("inboundemail:assign") || isSupervisor.value)
const canAssignToMe = computed(() => auth.hasPermission("inboundemail:assign-to-me") || isSupervisor.value)
const canReopenEmail = computed(() => auth.hasPermission("inboundemail:reopen") || isSupervisor.value)
const detailPermissions = computed(() => {
  const email = detail.value?.inboundEmail
  const assignedTo = typeof email?.assignedTo === "object" ? email?.assignedTo?._id : email?.assignedTo
  const assignedToMe = Boolean(assignedTo && currentUserId.value && String(assignedTo) === String(currentUserId.value))
  const openAndAssigned = email?.attentionStatus !== "CLOSED" && (assignedToMe || isSupervisor.value)
  const canManageDetailMailbox = canManageMailbox(detail.value?.mailbox || selectedMailbox.value)
  return {
    canAssign: canAssignToMe.value && canManageDetailMailbox,
    canReassign: canAssignOperator.value && canManageDetailMailbox,
    canReply: baseCanUpdate.value && canManageDetailMailbox && email?.attentionStatus !== "CLOSED" && Boolean(assignedToMe),
    canClose: baseCanUpdate.value && canManageDetailMailbox && Boolean(openAndAssigned) && Boolean(assignedToMe),
    canReopen: canReopenEmail.value && canAssignToMe.value && baseCanUpdate.value && canManageDetailMailbox && email?.attentionStatus === "CLOSED",
    canViewTechnicalDetails: isSupervisor.value,
  }
})
const emptyText = computed(() => {
  if (view.value === "SENT") return "No hay correos enviados."
  if (view.value === "PENDING") return "No hay correos pendientes."
  if (search.value || filters.value.category || filters.value.priorities.length || filters.value.tags.length) return "No encontramos correos con estos filtros."
  return "No hay correos para mostrar."
})

watch(search, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value
    page.value = 1
  }, 350)
})

watch([mailboxId, view, page, pageSize, debouncedSearch, filters], () => {
  if (skipNextListWatch) {
    skipNextListWatch = false
    syncRoute()
    return
  }
  syncRoute()
  void fetchList()
}, {deep: true})

watch(() => route.query.inboundEmail, (value) => {
  const inboundEmailId = queryParamToString(value)
  routeInboundEmailId.value = inboundEmailId
  if (inboundEmailId && inboundEmailId !== selectedId.value) {
    void openInboundEmailFromRoute(inboundEmailId)
  }
})

watch(mailboxId, () => {
  page.value = 1
  selectedId.value = null
  detail.value = null
  closeCompose()
  keepCompatibleFilters()
  void fetchSessionEmail()
  void fetchMailboxUserSettings()
  mailboxSettingsDialog.value = false
  void fetchCounts()
  startCountsPolling()
})

onMounted(async () => {
  await fetchMailboxes()
  if (routeInboundEmailId.value) {
    await openInboundEmailFromRoute(routeInboundEmailId.value)
  }
  if (!routeInboundEmailId.value && !mailboxId.value && mailboxes.value[0]) mailboxId.value = mailboxes.value[0]._id
  await fetchMailboxUserSettings()
  await fetchSessionEmail()
  await fetchList()
  await fetchCounts()
  startCountsPolling()
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (countsTimer) clearInterval(countsTimer)
})

async function fetchMailboxes() {
  loadingMailboxes.value = true
  try {
    const result = await MailboxProvider.instance.find({limit: 200, orderBy: "name", order: "asc"})
    mailboxes.value = (result || []).filter((mailbox: IMailbox) => canManageMailbox(mailbox))
    if (mailboxId.value && !mailboxes.value.some((mailbox) => mailbox._id === mailboxId.value)) {
      mailboxId.value = null
    }
  } catch {
    notify("No se pudieron cargar los mailboxes.", "error")
  } finally {
    loadingMailboxes.value = false
  }
}

async function fetchSessionEmail() {
  if (!mailboxId.value) {
    sessionEmailState.value = null
    return
  }
  try {
    sessionEmailState.value = await SessionEmailProvider.instance.current(mailboxId.value)
  } catch {
    sessionEmailState.value = null
  }
}

async function fetchMailboxUserSettings(showError = false) {
  if (!mailboxId.value) {
    mailboxUserSettings.value = null
    return
  }
  try {
    mailboxUserSettings.value = await MailboxUserSettingProvider.instance.current(mailboxId.value)
  } catch {
    mailboxUserSettings.value = null
    if (showError) notify("No se pudo cargar la configuración del mailbox.", "error")
  }
}

async function fetchList() {
  if (!mailboxId.value) return
  loadingList.value = true
  listError.value = ""
  try {
    if (view.value === "SENT") {
      items.value = []
      selectedOutboundEmail.value = null
      const result = await OutboundEmailProvider.instance.standalone(mailboxId.value, page.value, pageSize.value)
      outboundItems.value = result.items || []
      totalItems.value = result.totalItems || 0
      totalPages.value = result.totalPages || 1
      return
    }
    outboundItems.value = []
    const result = await EmailManagementProvider.instance.list({
      mailboxId: mailboxId.value,
      view: view.value,
      search: debouncedSearch.value,
      page: page.value,
      pageSize: pageSize.value,
      ...filters.value,
    })
    items.value = result.items || []
    totalItems.value = result.totalItems || 0
    totalPages.value = result.totalPages || 1
    if (selectedId.value) {
      const updated = items.value.find((item) => item._id === selectedId.value)
      if (updated && detail.value) detail.value.inboundEmail = {...detail.value.inboundEmail, ...updated}
    }
  } catch {
    items.value = []
    outboundItems.value = []
    listError.value = "No se pudo cargar el listado de correos."
  } finally {
    loadingList.value = false
  }
}

async function fetchCounts() {
  const currentMailboxId = mailboxId.value
  if (!currentMailboxId) {
    counts.value = {}
    return
  }
  try {
    const nextCounts = await EmailManagementProvider.instance.counts(currentMailboxId)
    if (mailboxId.value === currentMailboxId) counts.value = nextCounts
  } catch {
    // Keep the last known counters; the list refresh path reports its own errors.
  }
}

function startCountsPolling() {
  if (countsTimer) {
    clearInterval(countsTimer)
    countsTimer = null
  }
  if (!mailboxId.value) return
  countsTimer = setInterval(() => {
    void fetchCounts()
  }, 60000)
}

async function openEmail(email: EmailManagementListItem) {
  selectedId.value = email._id
  if (!email.userState?.isRead) {
    email.userState = await EmailManagementProvider.instance.updateUserState(email._id, {isRead: true})
  }
  await fetchDetail(email._id)
}

async function navigateDetail(direction: "previous" | "next") {
  if (detailNavigationLoading.value || loadingList.value || loadingDetail.value || view.value === "SENT") return

  const currentIndex = selectedListIndex.value
  if (currentIndex === -1) return

  detailNavigationLoading.value = true
  try {
    if (direction === "previous") {
      if (currentIndex > 0) {
        await openEmail(items.value[currentIndex - 1])
        return
      }
      if (page.value <= 1) return
      await openAdjacentEmailFromPage(page.value - 1, "last")
      return
    }

    if (currentIndex < items.value.length - 1) {
      await openEmail(items.value[currentIndex + 1])
      return
    }
    if (page.value >= totalPages.value) return
    await openAdjacentEmailFromPage(page.value + 1, "first")
  } finally {
    detailNavigationLoading.value = false
  }
}

async function openAdjacentEmailFromPage(targetPage: number, position: "first" | "last") {
  skipNextListWatch = true
  page.value = targetPage
  await nextTick()
  await fetchList()
  const target = position === "first" ? items.value[0] : items.value[items.value.length - 1]
  if (target) await openEmail(target)
}

async function fetchDetail(id = selectedId.value) {
  if (!id) return
  loadingDetail.value = true
  detailError.value = ""
  try {
    detail.value = await EmailManagementProvider.instance.detail(id)
  } catch {
    detailError.value = "No se pudo cargar el detalle del correo."
  } finally {
    loadingDetail.value = false
  }
}

async function openInboundEmailFromRoute(id: string) {
  if (!id) return
  selectedId.value = id
  loadingDetail.value = true
  detailError.value = ""
  try {
    const result = await EmailManagementProvider.instance.detail(id)
    const detailMailboxId = result.mailbox?._id
    if (detailMailboxId && mailboxId.value !== detailMailboxId) {
      mailboxId.value = detailMailboxId
      await nextTick()
    }
    selectedId.value = id
    detail.value = result
    if (!result.inboundEmail.userState?.isRead) {
      result.inboundEmail.userState = await EmailManagementProvider.instance.updateUserState(id, {isRead: true})
    }
  } catch {
    selectedId.value = id
    detail.value = null
    detailError.value = "El email entrante no fue encontrado."
    notify(detailError.value, "warning")
  } finally {
    loadingDetail.value = false
  }
}

async function toggleStar(email: EmailManagementListItem) {
  const previous = Boolean(email.userState?.isStarred)
  email.userState = {...email.userState, isStarred: !previous} as any
  try {
    email.userState = await EmailManagementProvider.instance.updateUserState(email._id, {isStarred: !previous})
  } catch {
    email.userState = {...email.userState, isStarred: previous} as any
    notify("No se pudo actualizar el destacado.", "error")
  }
}

async function assignToMe() {
  if (!selectedId.value) return
  const email = detail.value?.inboundEmail
  const assignedTo = typeof email?.assignedTo === "object" ? email?.assignedTo?._id : email?.assignedTo
  if (assignedTo && currentUserId.value && String(assignedTo) === String(currentUserId.value)) return
  actionLoading.value = true
  try {
    await EmailManagementProvider.instance.assignToMe(selectedId.value, {force: Boolean(assignedTo)})
    await Promise.all([fetchDetail(), fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Correo asignado.")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo tomar el correo.", "warning")
    await Promise.all([fetchDetail(), fetchList(), fetchCounts(), fetchSessionEmail()])
  } finally {
    actionLoading.value = false
  }
}

async function saveClassification(payload: any) {
  if (!selectedId.value) return
  saving.value = true
  try {
    await EmailManagementProvider.instance.updateClassification(selectedId.value, payload)
    await Promise.all([fetchDetail(), fetchList()])
  } catch {
    notify("No se pudieron guardar los cambios.", "error")
  } finally {
    saving.value = false
  }
}

async function reopenAndAssignToMe() {
  if (!selectedId.value) return
  actionLoading.value = true
  try {
    await EmailManagementProvider.instance.reopenAndAssignToMe(selectedId.value)
    await Promise.all([fetchDetail(), fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Correo reabierto y asignado.", "success")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo reabrir el correo.", "error")
    await Promise.all([fetchDetail(), fetchList(), fetchCounts(), fetchSessionEmail()])
  } finally {
    actionLoading.value = false
  }
}

async function reassign(userId: string | null) {
  if (!selectedId.value) return
  actionLoading.value = true
  try {
    await EmailManagementProvider.instance.reassign(selectedId.value, userId)
    await Promise.all([fetchDetail(), fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Asignación actualizada.")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo reasignar el correo.", "error")
  } finally {
    actionLoading.value = false
  }
}

async function closeEmail(closeReason?: string | null) {
  if (!selectedId.value) return
  const shouldAutoAdvance = Boolean(mailboxUserSettings.value?.autoAdvanceOnClose && view.value !== "SENT")
  const currentIndex = selectedListIndex.value
  actionLoading.value = true
  try {
    await EmailManagementProvider.instance.close(selectedId.value, {closeReason: closeReason || undefined})
    if (shouldAutoAdvance) {
      autoAdvanceLoading.value = true
      notify("Gestión cerrada. Abriendo el siguiente mail.", "success")
      await Promise.all([fetchList(), fetchCounts(), fetchSessionEmail()])
      const nextEmail = currentIndex >= 0 ? items.value[currentIndex] || null : null
      if (nextEmail) {
        await openEmail(nextEmail)
      } else {
        closeDetail()
        notify("Gestión cerrada. No hay otro mail para abrir.", "success")
      }
      return
    }
    await Promise.all([fetchDetail(), fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Gestión cerrada.", "success")
  } catch (error: any) {
    notify(error?.response?.data?.message || error?.message || "No se pudo cerrar la gestión.", "error")
  } finally {
    autoAdvanceLoading.value = false
    actionLoading.value = false
  }
}

async function startSessionEmail() {
  if (!mailboxId.value || sessionEmailLoading.value) return
  sessionEmailLoading.value = true
  try {
    sessionEmailState.value = await SessionEmailProvider.instance.start(mailboxId.value)
    view.value = "ASSIGNED_IN_ATTENTION"
    page.value = 1
    closeDetail()
    await Promise.all([fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Atención iniciada.", "success")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo iniciar la atención.", "error")
    await fetchSessionEmail()
  } finally {
    sessionEmailLoading.value = false
  }
}

async function pauseSessionEmail() {
  const sessionId = sessionEmailState.value?.session?._id
  if (!sessionId || sessionEmailLoading.value) return
  sessionEmailLoading.value = true
  try {
    sessionEmailState.value = await SessionEmailProvider.instance.pause(sessionId)
    await Promise.all([fetchList(), fetchCounts()])
    notify("Atención pausada.", "info")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo pausar la atención.", "error")
    await fetchSessionEmail()
  } finally {
    sessionEmailLoading.value = false
  }
}

async function resumeSessionEmail() {
  const sessionId = sessionEmailState.value?.session?._id
  if (!sessionId || sessionEmailLoading.value) return
  sessionEmailLoading.value = true
  try {
    sessionEmailState.value = await SessionEmailProvider.instance.resume(sessionId)
    view.value = "ASSIGNED_IN_ATTENTION"
    page.value = 1
    closeDetail()
    await Promise.all([fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Atención reanudada.", "success")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo reanudar la atención.", "error")
    await fetchSessionEmail()
  } finally {
    sessionEmailLoading.value = false
  }
}

function requestCloseSessionEmail() {
  if ((sessionEmailState.value?.currentAssignedCount || 0) > 0) {
    closeSessionEmailDialog.value = true
    return
  }
  void closeSessionEmail()
}

async function closeSessionEmail() {
  const sessionId = sessionEmailState.value?.session?._id
  if (!sessionId || sessionEmailLoading.value) return
  closeSessionEmailDialog.value = false
  sessionEmailLoading.value = true
  try {
    sessionEmailState.value = await SessionEmailProvider.instance.close(sessionId)
    await Promise.all([fetchList(), fetchCounts(), fetchSessionEmail()])
    notify("Atención finalizada.", "success")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo finalizar la atención.", "error")
    await fetchSessionEmail()
  } finally {
    sessionEmailLoading.value = false
  }
}

function clearFilters() {
  search.value = ""
  debouncedSearch.value = ""
  filters.value = {priorities: [], tags: []}
  page.value = 1
  closeDetail()
}

function selectSidebarView(value: EmailManagementView) {
  view.value = value
  page.value = 1
  closeDetail()
  closeOutboundDetail()
  closeCompose()
}

function selectSidebarCategory(value?: string) {
  filters.value = {...filters.value, category: value}
  page.value = 1
  closeDetail()
}

function closeDetail() {
  selectedId.value = null
  detail.value = null
  if (routeInboundEmailId.value) {
    routeInboundEmailId.value = null
    syncRoute()
  }
}

function openOutboundEmail(email: IOutboundEmail) {
  selectedOutboundEmail.value = email
}

function closeOutboundDetail() {
  selectedOutboundEmail.value = null
}

function openCompose() {
  if (!selectedMailbox.value) {
    notify("Seleccioná un mailbox para redactar.", "warning")
    return
  }
  closeDetail()
  closeOutboundDetail()
  composeOpen.value = true
}

function closeCompose() {
  composeOpen.value = false
}

async function openMailboxSettings() {
  if (!mailboxId.value || !selectedMailbox.value) {
    notify("Seleccioná un mailbox para configurar.", "warning")
    return
  }
  mailboxSettingsDialog.value = true
  mailboxUserSettingsLoading.value = true
  try {
    await fetchMailboxUserSettings(true)
  } catch {
    mailboxUserSettings.value = null
    notify("No se pudo cargar la configuración del mailbox.", "error")
  } finally {
    mailboxUserSettingsLoading.value = false
  }
}

async function saveMailboxSettings(payload: {signatureHtml: string; signatureText: string; autoAdvanceOnClose: boolean}) {
  if (!mailboxId.value) return
  mailboxUserSettingsSaving.value = true
  try {
    mailboxUserSettings.value = await MailboxUserSettingProvider.instance.saveCurrent(mailboxId.value, payload)
    mailboxSettingsDialog.value = false
    notify("Configuración guardada.", "success")
  } catch {
    notify("No se pudo guardar la configuración.", "error")
  } finally {
    mailboxUserSettingsSaving.value = false
  }
}

async function onStandaloneEmailSent() {
  closeCompose()
  closeDetail()
  view.value = "SENT"
  page.value = 1
  notify("Correo enviado.", "success")
  await nextTick()
  await fetchList()
}

function keepCompatibleFilters() {
  const mailbox = selectedMailbox.value
  if (!mailbox) return
  const categories = new Set((mailbox.categories || []).map((item) => item.name))
  const priorities = new Set(optionNames(mailbox.priorities))
  const tags = new Set(mailbox.tags || [])
  const operators = new Set(mailboxOperatorIds(mailbox))
  filters.value = {
    ...filters.value,
    category: filters.value.category && categories.has(filters.value.category) ? filters.value.category : undefined,
    priorities: filters.value.priorities.filter((item) => priorities.has(item)),
    tags: filters.value.tags.filter((item) => tags.has(item)),
    assignedTo: filters.value.assignedTo && operators.has(filters.value.assignedTo) ? filters.value.assignedTo : undefined,
  }
}

function canManageMailbox(mailbox?: IMailbox | null) {
  if (!mailbox) return false
  const operators = mailboxOperatorIds(mailbox)
  return Boolean(operators.length && currentUserId.value && operators.includes(currentUserId.value))
}

function mailboxOperatorIds(mailbox: IMailbox) {
  return (mailbox.operators || [])
    .map((operator: any) => typeof operator === "object" ? operator?._id || operator?.id : operator)
    .filter(Boolean)
    .map(String)
}

function syncRoute() {
  const query: Record<string, any> = {
    mailbox: mailboxId.value || undefined,
    view: view.value,
    inboundEmail: routeInboundEmailId.value || undefined,
    category: filters.value.category,
    search: search.value || undefined,
    page: page.value > 1 ? page.value : undefined,
    priority: filters.value.priorities.length ? filters.value.priorities.join(",") : undefined,
    assignedTo: filters.value.assignedTo,
  }
  void router.replace({query})
}

function queryParamToString(value: unknown) {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : null
  return value ? String(value) : null
}

function notify(text: string, color = "info") {
  snackbar.value = {show: true, text, color}
}
</script>

<template>
  <v-container fluid class="pa-0 email-management">
    <div class="email-shell">
      <aside class="email-sidebar border-e">
        <EmailSidebar
          :mailbox-id="mailboxId"
          :mailbox="selectedMailbox"
          :mailboxes="mailboxes"
          :view="view"
          :category="filters.category"
          :counts="counts"
          :session-email-state="sessionEmailState"
          :session-email-loading="sessionEmailLoading"
          :loading-mailboxes="loadingMailboxes"
          @update:mailbox-id="mailboxId = $event"
          @update:view="selectSidebarView"
          @update:category="selectSidebarCategory"
          @compose="openCompose"
          @configure="openMailboxSettings"
          @session-email:start="startSessionEmail"
          @session-email:pause="pauseSessionEmail"
          @session-email:resume="resumeSessionEmail"
          @session-email:close="requestCloseSessionEmail"
        />
      </aside>
      <main class="email-main">
        <EmailToolbar
          :search="search"
          :filters="filters"
          :mailbox="selectedMailbox"
          :page="page"
          :total-pages="totalPages"
          :page-size="pageSize"
          :density="density"
          :loading="loadingList"
          @update:search="search = $event"
          @update:filters="filters = $event; page = 1"
          @update:page="page = $event"
          @update:page-size="pageSize = $event; page = 1"
          @update:density="density = $event"
          @clear="clearFilters"
          @refresh="fetchList"
        />
        <div class="px-3 py-2 text-caption text-medium-emphasis border-b">{{ totalItems }} correos</div>
        <OutboundEmailList
          v-if="view === 'SENT'"
          :items="outboundItems"
          :loading="loadingList"
          :error="listError"
          :density="density"
          :empty-text="emptyText"
          @open="openOutboundEmail"
          @retry="fetchList"
        />
        <EmailList
          v-else
          :items="items"
          :selected-id="selectedId"
          :loading="loadingList"
          :error="listError"
          :density="density"
          :empty-text="emptyText"
          :mailbox="selectedMailbox"
          @open="openEmail"
          @toggle-star="toggleStar"
          @retry="fetchList"
        />
        <Transition name="email-detail-shift" mode="out-in">
          <section
            v-if="selectedId"
            :key="selectedId"
            class="email-detail-overlay"
            :class="{'email-detail-overlay--advancing': autoAdvanceLoading}"
          >
            <v-progress-linear
              v-if="autoAdvanceLoading"
              color="primary"
              indeterminate
              absolute
              location="top"
            />
            <EmailDetail
              :detail="detail"
              :loading="loadingDetail"
              :error="detailError"
              :current-user="currentUser"
              :permissions="detailPermissions"
              :action-loading="actionLoading"
              :saving="saving"
              :signature-html="mailboxUserSettings?.signatureHtml || ''"
              :signature-text="mailboxUserSettings?.signatureText || ''"
              :can-navigate-previous="canNavigatePreviousEmail"
              :can-navigate-next="canNavigateNextEmail"
              :navigation-loading="detailNavigationLoading"
              @back="closeDetail"
              @retry="fetchDetail()"
              @navigate-previous="navigateDetail('previous')"
              @navigate-next="navigateDetail('next')"
              @assign="assignToMe"
              @reopen-and-assign="reopenAndAssignToMe"
              @save-classification="saveClassification"
              @reassign="reassign"
              @close="closeEmail"
              @reply-sent="fetchDetail(); fetchList(); fetchCounts(); fetchSessionEmail()"
            />
          </section>
        </Transition>
        <section v-if="selectedOutboundEmail" class="email-detail-overlay">
          <OutboundEmailDetail
            :email="selectedOutboundEmail"
            @back="closeOutboundDetail"
          />
        </section>
        <section v-if="composeOpen" class="email-compose-overlay">
          <div class="compose-panel border-s">
            <InboundEmailReplyComposer
              mode="new"
              :inbound-email="null"
              :mailbox="selectedMailbox"
              :signature-html="mailboxUserSettings?.signatureHtml || ''"
              :signature-text="mailboxUserSettings?.signatureText || ''"
              @cancel="closeCompose"
              @sent="onStandaloneEmailSent"
            />
          </div>
        </section>
      </main>
    </div>
    <v-dialog v-model="closeSessionEmailDialog" max-width="480">
      <v-card>
        <v-card-title>Finalizar atención</v-card-title>
        <v-card-text>
          Tenés {{ sessionEmailState?.currentAssignedCount || 0 }} casos actualmente asignados.
          Los casos continuarán asignados a vos, pero dejarás de recibir nuevas asignaciones automáticas.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="sessionEmailLoading" @click="closeSessionEmailDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="sessionEmailLoading" @click="closeSessionEmail">Finalizar atención</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <MailboxUserSettingsDialog
      v-model="mailboxSettingsDialog"
      :mailbox="selectedMailbox"
      :settings="mailboxUserSettings"
      :loading="mailboxUserSettingsLoading"
      :saving="mailboxUserSettingsSaving"
      @save="saveMailboxSettings"
    />
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.email-management,
.email-shell {
  height: calc(100vh - 64px);
}
.email-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background: rgb(var(--v-theme-surface));
}
.email-sidebar,
.email-main {
  min-height: 0;
  overflow: hidden;
}
.email-main {
  position: relative;
  display: flex;
  flex-direction: column;
}
.email-detail-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}
.email-detail-overlay--advancing {
  pointer-events: none;
}
.email-detail-shift-enter-active,
.email-detail-shift-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.email-detail-shift-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.email-detail-shift-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.email-compose-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  background: rgba(var(--v-theme-surface), 0.52);
}
.compose-panel {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: rgb(var(--v-theme-surface));
  padding: 16px;
}
@media (max-width: 1260px) {
  .email-shell {
    grid-template-columns: 260px 1fr;
  }
}
@media (max-width: 760px) {
  .email-shell {
    grid-template-columns: 1fr;
  }
  .email-sidebar {
    display: none;
  }
}
</style>
