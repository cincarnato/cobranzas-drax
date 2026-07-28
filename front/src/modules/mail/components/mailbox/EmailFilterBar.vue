<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useUser} from "@drax/identity-vue";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailManagementFilters} from "@/modules/mail/interfaces/IEmailManagement";
import {useMailboxAiOptions} from "@/modules/mail/composables/useMailboxAiOptions";
import EmailSearchInput from "./EmailSearchInput.vue";

const props = defineProps<{
  modelValue: EmailManagementFilters
  mailbox: IMailbox | null
  search: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: EmailManagementFilters): void
  (e: "update:search", value: string): void
  (e: "clear"): void
}>()

const {paginateUser} = useUser()
const {optionNames} = useMailboxAiOptions()
const users = ref<any[]>([])
const userSearch = ref("")

const mailboxOperators = computed(() => props.mailbox?.operators || [])
const selectableUsers = computed(() => {
  if (!props.mailbox) return users.value
  if (!mailboxOperators.value.length) return []
  const search = userSearch.value.trim().toLowerCase()
  if (!search) return mailboxOperators.value
  return mailboxOperators.value.filter((user: any) => userLabel(user).toLowerCase().includes(search))
})
const selectedAssignedUser = computed(() => selectableUsers.value.find((user) => userId(user) === props.modelValue.assignedTo))

const activeChips = computed(() => {
  const chips: Array<{key: string, label: string, value?: string}> = []
  if (props.modelValue.category) chips.push({key: "category", label: `Categoría: ${props.modelValue.category}`})
  props.modelValue.priorities.forEach((value) => chips.push({key: "priority", value, label: `Prioridad: ${value}`}))
  props.modelValue.tags.forEach((value) => chips.push({key: "tag", value, label: `Etiqueta: ${value}`}))
  if (props.modelValue.assignedTo) chips.push({key: "assignedTo", label: `Asignado: ${userLabel(selectedAssignedUser.value) || props.modelValue.assignedTo}`})
  if (props.modelValue.hasAttachments) chips.push({key: "hasAttachments", label: "Con adjuntos"})
  if (props.modelValue.withoutReply) chips.push({key: "withoutReply", label: "Sin respuesta"})
  if (props.modelValue.dateFrom) chips.push({key: "dateFrom", label: `Recibido desde: ${props.modelValue.dateFrom}`})
  if (props.modelValue.dateTo) chips.push({key: "dateTo", label: `Recibido hasta: ${props.modelValue.dateTo}`})
  return chips
})

watch(userSearch, () => void loadUsers())
watch(() => props.mailbox?._id, () => void loadUsers())
onMounted(() => void loadUsers())

function update(partial: Partial<EmailManagementFilters>) {
  emit("update:modelValue", {...props.modelValue, ...partial})
}

function removeChip(chip: {key: string, value?: string}) {
  if (chip.key === "priority") update({priorities: props.modelValue.priorities.filter((item) => item !== chip.value)})
  else if (chip.key === "tag") update({tags: props.modelValue.tags.filter((item) => item !== chip.value)})
  else update({[chip.key]: undefined} as Partial<EmailManagementFilters>)
}

async function loadUsers() {
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
</script>

<template>
  <div class="d-flex flex-column ga-2">
    <v-row dense>
      <v-col cols="12" md="4">
        <EmailSearchInput :model-value="search" :loading="loading" @update:model-value="$emit('update:search', $event)" />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          :model-value="modelValue.category"
          :items="(mailbox?.categories || []).map((item) => item.name)"
          label="Categoría"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          @update:model-value="update({category: $event || undefined})"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          :model-value="modelValue.priorities"
          :items="optionNames(mailbox?.priorities)"
          label="Prioridad"
          density="compact"
          variant="outlined"
          hide-details
          multiple
          clearable
          @update:model-value="update({priorities: $event || []})"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-autocomplete
          :model-value="modelValue.assignedTo"
          v-model:search="userSearch"
          :items="selectableUsers"
          :item-title="userLabel"
          :item-value="userId"
          label="Asignado a"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          @update:model-value="update({assignedTo: $event || undefined})"
        />
      </v-col>
      <v-col cols="6" md="1" class="d-flex align-center">
        <v-checkbox :model-value="modelValue.hasAttachments" label="Adj." density="compact" hide-details @update:model-value="update({hasAttachments: Boolean($event) || undefined})" />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field :model-value="modelValue.dateFrom" type="date" label="Recibido desde" density="compact" variant="outlined" hide-details @update:model-value="update({dateFrom: $event || undefined})" />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field :model-value="modelValue.dateTo" type="date" label="Recibido hasta" density="compact" variant="outlined" hide-details @update:model-value="update({dateTo: $event || undefined})" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          :model-value="modelValue.tags"
          :items="mailbox?.tags || []"
          label="Etiquetas"
          density="compact"
          variant="outlined"
          hide-details
          multiple
          chips
          clearable
          @update:model-value="update({tags: $event || []})"
        />
      </v-col>
      <v-col cols="12" md="3" class="d-flex align-center">
        <v-checkbox :model-value="modelValue.withoutReply" label="Sin respuesta" density="compact" hide-details @update:model-value="update({withoutReply: Boolean($event) || undefined})" />
      </v-col>
      <v-col cols="12" md="1" class="d-flex justify-end align-center">
        <v-btn icon="mdi-filter-remove-outline" variant="text" @click="$emit('clear')" />
      </v-col>
    </v-row>
    <div v-if="activeChips.length" class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="chip in activeChips"
        :key="`${chip.key}-${chip.value || chip.label}`"
        size="small"
        closable
        @click:close="removeChip(chip)"
      >
        {{ chip.label }}
      </v-chip>
    </div>
  </div>
</template>
