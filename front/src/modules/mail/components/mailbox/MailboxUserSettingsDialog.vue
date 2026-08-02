<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {IMailboxUserSetting} from "@/modules/mail/interfaces/IMailboxUserSetting";
import MailRichTextEditor from "@/modules/mail/components/MailRichTextEditor.vue";

const props = defineProps<{
  modelValue: boolean
  mailbox: IMailbox | null
  settings: IMailboxUserSetting | null
  loading?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "save", value: {signatureHtml: string; signatureText: string}): void
}>()

const {t} = useI18n()
const signatureHtml = ref("")
const signatureText = ref("")

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
})

watch(
  () => [props.modelValue, props.settings?._id, props.settings?.signatureHtml],
  () => {
    if (!props.modelValue) return
    signatureHtml.value = props.settings?.signatureHtml || ""
    signatureText.value = props.settings?.signatureText || ""
  },
  {immediate: true}
)

function save() {
  emit("save", {
    signatureHtml: signatureHtml.value,
    signatureText: signatureText.value,
  })
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="760" persistent>
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-cog-outline" />
        {{ t('mail.settings.title') }}
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="mailbox"
          variant="tonal"
          color="primary"
          density="compact"
          class="mb-4"
        >
          {{ mailbox.name }} - {{ mailbox.email }}
        </v-alert>

        <v-skeleton-loader v-if="loading" type="paragraph, actions" />

        <div v-else>
          <div class="text-subtitle-2 mb-1">
            {{ t('mail.settings.signature') }}
          </div>
          <MailRichTextEditor
            v-model="signatureHtml"
            :label="t('mail.settings.signature')"
            :min-height="180"
            @update:text="signatureText = $event"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="isOpen = false">
          {{ t('mail.settings.close') }}
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline" :loading="saving" :disabled="loading || !mailbox" @click="save">
          {{ t('mail.settings.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
