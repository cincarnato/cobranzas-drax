<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {MediaSystemFactory} from "@drax/media-front";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {IOutboundEmailAttachment} from "@/modules/mail/interfaces/IOutboundEmail";
import MailReplyProvider, {type MailReplyResult, type MailSendResult} from "@/modules/mail/providers/MailReplyProvider";

type EmailField = "to" | "cc" | "bcc"

const props = defineProps<{
  inboundEmail: IInboundEmail | null
  mailbox?: IMailbox | null
  mode?: "reply" | "new"
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
const editorRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const editorTouched = ref(false)
const savedSelection = ref<Range | null>(null)
const selectedFontFamily = ref("Sans Serif")
const selectedFontSize = ref("3")
const selectedTextColor = ref("#202124")
const attachments = ref<IOutboundEmailAttachment[]>([])

const {t} = useI18n()
const mediaSystem = MediaSystemFactory.getInstance()
const composerMode = computed(() => props.mode || "reply")
const isNewEmail = computed(() => composerMode.value === "new")

const fontFamilies = ["Sans Serif", "Serif", "Monospace", "Arial", "Verdana", "Tahoma", "Trebuchet MS", "Georgia"]
const fontSizes = [
  {title: t('mail.reply.format.small'), value: "2"},
  {title: t('mail.reply.format.normal'), value: "3"},
  {title: t('mail.reply.format.large'), value: "5"},
  {title: t('mail.reply.format.huge'), value: "7"},
]
const textColors = [
  "#202124",
  "#5f6368",
  "#d93025",
  "#f29900",
  "#188038",
  "#1967d2",
  "#9334e6",
]
const inlineStyleMarker = "\u200B"
const fontSizeStyles: Record<string, string> = {
  "2": "13px",
  "3": "16px",
  "5": "24px",
  "7": "32px",
}
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
  () => [props.inboundEmail?._id, composerMode.value, props.mailbox?._id],
  () => {
    error.value = ""
    subject.value = isNewEmail.value ? "" : resolveSubject(props.inboundEmail?.subject)
    toEmails.value = isNewEmail.value ? [] : normalizeEmailList([props.inboundEmail?.replyToEmail || props.inboundEmail?.fromEmail || ""])
    ccEmails.value = []
    bccEmails.value = []
    toEmailSearch.value = ""
    ccEmailSearch.value = ""
    bccEmailSearch.value = ""
    bodyHtml.value = ""
    bodyText.value = ""
    attachments.value = []
    attachmentError.value = ""
    editorTouched.value = false
    closeAfterSend.value = false
    closeReason.value = props.inboundEmail?.closeReason || null
    nextTick(() => {
      if (editorRef.value) editorRef.value.innerHTML = ""
    })
  },
  {immediate: true}
)

watch(
  () => props.inboundEmail?.closeReason,
  (value) => {
    closeReason.value = value || null
  }
)

onMounted(() => {
  document.addEventListener("selectionchange", saveEditorSelection)
})

onBeforeUnmount(() => {
  document.removeEventListener("selectionchange", saveEditorSelection)
})

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

function focusEditor() {
  editorRef.value?.focus()
}

defineExpose({
  focusEditor,
})

function saveEditorSelection() {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !editorRef.value) return

  const range = selection.getRangeAt(0)
  const {commonAncestorContainer} = range
  const selectedNode = commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? commonAncestorContainer.parentNode
    : commonAncestorContainer

  if (selectedNode && editorRef.value.contains(selectedNode)) {
    savedSelection.value = range.cloneRange()
  }
}

function restoreEditorSelection() {
  if (!savedSelection.value) return

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(savedSelection.value)
}

function updateBodyFromEditor() {
  if (!editorRef.value) return
  editorTouched.value = true
  bodyHtml.value = sanitizeHtml(editorRef.value.innerHTML)
  bodyText.value = editorRef.value.innerText.replaceAll(inlineStyleMarker, "").trim()
  saveEditorSelection()
}

function applyFormat(command: string, value?: string) {
  focusEditor()
  restoreEditorSelection()
  document.execCommand(command, false, value)
  updateBodyFromEditor()
}

function applyFontFamily(value: string) {
  selectedFontFamily.value = value
  applyInlineStyle("fontName", value, {"font-family": value})
}

function applyFontSize(value: string) {
  selectedFontSize.value = value
  applyInlineStyle("fontSize", value, {"font-size": fontSizeStyles[value] || fontSizeStyles["3"]})
}

function applyTextColor(value: string) {
  selectedTextColor.value = value
  applyInlineStyle("foreColor", value, {color: value})
}

function applyInlineStyle(command: string, value: string, styles: Record<string, string>) {
  focusEditor()
  restoreEditorSelection()

  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (range?.collapsed) {
    insertInlineStyleMarker(range, styles)
    updateBodyFromEditor()
    return
  }

  document.execCommand(command, false, value)
  updateBodyFromEditor()
}

function insertInlineStyleMarker(range: Range, styles: Record<string, string>) {
  const span = document.createElement("span")
  Object.entries(styles).forEach(([property, value]) => {
    span.style.setProperty(property, value)
  })

  const marker = document.createTextNode(inlineStyleMarker)
  span.appendChild(marker)
  range.deleteContents()
  range.insertNode(span)
  range.setStart(marker, marker.length)
  range.collapse(true)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  savedSelection.value = range.cloneRange()
}

function applyQuote() {
  focusEditor()
  restoreEditorSelection()

  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (!range) return

  const quote = findClosestQuote(range)
  if (quote) {
    exitQuote(quote)
    updateBodyFromEditor()
    return
  }

  if (range.collapsed) {
    insertQuoteBlock(range)
  } else {
    wrapSelectionWithQuote(range)
  }

  updateBodyFromEditor()
}

function findClosestQuote(range: Range) {
  const node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer as Element | null
  const quote = node?.closest("blockquote")
  return quote && editorRef.value?.contains(quote) ? quote as HTMLQuoteElement : null
}

function exitQuote(quote: HTMLQuoteElement) {
  const normalLine = document.createElement("div")
  normalLine.appendChild(document.createElement("br"))
  quote.after(normalLine)
  if (isQuoteEmpty(quote)) {
    quote.remove()
  }

  const nextRange = document.createRange()
  nextRange.setStart(normalLine, 0)
  nextRange.collapse(true)
  restoreRange(nextRange)
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.shiftKey) return

  const selection = window.getSelection()
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null
  if (!range?.collapsed) return

  const quote = findClosestQuote(range)
  if (!quote || !isRangeAtQuoteEnd(range, quote)) return

  event.preventDefault()
  exitQuote(quote)
  updateBodyFromEditor()
}

function isRangeAtQuoteEnd(range: Range, quote: HTMLQuoteElement) {
  const afterCursor = document.createRange()
  afterCursor.selectNodeContents(quote)
  afterCursor.setStart(range.endContainer, range.endOffset)
  return !afterCursor.toString().trim()
}

function isQuoteEmpty(quote: HTMLQuoteElement) {
  return !quote.textContent?.replaceAll(inlineStyleMarker, "").trim()
}

function insertQuoteBlock(range: Range) {
  const quote = createQuoteElement()
  quote.appendChild(document.createElement("br"))
  range.deleteContents()
  range.insertNode(quote)

  const nextRange = document.createRange()
  nextRange.setStart(quote, 0)
  nextRange.collapse(true)
  restoreRange(nextRange)
}

function wrapSelectionWithQuote(range: Range) {
  const quote = createQuoteElement()
  quote.appendChild(range.extractContents())
  range.insertNode(quote)

  const nextRange = document.createRange()
  nextRange.selectNodeContents(quote)
  nextRange.collapse(false)
  restoreRange(nextRange)
}

function createQuoteElement() {
  const quote = document.createElement("blockquote")
  quote.style.borderLeft = "4px solid #dadce0"
  quote.style.color = "#5f6368"
  quote.style.margin = "8px 0"
  quote.style.padding = "4px 0 4px 12px"
  return quote
}

function restoreRange(range: Range) {
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  savedSelection.value = range.cloneRange()
}

function insertPlainTextFallback(value: string) {
  applyFormat("insertHTML", escapeHtml(value).replace(/\n/g, "<br>"))
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const html = event.clipboardData?.getData("text/html")
  const text = event.clipboardData?.getData("text/plain") || ""
  if (html) {
    applyFormat("insertHTML", sanitizeHtml(html))
    return
  }
  insertPlainTextFallback(text)
}

function sanitizeHtml(value: string) {
  if (!value.trim()) return ""

  const template = document.createElement("template")
  template.innerHTML = value
  const allowedTags = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "div",
    "em",
    "font",
    "i",
    "li",
    "ol",
    "p",
    "s",
    "span",
    "strike",
    "strong",
    "u",
    "ul",
  ])

  cleanNode(template.content)
  removeInlineStyleMarkers(template.content)
  template.content.querySelectorAll("*").forEach((node) => {
    const element = node as HTMLElement
    if (!allowedTags.has(element.tagName.toLowerCase())) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }

    cleanAttributes(element)
  })

  return template.innerHTML.trim()
}

function cleanNode(node: ParentNode) {
  node.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((element) => element.remove())
}

function removeInlineStyleMarkers(node: ParentNode) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((textNode) => {
    textNode.nodeValue = textNode.nodeValue?.replaceAll(inlineStyleMarker, "") || ""
  })
}

function cleanAttributes(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase()
  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value
    const isAnchorHref = tagName === "a" && name === "href" && /^(https?:|mailto:)/i.test(value)
    const isFontAttribute = tagName === "font" && ["color", "face", "size"].includes(name)
    const isStyle = name === "style"

    if (!isAnchorHref && !isFontAttribute && !isStyle) {
      element.removeAttribute(attribute.name)
    }
  })

  sanitizeStyleAttribute(element)
}

function sanitizeStyleAttribute(element: HTMLElement) {
  const allowedStyles = ["border-left", "border-inline-start", "color", "background-color", "font-family", "font-size", "margin", "padding", "text-align"]
  const nextStyles = allowedStyles
    .map((property) => {
      const value = element.style.getPropertyValue(property)
      return value ? `${property}: ${value}` : ""
    })
    .filter(Boolean)

  if (nextStyles.length) {
    element.setAttribute("style", nextStyles.join("; "))
  } else {
    element.removeAttribute("style")
  }
}

async function sendReply() {
  commitAllPendingEmails()
  if (!canSend.value) return

  updateBodyFromEditor()
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

              <v-sheet border rounded class="mail-editor">
                <div
                  class="d-flex align-center flex-wrap ga-1 pa-2 bg-grey-lighten-5"
                  @mousedown.capture="saveEditorSelection"
                >
                  <v-btn
                    icon="mdi-undo"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.undo')"
                    @click="applyFormat('undo')"
                  />
                  <v-btn
                    icon="mdi-redo"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.redo')"
                    @click="applyFormat('redo')"
                  />

                  <v-divider vertical class="mx-1 align-self-stretch" />

                  <v-select
                    v-model="selectedFontFamily"
                    :items="fontFamilies"
                    density="compact"
                    variant="plain"
                    hide-details
                    class="mail-editor__font"
                    :title="t('mail.reply.format.fontFamily')"
                    @update:model-value="applyFontFamily"
                  />

                  <v-select
                    v-model="selectedFontSize"
                    :items="fontSizes"
                    density="compact"
                    variant="plain"
                    hide-details
                    class="mail-editor__size"
                    :title="t('mail.reply.format.fontSize')"
                    @update:model-value="applyFontSize"
                  />

                  <v-divider vertical class="mx-1 align-self-stretch" />

                  <v-btn
                    icon="mdi-format-bold"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.bold')"
                    @click="applyFormat('bold')"
                  />
                  <v-btn
                    icon="mdi-format-italic"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.italic')"
                    @click="applyFormat('italic')"
                  />
                  <v-btn
                    icon="mdi-format-underline"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.underline')"
                    @click="applyFormat('underline')"
                  />

                  <v-menu :close-on-content-click="false">
                    <template #activator="{props: menuProps}">
                      <v-btn
                        v-bind="menuProps"
                        icon="mdi-format-color-text"
                        variant="text"
                        size="small"
                        :title="t('mail.reply.format.textColor')"
                      />
                    </template>
                    <v-card class="pa-2" width="196">
                      <div class="d-flex flex-wrap ga-1">
                        <v-btn
                          v-for="color in textColors"
                          :key="color"
                          icon
                          size="small"
                          variant="text"
                          :title="color"
                          @click="applyTextColor(color)"
                        >
                          <v-avatar :color="color" size="20" />
                        </v-btn>
                      </div>
                    </v-card>
                  </v-menu>

                  <v-divider vertical class="mx-1 align-self-stretch" />

                  <v-btn
                    icon="mdi-format-align-left"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.alignLeft')"
                    @click="applyFormat('justifyLeft')"
                  />
                  <v-btn
                    icon="mdi-format-align-center"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.alignCenter')"
                    @click="applyFormat('justifyCenter')"
                  />
                  <v-btn
                    icon="mdi-format-align-right"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.alignRight')"
                    @click="applyFormat('justifyRight')"
                  />
                  <v-btn
                    icon="mdi-format-list-numbered"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.numberedList')"
                    @click="applyFormat('insertOrderedList')"
                  />
                  <v-btn
                    icon="mdi-format-list-bulleted"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.bulletedList')"
                    @click="applyFormat('insertUnorderedList')"
                  />
                  <v-btn
                    icon="mdi-format-indent-decrease"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.outdent')"
                    @click="applyFormat('outdent')"
                  />
                  <v-btn
                    icon="mdi-format-indent-increase"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.indent')"
                    @click="applyFormat('indent')"
                  />
                  <v-btn
                    icon="mdi-format-quote-close"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.quote')"
                    @click="applyQuote"
                  />
                  <v-btn
                    icon="mdi-format-strikethrough"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.strikeThrough')"
                    @click="applyFormat('strikeThrough')"
                  />

                  <v-divider vertical class="mx-1 align-self-stretch" />

                  <v-btn
                    icon="mdi-format-clear"
                    variant="text"
                    size="small"
                    :title="t('mail.reply.format.clear')"
                    @click="applyFormat('removeFormat')"
                  />
                </div>

                <v-divider />

                <div
                  ref="editorRef"
                  class="mail-editor__body"
                  contenteditable="true"
                  role="textbox"
                  :aria-label="t('mail.reply.message')"
                  @input="updateBodyFromEditor"
                  @blur="updateBodyFromEditor"
                  @keydown="onEditorKeydown"
                  @paste="onPaste"
                />
              </v-sheet>

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
</style>

<style scoped>
.mail-editor {
  overflow: hidden;
}

.mail-editor__font {
  max-width: 142px;
  min-width: 124px;
}

.mail-editor__size {
  max-width: 96px;
  min-width: 84px;
}

.mail-editor__body {
  min-height: 220px;
  outline: none;
  padding: 16px;
  white-space: normal;
}

.mail-editor__body:focus {
  box-shadow: inset 0 0 0 2px rgb(var(--v-theme-primary));
}

.mail-editor__body:empty::before {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  content: attr(aria-label);
  pointer-events: none;
}

.mail-editor__body :deep(ul),
.mail-editor__body :deep(ol) {
  margin-block: 8px;
  padding-inline-start: 28px;
}

.mail-editor__body :deep(li) {
  padding-inline-start: 4px;
}

.mail-editor__body :deep(blockquote) {
  border-inline-start: 4px solid rgba(var(--v-theme-on-surface), 0.28);
  color: rgba(var(--v-theme-on-surface), 0.72);
  margin: 8px 0;
  padding: 4px 0 4px 12px;
}
</style>
