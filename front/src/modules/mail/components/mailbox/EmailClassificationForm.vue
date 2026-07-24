<script setup lang="ts">
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";

const props = defineProps<{
  modelValue: {category?: string | null, closeReason?: string | null, priority?: string | null}
  mailbox: IMailbox | null
  readonly?: boolean
}>()

const emit = defineEmits<{(e: "update:modelValue", value: any): void}>()

function update(partial: Partial<typeof props.modelValue>) {
  emit("update:modelValue", {...props.modelValue, ...partial})
}
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-select :model-value="modelValue.category" :readonly="readonly" :items="(mailbox?.categories || []).map((item) => item.name)" label="Categoría" density="compact" variant="outlined" clearable @update:model-value="update({category: $event || null})" />
    </v-col>
    <v-col cols="12">
      <v-select :model-value="modelValue.priority" :readonly="readonly" :items="mailbox?.priorities || []" label="Prioridad" density="compact" variant="outlined" clearable @update:model-value="update({priority: $event || null})" />
    </v-col>
    <v-col v-if="mailbox?.closeReasonRequired || mailbox?.closeReasons?.length" cols="12">
      <v-select
        :model-value="modelValue.closeReason"
        :readonly="readonly"
        :items="(mailbox?.closeReasons || []).map((item) => item.name)"
        label="Motivo de cierre"
        density="compact"
        variant="outlined"
        clearable
        @update:model-value="update({closeReason: $event || null})"
      />
    </v-col>
  </v-row>
</template>
