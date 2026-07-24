<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAuth, useAuthStore} from "@drax/identity-vue";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {
  EmailDensity,
  EmailManagementDetail,
  EmailManagementFilters,
  EmailManagementListItem,
  EmailManagementView,
} from "@/modules/mail/interfaces/IEmailManagement";
import MailboxProvider from "@/modules/mail/providers/MailboxProvider";
import EmailManagementProvider from "@/modules/mail/providers/EmailManagementProvider";
import EmailSidebar from "@/modules/mail/components/mailbox/EmailSidebar.vue";
import EmailToolbar from "@/modules/mail/components/mailbox/EmailToolbar.vue";
import EmailList from "@/modules/mail/components/mailbox/EmailList.vue";
import EmailDetail from "@/modules/mail/components/mailbox/EmailDetail.vue";

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const authStore = useAuthStore()

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
const listError = ref("")
const detailError = ref("")
const snackbar = ref({show: false, text: "", color: "info"})
let searchTimer: ReturnType<typeof setTimeout> | null = null

const currentUser = computed(() => authStore.authUser)
const currentUserId = computed(() => (currentUser.value as any)?._id || currentUser.value?.id)
const selectedMailbox = computed(() => mailboxes.value.find((item) => item._id === mailboxId.value) || null)
const isSupervisor = computed(() => auth.hasPermission("inboundemail:manage"))
const baseCanUpdate = computed(() => auth.hasPermission("inboundemail:update") || isSupervisor.value)
const detailPermissions = computed(() => {
  const email = detail.value?.inboundEmail
  const assignedTo = typeof email?.assignedTo === "object" ? email?.assignedTo?._id : email?.assignedTo
  const assignedToMe = Boolean(assignedTo && currentUserId.value && String(assignedTo) === String(currentUserId.value))
  const openAndAssigned = email?.attentionStatus !== "CLOSED" && (assignedToMe || isSupervisor.value)
  const canManageDetailMailbox = canManageMailbox(detail.value?.mailbox || selectedMailbox.value)
  return {
    canAssign: baseCanUpdate.value && canManageDetailMailbox,
    canReassign: isSupervisor.value && canManageDetailMailbox,
    canReply: baseCanUpdate.value && canManageDetailMailbox && email?.attentionStatus !== "CLOSED" && Boolean(assignedToMe),
    canClose: baseCanUpdate.value && canManageDetailMailbox && Boolean(openAndAssigned),
    canViewTechnicalDetails: isSupervisor.value,
  }
})
const emptyText = computed(() => {
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
  syncRoute()
  void fetchList()
}, {deep: true})

watch(mailboxId, () => {
  page.value = 1
  selectedId.value = null
  detail.value = null
  keepCompatibleFilters()
  void fetchCounts()
})

onMounted(async () => {
  await fetchMailboxes()
  if (!mailboxId.value && mailboxes.value[0]) mailboxId.value = mailboxes.value[0]._id
  await fetchList()
  await fetchCounts()
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

async function fetchList() {
  if (!mailboxId.value) return
  loadingList.value = true
  listError.value = ""
  try {
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
    listError.value = "No se pudo cargar el listado de correos."
  } finally {
    loadingList.value = false
  }
}

async function fetchCounts() {
  if (!mailboxId.value) return
  const views: EmailManagementView[] = ["PENDING", "ASSIGNED_TO_ME", "ASSIGNED"]
  const nextCounts: Record<string, number> = {}
  await Promise.all(views.map(async (countView) => {
    const result = await EmailManagementProvider.instance.list({
      mailboxId: mailboxId.value || undefined,
      view: countView,
      page: 1,
      pageSize: 1,
      priorities: [],
      tags: [],
    })
    nextCounts[countView] = result.totalItems || 0
  }))
  counts.value = nextCounts
}

async function openEmail(email: EmailManagementListItem) {
  selectedId.value = email._id
  if (!email.userState?.isRead) {
    email.userState = await EmailManagementProvider.instance.updateUserState(email._id, {isRead: true})
  }
  await fetchDetail(email._id)
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
    await Promise.all([fetchDetail(), fetchList(), fetchCounts()])
    notify("Correo asignado.")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo tomar el correo.", "warning")
    await Promise.all([fetchDetail(), fetchList(), fetchCounts()])
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
    notify("Cambios guardados.")
  } catch {
    notify("No se pudieron guardar los cambios.", "error")
  } finally {
    saving.value = false
  }
}

async function reassign(userId: string | null) {
  if (!selectedId.value) return
  actionLoading.value = true
  try {
    await EmailManagementProvider.instance.reassign(selectedId.value, userId)
    await Promise.all([fetchDetail(), fetchList(), fetchCounts()])
    notify("Asignación actualizada.")
  } catch (error: any) {
    notify(error?.response?.data?.message || "No se pudo reasignar el correo.", "error")
  } finally {
    actionLoading.value = false
  }
}

async function closeEmail(closeReason?: string | null) {
  if (!selectedId.value) return
  actionLoading.value = true
  try {
    await EmailManagementProvider.instance.close(selectedId.value, {closeReason: closeReason || undefined})
    await Promise.all([fetchDetail(), fetchList(), fetchCounts()])
    notify("Gestión cerrada.", "success")
  } catch (error: any) {
    notify(error?.response?.data?.message || error?.message || "No se pudo cerrar la gestión.", "error")
  } finally {
    actionLoading.value = false
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
}

function selectSidebarCategory(value?: string) {
  filters.value = {...filters.value, category: value}
  page.value = 1
  closeDetail()
}

function closeDetail() {
  selectedId.value = null
  detail.value = null
}

function keepCompatibleFilters() {
  const mailbox = selectedMailbox.value
  if (!mailbox) return
  const categories = new Set((mailbox.categories || []).map((item) => item.name))
  const priorities = new Set(mailbox.priorities || [])
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
    category: filters.value.category,
    search: search.value || undefined,
    page: page.value > 1 ? page.value : undefined,
    priority: filters.value.priorities.length ? filters.value.priorities.join(",") : undefined,
    assignedTo: filters.value.assignedTo,
  }
  void router.replace({query})
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
          :loading-mailboxes="loadingMailboxes"
          @update:mailbox-id="mailboxId = $event"
          @update:view="selectSidebarView"
          @update:category="selectSidebarCategory"
          @compose="notify('La redacción de correos nuevos queda preparada para una próxima etapa.')"
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
          @refresh="fetchList(); fetchCounts()"
        />
        <div class="px-3 py-2 text-caption text-medium-emphasis border-b">{{ totalItems }} correos</div>
        <EmailList
          :items="items"
          :selected-id="selectedId"
          :loading="loadingList"
          :error="listError"
          :density="density"
          :empty-text="emptyText"
          @open="openEmail"
          @toggle-star="toggleStar"
          @retry="fetchList"
        />
        <section v-if="selectedId" class="email-detail-overlay">
          <EmailDetail
            :detail="detail"
            :loading="loadingDetail"
            :error="detailError"
            :current-user="currentUser"
            :permissions="detailPermissions"
            :action-loading="actionLoading"
            :saving="saving"
            @back="closeDetail"
            @retry="fetchDetail()"
            @assign="assignToMe"
            @save-classification="saveClassification"
            @reassign="reassign"
            @close="closeEmail"
            @reply-sent="fetchDetail(); fetchList(); fetchCounts()"
          />
        </section>
      </main>
    </div>
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
