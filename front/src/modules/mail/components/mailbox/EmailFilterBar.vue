<script setup lang="ts">
import {computed} from "vue";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {EmailManagementFilters} from "@/modules/mail/interfaces/IEmailManagement";

const props = defineProps<{
  modelValue: EmailManagementFilters
  mailbox: IMailbox | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: EmailManagementFilters): void
}>()

const activeChips = computed(() => {
  const chips: Array<{key: string, label: string, value?: string}> = []
  if (props.modelValue.category) chips.push({key: "category", label: `Categoría: ${props.modelValue.category}`})
  props.modelValue.priorities.forEach((value) => chips.push({key: "priority", value, label: `Prioridad: ${value}`}))
  props.modelValue.tags.forEach((value) => chips.push({key: "tag", value, label: `Etiqueta: ${value}`}))
  if (props.modelValue.assignedTo) chips.push({key: "assignedTo", label: `Asignado: ${props.modelValue.assignedTo}`})
  if (props.modelValue.hasAttachments) chips.push({key: "hasAttachments", label: "Con adjuntos"})
  if (props.modelValue.withoutReply) chips.push({key: "withoutReply", label: "Sin respuesta"})
  if (props.modelValue.dateFrom) chips.push({key: "dateFrom", label: `Desde: ${props.modelValue.dateFrom}`})
  if (props.modelValue.dateTo) chips.push({key: "dateTo", label: `Hasta: ${props.modelValue.dateTo}`})
  return chips
})

function update(partial: Partial<EmailManagementFilters>) {
  emit("update:modelValue", {...props.modelValue, ...partial})
}

function removeChip(chip: {key: string, value?: string}) {
  if (chip.key === "priority") update({priorities: props.modelValue.priorities.filter((item) => item !== chip.value)})
  else if (chip.key === "tag") update({tags: props.modelValue.tags.filter((item) => item !== chip.value)})
  else update({[chip.key]: undefined} as Partial<EmailManagementFilters>)
}
</script>

<template>
  <div class="d-flex flex-column ga-2">
    <v-row dense>
      <v-col cols="12" md="3">
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
          :items="mailbox?.priorities || []"
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
        <v-text-field :model-value="modelValue.assignedTo" label="Asignado" density="compact" variant="outlined" hide-details clearable @update:model-value="update({assignedTo: $event || undefined})" />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field :model-value="modelValue.dateFrom" type="date" label="Desde" density="compact" variant="outlined" hide-details @update:model-value="update({dateFrom: $event || undefined})" />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field :model-value="modelValue.dateTo" type="date" label="Hasta" density="compact" variant="outlined" hide-details @update:model-value="update({dateTo: $event || undefined})" />
      </v-col>
      <v-col cols="12" md="1" class="d-flex align-center">
        <v-checkbox :model-value="modelValue.hasAttachments" label="Adj." density="compact" hide-details @update:model-value="update({hasAttachments: Boolean($event) || undefined})" />
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
