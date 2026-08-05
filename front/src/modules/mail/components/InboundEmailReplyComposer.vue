<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import {MediaSystemFactory} from "@drax/media-front";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {IOutboundEmailAttachment} from "@/modules/mail/interfaces/IOutboundEmail";
import type {ITemplateEmail} from "@/modules/mail/interfaces/ITemplateEmail";
import MailReplyProvider, {type MailReplyResult, type MailSendResult} from "@/modules/mail/providers/MailReplyProvider";
import TemplateEmailProvider from "@/modules/mail/providers/TemplateEmailProvider";
import MailRichTextEditor from "@/modules/mail/components/MailRichTextEditor.vue";

type EmailField = "to" | "cc" | "bcc"

const props = defineProps<{
  inboundEmail: IInboundEmail | null
  mailbox?: IMailbox | null
  mode?: "reply" | "new"
  signatureHtml?: string
  signatureText?: string
}>()

const emit = defineEmits<{
  (e: 'sent', value: MailReplyResult | MailSendResult): void
  (e: 'cancel'): void
}>()

const formValid = ref(false)
const loading = ref(false)
const uploadLoading = ref(false)
const error = ref("")
const attachmentError = ref("")
const subject = ref("")
const toEmails = ref<string[]>([])
const ccEmails = ref<string[]>([])
const bccEmails = ref<string[]>([])
const toEmailSearch = ref("")
const ccEmailSearch = ref("")
const bccEmailSearch = ref("")
const bodyHtml = ref("")
const bodyText = ref("")
const closeAfterSend = ref(false)
const closeReason = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const editorComponentRef = ref<{focusEditor: () => void} | null>(null)
const editorTouched = ref(false)
const attachments = ref<IOutboundEmailAttachment[]>([])
const templateEmails = ref<ITemplateEmail[]>([])
const selectedTemplateEmail = ref<ITemplateEmail | null>(null)
const templateEmailLoading = ref(false)
const templateEmailError = ref("")

const {t} = useI18n()
const auth = useAuth()
const mediaSystem = MediaSystemFactory.getInstance()
const composerMode = computed(() => props.mode || "reply")
const isNewEmail = computed(() => composerMode.value === "new")
const canViewTemplateEmails = computed(() => auth.hasPermission("templateemail:view") || auth.hasPermission("templateemail:manage"))
const showTemplateEmailSelector = computed(() => Boolean(props.mailbox?._id && canViewTemplateEmails.value))

const emailDelimiters = [",", ";", " ", "\n", "\t"]
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const toEmailItems = computed({
  get: () => toEmails.value,
  set: (value: string[]) => {
    toEmails.value = normalizeEmailList(value)
  },
})

const ccEmailItems = computed({
  get: () => ccEmails.value,
  set: (value: string[]) => {
    ccEmails.value = normalizeEmailList(value)
  },
})

const bccEmailItems = computed({
  get: () => bccEmails.value,
  set: (value: string[]) => {
    bccEmails.value = normalizeEmailList(value)
  },
})

const allEmailFieldsValid = computed(() =>
  toEmails.value.every(isValidEmail) &&
  ccEmails.value.every(isValidEmail) &&
  bccEmails.value.every(isValidEmail)
)
const closeReasonOptions = computed(() => (props.mailbox?.closeReasons || []).map((item) => item.name))
const needsCloseReason = computed(() => Boolean(closeAfterSend.value && props.mailbox?.closeReasonRequired))

const canSend = computed(() =>
  Boolean(isNewEmail.value ? props.mailbox?._id : props.inboundEmail?._id) &&
  Boolean(subject.value.trim()) &&
  Boolean(bodyText.value.trim()) &&
  toEmails.value.length > 0 &&
  allEmailFieldsValid.value &&
  (!needsCloseReason.value || Boolean(closeReason.value)) &&
  !loading.value
  && !uploadLoading.value
)

watch(
  () => [props.inboundEmail?._id, composerMode.value, props.mailbox?._id, props.signatureHtml, props.signatureText],
  () => {
    error.value = ""
    subject.value = isNewEmail.value ? "" : resolveSubject(props.inboundEmail?.subject)
    toEmails.value = isNewEmail.value ? [] : normalizeEmailList([props.inboundEmail?.replyToEmail || props.inboundEmail?.fromEmail || ""])
    ccEmails.value = []
    bccEmails.value = []
    toEmailSearch.value = ""
    ccEmailSearch.value = ""
    bccEmailSearch.value = ""
    bodyHtml.value = initialBodyHtml(props.signatureHtml)
    bodyText.value = initialBodyText(props.signatureText)
    selectedTemplateEmail.value = null
    attachments.value = []
    attachmentError.value = ""
    templateEmailError.value = ""
    editorTouched.value = false
    closeAfterSend.value = false
    closeReason.value = props.inboundEmail?.closeReason || null
  },
  {immediate: true}
)

watch(
  () => [props.mailbox?._id, canViewTemplateEmails.value],
  () => {
    selectedTemplateEmail.value = null
    templateEmailError.value = ""
    if (showTemplateEmailSelector.value) {
      void fetchTemplateEmails()
    } else {
      templateEmails.value = []
    }
  },
  {immediate: true}
)

watch(
  () => props.inboundEmail?.closeReason,
  (value) => {
    closeReason.value = value || null
  }
)

function resolveSubject(value?: string) {
  const normalized = value?.trim() || "Sin asunto"
  return /^re:/i.test(normalized) ? normalized : `Re: ${normalized}`
}

function sizeLabel(size?: number) {
  if (!size) return ""
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${Math.ceil(size / 1024)} KB`
}

function openAttachmentPicker() {
  if (loading.value || uploadLoading.value) return
  fileInputRef.value?.click()
}

async function onAttachmentSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ""
  if (!files.length) return

  uploadLoading.value = true
  attachmentError.value = ""
  try {
    for (const file of files) {
      const uploaded = await mediaSystem.uploadFile(file, "mail-outbound-attachments")
      attachments.value.push({
        filename: uploaded.filename,
        filepath: uploaded.filepath,
        size: Number(uploaded.size || 0),
        mimetype: uploaded.mimetype,
        url: uploaded.url,
      })
    }
  } catch (e: any) {
    attachmentError.value = e?.response?.data?.message || e?.data?.message || e?.message || t('mail.reply.attachmentUploadError')
  } finally {
    uploadLoading.value = false
  }
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
}

function parseEmails(value: string): string[] {
  return value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean)
}

function normalizeEmailList(values: string[]) {
  const result: string[] = []
  const seen = new Set<string>()
  values
    .flatMap((value) => parseEmails(String(value)))
    .forEach((email) => {
      const normalized = email.trim()
      const key = normalized.toLowerCase()
      if (!normalized || seen.has(key)) return
      seen.add(key)
      result.push(normalized)
    })

  return result
}

function getEmailList(field: EmailField) {
  if (field === "to") return toEmails.value
  if (field === "cc") return ccEmails.value
  return bccEmails.value
}

function setEmailList(field: EmailField, values: string[]) {
  if (field === "to") {
    toEmails.value = normalizeEmailList(values)
    return
  }
  if (field === "cc") {
    ccEmails.value = normalizeEmailList(values)
    return
  }
  bccEmails.value = normalizeEmailList(values)
}

function getEmailSearch(field: EmailField) {
  if (field === "to") return toEmailSearch.value
  if (field === "cc") return ccEmailSearch.value
  return bccEmailSearch.value
}

function setEmailSearch(field: EmailField, value: string) {
  if (field === "to") {
    toEmailSearch.value = value
    return
  }
  if (field === "cc") {
    ccEmailSearch.value = value
    return
  }
  bccEmailSearch.value = value
}

function updateEmailSearch(field: EmailField, value: string) {
  setEmailSearch(field, value)
  if (/[\s,;]/.test(value)) {
    commitPendingEmails(field)
  }
}

function commitPendingEmails(field: EmailField) {
  const pending = getEmailSearch(field)
  if (!pending.trim()) return
  setEmailList(field, [...getEmailList(field), pending])
  setEmailSearch(field, "")
}

function commitAllPendingEmails() {
  commitPendingEmails("to")
  commitPendingEmails("cc")
  commitPendingEmails("bcc")
}

function isValidEmail(value: string) {
  return emailPattern.test(value.trim())
}

function hasInvalidEmails(values: string[]) {
  return values.some((email) => !isValidEmail(email))
}

function emailFieldRules(required = false) {
  return [
    (value: string[]) => !required || value.length > 0 || t('validation.required'),
    (value: string[]) => !hasInvalidEmails(value) || t('mail.reply.invalidEmails'),
  ]
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function initialBodyHtml(signatureHtml?: string) {
  const signature = signatureHtml?.trim() || ""
  if (!signature) return ""
  return `<div><br></div><div><br></div>${signature}`
}

function initialBodyText(signatureText?: string) {
  const signature = signatureText?.trim() || ""
  if (!signature) return ""
  return `\n\n${signature}`
}

function buildBodyWithTemplate(templateContent: string) {
  const content = templateContent.trim()
  const signature = props.signatureHtml?.trim() || ""
  if (!signature) return content
  return `${content}<div><br></div><div><br></div>${signature}`
}

function htmlToText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function fetchTemplateEmails() {
  if (!props.mailbox?._id || !canViewTemplateEmails.value) {
    templateEmails.value = []
    return
  }
  templateEmailLoading.value = true
  templateEmailError.value = ""
  try {
    const result = await TemplateEmailProvider.instance.paginate({
      page: 1,
      limit: 200,
      orderBy: "name",
      order: "asc",
      filters: [{field: "mailbox", operator: "eq", value: props.mailbox._id}],
    })
    templateEmails.value = result.items || []
  } catch {
    templateEmails.value = []
    templateEmailError.value = t("mail.reply.templateLoadError")
  } finally {
    templateEmailLoading.value = false
  }
}

function applyTemplateEmail(templateEmail: ITemplateEmail | null) {
  if (!templateEmail) return
  bodyHtml.value = buildBodyWithTemplate(templateEmail.content || "")
  bodyText.value = htmlToText(bodyHtml.value)
  editorTouched.value = true
}

function focusEditor() {
  editorComponentRef.value?.focusEditor()
}

defineExpose({
  focusEditor,
})

async function sendReply() {
  commitAllPendingEmails()
  if (!canSend.value) return

  loading.value = true
  error.value = ""
  try {
    const payload = {
      subject: subject.value.trim(),
      bodyText: bodyText.value.trim(),
      bodyHtml: bodyHtml.value || escapeHtml(bodyText.value).replace(/\n/g, "<br>"),
      toEmails: toEmails.value,
      ccEmails: ccEmails.value,
      bccEmails: bccEmails.value,
      attachments: attachments.value,
      closeAfterSend: closeAfterSend.value,
      closeReason: closeAfterSend.value ? closeReason.value || null : null,
    }
    const result = isNewEmail.value
      ? await MailReplyProvider.instance.sendNew({...payload, mailboxId: props.mailbox?._id || ""})
      : await MailReplyProvider.instance.sendReply(props.inboundEmail?._id || "", payload)
    emit('sent', result)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.data?.message || userFriendlyError(e?.message)
  } finally {
    loading.value = false
  }
}

function userFriendlyError(message?: string) {
  if (!message || message === "error.bad_request") return "No se pudo enviar la respuesta. Revisá los datos requeridos."
  return message
}
</script>

<template>
  <v-card class="mail-reply-composer-card" elevation="6">
      <v-card-title class="d-flex align-center ga-2 py-3">
        <v-icon :icon="isNewEmail ? 'mdi-pencil-outline' : 'mdi-reply-outline'" />
        {{ isNewEmail ? t('mail.reply.composeTitle') : t('mail.reply.title') }}
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
              <v-combobox
                v-model="toEmailItems"
                v-model:search="toEmailSearch"
                :label="t('mail.reply.to')"
                prepend-inner-icon="mdi-email-outline"
                :delimiters="emailDelimiters"
                :items="[]"
                :rules="emailFieldRules(true)"
                :hint="t('mail.reply.emailListHint')"
                :error="hasInvalidEmails(toEmails)"
                chips
                closable-chips
                clearable
                hide-no-data
                multiple
                persistent-hint
                density="compact"
                variant="outlined"
                @blur="commitPendingEmails('to')"
                @update:search="updateEmailSearch('to', $event)"
              >
                <template #chip="{props: chipProps, item}">
                  <v-chip
                    v-bind="chipProps"
                    :color="isValidEmail(item.value) ? 'primary' : 'error'"
                    :prepend-icon="isValidEmail(item.value) ? 'mdi-email-outline' : 'mdi-alert-circle-outline'"
                    variant="tonal"
                  >
                    {{ item.value }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox
                v-model="ccEmailItems"
                v-model:search="ccEmailSearch"
                :label="t('mail.reply.cc')"
                prepend-inner-icon="mdi-email-plus-outline"
                :delimiters="emailDelimiters"
                :items="[]"
                :rules="emailFieldRules()"
                :hint="t('mail.reply.emailListHint')"
                :error="hasInvalidEmails(ccEmails)"
                chips
                closable-chips
                clearable
                hide-no-data
                multiple
                persistent-hint
                density="compact"
                variant="outlined"
                @blur="commitPendingEmails('cc')"
                @update:search="updateEmailSearch('cc', $event)"
              >
                <template #chip="{props: chipProps, item}">
                  <v-chip
                    v-bind="chipProps"
                    :color="isValidEmail(item.value) ? 'primary' : 'error'"
                    :prepend-icon="isValidEmail(item.value) ? 'mdi-email-outline' : 'mdi-alert-circle-outline'"
                    variant="tonal"
                  >
                    {{ item.value }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox
                v-model="bccEmailItems"
                v-model:search="bccEmailSearch"
                :label="t('mail.reply.bcc')"
                prepend-inner-icon="mdi-email-lock-outline"
                :delimiters="emailDelimiters"
                :items="[]"
                :rules="emailFieldRules()"
                :hint="t('mail.reply.emailListHint')"
                :error="hasInvalidEmails(bccEmails)"
                chips
                closable-chips
                clearable
                hide-no-data
                multiple
                persistent-hint
                density="compact"
                variant="outlined"
                @blur="commitPendingEmails('bcc')"
                @update:search="updateEmailSearch('bcc', $event)"
              >
                <template #chip="{props: chipProps, item}">
                  <v-chip
                    v-bind="chipProps"
                    :color="isValidEmail(item.value) ? 'primary' : 'error'"
                    :prepend-icon="isValidEmail(item.value) ? 'mdi-email-outline' : 'mdi-alert-circle-outline'"
                    variant="tonal"
                  >
                    {{ item.value }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="subject"
                :label="t('mail.reply.subject')"
                :rules="[(v: string) => !!v?.trim() || 'validation.required']"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-1">
                {{ t('mail.reply.message') }}
              </div>

              <MailRichTextEditor
                ref="editorComponentRef"
                v-model="bodyHtml"
                :label="t('mail.reply.message')"
                @update:text="bodyText = $event"
                @touched="editorTouched = $event"
              />

              <div
                v-if="editorTouched && !bodyText"
                class="text-caption text-error mt-1"
              >
                {{ t('validation.required') }}
              </div>
            </v-col>

            <v-col cols="12">
              <input
                ref="fileInputRef"
                class="d-none"
                type="file"
                multiple
                @change="onAttachmentSelected"
              >
              <div class="d-flex align-center flex-wrap ga-2">
                <v-btn
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-paperclip"
                  :loading="uploadLoading"
                  :disabled="loading"
                  @click="openAttachmentPicker"
                >
                  {{ t('mail.reply.attachFiles') }}
                </v-btn>
                <v-select
                  v-if="showTemplateEmailSelector"
                  v-model="selectedTemplateEmail"
                  :items="templateEmails"
                  :label="t('mail.reply.preparedMessage')"
                  :loading="templateEmailLoading"
                  :no-data-text="t('mail.reply.noPreparedMessages')"
                  item-title="name"
                  return-object
                  clearable
                  hide-details
                  density="compact"
                  variant="outlined"
                  color="deep-purple"
                  base-color="deep-purple"
                  prepend-inner-icon="mdi-email-edit-outline"
                  class="prepared-message-select"
                  @update:model-value="applyTemplateEmail"
                />
                <span v-if="attachments.length" class="text-caption text-medium-emphasis">
                  {{ t('mail.reply.attachmentsCount', {count: attachments.length}) }}
                </span>
              </div>
              <v-alert
                v-if="attachmentError"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                {{ attachmentError }}
              </v-alert>
              <v-alert
                v-if="templateEmailError"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                {{ templateEmailError }}
              </v-alert>
              <div v-if="attachments.length" class="d-flex flex-wrap ga-2 mt-3">
                <v-chip
                  v-for="(attachment, index) in attachments"
                  :key="`${attachment.filename}-${index}`"
                  prepend-icon="mdi-paperclip"
                  closable
                  size="small"
                  variant="tonal"
                  :href="attachment.url"
                  target="_blank"
                  @click:close.prevent="removeAttachment(index)"
                >
                  {{ attachment.filename || t('mail.reply.attachment') }} {{ sizeLabel(attachment.size) }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-checkbox
          v-if="!isNewEmail"
          v-model="closeAfterSend"
          :label="t('mail.reply.closeAfterSend')"
          density="compact"
          hide-details
        />
        <v-select
          v-if="closeAfterSend && (mailbox?.closeReasonRequired || closeReasonOptions.length)"
          v-model="closeReason"
          :items="closeReasonOptions"
          label="Motivo de cierre"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          width="260"
        />
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="emit('cancel')"
        >
          {{ t('mail.reply.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-send-outline"
          :loading="loading"
          :disabled="!canSend"
          @click="sendReply"
        >
          {{ t('mail.reply.send') }}
        </v-btn>
      </v-card-actions>
    </v-card>
</template>

<style scoped>
.mail-reply-composer-card {
  border: 1px solid rgba(var(--v-border-color), 0.18);
  box-shadow: 0 8px 28px rgba(60, 64, 67, 0.18);
}

.prepared-message-select {
  flex: 1 1 260px;
  max-width: 360px;
  min-width: 220px;
}
</style>
