<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useUser} from "@drax/identity-vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailManagementPermissions} from "@/modules/mail/interfaces/IEmailManagement";
import EmailClassificationForm from "./EmailClassificationForm.vue";
import ExtractedEntitiesPanel from "./ExtractedEntitiesPanel.vue";
import EmailAssignee from "./EmailAssignee.vue";
import EmailStatusBadge from "./EmailStatusBadge.vue";
import AssignEmailButton from "./AssignEmailButton.vue";

const props = defineProps<{
  email: IInboundEmail
  mailbox: IMailbox | null
  permissions: EmailManagementPermissions
  saving?: boolean
  actionLoading?: boolean
  closeValidation?: string
  managementUrl?: string
  managementCategoryName?: string
}>()

const emit = defineEmits<{
  (e: "save-classification", value: {category?: string | null, closeReason?: string | null, priority?: string | null, sentiment?: string | null}): void
  (e: "reassign", userId: string | null): void
  (e: "assign"): void
  (e: "reopen-and-assign"): void
  (e: "close-request", closeReason?: string | null): void
  (e: "manage-category"): void
}>()

const classification = ref({
  category: props.email.category || null,
  closeReason: props.email.closeReason || null,
  priority: props.email.priority || null,
  sentiment: props.email.sentiment || null,
})
const classificationFormRef = ref<{focusCloseReason: () => void} | null>(null)
const selectedUser = ref<string | null>(null)
const users = ref<any[]>([])
const userSearch = ref("")
const saveState = ref<"idle" | "saving" | "saved" | "error">("idle")
let saveTimer: ReturnType<typeof setTimeout> | null = null
let suppressAutoSave = false
const {t} = useI18n()
const {paginateUser} = useUser()
const mailboxOperators = computed(() => props.mailbox?.operators || [])
const canEditClassification = computed(() => props.permissions.canClose || props.permissions.canReply)
const selectableUsers = computed(() => {
  if (!props.mailbox) return users.value
  if (!mailboxOperators.value.length) return []
  const search = userSearch.value.trim().toLowerCase()
  if (!search) return mailboxOperators.value
  return mailboxOperators.value.filter((user: any) => userLabel(user).toLowerCase().includes(search))
})
const closeReasonValidation = computed(() => {
  if (!props.mailbox?.closeReasonRequired || classification.value.closeReason) return ""
  return "Este mailbox requiere un motivo de cierre antes de cerrar la gestión."
})
const closeValidationMessage = computed(() => props.closeValidation || closeReasonValidation.value)

watch(() => props.email._id, () => {
  suppressAutoSave = true
  classification.value = {
    category: props.email.category || null,
    closeReason: props.email.closeReason || null,
    priority: props.email.priority || null,
    sentiment: props.email.sentiment || null,
  }
  selectedUser.value = typeof props.email.assignedTo === "object" ? props.email.assignedTo?._id : props.email.assignedTo || null
  saveState.value = "idle"
  if (saveTimer) clearTimeout(saveTimer)
  void Promise.resolve().then(() => {
    suppressAutoSave = false
  })
}, {immediate: true})

watch(classification, (value) => {
  if (suppressAutoSave || !canEditClassification.value) return
  if (sameClassification(value, props.email)) return
  saveState.value = "saving"
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    emit("save-classification", value)
  }, 500)
}, {deep: true})

watch(() => props.saving, (value, previous) => {
  if (previous && !value && saveState.value === "saving") {
    saveState.value = sameClassification(classification.value, props.email) ? "saved" : "error"
  }
})

watch(userSearch, () => void loadUsers())
watch(() => props.mailbox?._id, () => void loadUsers())
onMounted(() => void loadUsers())

async function loadUsers() {
  if (!props.permissions.canReassign) return
  if (props.mailbox) return
  const result = await paginateUser({page: 1, limit: 20, search: userSearch.value, orderBy: "username", order: "asc"})
  users.value = result?.items || []
}

function userLabel(user?: any) {
  if (!user) return ""
  if (typeof user === "string") return user
  return user.name || user.username || user.email || user._id || user.id || ""
}

function userId(user?: any) {
  if (!user) return ""
  return String(typeof user === "object" ? user._id || user.id : user)
}

function sameClassification(value: typeof classification.value, email: IInboundEmail) {
  return (value.category || null) === (email.category || null)
    && (value.closeReason || null) === (email.closeReason || null)
    && (value.priority || null) === (email.priority || null)
    && (value.sentiment || null) === (email.sentiment || null)
}

function requestCloseFromShortcut() {
  if (!props.permissions.canClose) return
  if (closeReasonValidation.value) {
    classificationFormRef.value?.focusCloseReason()
    return
  }
  if (closeValidationMessage.value) return
  emit("close-request", classification.value.closeReason)
}

defineExpose({
  requestCloseFromShortcut
})
</script>

<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <div>
      <div class="text-subtitle-2 mb-2">Gestión</div>
      <div class="d-flex flex-column ga-2">
        <div class="d-flex justify-space-between align-start ga-2">
          <span class="text-body-2 text-medium-emphasis">ID</span>
          <span class="text-caption text-right email-id">{{ email._id }}</span>
        </div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2 text-medium-emphasis">Estado</span>
          <EmailStatusBadge :status="email.attentionStatus" />
        </div>
        <div class="d-flex justify-space-between align-center ga-2">
          <span class="text-body-2 text-medium-emphasis">Asignado</span>
          <EmailAssignee :user="email.assignedTo" />
        </div>
      </div>
    </div>

    <AssignEmailButton
      v-if="permissions.canAssign && email.attentionStatus === 'PENDING' && !email.assignedTo"
      :loading="actionLoading"
      @assign="emit('assign')"
    />
    <v-btn
      v-if="permissions.canReopen && email.attentionStatus === 'CLOSED'"
      color="primary"
      prepend-icon="mdi-email-open-outline"
      :loading="actionLoading"
      @click="emit('reopen-and-assign')"
    >
      Reabrir y tomar
    </v-btn>

    <template v-if="permissions.canReassign">
      <v-divider />
      <v-autocomplete
        v-model="selectedUser"
        v-model:search="userSearch"
        :items="selectableUsers"
        :item-title="userLabel"
        :item-value="userId"
        label="Asignar a usuario"
        density="compact"
        variant="outlined"
        clearable
      />
      <v-btn variant="tonal" prepend-icon="mdi-account-switch-outline" @click="emit('reassign', selectedUser)">
        Asignar
      </v-btn>
    </template>

    <v-divider />

    <EmailClassificationForm ref="classificationFormRef" v-model="classification" :mailbox="mailbox" :readonly="!canEditClassification" />
    <div class="text-caption min-save-state">
      <span v-if="saving || saveState === 'saving'" class="text-medium-emphasis">Guardando cambios...</span>
      <span v-else-if="saveState === 'saved'" class="text-success">Cambios guardados</span>
      <span v-else-if="saveState === 'error'" class="text-error">No se pudieron guardar los cambios</span>
    </div>
    <v-alert v-if="closeValidationMessage" density="compact" variant="tonal" color="warning">
      {{ closeValidationMessage }}
    </v-alert>
    <v-btn
      v-if="managementUrl && managementCategoryName"
      color="primary"
      variant="tonal"
      prepend-icon="mdi-application-import"
      @click="emit('manage-category')"
    >
      {{ t('mailbox.action.manageCategory', {category: managementCategoryName}) }}
    </v-btn>
    <v-btn
      color="success"
      prepend-icon="mdi-check-circle-outline"
      :loading="actionLoading"
      :disabled="!!closeValidationMessage || !permissions.canClose"
      @click="emit('close-request', classification.closeReason)"
    >
      Cerrar gestión
    </v-btn>

    <v-divider />
    <ExtractedEntitiesPanel :entities="email.extractedEntities" :tags="email.tags" />
  </div>
</template>

<style scoped>
.email-id {
  max-width: 220px;
  line-height: 1.25;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
