<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import MailReplyProvider, {type MailReplyResult} from "@/modules/mail/providers/MailReplyProvider";

const props = defineProps<{
  modelValue: boolean
  inboundEmail: IInboundEmail | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'sent', value: MailReplyResult): void
}>()

const formValid = ref(false)
const loading = ref(false)
const error = ref("")
const subject = ref("")
const toEmails = ref("")
const ccEmails = ref("")
const bccEmails = ref("")
const bodyText = ref("")
const closeAfterSend = ref(false)

const dialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const canSend = computed(() =>
  Boolean(props.inboundEmail?._id) &&
  Boolean(subject.value.trim()) &&
  Boolean(bodyText.value.trim()) &&
  parseEmails(toEmails.value).length > 0 &&
  !loading.value
)

watch(
  () => [props.modelValue, props.inboundEmail?._id],
  () => {
    if (!props.modelValue || !props.inboundEmail) return
    error.value = ""
    subject.value = resolveSubject(props.inboundEmail.subject)
    toEmails.value = props.inboundEmail.replyToEmail || props.inboundEmail.fromEmail || ""
    ccEmails.value = ""
    bccEmails.value = ""
    bodyText.value = ""
    closeAfterSend.value = false
  },
  {immediate: true}
)

function resolveSubject(value?: string) {
  const normalized = value?.trim() || "Sin asunto"
  return /^re:/i.test(normalized) ? normalized : `Re: ${normalized}`
}

function parseEmails(value: string): string[] {
  return value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean)
}

function asHtml(value: string) {
  return value
    .trim()
    .split("\n")
    .map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<br>")
    .join("")
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

async function sendReply() {
  if (!props.inboundEmail?._id || !canSend.value) return

  loading.value = true
  error.value = ""
  try {
    const result = await MailReplyProvider.instance.sendReply(props.inboundEmail._id, {
      subject: subject.value.trim(),
      bodyText: bodyText.value.trim(),
      bodyHtml: asHtml(bodyText.value),
      toEmails: parseEmails(toEmails.value),
      ccEmails: parseEmails(ccEmails.value),
      bccEmails: parseEmails(bccEmails.value),
      closeAfterSend: closeAfterSend.value,
    })
    emit('sent', result)
    dialog.value = false
  } catch (e: any) {
    error.value = e?.message || "No se pudo enviar la respuesta."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="820" persistent>
    <v-card>
      <v-card-title class="d-flex align-center ga-2 py-3">
        <v-icon icon="mdi-reply-outline" />
        Responder correo
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-form v-model="formValid" @submit.prevent="sendReply">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="toEmails"
                label="Para"
                prepend-inner-icon="mdi-email-outline"
                :rules="[(v: string) => parseEmails(v).length > 0 || 'validation.required']"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="ccEmails"
                label="CC"
                prepend-inner-icon="mdi-email-plus-outline"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="bccEmails"
                label="BCC"
                prepend-inner-icon="mdi-email-lock-outline"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="subject"
                label="Asunto"
                :rules="[(v: string) => !!v?.trim() || 'validation.required']"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="bodyText"
                label="Mensaje"
                :rules="[(v: string) => !!v?.trim() || 'validation.required']"
                auto-grow
                rows="8"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="closeAfterSend"
                label="Cerrar correo luego de enviar"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn
          variant="text"
          :disabled="loading"
          @click="dialog = false"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-send-outline"
          :loading="loading"
          :disabled="!canSend"
          @click="sendReply"
        >
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
