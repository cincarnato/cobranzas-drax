<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useUser} from "@drax/identity-vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailManagementPermissions} from "@/modules/mail/interfaces/IEmailManagement";
import EmailClassificationForm from "./EmailClassificationForm.vue";
import EmailCustomerPanel from "./EmailCustomerPanel.vue";
import ExtractedEntitiesPanel from "./ExtractedEntitiesPanel.vue";
import EmailAssignee from "./EmailAssignee.vue";
import EmailStatusBadge from "./EmailStatusBadge.vue";

const props = defineProps<{
  email: IInboundEmail
  mailbox: IMailbox | null
  permissions: EmailManagementPermissions
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: "save-classification", value: {category?: string | null, priority?: string | null, sentiment?: string | null, tags?: string[]}): void
  (e: "reassign", userId: string | null): void
}>()

const classification = ref({category: props.email.category || null, priority: props.email.priority || null, sentiment: props.email.sentiment || null, tags: props.email.tags || []})
const selectedUser = ref<string | null>(null)
const users = ref<any[]>([])
const userSearch = ref("")
const {paginateUser} = useUser()

watch(() => props.email._id, () => {
  classification.value = {
    category: props.email.category || null,
    priority: props.email.priority || null,
    sentiment: props.email.sentiment || null,
    tags: props.email.tags || [],
  }
  selectedUser.value = typeof props.email.assignedTo === "object" ? props.email.assignedTo?._id : props.email.assignedTo || null
}, {immediate: true})

watch(userSearch, () => void loadUsers())
onMounted(() => void loadUsers())

async function loadUsers() {
  if (!props.permissions.canReassign) return
  const result = await paginateUser({page: 1, limit: 20, search: userSearch.value, orderBy: "username", order: "asc"})
  users.value = result?.items || []
}
</script>

<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <div>
      <div class="text-subtitle-2 mb-2">Gestión</div>
      <div class="d-flex flex-column ga-2">
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

    <v-divider />

    <EmailClassificationForm v-model="classification" :mailbox="mailbox" :readonly="!permissions.canClose && !permissions.canReply" />
    <v-btn color="primary" prepend-icon="mdi-content-save-outline" :loading="saving" @click="emit('save-classification', classification)">
      Guardar cambios
    </v-btn>

    <template v-if="permissions.canReassign">
      <v-divider />
      <v-autocomplete
        v-model="selectedUser"
        v-model:search="userSearch"
        :items="users"
        item-title="username"
        item-value="_id"
        label="Reasignar"
        density="compact"
        variant="outlined"
        clearable
      />
      <v-btn variant="tonal" prepend-icon="mdi-account-switch-outline" @click="emit('reassign', selectedUser)">
        Reasignar
      </v-btn>
    </template>

    <v-divider />
    <EmailCustomerPanel :customer="email.customer" />
    <ExtractedEntitiesPanel :entities="email.extractedEntities" />
  </div>
</template>
