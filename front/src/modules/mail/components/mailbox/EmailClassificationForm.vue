<script setup lang="ts">
import {computed} from "vue";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import {useMailboxAiOptions} from "@/modules/mail/composables/useMailboxAiOptions";

const props = defineProps<{
  modelValue: {category?: string | null, closeReason?: string | null, priority?: string | null, sentiment?: string | null}
  mailbox: IMailbox | null
  readonly?: boolean
}>()

const emit = defineEmits<{(e: "update:modelValue", value: any): void}>()
const {optionName} = useMailboxAiOptions()

const priorityItems = computed(() => (props.mailbox?.priorities || [])
  .map((item) => {
    const name = optionName(item)
    if (!name) return null
    return {
      title: name,
      value: name,
      icon: typeof item === "string" ? "" : item.icon || "",
      color: typeof item === "string" ? undefined : item.color || undefined,
    }
  })
  .filter(Boolean))

const sentimentItems = computed(() => (props.mailbox?.sentiments || [])
  .map((item) => {
    const name = optionName(item)
    if (!name) return null
    return {
      title: name,
      value: name,
      emoji: typeof item === "string" ? "" : item.emoji || "",
    }
  })
  .filter(Boolean))

function update(partial: Partial<typeof props.modelValue>) {
  emit("update:modelValue", {...props.modelValue, ...partial})
}
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-select
        :model-value="modelValue.priority"
        :readonly="readonly"
        :items="priorityItems"
        item-title="title"
        item-value="value"
        label="Prioridad"
        density="compact"
        variant="outlined"
        clearable
        @update:model-value="update({priority: $event || null})"
      >
        <template #selection="{item}">
          <div class="d-flex align-center ga-2 min-w-0">
            <v-icon v-if="item.raw?.icon" :icon="item.raw.icon" :color="item.raw.color" size="18" />
            <span class="text-truncate">{{ item.raw?.title }}</span>
          </div>
        </template>
        <template #item="{props: itemProps, item}">
          <v-list-item v-bind="itemProps">
            <template #prepend>
              <v-icon v-if="item.raw?.icon" :icon="item.raw.icon" :color="item.raw.color" size="18" />
            </template>
          </v-list-item>
        </template>
      </v-select>
    </v-col>
    <v-col cols="12">
      <v-select
        :model-value="modelValue.sentiment"
        :readonly="readonly"
        :items="sentimentItems"
        item-title="title"
        item-value="value"
        label="Sentimiento"
        density="compact"
        variant="outlined"
        clearable
        @update:model-value="update({sentiment: $event || null})"
      >
        <template #selection="{item}">
          <div class="d-flex align-center ga-2 min-w-0">
            <span v-if="item.raw?.emoji" class="sentiment-select-emoji">{{ item.raw.emoji }}</span>
            <span class="text-truncate">{{ item.raw?.title }}</span>
          </div>
        </template>
        <template #item="{props: itemProps, item}">
          <v-list-item v-bind="itemProps">
            <template #prepend>
              <span v-if="item.raw?.emoji" class="sentiment-select-emoji">{{ item.raw.emoji }}</span>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </v-col>
    <v-col cols="12" class="py-3">
      <v-divider />
    </v-col>
    <v-col cols="12">
      <v-select :model-value="modelValue.category" :readonly="readonly" :items="(mailbox?.categories || []).map((item) => item.name)" label="Categoría" density="compact" variant="outlined" clearable @update:model-value="update({category: $event || null})" />
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

<style scoped>
.sentiment-select-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  line-height: 1;
}
</style>
